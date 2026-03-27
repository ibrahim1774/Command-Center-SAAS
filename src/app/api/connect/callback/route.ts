import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const connectionId = searchParams.get("id");
  const platform = searchParams.get("platform");
  const userId = searchParams.get("state");
  const baseUrl = process.env.NEXTAUTH_URL!;

  if (!connectionId || !platform || !userId) {
    return NextResponse.redirect(
      `${baseUrl}/dashboard/settings?error=connection_failed`
    );
  }

  try {
    // Fetch connection details from Unified.to
    const connectionRes = await fetch(
      `https://api.unified.to/unified/connection/${connectionId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.UNIFIED_API_KEY}`,
        },
      }
    );

    let platformUsername: string | null = null;
    let platformUserId: string | null = null;

    if (connectionRes.ok) {
      const connection = await connectionRes.json();
      platformUsername =
        connection?.auth?.other_auth_info?.username ??
        connection?.auth?.name ??
        null;
      platformUserId =
        connection?.auth?.other_auth_info?.user_id ??
        connection?.auth?.pem ??
        null;
    }

    // Store connection in database
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("connected_accounts").upsert(
      {
        user_id: userId,
        platform,
        unified_connection_id: connectionId,
        access_token: "managed_by_unified",
        platform_username: platformUsername,
        platform_user_id: platformUserId,
        connected_at: new Date().toISOString(),
        status: "active",
      },
      { onConflict: "user_id,platform" }
    );

    if (error) {
      console.error("Failed to store connected account:", error);
      return NextResponse.redirect(
        `${baseUrl}/dashboard/settings?error=connection_failed`
      );
    }

    return NextResponse.redirect(
      `${baseUrl}/dashboard/settings?connected=${platform}`
    );
  } catch (err) {
    console.error("Unified callback error:", err);
    return NextResponse.redirect(
      `${baseUrl}/dashboard/settings?error=connection_failed`
    );
  }
}
