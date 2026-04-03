import { NextRequest, NextResponse } from "next/server";
import { getStripe, PLANS, getPriceId, type PlanId, type BillingInterval } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { planId, interval = "monthly" } = (await req.json()) as {
      planId: PlanId;
      interval?: BillingInterval;
    };

    if (!planId || !PLANS[planId]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const priceId = await getPriceId(planId, interval);
    if (!priceId) {
      return NextResponse.json({ error: "Price not configured" }, { status: 400 });
    }

    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/signup?checkout_session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/#pricing`,
      metadata: { planId },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[stripe/guest-checkout] Error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
