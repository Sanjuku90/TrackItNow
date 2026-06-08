import { drizzle } from 'drizzle-orm/node-postgres';
import { users, purchases, geofences, ghostLinks, locationHistory, operationLogs, PURCHASE_STATUS_TRANSITIONS, type User, type InsertUser, type Purchase, type InsertPurchase, type Geofence, type InsertGeofence, type GhostLink, type InsertGhostLink, type LocationHistory, type InsertLocationHistory, type OperationLog } from "@shared/schema";
import * as schema from "@shared/schema";
import { pool } from "./db";
import { and, eq, inArray, lte, desc } from "drizzle-orm";

export type PurchaseStatus = "pending" | "validated" | "rejected" | "suspended" | "expired";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Purchase methods
  getPurchases(): Promise<Purchase[]>;
  getPurchase(id: number): Promise<Purchase | undefined>;
  getPurchasesByUserEmail(email: string): Promise<Purchase[]>;
  getActivePurchaseByImei(imei: string): Promise<Purchase | undefined>;
  countActivePurchasesByEmail(email: string): Promise<number>;
  getPurchaseByImei(imei: string): Promise<Purchase | undefined>;
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  updatePurchaseStatus(id: number, status: string): Promise<Purchase | undefined>;
  transitionPurchaseStatus(
    id: number,
    newStatus: PurchaseStatus,
    actor: { id?: number | null; email?: string | null; isAdmin: boolean; isSystem?: boolean },
    reason?: string
  ): Promise<Purchase>;
  expireDuePurchases(): Promise<number>;
  updatePurchaseLocation(id: number, lat: string, lng: string): Promise<Purchase | undefined>;
  setPresetLocation(id: number, lat: string, lng: string): Promise<Purchase | undefined>;
  clearPresetLocation(id: number): Promise<Purchase | undefined>;
  updateUserPremium(email: string, expiry: string): Promise<User | undefined>;

  // Operation log methods
  addOperationLog(log: Omit<OperationLog, "id">): Promise<OperationLog>;
  getOperationLogs(purchaseId: number): Promise<OperationLog[]>;

  // Geofence methods
  getGeofences(purchaseId: number): Promise<Geofence[]>;
  createGeofence(geofence: InsertGeofence): Promise<Geofence>;
  deleteGeofence(id: number): Promise<boolean>;

  // GhostLink methods
  getGhostLinkByToken(token: string): Promise<GhostLink | undefined>;
  createGhostLink(ghostLink: InsertGhostLink): Promise<GhostLink>;

  // Location History methods
  getLocationHistory(purchaseId: number): Promise<LocationHistory[]>;
  addLocationHistory(entry: InsertLocationHistory): Promise<LocationHistory>;
}

export class DatabaseStorage implements IStorage {
  private db = drizzle(pool, { schema });

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await this.db.insert(users).values(insertUser).returning();
    return user;
  }

  async getPurchases(): Promise<Purchase[]> {
    return await this.db.select().from(purchases);
  }

  async getPurchaseByImei(imei: string): Promise<Purchase | undefined> {
    const [purchase] = await this.db.select().from(purchases).where(eq(purchases.imei, imei));
    return purchase;
  }

  async getPurchase(id: number): Promise<Purchase | undefined> {
    const [purchase] = await this.db.select().from(purchases).where(eq(purchases.id, id));
    return purchase;
  }

  async getPurchasesByUserEmail(email: string): Promise<Purchase[]> {
    return await this.db.select().from(purchases).where(eq(purchases.userEmail, email));
  }

  async getActivePurchaseByImei(imei: string): Promise<Purchase | undefined> {
    const [purchase] = await this.db.select().from(purchases)
      .where(and(eq(purchases.imei, imei), inArray(purchases.status, ["pending", "validated", "suspended"])));
    return purchase;
  }

  async countActivePurchasesByEmail(email: string): Promise<number> {
    const rows = await this.db.select().from(purchases)
      .where(and(eq(purchases.userEmail, email), inArray(purchases.status, ["pending", "validated", "suspended"])));
    return rows.length;
  }

  async createPurchase(insertPurchase: InsertPurchase): Promise<Purchase> {
    const values: any = { ...insertPurchase };
    if (!values.createdAt) values.createdAt = new Date().toISOString();
    const [purchase] = await this.db.insert(purchases).values(values).returning();
    return purchase;
  }

  async updatePurchaseStatus(id: number, status: string): Promise<Purchase | undefined> {
    const [purchase] = await this.db.update(purchases)
      .set({ status: status as any })
      .where(eq(purchases.id, id))
      .returning();
    return purchase;
  }

  async transitionPurchaseStatus(
    id: number,
    newStatus: PurchaseStatus,
    actor: { id?: number | null; email?: string | null; isAdmin: boolean; isSystem?: boolean },
    reason?: string
  ): Promise<Purchase> {
    const existing = await this.getPurchase(id);
    if (!existing) throw new Error("Operation not found");

    const allowed = PURCHASE_STATUS_TRANSITIONS[existing.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Invalid transition: ${existing.status} → ${newStatus}`);
    }

    if (!actor.isAdmin && !actor.isSystem) {
      throw new Error("Only an administrator can change the operation status");
    }

    const [updated] = await this.db.update(purchases)
      .set({ status: newStatus as any })
      .where(eq(purchases.id, id))
      .returning();

    await this.addOperationLog({
      purchaseId: id,
      fromStatus: existing.status,
      toStatus: newStatus,
      actorId: actor.id ?? null,
      actorEmail: actor.isSystem ? "system" : (actor.email ?? null),
      reason: reason ?? null,
      createdAt: new Date().toISOString(),
    });

    return updated;
  }

  async expireDuePurchases(): Promise<number> {
    const now = new Date().toISOString();
    const due = await this.db.select().from(purchases)
      .where(and(
        inArray(purchases.status, ["validated", "suspended"]),
        lte(purchases.premiumExpiry, now),
      ));
    let count = 0;
    for (const p of due) {
      if (!p.premiumExpiry) continue;
      try {
        await this.transitionPurchaseStatus(p.id, "expired", { isAdmin: false, isSystem: true }, "Premium expired");
        count++;
      } catch (err) {
        console.error(`Failed to expire purchase ${p.id}:`, err);
      }
    }
    return count;
  }

  async addOperationLog(log: Omit<OperationLog, "id">): Promise<OperationLog> {
    const [row] = await this.db.insert(operationLogs).values(log as any).returning();
    return row;
  }

  async getOperationLogs(purchaseId: number): Promise<OperationLog[]> {
    return await this.db.select().from(operationLogs)
      .where(eq(operationLogs.purchaseId, purchaseId))
      .orderBy(desc(operationLogs.id));
  }

  async updatePurchaseLocation(id: number, lat: string, lng: string): Promise<Purchase | undefined> {
    const [purchase] = await this.db.update(purchases)
      .set({ lastLat: lat, lastLng: lng })
      .where(eq(purchases.id, id))
      .returning();
    return purchase;
  }

  async setPresetLocation(id: number, lat: string, lng: string): Promise<Purchase | undefined> {
    const [purchase] = await this.db.update(purchases)
      .set({ presetLat: lat, presetLng: lng })
      .where(eq(purchases.id, id))
      .returning();
    return purchase;
  }

  async clearPresetLocation(id: number): Promise<Purchase | undefined> {
    const [purchase] = await this.db.update(purchases)
      .set({ presetLat: null, presetLng: null })
      .where(eq(purchases.id, id))
      .returning();
    return purchase;
  }

  async updateUserPremium(email: string, expiry: string): Promise<User | undefined> {
    const [user] = await this.db.update(users)
      .set({ premiumExpiry: expiry })
      .where(eq(users.email, email))
      .returning();
    return user;
  }

  async getGeofences(purchaseId: number): Promise<Geofence[]> {
    return await this.db.select().from(geofences).where(eq(geofences.purchaseId, purchaseId));
  }

  async createGeofence(insertGeofence: InsertGeofence): Promise<Geofence> {
    const [geofence] = await this.db.insert(geofences).values(insertGeofence).returning();
    return geofence;
  }

  async deleteGeofence(id: number): Promise<boolean> {
    await this.db.delete(geofences).where(eq(geofences.id, id));
    return true;
  }

  async getGhostLinkByToken(token: string): Promise<GhostLink | undefined> {
    const [link] = await this.db.select().from(ghostLinks).where(eq(ghostLinks.token, token));
    return link;
  }

  async createGhostLink(insertGhostLink: InsertGhostLink): Promise<GhostLink> {
    const [link] = await this.db.insert(ghostLinks).values(insertGhostLink).returning();
    return link;
  }

  async getLocationHistory(purchaseId: number): Promise<LocationHistory[]> {
    return await this.db.select()
      .from(locationHistory)
      .where(eq(locationHistory.purchaseId, purchaseId))
      .orderBy(locationHistory.timestamp);
  }

  async addLocationHistory(insertHistory: InsertLocationHistory): Promise<LocationHistory> {
    const [entry] = await this.db.insert(locationHistory).values(insertHistory).returning();
    return entry;
  }
}

export const storage = new DatabaseStorage();
