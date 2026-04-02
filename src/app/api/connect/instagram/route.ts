import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { checkAccountLimit } from "@/lib/account-limits";
import { scrapeInstagramProfile, scrapeInstagramComments } from "@/lib/apify";

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { handle } = await req.json();
  if (!handle) {
    return NextResponse.json({ error: "Instagram handle is required" }, { status: 400 });
  }

  const { allowed, reason } = await checkAccountLimit(userId, "instagram");
  if (!allowed) {
    return NextResponse.json(
      { error: reason === "platform_not_allowed" ? "Upgrade to Pro to connect this platform" : "Account limit reached" },
      { status: 403 }
    );
  }

  try {
    const profile = await scrapeInstagramProfile(handle);
    if (!profile) {
      return NextResponse.json({ error: "Could not find that Instagram profile. Make sure the handle is correct and the account is public." }, { status: 404 });
    }

    const supabase = getSupabaseAdmin();

    // Upsert connected account
    await supabase.from("connected_accounts").upsert(
      {
        user_id: userId,
        platform: "instagram",
        platform_username: profile.username,
        platform_user_id: profile.username,
        status: "active",
        last_synced: new Date().toISOString(),
      },
      { onConflict: "user_id,platform" }
    );

    // Upsert profile data
    await supabase.from("instagram_profiles").upsert(
      {
        user_id: userId,
        username: profile.username,
        follower_count: profile.followersCount,
        following_count: profile.followsCount,
        media_count: profile.postsCount,
        profile_picture_url: profile.profilePicUrl,
      },
      { onConflict: "user_id" }
    );

    // Delete old posts and insert new ones
    await supabase.from("instagram_posts").delete().eq("user_id", userId);

    if (profile.posts.length > 0) {
      await supabase.from("instagram_posts").insert(
        profile.posts.map((p) => ({
          user_id: userId,
          post_id: p.id,
          caption: p.caption,
          likes: p.likesCount,
          comments_count: p.commentsCount,
          media_type: p.type,
          timestamp: p.timestamp,
          permalink: p.url,
        }))
      );
    }

    // Scrape comments from top posts (10 total across top 3 posts)
    const postUrls = profile.posts
      .filter((p) => p.url)
      .map((p) => p.url);

    try {
      const comments = await scrapeInstagramComments(postUrls, 10);
      if (comments.length > 0) {
        await supabase.from("instagram_comments").delete().eq("user_id", userId);
        await supabase.from("instagram_comments").insert(
          comments.map((c) => ({
            user_id: userId,
            comment_id: c.id,
            username: c.username,
            text: c.text,
            timestamp: c.timestamp,
          }))
        );
      }
    } catch (commentErr) {
      // Comments are optional — don't fail the whole sync
      console.error("[connect/instagram] Comment scrape failed:", commentErr);
    }

    return NextResponse.json({
      success: true,
      profile: {
        username: profile.username,
        follower_count: profile.followersCount,
        posts: profile.posts.length,
      },
    });
  } catch (error) {
    console.error("[connect/instagram] Error:", error);
    return NextResponse.json(
      { error: "Failed to scrape Instagram profile. Please try again." },
      { status: 500 }
    );
  }
}
