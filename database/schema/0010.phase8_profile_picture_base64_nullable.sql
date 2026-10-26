-- Phase 8: profile pictures are stored in Blob; keep the legacy base64 column but allow NULL for new rows.
ALTER TABLE profile_pictures ALTER COLUMN content_base64 DROP NOT NULL;
