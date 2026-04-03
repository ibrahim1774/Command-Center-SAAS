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

    let stripeCustomerId = existingSub?.stripe_customer_id;

    // If no customer exists, create one
    if (!stripeCustomerId) {
      const { data: user } = await supabase
        .from("users")
        .select("email, name")
        .eq("id", userId)
        .single();

      const customer = await stripe.customers.create({
        email: user?.email || undefined,
        name: user?.name || undefined,
        metadata: { userId },
      });

      stripeCustomerId = customer.id;

      // Upsert the subscription record with the new customer ID
      await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          stripe_customer_id: stripeCustomerId,
          status: "incomplete",
          plan: "free",
        },
        { onConflict: "user_id" }
      );
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "";

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/api/stripe/verify-checkout?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/#pricing`,
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
