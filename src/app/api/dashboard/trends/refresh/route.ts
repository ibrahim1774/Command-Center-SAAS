import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { scrapeTikTokTrends, scrapeCrossPlatformTrends } from "@/lib/apify";
import { normalizeDailyTrends, normalizeWeeklyReport } from "@/lib/trends";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { type } = await req.json();

    if (type !== "daily" && type !== "weekly") {
      return NextResponse.json(
        { error: "Invalid type. Must be 'daily' or 'weekly'" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const now = new Date().toISOString();

    if (type === "daily") {
      const raw = await scrapeTikTokTrends();
      const trends = normalizeDailyTrends(raw);

      await supabase
        .from("cached_data")
        .upsert(
          { key: "trends:daily:global", value: trends, updated_at: now },
          { onConflict: "key" }
        );

      return NextResponse.json({ trends, lastUpdated: now, stale: false });
    } else {
      const raw = await scrapeCrossPlatformTrends();
      const report = normalizeWeeklyReport(raw);

      await supabase
        .from("cached_data")
        .upsert(
          { key: "trends:weekly:global", value: report, updated_at: now },
          { onConflict: "key" }
        );

      return NextResponse.json({ report, lastUpdated: now, stale: false });
    }
  } catch (error) {
    console.error("Trends refresh error:", error);
    return NextResponse.json(
      { error: "Failed to refresh trends. The scraper may have timed out." },
      { status: 500 }
    );
  }
}
