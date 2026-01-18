import { users, purchases, geofences, ghostLinks, type User, type InsertUser, type Purchase, type InsertPurchase, type Geofence, type InsertGeofence, type GhostLink, type InsertGhostLink } from "@shared/schema";

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
  updatePurchaseLocation(id: number, lat: string, lng: string): Promise<Purchase | undefined>;
  updateUserPremium(email: string, expiry: string): Promise<User | undefined>;

  // Geofence methods
  getGeofences(purchaseId: number): Promise<Geofence[]>;
  createGeofence(geofence: InsertGeofence): Promise<Geofence>;
  deleteGeofence(id: number): Promise<boolean>;

  // GhostLink methods
  getGhostLinkByToken(token: string): Promise<GhostLink | undefined>;
  createGhostLink(ghostLink: InsertGhostLink): Promise<GhostLink>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private purchases: Map<number, Purchase>;
  private geofences: Map<number, Geofence>;
  private ghostLinks: Map<number, GhostLink>;
  currentUserId: number;
  currentPurchaseId: number;
  currentGeofenceId: number;
  currentGhostLinkId: number;

  constructor() {
    this.users = new Map();
    this.purchases = new Map();
    this.geofences = new Map();
    this.ghostLinks = new Map();
    this.currentUserId = 1;
    this.currentPurchaseId = 1;
    this.currentGeofenceId = 1;
    this.currentGhostLinkId = 1;
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
      lastTrackingUpdate: null,
      lastLat: null,
      lastLng: null,
      premiumExpiry: null
    };
    this.purchases.set(id, purchase);
    return purchase;
  }

  async updatePurchaseStatus(id: number, status: string): Promise<Purchase | undefined> {
    const purchase = this.purchases.get(id);
    if (!purchase) return undefined;
    
    const updatedPurchase = { ...purchase, status: status as any };
    this.purchases.set(id, updatedPurchase);
    return updatedPurchase;
  }

  async updatePurchaseLocation(id: number, lat: string, lng: string): Promise<Purchase | undefined> {
    const purchase = this.purchases.get(id);
    if (!purchase) return undefined;
    
    const updatedPurchase = { ...purchase, lastLat: lat, lastLng: lng };
    this.purchases.set(id, updatedPurchase);
    return updatedPurchase;
  }

  async updateUserPremium(email: string, expiry: string): Promise<User | undefined> {
    const user = Array.from(this.users.values()).find(u => u.email === email);
    if (!user) return undefined;
    
    const updatedUser = { ...user, premiumExpiry: expiry };
    this.users.set(user.id, updatedUser);
    return updatedUser;
  }

  async getGeofences(purchaseId: number): Promise<Geofence[]> {
    return Array.from(this.geofences.values()).filter(g => g.purchaseId === purchaseId);
  }

  async createGeofence(insertGeofence: InsertGeofence): Promise<Geofence> {
    const id = this.currentGeofenceId++;
    const geofence: Geofence = { 
      ...insertGeofence, 
      id,
      purchaseId: insertGeofence.purchaseId ?? null,
      isActive: insertGeofence.isActive ?? true
    };
    this.geofences.set(id, geofence);
    return geofence;
  }

  async deleteGeofence(id: number): Promise<boolean> {
    return this.geofences.delete(id);
  }

  async getGhostLinkByToken(token: string): Promise<GhostLink | undefined> {
    return Array.from(this.ghostLinks.values()).find(l => l.token === token);
  }

  async createGhostLink(insertGhostLink: InsertGhostLink): Promise<GhostLink> {
    const id = this.currentGhostLinkId++;
    const ghostLink: GhostLink = { 
      ...insertGhostLink, 
      id,
      purchaseId: insertGhostLink.purchaseId ?? null,
      isViewed: insertGhostLink.isViewed ?? false
    };
    this.ghostLinks.set(id, ghostLink);
    return ghostLink;
  }
}

export const storage = new MemStorage();
