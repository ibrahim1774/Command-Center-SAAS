import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { checkAccountLimit } from "@/lib/account-limits";

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const { allowed, limit } = await checkAccountLimit(userId);
  if (!allowed) {
    return NextResponse.redirect(
      new URL(`/dashboard/settings?error=limit_reached&max=${limit}`, req.url)
    );
  }

  const workspaceId = process.env.UNIFIED_WORKSPACE_ID!;
  const baseUrl = process.env.NEXTAUTH_URL!;

  const successRedirect = encodeURIComponent(
    `${baseUrl}/api/connect/callback?platform=youtube`
  );
  const failureRedirect = encodeURIComponent(
    `${baseUrl}/dashboard/settings?error=youtube_denied`
  );

  const authUrl =
    `https://api.unified.to/unified/integration/auth/${workspaceId}/youtube` +
    `?success_redirect=${successRedirect}` +
    `&failure_redirect=${failureRedirect}` +
    `&state=${userId}`;

  return NextResponse.redirect(authUrl);
}
