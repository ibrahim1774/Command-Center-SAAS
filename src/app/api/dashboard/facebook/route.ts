import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isDemoUser } from "@/lib/demo-mode";
import { facebookPosts, facebookComments } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Demo mode
  if (await isDemoUser(req)) {
    return NextResponse.json({
      connected: true,
      lastSynced: new Date().toISOString(),
      page: {
        name: "Command HQ",
        followers: 128400,
        likes: 98200,
        page_views: 34200,
        post_engagements: 18900,
      },
      posts: facebookPosts.map((p) => ({
        id: p.id,
        message: p.content,
        post_type: p.type,
        reactions: { total: Object.values(p.reactions).reduce((a, b) => a + b, 0) },
        comments_count: p.comments,
        shares: p.shares,
        reach: p.reach,
        created_time: p.publishedAt,
      })),
      comments: facebookComments.map((c) => ({
        id: c.id,
        author: c.author,
        text: c.text,
        timestamp: c.timestamp,
      })),
    });
  }

  const supabase = getSupabaseAdmin();

  const { data: account } = await supabase
    .from("connected_accounts")
    .select("last_synced, unified_connection_id")
    .eq("user_id", userId)
    .eq("platform", "facebook")
    .eq("status", "active")
    .single();

  if (!account) {
    return NextResponse.json({ connected: false });
  }

  const { data: page } = await supabase
    .from("facebook_pages")
    .select("*")
    .eq("user_id", userId)
    .single();

  const { data: posts } = await supabase
    .from("facebook_posts")
    .select("*")
    .eq("user_id", userId)
    .order("created_time", { ascending: false })
    .limit(10);

  const { data: comments } = await supabase
    .from("facebook_comments")
    .select("*")
    .eq("user_id", userId)
    .order("timestamp", { ascending: false })
    .limit(20);

  return NextResponse.json({
    connected: true,
    lastSynced: account.last_synced,
    page: page || null,
    posts: posts || [],
    comments: comments || [],
  });
}
