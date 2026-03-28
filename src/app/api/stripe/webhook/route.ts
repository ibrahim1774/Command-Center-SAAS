import { NextRequest, NextResponse } from "next/server";
import { getStripe, getPlanFromPriceId } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const supabase = getSupabaseAdmin();

  let event: Stripe.Event;

  try {
    const body = await req.text();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (webhookSecret) {
      // Production: verify signature
      const sig = req.headers.get("stripe-signature");
      if (!sig) {
        return NextResponse.json(
          { error: "Missing stripe-signature header" },
          { status: 400 }
        );
      }
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      // Dev/test: parse without verification
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err) {
    console.error("[stripe/webhook] Signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        // Retrieve the subscription to get price details
        const subscription = await stripe.subscriptions.retrieve(
          subscriptionId
        );
        const priceId = subscription.items.data[0]?.price.id;
        const plan = getPlanFromPriceId(priceId) || "free";

        // Find user by customer email or metadata
        let userId = session.metadata?.userId;

        if (!userId) {
          // Fallback: look up by customer email
          const customer = (await stripe.customers.retrieve(
            customerId
          )) as Stripe.Customer;
          if (customer.email) {
            const { data: user } = await supabase
              .from("users")
              .select("id")
              .eq("email", customer.email)
              .single();
            userId = user?.id;
          }
        }

        if (!userId) {
          console.error(
            "[stripe/webhook] Could not find user for customer:",
            customerId
          );
          return NextResponse.json(
            { error: "User not found" },
            { status: 400 }
          );
        }

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

        // Update user plan
        await supabase.from("users").update({ plan }).eq("id", userId);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0]?.price.id;
        const plan = getPlanFromPriceId(priceId) || "free";

        await supabase
          .from("subscriptions")
          .update({
            status: subscription.status,
            plan,
            current_period_end: new Date(
              (subscription as unknown as { current_period_end: number }).current_period_end * 1000
            ).toISOString(),
          })
          .eq("stripe_customer_id", customerId);

        // Update user plan
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (sub?.user_id) {
          await supabase
            .from("users")
            .update({ plan })
            .eq("id", sub.user_id);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await supabase
          .from("subscriptions")
          .update({ status: "canceled" })
          .eq("stripe_customer_id", customerId);

        const { data: sub } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (sub?.user_id) {
          await supabase
            .from("users")
            .update({ plan: "free" })
            .eq("id", sub.user_id);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        await supabase
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("stripe_customer_id", customerId);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[stripe/webhook] Error processing event:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
