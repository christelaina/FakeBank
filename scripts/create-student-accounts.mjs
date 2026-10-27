// scripts/create-student-accounts.mjs
// Creates 20 student users (two chequing, one Visa Cashback, one hidden lab victim each) and prints their passwords once. --backfill-victims adds victims to existing students.
// Required env: LAB_MODE=on, LAB_DATABASE_URL, AUTH_LAB_KEY_HEX, AUTH_LAB_IV_HEX (must match the deployed app).
import { createCipheriv, randomBytes, randomInt, randomUUID } from "node:crypto";
import { Pool } from "@neondatabase/serverless";

const DOMAIN = "@fakebank.com";
const CHEQUING_NICKNAME = "Primary";
const HEX_16_BYTES = /^[0-9a-f]{32}$/i;
const PASSWORDS = [
  "winteriscoming!",
  "ihaveabadfeelingaboutthis",
  "youshallnotpass!",
  "thecakeisalie",
  "winnerwinnerchickendinner",
  "heresjohnny?",
  "sayhellotomyfriend",
  "hastalavistababy!",
  "keepcalmandcarryon",
  "ifyoubuildit",
  "imgonnamakeanoffer",
  "ohwhatafeelingitsfriday",
  "thisisthewayyeah",
  "bazingaimnotcrazy",
  "myprecious1",
  "theresnoplacelikehome",
  "nevergonnagiveyouup",
  "helloclarice?",
  "ihavenoideawhatimdoing",
  "showmethemoney!",
];
// Index 0 is student00; index 1-20 map to PASSWORDS[0-19].
const HANDLES = [
  "walterwhite",
  "wendydarling",
  "thedude",
  "mrincredible",
  "rtc",
  "tonystark",
  "hansolo",
  "darthvader",
  "gandalf",
  "ferrisbueller",
  "neo",
  "dorothygale",
  "venkman",
  "jacksparrow",
  "deadpool",
  "optimusprime",
  "shrek",
  "spongebob",
  "homersimpson",
  "leeloodallas",
  "fonzie",
];
const STUDENT_00 = { n: 0, handle: HANDLES[0], password: "ihavethepower!" };
const BACKFILL = process.argv.includes("--backfill-victims");
const TARGETS = BACKFILL
  ? []
  : process.argv.includes("--student00")
    ? [STUDENT_00]
    : PASSWORDS.map((password, i) => ({ n: i + 1, handle: HANDLES[i + 1], password }));

if (process.env.LAB_MODE !== "on") throw new Error("LAB_MODE must be on.");
if (!process.env.LAB_DATABASE_URL) throw new Error("LAB_DATABASE_URL is not set.");
const keyHex = process.env.AUTH_LAB_KEY_HEX ?? "";
const ivHex = process.env.AUTH_LAB_IV_HEX ?? "";
if (!HEX_16_BYTES.test(keyHex) || !HEX_16_BYTES.test(ivHex)) {
  throw new Error("AUTH_LAB_KEY_HEX and AUTH_LAB_IV_HEX must each be 32 hex characters.");
}

// Mirrors encryptPassword in src/lib/server/auth/password.ts.
function encryptPassword(password) {
  const cipher = createCipheriv("aes-128-cbc", Buffer.from(keyHex, "hex"), Buffer.from(ivHex, "hex"));
  const ciphertextHex = Buffer.concat([cipher.update(password, "utf8"), cipher.final()]).toString("hex");
  return Buffer.from(ciphertextHex, "utf8").toString("base64");
}

function randomMaskedNumber() {
  return String(randomInt(1_000_000, 10_000_000));
}

// Mirrors createLabVictim in src/lib/lab/victims.ts.
async function createVictim(client, studentId, studentChequingId) {
  const victimPassword = randomBytes(32).toString("hex");
  const victimId = (
    await client.query(
      `INSERT INTO users (email, password_hash, display_name)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [`victim-${randomUUID()}@lab.invalid`, encryptPassword(victimPassword), "Account Holder"],
    )
  ).rows[0].id;

  const victimAccountId = (
    await client.query(
      `INSERT INTO accounts (user_id, name, nickname, type, masked_number, balance, available_balance)
       VALUES ($1, 'Everyday Chequing', $2, 'chequing', $3, 2500, 2500)
       RETURNING id`,
      [victimId, CHEQUING_NICKNAME, randomMaskedNumber()],
    )
  ).rows[0].id;

  const canary = randomBytes(16).toString("hex");
  await client.query(
    `INSERT INTO transactions (account_id, date, description, category, direction, amount, status, balance_after)
     VALUES ($1, now(), $2, 'Transfers', 'credit', 0, 'posted', 2500)`,
    [victimAccountId, `Lab note ${canary}`],
  );
  await client.query(
    `INSERT INTO transactions (account_id, date, description, category, direction, amount, status, balance_after)
     VALUES ($1, now() - interval '2 days', $2, 'Transfers', 'credit', 0, 'posted', 0)`,
    [studentChequingId, `Interac e-Transfer from Community Savings, ref ${victimAccountId}`],
  );
  await client.query(
    `INSERT INTO lab_victims (student_id, victim_user_id, canary) VALUES ($1, $2, $3)`,
    [studentId, victimId, canary],
  );
}

const pool = new Pool({ connectionString: process.env.LAB_DATABASE_URL });
const client = await pool.connect();
const created = [];
try {
  await client.query("BEGIN");
  if (BACKFILL) {
    const { rows } = await client.query(
      `SELECT u.id, a.id AS chequing_id
       FROM users u
       JOIN accounts a ON a.user_id = u.id AND a.name = 'Everyday Chequing'
       WHERE u.email LIKE '%@fakebank.com'
         AND u.id NOT IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444')
         AND u.id NOT IN (SELECT student_id FROM lab_victims)`,
    );
    for (const row of rows) await createVictim(client, row.id, row.chequing_id);
    console.log(`Created lab victims for ${rows.length} students.`);
  }
  for (const { n, handle, password } of TARGETS) {
    const label = String(n).padStart(2, "0");
    const email = `${handle}${DOMAIN}`;
    const userRows = (
      await client.query(
        `INSERT INTO users (email, password_hash, display_name)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [email, encryptPassword(password), handle],
      )
    ).rows;
    const userId = userRows[0].id;

    let chequingId;
    for (const [name, nickname, type] of [
      ["Everyday Chequing", "Primary", "chequing"],
      ["Bills Chequing", "Bills", "chequing"],
      ["Visa Cashback", "Cashback", "credit"],
    ]) {
      const { rows } = await client.query(
        `INSERT INTO accounts (user_id, name, nickname, type, masked_number, balance, available_balance)
         VALUES ($1, $2, $3, $4, $5, 0, 0)
         RETURNING id`,
        [userId, name, nickname, type, randomMaskedNumber()],
      );
      if (name === "Everyday Chequing") chequingId = rows[0].id;
    }
    await createVictim(client, userId, chequingId);
    created.push({ email, password });
  }
  await client.query("COMMIT");
  for (const { email, password } of created) console.log(`${email}\t${password}`);
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  throw error;
} finally {
  client.release();
  await pool.end();
}
