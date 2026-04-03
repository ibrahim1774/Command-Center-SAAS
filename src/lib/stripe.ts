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
    productName: "Nurplix Hobby",
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
    productName: "Nurplix Pro",
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

interface ResolvedPrices {
  hobby: { monthly: string | null; yearly: string | null };
  pro: { monthly: string | null; yearly: string | null };
}

let _resolvedPrices: ResolvedPrices | null = null;
let _resolving: Promise<ResolvedPrices> | null = null;
let _resolvedForKey: string | null = null;

async function resolvePriceIds(): Promise<ResolvedPrices> {
  const currentKey = process.env.STRIPE_SECRET_KEY || "";
  if (_resolvedPrices && _resolvedForKey !== currentKey) {
    _resolvedPrices = null;
    _stripe = null;
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
      // Step 1: Find existing prices with expanded product info
      const prices = await stripe.prices.list({
        active: true,
        limit: 100,
        type: "recurring",
        expand: ["data.product"],
      });

      for (const price of prices.data) {
        if (!price.unit_amount || !price.recurring) continue;

        // Only match prices from Nurplix products
        const product = price.product as Stripe.Product;
        const productName = product?.name?.toLowerCase() || "";

        // Skip prices from unrelated products
        const isNurplixProduct =
          productName.includes("nurplix") ||
          productName.includes("hobby") ||
          productName.includes("starter");
        const isProProduct =
          productName.includes("nurplix") && productName.includes("pro");
        const isHobbyProduct =
          isNurplixProduct && !productName.includes("pro");

        if (!isNurplixProduct && !productName.includes("pro")) continue;

        // Extra safety: skip if product name contains unrelated keywords
        if (productName.includes("voice") || productName.includes("ai voice")) continue;

        const amount = price.unit_amount;
        const interval = price.recurring.interval;

        if (isHobbyProduct) {
          if (amount === 900 && interval === "month") result.hobby.monthly = price.id;
          else if (amount === 6000 && interval === "year") result.hobby.yearly = price.id;
        }
        if (isProProduct || (productName.includes("pro") && !productName.includes("voice"))) {
          if (amount === 2900 && interval === "month") result.pro.monthly = price.id;
          else if (amount === 19900 && interval === "year") result.pro.yearly = price.id;
        }
      }

      // Step 2: Auto-create only what's missing
      // First check for existing products to avoid duplicates
      const products = await stripe.products.list({ active: true, limit: 100 });
      const existingHobby = products.data.find((p) => p.name.toLowerCase().includes("hobby"));
      const existingPro = products.data.find((p) => p.name.toLowerCase().includes("pro"));

      if (!result.hobby.monthly || !result.hobby.yearly) {
        const product = existingHobby || await stripe.products.create({
          name: "Nurplix Hobby",
          description: "1 channel (Instagram), full analytics, trending headlines",
        });
        console.log(`[stripe] Using Hobby product: ${product.id} (${existingHobby ? "existing" : "created"})`);

        if (!result.hobby.monthly) {
          const p = await stripe.prices.create({
            product: product.id, unit_amount: 900, currency: "usd",
            recurring: { interval: "month" },
          });
          result.hobby.monthly = p.id;
        }
        if (!result.hobby.yearly) {
          const p = await stripe.prices.create({
            product: product.id, unit_amount: 6000, currency: "usd",
            recurring: { interval: "year" },
          });
          result.hobby.yearly = p.id;
        }
      }

      if (!result.pro.monthly || !result.pro.yearly) {
        const product = existingPro || await stripe.products.create({
          name: "Nurplix Pro",
          description: "All channels, brand deal CRM, goals & task management, priority support",
        });
        console.log(`[stripe] Using Pro product: ${product.id} (${existingPro ? "existing" : "created"})`);

        if (!result.pro.monthly) {
          const p = await stripe.prices.create({
            product: product.id, unit_amount: 2900, currency: "usd",
            recurring: { interval: "month" },
          });
          result.pro.monthly = p.id;
        }
        if (!result.pro.yearly) {
          const p = await stripe.prices.create({
            product: product.id, unit_amount: 19900, currency: "usd",
            recurring: { interval: "year" },
          });
          result.pro.yearly = p.id;
        }
      }

      console.log("[stripe] All price IDs resolved:", {
        hobbyMonthly: result.hobby.monthly,
        hobbyYearly: result.hobby.yearly,
        proMonthly: result.pro.monthly,
        proYearly: result.pro.yearly,
      });
    } catch (error) {
      console.error("[stripe] Failed to resolve/create price IDs:", error);
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
