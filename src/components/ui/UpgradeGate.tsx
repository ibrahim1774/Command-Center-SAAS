"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { canAccess, type PlanFeature } from "@/lib/plan-gating";

interface UpgradeGateProps {
  feature: PlanFeature;
  children: React.ReactNode;
  planRequired?: string;
}

const FEATURE_LABELS: Record<PlanFeature, string> = {
  platforms: "connecting more platforms",
  ai: "AI-powered insights",
  deals: "brand deal CRM",
  goals: "goals and journal",
  deepAnalysis: "deep analysis reports",
  teamSeats: "team collaboration",
};

export function UpgradeGate({
  feature,
  children,
  planRequired,
}: UpgradeGateProps) {
  const { data: session } = useSession();
  const userPlan =
    (session?.user as Record<string, unknown>)?.plan as string | undefined;
  const plan = userPlan || "free";

  if (canAccess(plan, feature)) {
    return <>{children}</>;
  }

  const suggestedPlan = planRequired || "Pro";

  return (
    <div className="relative">
      {/* Preview content behind blur */}
      <div className="pointer-events-none select-none blur-sm">{children}</div>

      {/* Upgrade overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-[10px]">
        <div className="bg-white border border-card-border rounded-[10px] p-8 max-w-sm w-full mx-4 text-center shadow-lg">
          <h3
            className="font-display text-xl font-semibold mb-2"
            style={{ color: "#1a1a1a" }}
          >
            Upgrade to unlock
          </h3>
          <p className="font-body text-sm text-gray-500 mb-6">
            Upgrade your plan to access {FEATURE_LABELS[feature]}.
          </p>
          <Link
            href="/dashboard/settings#subscription"
            className="inline-block px-6 py-2.5 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#c4947a" }}
          >
            Upgrade to {suggestedPlan}
          </Link>
        </div>
      </div>
    </div>
  );
}
