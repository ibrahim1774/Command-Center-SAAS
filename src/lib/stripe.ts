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
    monthlyAmountCents: 900,
    yearlyAmountCents: 6000,
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
    monthlyAmountCents: 2900,
    yearlyAmountCents: 19900,
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

// ── Dynamic Price Resolution ──
// Fetches active prices from Stripe and matches by amount + interval.
// Cached in memory so the API is only called once per server boot.

interface ResolvedPrices {
  hobby: { monthly: string | null; yearly: string | null };
  pro: { monthly: string | null; yearly: string | null };
}

let _resolvedPrices: ResolvedPrices | null = null;
let _resolving: Promise<ResolvedPrices> | null = null;

// Amount (cents) + interval → plan mapping
const PRICE_MAP: { amount: number; interval: string; plan: PlanId; billing: "monthly" | "yearly" }[] = [
  { amount: 900, interval: "month", plan: "hobby", billing: "monthly" },
  { amount: 6000, interval: "year", plan: "hobby", billing: "yearly" },
  { amount: 2900, interval: "month", plan: "pro", billing: "monthly" },
  { amount: 19900, interval: "year", plan: "pro", billing: "yearly" },
];

async function resolvePriceIds(): Promise<ResolvedPrices> {
  if (_resolvedPrices) return _resolvedPrices;

  // Prevent multiple concurrent resolutions
  if (_resolving) return _resolving;

  _resolving = (async () => {
    const stripe = getStripe();
    const result: ResolvedPrices = {
      hobby: { monthly: null, yearly: null },
      pro: { monthly: null, yearly: null },
    };

    try {
      const prices = await stripe.prices.list({
        active: true,
        limit: 100,
        type: "recurring",
      });

      for (const price of prices.data) {
        if (!price.unit_amount || !price.recurring) continue;

        const match = PRICE_MAP.find(
          (m) =>
            m.amount === price.unit_amount &&
            m.interval === price.recurring!.interval
        );

        if (match) {
          result[match.plan][match.billing] = price.id;
        }
      }

      console.log("[stripe] Resolved price IDs:", {
        hobbyMonthly: result.hobby.monthly ? "found" : "MISSING",
        hobbyYearly: result.hobby.yearly ? "found" : "MISSING",
        proMonthly: result.pro.monthly ? "found" : "MISSING",
        proYearly: result.pro.yearly ? "found" : "MISSING",
      });
    } catch (error) {
      console.error("[stripe] Failed to resolve price IDs:", error);
    }

    _resolvedPrices = result;
    _resolving = null;
    return result;
  })();

  return _resolving;
}

export async function getPriceId(planId: PlanId, interval: BillingInterval): Promise<string | null> {
  const prices = await resolvePriceIds();
  const billing = interval === "yearly" ? "yearly" : "monthly";
  return prices[planId]?.[billing] || null;
}

export async function getPlanFromPriceId(priceId: string): Promise<PlanId | null> {
  const prices = await resolvePriceIds();

  for (const [planKey, planPrices] of Object.entries(prices)) {
    if (planPrices.monthly === priceId || planPrices.yearly === priceId) {
      return planKey as PlanId;
    }
  }
  return null;
}
