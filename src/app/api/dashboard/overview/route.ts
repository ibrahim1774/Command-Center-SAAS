import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

interface ChannelSummary {
  platform: string;
  username: string;
  followers: number;
  posts: number;
  likes: number;
  goal: number | null;
}

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  // Check which platforms are connected
  const { data: accounts } = await supabase
    .from("connected_accounts")
    .select("platform, platform_username, last_synced")
    .eq("user_id", userId)
    .eq("status", "active");

  const connectedPlatforms = (accounts || []).map((a) => a.platform);

  // Fetch all platform data + goals in parallel
  const [
    igProfileRes, ytChannelRes, fbPageRes, tiktokCacheRes,
    igPostsRes, ytVideosRes, fbPostsRes,
    igGoalRes, ytGoalRes, fbGoalRes, tkGoalRes,
    igCommentsRes, ytCommentsRes,
    growthDataRes,
  ] = await Promise.all([
    supabase.from("instagram_profiles").select("username, follower_count").eq("user_id", userId).single(),
    supabase.from("youtube_channels").select("title, subscriber_count").eq("user_id", userId).single(),
    supabase.from("facebook_pages").select("name, followers").eq("user_id", userId).single(),
    supabase.from("cached_data").select("value").eq("key", `tiktok:${userId}`).single(),
    supabase.from("instagram_posts").select("likes, comments_count").eq("user_id", userId),
    supabase.from("youtube_videos").select("likes, comments_count, views").eq("user_id", userId),
    supabase.from("facebook_posts").select("reactions, comments_count").eq("user_id", userId),
    supabase.from("cached_data").select("value").eq("key", `goal:instagram:${userId}`).single(),
    supabase.from("cached_data").select("value").eq("key", `goal:youtube:${userId}`).single(),
    supabase.from("cached_data").select("value").eq("key", `goal:facebook:${userId}`).single(),
    supabase.from("cached_data").select("value").eq("key", `goal:tiktok:${userId}`).single(),
    supabase.from("instagram_comments").select("username, text, timestamp").eq("user_id", userId).order("timestamp", { ascending: false }).limit(3),
    supabase.from("youtube_comments").select("author, text, published_at").eq("user_id", userId).order("published_at", { ascending: false }).limit(3),
    supabase.from("instagram_daily_metrics").select("date, follower_count").eq("user_id", userId).gte("date", new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0]).order("date", { ascending: true }),
  ]);

  // Helper to extract goal target
  const getGoal = (res: { data: { value: unknown } | null }) =>
    (res.data?.value as Record<string, number>)?.target || null;

  // Build per-channel summaries
  const channels: ChannelSummary[] = [];
  let totalFollowers = 0;

  const igProfile = igProfileRes.data;
  const igPosts = igPostsRes.data || [];
  if (igProfile && connectedPlatforms.includes("instagram")) {
    const followers = igProfile.follower_count || 0;
    totalFollowers += followers;
    channels.push({
      platform: "instagram",
      username: igProfile.username || "",
      followers,
      posts: igPosts.length,
      likes: igPosts.reduce((s, p) => s + (p.likes || 0), 0),
      goal: getGoal(igGoalRes),
    });
  }

  const ytChannel = ytChannelRes.data;
  const ytVideos = ytVideosRes.data || [];
  if (ytChannel && connectedPlatforms.includes("youtube")) {
    const followers = ytChannel.subscriber_count || 0;
    totalFollowers += followers;
    channels.push({
      platform: "youtube",
      username: ytChannel.title || "",
      followers,
      posts: ytVideos.length,
      likes: ytVideos.reduce((s, v) => s + (v.likes || 0), 0),
      goal: getGoal(ytGoalRes),
    });
  }

  const fbPage = fbPageRes.data;
  const fbPosts = fbPostsRes.data || [];
  if (fbPage && connectedPlatforms.includes("facebook")) {
    const followers = fbPage.followers || 0;
    totalFollowers += followers;
    channels.push({
      platform: "facebook",
      username: fbPage.name || "",
      followers,
      posts: fbPosts.length,
      likes: fbPosts.reduce((s, p) => s + (p.reactions || 0), 0),
      goal: getGoal(fbGoalRes),
    });
  }

  const tiktokData = tiktokCacheRes.data?.value as Record<string, unknown> | null;
  const tiktokProfile = tiktokData?.profile as Record<string, unknown> | null;
  const tiktokVideos = (tiktokData?.videos as Array<Record<string, number>>) || [];
  if (tiktokProfile && connectedPlatforms.includes("tiktok")) {
    const followers = (tiktokProfile.followers as number) || 0;
    totalFollowers += followers;
    channels.push({
      platform: "tiktok",
      username: String(tiktokProfile.username || ""),
      followers,
      posts: tiktokVideos.length,
      likes: tiktokVideos.reduce((s, v) => s + (v.likes || 0), 0),
      goal: getGoal(tkGoalRes),
    });
  }

  // Aggregate totals
  const totalPosts = channels.reduce((s, c) => s + c.posts, 0);
  const totalLikes = channels.reduce((s, c) => s + c.likes, 0);
  const totalEngagements =
    igPosts.reduce((s, p) => s + (p.likes || 0) + (p.comments_count || 0), 0) +
    ytVideos.reduce((s, v) => s + (v.likes || 0) + (v.comments_count || 0), 0) +
    fbPosts.reduce((s, p) => s + (p.reactions || 0) + (p.comments_count || 0), 0);

  const engagementRate =
    totalFollowers > 0 && totalPosts > 0
      ? ((totalEngagements / totalPosts / totalFollowers) * 100).toFixed(2)
      : "0.00";

  // Recent comments
  const recentComments = [
    ...(igCommentsRes.data || []).map((c) => ({
      username: c.username,
      platform: "instagram" as const,
      comment: c.text,
      timestamp: c.timestamp,
    })),
    ...(ytCommentsRes.data || []).map((c) => ({
      username: c.author,
      platform: "youtube" as const,
      comment: c.text,
      timestamp: c.published_at,
    })),
  ].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return NextResponse.json({
    connected: connectedPlatforms.length > 0,
    connectedPlatforms,
    totalFollowers,
    totalPosts,
    totalLikes,
    engagementRate,
    channels,
    followerGrowth: growthDataRes.data || [],
    recentComments: recentComments.slice(0, 4),
  });
}
