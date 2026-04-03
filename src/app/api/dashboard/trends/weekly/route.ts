import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { WeeklyReport } from "@/lib/trends";

const CACHE_KEY = "trends:weekly:global";
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

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
        report: cached.value as WeeklyReport,
        lastUpdated: cached.updated_at,
        stale,
      });
    }

    return NextResponse.json({
      report: null,
      lastUpdated: null,
      stale: true,
    });
  } catch (error) {
    console.error("Weekly trends GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch weekly report" },
      { status: 500 }
    );
  }
}
