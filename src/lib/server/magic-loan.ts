// src/lib/server/magic-loan.ts
// Server-only. Credits the signed-in user's Primary chequing account and logs the credit in one statement.
import { sql } from "@/lib/db";
import { requireUserId } from "@/lib/server/auth/session";

export const MAGIC_LOAN_AMOUNT = 2000;

export type MagicLoanResult = { balance: number; availableBalance: number } | null;

export async function grantMagicLoan(): Promise<MagicLoanResult> {
  const userId = await requireUserId();

  const rows = (await sql`
    WITH target AS (
      SELECT id
      FROM accounts
      WHERE user_id = ${userId} AND type = 'chequing' AND status = 'active'
      ORDER BY (nickname = 'Primary') DESC, id
      LIMIT 1
    ),
    updated AS (
      UPDATE accounts AS a
      SET balance = a.balance + ${MAGIC_LOAN_AMOUNT},
          available_balance = a.available_balance + ${MAGIC_LOAN_AMOUNT}
      FROM target
      WHERE a.id = target.id
      RETURNING a.id, a.balance, a.available_balance
    ),
    recorded AS (
      INSERT INTO transactions (account_id, description, category, direction, amount, status, balance_after)
      SELECT id, 'Magic loan', 'Transfers', 'credit', ${MAGIC_LOAN_AMOUNT}, 'posted', balance
      FROM updated
      RETURNING id
    )
    SELECT balance, available_balance FROM updated
  `) as { balance: string | number; available_balance: string | number }[];

  const row = rows[0];
  if (!row) return null;
  return { balance: Number(row.balance), availableBalance: Number(row.available_balance) };
}
