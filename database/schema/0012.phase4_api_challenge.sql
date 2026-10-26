-- Phase 4: api challenge support.
-- Each lab victim gets a random canary. A lab-only response that discloses it records a detection.
-- Idempotent. Existing victim rows keep a NULL canary and never trigger detection.

ALTER TABLE lab_victims ADD COLUMN IF NOT EXISTS canary VARCHAR(64);

CREATE TABLE IF NOT EXISTS lab_detections (
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id VARCHAR(64) NOT NULL REFERENCES lab_challenges(id) ON DELETE CASCADE,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id, challenge_id)
);
