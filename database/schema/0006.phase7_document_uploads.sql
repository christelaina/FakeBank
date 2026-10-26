-- Phase 7: document uploads keep the file content (base64). Idempotent. Requires schema 0001.
ALTER TABLE documents ADD COLUMN IF NOT EXISTS content_base64 TEXT;
