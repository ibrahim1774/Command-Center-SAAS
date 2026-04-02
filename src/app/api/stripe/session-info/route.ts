import { NextRequest, NextResponse } from "next/server";
import { getStripe, getPlanFromPriceId } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  const sessionId = new URL(req.url).searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid" || !session.subscription) {
      return NextResponse.json({ plan: "hobby", price: 9 });
    }

    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    const priceId = subscription.items.data[0]?.price.id;
    const plan = getPlanFromPriceId(priceId) || "hobby";
    const unitAmount = subscription.items.data[0]?.price.unit_amount;
    const price = unitAmount ? unitAmount / 100 : 9;

    return NextResponse.json({ plan, price });
  } catch {
    return NextResponse.json({ plan: "hobby", price: 9 });
  }
}
