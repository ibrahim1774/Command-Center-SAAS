import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getAnthropicClient } from "@/lib/anthropic";
import { parseClaudeJSON } from "@/lib/parse-claude-json";
import type { AIInsightsResponse } from "@/types/ai";

const INSIGHTS_SCHEMA = `{
  "daily_briefing": { "summary": "2-3 sentence overview of highlights and priorities", "highlights": ["specific highlight 1", "highlight 2", "highlight 3", "highlight 4"] },
  "whats_working": [{ "text": "cross-platform insight referencing real data", "metric": "+X% or similar" }],
  "whats_flopping": [{ "text": "cross-platform insight referencing real data", "metric": "-X% or similar" }],
  "instagram": { "whats_working": [{ "text": "IG-specific insight", "metric": "optional metric" }], "whats_flopping": [{ "text": "IG-specific insight", "metric": "optional metric" }] },
  "youtube": { "whats_working": [{ "text": "YT-specific insight", "metric": "optional" }], "whats_flopping": [{ "text": "YT-specific insight", "metric": "optional" }], "content_ideas": ["idea 1", "idea 2", "idea 3"] },
  "facebook": { "whats_working": [{ "text": "FB-specific insight", "metric": "optional" }], "whats_flopping": [{ "text": "FB-specific insight", "metric": "optional" }] },
  "tiktok": { "whats_working": [{ "text": "TikTok-specific insight", "metric": "optional" }], "whats_flopping": [{ "text": "TikTok-specific insight", "metric": "optional" }] },
  "top_comments": [{ "platform": "instagram|youtube|facebook|tiktok", "username": "...", "text": "comment text", "post_reference": "which post it's on" }]
}`;

function today(): string {
  return new Date().toISOString().split("T")[0];
}

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data: cached } = await supabase
    .from("ai_insights")
    .select("insights_json")
    .eq("user_id", userId)
    .eq("date", today())
    .eq("model_used", "claude-haiku-4-5-20251001")
    .single();

  if (cached) {
    return NextResponse.json({ cached: true, insights: cached.insights_json });
  }

  return NextResponse.json({ cached: false, insights: null });
}

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { searchParams } = new URL(req.url);
  const regenerate = searchParams.get("regenerate") === "true";

  // Delete cache if regenerating
  if (regenerate) {
    await supabase
      .from("ai_insights")
      .delete()
      .eq("user_id", userId)
      .eq("date", today())
      .eq("model_used", "claude-haiku-4-5-20251001");
  }

  // Check cache (avoid race)
  if (!regenerate) {
    const { data: cached } = await supabase
      .from("ai_insights")
      .select("insights_json")
      .eq("user_id", userId)
      .eq("date", today())
      .eq("model_used", "claude-haiku-4-5-20251001")
      .single();

    if (cached) {
      return NextResponse.json({
        cached: true,
        insights: cached.insights_json,
      });
    }
  }

  // Fetch 30 days of platform data
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)
    .toISOString()
    .split("T")[0];

  const [igPosts, ytVideos, fbPosts, igComments, ytComments] =
    await Promise.all([
      supabase
        .from("instagram_posts")
        .select("caption, likes, comments_count, timestamp, media_type")
        .eq("user_id", userId)
        .gte("timestamp", thirtyDaysAgo)
        .order("timestamp", { ascending: false })
        .limit(30),
      supabase
        .from("youtube_videos")
        .select("title, views, likes, comments_count, published_at")
        .eq("user_id", userId)
        .gte("published_at", thirtyDaysAgo)
        .order("published_at", { ascending: false })
        .limit(20),
      supabase
        .from("facebook_posts")
        .select(
          "message, reactions, comments_count, shares, reach, created_time, post_type"
        )
        .eq("user_id", userId)
        .gte("created_time", thirtyDaysAgo)
        .order("created_time", { ascending: false })
        .limit(20),
      supabase
        .from("instagram_comments")
        .select("username, text")
        .eq("user_id", userId)
        .order("timestamp", { ascending: false })
        .limit(15),
      supabase
        .from("youtube_comments")
        .select("author, text")
        .eq("user_id", userId)
        .order("published_at", { ascending: false })
        .limit(15),
    ]);

  // Log any Supabase query errors
  for (const [name, result] of Object.entries({ igPosts, ytVideos, fbPosts, igComments, ytComments })) {
    if (result.error) console.error(`[ai/insights] Supabase query error (${name}):`, result.error.message);
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
    instagram_comments: igComments.data || [],
    youtube_comments: ytComments.data || [],
  };

  // Check if there's any data at all
  const totalItems = Object.values(platformData).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  if (totalItems === 0) {
    return NextResponse.json(
      { error: "No platform data available. Connect and sync your accounts first." },
      { status: 400 }
    );
  }

  try {
    const client = getAnthropicClient();
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      system:
        "You are an elite social media strategist analyzing a content creator's performance across Instagram, YouTube, Facebook, and TikTok. " +
        "Be specific with numbers. Reference actual post captions and video titles from the data. Give actionable, data-driven advice. " +
        "Each whats_working and whats_flopping array should have 3-4 items. " +
        "The metric field should be a short stat like '+24% engagement' or '340K views'. " +
        "For platforms with no data, return empty arrays for whats_working and whats_flopping. " +
        "Return ONLY valid JSON matching this exact schema:\n\n" +
        INSIGHTS_SCHEMA,
      messages: [
        {
          role: "user",
          content: `Analyze this creator's last 30 days of data and generate insights:\n\n${JSON.stringify(platformData, null, 2)}`,
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";
    const insights = parseClaudeJSON<AIInsightsResponse>(responseText);

    // Store in database
    await supabase.from("ai_insights").insert({
      user_id: userId,
      date: today(),
      insights_json: insights,
      model_used: "claude-haiku-4-5-20251001",
    });

    return NextResponse.json({ cached: false, insights });
  } catch (err) {
    console.error("AI insights generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}
