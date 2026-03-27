-- Add unified_connection_id for Unified.to integration
ALTER TABLE connected_accounts ADD COLUMN IF NOT EXISTS unified_connection_id TEXT;

-- Make access_token nullable since Unified.to manages tokens
ALTER TABLE connected_accounts ALTER COLUMN access_token DROP NOT NULL;
