-- Sign-in log stores only who signed in and when. Idempotent. Requires schema 0001 (security_events).
ALTER TABLE security_events
  DROP COLUMN IF EXISTS device,
  DROP COLUMN IF EXISTS location;
