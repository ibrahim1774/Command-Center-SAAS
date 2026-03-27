import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { syncFacebook } from "@/lib/platform-sync";

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncFacebook(userId);
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}
