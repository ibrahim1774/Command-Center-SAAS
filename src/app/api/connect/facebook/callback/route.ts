import { NextRequest, NextResponse } from "next/server";
import { validateStateCookie, getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code || !state) {
    return NextResponse.redirect(new URL("/dashboard/settings?error=facebook_denied", req.url));
  }

  const isValid = await validateStateCookie("facebook", state);
  if (!isValid) {
    return NextResponse.redirect(new URL("/dashboard/settings?error=invalid_state", req.url));
  }

  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Exchange code for short-lived token
  const tokenRes = await fetch("https://graph.facebook.com/v21.0/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.META_CLIENT_ID!,
      client_secret: process.env.META_CLIENT_SECRET!,
      redirect_uri: process.env.FACEBOOK_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/connect/facebook/callback`,
      grant_type: "authorization_code",
    }),
  });

  const shortLivedTokens = await tokenRes.json();
  if (!shortLivedTokens.access_token) {
    return NextResponse.redirect(new URL("/dashboard/settings?error=facebook_token_failed", req.url));
  }

  // Exchange for long-lived token
  const longLivedRes = await fetch(
    `https://graph.facebook.com/v21.0/oauth/access_token?` +
      new URLSearchParams({
        grant_type: "fb_exchange_token",
        client_id: process.env.META_CLIENT_ID!,
        client_secret: process.env.META_CLIENT_SECRET!,
        fb_exchange_token: shortLivedTokens.access_token,
      })
  );
  const longLivedTokens = await longLivedRes.json();
  const accessToken = longLivedTokens.access_token || shortLivedTokens.access_token;

  // Fetch pages
  const pagesRes = await fetch(
    `https://graph.facebook.com/v21.0/me/accounts?access_token=${accessToken}`
  );
  const pagesData = await pagesRes.json();
  const firstPage = pagesData.data?.[0];

  // Upsert connected account (long-lived token expires in ~60 days)
  await getSupabaseAdmin().from("connected_accounts").upsert(
    {
      user_id: userId,
      platform: "facebook",
      access_token: accessToken,
      refresh_token: null,
      token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      platform_username: firstPage?.name || null,
      platform_user_id: firstPage?.id || null,
      scopes: "pages_show_list,pages_read_engagement,public_profile",
      connected_at: new Date().toISOString(),
      status: "active",
    },
    { onConflict: "user_id,platform" }
  );

  return NextResponse.redirect(new URL("/dashboard/settings?connected=facebook", req.url));
}
