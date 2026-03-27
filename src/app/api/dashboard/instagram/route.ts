import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
