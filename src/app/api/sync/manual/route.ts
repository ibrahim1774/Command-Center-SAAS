import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { syncInstagram, syncYouTube, syncFacebook, syncGmail } from "@/lib/platform-sync";

const SYNC_MAP: Record<string, (userId: string) => Promise<unknown>> = {
  instagram: syncInstagram,
  youtube: syncYouTube,
  facebook: syncFacebook,
  gmail: syncGmail,
};

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { platform } = await req.json();
  const syncFn = SYNC_MAP[platform];
  if (!syncFn) {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }

  const result = await syncFn(userId);
  return NextResponse.json(result);
}
