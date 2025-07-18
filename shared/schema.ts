import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Vendor business configurations
export const vendors = pgTable("vendors", {
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
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ratings for vendors
export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull().references(() => vendors.id),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  clientIp: varchar("client_ip").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Analytics table for tracking vendor page interactions
export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull().references(() => vendors.id),
  eventType: varchar("event_type", { length: 50 }).notNull(), // 'qr_scan', 'whatsapp_click', 'instagram_click', 'facebook_click', 'tiktok_click', 'spotify_click', 'menu_view'
  clientIp: varchar("client_ip", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertVendor = typeof vendors.$inferInsert;
export type Vendor = typeof vendors.$inferSelect;

export type InsertRating = typeof ratings.$inferInsert;
export type Rating = typeof ratings.$inferSelect;

export type InsertAnalytics = typeof analytics.$inferInsert;
export type Analytics = typeof analytics.$inferSelect;

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRatingSchema = createInsertSchema(ratings).omit({
  id: true,
  createdAt: true,
});
