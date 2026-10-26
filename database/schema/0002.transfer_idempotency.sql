-- Lets a retried transfer request return the original transfer instead of creating another.
ALTER TABLE transfers ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(64);
CREATE UNIQUE INDEX IF NOT EXISTS idx_transfers_idempotency_key ON transfers(idempotency_key);
