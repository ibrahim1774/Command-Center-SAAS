-- Alter brand_deals: add new CRM columns
ALTER TABLE brand_deals
  ADD COLUMN IF NOT EXISTS contact_person TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS deal_type TEXT DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS platforms TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS payment_received NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Backfill platforms array from single platform column
UPDATE brand_deals SET platforms = ARRAY[platform] WHERE platform IS NOT NULL AND platforms = '{}';

-- deal_notes table
CREATE TABLE IF NOT EXISTS deal_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES brand_deals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_deal_notes_deal ON deal_notes(deal_id);

-- deal_checklist table
CREATE TABLE IF NOT EXISTS deal_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES brand_deals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_deal_checklist_deal ON deal_checklist(deal_id);

-- updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on brand_deals
DROP TRIGGER IF EXISTS brand_deals_updated_at ON brand_deals;
CREATE TRIGGER brand_deals_updated_at
  BEFORE UPDATE ON brand_deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
