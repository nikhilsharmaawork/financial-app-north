-- Run this SQL in your Supabase SQL Editor
-- =====================================================

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT 'Latvia',
  status text NOT NULL DEFAULT 'Student',
  currency text NOT NULL DEFAULT 'EUR',
  onboarded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_own_profiles ON profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY insert_own_profiles ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY update_own_profiles ON profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY delete_own_profiles ON profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  balance numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_own_accounts ON accounts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY insert_own_accounts ON accounts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY update_own_accounts ON accounts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY delete_own_accounts ON accounts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Income sources table
CREATE TABLE IF NOT EXISTS income_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  monthly numeric NOT NULL DEFAULT 0,
  next_payday date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE income_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_own_income_sources ON income_sources FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY insert_own_income_sources ON income_sources FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY update_own_income_sources ON income_sources FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY delete_own_income_sources ON income_sources FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  amount numeric NOT NULL,
  date date NOT NULL,
  account_id uuid REFERENCES accounts(id) ON DELETE SET NULL,
  category text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_own_transactions ON transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY insert_own_transactions ON transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY update_own_transactions ON transactions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY delete_own_transactions ON transactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Events table (recurring bills, deadlines, etc.)
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  amount numeric NOT NULL,
  date date NOT NULL,
  recurring text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_own_events ON events FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY insert_own_events ON events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY update_own_events ON events FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY delete_own_events ON events FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text NOT NULL,
  saved numeric NOT NULL DEFAULT 0,
  target numeric NOT NULL,
  color text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_own_goals ON goals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY insert_own_goals ON goals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY update_own_goals ON goals FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY delete_own_goals ON goals FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_own_notifications ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY insert_own_notifications ON notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY update_own_notifications ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY delete_own_notifications ON notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Budgets table (monthly limit per category)
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  monthly_limit numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, category)
);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_own_budgets ON budgets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY insert_own_budgets ON budgets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY update_own_budgets ON budgets FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY delete_own_budgets ON budgets FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =====================================================
-- Atomic balance/goal update functions.
-- These fix a race-condition bug where the app used to read
-- a balance into memory, add to it, and write it back — which
-- could overwrite another update that happened in between.
-- These functions update the number directly inside the database,
-- so it is always correct even if two changes happen at once.
-- =====================================================

CREATE OR REPLACE FUNCTION increment_account_balance(p_account_id uuid, p_delta numeric)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_balance numeric;
BEGIN
  UPDATE accounts
  SET balance = balance + p_delta
  WHERE id = p_account_id AND user_id = auth.uid()
  RETURNING balance INTO new_balance;

  RETURN new_balance;
END;
$$;

CREATE OR REPLACE FUNCTION increment_goal_saved(p_goal_id uuid, p_delta numeric)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_saved numeric;
BEGIN
  UPDATE goals
  SET saved = GREATEST(0, LEAST(target, saved + p_delta))
  WHERE id = p_goal_id AND user_id = auth.uid()
  RETURNING saved INTO new_saved;

  RETURN new_saved;
END;
$$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_income_sources_user_id ON income_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
