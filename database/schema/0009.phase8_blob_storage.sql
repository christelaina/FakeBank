-- Phase 8: file bytes move to Vercel Blob; Postgres keeps metadata and the blob pathname. Idempotent. Requires schemas 0001, 0005, 0006.
ALTER TABLE documents ADD COLUMN IF NOT EXISTS blob_pathname TEXT;
ALTER TABLE profile_pictures ADD COLUMN IF NOT EXISTS blob_pathname TEXT;
