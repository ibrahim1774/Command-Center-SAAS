"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Sparkline } from "@/components/ui/Sparkline";
import { formatCompact, formatPercentage } from "@/lib/utils";
import { quickStats } from "@/lib/mock-data";
import type { QuickStat } from "@/types";

function formatValue(stat: QuickStat): string {
  switch (stat.format) {
    case "compact":
      return formatCompact(stat.value);
    case "percentage":
      return formatPercentage(stat.value);
    case "number":
      return stat.value.toString();
  }
}

function QuickStatCard({ stat }: { stat: QuickStat }) {
  const change = ((stat.value - stat.previousValue) / stat.previousValue) * 100;
  const isPositive = change >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const sparklineColor = isPositive
    ? "var(--color-accent-green)"
    : "var(--color-accent-coral)";

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Card padding="md" className="relative h-full">
        <div className="flex items-start justify-between gap-4">
          {/* Left: label, value, badge */}
          <div className="flex flex-col gap-1 min-w-0">
            <span className="uppercase tracking-wide text-xs text-text-tertiary font-body">
              {stat.label}
            </span>
            <span className="font-display text-3xl font-bold text-text-primary leading-tight">
              {formatValue(stat)}
            </span>
            <Badge
              variant={isPositive ? "positive" : "negative"}
              size="sm"
              className="mt-1 w-fit gap-1"
            >
              <TrendIcon size={12} />
              {isPositive ? "+" : ""}
              {change.toFixed(1)}%
            </Badge>
          </div>

          {/* Right: sparkline */}
          <div className="shrink-0 self-end">
            <Sparkline
              data={stat.sparklineData}
              color={sparklineColor}
              width={80}
              height={40}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export function QuickStatsBar() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {quickStats.map((stat) => (
        <QuickStatCard key={stat.label} stat={stat} />
      ))}
    </div>
  );
}
