-- Add unique constraints needed for upsert operations during platform sync

ALTER TABLE instagram_posts ADD CONSTRAINT uq_instagram_posts_user_post UNIQUE (user_id, post_id);
ALTER TABLE youtube_videos ADD CONSTRAINT uq_youtube_videos_user_video UNIQUE (user_id, video_id);
ALTER TABLE facebook_posts ADD CONSTRAINT uq_facebook_posts_user_post UNIQUE (user_id, post_id);
ALTER TABLE emails ADD CONSTRAINT uq_emails_user_email UNIQUE (user_id, email_id);

-- Add profile_picture_url to instagram_profiles
ALTER TABLE instagram_profiles ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Add unique constraint on instagram_profiles for upsert
ALTER TABLE instagram_profiles ADD CONSTRAINT uq_instagram_profiles_user UNIQUE (user_id);

-- Add unique constraints for channel/page upserts
ALTER TABLE youtube_channels ADD CONSTRAINT uq_youtube_channels_user_channel UNIQUE (user_id, channel_id);
ALTER TABLE facebook_pages ADD CONSTRAINT uq_facebook_pages_user_page UNIQUE (user_id, page_id);
