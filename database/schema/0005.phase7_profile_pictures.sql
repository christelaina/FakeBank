-- Phase 7: profile picture storage. Idempotent. Requires schema 0003.
CREATE TABLE IF NOT EXISTS profile_pictures (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  mime_type VARCHAR(30) NOT NULL CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/webp', 'image/gif')),
  size_bytes INTEGER NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 2097152),
  content_base64 TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
