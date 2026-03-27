import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

// GET: Return pending Instagram accounts for the current user
export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("cached_data")
    .select("value, updated_at")
    .eq("key", `ig_picker_${userId}`)
    .single();

  if (error || !data) {
    return NextResponse.json({ accounts: [] });
  }

  // Check if the picker data is still valid (10 minute TTL)
  const age = Date.now() - new Date(data.updated_at).getTime();
  if (age > 10 * 60 * 1000) {
    // Expired — clean up
    await supabase.from("cached_data").delete().eq("key", `ig_picker_${userId}`);
    return NextResponse.json({ accounts: [], expired: true });
  }

  const { accounts } = data.value as {
    accounts: { id: string; username: string; profilePicture: string | null }[];
  };

  return NextResponse.json({ accounts });
}

// POST: Select an Instagram account to connect
export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { igUserId } = await req.json();
  if (!igUserId) {
    return NextResponse.json({ error: "Missing igUserId" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("cached_data")
    .select("value")
    .eq("key", `ig_picker_${userId}`)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "No pending Instagram accounts. Please try connecting again." }, { status: 400 });
  }

  const { accounts, accessToken } = data.value as {
    accounts: { id: string; username: string; profilePicture: string | null }[];
    accessToken: string;
  };

  const selected = accounts.find((a) => a.id === igUserId);
  if (!selected) {
    return NextResponse.json({ error: "Account not found" }, { status: 400 });
  }

  // Upsert connected account
  await supabase.from("connected_accounts").upsert(
    {
      user_id: userId,
      platform: "instagram",
      access_token: accessToken,
      refresh_token: null,
      token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      platform_username: selected.username,
      platform_user_id: selected.id,
      scopes: "instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement",
      connected_at: new Date().toISOString(),
      status: "active",
    },
    { onConflict: "user_id,platform" }
  );

  // Clean up picker data
  await supabase.from("cached_data").delete().eq("key", `ig_picker_${userId}`);

  return NextResponse.json({ success: true, username: selected.username });
}
