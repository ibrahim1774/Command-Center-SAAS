import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { checkAccountLimit } from "@/lib/account-limits";
import { scrapeYouTubeChannel } from "@/lib/apify";

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { channelUrl } = await req.json();
  if (!channelUrl) {
    return NextResponse.json({ error: "YouTube channel URL is required" }, { status: 400 });
  }

  const { allowed, reason } = await checkAccountLimit(userId, "youtube");
  if (!allowed) {
    return NextResponse.json(
      { error: reason === "platform_not_allowed" ? "Upgrade to Pro to connect this platform" : "Account limit reached" },
      { status: 403 }
    );
  }

  try {
    const channel = await scrapeYouTubeChannel(channelUrl);
    if (!channel) {
      return NextResponse.json({ error: "Could not find that YouTube channel. Make sure the URL is correct." }, { status: 404 });
    }

    const supabase = getSupabaseAdmin();

    // Upsert connected account
    await supabase.from("connected_accounts").upsert(
      {
        user_id: userId,
        platform: "youtube",
        platform_username: channel.channelName,
        platform_user_id: channelUrl,
        status: "active",
        last_synced: new Date().toISOString(),
      },
      { onConflict: "user_id,platform" }
    );

    // Upsert channel data
    await supabase.from("youtube_channels").upsert(
      {
        user_id: userId,
        title: channel.channelName,
        subscriber_count: channel.subscriberCount,
        total_views: channel.totalViews,
        video_count: channel.videoCount,
        thumbnail_url: channel.thumbnailUrl,
      },
      { onConflict: "user_id" }
    );

    // Delete old videos and insert new ones
    await supabase.from("youtube_videos").delete().eq("user_id", userId);

    if (channel.videos.length > 0) {
      await supabase.from("youtube_videos").insert(
        channel.videos.map((v) => ({
          user_id: userId,
          video_id: v.id,
          title: v.title,
          views: v.viewCount,
          likes: v.likeCount,
          comments_count: v.commentCount,
          duration: v.duration,
          published_at: v.publishedAt,
          thumbnail_url: v.thumbnailUrl,
        }))
      );
    }

    return NextResponse.json({
      success: true,
      channel: {
        name: channel.channelName,
        subscribers: channel.subscriberCount,
        videos: channel.videos.length,
      },
    });
  } catch (error) {
    console.error("[connect/youtube] Error:", error);
    return NextResponse.json(
      { error: "Failed to scrape YouTube channel. Please try again." },
      { status: 500 }
    );
  }
}
