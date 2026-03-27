import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { syncInstagram, syncYouTube, syncFacebook, syncGmail } from "@/lib/platform-sync";

const SYNC_MAP: Record<string, (userId: string) => Promise<unknown>> = {
  instagram: syncInstagram,
  youtube: syncYouTube,
  facebook: syncFacebook,
  gmail: syncGmail,
};

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  // Get all active connected accounts
  const { data: accounts } = await supabase
    .from("connected_accounts")
    .select("user_id, platform")
    .eq("status", "active");

  if (!accounts || accounts.length === 0) {
    return NextResponse.json({ message: "No accounts to sync" });
  }

  // Group by user
  const userPlatforms = new Map<string, string[]>();
  for (const acct of accounts) {
    const platforms = userPlatforms.get(acct.user_id) || [];
    platforms.push(acct.platform);
    userPlatforms.set(acct.user_id, platforms);
  }

  const results: Array<{ userId: string; platform: string; success: boolean }> = [];

  for (const [userId, platforms] of userPlatforms) {
    for (const platform of platforms) {
      const syncFn = SYNC_MAP[platform];
      if (!syncFn) continue;

      try {
        const result = await syncFn(userId) as { success: boolean };
        results.push({ userId, platform, success: result.success });
      } catch {
        results.push({ userId, platform, success: false });
      }
    }
  }

  return NextResponse.json({
    message: `Synced ${results.length} accounts`,
    results,
  });
}
