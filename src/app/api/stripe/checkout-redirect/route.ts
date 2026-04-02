import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getStripe, PLANS, getPriceId, getPlanFromPriceId, type PlanId, type BillingInterval } from "@/lib/stripe";

// This route handles OAuth callbacks.
// Two modes:
// 1. checkout_session param: user already paid, link subscription to their account
// 2. plan param: old flow — create checkout session (kept for backward compat)
export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req);
    const { searchParams } = new URL(req.url);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "";

    if (!userId) {
      return NextResponse.redirect(`${appUrl}/login`);
    }

    // Mode 1: Link existing checkout session to this user
    const checkoutSessionId = searchParams.get("checkout_session");
    if (checkoutSessionId) {
      const stripe = getStripe();
      const supabase = getSupabaseAdmin();

      const session = await stripe.checkout.sessions.retrieve(checkoutSessionId);
      if (session.payment_status === "paid") {
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        // Get user email
        const { data: user } = await supabase
          .from("users")
          .select("email")
          .eq("id", userId)
          .single();

        // Update Stripe customer
        await stripe.customers.update(customerId, {
          email: user?.email || undefined,
          metadata: { userId },
        });

        // Get plan
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price.id;
        const plan = getPlanFromPriceId(priceId) || "hobby";

        // Update user and subscription
        await supabase.from("users").update({ plan }).eq("id", userId);
        await supabase.from("subscriptions").upsert(
          {
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            plan,
            status: subscription.status,
            current_period_end: new Date(
              (subscription as unknown as { current_period_end: number }).current_period_end * 1000
            ).toISOString(),
          },
          { onConflict: "user_id" }
        );
      }

      return NextResponse.redirect(`${appUrl}/dashboard`);
    }

    // Mode 2: Create new checkout session (old flow / backward compat)
    const planId = searchParams.get("plan") as PlanId | null;
    const interval = (searchParams.get("interval") || "monthly") as BillingInterval;

    if (!planId || !PLANS[planId]) {
      return NextResponse.redirect(`${appUrl}/#pricing`);
    }

    const supabase = getSupabaseAdmin();
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("status, plan")
      .eq("user_id", userId)
      .single();

    if (existingSub?.status === "active" && existingSub.plan !== "free") {
      return NextResponse.redirect(`${appUrl}/dashboard`);
    }

    const priceIdVal = getPriceId(planId, interval);
    if (!priceIdVal) {
      return NextResponse.redirect(`${appUrl}/#pricing`);
    }

    const stripe = getStripe();

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .single();

    let stripeCustomerId = sub?.stripe_customer_id;

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

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      line_items: [{ price: priceIdVal, quantity: 1 }],
      success_url: `${appUrl}/api/stripe/verify-checkout?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/#pricing`,
      metadata: { userId, planId },
    });

    return NextResponse.redirect(session.url!);
  } catch (error) {
    console.error("[stripe/checkout-redirect] Error:", error);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "";
    return NextResponse.redirect(`${appUrl}/#pricing`);
  }
}
