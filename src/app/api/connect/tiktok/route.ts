import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { checkAccountLimit } from "@/lib/account-limits";
import { scrapeTikTokProfile } from "@/lib/apify";

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { username } = await req.json();
  if (!username) {
    return NextResponse.json({ error: "TikTok username is required" }, { status: 400 });
  }

  const { allowed, reason } = await checkAccountLimit(userId, "tiktok");
  if (!allowed) {
    return NextResponse.json(
      { error: reason === "platform_not_allowed" ? "Upgrade to Pro to connect this platform" : "Account limit reached" },
      { status: 403 }
    );
  }

  try {
    const profile = await scrapeTikTokProfile(username);
    if (!profile) {
      return NextResponse.json({ error: "Could not find that TikTok profile. Make sure the username is correct." }, { status: 404 });
    }

    const supabase = getSupabaseAdmin();

    // Upsert connected account
    await supabase.from("connected_accounts").upsert(
      {
        user_id: userId,
        platform: "tiktok",
        platform_username: profile.username,
        platform_user_id: profile.username,
        status: "active",
        last_synced: new Date().toISOString(),
      },
      { onConflict: "user_id,platform" }
    );

    // Cache full TikTok data in cached_data table (no dedicated TikTok tables)
    const tiktokData = {
      profile: {
        username: profile.username,
        followers: profile.followersCount,
        following: profile.followingCount,
        videoCount: profile.videoCount,
        hearts: profile.heartsCount,
      },
      metrics: {
        totalViews: profile.videos.reduce((s, v) => s + v.viewCount, 0),
        totalLikes: profile.videos.reduce((s, v) => s + v.likeCount, 0),
        totalComments: profile.videos.reduce((s, v) => s + v.commentCount, 0),
        totalShares: profile.videos.reduce((s, v) => s + v.shareCount, 0),
      },
      videos: profile.videos.map((v) => ({
        id: v.id,
        title: v.caption,
        views: v.viewCount,
        likes: v.likeCount,
        comments: v.commentCount,
        shares: v.shareCount,
        thumbnail: v.coverUrl || "",
        createdAt: v.timestamp,
      })),
    };

    await supabase.from("cached_data").upsert(
      {
        key: `tiktok:${userId}`,
        value: tiktokData,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );

    return NextResponse.json({
      success: true,
      profile: {
        username: profile.username,
        followers: profile.followersCount,
        videos: profile.videos.length,
      },
    });
  } catch (error) {
    console.error("[connect/tiktok] Error:", error);
    return NextResponse.json(
      { error: "Failed to scrape TikTok profile. Please try again." },
      { status: 500 }
    );
  }
}
