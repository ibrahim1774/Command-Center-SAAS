import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const { data: account } = await supabase
    .from("connected_accounts")
    .select("last_synced")
    .eq("user_id", userId)
    .eq("platform", "gmail")
    .eq("status", "active")
    .single();

  if (!account) {
    return NextResponse.json({ connected: false });
  }

  const { data: emails } = await supabase
    .from("emails")
    .select("*")
    .eq("user_id", userId)
    .order("received_at", { ascending: false })
    .limit(30);

  return NextResponse.json({
    connected: true,
    lastSynced: account.last_synced,
    emails: emails || [],
    unreadCount: (emails || []).length, // Approximate since we don't track read status from Gmail
  });
}
