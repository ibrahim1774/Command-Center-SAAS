"use client";

import { Card } from "@/components/ui/Card";
import { ageDistribution, topCountries } from "@/lib/mock-data";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { label: string; value: number }; color: string }> }) {
  if (!active || !payload?.length) return null;
  const { label, value } = payload[0].payload;
  return (
    <div className="bg-surface-tertiary border border-border-default rounded-lg px-3 py-2 shadow-xl">
      <p className="text-text-primary text-sm font-medium">{label}</p>
      <p className="text-text-secondary text-xs">{value}%</p>
    </div>
  );
}

export function AudienceDemographics() {
  return (
    <Card padding="lg">
      <h2 className="font-display font-semibold text-lg text-text-primary mb-5">
        Audience Demographics
      </h2>

      <div className="flex gap-8">
        {/* Donut Chart */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-[180px] h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ageDistribution}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  strokeWidth={0}
                  paddingAngle={2}
                >
                  {ageDistribution.map((segment, i) => (
                    <Cell key={i} fill={segment.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
            {ageDistribution.map((segment) => (
              <div key={segment.label} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-xs text-text-secondary">
                  {segment.label}
                </span>
                <span className="text-xs text-text-tertiary">
                  {segment.value}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Countries */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm text-text-tertiary uppercase tracking-wider mb-4">
            Top Countries
          </h3>
          <div className="space-y-3">
            {topCountries.map((country) => (
              <div key={country.country}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-text-secondary">
                    {country.country}
                  </span>
                  <span className="text-sm font-medium text-text-primary">
                    {country.percentage}%
                  </span>
                </div>
                <div className="h-1.5 bg-surface-primary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent-violet transition-all duration-500"
                    style={{ width: `${(country.percentage / 42) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
