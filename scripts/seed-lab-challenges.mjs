// scripts/seed-lab-challenges.mjs
// Upserts the challenge catalog. Refuses to run unless LAB_MODE=on, so run it only against the lab database.
// Required env: LAB_MODE, DATABASE_URL.
import { Pool } from "@neondatabase/serverless";

if (process.env.LAB_MODE !== "on") throw new Error("LAB_MODE must be on to seed challenges.");
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set.");

const challenges = [
  { id: "api", title: "API", points: 200 },
  { id: "xss", title: "XSS", points: 400 },
  { id: "race", title: "Race condition", points: 500 },
  { id: "crypto", title: "Cryptography", points: 600 },
  { id: "file", title: "File injection", points: 700 },
  { id: "access-control", title: "Access control", points: 800 },
];

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
try {
  for (const challenge of challenges) {
    await pool.query(
      `INSERT INTO lab_challenges (id, title, points)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, points = EXCLUDED.points`,
      [challenge.id, challenge.title, challenge.points],
    );
  }
  const { rows } = await pool.query("SELECT id, points FROM lab_challenges ORDER BY points");
  console.log(`Seeded ${rows.length} challenges: ${rows.map((row) => `${row.id}=${row.points}`).join(", ")}`);
} finally {
  await pool.end();
}
