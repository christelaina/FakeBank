import { neon, Pool } from "@neondatabase/serverless";

// Lab deployments must never fall back to the banking database.
const labMode = process.env.LAB_MODE === "on";
const connectionString = labMode ? process.env.LAB_DATABASE_URL : process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(labMode ? "LAB_DATABASE_URL is not configured" : "DATABASE_URL is not configured");
}

// Next caches POST fetches by body, so reads would otherwise return stale rows.
export const sql = neon(connectionString, { fetchOptions: { cache: "no-store" } });
// Pool supports BEGIN/COMMIT; use only where multi-statement transactions are required.
export const pool = new Pool({ connectionString });