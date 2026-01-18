import { users, purchases, geofences, type User, type InsertUser, type Purchase, type InsertPurchase, type Geofence, type InsertGeofence } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Purchase methods
  getPurchases(): Promise<Purchase[]>;
  getPurchaseByImei(imei: string): Promise<Purchase | undefined>;
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  updatePurchaseStatus(id: number, status: string): Promise<Purchase | undefined>;

  // Geofence methods
  getGeofences(purchaseId: number): Promise<Geofence[]>;
  createGeofence(geofence: InsertGeofence): Promise<Geofence>;
  deleteGeofence(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private purchases: Map<number, Purchase>;
  private geofences: Map<number, Geofence>;
  currentUserId: number;
  currentPurchaseId: number;
  currentGeofenceId: number;

  constructor() {
    this.users = new Map();
    this.purchases = new Map();
    this.geofences = new Map();
    this.currentUserId = 1;
    this.currentPurchaseId = 1;
    this.currentGeofenceId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, isAdmin: insertUser.isAdmin ?? false };
    this.users.set(id, user);
    return user;
  }

  async getPurchases(): Promise<Purchase[]> {
    return Array.from(this.purchases.values());
  }

  async getPurchaseByImei(imei: string): Promise<Purchase | undefined> {
    return Array.from(this.purchases.values()).find(p => p.imei === imei);
  }

  async createPurchase(insertPurchase: InsertPurchase): Promise<Purchase> {
    const id = this.currentPurchaseId++;
    const purchase: Purchase = { 
      ...insertPurchase, 
      id, 
      status: insertPurchase.status ?? "pending",
      userId: insertPurchase.userId ?? null,
      trackingType: insertPurchase.trackingType ?? "standard",
      lastTrackingUpdate: null
    };
    this.purchases.set(id, purchase);
    return purchase;
  }

  async updatePurchaseStatus(id: number, status: string): Promise<Purchase | undefined> {
    const purchase = Array.from(this.purchases.values()).find(p => p.id === id);
    if (!purchase) return undefined;
    
    const updatedPurchase = { ...purchase, status: status as any };
    this.purchases.set(id, updatedPurchase);
    return updatedPurchase;
  }

  async getGeofences(purchaseId: number): Promise<Geofence[]> {
    return Array.from(this.geofences.values()).filter(g => g.purchaseId === purchaseId);
  }

  async createGeofence(insertGeofence: InsertGeofence): Promise<Geofence> {
    const id = this.currentGeofenceId++;
    const geofence: Geofence = { ...insertGeofence, id };
    this.geofences.set(id, geofence);
    return geofence;
  }

  async deleteGeofence(id: number): Promise<boolean> {
    return this.geofences.delete(id);
  }
}

export const storage = new MemStorage();
