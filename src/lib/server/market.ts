// Market instrument quotes, with a lazy 5-minute price step. No background job is needed.
import { sql } from "@/lib/db";
import { currentTickBucket, nextPrice } from "@/lib/market/simulation";
import type { MarketQuote } from "@/types/market";

type TickSourceRow = {
  id: string;
  base_price: string;
  volatility: string;
  last_price: string | null;
  has_tick: boolean;
};

type QuoteRow = {
  id: string;
  symbol: string;
  name: string;
  base_price: string;
  last_price: string | null;
  prior_price: string | null;
};

// Adds one price per instrument for the current bucket. Concurrent callers are safe: the first insert wins.
export async function ensureMarketTick(nowMs: number = Date.now()): Promise<void> {
  const bucket = currentTickBucket(nowMs);
  const rows = (await sql`
    SELECT i.id, i.base_price, i.volatility,
           latest.price AS last_price,
           current_tick.instrument_id IS NOT NULL AS has_tick
    FROM market_instruments i
    LEFT JOIN LATERAL (
      SELECT price FROM market_price_ticks
      WHERE instrument_id = i.id
      ORDER BY tick_bucket DESC
      LIMIT 1
    ) latest ON true
    LEFT JOIN market_price_ticks current_tick
      ON current_tick.instrument_id = i.id AND current_tick.tick_bucket = ${bucket}
    WHERE i.active
  `) as TickSourceRow[];

  await Promise.all(
    rows
      .filter((row) => !row.has_tick)
      .map((row) => {
        const previous = Number(row.last_price ?? row.base_price);
        const price = nextPrice(previous, Number(row.volatility));
        return sql`
          INSERT INTO market_price_ticks (instrument_id, tick_bucket, price)
          VALUES (${row.id}, ${bucket}, ${price})
          ON CONFLICT (instrument_id, tick_bucket) DO NOTHING
        `;
      }),
  );
}

// Price is the latest tick. Prior close is the last tick before today in Toronto time.
export async function getQuotes(): Promise<MarketQuote[]> {
  await ensureMarketTick();

  const rows = (await sql`
    SELECT i.id, i.symbol, i.name, i.base_price,
           latest.price AS last_price,
           prior.price AS prior_price
    FROM market_instruments i
    LEFT JOIN LATERAL (
      SELECT price FROM market_price_ticks
      WHERE instrument_id = i.id
      ORDER BY tick_bucket DESC
      LIMIT 1
    ) latest ON true
    LEFT JOIN LATERAL (
      SELECT price FROM market_price_ticks
      WHERE instrument_id = i.id
        AND created_at < date_trunc('day', now() AT TIME ZONE 'America/Toronto') AT TIME ZONE 'America/Toronto'
      ORDER BY tick_bucket DESC
      LIMIT 1
    ) prior ON true
    WHERE i.active
    ORDER BY i.symbol
  `) as QuoteRow[];

  return rows.map((row) => {
    const price = Number(row.last_price ?? row.base_price);
    const priorClose = Number(row.prior_price ?? row.base_price);
    return {
      instrumentId: row.id,
      symbol: row.symbol,
      name: row.name,
      price,
      priorClose,
      changePercent: Math.round(((price - priorClose) / priorClose) * 10000) / 100,
    };
  });
}

export async function getQuote(symbol: string): Promise<MarketQuote | null> {
  const quotes = await getQuotes();
  return quotes.find((quote) => quote.symbol === symbol) ?? null;
}
