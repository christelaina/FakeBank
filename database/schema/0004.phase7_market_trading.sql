-- Simulated market prices and trades. Idempotent. Requires schema 0003. Seed 0003 must run before seed 0002.
CREATE TABLE IF NOT EXISTS market_instruments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  base_price NUMERIC(12,4) NOT NULL CHECK (base_price > 0),
  volatility NUMERIC(6,4) NOT NULL CHECK (volatility > 0 AND volatility < 1),
  active BOOLEAN NOT NULL DEFAULT true
);

-- One row per instrument per 5-minute bucket (floor(epoch / 300)).
CREATE TABLE IF NOT EXISTS market_price_ticks (
  instrument_id UUID NOT NULL REFERENCES market_instruments(id) ON DELETE CASCADE,
  tick_bucket BIGINT NOT NULL,
  price NUMERIC(12,4) NOT NULL CHECK (price > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (instrument_id, tick_bucket)
);

CREATE INDEX IF NOT EXISTS idx_market_price_ticks_created ON market_price_ticks(instrument_id, created_at DESC);

-- Prices now come from the market, so the stored copies on holdings are removed.
ALTER TABLE holdings
  DROP COLUMN IF EXISTS market_price,
  DROP COLUMN IF EXISTS market_value,
  DROP COLUMN IF EXISTS day_change_percent;

-- NOT VALID so existing rows do not block the migration; seed 0003 validates it.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'holdings_symbol_fkey') THEN
    ALTER TABLE holdings
      ADD CONSTRAINT holdings_symbol_fkey FOREIGN KEY (symbol) REFERENCES market_instruments(symbol) NOT VALID;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS market_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id),
  symbol VARCHAR(20) NOT NULL REFERENCES market_instruments(symbol),
  side VARCHAR(4) NOT NULL CHECK (side IN ('buy', 'sell')),
  quantity NUMERIC(18,6) NOT NULL CHECK (quantity > 0),
  price NUMERIC(12,4) NOT NULL CHECK (price > 0),
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  idempotency_key VARCHAR(64) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_market_trades_user_id ON market_trades(user_id);
