"use client";

import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { Payload } from "recharts/types/component/DefaultTooltipContent";
import { Card } from "@/components/ui/Card";
import { engagementTimeline } from "@/lib/mock-data";
import { cn, formatCompact } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TimeRange = "7D" | "30D" | "90D";

const TIME_RANGES: { label: TimeRange; days: number }[] = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateLabel(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTooltipDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Custom Tooltip
// ---------------------------------------------------------------------------

interface ChartTooltipProps {
  active?: boolean;
  payload?: Payload<number, string>[];
  label?: string;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const impressions = payload.find((p) => p.dataKey === "impressions");
  const engagements = payload.find((p) => p.dataKey === "engagements");

  return (
    <div className="rounded-lg border border-border-default bg-surface-tertiary px-4 py-3 shadow-xl">
      <p className="mb-2 font-body text-xs font-medium text-text-secondary">
        {formatTooltipDate(label as string)}
      </p>
      <div className="flex flex-col gap-1.5">
        {impressions && (
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent-blue" />
            <span className="font-body text-xs text-text-secondary">
              Impressions
            </span>
            <span className="ml-auto font-body text-xs font-semibold text-text-primary">
              {(impressions.value as number).toLocaleString()}
            </span>
          </div>
        )}
        {engagements && (
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent-violet" />
            <span className="font-body text-xs text-text-secondary">
              Engagements
            </span>
            <span className="ml-auto font-body text-xs font-semibold text-text-primary">
              {(engagements.value as number).toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// EngagementChart
// ---------------------------------------------------------------------------

export default function EngagementChart() {
  const [range, setRange] = useState<TimeRange>("30D");

  const data = useMemo(() => {
    const days = TIME_RANGES.find((r) => r.label === range)!.days;
    return engagementTimeline.slice(-days);
  }, [range]);

  // Show roughly 6 ticks regardless of range
  const tickInterval = useMemo(() => {
    return Math.max(1, Math.floor(data.length / 6));
  }, [data.length]);

  return (
    <Card padding="lg">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-text-primary">
          Engagement Overview
        </h3>
        <div className="flex gap-1">
          {TIME_RANGES.map(({ label }) => (
            <button
              key={label}
              onClick={() => setRange(label)}
              className={cn(
                "rounded-md px-3 py-1 font-body text-xs font-medium transition-colors",
                range === label
                  ? "bg-accent-blue text-white"
                  : "bg-surface-tertiary text-text-secondary hover:text-text-primary"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={data}
          margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="impressionsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#27272a"
            vertical={false}
          />

          <XAxis
            dataKey="date"
            tickFormatter={formatDateLabel}
            interval={tickInterval}
            tick={{ fill: "#71717a", fontSize: 12, fontFamily: "Plus Jakarta Sans" }}
            tickLine={false}
            axisLine={false}
            dy={8}
          />

          <YAxis
            tickFormatter={formatCompact}
            tick={{ fill: "#71717a", fontSize: 12, fontFamily: "Plus Jakarta Sans" }}
            tickLine={false}
            axisLine={false}
            width={50}
          />

          <Tooltip
            content={<ChartTooltip />}
            cursor={{ stroke: "#3f3f46", strokeWidth: 1 }}
          />

          <Area
            type="monotone"
            dataKey="impressions"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#impressionsFill)"
            animationDuration={600}
          />

          <Area
            type="monotone"
            dataKey="engagements"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="transparent"
            animationDuration={600}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-accent-blue" />
          <span className="font-body text-xs text-text-secondary">
            Impressions
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-accent-violet" />
          <span className="font-body text-xs text-text-secondary">
            Engagements
          </span>
        </div>
      </div>
    </Card>
  );
}
