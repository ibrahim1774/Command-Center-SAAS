-- ============================================================
-- Command Center SAAS — Core Auth Tables
-- ============================================================

-- Users table (core auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password_hash TEXT,
  avatar_url TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Connected platform accounts (OAuth tokens)
CREATE TABLE connected_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  platform_username TEXT,
  platform_user_id TEXT,
  scopes TEXT,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_synced TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active',
  UNIQUE(user_id, platform)
);

-- Indexes
CREATE INDEX idx_connected_accounts_user_id ON connected_accounts(user_id);
CREATE INDEX idx_users_email ON users(email);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE connected_accounts ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own row
CREATE POLICY users_select ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY users_update ON users FOR UPDATE USING (auth.uid() = id);

-- Users can CRUD their own connected accounts
CREATE POLICY connected_accounts_select ON connected_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY connected_accounts_insert ON connected_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY connected_accounts_update ON connected_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY connected_accounts_delete ON connected_accounts FOR DELETE USING (auth.uid() = user_id);
