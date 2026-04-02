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
    .eq("key", `ig_goal:${userId}`)
    .single();

  return NextResponse.json({ target: (data?.value as Record<string, number>)?.target || null });
}

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { target } = await req.json();
  if (!target || typeof target !== "number" || target <= 0) {
    return NextResponse.json({ error: "Invalid target" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  await supabase.from("cached_data").upsert(
    { key: `ig_goal:${userId}`, value: { target }, updated_at: new Date().toISOString() },
    { onConflict: "key" }
  );

  return NextResponse.json({ success: true, target });
}
