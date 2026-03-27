import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const { data: account } = await supabase
    .from("connected_accounts")
    .select("last_synced")
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
