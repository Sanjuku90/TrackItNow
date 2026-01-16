import { users, purchases, type User, type InsertUser, type Purchase, type InsertPurchase } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Purchase methods
  getPurchases(): Promise<Purchase[]>;
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  updatePurchaseStatus(id: number, status: string): Promise<Purchase | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private purchases: Map<number, Purchase>;
  currentUserId: number;
  currentPurchaseId: number;

  constructor() {
    this.users = new Map();
    this.purchases = new Map();
    this.currentUserId = 1;
    this.currentPurchaseId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
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
    const purchase = this.purchases.get(id);
    if (!purchase) return undefined;
    
    const updatedPurchase = { ...purchase, status: status as any };
    this.purchases.set(id, updatedPurchase);
    return updatedPurchase;
  }
}

export const storage = new MemStorage();
