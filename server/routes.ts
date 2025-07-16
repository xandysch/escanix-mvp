import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertVendorSchema, insertRatingSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import QRCode from "qrcode";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    // Allow images and PDFs
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (JPEG, PNG, GIF) and PDF files are allowed!'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Vendor routes
  app.get("/api/vendor/config", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const vendor = await storage.getVendorByUserId(userId);
      res.json(vendor);
    } catch (error) {
      console.error("Error fetching vendor config:", error);
      res.status(500).json({ message: "Failed to fetch vendor configuration" });
    }
  });

  app.post("/api/vendor/config", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertVendorSchema.parse(req.body);
      
      const vendor = await storage.upsertVendor({
        ...validatedData,
        userId,
      });
      
      res.json(vendor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error saving vendor config:", error);
      res.status(500).json({ message: "Failed to save vendor configuration" });
    }
  });

  // File upload routes
  app.post("/api/upload/logo", isAuthenticated, upload.single('logo'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ url: fileUrl });
    } catch (error) {
      console.error("Error uploading logo:", error);
      res.status(500).json({ message: "Failed to upload logo" });
    }
  });

  app.post("/api/upload/menu", isAuthenticated, upload.single('menu'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ url: fileUrl });
    } catch (error) {
      console.error("Error uploading menu:", error);
      res.status(500).json({ message: "Failed to upload menu" });
    }
  });

  // QR Code generation
  app.post("/api/vendor/generate-qr", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const vendor = await storage.getVendorByUserId(userId);
      
      if (!vendor) {
        return res.status(404).json({ message: "Vendor configuration not found" });
      }

      // Get domain from environment variable or use request hostname
      const domains = process.env.REPLIT_DOMAINS?.split(',') || [req.hostname];
      const domain = domains[0];
      const clientUrl = `https://${domain}/client/${vendor.id}`;
      
      const qrCodeDataUrl = await QRCode.toDataURL(clientUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#4338ca', // Escanix brand color
          light: '#ffffff'
        }
      });
      
      // Update vendor with QR code URL (in a real app, you'd save this to file storage)
      await storage.updateVendorQRCode(vendor.id, qrCodeDataUrl);
      
      res.json({ qrCode: qrCodeDataUrl, url: clientUrl });
    } catch (error) {
      console.error("Error generating QR code:", error);
      res.status(500).json({ message: "Failed to generate QR code" });
    }
  });

  // Public client page data (no auth required)
  app.get("/api/client/:vendorId", async (req, res) => {
    try {
      const vendorId = parseInt(req.params.vendorId);
      if (isNaN(vendorId)) {
        return res.status(400).json({ message: "Invalid vendor ID" });
      }

      const vendor = await storage.getVendor(vendorId);
      if (!vendor || !vendor.isActive) {
        return res.status(404).json({ message: "Vendor not found" });
      }

      // Track QR scan analytics
      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || '';
      
      await storage.createAnalyticsEvent({
        vendorId,
        eventType: 'qr_scan',
        clientIp,
        userAgent,
      });

      // Get average rating
      const avgRating = await storage.getVendorAverageRating(vendorId);
      const ratingCount = await storage.getVendorRatingCount(vendorId);

      res.json({
        ...vendor,
        averageRating: avgRating,
        ratingCount: ratingCount,
      });
    } catch (error) {
      console.error("Error fetching client data:", error);
      res.status(500).json({ message: "Failed to fetch vendor data" });
    }
  });

  // Rating submission (no auth required)
  app.post("/api/client/:vendorId/rate", async (req, res) => {
    try {
      const vendorId = parseInt(req.params.vendorId);
      if (isNaN(vendorId)) {
        return res.status(400).json({ message: "Invalid vendor ID" });
      }

      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
      const validatedData = insertRatingSchema.parse({
        ...req.body,
        vendorId,
        clientIp,
      });

      // Check if this IP has already rated this vendor today
      const existingRating = await storage.getTodaysRatingByIp(vendorId, clientIp);
      if (existingRating) {
        return res.status(400).json({ message: "You can only rate once per day" });
      }

      const rating = await storage.createRating(validatedData);
      res.json(rating);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid rating data", errors: error.errors });
      }
      console.error("Error creating rating:", error);
      res.status(500).json({ message: "Failed to submit rating" });
    }
  });

  // Analytics endpoints
  app.get("/api/vendor/analytics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const vendor = await storage.getVendorByUserId(userId);
      
      if (!vendor) {
        return res.status(404).json({ message: "Vendor configuration not found" });
      }

      const analytics = await storage.getVendorAnalytics(vendor.id);
      const averageRating = await storage.getVendorAverageRating(vendor.id);
      
      res.json({
        ...analytics,
        averageRating: Number(averageRating.toFixed(1)),
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Track interaction events
  app.post("/api/client/:vendorId/track", async (req, res) => {
    try {
      const vendorId = parseInt(req.params.vendorId);
      const { eventType } = req.body;
      
      if (isNaN(vendorId) || !eventType) {
        return res.status(400).json({ message: "Invalid data" });
      }

      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || '';
      
      await storage.createAnalyticsEvent({
        vendorId,
        eventType,
        clientIp,
        userAgent,
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking event:", error);
      res.status(500).json({ message: "Failed to track event" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
