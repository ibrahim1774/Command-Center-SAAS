import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("cached_data")
    .select("value")
    .eq("key", `trends:keywords:${userId}`)
    .single();

  return NextResponse.json({
    keywords: data?.value?.keywords || [],
  });
}

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { keywords } = await req.json();

  if (!Array.isArray(keywords)) {
    return NextResponse.json({ error: "keywords must be an array" }, { status: 400 });
  }

  // Clean and deduplicate
  const cleaned = [...new Set(
    keywords
      .map((k: string) => k.trim().toLowerCase())
      .filter((k: string) => k.length > 0)
  )].slice(0, 10); // Max 10 keywords

  const supabase = getSupabaseAdmin();
  await supabase
    .from("cached_data")
    .upsert(
      {
        key: `trends:keywords:${userId}`,
        value: { keywords: cleaned },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );

  return NextResponse.json({ keywords: cleaned });
}
