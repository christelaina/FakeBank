// src/lib/server/accounts.ts
import { sql } from "@/lib/db";
import { requireUserId } from "@/lib/server/auth/session";
import type { Account, AccountStatus, AccountType } from "@/types/banking";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Shape of one row as Neon returns it (snake_case, numbers as strings).
type AccountRow = {
  id: string;
  name: string;
  nickname: string | null;
  type: AccountType;
  masked_number: string;
  balance: string;
  available_balance: string;
  currency: string;
  status: AccountStatus;
};

function toCurrency(value: string): "CAD" {
  if (value !== "CAD") {
    throw new Error(`Unsupported currency: ${value}`);
  }
  return value;
}

// Convert a row from the database into an Account object.
function mapAccountRow(row: AccountRow): Account {
  return {
    id: row.id,
    name: row.name,
    nickname: row.nickname ?? undefined,
    type: row.type,
    maskedNumber: row.masked_number,
    balance: Number(row.balance),
    availableBalance: Number(row.available_balance),
    currency: toCurrency(row.currency),
    status: row.status,
  };
}

export async function listAccounts(): Promise<Account[]> {
  const userId = await requireUserId();
  const rows = (await sql`
    SELECT id, name, nickname, type, masked_number,
           balance, available_balance, currency, status
    FROM accounts
    WHERE user_id = ${userId}
    ORDER BY created_at
  `) as AccountRow[];
  return rows.map(mapAccountRow);
}

export async function getAccount(accountId: string): Promise<Account | null> {
  const userId = await requireUserId();
  // Non-UUID IDs would make Postgres throw, so treat them as not found.
  if (!UUID_PATTERN.test(accountId)) return null;

  const rows = (await sql`
    SELECT id, name, nickname, type, masked_number,
           balance, available_balance, currency, status
    FROM accounts
    WHERE id = ${accountId} AND user_id = ${userId}
  `) as AccountRow[];
  const row = rows[0];
  return row ? mapAccountRow(row) : null;
}