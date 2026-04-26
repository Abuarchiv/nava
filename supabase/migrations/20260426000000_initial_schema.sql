-- ============================================================
-- Nava — Initial Schema
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- Enums
-- ============================================================

CREATE TYPE wg_member_role AS ENUM ('admin', 'member');
CREATE TYPE chore_frequency AS ENUM ('daily', 'weekly', 'biweekly', 'monthly');
CREATE TYPE shopping_status AS ENUM ('pending', 'purchased', 'archived');

-- ============================================================
-- Helper: updated_at trigger function
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Tables
-- ============================================================

-- Profiles (mirrors auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name   TEXT NOT NULL DEFAULT '',
  avatar_url     TEXT,
  phone          TEXT,
  email          TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT avatar_url_length   CHECK (avatar_url IS NULL OR char_length(avatar_url) <= 500),
  CONSTRAINT phone_length        CHECK (phone IS NULL OR char_length(phone) <= 20),
  CONSTRAINT display_name_length CHECK (char_length(display_name) <= 100)
);

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- WGs
CREATE TABLE IF NOT EXISTS public.wgs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  address     TEXT,
  description TEXT,
  avatar_url  TEXT,
  created_by  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT wg_name_length CHECK (char_length(name) <= 100)
);

CREATE TRIGGER set_wgs_updated_at
  BEFORE UPDATE ON public.wgs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- WG Members
CREATE TABLE IF NOT EXISTS public.wg_members (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wg_id      UUID NOT NULL REFERENCES public.wgs(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role       wg_member_role NOT NULL DEFAULT 'member',
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT wg_members_unique UNIQUE (wg_id, user_id)
);

CREATE INDEX idx_wg_members_wg_id   ON public.wg_members(wg_id);
CREATE INDEX idx_wg_members_user_id ON public.wg_members(user_id);

-- Invite Links
CREATE TABLE IF NOT EXISTS public.invite_links (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wg_id      UUID NOT NULL REFERENCES public.wgs(id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ,
  max_uses   INT,
  use_count  INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invite_links_token ON public.invite_links(token);
CREATE INDEX idx_invite_links_wg_id ON public.invite_links(wg_id);

-- Expense Categories
CREATE TABLE IF NOT EXISTS public.expense_categories (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wg_id      UUID REFERENCES public.wgs(id) ON DELETE CASCADE,  -- NULL = global default
  name       TEXT NOT NULL,
  icon       TEXT,
  color      TEXT,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_expense_categories_wg_id ON public.expense_categories(wg_id);

-- Seed default categories (global)
INSERT INTO public.expense_categories (id, wg_id, name, icon, color, is_default) VALUES
  (uuid_generate_v4(), NULL, 'Lebensmittel',  '🛒', '#4CAF50', TRUE),
  (uuid_generate_v4(), NULL, 'Haushalt',      '🏠', '#2196F3', TRUE),
  (uuid_generate_v4(), NULL, 'Strom & Wasser','⚡', '#FF9800', TRUE),
  (uuid_generate_v4(), NULL, 'Miete',         '🏢', '#9C27B0', TRUE),
  (uuid_generate_v4(), NULL, 'Freizeit',      '🎉', '#F44336', TRUE),
  (uuid_generate_v4(), NULL, 'Sonstiges',     '📦', '#607D8B', TRUE);

-- Expenses
CREATE TABLE IF NOT EXISTS public.expenses (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wg_id       UUID NOT NULL REFERENCES public.wgs(id) ON DELETE CASCADE,
  paid_by     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  category_id UUID REFERENCES public.expense_categories(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  description TEXT,
  amount      NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  currency    TEXT NOT NULL DEFAULT 'EUR',
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT title_length CHECK (char_length(title) <= 200)
);

CREATE INDEX idx_expenses_wg_id   ON public.expenses(wg_id);
CREATE INDEX idx_expenses_paid_by ON public.expenses(paid_by);
CREATE INDEX idx_expenses_date    ON public.expenses(date DESC);

CREATE TRIGGER set_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Expense Splits
CREATE TABLE IF NOT EXISTS public.expense_splits (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_id  UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount      NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  is_settled  BOOLEAN NOT NULL DEFAULT FALSE,
  settled_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT expense_splits_unique UNIQUE (expense_id, user_id)
);

CREATE INDEX idx_expense_splits_expense_id ON public.expense_splits(expense_id);
CREATE INDEX idx_expense_splits_user_id    ON public.expense_splits(user_id);

-- Settlements
CREATE TABLE IF NOT EXISTS public.settlements (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wg_id        UUID NOT NULL REFERENCES public.wgs(id) ON DELETE CASCADE,
  payer_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  receiver_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  amount       NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  currency     TEXT NOT NULL DEFAULT 'EUR',
  note         TEXT,
  settled_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT settlements_no_self_pay CHECK (payer_id <> receiver_id)
);

CREATE INDEX idx_settlements_wg_id      ON public.settlements(wg_id);
CREATE INDEX idx_settlements_payer_id   ON public.settlements(payer_id);
CREATE INDEX idx_settlements_receiver_id ON public.settlements(receiver_id);

-- Chores
CREATE TABLE IF NOT EXISTS public.chores (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wg_id            UUID NOT NULL REFERENCES public.wgs(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  description      TEXT,
  frequency        chore_frequency NOT NULL DEFAULT 'weekly',
  points           INT NOT NULL DEFAULT 1 CHECK (points >= 0),
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  current_assignee UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chore_title_length CHECK (char_length(title) <= 200)
);

CREATE INDEX idx_chores_wg_id ON public.chores(wg_id);

CREATE TRIGGER set_chores_updated_at
  BEFORE UPDATE ON public.chores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Chore Assignments (rotation history)
CREATE TABLE IF NOT EXISTS public.chore_assignments (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chore_id     UUID NOT NULL REFERENCES public.chores(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date     DATE,
  rotation_pos INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_chore_assignments_chore_id ON public.chore_assignments(chore_id);
CREATE INDEX idx_chore_assignments_user_id  ON public.chore_assignments(user_id);

-- Chore Completions
CREATE TABLE IF NOT EXISTS public.chore_completions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chore_id     UUID NOT NULL REFERENCES public.chores(id) ON DELETE CASCADE,
  completed_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note         TEXT,
  photo_url    TEXT
);

CREATE INDEX idx_chore_completions_chore_id ON public.chore_completions(chore_id);
CREATE INDEX idx_chore_completions_user_id  ON public.chore_completions(completed_by);

-- Shopping Items
CREATE TABLE IF NOT EXISTS public.shopping_items (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wg_id        UUID NOT NULL REFERENCES public.wgs(id) ON DELETE CASCADE,
  added_by     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  purchased_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name         TEXT NOT NULL,
  quantity     TEXT,
  note         TEXT,
  status       shopping_status NOT NULL DEFAULT 'pending',
  category     TEXT,
  purchased_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT shopping_item_name_length CHECK (char_length(name) <= 200)
);

CREATE INDEX idx_shopping_items_wg_id  ON public.shopping_items(wg_id);
CREATE INDEX idx_shopping_items_status ON public.shopping_items(status);

CREATE TRIGGER set_shopping_items_updated_at
  BEFORE UPDATE ON public.shopping_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wg_id       UUID NOT NULL REFERENCES public.wgs(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  pinned      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT announcement_title_length CHECK (char_length(title) <= 200)
);

CREATE INDEX idx_announcements_wg_id ON public.announcements(wg_id);
CREATE INDEX idx_announcements_pinned ON public.announcements(pinned) WHERE pinned = TRUE;

CREATE TRIGGER set_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Push Tokens
CREATE TABLE IF NOT EXISTS public.push_tokens (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE,
  platform   TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_push_tokens_user_id ON public.push_tokens(user_id);

-- Notification Preferences
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  wg_id                 UUID REFERENCES public.wgs(id) ON DELETE CASCADE,  -- NULL = global
  new_expense           BOOLEAN NOT NULL DEFAULT TRUE,
  expense_settled       BOOLEAN NOT NULL DEFAULT TRUE,
  chore_reminder        BOOLEAN NOT NULL DEFAULT TRUE,
  shopping_purchased    BOOLEAN NOT NULL DEFAULT TRUE,
  new_announcement      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT notification_prefs_unique UNIQUE (user_id, wg_id)
);

CREATE TRIGGER set_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Functions
-- ============================================================

-- Balance calculation per WG
CREATE OR REPLACE FUNCTION calculate_wg_balances(p_wg_id UUID)
RETURNS TABLE (
  user_id     UUID,
  display_name TEXT,
  total_paid  NUMERIC,
  total_owed  NUMERIC,
  balance     NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH paid AS (
    SELECT e.paid_by AS uid, COALESCE(SUM(e.amount), 0) AS total
    FROM public.expenses e
    WHERE e.wg_id = p_wg_id
    GROUP BY e.paid_by
  ),
  owed AS (
    SELECT es.user_id AS uid, COALESCE(SUM(es.amount), 0) AS total
    FROM public.expense_splits es
    JOIN public.expenses e ON e.id = es.expense_id
    WHERE e.wg_id = p_wg_id AND es.is_settled = FALSE
    GROUP BY es.user_id
  ),
  settled_out AS (
    SELECT s.payer_id AS uid, COALESCE(SUM(s.amount), 0) AS total
    FROM public.settlements s
    WHERE s.wg_id = p_wg_id
    GROUP BY s.payer_id
  ),
  settled_in AS (
    SELECT s.receiver_id AS uid, COALESCE(SUM(s.amount), 0) AS total
    FROM public.settlements s
    WHERE s.wg_id = p_wg_id
    GROUP BY s.receiver_id
  )
  SELECT
    m.user_id,
    p.display_name,
    COALESCE(pd.total, 0)  AS total_paid,
    COALESCE(ow.total, 0)  AS total_owed,
    COALESCE(pd.total, 0)
      - COALESCE(ow.total, 0)
      + COALESCE(si.total, 0)
      - COALESCE(so.total, 0) AS balance
  FROM public.wg_members m
  JOIN public.profiles p        ON p.id = m.user_id
  LEFT JOIN paid pd              ON pd.uid = m.user_id
  LEFT JOIN owed ow              ON ow.uid = m.user_id
  LEFT JOIN settled_out so       ON so.uid = m.user_id
  LEFT JOIN settled_in  si       ON si.uid = m.user_id
  WHERE m.wg_id = p_wg_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get next chore assignee (round-robin)
CREATE OR REPLACE FUNCTION get_next_chore_assignee(p_chore_id UUID)
RETURNS UUID AS $$
DECLARE
  v_wg_id UUID;
  v_current_pos INT;
  v_member_count INT;
  v_next_user UUID;
BEGIN
  SELECT c.wg_id, COALESCE(MAX(ca.rotation_pos), -1)
    INTO v_wg_id, v_current_pos
  FROM public.chores c
  LEFT JOIN public.chore_assignments ca ON ca.chore_id = c.id
  WHERE c.id = p_chore_id
  GROUP BY c.wg_id;

  SELECT COUNT(*) INTO v_member_count
  FROM public.wg_members
  WHERE wg_id = v_wg_id;

  IF v_member_count = 0 THEN RETURN NULL; END IF;

  SELECT user_id INTO v_next_user
  FROM public.wg_members
  WHERE wg_id = v_wg_id
  ORDER BY joined_at
  OFFSET ((v_current_pos + 1) % v_member_count)
  LIMIT 1;

  RETURN v_next_user;
END;
$$ LANGUAGE plpgsql STABLE;

-- Rotate chore to next assignee
CREATE OR REPLACE FUNCTION rotate_chore_assignment(p_chore_id UUID)
RETURNS UUID AS $$
DECLARE
  v_next_user UUID;
  v_next_pos  INT;
BEGIN
  v_next_user := get_next_chore_assignee(p_chore_id);

  SELECT COALESCE(MAX(rotation_pos), -1) + 1
    INTO v_next_pos
  FROM public.chore_assignments
  WHERE chore_id = p_chore_id;

  INSERT INTO public.chore_assignments (chore_id, user_id, rotation_pos, assigned_at)
  VALUES (p_chore_id, v_next_user, v_next_pos, NOW());

  UPDATE public.chores
  SET current_assignee = v_next_user
  WHERE id = p_chore_id;

  RETURN v_next_user;
END;
$$ LANGUAGE plpgsql;

-- Settle all outstanding debts between two users in a WG
CREATE OR REPLACE FUNCTION settle_all_debts(p_wg_id UUID, p_settled_by UUID)
RETURNS INT AS $$
DECLARE
  v_rows INT;
BEGIN
  UPDATE public.expense_splits es
  SET is_settled = TRUE, settled_at = NOW()
  FROM public.expenses e
  WHERE es.expense_id = e.id
    AND e.wg_id = p_wg_id
    AND es.user_id = p_settled_by
    AND es.is_settled = FALSE;

  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RETURN v_rows;
END;
$$ LANGUAGE plpgsql;

-- Auto-create notification preferences on new WG membership
CREATE OR REPLACE FUNCTION ensure_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id, wg_id)
  VALUES (NEW.user_id, NEW.wg_id)
  ON CONFLICT (user_id, wg_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_wg_member_joined
  AFTER INSERT ON public.wg_members
  FOR EACH ROW EXECUTE FUNCTION ensure_notification_preferences();

-- Auto-create profile on new auth user
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE public.profiles                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wgs                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wg_members                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_links              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_splits            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chores                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chore_assignments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chore_completions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_items            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_tokens               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences  ENABLE ROW LEVEL SECURITY;

-- Helper: is user member of a WG?
CREATE OR REPLACE FUNCTION is_wg_member(p_wg_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.wg_members
    WHERE wg_id = p_wg_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: is user admin of a WG?
CREATE OR REPLACE FUNCTION is_wg_admin(p_wg_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.wg_members
    WHERE wg_id = p_wg_id AND user_id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- profiles
CREATE POLICY "profiles: own read"   ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles: own update" ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "profiles: wg-mates read" ON public.profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.wg_members m1
    JOIN public.wg_members m2 ON m1.wg_id = m2.wg_id
    WHERE m1.user_id = auth.uid() AND m2.user_id = profiles.id
  ));

-- wgs
CREATE POLICY "wgs: member read"   ON public.wgs FOR SELECT USING (is_wg_member(id));
CREATE POLICY "wgs: member insert" ON public.wgs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "wgs: admin update"  ON public.wgs FOR UPDATE USING (is_wg_admin(id));
CREATE POLICY "wgs: admin delete"  ON public.wgs FOR DELETE USING (is_wg_admin(id));

-- wg_members
CREATE POLICY "wg_members: member read"   ON public.wg_members FOR SELECT USING (is_wg_member(wg_id));
CREATE POLICY "wg_members: self insert"   ON public.wg_members FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "wg_members: admin insert"  ON public.wg_members FOR INSERT WITH CHECK (is_wg_admin(wg_id));
CREATE POLICY "wg_members: admin delete"  ON public.wg_members FOR DELETE USING (is_wg_admin(wg_id) OR user_id = auth.uid());
CREATE POLICY "wg_members: admin update"  ON public.wg_members FOR UPDATE USING (is_wg_admin(wg_id));

-- invite_links
CREATE POLICY "invite_links: member read"   ON public.invite_links FOR SELECT USING (is_wg_member(wg_id));
CREATE POLICY "invite_links: admin manage"  ON public.invite_links FOR ALL  USING (is_wg_admin(wg_id));
CREATE POLICY "invite_links: token read"    ON public.invite_links FOR SELECT USING (TRUE); -- public token lookup for joining

-- expense_categories
CREATE POLICY "expense_categories: global read"   ON public.expense_categories FOR SELECT USING (wg_id IS NULL);
CREATE POLICY "expense_categories: member read"   ON public.expense_categories FOR SELECT USING (is_wg_member(wg_id));
CREATE POLICY "expense_categories: member insert" ON public.expense_categories FOR INSERT WITH CHECK (is_wg_member(wg_id));
CREATE POLICY "expense_categories: admin manage"  ON public.expense_categories FOR ALL USING (is_wg_admin(wg_id));

-- expenses
CREATE POLICY "expenses: member read"   ON public.expenses FOR SELECT USING (is_wg_member(wg_id));
CREATE POLICY "expenses: member insert" ON public.expenses FOR INSERT WITH CHECK (is_wg_member(wg_id) AND paid_by = auth.uid());
CREATE POLICY "expenses: owner update"  ON public.expenses FOR UPDATE USING (paid_by = auth.uid());
CREATE POLICY "expenses: owner delete"  ON public.expenses FOR DELETE USING (paid_by = auth.uid() OR is_wg_admin(wg_id));

-- expense_splits
CREATE POLICY "expense_splits: member read" ON public.expense_splits FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.expenses e WHERE e.id = expense_splits.expense_id AND is_wg_member(e.wg_id)
  ));
CREATE POLICY "expense_splits: payer insert" ON public.expense_splits FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.expenses e WHERE e.id = expense_splits.expense_id AND e.paid_by = auth.uid()
  ));
CREATE POLICY "expense_splits: self update" ON public.expense_splits FOR UPDATE
  USING (user_id = auth.uid());

-- settlements
CREATE POLICY "settlements: member read"   ON public.settlements FOR SELECT USING (is_wg_member(wg_id));
CREATE POLICY "settlements: member insert" ON public.settlements FOR INSERT WITH CHECK (is_wg_member(wg_id) AND payer_id = auth.uid());

-- chores
CREATE POLICY "chores: member read"   ON public.chores FOR SELECT USING (is_wg_member(wg_id));
CREATE POLICY "chores: member insert" ON public.chores FOR INSERT WITH CHECK (is_wg_member(wg_id));
CREATE POLICY "chores: admin update"  ON public.chores FOR UPDATE USING (is_wg_admin(wg_id));
CREATE POLICY "chores: admin delete"  ON public.chores FOR DELETE USING (is_wg_admin(wg_id));

-- chore_assignments
CREATE POLICY "chore_assignments: member read" ON public.chore_assignments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.chores c WHERE c.id = chore_assignments.chore_id AND is_wg_member(c.wg_id)
  ));
CREATE POLICY "chore_assignments: admin insert" ON public.chore_assignments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.chores c WHERE c.id = chore_assignments.chore_id AND is_wg_admin(c.wg_id)
  ));

-- chore_completions
CREATE POLICY "chore_completions: member read" ON public.chore_completions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.chores c WHERE c.id = chore_completions.chore_id AND is_wg_member(c.wg_id)
  ));
CREATE POLICY "chore_completions: member insert" ON public.chore_completions FOR INSERT
  WITH CHECK (completed_by = auth.uid() AND EXISTS (
    SELECT 1 FROM public.chores c WHERE c.id = chore_completions.chore_id AND is_wg_member(c.wg_id)
  ));

-- shopping_items
CREATE POLICY "shopping_items: member read"   ON public.shopping_items FOR SELECT USING (is_wg_member(wg_id));
CREATE POLICY "shopping_items: member insert" ON public.shopping_items FOR INSERT WITH CHECK (is_wg_member(wg_id) AND added_by = auth.uid());
CREATE POLICY "shopping_items: member update" ON public.shopping_items FOR UPDATE USING (is_wg_member(wg_id));
CREATE POLICY "shopping_items: owner delete"  ON public.shopping_items FOR DELETE USING (added_by = auth.uid() OR is_wg_admin(wg_id));

-- announcements
CREATE POLICY "announcements: member read"   ON public.announcements FOR SELECT USING (is_wg_member(wg_id));
CREATE POLICY "announcements: member insert" ON public.announcements FOR INSERT WITH CHECK (is_wg_member(wg_id) AND author_id = auth.uid());
CREATE POLICY "announcements: author update" ON public.announcements FOR UPDATE USING (author_id = auth.uid() OR is_wg_admin(wg_id));
CREATE POLICY "announcements: author delete" ON public.announcements FOR DELETE USING (author_id = auth.uid() OR is_wg_admin(wg_id));

-- push_tokens
CREATE POLICY "push_tokens: own read"   ON public.push_tokens FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "push_tokens: own insert" ON public.push_tokens FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "push_tokens: own delete" ON public.push_tokens FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "push_tokens: own update" ON public.push_tokens FOR UPDATE USING (user_id = auth.uid());

-- notification_preferences
CREATE POLICY "notif_prefs: own read"   ON public.notification_preferences FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notif_prefs: own insert" ON public.notification_preferences FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "notif_prefs: own update" ON public.notification_preferences FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "notif_prefs: own delete" ON public.notification_preferences FOR DELETE USING (user_id = auth.uid());
