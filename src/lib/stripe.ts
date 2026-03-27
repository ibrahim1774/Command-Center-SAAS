import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return _stripe;
}

export const PLANS = {
  starter: { name: "Starter", price: 0, stripePriceId: null as string | null },
  pro: {
    name: "Pro",
    price: 29,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || null,
  },
  business: {
    name: "Business",
    price: 79,
    stripePriceId: process.env.STRIPE_BUSINESS_PRICE_ID || null,
  },
} as const;

export type PlanId = keyof typeof PLANS;
