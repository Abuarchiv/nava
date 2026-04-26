-- ============================================================
-- Nava — Seed Data (local dev only)
-- ============================================================

-- ============================================================
-- Test Users (auth.users)
-- ============================================================

INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, created_at, updated_at, aud, role
) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'abu@test.nava', crypt('password123', gen_salt('bf')),
    NOW(), '{"full_name":"Abu Test"}', NOW(), NOW(), 'authenticated', 'authenticated'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'lisa@test.nava', crypt('password123', gen_salt('bf')),
    NOW(), '{"full_name":"Lisa Müller"}', NOW(), NOW(), 'authenticated', 'authenticated'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'mia@test.nava', crypt('password123', gen_salt('bf')),
    NOW(), '{"full_name":"Mia Schmidt"}', NOW(), NOW(), 'authenticated', 'authenticated'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Profiles
-- ============================================================

INSERT INTO public.profiles (id, email, display_name, phone) VALUES
  ('00000000-0000-0000-0000-000000000001', 'abu@test.nava',  'Abu',  '+49 151 11110001'),
  ('00000000-0000-0000-0000-000000000002', 'lisa@test.nava', 'Lisa', '+49 151 11110002'),
  ('00000000-0000-0000-0000-000000000003', 'mia@test.nava',  'Mia',  '+49 151 11110003')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- WG
-- ============================================================

INSERT INTO public.wgs (id, name, address, description, created_by) VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    'Sonnenstraße 12',
    'Sonnenstraße 12, 80331 München',
    'Unsere gemütliche 3er-WG im Herzen der Stadt.',
    '00000000-0000-0000-0000-000000000001'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- WG Members
-- ============================================================

INSERT INTO public.wg_members (id, wg_id, user_id, role) VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'admin'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'member'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'member')
ON CONFLICT (wg_id, user_id) DO NOTHING;

-- ============================================================
-- Expense Categories (WG-specific extras)
-- ============================================================

INSERT INTO public.expense_categories (id, wg_id, name, icon, color, is_default) VALUES
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Internet',   '📡', '#00BCD4', FALSE),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Reinigung',  '🧹', '#8BC34A', FALSE)
ON CONFLICT DO NOTHING;

-- Get global category IDs for expenses (fetched by name)
-- We'll use a DO block so we can reuse UUIDs cleanly

DO $$
DECLARE
  cat_lebensmittel UUID;
  cat_haushalt     UUID;
  cat_strom        UUID;
  cat_miete        UUID;
  cat_freizeit     UUID;
  cat_sonstiges    UUID;
  wg_id CONSTANT UUID := '10000000-0000-0000-0000-000000000001';
  abu   CONSTANT UUID := '00000000-0000-0000-0000-000000000001';
  lisa  CONSTANT UUID := '00000000-0000-0000-0000-000000000002';
  mia   CONSTANT UUID := '00000000-0000-0000-0000-000000000003';
  e1 UUID := '40000000-0000-0000-0000-000000000001';
  e2 UUID := '40000000-0000-0000-0000-000000000002';
  e3 UUID := '40000000-0000-0000-0000-000000000003';
  e4 UUID := '40000000-0000-0000-0000-000000000004';
  e5 UUID := '40000000-0000-0000-0000-000000000005';
BEGIN
  SELECT id INTO cat_lebensmittel FROM public.expense_categories WHERE name = 'Lebensmittel' AND wg_id IS NULL LIMIT 1;
  SELECT id INTO cat_haushalt     FROM public.expense_categories WHERE name = 'Haushalt'     AND wg_id IS NULL LIMIT 1;
  SELECT id INTO cat_strom        FROM public.expense_categories WHERE name = 'Strom & Wasser' AND wg_id IS NULL LIMIT 1;
  SELECT id INTO cat_miete        FROM public.expense_categories WHERE name = 'Miete'        AND wg_id IS NULL LIMIT 1;
  SELECT id INTO cat_freizeit     FROM public.expense_categories WHERE name = 'Freizeit'     AND wg_id IS NULL LIMIT 1;
  SELECT id INTO cat_sonstiges    FROM public.expense_categories WHERE name = 'Sonstiges'    AND wg_id IS NULL LIMIT 1;

  -- ============================================================
  -- Expenses
  -- ============================================================

  INSERT INTO public.expenses (id, wg_id, paid_by, category_id, title, amount, date) VALUES
    (e1, wg_id, abu,  cat_lebensmittel, 'REWE Wocheneinkauf',       87.45, CURRENT_DATE - 6),
    (e2, wg_id, lisa, cat_haushalt,     'Putzmittel & Schwämme',     23.80, CURRENT_DATE - 4),
    (e3, wg_id, abu,  cat_strom,        'Stromrechnung März',       145.00, CURRENT_DATE - 3),
    (e4, wg_id, mia,  cat_freizeit,     'Netflix (geteiltes Abo)',   17.99, CURRENT_DATE - 1),
    (e5, wg_id, lisa, cat_lebensmittel, 'Penny Wochenmarkt',         54.30, CURRENT_DATE)
  ON CONFLICT (id) DO NOTHING;

  -- ============================================================
  -- Expense Splits (3-way equal split)
  -- ============================================================

  -- e1: 87.45 / 3 = 29.15
  INSERT INTO public.expense_splits (expense_id, user_id, amount) VALUES
    (e1, abu,  29.15), (e1, lisa, 29.15), (e1, mia, 29.15)
  ON CONFLICT (expense_id, user_id) DO NOTHING;

  -- e2: 23.80 / 3 = 7.93 + 7.94 + 7.93
  INSERT INTO public.expense_splits (expense_id, user_id, amount) VALUES
    (e2, abu,  7.93), (e2, lisa, 7.94), (e2, mia, 7.93)
  ON CONFLICT (expense_id, user_id) DO NOTHING;

  -- e3: 145.00 / 3 = 48.33 + 48.34 + 48.33
  INSERT INTO public.expense_splits (expense_id, user_id, amount) VALUES
    (e3, abu,  48.33), (e3, lisa, 48.34), (e3, mia, 48.33)
  ON CONFLICT (expense_id, user_id) DO NOTHING;

  -- e4: 17.99 / 3 = 6.00 + 5.99 + 6.00
  INSERT INTO public.expense_splits (expense_id, user_id, amount) VALUES
    (e4, abu,  6.00), (e4, lisa, 5.99), (e4, mia, 6.00)
  ON CONFLICT (expense_id, user_id) DO NOTHING;

  -- e5: 54.30 / 3 = 18.10
  INSERT INTO public.expense_splits (expense_id, user_id, amount) VALUES
    (e5, abu, 18.10), (e5, lisa, 18.10), (e5, mia, 18.10)
  ON CONFLICT (expense_id, user_id) DO NOTHING;

  -- ============================================================
  -- Chores
  -- ============================================================

  INSERT INTO public.chores (id, wg_id, title, description, frequency, points, current_assignee, created_by) VALUES
    (
      '50000000-0000-0000-0000-000000000001',
      wg_id, 'Küche putzen',
      'Herd, Arbeitsflächen, Boden wischen',
      'weekly', 3, abu, abu
    ),
    (
      '50000000-0000-0000-0000-000000000002',
      wg_id, 'Bad schrubben',
      'WC, Waschbecken, Dusche, Boden',
      'weekly', 3, lisa, abu
    ),
    (
      '50000000-0000-0000-0000-000000000003',
      wg_id, 'Staubsaugen',
      'Alle Zimmer und Flur',
      'biweekly', 2, mia, abu
    )
  ON CONFLICT (id) DO NOTHING;

  -- Chore assignments (current rotation)
  INSERT INTO public.chore_assignments (chore_id, user_id, rotation_pos, due_date) VALUES
    ('50000000-0000-0000-0000-000000000001', abu,  0, CURRENT_DATE + 2),
    ('50000000-0000-0000-0000-000000000002', lisa, 0, CURRENT_DATE + 3),
    ('50000000-0000-0000-0000-000000000003', mia,  0, CURRENT_DATE + 7)
  ON CONFLICT DO NOTHING;

  -- ============================================================
  -- Shopping Items
  -- ============================================================

  INSERT INTO public.shopping_items (id, wg_id, added_by, name, quantity, note, status, category) VALUES
    ('60000000-0000-0000-0000-000000000001', wg_id, abu,  'Milch',              '2 Liter',  NULL,                  'pending',   'Lebensmittel'),
    ('60000000-0000-0000-0000-000000000002', wg_id, abu,  'Brot',               '1 Laib',   'Vollkorn bitte',      'pending',   'Lebensmittel'),
    ('60000000-0000-0000-0000-000000000003', wg_id, lisa, 'Toilettenpapier',    '3er Pack', NULL,                  'pending',   'Haushalt'),
    ('60000000-0000-0000-0000-000000000004', wg_id, lisa, 'Spülmittel',         '1 Flasche','am besten Fairy',     'pending',   'Haushalt'),
    ('60000000-0000-0000-0000-000000000005', wg_id, mia,  'Kaffee',             '500g',     'Arabica',             'pending',   'Lebensmittel'),
    ('60000000-0000-0000-0000-000000000006', wg_id, mia,  'Müllbeutel 60L',     '1 Rolle',  NULL,                  'pending',   'Haushalt'),
    ('60000000-0000-0000-0000-000000000007', wg_id, abu,  'Pasta',              '3 Pack',   NULL,                  'purchased', 'Lebensmittel'),
    ('60000000-0000-0000-0000-000000000008', wg_id, lisa, 'Waschmittel',        '1 Pack',   'Color-Waschmittel',   'purchased', 'Haushalt'),
    ('60000000-0000-0000-0000-000000000009', wg_id, mia,  'Olivenöl',           '1 Flasche',NULL,                  'purchased', 'Lebensmittel'),
    ('60000000-0000-0000-0000-000000000010', wg_id, abu,  'Duschgel',           '2 Stück',  'Palmolive oder ähnl.','archived',  'Hygiene')
  ON CONFLICT (id) DO NOTHING;

  -- Mark purchased items
  UPDATE public.shopping_items
  SET purchased_by = lisa, purchased_at = NOW() - INTERVAL '1 day'
  WHERE id IN (
    '60000000-0000-0000-0000-000000000007',
    '60000000-0000-0000-0000-000000000008',
    '60000000-0000-0000-0000-000000000009'
  );

  -- ============================================================
  -- Announcements
  -- ============================================================

  INSERT INTO public.announcements (id, wg_id, author_id, title, body, pinned) VALUES
    (
      '70000000-0000-0000-0000-000000000001',
      wg_id, abu,
      'WG-Abend nächsten Freitag!',
      'Hey Leute, ich schlage vor wir kochen zusammen am Freitag. Ich mache Pasta. Wer bringt was mit? Bitte kurz melden.',
      TRUE
    ),
    (
      '70000000-0000-0000-0000-000000000002',
      wg_id, lisa,
      'Handwerker kommt am Mittwoch',
      'Der Handwerker kommt am Mittwoch zwischen 10 und 12 Uhr wegen dem tropfenden Wasserhahn im Bad. Falls jemand zuhause sein kann wäre super, sonst lasse ich ihn rein.',
      FALSE
    )
  ON CONFLICT (id) DO NOTHING;

END $$;
