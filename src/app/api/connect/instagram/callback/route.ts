import { NextRequest, NextResponse } from "next/server";
import { validateStateCookie, getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code || !state) {
    return NextResponse.redirect(new URL("/dashboard/settings?error=instagram_denied", req.url));
  }

  const isValid = await validateStateCookie("instagram", state);
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
      redirect_uri: process.env.INSTAGRAM_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/connect/instagram/callback`,
      grant_type: "authorization_code",
    }),
  });

  const shortLivedTokens = await tokenRes.json();
  if (!shortLivedTokens.access_token) {
    return NextResponse.redirect(new URL("/dashboard/settings?error=instagram_token_failed", req.url));
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

  let igUserId: string | null = null;
  let igUsername: string | null = null;

  // For each page, check for Instagram business account
  if (pagesData.data) {
    for (const page of pagesData.data) {
      const igRes = await fetch(
        `https://graph.facebook.com/v21.0/${page.id}?fields=instagram_business_account&access_token=${accessToken}`
      );
      const igData = await igRes.json();

      if (igData.instagram_business_account?.id) {
        igUserId = igData.instagram_business_account.id;

        // Fetch IG profile
        const profileRes = await fetch(
          `https://graph.facebook.com/v21.0/${igUserId}?fields=username,profile_picture_url&access_token=${accessToken}`
        );
        const profile = await profileRes.json();
        igUsername = profile.username || null;
        break;
      }
    }
  }

  if (!igUserId) {
    return NextResponse.redirect(
      new URL("/dashboard/settings?error=instagram_no_business_account", req.url)
    );
  }

  // Upsert connected account (long-lived token expires in ~60 days)
  await getSupabaseAdmin().from("connected_accounts").upsert(
    {
      user_id: userId,
      platform: "instagram",
      access_token: accessToken,
      refresh_token: null,
      token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      platform_username: igUsername,
      platform_user_id: igUserId,
      scopes: "instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement",
      connected_at: new Date().toISOString(),
      status: "active",
    },
    { onConflict: "user_id,platform" }
  );

  return NextResponse.redirect(new URL("/dashboard/settings?connected=instagram", req.url));
}
