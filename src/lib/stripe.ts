import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY environment variable is not set");
    }
    _stripe = new Stripe(key);
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
let _resolvedForKey: string | null = null; // Track which key was used

// Amount (cents) + interval → plan mapping
const PRICE_MAP: { amount: number; interval: string; plan: PlanId; billing: "monthly" | "yearly" }[] = [
  { amount: 900, interval: "month", plan: "hobby", billing: "monthly" },
  { amount: 6000, interval: "year", plan: "hobby", billing: "yearly" },
  { amount: 2900, interval: "month", plan: "pro", billing: "monthly" },
  { amount: 19900, interval: "year", plan: "pro", billing: "yearly" },
];

async function resolvePriceIds(): Promise<ResolvedPrices> {
  // Invalidate cache if the key changed (e.g. switched test/live)
  const currentKey = process.env.STRIPE_SECRET_KEY || "";
  if (_resolvedPrices && _resolvedForKey !== currentKey) {
    _resolvedPrices = null;
    _stripe = null; // Also reset the Stripe client
  }
  if (_resolvedPrices) return _resolvedPrices;
  if (_resolving) return _resolving;

  _resolving = (async () => {
    const stripe = getStripe();
    const result: ResolvedPrices = {
      hobby: { monthly: null, yearly: null },
      pro: { monthly: null, yearly: null },
    };

    try {
      // Step 1: Look for existing prices
      const prices = await stripe.prices.list({
        active: true,
        limit: 100,
        type: "recurring",
      });

      for (const price of prices.data) {
        if (!price.unit_amount || !price.recurring) continue;
        const match = PRICE_MAP.find(
          (m) => m.amount === price.unit_amount && m.interval === price.recurring!.interval
        );
        if (match) {
          result[match.plan][match.billing] = price.id;
        }
      }

      // Step 2: Auto-create missing products & prices
      if (!result.hobby.monthly || !result.hobby.yearly) {
        console.log("[stripe] Auto-creating Nurplix Hobby product & prices...");
        const product = await stripe.products.create({
          name: "Nurplix Hobby",
          description: "1 channel (Instagram), full analytics, trending headlines",
        });
        if (!result.hobby.monthly) {
          const p = await stripe.prices.create({
            product: product.id,
            unit_amount: 900,
            currency: "usd",
            recurring: { interval: "month" },
          });
          result.hobby.monthly = p.id;
        }
        if (!result.hobby.yearly) {
          const p = await stripe.prices.create({
            product: product.id,
            unit_amount: 6000,
            currency: "usd",
            recurring: { interval: "year" },
          });
          result.hobby.yearly = p.id;
        }
      }

      if (!result.pro.monthly || !result.pro.yearly) {
        console.log("[stripe] Auto-creating Nurplix Pro product & prices...");
        const product = await stripe.products.create({
          name: "Nurplix Pro",
          description: "All channels, brand deal CRM, goals & task management, priority support",
        });
        if (!result.pro.monthly) {
          const p = await stripe.prices.create({
            product: product.id,
            unit_amount: 2900,
            currency: "usd",
            recurring: { interval: "month" },
          });
          result.pro.monthly = p.id;
        }
        if (!result.pro.yearly) {
          const p = await stripe.prices.create({
            product: product.id,
            unit_amount: 19900,
            currency: "usd",
            recurring: { interval: "year" },
          });
          result.pro.yearly = p.id;
        }
      }

      console.log("[stripe] Price IDs ready:", {
        hobbyMonthly: result.hobby.monthly ? "OK" : "MISSING",
        hobbyYearly: result.hobby.yearly ? "OK" : "MISSING",
        proMonthly: result.pro.monthly ? "OK" : "MISSING",
        proYearly: result.pro.yearly ? "OK" : "MISSING",
      });
    } catch (error) {
      console.error("[stripe] Failed to resolve/create price IDs:", error);
      // Don't cache failed results — allow retry on next request
      _resolving = null;
      return result;
    }

    _resolvedPrices = result;
    _resolvedForKey = currentKey;
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
