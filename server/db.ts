import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error(
    "\n========================================\n" +
    "ERROR: DATABASE_URL is not set.\n" +
    "On Render: open your Web Service → Environment, add DATABASE_URL\n" +
    "with the Internal Database URL of your PostgreSQL instance.\n" +
    "========================================\n"
  );
  throw new Error("DATABASE_URL must be set.");
}

const useSsl = process.env.NODE_ENV === "production" && !process.env.DATABASE_URL.includes("localhost");

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
});
export const db = drizzle(pool, { schema });

// Auto-create all tables if they don't exist (runs on every startup, idempotent)
export async function ensureSchema(): Promise<void> {
  const ddl = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      is_admin BOOLEAN NOT NULL DEFAULT false,
      premium_expiry TEXT
    );
    CREATE TABLE IF NOT EXISTS purchases (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      device TEXT NOT NULL,
      imei TEXT NOT NULL,
      amount INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      user_email TEXT NOT NULL,
      tracking_type TEXT NOT NULL DEFAULT 'standard',
      last_tracking_update TEXT,
      last_lat TEXT,
      last_lng TEXT,
      premium_expiry TEXT,
      created_at TEXT NOT NULL DEFAULT '1970-01-01T00:00:00.000Z'
    );
    ALTER TABLE purchases ADD COLUMN IF NOT EXISTS created_at TEXT NOT NULL DEFAULT '1970-01-01T00:00:00.000Z';
    CREATE TABLE IF NOT EXISTS operation_logs (
      id SERIAL PRIMARY KEY,
      purchase_id INTEGER NOT NULL REFERENCES purchases(id),
      from_status TEXT NOT NULL,
      to_status TEXT NOT NULL,
      actor_id INTEGER REFERENCES users(id),
      actor_email TEXT,
      reason TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS geofences (
      id SERIAL PRIMARY KEY,
      purchase_id INTEGER REFERENCES purchases(id),
      name TEXT NOT NULL,
      center_lat TEXT NOT NULL,
      center_lng TEXT NOT NULL,
      radius INTEGER NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT true
    );
    CREATE TABLE IF NOT EXISTS location_history (
      id SERIAL PRIMARY KEY,
      purchase_id INTEGER NOT NULL REFERENCES purchases(id),
      lat TEXT NOT NULL,
      lng TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS ghost_links (
      id SERIAL PRIMARY KEY,
      purchase_id INTEGER REFERENCES purchases(id),
      token TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      is_viewed BOOLEAN NOT NULL DEFAULT false
    );
  `;
  await pool.query(ddl);
}
