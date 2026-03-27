-- Cached data table for storing shared data like trending headlines
-- This avoids per-user API calls by caching data that's the same for everyone

CREATE TABLE IF NOT EXISTS cached_data (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Allow all authenticated users to read cached data
ALTER TABLE cached_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cached data"
  ON cached_data FOR SELECT
  USING (true);

-- Only service role can insert/update (done via API routes)
CREATE POLICY "Service role can manage cached data"
  ON cached_data FOR ALL
  USING (true)
  WITH CHECK (true);
