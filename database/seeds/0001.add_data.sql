-- Seed for the fictional demo users only. Requires the schema migration to be applied first.
-- Re-running it resets these demo users (and their accounts/transactions) to the same state.
BEGIN;

DELETE FROM transfers
WHERE source_account_id IN (SELECT a.id FROM accounts a WHERE a.user_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444'))
   OR destination_account_id IN (SELECT a.id FROM accounts a WHERE a.user_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444'));

DELETE FROM users
WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444');

insert into users (id, email, password_hash, display_name, phone, preferred_language, marketing_emails)
values ('11111111-1111-1111-1111-111111111111', 'tinkerbell@fakebank.com', 'YjhjYTYxZjkzNzQxYzQyN2IxZWRkYWI4ZjY3OWU0NGY3ZjAzM2NiNWU1ZmI3YmY2YmRiZjg2MmYwYjRjNmI3NA==', 'metinkz', '111-222-3333', 'en-CA', true),
        ('22222222-2222-2222-2222-222222222222', 'petersaucepan@fakebank.com','YzY1ZTVmMDExNWY0MjU0YzNiMGEwMjZlYjk1ZTFiYzM5MzgzZGJiMGQ5YmRkMTZkYTBiMDA1MzQzNzMxYTM4Mg==', 'forpetessake', '222-111-3333', 'en-CA', true),
        ('33333333-3333-3333-3333-333333333333', 'hookhill444@fakebank.com', 'YTgxM2RhY2MwZGE1ODg0OWY3OWZhOTg5ZDE1ZWIwNzU3NWZhYjJkNmFjNWIxYzMyZTAwMDIyMDdiM2NhMjYwYw==', 'hooktopus', '333-222-3333', 'en-CA', true),
        ('44444444-4444-4444-4444-444444444444', 'feloniusgru@fakebank.com', 'ZDY4MTI0YjUzNjg0YmIzN2NhODY5ZmNiZDI0YWVmMzIyYWQ1NWFiMzcyNmUwYzhiNDViMzZlZTUyOTYwYTM5NA==', 'innocentbystander', '444-222-1111', 'en-CA', true);

INSERT INTO accounts (id, user_id, name, nickname, type, masked_number, currency, balance, available_balance, status)
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Everyday Chequing', 'Primary', 'chequing', '1234567', 'CAD', 4825.67, 4625.67, 'active'),
        ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'High Yield Savings', 'Emergency Fund', 'savings', '2345678', 'CAD', 15240.50, 15240.50, 'active'),
        ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'Visa Cashback', 'Travel', 'credit', '3456789', 'CAD', -1284.00, 8715.00, 'active'),
        ('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'Everyday Chequing', 'Primary', 'chequing', '2134567', 'CAD', 20.50, 20.50, 'active'),
        ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '33333333-3333-3333-3333-333333333333', 'Visa Cashback', 'YOLO', 'credit', '2143567', 'CAD', -32323.00, 32.00, 'active'),
        ('ffffffff-ffff-ffff-ffff-ffffffffffff', '33333333-3333-3333-3333-333333333333', 'Everyday Chequing', 'Primary', 'chequing', '2143657', 'CAD', 450.23, 450.23, 'active'),
        ('77777777-7777-4777-8777-777777777777', '33333333-3333-3333-3333-333333333333', 'High Yield Savings', 'Emergency Fund', 'savings', '2122567', 'CAD', 26.76, 26.76, 'active'),
        ('bbbbbbb2-bbbb-4bbb-8bbb-bbbbbbbbbbb2', '44444444-4444-4444-4444-444444444444', 'Everyday Chequing', 'Primary', 'chequing', '2133567', 'CAD', 32506.02, 32506.02, 'active'),
        ('aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '44444444-4444-4444-4444-444444444444', 'High Yield Savings', 'Emergency Fund', 'savings', '2133657', 'CAD', 15637482.99, 15637482.99, 'active'),
        ('99999999-9999-4999-8999-999999999999', '11111111-1111-1111-1111-111111111111', 'Visa Cashback', 'Miscellaneous', 'credit', '2144567', 'CAD', -935.00, 4000.00, 'active'),
        ('88888888-8888-4888-8888-888888888888', '44444444-4444-4444-4444-444444444444', 'Visa Cashback', 'Miscellaneous', 'credit', '2155567', 'CAD', -84.00, 10000.00, 'active');

INSERT INTO transactions (account_id, date, description, category, direction, amount, status, balance_after)
VALUES
  -- ===== User 1111 =====
  -- Everyday Chequing (aaaaaaaa) -> ends at 4825.67
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', now() - interval '3 days', 'Transfer to High Yield Savings',     'Transfers',     'debit',   500.00, 'posted', 2462.10),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', now() - interval '2 days', 'Loblaws Market — Queen St',          'Groceries',     'debit',    86.43, 'posted', 2375.67),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', now() - interval '1 day',  'Direct Deposit — Northwind Labs',    'Income',        'credit', 2450.00, 'posted', 4825.67),

  -- High Yield Savings (bbbbbbbb) -> ends at 15240.50
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', now() - interval '10 days', 'Monthly Interest',                  'Interest',      'credit',  38.12, 'posted', 14740.50),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', now() - interval '3 days',  'Transfer from Everyday Chequing',   'Transfers',     'credit', 500.00, 'posted', 15240.50),

  -- Visa Cashback (99999999) -> ends at -935.00
  ('99999999-9999-4999-8999-999999999999', now() - interval '9 days', 'Amazon.ca Marketplace',               'Shopping',      'debit',  412.75, 'posted',  -412.75),
  ('99999999-9999-4999-8999-999999999999', now() - interval '6 days', 'Shell — Lakeshore Blvd',              'Transportation','debit',   68.20, 'posted',  -480.95),
  ('99999999-9999-4999-8999-999999999999', now() - interval '4 days', 'Cineplex — Scotiabank Theatre',       'Entertainment', 'debit',   54.05, 'posted',  -535.00),
  ('99999999-9999-4999-8999-999999999999', now() - interval '2 days', 'Best Buy — Yorkdale',                 'Electronics',   'debit',  400.00, 'posted',  -935.00),

  -- ===== User 2222 =====
  -- Visa Cashback (cccccccc) -> ends at -1284.00
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', now() - interval '8 days', 'Air Canada',                          'Travel',        'debit',  842.00, 'posted',  -842.00),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', now() - interval '5 days', 'Hotel Booking — Montreal',            'Travel',        'debit',  392.00, 'posted', -1234.00),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', now() - interval '2 days', 'Presto — Fare Reload',                'Transportation','debit',   50.00, 'posted', -1284.00),

  -- Everyday Chequing (dddddddd) -> ends at 20.50
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', now() - interval '7 days', 'Rogers Wireless',                     'Utilities',     'debit',   65.00, 'posted',    92.85),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', now() - interval '5 days', 'Presto — Fare Reload',                'Transportation','debit',   40.00, 'posted',    52.85),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', now() - interval '4 days', 'Sephora — Eaton Centre',              'Toiletries',    'debit',   32.35, 'posted',    20.50),

  -- ===== User 3333 =====
  -- Visa Cashback "YOLO" (eeeeeeee) -> ends at -32323.00
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', now() - interval '12 days', 'Apple Store — Eaton Centre',        'Electronics',   'debit', 4299.00, 'posted',  -4299.00),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', now() - interval '9 days',  'WestJet Vacations',                 'Travel',        'debit',12480.00, 'posted', -16779.00),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', now() - interval '6 days',  'Holt Renfrew — Bloor St',           'Shopping',      'debit', 9544.00, 'posted', -26323.00),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', now() - interval '3 days',  'Birks — Yorkville',                 'Shopping',      'debit', 6000.00, 'posted', -32323.00),

  -- Everyday Chequing (ffffffff) -> ends at 450.23
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', now() - interval '5 days', 'Rent — Interac e-Transfer',           'Housing',       'debit', 1425.00, 'posted',   574.73),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', now() - interval '1 day',  'El Catrin — Distillery District',     'Dining',        'debit',  124.50, 'posted',   450.23),

  -- High Yield Savings (77777777) -> ends at 26.76
  ('77777777-7777-4777-8777-777777777777', now() - interval '2 days', 'Monthly Interest',                    'Interest',      'credit',   0.13, 'posted',    26.76),

  -- ===== User 4444 =====
  -- Everyday Chequing (bbbbbbb2) -> ends at 32506.02
  ('bbbbbbb2-bbbb-4bbb-8bbb-bbbbbbbbbbb2', now() - interval '5 days', 'Direct Deposit — Bayview Capital',   'Income',        'credit', 6200.00, 'posted', 32656.02),
  ('bbbbbbb2-bbbb-4bbb-8bbb-bbbbbbbbbbb2', now() - interval '3 days', 'Transfer to High Yield Savings',      'Transfers',     'debit',   150.00, 'posted', 32506.02),

  -- High Yield Savings (aaaaaaa1) -> ends at 15637482.99
  ('aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1', now() - interval '8 days', 'Monthly Interest',                    'Interest',      'credit', 19531.85, 'posted', 15637332.99),
  ('aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1', now() - interval '3 days', 'Transfer from Everyday Chequing',     'Transfers',     'credit',   150.00, 'posted', 15637482.99),

  -- Visa Cashback (88888888) -> ends at -84.00
  ('88888888-8888-4888-8888-888888888888', now() - interval '4 days', 'Spotify',                              'Entertainment', 'debit',   11.99, 'posted',   -11.99),
  ('88888888-8888-4888-8888-888888888888', now() - interval '2 days', 'Metro — Bloor St',                     'Groceries',     'debit',   72.01, 'posted',   -84.00);

-- Sanity check: should return zero rows (latest balance_after must equal accounts.balance)
-- SELECT a.id, a.balance, t.balance_after
-- FROM accounts a
-- JOIN LATERAL (
--   SELECT balance_after FROM transactions
--   WHERE account_id = a.id ORDER BY date DESC LIMIT 1
-- ) t ON true
-- WHERE a.balance <> t.balance_after;