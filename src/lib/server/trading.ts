import { pool, sql } from "@/lib/db";
import { requireUserId } from "@/lib/server/auth/session";
import { ensureMarketTick, getQuote } from "@/lib/server/market";
import type { TradeRequest } from "@/lib/validation/trades";
import { ApiError } from "@/types/api";
import type { TradeResult } from "@/types/market";

type TradeRow = {
  id: string;
  account_id: string;
  symbol: string;
  side: "buy" | "sell";
  quantity: string;
  price: string;
  amount: string;
  created_at: Date | string;
};

function toCents(value: number | string): number {
  return Math.round(Number(value) * 100);
}

// Quantities are compared in millionths to avoid floating-point drift.
function toMicros(value: number | string): number {
  return Math.round(Number(value) * 1_000_000);
}

function toResult(row: TradeRow): TradeResult {
  return {
    tradeId: row.id,
    symbol: row.symbol,
    side: row.side,
    quantity: Number(row.quantity),
    price: Number(row.price),
    amount: Number(row.amount),
    status: "completed",
    createdAt: new Date(row.created_at).toISOString(),
  };
}

function rejected(code: string, message: string, status: number): ApiError {
  return new ApiError(message, { status, code });
}

// Returns the earlier trade for this key, or throws if the key was used for a different order.
async function findReplay(input: TradeRequest, symbol: string, userId: string): Promise<TradeRow | null> {
  const rows = (await sql`
    SELECT id, account_id, symbol, side, quantity, price, amount, created_at
    FROM market_trades
    WHERE idempotency_key = ${input.idempotencyKey} AND user_id = ${userId}
  `) as TradeRow[];
  const row = rows[0];
  if (!row) return null;

  const sameOrder =
    row.account_id === input.accountId &&
    row.symbol === symbol &&
    row.side === input.side &&
    toMicros(row.quantity) === toMicros(input.quantity);
  if (!sameOrder) {
    throw rejected("IDEMPOTENCY_CONFLICT", "This request key was already used for a different trade.", 409);
  }
  return row;
}

// Buys or sells one instrument at the current simulated price, in one database transaction.
export async function placeTrade(input: TradeRequest): Promise<TradeResult> {
  const userId = await requireUserId();
  const symbol = input.symbol.toUpperCase();
  const replay = await findReplay(input, symbol, userId);
  if (replay) return toResult(replay);

  await ensureMarketTick();
  const quote = await getQuote(symbol);
  if (!quote) {
    throw rejected("INSTRUMENT_NOT_FOUND", "That investment is not available for trading.", 404);
  }

  const amountCents = Math.round(input.quantity * quote.price * 100);
  if (amountCents <= 0) {
    throw rejected("ORDER_TOO_SMALL", "This order is too small to place.", 422);
  }
  const amount = (amountCents / 100).toFixed(2);
  const isBuy = input.side === "buy";

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const accountRows = (
      await client.query(
        `SELECT id, type, status, available_balance
         FROM accounts
         WHERE id = $1 AND user_id = $2
         FOR UPDATE`,
        [input.accountId, userId],
      )
    ).rows as { id: string; type: string; status: string; available_balance: string }[];
    const account = accountRows[0];
    if (!account) {
      throw rejected("ACCOUNT_NOT_FOUND", "The selected account was not found.", 404);
    }
    if (account.status !== "active") {
      throw rejected("ACCOUNT_NOT_ELIGIBLE", "The account must be active to place trades.", 422);
    }
    if (account.type === "credit") {
      throw rejected("ACCOUNT_NOT_ELIGIBLE", "Credit accounts cannot fund trades.", 422);
    }

    // Lock the holding so two concurrent sells cannot sell the same units.
    const holdingRows = (
      await client.query(
        `SELECT quantity FROM holdings WHERE user_id = $1 AND symbol = $2 FOR UPDATE`,
        [userId, symbol],
      )
    ).rows as { quantity: string }[];
    const owned = holdingRows[0] ? toMicros(holdingRows[0].quantity) : 0;

    if (!isBuy && owned < toMicros(input.quantity)) {
      throw rejected("INSUFFICIENT_HOLDINGS", "You do not hold enough units to sell.", 422);
    }
    if (isBuy && toCents(account.available_balance) < amountCents) {
      throw rejected("INSUFFICIENT_FUNDS", "Insufficient available funds.", 422);
    }

    const inserted = (
      await client.query(
        `INSERT INTO market_trades
           (user_id, account_id, symbol, side, quantity, price, amount, idempotency_key)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (idempotency_key) DO NOTHING
         RETURNING id, account_id, symbol, side, quantity, price, amount, created_at`,
        [
          userId,
          input.accountId,
          symbol,
          input.side,
          input.quantity,
          quote.price,
          amount,
          input.idempotencyKey,
        ],
      )
    ).rows as TradeRow[];

    // A concurrent request with the same key won the insert; return its result instead.
    if (inserted.length === 0) {
      await client.query("ROLLBACK");
      const winner = await findReplay(input, symbol, userId);
      if (winner) return toResult(winner);
      throw rejected("IDEMPOTENCY_CONFLICT", "This request key was already used.", 409);
    }

    if (isBuy) {
      await client.query(
        `INSERT INTO holdings (user_id, symbol, name, quantity)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, symbol)
         DO UPDATE SET quantity = holdings.quantity + EXCLUDED.quantity`,
        [userId, symbol, quote.name, input.quantity],
      );
    } else {
      await client.query(
        `UPDATE holdings SET quantity = quantity - $3 WHERE user_id = $1 AND symbol = $2`,
        [userId, symbol, input.quantity],
      );
    }

    const delta = isBuy ? `-${amount}` : amount;
    const updated = (
      await client.query(
        `UPDATE accounts
         SET balance = balance + $2, available_balance = available_balance + $2, updated_at = now()
         WHERE id = $1
         RETURNING balance`,
        [account.id, delta],
      )
    ).rows as { balance: string }[];

    await client.query(
      `INSERT INTO investment_transactions
         (user_id, description, category, direction, amount, status)
       VALUES ($1, $2, 'Investments', $3, $4, 'posted')`,
      [
        userId,
        `${isBuy ? "Buy" : "Sell"} ${quote.name} (${symbol}), ${input.quantity} @ ${quote.price}`,
        isBuy ? "debit" : "credit",
        amount,
      ],
    );
    await client.query(
      `INSERT INTO transactions
         (account_id, description, category, direction, amount, status, balance_after)
       VALUES ($1, $2, 'Investments', $3, $4, 'posted', $5)`,
      [
        account.id,
        `${isBuy ? "Investment purchase" : "Investment sale"}: ${symbol}`,
        isBuy ? "debit" : "credit",
        amount,
        updated[0].balance,
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
