import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { DailyTrends } from "@/lib/trends";

const CACHE_KEY = "trends:daily:global";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data: cached } = await supabase
      .from("cached_data")
      .select("value, updated_at")
      .eq("key", CACHE_KEY)
      .single();

    if (cached) {
      const age = Date.now() - new Date(cached.updated_at).getTime();
      const stale = age > CACHE_TTL_MS;

      return NextResponse.json({
        trends: cached.value as DailyTrends,
        lastUpdated: cached.updated_at,
        stale,
      });
    }

    // No cached data at all
    return NextResponse.json({
      trends: null,
      lastUpdated: null,
      stale: true,
    });
  } catch (error) {
    console.error("Daily trends GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily trends" },
      { status: 500 }
    );
  }
}
