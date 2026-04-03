import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { scrapeCrossPlatformTrends } from "@/lib/apify";
import { normalizeWeeklyReport } from "@/lib/trends";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { type } = await req.json();

    if (type !== "weekly") {
      return NextResponse.json(
        { error: "Invalid type. Must be 'weekly'" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const now = new Date().toISOString();

    // Fetch user's trend keywords if set
    const { data: keywordsData } = await supabase
      .from("cached_data")
      .select("value")
      .eq("key", `trends:keywords:${userId}`)
      .single();

    const keywords = keywordsData?.value?.keywords as string[] | undefined;

    const raw = await scrapeCrossPlatformTrends(keywords);
    const report = normalizeWeeklyReport(raw);

    await Promise.all([
      supabase
        .from("cached_data")
        .upsert(
          { key: "trends:weekly:global", value: report, updated_at: now },
          { onConflict: "key" }
        ),
      supabase
        .from("cached_data")
        .upsert(
          { key: "trends:weekly:raw", value: raw, updated_at: now },
          { onConflict: "key" }
        ),
    ]);

    return NextResponse.json({ report, lastUpdated: now, stale: false, _raw: raw });
  } catch (error) {
    console.error("Trends refresh error:", error);
    return NextResponse.json(
      { error: "Failed to refresh trends. The scraper may have timed out." },
      { status: 500 }
    );
  }
}
