import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  premiumExpiry: text("premium_expiry"),
});

export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  device: text("device").notNull(),
  imei: text("imei").notNull(),
  amount: integer("amount").notNull(),
  status: text("status", { enum: ["pending", "validated", "rejected", "suspended", "expired"] }).notNull().default("pending"),
  userEmail: text("user_email").notNull(),
  trackingType: text("tracking_type", { enum: ["standard", "priority"] }).notNull().default("standard"),
  lastTrackingUpdate: text("last_tracking_update"),
  lastLat: text("last_lat"),
  lastLng: text("last_lng"),
  presetLat: text("preset_lat"),
  presetLng: text("preset_lng"),
  premiumExpiry: text("premium_expiry"),
  createdAt: text("created_at").notNull().default("1970-01-01T00:00:00.000Z"),
});

export const operationLogs = pgTable("operation_logs", {
  id: serial("id").primaryKey(),
  purchaseId: integer("purchase_id").references(() => purchases.id).notNull(),
  fromStatus: text("from_status").notNull(),
  toStatus: text("to_status").notNull(),
  actorId: integer("actor_id").references(() => users.id),
  actorEmail: text("actor_email"),
  reason: text("reason"),
  createdAt: text("created_at").notNull(),
});

export const insertOperationLogSchema = createInsertSchema(operationLogs).omit({
  id: true,
});
export type OperationLog = typeof operationLogs.$inferSelect;
export type InsertOperationLog = z.infer<typeof insertOperationLogSchema>;

export const PURCHASE_STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ["validated", "rejected"],
  validated: ["suspended", "expired"],
  suspended: ["validated", "expired"],
  rejected: [],
  expired: [],
};

export const geofences = pgTable("geofences", {
  id: serial("id").primaryKey(),
  purchaseId: integer("purchase_id").references(() => purchases.id),
  name: text("name").notNull(),
  centerLat: text("center_lat").notNull(),
  centerLng: text("center_lng").notNull(),
  radius: integer("radius").notNull(), // meters
  isActive: boolean("is_active").notNull().default(true),
});

export const locationHistory = pgTable("location_history", {
  id: serial("id").primaryKey(),
  purchaseId: integer("purchase_id").references(() => purchases.id).notNull(),
  lat: text("lat").notNull(),
  lng: text("lng").notNull(),
  timestamp: text("timestamp").notNull(),
});

export const ghostLinks = pgTable("ghost_links", {
  id: serial("id").primaryKey(),
  purchaseId: integer("purchase_id").references(() => purchases.id),
  token: text("token").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  isViewed: boolean("is_viewed").notNull().default(false),
});

export const insertGeofenceSchema = createInsertSchema(geofences).omit({
  id: true,
});

export const insertGhostLinkSchema = createInsertSchema(ghostLinks).omit({
  id: true,
});

export const insertLocationHistorySchema = createInsertSchema(locationHistory).omit({
  id: true,
});

export type Geofence = typeof geofences.$inferSelect;
export type InsertGeofence = z.infer<typeof insertGeofenceSchema>;
export type GhostLink = typeof ghostLinks.$inferSelect;
export type InsertGhostLink = z.infer<typeof insertGhostLinkSchema>;
export type LocationHistory = typeof locationHistory.$inferSelect;
export type InsertLocationHistory = z.infer<typeof insertLocationHistorySchema>;

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
