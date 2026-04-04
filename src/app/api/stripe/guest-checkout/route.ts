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
      console.error(`[stripe/guest-checkout] No price found for plan=${planId} interval=${interval}. Check that STRIPE_SECRET_KEY is set and valid.`);
      return NextResponse.json(
        { error: "Unable to load pricing. Please try again in a moment." },
        { status: 500 }
      );
    }

    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: { trial_period_days: 3 },
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
