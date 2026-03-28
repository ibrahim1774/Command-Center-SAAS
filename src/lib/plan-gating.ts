export const PLAN_LIMITS = {
  free: {
    platforms: 1,
    ai: false,
    deals: false,
    goals: false,
    deepAnalysis: false,
    teamSeats: 0,
  },
  starter: {
    platforms: 1,
    ai: false,
    deals: false,
    goals: false,
    deepAnalysis: false,
    teamSeats: 0,
  },
  hobby: {
    platforms: 1,
    ai: false,
    deals: false,
    goals: false,
    deepAnalysis: false,
    teamSeats: 0,
  },
  pro: {
    platforms: Infinity,
    ai: true,
    deals: true,
    goals: true,
    deepAnalysis: true,
    teamSeats: 1,
  },
} as const;

export type PlanFeature = keyof (typeof PLAN_LIMITS)["free"];

export function canAccess(plan: string, feature: PlanFeature): boolean {
  const limits =
    PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] ?? PLAN_LIMITS.free;
  const value = limits[feature];
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  return false;
}

export function getPlanLimits(plan: string) {
  return PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] ?? PLAN_LIMITS.free;
}
