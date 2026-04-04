import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "";

  try {
    const userId = await getAuthenticatedUserId(req);

    if (!userId) {
      // Not authenticated — send to pricing as guest
      return NextResponse.redirect(`${appUrl}/pricing`);
    }

    // Check if user already has a paid subscription
    const supabase = getSupabaseAdmin();
    const { data: user } = await supabase
      .from("users")
      .select("plan")
      .eq("id", userId)
      .single();

    if (user?.plan && user.plan !== "free") {
      // Already has a paid plan — go to dashboard
      return NextResponse.redirect(`${appUrl}/dashboard`);
    }

    // No subscription — send to pricing to pick a plan
    return NextResponse.redirect(`${appUrl}/pricing`);
  } catch (error) {
    console.error("[auth/post-signup] Error:", error);
    return NextResponse.redirect(`${appUrl}/pricing`);
  }
}
