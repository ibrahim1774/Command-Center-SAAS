import { NextRequest, NextResponse } from "next/server";
import { generateState, setStateCookie, getAuthenticatedUserId } from "@/lib/oauth-helpers";

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const state = generateState();
  await setStateCookie("instagram", state);

  const params = new URLSearchParams({
    client_id: process.env.META_CLIENT_ID!,
    redirect_uri: process.env.INSTAGRAM_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/connect/instagram/callback`,
    response_type: "code",
    scope: "instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement",
    state,
  });

  return NextResponse.redirect(`https://www.facebook.com/v21.0/dialog/oauth?${params}`);
}
