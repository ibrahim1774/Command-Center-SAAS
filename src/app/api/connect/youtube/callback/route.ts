import { NextRequest, NextResponse } from "next/server";
import { validateStateCookie, getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code || !state) {
    return NextResponse.redirect(new URL("/dashboard/settings?error=youtube_denied", req.url));
  }

  const isValid = await validateStateCookie("youtube", state);
  if (!isValid) {
    return NextResponse.redirect(new URL("/dashboard/settings?error=invalid_state", req.url));
  }

  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.YOUTUBE_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/connect/youtube/callback`,
      grant_type: "authorization_code",
    }),
  });

  const tokens = await tokenRes.json();
  if (!tokens.access_token) {
    return NextResponse.redirect(new URL("/dashboard/settings?error=youtube_token_failed", req.url));
  }

  // Fetch channel info
  const channelRes = await fetch(
    "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
    { headers: { Authorization: `Bearer ${tokens.access_token}` } }
  );
  const channelData = await channelRes.json();
  const channel = channelData.items?.[0];

  // Upsert connected account
  await getSupabaseAdmin().from("connected_accounts").upsert(
    {
      user_id: userId,
      platform: "youtube",
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || null,
      token_expires_at: tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        : null,
      platform_username: channel?.snippet?.title || null,
      platform_user_id: channel?.id || null,
      scopes: "youtube.readonly",
      connected_at: new Date().toISOString(),
      status: "active",
    },
    { onConflict: "user_id,platform" }
  );

  return NextResponse.redirect(new URL("/dashboard/settings?connected=youtube", req.url));
}
