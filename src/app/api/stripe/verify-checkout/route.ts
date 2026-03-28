import { NextRequest, NextResponse } from "next/server";
import { getStripe, getPlanFromPriceId } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "";

  try {
    const sessionId = new URL(req.url).searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.redirect(`${appUrl}/#pricing`);
    }

    const stripe = getStripe();
    const supabase = getSupabaseAdmin();

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.redirect(`${appUrl}/#pricing`);
    }

    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;

    // Retrieve subscription to get price details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = subscription.items.data[0]?.price.id;
    const plan = getPlanFromPriceId(priceId) || "hobby";

    // Find user by metadata or customer email
    let userId = session.metadata?.userId;

    if (!userId) {
      const customer = await stripe.customers.retrieve(customerId) as { email?: string };
      if (customer.email) {
        const { data: user } = await supabase
          .from("users")
          .select("id")
          .eq("email", customer.email)
          .single();
        userId = user?.id;
      }
    }

    if (userId) {
      // Update user plan immediately
      await supabase.from("users").update({ plan }).eq("id", userId);

      // Upsert subscription record
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

    return NextResponse.redirect(`${appUrl}/dashboard?checkout=success`);
  } catch (error) {
    console.error("[stripe/verify-checkout] Error:", error);
    return NextResponse.redirect(`${appUrl}/dashboard?checkout=success`);
  }
}
