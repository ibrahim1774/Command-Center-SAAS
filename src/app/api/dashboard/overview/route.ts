import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  // Check which platforms are connected
  const { data: accounts } = await supabase
    .from("connected_accounts")
    .select("platform, last_synced")
    .eq("user_id", userId)
    .eq("status", "active");

  const connectedPlatforms = (accounts || []).map((a) => a.platform);

  // Aggregate follower counts
  let totalFollowers = 0;

  const { data: igProfile } = await supabase
    .from("instagram_profiles")
    .select("follower_count")
    .eq("user_id", userId)
    .single();
  if (igProfile) totalFollowers += igProfile.follower_count || 0;

  const { data: ytChannel } = await supabase
    .from("youtube_channels")
    .select("subscriber_count")
    .eq("user_id", userId)
    .single();
  if (ytChannel) totalFollowers += ytChannel.subscriber_count || 0;

  const { data: fbPage } = await supabase
    .from("facebook_pages")
    .select("followers")
    .eq("user_id", userId)
    .single();
  if (fbPage) totalFollowers += fbPage.followers || 0;

  // Get follower growth data (last 30 days from instagram daily metrics)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)
    .toISOString()
    .split("T")[0];
  const { data: growthData } = await supabase
    .from("instagram_daily_metrics")
    .select("date, follower_count")
    .eq("user_id", userId)
    .gte("date", thirtyDaysAgo)
    .order("date", { ascending: true });

  // Get recent comments from all platforms for "Why We Do This"
  const { data: igComments } = await supabase
    .from("instagram_comments")
    .select("username, text, timestamp")
    .eq("user_id", userId)
    .order("timestamp", { ascending: false })
    .limit(3);

  const { data: ytComments } = await supabase
    .from("youtube_comments")
    .select("author, text, published_at")
    .eq("user_id", userId)
    .order("published_at", { ascending: false })
    .limit(3);

  const recentComments = [
    ...(igComments || []).map((c) => ({
      username: c.username,
      platform: "instagram" as const,
      comment: c.text,
      timestamp: c.timestamp,
    })),
    ...(ytComments || []).map((c) => ({
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
    followerGrowth: growthData || [],
    recentComments: recentComments.slice(0, 4),
    igProfile: igProfile || null,
    ytChannel: ytChannel || null,
    fbPage: fbPage || null,
  });
}
