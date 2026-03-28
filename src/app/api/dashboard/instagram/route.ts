import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isDemoUser } from "@/lib/demo-mode";
import {
  instagramAccounts,
  instagramPosts,
  instagramComments,
  instagramDailyReach,
} from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Demo mode: return mock data
  if (await isDemoUser(req)) {
    const acct = instagramAccounts[0];
    return NextResponse.json({
      connected: true,
      lastSynced: new Date().toISOString(),
      profile: {
        username: acct.handle,
        follower_count: acct.followers,
        following_count: acct.following,
        media_count: acct.posts,
        profile_picture_url: null,
      },
      posts: instagramPosts.slice(0, 6).map((p) => ({
        id: p.id,
        caption: p.caption,
        likes: p.likes,
        comments_count: p.comments,
        timestamp: p.timestamp,
        media_type: p.type,
        permalink: "#",
      })),
      comments: instagramComments.map((c) => ({
        id: c.id,
        username: c.author,
        text: c.text,
        timestamp: c.timestamp,
      })),
      dailyMetrics: instagramDailyReach.map((d) => ({
        date: d.date,
        reach: d.reach,
        impressions: Math.round(d.reach * 1.4),
      })),
    });
  }

  const supabase = getSupabaseAdmin();

  // Check if connected
  const { data: account } = await supabase
    .from("connected_accounts")
    .select("last_synced, unified_connection_id")
    .eq("user_id", userId)
    .eq("platform", "instagram")
    .eq("status", "active")
    .single();

  if (!account) {
    return NextResponse.json({ connected: false });
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("instagram_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  // Fetch posts
  const { data: posts } = await supabase
    .from("instagram_posts")
    .select("*")
    .eq("user_id", userId)
    .order("timestamp", { ascending: false })
    .limit(12);

  // Fetch comments
  const { data: comments } = await supabase
    .from("instagram_comments")
    .select("*")
    .eq("user_id", userId)
    .order("timestamp", { ascending: false })
    .limit(10);

  // Fetch daily metrics (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)
    .toISOString()
    .split("T")[0];
  const { data: dailyMetrics } = await supabase
    .from("instagram_daily_metrics")
    .select("*")
    .eq("user_id", userId)
    .gte("date", thirtyDaysAgo)
    .order("date", { ascending: true });

  return NextResponse.json({
    connected: true,
    lastSynced: account.last_synced,
    profile: profile || null,
    posts: posts || [],
    comments: comments || [],
    dailyMetrics: dailyMetrics || [],
  });
}
