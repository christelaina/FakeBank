// src/lib/server/lab/account-lookup.ts
// Lab-only and intentionally vulnerable: loads any account without the ownership check. Call only when isLabEnabled().
import { sql } from "@/lib/db";
import { requireUserId } from "@/lib/server/auth/session";
import { generateFlag } from "@/lib/lab/flags";
import { recordDetectionIfCanaryExposed } from "@/lib/server/lab/detections";
import type {
  Account,
  AccountStatus,
  AccountType,
  Transaction,
  TransactionDirection,
  TransactionStatus,
} from "@/types/banking";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

export type LabFlag = { challengeId: "api" | "xss"; flag: string };

function mapAccount(row: AccountRow): Account {
  return {
    id: row.id,
    name: row.name,
    nickname: row.nickname ?? undefined,
    type: row.type,
    maskedNumber: row.masked_number,
    balance: Number(row.balance),
    availableBalance: Number(row.available_balance),
    currency: "CAD",
    status: row.status,
  };
}

function mapTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    accountId: row.account_id,
    date: new Date(row.date).toISOString(),
    description: row.description,
    category: row.category,
    direction: row.direction,
    amount: Number(row.amount),
    status: row.status,
    balanceAfter: row.balance_after === null ? undefined : Number(row.balance_after),
  };
}

export async function getLabAccountView(
  accountId: string,
): Promise<{ account: Account; transactions: Transaction[]; flags: LabFlag[] } | null> {
  const studentId = await requireUserId();
  if (!UUID_PATTERN.test(accountId)) return null;

  const accountRows = (await sql`
    SELECT id, name, nickname, type, masked_number, balance, available_balance, currency, status
    FROM accounts
    WHERE id = ${accountId}
  `) as AccountRow[];
  if (accountRows.length === 0) return null;

  const transactionRows = (await sql`
    SELECT id, account_id, date, description, category, direction, amount, status, balance_after
    FROM transactions
    WHERE account_id = ${accountId}
    ORDER BY date DESC, id DESC
    LIMIT 8
  `) as TransactionRow[];

  await recordDetectionIfCanaryExposed(studentId, "api", accountId, {
    account: accountRows[0],
    transactions: transactionRows,
  });

  const detectionRows = (await sql`
    SELECT challenge_id FROM lab_detections WHERE student_id = ${studentId} ORDER BY challenge_id
  `) as { challenge_id: string }[];

  return {
    account: mapAccount(accountRows[0]),
    transactions: transactionRows.map(mapTransaction),
    flags: detectionRows
      .filter((row): row is { challenge_id: "api" | "xss" } =>
        row.challenge_id === "api" || row.challenge_id === "xss",
      )
      .map((row) => ({
        challengeId: row.challenge_id,
        flag: generateFlag(studentId, row.challenge_id),
      })),
  };
}
