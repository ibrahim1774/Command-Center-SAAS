import { NextRequest, NextResponse } from "next/server";
import { generateState, setStateCookie, getAuthenticatedUserId } from "@/lib/oauth-helpers";

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const state = generateState();
  await setStateCookie("facebook", state);

  const params = new URLSearchParams({
    client_id: process.env.META_CLIENT_ID!,
    redirect_uri: process.env.FACEBOOK_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/connect/facebook/callback`,
    response_type: "code",
    scope: "pages_show_list,pages_read_engagement,public_profile",
    state,
  });

  return NextResponse.redirect(`https://www.facebook.com/v21.0/dialog/oauth?${params}`);
}
