import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getStripe, PLANS, getPriceId, type PlanId, type BillingInterval } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planId, interval = "monthly" } = (await req.json()) as {
      planId: PlanId;
      interval?: BillingInterval;
    };

    if (!planId || !PLANS[planId]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const priceId = await getPriceId(planId, interval);
    if (!priceId) {
      return NextResponse.json(
        { error: "Price not configured for this plan" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const stripe = getStripe();

    // Look up existing Stripe customer
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .single();

    const stripeCustomerId = existingSub?.stripe_customer_id;

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "";

    // If user already has a Stripe customer, reuse it.
    // Otherwise, let Stripe create the customer during checkout
    // (avoids premature "new customer" alerts before payment).
    const customerFields: Record<string, unknown> = stripeCustomerId
      ? { customer: stripeCustomerId }
      : {};

    // Get user email for Stripe checkout if no existing customer
    if (!stripeCustomerId) {
      const { data: user } = await supabase
        .from("users")
        .select("email")
        .eq("id", userId)
        .single();
      if (user?.email) {
        customerFields.customer_email = user.email;
      }
    }

    const session = await stripe.checkout.sessions.create({
      ...customerFields,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: { trial_period_days: 1 },
      success_url: `${appUrl}/api/stripe/verify-checkout?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing`,
      metadata: { userId, planId },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[stripe/checkout] Error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
