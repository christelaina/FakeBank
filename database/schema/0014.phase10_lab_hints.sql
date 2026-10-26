-- Phase 10: paid walkthrough hints. Lab-only. Idempotent. Requires schema 0011 (users, lab_challenges).

CREATE TABLE IF NOT EXISTS lab_hint_purchases (
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id VARCHAR(64) NOT NULL REFERENCES lab_challenges(id) ON DELETE CASCADE,
  cost INTEGER NOT NULL CHECK (cost > 0),
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id, challenge_id)
);
