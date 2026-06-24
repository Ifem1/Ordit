-- ── Ordit Schema Migration 001 ────────────────────────────────────────────────
-- Idempotent: safe to re-run. Drops policies before recreating them.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Profiles ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id                      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                   TEXT NOT NULL,
  full_name               TEXT,
  avatar_url              TEXT,
  wallet_address          TEXT,
  role                    TEXT,
  subscription_tier       TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
  audit_count_this_month  INT  NOT NULL DEFAULT 0,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idempotent column additions for existing deployments
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'wallet_address') THEN
    ALTER TABLE profiles ADD COLUMN wallet_address TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
    ALTER TABLE profiles ADD COLUMN role TEXT;
  END IF;
END $$;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Subscriptions ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS subscriptions (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier                 TEXT NOT NULL DEFAULT 'free',
  status               TEXT NOT NULL DEFAULT 'active',
  current_period_end   TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- ── Organizations ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS organizations (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  onchain_id          TEXT NOT NULL UNIQUE,
  contract_address    TEXT NOT NULL DEFAULT '',
  chain_id            INT  NOT NULL DEFAULT 61999,
  name                TEXT NOT NULL,
  industry            TEXT NOT NULL,
  owner_id            UUID NOT NULL REFERENCES auth.users(id),
  status              TEXT NOT NULL DEFAULT 'ACTIVE',
  tx_hash             TEXT NOT NULL DEFAULT '',
  explorer_url        TEXT NOT NULL DEFAULT '',
  sync_status         TEXT NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'failed')),
  raw_contract_json   JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view orgs they own" ON organizations;
DROP POLICY IF EXISTS "Users can create orgs" ON organizations;
DROP POLICY IF EXISTS "Users can update own orgs" ON organizations;
CREATE POLICY "Users can view orgs they own" ON organizations FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can create orgs"        ON organizations FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own orgs"    ON organizations FOR UPDATE USING (auth.uid() = owner_id);

-- ── Organization Roles ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS organization_roles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  role            TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE organization_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Org members can view roles" ON organization_roles;
CREATE POLICY "Org members can view roles" ON organization_roles FOR SELECT USING (
  EXISTS (SELECT 1 FROM organizations WHERE id = org_id AND owner_id = auth.uid())
  OR auth.uid() = user_id
);

-- ── Datasets ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS datasets (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  onchain_id          TEXT NOT NULL UNIQUE,
  org_id              UUID REFERENCES organizations(id),
  contract_address    TEXT NOT NULL DEFAULT '',
  chain_id            INT  NOT NULL DEFAULT 61999,
  name                TEXT NOT NULL,
  source              TEXT NOT NULL DEFAULT '',
  schema_summary      TEXT NOT NULL DEFAULT '',
  metadata_hash       TEXT NOT NULL DEFAULT '',
  status              TEXT NOT NULL DEFAULT 'ACTIVE',
  tx_hash             TEXT NOT NULL DEFAULT '',
  explorer_url        TEXT NOT NULL DEFAULT '',
  sync_status         TEXT NOT NULL DEFAULT 'pending',
  raw_contract_json   JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can view datasets" ON datasets;
DROP POLICY IF EXISTS "Authenticated users can insert datasets" ON datasets;
DROP POLICY IF EXISTS "Authenticated users can update datasets" ON datasets;
CREATE POLICY "Authenticated users can view datasets"   ON datasets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert datasets" ON datasets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update datasets" ON datasets FOR UPDATE TO authenticated USING (true);

-- ── Dashboards ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS dashboards (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  onchain_id          TEXT NOT NULL UNIQUE,
  org_id              UUID REFERENCES organizations(id),
  contract_address    TEXT NOT NULL DEFAULT '',
  chain_id            INT  NOT NULL DEFAULT 61999,
  name                TEXT NOT NULL,
  report_type         TEXT NOT NULL DEFAULT '',
  reporting_period    TEXT NOT NULL DEFAULT '',
  metadata_hash       TEXT NOT NULL DEFAULT '',
  status              TEXT NOT NULL DEFAULT 'ACTIVE',
  tx_hash             TEXT NOT NULL DEFAULT '',
  explorer_url        TEXT NOT NULL DEFAULT '',
  sync_status         TEXT NOT NULL DEFAULT 'pending',
  raw_contract_json   JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can view dashboards" ON dashboards;
DROP POLICY IF EXISTS "Authenticated users can insert dashboards" ON dashboards;
DROP POLICY IF EXISTS "Authenticated users can update dashboards" ON dashboards;
CREATE POLICY "Authenticated users can view dashboards"   ON dashboards FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert dashboards" ON dashboards FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update dashboards" ON dashboards FOR UPDATE TO authenticated USING (true);

-- ── Insight Audit Requests ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS insight_audit_requests (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  onchain_id          TEXT NOT NULL UNIQUE,
  org_id              UUID REFERENCES organizations(id),
  dataset_id          UUID REFERENCES datasets(id),
  dashboard_id        UUID REFERENCES dashboards(id),
  contract_address    TEXT NOT NULL DEFAULT '',
  chain_id            INT  NOT NULL DEFAULT 61999,
  insight_text        TEXT NOT NULL,
  claim_hash          TEXT NOT NULL DEFAULT '',
  submitter_id        UUID NOT NULL REFERENCES auth.users(id),
  status              TEXT NOT NULL DEFAULT 'PENDING',
  verdict             TEXT,
  scores              JSONB,
  findings            JSONB,
  tx_hash             TEXT NOT NULL DEFAULT '',
  explorer_url        TEXT NOT NULL DEFAULT '',
  sync_status         TEXT NOT NULL DEFAULT 'pending',
  raw_contract_json   JSONB,
  adjudicated_at      TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE insight_audit_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own requests" ON insight_audit_requests;
DROP POLICY IF EXISTS "Users can insert own requests" ON insight_audit_requests;
DROP POLICY IF EXISTS "Users can update own requests" ON insight_audit_requests;
CREATE POLICY "Users can view own requests"    ON insight_audit_requests FOR SELECT USING (auth.uid() = submitter_id);
CREATE POLICY "Users can insert own requests"  ON insight_audit_requests FOR INSERT WITH CHECK (auth.uid() = submitter_id);
CREATE POLICY "Users can update own requests"  ON insight_audit_requests FOR UPDATE USING (auth.uid() = submitter_id);

-- ── Insight Decisions ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS insight_decisions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  onchain_id          TEXT NOT NULL UNIQUE,
  request_id          UUID NOT NULL REFERENCES insight_audit_requests(id) ON DELETE CASCADE,
  contract_address    TEXT NOT NULL DEFAULT '',
  chain_id            INT  NOT NULL DEFAULT 61999,
  verdict             TEXT NOT NULL,
  scores              JSONB,
  findings            JSONB,
  tx_hash             TEXT NOT NULL DEFAULT '',
  explorer_url        TEXT NOT NULL DEFAULT '',
  adjudicated_at      TIMESTAMPTZ,
  sync_status         TEXT NOT NULL DEFAULT 'pending',
  raw_contract_json   JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE insight_decisions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view decisions for own requests" ON insight_decisions;
DROP POLICY IF EXISTS "Authenticated users can insert decisions" ON insight_decisions;
DROP POLICY IF EXISTS "Authenticated users can update decisions" ON insight_decisions;
CREATE POLICY "Users can view decisions for own requests" ON insight_decisions FOR SELECT USING (
  EXISTS (SELECT 1 FROM insight_audit_requests WHERE id = request_id AND submitter_id = auth.uid())
);
CREATE POLICY "Authenticated users can insert decisions" ON insight_decisions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update decisions" ON insight_decisions FOR UPDATE TO authenticated USING (true);

-- ── Human Reviews ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS human_reviews (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id          UUID NOT NULL REFERENCES insight_audit_requests(id) ON DELETE CASCADE,
  reviewer_id         UUID NOT NULL REFERENCES auth.users(id),
  verdict             TEXT NOT NULL,
  notes               TEXT NOT NULL DEFAULT '',
  tx_hash             TEXT NOT NULL DEFAULT '',
  explorer_url        TEXT NOT NULL DEFAULT '',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE human_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can view reviews" ON human_reviews;
DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON human_reviews;
CREATE POLICY "Authenticated users can view reviews"   ON human_reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert reviews" ON human_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = reviewer_id);

-- ── Activated Decisions ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS activated_decisions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id          UUID NOT NULL REFERENCES insight_audit_requests(id),
  onchain_id          TEXT NOT NULL DEFAULT '',
  activated_by        UUID NOT NULL REFERENCES auth.users(id),
  tx_hash             TEXT NOT NULL DEFAULT '',
  explorer_url        TEXT NOT NULL DEFAULT '',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE activated_decisions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can view activations" ON activated_decisions;
DROP POLICY IF EXISTS "Authenticated users can insert activations" ON activated_decisions;
CREATE POLICY "Authenticated users can view activations"  ON activated_decisions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert activations" ON activated_decisions FOR INSERT TO authenticated WITH CHECK (true);

-- ── Audit Events ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_events (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id          UUID REFERENCES insight_audit_requests(id) ON DELETE CASCADE,
  event_type          TEXT NOT NULL,
  actor               TEXT NOT NULL DEFAULT '',
  payload             JSONB,
  tx_hash             TEXT NOT NULL DEFAULT '',
  explorer_url        TEXT NOT NULL DEFAULT '',
  timestamp           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can view audit events" ON audit_events;
DROP POLICY IF EXISTS "Authenticated users can insert audit events" ON audit_events;
CREATE POLICY "Authenticated users can view audit events"  ON audit_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert audit events" ON audit_events FOR INSERT TO authenticated WITH CHECK (true);

-- ── Contract Transactions ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS contract_transactions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID REFERENCES auth.users(id),
  contract_address    TEXT NOT NULL,
  chain_id            INT  NOT NULL DEFAULT 61999,
  method              TEXT NOT NULL,
  tx_hash             TEXT NOT NULL UNIQUE,
  explorer_url        TEXT NOT NULL DEFAULT '',
  status              TEXT NOT NULL DEFAULT 'pending',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE contract_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own transactions" ON contract_transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON contract_transactions;
CREATE POLICY "Users can view own transactions"   ON contract_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON contract_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── Evidence Files ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS evidence_files (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id          UUID REFERENCES insight_audit_requests(id) ON DELETE CASCADE,
  file_name           TEXT NOT NULL,
  file_url            TEXT NOT NULL,
  file_type           TEXT NOT NULL DEFAULT '',
  file_size           INT  NOT NULL DEFAULT 0,
  uploaded_by         UUID NOT NULL REFERENCES auth.users(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE evidence_files ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can view evidence files" ON evidence_files;
DROP POLICY IF EXISTS "Users can upload evidence files" ON evidence_files;
CREATE POLICY "Authenticated users can view evidence files" ON evidence_files FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can upload evidence files"            ON evidence_files FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

-- ── Storage Bucket ─────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('evidence', 'evidence', true)
ON CONFLICT (id) DO NOTHING;

-- ── Indexes ────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_insight_requests_submitter ON insight_audit_requests (submitter_id);
CREATE INDEX IF NOT EXISTS idx_insight_requests_status    ON insight_audit_requests (status);
CREATE INDEX IF NOT EXISTS idx_insight_requests_verdict   ON insight_audit_requests (verdict);
CREATE INDEX IF NOT EXISTS idx_audit_events_request       ON audit_events (request_id);
CREATE INDEX IF NOT EXISTS idx_datasets_org               ON datasets (org_id);
CREATE INDEX IF NOT EXISTS idx_dashboards_org             ON dashboards (org_id);
