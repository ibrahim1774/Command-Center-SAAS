import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getStripe, getPlanFromPriceId } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const stripe = getStripe();
    const supabase = getSupabaseAdmin();

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;

    // Get user email
    const { data: user } = await supabase
      .from("users")
      .select("email")
      .eq("id", userId)
      .single();

    // Update Stripe customer with user info
    await stripe.customers.update(customerId, {
      email: user?.email || undefined,
      metadata: { userId },
    });

    // Get plan from subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = subscription.items.data[0]?.price.id;
    const plan = (await getPlanFromPriceId(priceId)) || "hobby";
    const price = subscription.items.data[0]?.price.unit_amount;
    const priceUsd = price ? (price / 100).toFixed(2) : "9.00";

    // Update user plan
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

    return NextResponse.json({ success: true, plan, price: priceUsd });
  } catch (error) {
    console.error("[stripe/link-subscription] Error:", error);
    return NextResponse.json({ error: "Failed to link subscription" }, { status: 500 });
  }
}
