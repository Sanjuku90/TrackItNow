import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const SessionStore = MemoryStore(session);
app.use(
  session({
    cookie: { maxAge: 86400000 },
    store: new SessionStore({
      checkPeriod: 86400000,
    }),
    resave: false,
    saveUninitialized: false,
    secret: "keyboard cat",
  })
);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Background task for periodic tracking updates (Fast Track users)
  setInterval(async () => {
    try {
      const { storage } = await import("./storage");
      const { sendLocationToUser } = await import("./email");
      const { generateLomeLocation } = await import("../client/src/lib/device-data");
      
      const purchases = await storage.getPurchases();
      const activePriorityPurchases = purchases.filter(p => 
        p.status === "validated" && p.trackingType === "priority"
      );

      for (const purchase of activePriorityPurchases) {
        // Send location update every 4 hours (simulated)
        const coordinates = generateLomeLocation();
        await sendLocationToUser(purchase.userEmail, purchase.device, coordinates);
        // We could update lastTrackingUpdate here if needed
      }
    } catch (error) {
      console.error("Error in background tracking task:", error);
    }
  }, 1000 * 60 * 60 * 4); // Every 4 hours

  // Hourly job: expire premium operations whose expiry has passed
  setInterval(async () => {
    try {
      const { storage } = await import("./storage");
      const expired = await storage.expireDuePurchases();
      if (expired > 0) log(`Auto-expired ${expired} operation(s)`);
    } catch (error) {
      console.error("Error in expiration task:", error);
    }
  }, 1000 * 60 * 60); // Every hour

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
