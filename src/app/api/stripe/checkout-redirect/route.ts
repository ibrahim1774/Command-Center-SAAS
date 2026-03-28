import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getStripe, PLANS, getPriceId, type PlanId, type BillingInterval } from "@/lib/stripe";

// This route handles OAuth signup → Stripe checkout redirect.
// After OAuth sign-in, the user lands here with plan/interval params,
// and gets redirected to Stripe Checkout.
export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req);
    const { searchParams } = new URL(req.url);
    const planId = searchParams.get("plan") as PlanId | null;
    const interval = (searchParams.get("interval") || "monthly") as BillingInterval;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "";

    if (!userId) {
      return NextResponse.redirect(`${appUrl}/login`);
    }

    if (!planId || !PLANS[planId]) {
      return NextResponse.redirect(`${appUrl}/#pricing`);
    }

    // Check if user already has an active subscription
    const supabase = getSupabaseAdmin();
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("status, plan")
      .eq("user_id", userId)
      .single();

    if (existingSub?.status === "active" && existingSub.plan !== "free") {
      return NextResponse.redirect(`${appUrl}/dashboard`);
    }

    const priceId = getPriceId(planId, interval);
    if (!priceId) {
      return NextResponse.redirect(`${appUrl}/#pricing`);
    }

    const stripe = getStripe();

    // Get or create Stripe customer
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
      line_items: [{ price: priceId, quantity: 1 }],
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
