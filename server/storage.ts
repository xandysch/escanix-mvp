import { 
  users, 
  vendors, 
  ratings,
  type User, 
  type UpsertUser, 
  type Vendor,
  type InsertVendor,
  type Rating,
  type InsertRating 
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, desc, avg, count } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations - required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Vendor operations
  getVendor(id: number): Promise<Vendor | undefined>;
  getVendorByUserId(userId: string): Promise<Vendor | undefined>;
  upsertVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendorQRCode(vendorId: number, qrCodeUrl: string): Promise<void>;
  
  // Rating operations
  createRating(rating: InsertRating): Promise<Rating>;
  getTodaysRatingByIp(vendorId: number, clientIp: string): Promise<Rating | undefined>;
  getVendorAverageRating(vendorId: number): Promise<number>;
  getVendorRatingCount(vendorId: number): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // User operations - required for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Vendor operations
  async getVendor(id: number): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor;
  }

  async getVendorByUserId(userId: string): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.userId, userId));
    return vendor;
  }

  async upsertVendor(vendorData: InsertVendor): Promise<Vendor> {
    // First try to find existing vendor by userId
    const existingVendor = await this.getVendorByUserId(vendorData.userId);
    
    if (existingVendor) {
      // Update existing vendor
      const [vendor] = await db
        .update(vendors)
        .set({
          ...vendorData,
          updatedAt: new Date(),
        })
        .where(eq(vendors.id, existingVendor.id))
        .returning();
      return vendor;
    } else {
      // Create new vendor
      const [vendor] = await db
        .insert(vendors)
        .values(vendorData)
        .returning();
      return vendor;
    }
  }

  async updateVendorQRCode(vendorId: number, qrCodeUrl: string): Promise<void> {
    await db
      .update(vendors)
      .set({ 
        qrCodeUrl,
        updatedAt: new Date(),
      })
      .where(eq(vendors.id, vendorId));
  }

  // Rating operations
  async createRating(ratingData: InsertRating): Promise<Rating> {
    const [rating] = await db
      .insert(ratings)
      .values(ratingData)
      .returning();
    return rating;
  }

  async getTodaysRatingByIp(vendorId: number, clientIp: string): Promise<Rating | undefined> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [rating] = await db
      .select()
      .from(ratings)
      .where(
        and(
          eq(ratings.vendorId, vendorId),
          eq(ratings.clientIp, clientIp),
          gte(ratings.createdAt, today)
        )
      )
      .limit(1);
    
    return rating;
  }

  async getVendorAverageRating(vendorId: number): Promise<number> {
    const result = await db
      .select({ avgRating: avg(ratings.rating) })
      .from(ratings)
      .where(eq(ratings.vendorId, vendorId));
    
    return Number(result[0]?.avgRating) || 0;
  }

  async getVendorRatingCount(vendorId: number): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(ratings)
      .where(eq(ratings.vendorId, vendorId));
    
    return result[0]?.count || 0;
  }
}

export const storage = new DatabaseStorage();