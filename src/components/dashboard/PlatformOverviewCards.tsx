"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { formatCompact, formatPercentage } from "@/lib/utils";
import { platformStats } from "@/lib/mock-data";
import { PLATFORM_CONFIG } from "@/lib/constants";
import type { PlatformStats } from "@/types";

function PlatformCard({ stat }: { stat: PlatformStats }) {
  const config = PLATFORM_CONFIG[stat.platform];
  const isPositive = stat.followersChange >= 0;

  return (
    <Card
      padding="md"
      className="flex flex-col gap-4"
      style={{ borderTop: `3px solid ${config.color}` }}
    >
      {/* Platform header */}
      <div className="flex items-center gap-2.5">
        <PlatformIcon platform={stat.platform} size={16} showBackground />
        <span className="text-sm text-text-secondary font-body">
          {config.name}
        </span>
      </div>

      {/* Followers */}
      <div className="flex flex-col gap-0.5">
        <span className="font-display text-xl font-bold text-text-primary">
          {formatCompact(stat.followers)}
        </span>
        <span className="text-xs text-text-tertiary uppercase tracking-wide font-body">
          Followers
        </span>
      </div>

      {/* Engagement rate */}
      <div className="flex flex-col gap-0.5">
        <span className="text-sm text-text-secondary font-body">
          {formatPercentage(stat.engagementRate)} engagement
        </span>
      </div>

      {/* Growth badge */}
      <Badge
        variant={isPositive ? "positive" : "negative"}
        size="sm"
        className="w-fit"
      >
        {isPositive ? "+" : ""}
        {formatCompact(stat.followersChange)}
      </Badge>
    </Card>
  );
}

export function PlatformOverviewCards() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {platformStats.map((stat) => (
        <PlatformCard key={stat.platform} stat={stat} />
      ))}
    </div>
  );
}
