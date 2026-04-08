import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getAnthropicClient } from "@/lib/anthropic";
import { parseClaudeJSON } from "@/lib/parse-claude-json";
import type { DeepAnalysisResponse } from "@/types/ai";

const ANALYSIS_SCHEMA = `{
  "executive_summary": "detailed paragraph summarizing overall performance and key trends",
  "growth_trajectory": "analysis of follower growth patterns across platforms with predictions",
  "content_strategy": "detailed recommendations for the next 30 days based on what's working",
  "best_posting_times": ["Monday 9am - highest engagement on Instagram", "Wednesday 2pm - best for YouTube premieres"],
  "audience_insights": "who is engaging most and what types of content they respond to",
  "competitor_gaps": "what types of content they should try based on platform trends",
  "revenue_opportunities": "brand deal and monetization suggestions based on their niche and engagement"
}`;

function today(): string {
  return new Date().toISOString().split("T")[0];
}

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  // Check user plan
  const { data: user } = await supabase
    .from("users")
    .select("plan")
    .eq("id", userId)
    .single();

  if (!user || !["pro", "business"].includes(user.plan)) {
    return NextResponse.json(
      { error: "Deep Analysis is available on Pro and Business plans" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const regenerate = searchParams.get("regenerate") === "true";

  // Check cache
  if (!regenerate) {
    const { data: cached } = await supabase
      .from("ai_insights")
      .select("insights_json")
      .eq("user_id", userId)
      .eq("date", today())
      .eq("model_used", "claude-sonnet-4-20250514")
      .single();

    if (cached) {
      return NextResponse.json({
        cached: true,
        analysis: cached.insights_json,
      });
    }
  } else {
    await supabase
      .from("ai_insights")
      .delete()
      .eq("user_id", userId)
      .eq("date", today())
      .eq("model_used", "claude-sonnet-4-20250514");
  }

  // Fetch 90 days of data
  const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000)
    .toISOString()
    .split("T")[0];

  const [igPosts, ytVideos, fbPosts, emails, igMetrics, igComments, ytComments] =
    await Promise.all([
      supabase
        .from("instagram_posts")
        .select("caption, likes, comments_count, timestamp, media_type")
        .eq("user_id", userId)
        .gte("timestamp", ninetyDaysAgo)
        .order("timestamp", { ascending: false })
        .limit(60),
      supabase
        .from("youtube_videos")
        .select("title, views, likes, comments_count, published_at")
        .eq("user_id", userId)
        .gte("published_at", ninetyDaysAgo)
        .order("published_at", { ascending: false })
        .limit(40),
      supabase
        .from("facebook_posts")
        .select(
          "message, reactions, comments_count, shares, reach, created_time, post_type"
        )
        .eq("user_id", userId)
        .gte("created_time", ninetyDaysAgo)
        .order("created_time", { ascending: false })
        .limit(40),
      supabase
        .from("emails")
        .select("from_name, subject, category, priority, received_at")
        .eq("user_id", userId)
        .gte("received_at", ninetyDaysAgo)
        .order("received_at", { ascending: false })
        .limit(50),
      supabase
        .from("instagram_daily_metrics")
        .select("date, follower_count, reach, impressions")
        .eq("user_id", userId)
        .gte("date", ninetyDaysAgo)
        .order("date", { ascending: true }),
      supabase
        .from("instagram_comments")
        .select("username, text, timestamp")
        .eq("user_id", userId)
        .order("timestamp", { ascending: false })
        .limit(30),
      supabase
        .from("youtube_comments")
        .select("author, text, published_at")
        .eq("user_id", userId)
        .order("published_at", { ascending: false })
        .limit(30),
    ]);

  // Log any Supabase query errors
  for (const [name, result] of Object.entries({ igPosts, ytVideos, fbPosts, emails, igMetrics, igComments, ytComments })) {
    if (result.error) console.error(`[ai/deep-analysis] Supabase query error (${name}):`, result.error.message);
  }

  // Fetch TikTok cached data (stored as JSON blob, not in normalized tables)
  const { data: tiktokCached } = await supabase
    .from("cached_data")
    .select("value")
    .eq("key", `tiktok:${userId}`)
    .single();

  const tiktokVideos = tiktokCached?.value
    ? ((tiktokCached.value as Record<string, unknown>).videos as unknown[] || [])
    : [];

  const platformData = {
    instagram_posts: igPosts.data || [],
    youtube_videos: ytVideos.data || [],
    facebook_posts: fbPosts.data || [],
    tiktok_videos: tiktokVideos,
    emails: emails.data || [],
    instagram_daily_metrics: igMetrics.data || [],
    instagram_comments: igComments.data || [],
    youtube_comments: ytComments.data || [],
  };

  const totalItems = Object.values(platformData).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  if (totalItems === 0) {
    return NextResponse.json(
      { error: "No platform data available for analysis." },
      { status: 400 }
    );
  }

  try {
    const client = getAnthropicClient();
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system:
        "You are a world-class social media strategist providing a deep analysis for a content creator across Instagram, YouTube, Facebook, and TikTok. " +
        "This is a premium report — be thorough, specific, and actionable. " +
        "Reference actual post captions, video titles, and specific numbers from the data. " +
        "Identify patterns over the 90-day period. Make predictions based on trends. " +
        "The audience_insights should describe engagement patterns and demographics inferred from comments. " +
        "Return ONLY valid JSON matching this exact schema:\n\n" +
        ANALYSIS_SCHEMA,
      messages: [
        {
          role: "user",
          content: `Perform a deep analysis of this creator's last 90 days of data:\n\n${JSON.stringify(platformData, null, 2)}`,
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";
    const analysis = parseClaudeJSON<DeepAnalysisResponse>(responseText);

    await supabase.from("ai_insights").insert({
      user_id: userId,
      date: today(),
      insights_json: analysis,
      model_used: "claude-sonnet-4-20250514",
    });

    return NextResponse.json({ cached: false, analysis });
  } catch (err) {
    console.error("Deep analysis error:", err);
    return NextResponse.json(
      { error: "Failed to generate deep analysis" },
      { status: 500 }
    );
  }
}
