import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const VALID_PLATFORMS = ["instagram", "youtube", "facebook", "tiktok"];

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const platform = new URL(req.url).searchParams.get("platform");
  if (!platform || !VALID_PLATFORMS.includes(platform)) {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("cached_data")
    .select("value")
    .eq("key", `goal:${platform}:${userId}`)
    .single();

  return NextResponse.json({ target: (data?.value as Record<string, number>)?.target || null });
}

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { platform, target } = await req.json();
  if (!platform || !VALID_PLATFORMS.includes(platform)) {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }
  if (!target || typeof target !== "number" || target <= 0) {
    return NextResponse.json({ error: "Invalid target" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  await supabase.from("cached_data").upsert(
    { key: `goal:${platform}:${userId}`, value: { target }, updated_at: new Date().toISOString() },
    { onConflict: "key" }
  );

  return NextResponse.json({ success: true, target });
}
