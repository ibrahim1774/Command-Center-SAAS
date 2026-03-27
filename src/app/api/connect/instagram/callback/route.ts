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

  // Collect ALL Instagram business accounts across all pages
  const igAccounts: { id: string; username: string; profilePicture: string | null }[] = [];

  if (pagesData.data) {
    for (const page of pagesData.data) {
      const igRes = await fetch(
        `https://graph.facebook.com/v21.0/${page.id}?fields=instagram_business_account&access_token=${accessToken}`
      );
      const igData = await igRes.json();

      if (igData.instagram_business_account?.id) {
        const igId = igData.instagram_business_account.id;

        // Fetch IG profile
        const profileRes = await fetch(
          `https://graph.facebook.com/v21.0/${igId}?fields=username,profile_picture_url&access_token=${accessToken}`
        );
        const profile = await profileRes.json();

        igAccounts.push({
          id: igId,
          username: profile.username || `Account ${igAccounts.length + 1}`,
          profilePicture: profile.profile_picture_url || null,
        });
      }
    }
  }

  if (igAccounts.length === 0) {
    return NextResponse.redirect(
      new URL("/dashboard/settings?error=instagram_no_business_account", req.url)
    );
  }

  const supabase = getSupabaseAdmin();

  // If only one account, auto-connect
  if (igAccounts.length === 1) {
    const account = igAccounts[0];
    await supabase.from("connected_accounts").upsert(
      {
        user_id: userId,
        platform: "instagram",
        access_token: accessToken,
        refresh_token: null,
        token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        platform_username: account.username,
        platform_user_id: account.id,
        scopes: "instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement",
        connected_at: new Date().toISOString(),
        status: "active",
      },
      { onConflict: "user_id,platform" }
    );

    return NextResponse.redirect(new URL("/dashboard/settings?connected=instagram", req.url));
  }

  // Multiple accounts found — store temporarily for picker
  await supabase.from("cached_data").upsert(
    {
      key: `ig_picker_${userId}`,
      value: { accounts: igAccounts, accessToken },
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );

  return NextResponse.redirect(new URL("/dashboard/settings?ig_pick=true", req.url));
}
