import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { checkAccountLimit } from "@/lib/account-limits";

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const { allowed, reason } = await checkAccountLimit(userId, "instagram");
  if (!allowed) {
    const errorParam = reason === "platform_not_allowed" ? "upgrade_required" : "limit_reached";
    return NextResponse.redirect(
      new URL(`/dashboard/settings?error=${errorParam}`, req.url)
    );
  }

  const workspaceId = process.env.UNIFIED_WORKSPACE_ID!;
  const baseUrl = process.env.NEXTAUTH_URL!;

  const successRedirect = encodeURIComponent(
    `${baseUrl}/api/connect/callback?platform=instagram`
  );
  const failureRedirect = encodeURIComponent(
    `${baseUrl}/dashboard/settings?error=instagram_denied`
  );

  const authUrl =
    `https://api.unified.to/unified/integration/auth/${workspaceId}/instagram` +
    `?success_redirect=${successRedirect}` +
    `&failure_redirect=${failureRedirect}` +
    `&state=${userId}`;

  return NextResponse.redirect(authUrl);
}
