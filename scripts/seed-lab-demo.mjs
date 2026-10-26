// scripts/seed-lab-demo.mjs
// Loads the demo users into the lab database. Refuses to run unless LAB_MODE=on.
// Required env: LAB_MODE, DATABASE_URL (set to the lab database URL).
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Pool } from "@neondatabase/serverless";

if (process.env.LAB_MODE !== "on") throw new Error("LAB_MODE must be on to seed the lab demo users.");
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set.");

const seedPath = fileURLToPath(new URL("../database/seeds/0001.add_data.sql", import.meta.url));
const seedSql = await readFile(seedPath, "utf8");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();
try {
  // The seed file opens its own BEGIN and has no COMMIT, so commit here.
  await client.query(seedSql);
  await client.query("COMMIT");
  console.log("Lab demo users seeded.");
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  throw error;
} finally {
  client.release();
  await pool.end();
}
