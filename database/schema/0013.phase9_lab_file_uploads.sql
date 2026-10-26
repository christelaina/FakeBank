-- Phase 9: file challenge support. Lab-only. Idempotent. Requires schema 0011 (users, lab_challenges).

CREATE TABLE IF NOT EXISTS lab_file_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name VARCHAR(120) NOT NULL,
  mime_type VARCHAR(64) NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE lab_file_uploads
  ADD COLUMN IF NOT EXISTS purpose VARCHAR(32) NOT NULL DEFAULT 'document'
  CHECK (purpose IN ('document', 'profile_picture'));

CREATE INDEX IF NOT EXISTS lab_file_uploads_student_idx
  ON lab_file_uploads (student_id, created_at DESC);
