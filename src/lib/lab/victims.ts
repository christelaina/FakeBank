// Creates a hidden victim user for a new student. Runs inside the student's registration transaction.
import { randomBytes, randomInt, randomUUID } from "node:crypto";
import { CHEQUING_NICKNAME } from "@/lib/config/starter-accounts";
import { encryptPassword } from "@/lib/server/auth/password";

type Queryable = {
  query: (text: string, params?: unknown[]) => Promise<{ rows: unknown[] }>;
};

const VICTIM_BALANCE = 2500;

export async function createLabVictim(client: Queryable, studentId: string, studentChequingId: string): Promise<void> {
  // The password is random and never shown, so the victim cannot sign in.
  const victimPassword = randomBytes(32).toString("hex");
  const victimRows = (
    await client.query(
      `INSERT INTO users (email, password_hash, display_name)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [`victim-${randomUUID()}@lab.invalid`, encryptPassword(victimPassword), "Account Holder"],
    )
  ).rows as { id: string }[];
  const victimId = victimRows[0].id;

  const accountRows = (
    await client.query(
      `INSERT INTO accounts (user_id, name, nickname, type, masked_number, balance, available_balance)
       VALUES ($1, 'Everyday Chequing', $2, 'chequing', $3, $4, $4)
       RETURNING id`,
      [victimId, CHEQUING_NICKNAME, String(randomInt(1_000_000, 10_000_000)), VICTIM_BALANCE],
    )
  ).rows as { id: string }[];
  const victimAccountId = accountRows[0].id;
  const canary = randomBytes(16).toString("hex");

  await client.query(
    `INSERT INTO transactions (account_id, date, description, category, direction, amount, status, balance_after)
     VALUES ($1, now(), $2, 'Transfers', 'credit', 0, 'posted', $3)`,
    [victimAccountId, `Lab note ${canary}`, VICTIM_BALANCE],
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
