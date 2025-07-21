var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express3 from "express";

// server/routes.ts
import { createServer } from "http";
import express from "express";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  analytics: () => analytics,
  insertRatingSchema: () => insertRatingSchema,
  insertVendorSchema: () => insertVendorSchema,
  ratings: () => ratings,
  sessions: () => sessions,
  users: () => users,
  vendors: () => vendors
});
import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  businessName: text("business_name").notNull(),
  businessDescription: text("business_description"),
  logoUrl: text("logo_url"),
  address: text("address"),
  whatsappNumber: varchar("whatsapp_number"),
  instagramHandle: varchar("instagram_handle"),
  facebookHandle: varchar("facebook_handle"),
  tiktokHandle: varchar("tiktok_handle"),
  spotifyPlaylistUrl: text("spotify_playlist_url"),
  menuFileUrl: text("menu_file_url"),
  menuLink: text("menu_link"),
  customMessage: text("custom_message"),
  qrCodeUrl: text("qr_code_url"),
  isActive: boolean("is_active").default(true),
  couponTitle: text("coupon_title"),
  couponDescription: text("coupon_description"),
  couponConditions: text("coupon_conditions"),
  couponQuantity: integer("coupon_quantity"),
  couponIcon: text("coupon_icon"),
  backgroundColorStart: text("background_color_start").default("#9333ea"),
  // purple-600
  backgroundColorEnd: text("background_color_end").default("#ec4899"),
  // pink-600
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull().references(() => vendors.id),
  rating: integer("rating").notNull(),
  // 1-5 stars
  comment: text("comment"),
  clientIp: varchar("client_ip").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull().references(() => vendors.id),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  // 'qr_scan', 'whatsapp_click', 'instagram_click', 'facebook_click', 'tiktok_click', 'spotify_click', 'menu_view'
  clientIp: varchar("client_ip", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow()
});
var insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true
}).extend({
  // Make URL fields optional with empty string allowed
  spotifyPlaylistUrl: z.string().url().optional().or(z.literal("")),
  menuLink: z.string().url().optional().or(z.literal("")),
  // Make optional string fields truly optional
  businessDescription: z.string().optional(),
  logoUrl: z.string().optional(),
  address: z.string().optional(),
  whatsappNumber: z.string().optional(),
  instagramHandle: z.string().optional(),
  facebookHandle: z.string().optional(),
  tiktokHandle: z.string().optional(),
  menuFileUrl: z.string().optional(),
  customMessage: z.string().optional(),
  qrCodeUrl: z.string().optional(),
  couponTitle: z.string().optional(),
  couponDescription: z.string().optional(),
  couponConditions: z.string().optional(),
  couponQuantity: z.number().optional(),
  couponIcon: z.string().optional(),
  backgroundColorStart: z.string().optional(),
  backgroundColorEnd: z.string().optional()
});
var insertRatingSchema = createInsertSchema(ratings).omit({
  id: true,
  createdAt: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, and, gte, avg, count } from "drizzle-orm";
var DatabaseStorage = class {
  // User operations - required for Replit Auth
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  // Vendor operations
  async getVendor(id) {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor;
  }
  async getVendorByUserId(userId) {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.userId, userId));
    return vendor;
  }
  async upsertVendor(vendorData) {
    const existingVendor = await this.getVendorByUserId(vendorData.userId);
    if (existingVendor) {
      const [vendor] = await db.update(vendors).set({
        ...vendorData,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(vendors.id, existingVendor.id)).returning();
      return vendor;
    } else {
      const [vendor] = await db.insert(vendors).values(vendorData).returning();
      return vendor;
    }
  }
  async updateVendorQRCode(vendorId, qrCodeUrl) {
    await db.update(vendors).set({
      qrCodeUrl,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(vendors.id, vendorId));
  }
  // Rating operations
  async createRating(ratingData) {
    const [rating] = await db.insert(ratings).values(ratingData).returning();
    return rating;
  }
  async getTodaysRatingByIp(vendorId, clientIp) {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const [rating] = await db.select().from(ratings).where(
      and(
        eq(ratings.vendorId, vendorId),
        eq(ratings.clientIp, clientIp),
        gte(ratings.createdAt, today)
      )
    ).limit(1);
    return rating;
  }
  async getVendorAverageRating(vendorId) {
    const result = await db.select({ avgRating: avg(ratings.rating) }).from(ratings).where(eq(ratings.vendorId, vendorId));
    return Number(result[0]?.avgRating) || 0;
  }
  async getVendorRatingCount(vendorId) {
    const result = await db.select({ count: count() }).from(ratings).where(eq(ratings.vendorId, vendorId));
    return result[0]?.count || 0;
  }
  // Analytics operations
  async createAnalyticsEvent(eventData) {
    const [event] = await db.insert(analytics).values(eventData).returning();
    return event;
  }
  async getVendorAnalytics(vendorId) {
    const [qrScansResult, whatsappResult, instagramResult, facebookResult, tiktokResult, spotifyResult, menuResult] = await Promise.all([
      db.select({ count: count() }).from(analytics).where(and(eq(analytics.vendorId, vendorId), eq(analytics.eventType, "qr_scan"))),
      db.select({ count: count() }).from(analytics).where(and(eq(analytics.vendorId, vendorId), eq(analytics.eventType, "whatsapp_click"))),
      db.select({ count: count() }).from(analytics).where(and(eq(analytics.vendorId, vendorId), eq(analytics.eventType, "instagram_click"))),
      db.select({ count: count() }).from(analytics).where(and(eq(analytics.vendorId, vendorId), eq(analytics.eventType, "facebook_click"))),
      db.select({ count: count() }).from(analytics).where(and(eq(analytics.vendorId, vendorId), eq(analytics.eventType, "tiktok_click"))),
      db.select({ count: count() }).from(analytics).where(and(eq(analytics.vendorId, vendorId), eq(analytics.eventType, "spotify_click"))),
      db.select({ count: count() }).from(analytics).where(and(eq(analytics.vendorId, vendorId), eq(analytics.eventType, "menu_view")))
    ]);
    return {
      qrScans: qrScansResult[0]?.count || 0,
      whatsappClicks: whatsappResult[0]?.count || 0,
      instagramClicks: instagramResult[0]?.count || 0,
      facebookClicks: facebookResult[0]?.count || 0,
      tiktokClicks: tiktokResult[0]?.count || 0,
      spotifyClicks: spotifyResult[0]?.count || 0,
      menuViews: menuResult[0]?.count || 0
    };
  }
};
var storage = new DatabaseStorage();

// server/replitAuth.ts
import * as client from "openid-client";
import { Strategy } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}
var getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID
    );
  },
  { maxAge: 3600 * 1e3 }
);
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl
    }
  });
}
function updateUserSession(user, tokens) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}
async function upsertUser(claims) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"]
  });
}
async function setupAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
  app2.use(passport.initialize());
  app2.use(passport.session());
  const config = await getOidcConfig();
  const verify = async (tokens, verified) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };
  for (const domain of process.env.REPLIT_DOMAINS.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`
      },
      verify
    );
    passport.use(strategy);
  }
  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((user, cb) => cb(null, user));
  app2.get("/api/login", (req, res, next) => {
    console.log(`[AUTH] Login attempt from ${req.hostname}`);
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"]
    })(req, res, next);
  });
  app2.get("/api/callback", (req, res, next) => {
    console.log(`[AUTH] Callback from ${req.hostname}`);
    passport.authenticate(`replitauth:${req.hostname}`, {
      successRedirect: "/",
      failureRedirect: "/login"
    })(req, res, next);
  });
  app2.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`
        }).href
      );
    });
  });
}
var isAuthenticated = async (req, res, next) => {
  const user = req.user;
  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const now = Math.floor(Date.now() / 1e3);
  if (now <= user.expires_at) {
    return next();
  }
  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

// server/routes.ts
import multer from "multer";
import path from "path";
import QRCode from "qrcode";
import { z as z2 } from "zod";
var upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 5 * 1024 * 1024
    // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only images (JPEG, PNG, GIF) and PDF files are allowed!"));
    }
  }
});
async function registerRoutes(app2) {
  await setupAuth(app2);
  app2.use("/uploads", express.static("uploads"));
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.get("/api/vendor/config", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const vendor = await storage.getVendorByUserId(userId);
      res.json(vendor);
    } catch (error) {
      console.error("Error fetching vendor config:", error);
      res.status(500).json({ message: "Failed to fetch vendor configuration" });
    }
  });
  app2.post("/api/vendor/config", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertVendorSchema.parse(req.body);
      const vendor = await storage.upsertVendor({
        ...validatedData,
        userId
      });
      res.json(vendor);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error saving vendor config:", error);
      res.status(500).json({ message: "Failed to save vendor configuration" });
    }
  });
  app2.post("/api/upload/logo", isAuthenticated, upload.single("logo"), async (req, res) => {
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
  app2.post("/api/upload/menu", isAuthenticated, upload.single("menu"), async (req, res) => {
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
  app2.post("/api/vendor/generate-qr", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const vendor = await storage.getVendorByUserId(userId);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor configuration not found" });
      }
      const domains = process.env.REPLIT_DOMAINS?.split(",") || [req.hostname];
      const domain = domains[0];
      const clientUrl = `https://${domain}/client/${vendor.id}`;
      const qrCodeDataUrl = await QRCode.toDataURL(clientUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: "#4338ca",
          // Escanix brand color
          light: "#ffffff"
        }
      });
      await storage.updateVendorQRCode(vendor.id, qrCodeDataUrl);
      res.json({ qrCode: qrCodeDataUrl, url: clientUrl });
    } catch (error) {
      console.error("Error generating QR code:", error);
      res.status(500).json({ message: "Failed to generate QR code" });
    }
  });
  app2.get("/api/client/:vendorId", async (req, res) => {
    try {
      const vendorId = parseInt(req.params.vendorId);
      if (isNaN(vendorId)) {
        return res.status(400).json({ message: "Invalid vendor ID" });
      }
      const vendor = await storage.getVendor(vendorId);
      if (!vendor || !vendor.isActive) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      const clientIp = req.ip || req.connection.remoteAddress || "unknown";
      const userAgent = req.get("User-Agent") || "";
      await storage.createAnalyticsEvent({
        vendorId,
        eventType: "qr_scan",
        clientIp,
        userAgent
      });
      const avgRating = await storage.getVendorAverageRating(vendorId);
      const ratingCount = await storage.getVendorRatingCount(vendorId);
      res.json({
        ...vendor,
        averageRating: avgRating,
        ratingCount
      });
    } catch (error) {
      console.error("Error fetching client data:", error);
      res.status(500).json({ message: "Failed to fetch vendor data" });
    }
  });
  app2.post("/api/client/:vendorId/rate", async (req, res) => {
    try {
      const vendorId = parseInt(req.params.vendorId);
      if (isNaN(vendorId)) {
        return res.status(400).json({ message: "Invalid vendor ID" });
      }
      const clientIp = req.ip || req.connection.remoteAddress || "unknown";
      const validatedData = insertRatingSchema.parse({
        ...req.body,
        vendorId,
        clientIp
      });
      const existingRating = await storage.getTodaysRatingByIp(vendorId, clientIp);
      if (existingRating) {
        return res.status(400).json({ message: "You can only rate once per day" });
      }
      const rating = await storage.createRating(validatedData);
      res.json(rating);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid rating data", errors: error.errors });
      }
      console.error("Error creating rating:", error);
      res.status(500).json({ message: "Failed to submit rating" });
    }
  });
  app2.get("/api/vendor/analytics", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const vendor = await storage.getVendorByUserId(userId);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor configuration not found" });
      }
      const analytics2 = await storage.getVendorAnalytics(vendor.id);
      const averageRating = await storage.getVendorAverageRating(vendor.id);
      res.json({
        ...analytics2,
        averageRating: Number(averageRating.toFixed(1))
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });
  app2.post("/api/client/:vendorId/track", async (req, res) => {
    try {
      const vendorId = parseInt(req.params.vendorId);
      const { eventType } = req.body;
      if (isNaN(vendorId) || !eventType) {
        return res.status(400).json({ message: "Invalid data" });
      }
      const clientIp = req.ip || req.connection.remoteAddress || "unknown";
      const userAgent = req.get("User-Agent") || "";
      await storage.createAnalyticsEvent({
        vendorId,
        eventType,
        clientIp,
        userAgent
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking event:", error);
      res.status(500).json({ message: "Failed to track event" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
