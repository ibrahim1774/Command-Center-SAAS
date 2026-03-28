import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return _stripe;
}

export const PLANS = {
  hobby: {
    name: "Hobby",
    monthlyPrice: 9,
    yearlyPrice: 60,
    monthlyPriceId: "price_1TFoOqBDYfWlyCVaI6k41boy",
    yearlyPriceId: "price_1TFoOrBDYfWlyCVacI7eghAb",
    accountLimit: 1,
    allowedPlatforms: ["instagram"] as string[],
    features: [
      "Access to 1 channel (Instagram)",
      "Full analytics dashboard",
      "Trending headlines",
      "Email support",
    ],
  },
  pro: {
    name: "Pro",
    monthlyPrice: 29,
    yearlyPrice: 199,
    monthlyPriceId: "price_1TFoOrBDYfWlyCVazVsUMnEd",
    yearlyPriceId: "price_1TFoOrBDYfWlyCVajCwi5ovr",
    accountLimit: 5,
    allowedPlatforms: ["instagram", "youtube", "facebook", "tiktok", "x"] as string[],
    features: [
      "Access to all channels",
      "Instagram, X, YouTube, Facebook, TikTok",
      "Full analytics dashboard",
      "Trending headlines",
      "Brand deal CRM",
      "Goals & task management",
      "Priority support",
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;
export type BillingInterval = "monthly" | "yearly";

export function getPriceId(planId: PlanId, interval: BillingInterval): string | null {
  const plan = PLANS[planId];
  return interval === "yearly" ? plan.yearlyPriceId : plan.monthlyPriceId;
}

export function getPlanFromPriceId(priceId: string): PlanId | null {
  for (const [key, plan] of Object.entries(PLANS)) {
    if (plan.monthlyPriceId === priceId || plan.yearlyPriceId === priceId) {
      return key as PlanId;
    }
  }
  return null;
}
