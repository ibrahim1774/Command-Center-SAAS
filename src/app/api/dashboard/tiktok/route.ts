import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const UNIFIED_API_KEY = process.env.UNIFIED_API_KEY || "";

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  // Check if TikTok is connected
  const { data: account } = await supabase
    .from("connected_accounts")
    .select("unified_connection_id, last_synced")
    .eq("user_id", userId)
    .eq("platform", "tiktok")
    .eq("status", "active")
    .single();

  if (!account || !account.unified_connection_id) {
    return NextResponse.json({ connected: false });
  }

  const connectionId = account.unified_connection_id;

  try {
    // Fetch posts from Unified.to social API
    const postsRes = await fetch(
      `https://api.unified.to/social/${connectionId}/post?limit=12`,
      {
        headers: {
          Authorization: `Bearer ${UNIFIED_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let videos: Array<{
      id: string;
      title: string;
      views: number;
      likes: number;
      comments: number;
      shares: number;
      thumbnail: string;
      createdAt: string;
    }> = [];

    if (postsRes.ok) {
      const posts = await postsRes.json();
      videos = (posts || []).map(
        (post: {
          id?: string;
          title?: string;
          subject?: string;
          content?: string;
          media_urls?: string[];
          views?: number;
          likes?: number;
          comments?: number;
          shares?: number;
          created_at?: string;
          updated_at?: string;
        }) => ({
          id: post.id || "",
          title: post.title || post.subject || post.content?.slice(0, 80) || "(untitled)",
          views: post.views || 0,
          likes: post.likes || 0,
          comments: post.comments || 0,
          shares: post.shares || 0,
          thumbnail: post.media_urls?.[0] || "",
          createdAt: post.created_at || post.updated_at || "",
        })
      );
    }

    // Derive profile stats from available data
    const totalViews = videos.reduce((sum, v) => sum + v.views, 0);
    const totalLikes = videos.reduce((sum, v) => sum + v.likes, 0);
    const totalComments = videos.reduce((sum, v) => sum + v.comments, 0);
    const totalShares = videos.reduce((sum, v) => sum + v.shares, 0);

    return NextResponse.json({
      connected: true,
      lastSynced: account.last_synced,
      profile: {
        username: "",
        followers: 0,
        following: 0,
        videoCount: videos.length,
      },
      metrics: {
        totalViews,
        totalLikes,
        totalComments,
        totalShares,
      },
      videos,
    });
  } catch (error) {
    console.error("Error fetching TikTok data from Unified.to:", error);
    return NextResponse.json({
      connected: true,
      lastSynced: account.last_synced,
      profile: {
        username: "",
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
}
