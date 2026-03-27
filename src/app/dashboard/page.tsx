"use client";

import {
  aiBriefing,
  whatsWorking,
  whatsFlopping,
  socialHeadlines,
  followerComments as mockComments,
  followerGrowthData as mockGrowthData,
  communityMembers,
  overviewMetrics as mockMetrics,
} from "@/lib/mock-data";
import { useDashboardData } from "@/lib/hooks/useDashboardData";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Users,
} from "lucide-react";

interface OverviewData {
  connected: boolean;
  connectedPlatforms: string[];
  totalFollowers: number;
  followerGrowth: Array<{ date: string; follower_count: number }>;
  recentComments: Array<{
    username: string;
    platform: string;
    comment: string;
    timestamp: string;
  }>;
  igProfile: { follower_count: number } | null;
  ytChannel: { subscriber_count: number } | null;
  fbPage: { followers: number } | null;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, "") + "K";
  return n.toLocaleString();
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg bg-white px-4 py-3 shadow-lg border border-[#e8e6e1]"
      style={{ fontFamily: "DM Sans, sans-serif" }}
    >
      <p className="text-xs text-[#6b6b6b] mb-1">{label}</p>
      <p className="text-sm font-semibold text-[#1a1a1a]">
        {payload[0].value.toLocaleString()} followers
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const { data } = useDashboardData<OverviewData>("/api/dashboard/overview");

  // Use real data if available, otherwise fall back to mock
  const hasRealData = data?.connected && data.totalFollowers > 0;
  const totalFollowers = hasRealData
    ? fmt(data.totalFollowers)
    : mockMetrics[0].value;

  // Build metrics cards — mix real + mock
  const metrics = [
    {
      label: "Total Followers",
      value: totalFollowers,
      change: mockMetrics[0].change,
      changeType: mockMetrics[0].changeType,
    },
    mockMetrics[1], // Total Reach
    mockMetrics[2], // Engagement Rate
    mockMetrics[3], // Revenue
  ];

  // Use real follower growth if available
  const growthData =
    data?.followerGrowth && data.followerGrowth.length > 0
      ? data.followerGrowth.map((d) => ({
          date: d.date,
          followers: d.follower_count,
        }))
      : mockGrowthData;

  // Use real comments if available
  const displayComments =
    data?.recentComments && data.recentComments.length > 0
      ? data.recentComments
      : mockComments;

  return (
    <div className="space-y-8">
      {/* ROW 1 — Metric Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <Card key={m.label} padding="md">
            <p className="uppercase text-[10px] tracking-widest text-text-muted font-body mb-2">
              {m.label}
            </p>
            <p className="text-3xl font-bold text-text-primary tracking-tight leading-none mb-2">
              {m.value}
            </p>
            <Badge
              variant={
                m.changeType === "positive"
                  ? "positive"
                  : m.changeType === "negative"
                    ? "negative"
                    : "neutral"
              }
              size="sm"
            >
              {m.change}
            </Badge>
          </Card>
        ))}
      </section>

      {/* ROW 2 — AI Daily Briefing (mock) */}
      <Card className="bg-[#faf8f5]" padding="lg">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="h-5 w-5 text-accent-primary" />
          <h2 className="font-display text-xl text-text-primary">
            Daily Briefing
          </h2>
          <Badge variant="info" size="sm">
            AI generated
          </Badge>
        </div>
        <p className="text-text-secondary leading-relaxed font-body mb-5">
          {aiBriefing.summary}
        </p>
        <ul className="space-y-2 mb-6">
          {aiBriefing.highlights.map((h, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-primary" />
              <span className="text-sm text-text-secondary font-body">
                {h}
              </span>
            </li>
          ))}
        </ul>
        <Button variant="secondary" size="sm">
          <RefreshCw className="h-3.5 w-3.5 mr-2" />
          Regenerate
        </Button>
      </Card>

      {/* ROW 3 — What's Working / What's Flopping (mock) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card variant="success" padding="md">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-success" />
            <h3 className="font-display text-lg text-text-primary">
              What&rsquo;s Working
            </h3>
          </div>
          <ul className="space-y-3">
            {whatsWorking.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-secondary font-body leading-snug">
                    {item.text}
                  </p>
                  {item.metric && (
                    <Badge variant="positive" size="sm" className="mt-1.5">
                      {item.metric}
                    </Badge>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
        <Card variant="danger" padding="md">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="h-5 w-5 text-danger" />
            <h3 className="font-display text-lg text-text-primary">
              What&rsquo;s Flopping
            </h3>
          </div>
          <ul className="space-y-3">
            {whatsFlopping.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-secondary font-body leading-snug">
                    {item.text}
                  </p>
                  {item.metric && (
                    <Badge variant="negative" size="sm" className="mt-1.5">
                      {item.metric}
                    </Badge>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* ROW 4 — Social Headlines / Why We Do This */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card padding="md">
          <h3 className="font-display text-lg text-text-primary mb-4">
            Social Media Headlines
          </h3>
          <ul className="divide-y divide-[#f0ede8]">
            {socialHeadlines.map((h, i) => (
              <li key={i} className="py-3 first:pt-0 last:pb-0">
                <p className="text-sm font-medium text-text-primary leading-snug font-body">
                  {h.title}
                </p>
                <p className="text-xs text-text-muted font-body mt-1">
                  {h.source} &middot; {h.timestamp}
                </p>
              </li>
            ))}
          </ul>
        </Card>
        <Card padding="md">
          <h3 className="font-display text-lg text-text-primary mb-4">
            Why We Do This
          </h3>
          <ul className="space-y-4">
            {displayComments.map((c, i) => (
              <li key={i}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-text-primary font-body">
                    {c.username}
                  </span>
                  <Badge variant="platform" size="sm">
                    {c.platform}
                  </Badge>
                </div>
                <p className="text-sm italic text-text-secondary font-body leading-relaxed">
                  &ldquo;{c.comment}&rdquo;
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* ROW 5 — Follower Growth Chart */}
      <Card padding="lg">
        <div className="flex items-baseline gap-3 mb-6">
          <h3 className="font-display text-xl text-text-primary">
            Follower Growth
          </h3>
          <span className="text-xs text-text-muted font-body">
            Last 30 days
          </span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={growthData}
            margin={{ top: 4, right: 4, bottom: 0, left: 8 }}
          >
            <defs>
              <linearGradient id="followerFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c4947a" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#c4947a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e8e6e1"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#6b6b6b", fontSize: 12, fontFamily: "DM Sans" }}
              tickFormatter={(v: string) => {
                const d = new Date(v);
                return `${d.getMonth() + 1}/${d.getDate()}`;
              }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#6b6b6b", fontSize: 12, fontFamily: "DM Sans" }}
              tickFormatter={(v: number) =>
                v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)
              }
              domain={["dataMin - 500", "dataMax + 500"]}
              width={52}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="followers"
              stroke="#c4947a"
              strokeWidth={2.5}
              fill="url(#followerFill)"
              dot={false}
              activeDot={{
                r: 5,
                fill: "#c4947a",
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* ROW 6 — Community Members (mock) */}
      <Card padding="md">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-accent-primary" />
          <h3 className="font-display text-lg text-text-primary">
            Community Members
          </h3>
          <Badge variant="neutral" size="sm">
            {communityMembers.length} recent
          </Badge>
        </div>
        <ul className="divide-y divide-[#f0ede8]">
          {communityMembers.map((member, i) => (
            <li
              key={i}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[#f0ede8] flex items-center justify-center text-xs font-bold text-text-secondary font-body">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary font-body">
                    {member.name}
                  </p>
                  <p className="text-xs text-text-muted font-body">
                    Joined {member.joinedAt}
                  </p>
                </div>
              </div>
              <Badge
                variant={
                  member.tier === "Enterprise"
                    ? "info"
                    : member.tier === "Pro"
                      ? "positive"
                      : "neutral"
                }
                size="sm"
              >
                {member.tier}
              </Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
