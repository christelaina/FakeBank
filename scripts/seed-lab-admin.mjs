// scripts/seed-lab-admin.mjs
// Creates or updates the lab admin. Refuses to run unless LAB_MODE=on, so run it only against the lab database.
// Required env: LAB_MODE, DATABASE_URL, LAB_ADMIN_EMAIL, LAB_ADMIN_PASSWORD (min 12 characters).
import { randomBytes, scrypt } from "node:crypto";
import { Pool } from "@neondatabase/serverless";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set.`);
  return value;
}

if (process.env.LAB_MODE !== "on") throw new Error("LAB_MODE must be on to seed the lab admin.");

const email = requireEnv("LAB_ADMIN_EMAIL").trim().toLowerCase();
const password = requireEnv("LAB_ADMIN_PASSWORD");
if (password.length < 12) throw new Error("LAB_ADMIN_PASSWORD must be at least 12 characters.");

// Must match hashAdminPassword in src/lib/server/auth/admin-password.ts.
const N = 16384;
const R = 8;
const P = 1;
const salt = randomBytes(16);
const key = await new Promise((resolve, reject) =>
  scrypt(password, salt, 64, { N, r: R, p: P, maxmem: 64 * 1024 * 1024 }, (error, derived) =>
    error ? reject(error) : resolve(derived),
  ),
);
const hash = `scrypt$${N}$${R}$${P}$${salt.toString("base64")}$${key.toString("base64")}`;

const pool = new Pool({ connectionString: requireEnv("DATABASE_URL") });
try {
  await pool.query(
    `INSERT INTO users (email, password_hash, display_name, role)
     VALUES ($1, $2, 'Lab Admin', 'admin')
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'admin'`,
    [email, hash],
  );
  console.log("Lab admin seeded.");
} finally {
  await pool.end();
}
