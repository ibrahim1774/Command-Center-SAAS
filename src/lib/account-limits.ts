import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { PLANS, type PlanId } from "@/lib/stripe";

export async function checkAccountLimit(userId: string, platform?: string): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  reason?: string;
}> {
  const supabase = getSupabaseAdmin();

  // Get user plan
  const { data: user } = await supabase
    .from("users")
    .select("plan")
    .eq("id", userId)
    .single();

  const plan = (user?.plan || "free") as string;

  // Free users can't connect anything
  if (plan === "free" || plan === "starter") {
    return { allowed: false, current: 0, limit: 0, reason: "no_plan" };
  }

  const planConfig = PLANS[plan as PlanId];
  if (!planConfig) {
    return { allowed: false, current: 0, limit: 0, reason: "no_plan" };
  }

  // Check if platform is allowed for this plan
  if (platform && !planConfig.allowedPlatforms.includes(platform)) {
    return {
      allowed: false,
      current: 0,
      limit: planConfig.accountLimit,
      reason: "platform_not_allowed",
    };
  }

  // Count current active connections
  const { count } = await supabase
    .from("connected_accounts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "active");

  const current = count || 0;
  const limit = planConfig.accountLimit;

  return {
    allowed: current < limit,
    current,
    limit,
  };
}
