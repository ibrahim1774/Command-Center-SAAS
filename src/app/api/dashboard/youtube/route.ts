import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { shouldShowMockData } from "@/lib/demo-mode";
import { youtubeVideos, youtubeComments, youtubeViewsData } from "@/lib/mock-data";

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

  // If connected, return real data
  if (account) {
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

  // Not connected — demo user gets mock data
  if (await shouldShowMockData(req, userId)) {
    return NextResponse.json({
      connected: true,
      lastSynced: new Date().toISOString(),
      channel: {
        title: "Command HQ",
        subscriber_count: 234800,
        video_count: 187,
        total_views: 28400000,
        thumbnail_url: null,
      },
      videos: youtubeVideos.map((v) => ({
        id: v.id,
        title: v.title,
        views: v.views,
        likes: v.likes,
        comments_count: v.comments,
        published_at: v.publishedAt,
        duration: v.duration,
        thumbnail_url: null,
      })),
      comments: youtubeComments.map((c) => ({
        id: c.id,
        author: c.author,
        text: c.text,
        like_count: c.likes,
        published_at: c.timestamp,
        video_title: c.videoTitle,
      })),
      viewsData: youtubeViewsData,
    });
  }

  return NextResponse.json({ connected: false });
}
