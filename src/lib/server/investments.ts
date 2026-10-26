// src/lib/server/investments.ts
import { sql } from "@/lib/db";
import { requireUserId } from "@/lib/server/auth/session";
import { getQuotes } from "@/lib/server/market";
import type { PortfolioSummary } from "@/types/banking";

type HoldingRow = {
  id: string;
  symbol: string;
  name: string;
  quantity: string;
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

type HistoryRow = {
  snapshot_date: string;
  total_value: string;
  day_change_percent: string | null;
};

type InvestmentTransactionRow = {
  id: string;
  description: string;
  category: string;
  direction: "debit" | "credit";
  amount: string;
  status: "posted" | "pending" | "failed";
  occurred_at: string | Date;
};

export async function getPortfolio(): Promise<PortfolioSummary> {
  const userId = await requireUserId();
  const [quotes, holdingRows, historyRows, txRows] = (await Promise.all([
    getQuotes(),
    sql`
      SELECT id, symbol, name, quantity
      FROM holdings
      WHERE user_id = ${userId} AND quantity > 0
    `,
    sql`
      SELECT to_char(snapshot_date, 'YYYY-MM-DD') AS snapshot_date, total_value, day_change_percent
      FROM portfolio_history
      WHERE user_id = ${userId}
      ORDER BY snapshot_date ASC
    `,
    sql`
      SELECT id, description, category, direction, amount, status, occurred_at
      FROM investment_transactions
      WHERE user_id = ${userId}
      ORDER BY occurred_at DESC
    `,
  ])) as [Awaited<ReturnType<typeof getQuotes>>, HoldingRow[], HistoryRow[], InvestmentTransactionRow[]];

  const quoteBySymbol = new Map(quotes.map((quote) => [quote.symbol, quote]));
  const positions = holdingRows.flatMap((row) => {
    const quote = quoteBySymbol.get(row.symbol);
    if (!quote) return [];
    return [{ row, quote, quantity: Number(row.quantity) }];
  });

  const totalValue = round2(
    positions.reduce((sum, p) => sum + p.quantity * p.quote.price, 0),
  );
  const priorTotal = positions.reduce((sum, p) => sum + p.quantity * p.quote.priorClose, 0);
  const dayChangePercent =
    priorTotal === 0
      ? 0
      : round2(((totalValue - priorTotal) / priorTotal) * 100);

  const holdings = positions
    .map(({ row, quote, quantity }) => {
      const marketValue = round2(quantity * quote.price);
      return {
        id: row.id,
        symbol: row.symbol,
        name: row.name,
        quantity,
        marketPrice: quote.price,
        marketValue,
        allocationPercent:
          totalValue === 0 ? 0 : Math.round((marketValue / totalValue) * 1000) / 10,
        dayChangePercent: quote.changePercent,
      };
    })
    .sort((a, b) => b.marketValue - a.marketValue);

  return {
    totalValue,
    dayChangePercent,
    holdings,
    history: historyRows.map((row) => ({
      date: row.snapshot_date,
      value: Number(row.total_value),
    })),
    investmentTransactions: txRows.map((row) => ({
      id: row.id,
      accountId: "portfolio",
      date: new Date(row.occurred_at).toISOString(),
      description: row.description,
      category: row.category,
      direction: row.direction,
      amount: Number(row.amount),
      status: row.status,
    })),
  } as PortfolioSummary;
}
