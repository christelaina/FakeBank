import { pool, sql } from "@/lib/db";
import { requireUserId } from "@/lib/server/auth/session";
import type { TransferRequest } from "@/lib/validation/transfers";
import { ApiError } from "@/types/api";
import type { TransferResult } from "@/types/banking";

type AccountLockRow = {
  id: string;
  type: "chequing" | "savings" | "credit";
  status: "active" | "frozen" | "closed";
  balance: string;
  available_balance: string;
};

type TransferRow = {
  id: string;
  source_account_id: string;
  destination_account_id: string;
  amount: string;
  created_at: Date | string;
};

function toCents(value: number | string): number {
  return Math.round(Number(value) * 100);
}

function toResult(row: TransferRow): TransferResult {
  return {
    transferId: row.id,
    status: "completed",
    message: "Transfer completed.",
    createdAt: new Date(row.created_at).toISOString(),
    verifiedByBackend: true,
  };
}

function rejected(code: string, message: string, status: number): ApiError {
  return new ApiError(message, { status, code });
}

// Returns the earlier transfer for this key, or throws if the key was used for a different transfer.
async function findReplay(input: TransferRequest, userId: string): Promise<TransferRow | null> {
  const rows = (await sql`
    SELECT t.id, t.source_account_id, t.destination_account_id, t.amount, t.created_at
    FROM transfers t
    JOIN accounts a ON a.id = t.source_account_id
    WHERE t.idempotency_key = ${input.idempotencyKey}
      AND a.user_id = ${userId}
  `) as TransferRow[];
  const row = rows[0];
  if (!row) return null;

  const sameTransfer =
    row.source_account_id === input.sourceAccountId &&
    row.destination_account_id === input.destinationAccountId &&
    toCents(row.amount) === toCents(input.amount);
  if (!sameTransfer) {
    throw rejected("IDEMPOTENCY_CONFLICT", "This request key was already used for a different transfer.", 409);
  }
  return row;
}

// Moves funds between two of the demo user's accounts in one database transaction.
export async function createTransfer(input: TransferRequest): Promise<TransferResult> {
  const userId = await requireUserId();
  const replay = await findReplay(input, userId);
  if (replay) return toResult(replay);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Lock both accounts in id order so overlapping transfers cannot deadlock.
    const locked = (
      await client.query(
        `SELECT id, type, status, balance, available_balance
         FROM accounts
         WHERE user_id = $1 AND id = ANY($2::uuid[])
         ORDER BY id
         FOR UPDATE`,
        [userId, [input.sourceAccountId, input.destinationAccountId]],
      )
    ).rows as AccountLockRow[];

    const source = locked.find((a) => a.id === input.sourceAccountId);
    const destination = locked.find((a) => a.id === input.destinationAccountId);
    if (!source || !destination) {
      throw rejected("ACCOUNT_NOT_FOUND", "One of the selected accounts was not found.", 404);
    }
    for (const account of [source, destination]) {
      if (account.status !== "active") {
        throw rejected("ACCOUNT_NOT_ELIGIBLE", "Both accounts must be active to transfer funds.", 422);
      }
    }
    if (source.type === "credit") {
      throw rejected("ACCOUNT_NOT_ELIGIBLE", "Credit accounts cannot be the source of a transfer.", 422);
    }
    if (toCents(source.available_balance) < toCents(input.amount)) {
      throw rejected("INSUFFICIENT_FUNDS", "Insufficient available funds.", 422);
    }

    const inserted = (
      await client.query(
        `INSERT INTO transfers
           (source_account_id, destination_account_id, amount, description,
            status, processed_at, idempotency_key)
         VALUES ($1, $2, $3, $4, 'completed', now(), $5)
         ON CONFLICT (idempotency_key) DO NOTHING
         RETURNING id, source_account_id, destination_account_id, amount, created_at`,
        [
          input.sourceAccountId,
          input.destinationAccountId,
          input.amount,
          input.description ?? null,
          input.idempotencyKey,
        ],
      )
    ).rows as TransferRow[];

    // A concurrent request with the same key won the insert; roll back and return its result.
    if (inserted.length === 0) {
      await client.query("ROLLBACK");
      const winner = await findReplay(input, userId);
      if (winner) return toResult(winner);
      throw rejected("IDEMPOTENCY_CONFLICT", "This request key was already used.", 409);
    }

    const debited = (
      await client.query(
        `UPDATE accounts
         SET balance = balance - $2, available_balance = available_balance - $2, updated_at = now()
         WHERE id = $1
         RETURNING balance`,
        [input.sourceAccountId, input.amount],
      )
    ).rows as { balance: string }[];

    const credited = (
      await client.query(
        `UPDATE accounts
         SET balance = balance + $2, available_balance = available_balance + $2, updated_at = now()
         WHERE id = $1
         RETURNING balance`,
        [input.destinationAccountId, input.amount],
      )
    ).rows as { balance: string }[];

    const isPayment = destination.type === "credit";
    const label = input.description || (isPayment ? "Card payment" : "Transfer");
    await client.query(
      `INSERT INTO transactions
         (account_id, description, category, direction, amount, status, balance_after)
       VALUES ($1, $2, 'Transfers', 'debit', $3, 'posted', $4)`,
      [
        input.sourceAccountId,
        `${isPayment ? "Payment" : "Transfer out"}: ${label}`,
        input.amount,
        debited[0].balance,
      ],
    );
    await client.query(
      `INSERT INTO transactions
         (account_id, description, category, direction, amount, status, balance_after)
       VALUES ($1, $2, 'Transfers', 'credit', $3, 'posted', $4)`,
      [
        input.destinationAccountId,
        `${isPayment ? "Payment received" : "Transfer in"}: ${label}`,
        input.amount,
        credited[0].balance,
      ],
    );

    await client.query("COMMIT");
    return toResult(inserted[0]);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}
