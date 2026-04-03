import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const [dailyRaw, weeklyRaw, dailyNormalized, weeklyNormalized] = await Promise.all([
    supabase.from("cached_data").select("value, updated_at").eq("key", "trends:daily:raw").single(),
    supabase.from("cached_data").select("value, updated_at").eq("key", "trends:weekly:raw").single(),
    supabase.from("cached_data").select("value, updated_at").eq("key", "trends:daily:global").single(),
    supabase.from("cached_data").select("value, updated_at").eq("key", "trends:weekly:global").single(),
  ]);

  return NextResponse.json({
    daily: {
      raw: dailyRaw.data?.value || null,
      rawUpdated: dailyRaw.data?.updated_at || null,
      normalized: dailyNormalized.data?.value || null,
    },
    weekly: {
      raw: weeklyRaw.data?.value || null,
      rawUpdated: weeklyRaw.data?.updated_at || null,
      normalized: weeklyNormalized.data?.value || null,
    },
  });
}
