import { sql } from "@/lib/db";
import { requireUserId } from "@/lib/server/auth/session";
import { escapeLikePattern } from "@/lib/validation/transactions";
import type {
  Transaction,
  TransactionDirection,
  TransactionStatus,
} from "@/types/banking";

// Shape of one transactions row as Neon returns it.
type TransactionRow = {
  id: string;
  account_id: string;
  date: Date | string;
  description: string;
  category: string;
  direction: TransactionDirection;
  amount: string;
  status: TransactionStatus;
  balance_after: string | null;
};

function mapTransactionRow(row: TransactionRow): Transaction {
  return {
    id: row.id,
    accountId: row.account_id,
    date: new Date(row.date).toISOString(),
    description: row.description,
    category: row.category,
    direction: row.direction,
    amount: Number(row.amount),
    status: row.status,
    balanceAfter:
      row.balance_after === null ? undefined : Number(row.balance_after),
  };
}

export type TransactionSearchFilters = {
  accountId?: string;
  query?: string;
  page: number;
  pageSize: number;
};

// Paged transactions for the demo user, optionally filtered by account and text.
export async function searchTransactions(filters: TransactionSearchFilters) {
  const userId = await requireUserId();
  const accountId = filters.accountId ?? null;
  const pattern = filters.query
    ? `%${escapeLikePattern(filters.query)}%`
    : null;
  const offset = (filters.page - 1) * filters.pageSize;

  const rows = (await sql`
    SELECT t.id, t.account_id, t.date, t.description, t.category,
           t.direction, t.amount, t.status, t.balance_after
    FROM transactions t
    JOIN accounts a ON a.id = t.account_id
    WHERE a.user_id = ${userId}
      AND (${accountId}::uuid IS NULL OR t.account_id = ${accountId}::uuid)
      AND (${pattern}::text IS NULL
           OR t.description ILIKE ${pattern}::text
           OR t.category ILIKE ${pattern}::text)
    ORDER BY t.date DESC, t.id DESC
    LIMIT ${filters.pageSize} OFFSET ${offset}
  `) as TransactionRow[];

  const countRows = (await sql`
    SELECT COUNT(*)::int AS total
    FROM transactions t
    JOIN accounts a ON a.id = t.account_id
    WHERE a.user_id = ${userId}
      AND (${accountId}::uuid IS NULL OR t.account_id = ${accountId}::uuid)
      AND (${pattern}::text IS NULL
           OR t.description ILIKE ${pattern}::text
           OR t.category ILIKE ${pattern}::text)
  `) as { total: number }[];

  return {
    items: rows.map(mapTransactionRow),
    total: countRows[0].total,
    page: filters.page,
    pageSize: filters.pageSize,
  };
}
