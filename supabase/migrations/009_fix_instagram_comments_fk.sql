-- Make post_id nullable and drop FK constraint so comments can be inserted
-- without linking to a specific instagram_posts row (Apify scrapes comments separately)
ALTER TABLE instagram_comments DROP CONSTRAINT IF EXISTS instagram_comments_post_id_fkey;
ALTER TABLE instagram_comments ALTER COLUMN post_id DROP NOT NULL;
