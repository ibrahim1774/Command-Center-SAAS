import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const EXIT_OFFERS = {
  hobby: { name: "Hobby Plan", unitAmount: 500 },  // $5/mo
  pro:   { name: "Pro Plan",   unitAmount: 1900 }, // $19/mo
} as const;

export async function POST(req: NextRequest) {
  try {
    const { planId } = (await req.json()) as { planId: "hobby" | "pro" };

    if (!EXIT_OFFERS[planId]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const offer = EXIT_OFFERS[planId];
    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "";

    // Check if user is authenticated — reuse existing customer if possible
    const userId = await getAuthenticatedUserId(req);
    let customer: string | undefined;

    if (userId) {
      const supabase = getSupabaseAdmin();
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("stripe_customer_id")
        .eq("user_id", userId)
        .single();
      if (sub?.stripe_customer_id) customer = sub.stripe_customer_id;
    }

    const session = await stripe.checkout.sessions.create({
      ...(customer ? { customer } : {}),
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: offer.unitAmount,
            recurring: { interval: "month" },
            product_data: { name: offer.name },
          },
          quantity: 1,
        },
      ],
      subscription_data: { trial_period_days: 3 },
      metadata: { planId, userId: userId || "", exitOffer: "true" },
      success_url: userId
        ? `${appUrl}/api/stripe/verify-checkout?session_id={CHECKOUT_SESSION_ID}`
        : `${appUrl}/signup?checkout_session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[stripe/exit-offer-checkout] Error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
