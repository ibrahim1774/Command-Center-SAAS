import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from("connected_accounts")
    .select("platform, platform_username, status, last_synced, connected_at")
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 });
  }

  return NextResponse.json({ accounts: data });
}

export async function DELETE(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { platform } = await req.json();
  if (!platform) {
    return NextResponse.json({ error: "Platform required" }, { status: 400 });
  }

  const { error } = await getSupabaseAdmin()
    .from("connected_accounts")
    .delete()
    .eq("user_id", userId)
    .eq("platform", platform);

  if (error) {
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
