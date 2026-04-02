"use client";

import { useState, useCallback } from "react";
import {
  socialHeadlines,
  followerComments as mockComments,
} from "@/lib/mock-data";
import { useDashboardData } from "@/lib/hooks/useDashboardData";
import { useAIInsights } from "@/lib/hooks/useAIInsights";
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
  Loader2,
  Heart,
  BarChart3,
  FileText,
  Users,
  Target,
  Pencil,
  Camera,
  Play,
  ThumbsUp,
  Music,
} from "lucide-react";

interface ChannelSummary {
  platform: string;
  username: string;
  followers: number;
  posts: number;
  likes: number;
  goal: number | null;
}

interface OverviewData {
  connected: boolean;
  connectedPlatforms: string[];
  totalFollowers: number;
  totalPosts: number;
  totalLikes: number;
  engagementRate: string;
  channels: ChannelSummary[];
  followerGrowth: Array<{ date: string; follower_count: number }>;
  recentComments: Array<{
    username: string;
    platform: string;
    comment: string;
    timestamp: string;
  }>;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, "") + "K";
  return n.toLocaleString();
}

const PLATFORM_CONFIG: Record<string, { label: string; color: string; icon: typeof Camera }> = {
  instagram: { label: "Instagram", color: "#E1306C", icon: Camera },
  youtube: { label: "YouTube", color: "#FF0000", icon: Play },
  facebook: { label: "Facebook", color: "#1877F2", icon: ThumbsUp },
  tiktok: { label: "TikTok", color: "#000000", icon: Music },
};

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

function ChannelCard({
  channel,
  onGoalSaved,
}: {
  channel: ChannelSummary;
  onGoalSaved: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [goalInput, setGoalInput] = useState("");
  const [localGoal, setLocalGoal] = useState<number | null>(channel.goal);

  const config = PLATFORM_CONFIG[channel.platform] || PLATFORM_CONFIG.tiktok;
  const Icon = config.icon;
  const goal = localGoal;
  const progressPct = goal && goal > 0 ? Math.min(100, (channel.followers / goal) * 100) : 0;
  const followersToGo = goal ? Math.max(0, goal - channel.followers) : 0;

  const saveGoal = useCallback(async () => {
    const num = parseInt(goalInput.replace(/,/g, ""), 10);
    if (!num || num <= 0) return;
    setLocalGoal(num);
    setEditing(false);
    await fetch("/api/user/channel-goal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform: channel.platform, target: num }),
    });
    onGoalSaved();
  }, [goalInput, channel.platform, onGoalSaved]);

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="h-8 w-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: config.color + "15" }}
        >
          <Icon className="h-4 w-4" style={{ color: config.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary font-display truncate">
            {config.label}
          </p>
          <p className="text-xs text-text-muted font-body truncate">
            {channel.username}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center mb-4">
        <div>
          <p className="text-lg font-bold font-display text-text-primary">{fmt(channel.followers)}</p>
          <p className="text-[10px] text-text-muted uppercase tracking-wider">Followers</p>
        </div>
        <div>
          <p className="text-lg font-bold font-display text-text-primary">{fmt(channel.posts)}</p>
          <p className="text-[10px] text-text-muted uppercase tracking-wider">Posts</p>
        </div>
        <div>
          <p className="text-lg font-bold font-display text-text-primary">{fmt(channel.likes)}</p>
          <p className="text-[10px] text-text-muted uppercase tracking-wider">Likes</p>
        </div>
      </div>

      {/* Goal Tracker */}
      {editing ? (
        <div className="border-t border-card-border pt-3">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Set Follower Goal</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="e.g. 100000"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value.replace(/[^0-9,]/g, ""))}
              className="h-8 flex-1 rounded-lg border border-card-border bg-page-bg px-3 text-sm font-display font-bold outline-none focus:border-accent-primary transition-colors"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && saveGoal()}
            />
            <button
              onClick={saveGoal}
              className="h-8 rounded-lg bg-accent-primary px-3 text-xs font-medium text-white hover:opacity-90 transition-opacity"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="h-8 rounded-lg border border-card-border px-3 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : goal ? (
        <div className="border-t border-card-border pt-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
              Road to {fmt(goal)}
            </p>
            <button
              onClick={() => { setEditing(true); setGoalInput(String(goal)); }}
              className="flex items-center gap-1 text-[10px] text-text-muted hover:text-accent-primary transition-colors"
            >
              <Pencil className="h-2.5 w-2.5" />
              Edit
            </button>
          </div>
          <div className="h-2 w-full rounded-full bg-[#f0ede8] mb-1.5">
            <div
              className="h-full rounded-full bg-accent-primary transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-text-secondary font-body">
            <span className="font-semibold text-text-primary">{fmt(followersToGo)}</span> to go
            <span className="text-text-muted ml-2">({progressPct.toFixed(1)}%)</span>
          </p>
        </div>
      ) : (
        <div className="border-t border-card-border pt-3">
          <button
            onClick={() => { setEditing(true); setGoalInput(""); }}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent-primary transition-colors"
          >
            <Target className="h-3 w-3" />
            Set a follower goal
          </button>
        </div>
      )}
    </Card>
  );
}

export default function DashboardPage() {
  const { data, refetch } = useDashboardData<OverviewData>("/api/dashboard/overview");
  const { insights, generating, regenerate } = useAIInsights();

  const hasInsights = insights !== null;
  const channels = data?.channels || [];

  // Real data from API
  const totalFollowers = data?.totalFollowers || 0;
  const totalPosts = data?.totalPosts || 0;
  const totalLikes = data?.totalLikes || 0;
  const engagementRate = data?.engagementRate || "0.00";

  // Use real comments if available
  const displayComments =
    data?.recentComments && data.recentComments.length > 0
      ? data.recentComments
      : mockComments;

  // Follower growth
  const hasGrowthData = data?.followerGrowth && data.followerGrowth.length > 0;
  const growthData = hasGrowthData
    ? data.followerGrowth.map((d) => ({
        date: d.date,
        followers: d.follower_count,
      }))
    : [];

  return (
    <div className="space-y-8">
      {/* ROW 1 — Metric Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md">
          <div className="flex items-center justify-between mb-2">
            <p className="uppercase text-[10px] tracking-widest text-text-muted font-body">
              Total Followers
            </p>
            <Users className="h-4 w-4 text-[#c4947a]" />
          </div>
          <p className="text-3xl font-bold text-text-primary tracking-tight leading-none">
            {fmt(totalFollowers)}
          </p>
        </Card>
        <Card padding="md">
          <div className="flex items-center justify-between mb-2">
            <p className="uppercase text-[10px] tracking-widest text-text-muted font-body">
              Total Posts
            </p>
            <FileText className="h-4 w-4 text-[#c4947a]" />
          </div>
          <p className="text-3xl font-bold text-text-primary tracking-tight leading-none">
            {fmt(totalPosts)}
          </p>
        </Card>
        <Card padding="md">
          <div className="flex items-center justify-between mb-2">
            <p className="uppercase text-[10px] tracking-widest text-text-muted font-body">
              Engagement Rate
            </p>
            <BarChart3 className="h-4 w-4 text-[#c4947a]" />
          </div>
          <p className="text-3xl font-bold text-text-primary tracking-tight leading-none">
            {engagementRate}%
          </p>
        </Card>
        <Card padding="md">
          <div className="flex items-center justify-between mb-2">
            <p className="uppercase text-[10px] tracking-widest text-text-muted font-body">
              Total Likes
            </p>
            <Heart className="h-4 w-4 text-[#c4947a]" />
          </div>
          <p className="text-3xl font-bold text-text-primary tracking-tight leading-none">
            {fmt(totalLikes)}
          </p>
        </Card>
      </section>

      {/* ROW 2 — Your Channels with Goal Trackers */}
      {channels.length > 0 && (
        <section>
          <h2 className="font-display text-lg text-text-primary mb-4">
            Your Channels
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {channels.map((ch) => (
              <ChannelCard key={ch.platform} channel={ch} onGoalSaved={refetch} />
            ))}
          </div>
        </section>
      )}

      {/* ROW 3 — AI Daily Briefing */}
      <Card className="bg-[#faf8f5]" padding="lg">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="h-5 w-5 text-accent-primary" />
          <h2 className="font-display text-xl text-text-primary">
            Daily Briefing
          </h2>
          <Badge variant="info" size="sm">
            AI generated
          </Badge>
          <Button variant="secondary" size="sm" onClick={regenerate} disabled={generating} className="ml-auto">
            {generating ? (
              <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5 mr-2" />
            )}
            {generating ? "Generating..." : "Regenerate"}
          </Button>
        </div>
        {generating ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-[#e8e6e1] rounded w-full" />
            <div className="h-4 bg-[#e8e6e1] rounded w-5/6" />
            <div className="h-4 bg-[#e8e6e1] rounded w-4/6" />
            <div className="mt-4 space-y-2">
              <div className="h-3 bg-[#e8e6e1] rounded w-3/4" />
              <div className="h-3 bg-[#e8e6e1] rounded w-2/3" />
              <div className="h-3 bg-[#e8e6e1] rounded w-4/5" />
            </div>
          </div>
        ) : hasInsights ? (
          <>
            <p className="text-text-secondary leading-relaxed font-body mb-5">
              {insights.daily_briefing?.summary}
            </p>
            <ul className="space-y-2">
              {insights.daily_briefing?.highlights?.map((h, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-primary" />
                  <span className="text-sm text-text-secondary font-body">
                    {h}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-sm text-text-muted font-body">
            Click &ldquo;Regenerate&rdquo; to generate your AI-powered daily briefing based on your synced data.
          </p>
        )}
      </Card>

      {/* ROW 4 — What's Working / What's Flopping */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card variant="success" padding="md">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-success" />
            <h3 className="font-display text-lg text-text-primary">
              What&rsquo;s Working
            </h3>
          </div>
          {generating ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-3 bg-[#e8e6e1] rounded w-full" />
              <div className="h-3 bg-[#e8e6e1] rounded w-5/6" />
              <div className="h-3 bg-[#e8e6e1] rounded w-4/6" />
            </div>
          ) : hasInsights ? (
            <ul className="space-y-3">
              {insights.whats_working?.map((item, i) => (
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
          ) : (
            <p className="text-sm text-text-muted font-body">
              Generate AI insights to see what&rsquo;s performing well.
            </p>
          )}
        </Card>
        <Card variant="danger" padding="md">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="h-5 w-5 text-danger" />
            <h3 className="font-display text-lg text-text-primary">
              What&rsquo;s Flopping
            </h3>
          </div>
          {generating ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-3 bg-[#e8e6e1] rounded w-full" />
              <div className="h-3 bg-[#e8e6e1] rounded w-5/6" />
              <div className="h-3 bg-[#e8e6e1] rounded w-4/6" />
            </div>
          ) : hasInsights ? (
            <ul className="space-y-3">
              {insights.whats_flopping?.map((item, i) => (
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
          ) : (
            <p className="text-sm text-text-muted font-body">
              Generate AI insights to see what needs improvement.
            </p>
          )}
        </Card>
      </section>

      {/* ROW 5 — Social Headlines / Why We Do This */}
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
          {displayComments.length > 0 ? (
            <ul className="space-y-4">
              {displayComments.map((c, i) => (
                <li key={i}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-text-primary font-body">
                      {String(c.username)}
                    </span>
                    <Badge variant="platform" size="sm">
                      {String(c.platform)}
                    </Badge>
                  </div>
                  <p className="text-sm italic text-text-secondary font-body leading-relaxed">
                    &ldquo;{String(c.comment)}&rdquo;
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-muted font-body">
              Sync your accounts to see comments from your followers.
            </p>
          )}
        </Card>
      </section>

      {/* ROW 6 — Follower Growth Chart (only if real data exists) */}
      {hasGrowthData && (
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
      )}
    </div>
  );
}
