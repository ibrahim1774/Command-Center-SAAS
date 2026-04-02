import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isDemoUser } from "@/lib/demo-mode";
import { tiktokVideos, tiktokComments } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  // Check if TikTok is connected
  const { data: account } = await supabase
    .from("connected_accounts")
    .select("platform_username, last_synced")
    .eq("user_id", userId)
    .eq("platform", "tiktok")
    .eq("status", "active")
    .single();

  // If connected, return stored data
  if (account) {
    // TikTok data is stored via the connect route's Apify scrape
    // For now, return what we have from connected_accounts
    return NextResponse.json({
      connected: true,
      lastSynced: account.last_synced,
      profile: {
        username: account.platform_username || "",
        followers: 0,
        following: 0,
        videoCount: 0,
      },
      metrics: {
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
      },
      videos: [],
    });
  }

  // Not connected — demo user gets mock data
  if (await isDemoUser(req)) {
    return NextResponse.json({
      connected: true,
      lastSynced: new Date().toISOString(),
      profile: {
        username: "@ibrahimttshop",
        followers: 312400,
        following: 892,
        videoCount: tiktokVideos.length,
      },
      metrics: {
        totalViews: tiktokVideos.reduce((s, v) => s + v.views, 0),
        totalLikes: tiktokVideos.reduce((s, v) => s + v.likes, 0),
        totalComments: tiktokVideos.reduce((s, v) => s + v.comments, 0),
        totalShares: tiktokVideos.reduce((s, v) => s + v.shares, 0),
      },
      videos: tiktokVideos.map((v) => ({
        id: v.id,
        title: v.caption,
        views: v.views,
        likes: v.likes,
        comments: v.comments,
        shares: v.shares,
        thumbnail: "",
        createdAt: v.timestamp,
      })),
      comments: tiktokComments.map((c) => ({
        id: c.id,
        author: c.author,
        text: c.text,
        likes: c.likes,
        timestamp: c.timestamp,
      })),
    });
  }

  return NextResponse.json({ connected: false });
}
