import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    const { data: sub, error } = await supabase
      .from("subscriptions")
      .select(
        "plan, status, current_period_end, stripe_customer_id"
      )
      .eq("user_id", userId)
      .single();

    if (error || !sub) {
      return NextResponse.json({ plan: "free" });
    }

    return NextResponse.json({
      plan: sub.plan || "free",
      status: sub.status,
      currentPeriodEnd: sub.current_period_end,
      stripeCustomerId: sub.stripe_customer_id,
    });
  } catch (error) {
    console.error("[user/subscription] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}
