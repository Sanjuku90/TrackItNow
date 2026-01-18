import { drizzle } from 'drizzle-orm/node-postgres';
import { users, purchases, geofences, ghostLinks, locationHistory, type User, type InsertUser, type Purchase, type InsertPurchase, type Geofence, type InsertGeofence, type GhostLink, type InsertGhostLink, type LocationHistory, type InsertLocationHistory } from "@shared/schema";
import * as schema from "@shared/schema";
import { pool } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Purchase methods
  getPurchases(): Promise<Purchase[]>;
  getPurchaseByImei(imei: string): Promise<Purchase | undefined>;
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  updatePurchaseStatus(id: number, status: string): Promise<Purchase | undefined>;
  updatePurchaseLocation(id: number, lat: string, lng: string): Promise<Purchase | undefined>;
  updateUserPremium(email: string, expiry: string): Promise<User | undefined>;

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

  async createPurchase(insertPurchase: InsertPurchase): Promise<Purchase> {
    const [purchase] = await this.db.insert(purchases).values(insertPurchase).returning();
    return purchase;
  }

  async updatePurchaseStatus(id: number, status: string): Promise<Purchase | undefined> {
    const [purchase] = await this.db.update(purchases)
      .set({ status: status as any })
      .where(eq(purchases.id, id))
      .returning();
    return purchase;
  }

  async updatePurchaseLocation(id: number, lat: string, lng: string): Promise<Purchase | undefined> {
    const [purchase] = await this.db.update(purchases)
      .set({ lastLat: lat, lastLng: lng })
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
