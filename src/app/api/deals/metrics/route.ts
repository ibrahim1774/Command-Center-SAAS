import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isDemoUser } from "@/lib/demo-mode";

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (await isDemoUser(req)) {
    return NextResponse.json({
      activeDeals: 7,
      pipelineValue: 142500,
      pendingPayouts: 28400,
      earnedThisMonth: 48200,
      monthlyEarnings: [
        { month: "Oct", amount: 18500 },
        { month: "Nov", amount: 24200 },
        { month: "Dec", amount: 31400 },
        { month: "Jan", amount: 22800 },
        { month: "Feb", amount: 28900 },
        { month: "Mar", amount: 48200 },
      ],
    });
  }

  const supabase = getSupabaseAdmin();

  const { data: deals } = await supabase
    .from("brand_deals")
    .select("deal_value, status, payment_status, payment_received, updated_at")
    .eq("user_id", userId);

  const allDeals = deals || [];

  const activeDeals = allDeals.filter((d) => d.status !== "completed").length;
  const pipelineValue = allDeals
    .filter((d) => d.status !== "completed")
    .reduce((sum, d) => sum + (Number(d.deal_value) || 0), 0);
  const pendingPayouts = allDeals
    .filter((d) => d.status === "completed" && d.payment_status !== "paid")
    .reduce((sum, d) => sum + (Number(d.deal_value) || 0), 0);

  // Earned this month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const earnedThisMonth = allDeals
    .filter(
      (d) =>
        d.payment_status === "paid" &&
        d.updated_at &&
        d.updated_at >= monthStart
    )
    .reduce((sum, d) => sum + (Number(d.payment_received) || 0), 0);

  // Monthly earnings for last 6 months
  const monthlyEarnings: { month: string; amount: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = d.toISOString();
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString();
    const monthName = d.toLocaleDateString("en-US", { month: "short" });

    const amount = allDeals
      .filter(
        (deal) =>
          deal.payment_status === "paid" &&
          deal.updated_at &&
          deal.updated_at >= start &&
          deal.updated_at < end
      )
      .reduce((sum, deal) => sum + (Number(deal.payment_received) || 0), 0);

    monthlyEarnings.push({ month: monthName, amount });
  }

  return NextResponse.json({
    activeDeals,
    pipelineValue,
    pendingPayouts,
    earnedThisMonth,
    monthlyEarnings,
  });
}
