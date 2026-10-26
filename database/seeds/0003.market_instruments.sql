-- Simulated instruments for the live market. Requires schema 0004. Repeatable: upserts by symbol.
INSERT INTO market_instruments (symbol, name, base_price, volatility) VALUES
  ('MGRW', 'Maple Growth ETF', 68.4000, 0.0080),
  ('NDVF', 'Northern Dividend Fund', 72.1500, 0.0040),
  ('CBDX', 'Canadian Bond Index', 19.2600, 0.0015),
  ('TCIX', 'Canadian Tech Index', 41.8000, 0.0120),
  ('GLDC', 'Gold Shares Trust', 27.3500, 0.0100)
ON CONFLICT (symbol) DO UPDATE
SET name = EXCLUDED.name,
    base_price = EXCLUDED.base_price,
    volatility = EXCLUDED.volatility,
    active = true;

ALTER TABLE holdings VALIDATE CONSTRAINT holdings_symbol_fkey;
