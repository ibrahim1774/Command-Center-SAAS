import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("cached_data")
    .select("value")
    .eq("key", `test_mode:${userId}`)
    .single();

  const enabled = (data?.value as Record<string, boolean>)?.enabled || false;
  return NextResponse.json({ enabled });
}

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { enabled } = await req.json();

  const supabase = getSupabaseAdmin();
  await supabase.from("cached_data").upsert(
    { key: `test_mode:${userId}`, value: { enabled: !!enabled }, updated_at: new Date().toISOString() },
    { onConflict: "key" }
  );

  return NextResponse.json({ success: true, enabled: !!enabled });
}
