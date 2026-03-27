import { getSupabaseAdmin } from "./supabase-admin";

/**
 * Get a valid Google access token for YouTube.
 * Refreshes automatically if expired or about to expire (within 5 min).
 */
export async function getValidGoogleToken(
  userId: string,
  platform: "youtube"
): Promise<string> {
  const supabase = getSupabaseAdmin();

  const { data: account } = await supabase
    .from("connected_accounts")
    .select("access_token, refresh_token, token_expires_at")
    .eq("user_id", userId)
    .eq("platform", platform)
    .eq("status", "active")
    .single();

  if (!account) throw new Error(`No active ${platform} account found`);

  const expiresAt = account.token_expires_at
    ? new Date(account.token_expires_at).getTime()
    : 0;
  const fiveMinFromNow = Date.now() + 5 * 60 * 1000;

  // Token still valid
  if (expiresAt > fiveMinFromNow) {
    return account.access_token;
  }

  // Need to refresh
  if (!account.refresh_token) {
    await supabase
      .from("connected_accounts")
      .update({ status: "expired" })
      .eq("user_id", userId)
      .eq("platform", platform);
    throw new Error(`${platform} token expired and no refresh token available`);
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: account.refresh_token,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    await supabase
      .from("connected_accounts")
      .update({ status: "expired" })
      .eq("user_id", userId)
      .eq("platform", platform);
    throw new Error(`Failed to refresh ${platform} token: ${res.status}`);
  }

  const tokens = await res.json();
  const newExpiresAt = new Date(
    Date.now() + tokens.expires_in * 1000
  ).toISOString();

  await supabase
    .from("connected_accounts")
    .update({
      access_token: tokens.access_token,
      token_expires_at: newExpiresAt,
    })
    .eq("user_id", userId)
    .eq("platform", platform);

  return tokens.access_token;
}

/**
 * Get a valid Meta access token for Instagram or Facebook.
 * Meta long-lived tokens last 60 days and cannot be refreshed with a refresh_token.
 */
export async function getValidMetaToken(
  userId: string,
  platform: "instagram" | "facebook"
): Promise<string> {
  const supabase = getSupabaseAdmin();

  const { data: account } = await supabase
    .from("connected_accounts")
    .select("access_token, token_expires_at")
    .eq("user_id", userId)
    .eq("platform", platform)
    .eq("status", "active")
    .single();

  if (!account) throw new Error(`No active ${platform} account found`);

  const expiresAt = account.token_expires_at
    ? new Date(account.token_expires_at).getTime()
    : 0;

  if (expiresAt < Date.now()) {
    await supabase
      .from("connected_accounts")
      .update({ status: "expired" })
      .eq("user_id", userId)
      .eq("platform", platform);
    throw new Error(
      `${platform} token expired. Please reconnect your account.`
    );
  }

  return account.access_token;
}
