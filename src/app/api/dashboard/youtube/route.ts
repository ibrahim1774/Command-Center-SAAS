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
    .select("last_synced, unified_connection_id")
    .eq("user_id", userId)
    .eq("platform", "youtube")
    .eq("status", "active")
    .single();

  if (!account) {
    return NextResponse.json({ connected: false });
  }

  const { data: channel } = await supabase
    .from("youtube_channels")
    .select("*")
    .eq("user_id", userId)
    .single();

  const { data: videos } = await supabase
    .from("youtube_videos")
    .select("*")
    .eq("user_id", userId)
    .order("published_at", { ascending: false })
    .limit(10);

  const { data: comments } = await supabase
    .from("youtube_comments")
    .select("*")
    .eq("user_id", userId)
    .order("published_at", { ascending: false })
    .limit(20);

  return NextResponse.json({
    connected: true,
    lastSynced: account.last_synced,
    channel: channel || null,
    videos: videos || [],
    comments: comments || [],
  });
}
