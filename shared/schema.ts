import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
});

export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  device: text("device").notNull(),
  imei: text("imei").notNull(),
  amount: integer("amount").notNull(),
  status: text("status", { enum: ["pending", "validated", "rejected", "suspended"] }).notNull().default("pending"),
  userEmail: text("user_email").notNull(),
  trackingType: text("tracking_type", { enum: ["standard", "priority", "family", "temporary"] }).notNull().default("standard"),
  lastTrackingUpdate: text("last_tracking_update"),
});

export const geofences = pgTable("geofences", {
  id: serial("id").primaryKey(),
  purchaseId: integer("purchase_id").references(() => purchases.id),
  name: text("name").notNull(),
  centerLat: text("center_lat").notNull(),
  centerLng: text("center_lng").notNull(),
  radius: integer("radius").notNull(), // meters
  isActive: boolean("is_active").notNull().default(true),
});

export const insertGeofenceSchema = createInsertSchema(geofences).omit({
  id: true,
});

export type Geofence = typeof geofences.$inferSelect;
export type InsertGeofence = z.infer<typeof insertGeofenceSchema>;

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  isAdmin: true,
});

export const insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
