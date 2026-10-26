-- Phase 2: lab foundation. Idempotent. Requires schema 0001 (users) and 0007 (auth_sessions).

ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'student';
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('student', 'admin'));

CREATE TABLE IF NOT EXISTS lab_challenges (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  points INTEGER NOT NULL CHECK (points > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lab_solves (
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id VARCHAR(64) NOT NULL REFERENCES lab_challenges(id) ON DELETE CASCADE,
  solved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id, challenge_id)
);

CREATE TABLE IF NOT EXISTS lab_points (
  student_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lab_victims (
  student_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  victim_user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE
);

-- Deleting a student also deletes that student's hidden victim user.
CREATE OR REPLACE FUNCTION lab_delete_victims() RETURNS trigger AS $$
BEGIN
  DELETE FROM users WHERE id IN (SELECT victim_user_id FROM lab_victims WHERE student_id = OLD.id);
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_delete_lab_victims ON users;
CREATE TRIGGER users_delete_lab_victims
  BEFORE DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION lab_delete_victims();
