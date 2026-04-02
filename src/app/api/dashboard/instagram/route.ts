import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { shouldShowMockData } from "@/lib/demo-mode";
import {
  instagramAccounts,
  instagramPosts,
  instagramComments,
} from "@/lib/mock-data";

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

  // If connected, return real data from Supabase
  if (account) {
    const { data: profile } = await supabase
      .from("instagram_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    const { data: posts } = await supabase
      .from("instagram_posts")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false })
      .limit(12);

    const { data: comments } = await supabase
      .from("instagram_comments")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false })
      .limit(5);

    return NextResponse.json({
      connected: true,
      lastSynced: account.last_synced,
      profile: profile || null,
      posts: posts || [],
      comments: comments || [],
    });
  }

  // Not connected — demo user gets mock data, others get "not connected"
  if (await shouldShowMockData(req, userId)) {
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
        thumbnail_url: null,
        media_url: null,
        permalink: "#",
      })),
      comments: instagramComments.map((c) => ({
        id: c.id,
        username: c.author,
        text: c.text,
        timestamp: c.timestamp,
      })),
    });
  }

  return NextResponse.json({ connected: false });
}
