import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  scrapeInstagramProfile,
  scrapeInstagramComments,
  scrapeYouTubeChannel,
  scrapeTikTokProfile,
} from "@/lib/apify";

function ensureISOTimestamp(ts: string): string {
  if (!ts) return new Date().toISOString();
  const num = Number(ts);
  if (!isNaN(num) && num > 1000000000) {
    return new Date(num * 1000).toISOString();
  }
  const d = new Date(ts);
  if (!isNaN(d.getTime())) return d.toISOString();
  return new Date().toISOString();
}

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { platform } = await req.json();
  if (!platform) {
    return NextResponse.json({ error: "Platform required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Get the connected account's username
  const { data: account } = await supabase
    .from("connected_accounts")
    .select("platform_username, platform_user_id")
    .eq("user_id", userId)
    .eq("platform", platform)
    .eq("status", "active")
    .single();

  if (!account) {
    return NextResponse.json({ error: "Platform not connected" }, { status: 404 });
  }

  const handle = account.platform_username || account.platform_user_id || "";
  if (!handle) {
    return NextResponse.json({ error: "No handle stored for this platform" }, { status: 400 });
  }

  try {
    if (platform === "instagram") {
      const profile = await scrapeInstagramProfile(handle);
      if (!profile) return NextResponse.json({ error: "Scrape failed" }, { status: 500 });

      await supabase.from("instagram_profiles").upsert(
        {
          user_id: userId,
          username: profile.username,
          follower_count: profile.followersCount,
          following_count: profile.followsCount,
          media_count: profile.postsCount,
          profile_picture_url: profile.profilePicUrl,
        },
        { onConflict: "user_id" }
      );

      await supabase.from("instagram_posts").delete().eq("user_id", userId);
      if (profile.posts.length > 0) {
        await supabase.from("instagram_posts").insert(
          profile.posts.map((p) => ({
            user_id: userId,
            post_id: p.id || `post_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            caption: p.caption,
            likes: p.likesCount,
            comments_count: p.commentsCount,
            media_type: p.type === "Image" ? "IMAGE" : p.type === "Video" ? "VIDEO" : p.type === "Sidecar" ? "CAROUSEL_ALBUM" : p.type,
            timestamp: ensureISOTimestamp(p.timestamp),
          }))
        );
      }

      // Scrape comments
      const postUrls = profile.posts.filter((p) => p.url).map((p) => p.url);
      try {
        const comments = await scrapeInstagramComments(postUrls, 10);
        if (comments.length > 0) {
          await supabase.from("instagram_comments").delete().eq("user_id", userId);
          await supabase.from("instagram_comments").insert(
            comments.map((c) => ({
              user_id: userId,
              username: c.username || "unknown",
              text: c.text || "",
              timestamp: ensureISOTimestamp(c.timestamp),
            }))
          );
        }
      } catch {
        // Comments are optional
      }

      await supabase
        .from("connected_accounts")
        .update({ last_synced: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("platform", "instagram");

    } else if (platform === "youtube") {
      const channel = await scrapeYouTubeChannel(handle);
      if (!channel) return NextResponse.json({ error: "Scrape failed" }, { status: 500 });

      await supabase.from("youtube_channels").upsert(
        {
          user_id: userId,
          title: channel.channelName,
          subscriber_count: channel.subscriberCount,
          total_views: channel.totalViews,
          video_count: channel.videoCount,
          thumbnail_url: channel.thumbnailUrl,
        },
        { onConflict: "user_id" }
      );

      await supabase.from("youtube_videos").delete().eq("user_id", userId);
      if (channel.videos.length > 0) {
        await supabase.from("youtube_videos").insert(
          channel.videos.map((v) => ({
            user_id: userId,
            video_id: v.id,
            title: v.title,
            views: v.viewCount,
            likes: v.likeCount,
            comments_count: v.commentCount,
            duration: v.duration,
            published_at: v.publishedAt,
            thumbnail_url: v.thumbnailUrl,
          }))
        );
      }

      await supabase
        .from("connected_accounts")
        .update({ last_synced: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("platform", "youtube");

    } else if (platform === "tiktok") {
      const profile = await scrapeTikTokProfile(handle);
      if (!profile) return NextResponse.json({ error: "Scrape failed" }, { status: 500 });

      await supabase
        .from("connected_accounts")
        .update({
          platform_username: profile.username,
          last_synced: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("platform", "tiktok");

    } else {
      return NextResponse.json({ error: "Unsupported platform" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[sync/manual] ${platform} error:`, error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
