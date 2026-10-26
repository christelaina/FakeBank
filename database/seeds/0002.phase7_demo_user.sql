-- Phase 7 demo data for the seeded users. Requires schema 0004 and seed 0003. Re-running resets user 1111's
-- profile, security, document, and investment rows; accounts and transactions are left alone.
-- Addresses for users 2222, 3333, and 4444 are fictional and idempotent.
BEGIN;

UPDATE users SET address_line1 = '48 Cedar Ridge Drive', city = 'Mississauga', province = 'ON', postal_code = 'L5B 3A1', updated_at = now()
WHERE id = '22222222-2222-2222-2222-222222222222';

UPDATE users SET address_line1 = '7 Harbourview Crescent', city = 'Hamilton', province = 'ON', postal_code = 'L8P 4R5', updated_at = now()
WHERE id = '33333333-3333-3333-3333-333333333333';

UPDATE users SET address_line1 = '1313 Mockingbird Lane', city = 'Calgary', province = 'AB', postal_code = 'T2P 1J9', updated_at = now()
WHERE id = '44444444-4444-4444-4444-444444444444';

UPDATE users
SET display_name = 'Jordan Ellis',
    phone = '+1 (416) 555-0148',
    address_line1 = '220 King Street West',
    city = 'Toronto',
    province = 'ON',
    postal_code = 'M5H 1K4',
    preferred_language = 'en-CA',
    marketing_emails = false,
    two_factor_enabled = true,
    updated_at = now()
WHERE id = '11111111-1111-1111-1111-111111111111';

DELETE FROM profile_changes WHERE user_id = '11111111-1111-1111-1111-111111111111';
INSERT INTO profile_changes (user_id, field_name, summary, changed_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'phone', 'Updated mobile number', '2026-09-28 13:20:00+00'),
  ('11111111-1111-1111-1111-111111111111', 'preferredLanguage', 'Preferred language set to English (Canada)', '2026-08-12 10:05:00+00'),
  ('11111111-1111-1111-1111-111111111111', 'twoFactorEnabled', 'Enabled authenticator app for sign-in', '2026-07-01 09:00:00+00');

DELETE FROM security_events WHERE user_id = '11111111-1111-1111-1111-111111111111' AND event_type = 'sign_in';
INSERT INTO security_events (user_id, event_type, success, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'sign_in', true, '2026-10-18 21:55:00+00'),
  ('11111111-1111-1111-1111-111111111111', 'sign_in', true, '2026-10-16 07:12:00+00');

DELETE FROM security_notifications WHERE user_id = '11111111-1111-1111-1111-111111111111';
INSERT INTO security_notifications (user_id, title, body, severity, read_flag, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Password last reviewed', 'Your password was last changed more than 90 days ago. Consider updating it.', 'info', true, '2026-10-01 09:00:00+00');

DELETE FROM documents WHERE user_id = '11111111-1111-1111-1111-111111111111';
INSERT INTO documents (user_id, name, category, mime_type, size_bytes, uploaded_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'October 2026 Statement — Chequing.pdf', 'Statements', 'application/pdf', 245760, '2026-10-05 08:00:00+00'),
  ('11111111-1111-1111-1111-111111111111', 'Tax Receipt 2025 — Interest.pdf', 'Tax', 'application/pdf', 128450, '2026-02-18 12:30:00+00'),
  ('11111111-1111-1111-1111-111111111111', 'Account Agreement.pdf', 'Agreements', 'application/pdf', 512000, '2025-11-02 15:45:00+00');

DELETE FROM holdings WHERE user_id = '11111111-1111-1111-1111-111111111111';
INSERT INTO holdings (user_id, symbol, name, quantity) VALUES
  ('11111111-1111-1111-1111-111111111111', 'MGRW', 'Maple Growth ETF', 120.5),
  ('11111111-1111-1111-1111-111111111111', 'NDVF', 'Northern Dividend Fund', 85.0),
  ('11111111-1111-1111-1111-111111111111', 'CBDX', 'Canadian Bond Index', 210.0);

DELETE FROM portfolio_history WHERE user_id = '11111111-1111-1111-1111-111111111111';
INSERT INTO portfolio_history (user_id, snapshot_date, total_value, day_change_percent) VALUES
  ('11111111-1111-1111-1111-111111111111', '2026-04-01', 16200.00, NULL),
  ('11111111-1111-1111-1111-111111111111', '2026-05-01', 16540.00, NULL),
  ('11111111-1111-1111-1111-111111111111', '2026-06-01', 16890.00, NULL),
  ('11111111-1111-1111-1111-111111111111', '2026-07-01', 17110.00, NULL),
  ('11111111-1111-1111-1111-111111111111', '2026-08-01', 17480.00, NULL),
  ('11111111-1111-1111-1111-111111111111', '2026-09-01', 17920.00, NULL),
  ('11111111-1111-1111-1111-111111111111', '2026-10-01', 18420.75, 0.42);

DELETE FROM investment_transactions WHERE user_id = '11111111-1111-1111-1111-111111111111';
INSERT INTO investment_transactions (user_id, description, category, direction, amount, status, occurred_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Buy Maple Growth ETF (MGRW)', 'Investments', 'debit', 250.00, 'posted', '2026-10-11 16:48:00+00'),
  ('11111111-1111-1111-1111-111111111111', 'Dividend — Northern Dividend Fund', 'Investments', 'credit', 42.15, 'posted', '2026-09-20 15:00:00+00'),
  ('11111111-1111-1111-1111-111111111111', 'Buy Canadian Bond Index (CBDX)', 'Investments', 'debit', 500.00, 'posted', '2026-08-15 14:30:00+00');

COMMIT;
