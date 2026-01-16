import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
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
  trackingType: text("tracking_type", { enum: ["standard", "priority"] }).notNull().default("standard"),
  lastTrackingUpdate: text("last_tracking_update"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
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
