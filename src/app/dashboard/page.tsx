"use client";

import { useState, useEffect, useCallback } from "react";
import {
  socialHeadlines,
  followerComments as mockComments,
} from "@/lib/mock-data";
import { useDashboardData } from "@/lib/hooks/useDashboardData";
import { useAIInsights } from "@/lib/hooks/useAIInsights";
import { useTrendIntelligence } from "@/lib/hooks/useTrendIntelligence";
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
  ArrowRight,
  Flame,
  Calendar,
  Hash,
  UserCheck,
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

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
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

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export default function DashboardPage() {
  const { data, refetch } = useDashboardData<OverviewData>("/api/dashboard/overview");
  const { insights, generating, regenerate } = useAIInsights();
  const {
    daily: trendDaily,
    weekly: trendWeekly,
    dailyUpdated: trendDailyUpdated,
    weeklyUpdated: trendWeeklyUpdated,
    loading: trendsLoading,
    refreshing: trendsRefreshing,
    refreshDaily,
    refreshWeekly,
  } = useTrendIntelligence();
  const [trendTab, setTrendTab] = useState<"hashtags" | "creators">("hashtags");

  // Fire Meta Pixel Purchase event after Stripe checkout
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success" && window.fbq) {
      const price = parseFloat(params.get("price") || "9");
      const plan = params.get("plan") || "hobby";
      window.fbq("track", "Purchase", {
        value: price,
        currency: "USD",
        content_name: `${plan} plan`,
        content_type: "subscription",
      });
      // Clean up URL so it doesn't re-fire on refresh
      window.history.replaceState({}, "", "/dashboard");
    }
  }, []);

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

  const viralScore = trendWeekly?.viralScore ?? 0;
  const topHashtags = trendDaily?.hashtags?.slice(0, 3) || [];
  const trendDailyAge = trendDailyUpdated
    ? formatRelativeTime(trendDailyUpdated)
    : null;

  return (
    <div className="space-y-8">
      {/* ── HERO TREND BANNER ── */}
      <section
        className="rounded-xl p-6 md:p-8"
        style={{
          background: "linear-gradient(135deg, #1a1a1a 0%, #2a2420 50%, #1a1a1a 100%)",
        }}
      >
        {trendsLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-white/10 rounded w-40" />
            <div className="h-8 bg-white/10 rounded w-64" />
            <div className="flex gap-3 mt-4">
              <div className="h-8 bg-white/10 rounded-full w-36" />
              <div className="h-8 bg-white/10 rounded-full w-44" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
            {/* Left side */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <span className="h-2 w-2 rounded-full bg-[#6b8f71] animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6b8f71]">
                  Live Trend Intelligence
                </span>
              </div>
              <h2
                className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-3"
                style={{ fontFamily: "var(--font-display)" }}
              >
                What&rsquo;s Blowing Up Right Now
              </h2>
              <p className="text-sm text-white/50 font-body mb-4 max-w-md">
                Updated daily from TikTok + weekly across 6 platforms.
                Act on trends before your competitors even see them.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80">
                  <Flame className="h-3 w-3 text-orange-400" />
                  {trendDailyAge ? `Updated ${trendDailyAge}` : "Awaiting first sync"}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80">
                  <Calendar className="h-3 w-3 text-blue-400" />
                  Weekly Report: Monday
                </span>
              </div>
            </div>

            {/* Right side */}
            <div className="w-full md:w-80 shrink-0 space-y-4">
              {/* Top 3 hashtags */}
              {topHashtags.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-widest text-white/40 font-body">
                    Trending Now
                  </p>
                  {topHashtags.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-white/30">
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium text-white truncate">
                          #{h.name}
                        </span>
                        {h.isNew && (
                          <span className="text-[10px] font-bold text-orange-400">
                            🔥
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-white/50 shrink-0 ml-2">
                        {fmt(h.viewCount)} views
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg bg-white/5 p-4 text-center">
                  <p className="text-xs text-white/40">
                    Click &ldquo;Refresh Now&rdquo; below to load trends
                  </p>
                </div>
              )}

              {/* Viral Score + CTA */}
              <div className="flex items-center gap-4">
                {trendWeekly && (
                  <div className="flex items-center gap-3 rounded-lg bg-white/5 px-4 py-3 flex-1">
                    <div className="relative h-12 w-12 shrink-0">
                      <svg viewBox="0 0 36 36" className="h-12 w-12 -rotate-90">
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9"
                          fill="none"
                          stroke="rgba(255,255,255,0.08)"
                          strokeWidth="3"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9"
                          fill="none"
                          stroke="#c4947a"
                          strokeWidth="3"
                          strokeDasharray={`${viralScore} ${100 - viralScore}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                        {viralScore}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white/80">Viral Score</p>
                      <p className="text-[10px] text-white/40">This week</p>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => {
                    const el = document.getElementById("trend-intelligence");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#c4947a] px-4 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity shrink-0"
                >
                  Full Report
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

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

      {/* ── TREND INTELLIGENCE SECTION ── */}
      <section id="trend-intelligence">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-text-primary">
            This Week&rsquo;s Trend Intelligence
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* LEFT 2/3: Daily TikTok Trends */}
          <div className="lg:col-span-2">
            <Card padding="md" className="h-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-black/5 flex items-center justify-center">
                    <Music className="h-3.5 w-3.5 text-text-primary" />
                  </div>
                  <h3 className="font-display text-base text-text-primary">
                    TikTok Daily Trends
                  </h3>
                  <Badge variant="info" size="sm">Daily</Badge>
                </div>
                <div className="flex items-center gap-3">
                  {trendDailyUpdated && (
                    <span className="text-[10px] text-text-muted">
                      Updated {formatRelativeTime(trendDailyUpdated)}
                    </span>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={refreshDaily}
                    disabled={trendsRefreshing === "daily"}
                  >
                    {trendsRefreshing === "daily" ? (
                      <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3 mr-1.5" />
                    )}
                    {trendsRefreshing === "daily" ? "Refreshing..." : "Refresh Now"}
                  </Button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 rounded-lg bg-[#f0ede8] p-1 mb-4">
                {([
                  { key: "hashtags" as const, label: "Hashtags", icon: Hash },
                  { key: "creators" as const, label: "Creators", icon: UserCheck },
                ]).map(({ key, label, icon: TabIcon }) => (
                  <button
                    key={key}
                    onClick={() => setTrendTab(key)}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all ${
                      trendTab === key
                        ? "bg-white text-text-primary shadow-sm"
                        : "text-text-muted hover:text-text-secondary"
                    }`}
                  >
                    <TabIcon className="h-3 w-3" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {!trendDaily ? (
                <div className="text-center py-10">
                  <p className="text-sm text-text-muted font-body">
                    No trend data yet. Click &ldquo;Refresh Now&rdquo; to pull the latest TikTok trends.
                  </p>
                </div>
              ) : trendTab === "hashtags" ? (
                <div className="space-y-1.5">
                  {(trendDaily.hashtags || []).map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-[#faf8f5] transition-colors"
                    >
                      <span className="text-xs font-bold text-text-muted w-5 text-right">
                        {h.rank || i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-text-primary">
                          #{h.name}
                        </span>
                        {h.videoCount > 0 && (
                          <span className="text-[10px] text-text-muted ml-2">
                            {fmt(h.videoCount)} videos
                          </span>
                        )}
                      </div>
                      {h.isNew && (
                        <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">
                          🔥 NEW
                        </span>
                      )}
                      {h.rankDiff > 0 && (
                        <span className="text-[10px] font-medium text-success shrink-0">
                          +{h.rankDiff}
                        </span>
                      )}
                      <span className="text-xs text-text-muted shrink-0">
                        {fmt(h.viewCount)} views
                      </span>
                    </div>
                  ))}
                  {trendDaily.hashtags.length === 0 && (
                    <p className="text-sm text-text-muted text-center py-6">No hashtag data available</p>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {(trendDaily.creators || []).map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-[#faf8f5] transition-colors"
                    >
                      <span className="text-xs font-bold text-text-muted w-5 text-right">
                        {c.rank || i + 1}
                      </span>
                      {c.avatar && (
                        <img
                          src={c.avatar}
                          alt={c.username}
                          className="h-7 w-7 rounded-full object-cover shrink-0"
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {c.username}
                        </p>
                      </div>
                      {c.profileUrl && (
                        <a
                          href={c.profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-accent-primary hover:underline shrink-0"
                        >
                          View Profile
                        </a>
                      )}
                    </div>
                  ))}
                  {trendDaily.creators.length === 0 && (
                    <p className="text-sm text-text-muted text-center py-6">No creator data available</p>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* RIGHT 1/3: Weekly Cross-Platform Report */}
          <div>
            <Card padding="md" className="h-full">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent-primary" />
                  <h3 className="font-display text-base text-text-primary">
                    Weekly Report
                  </h3>
                  <Badge variant="info" size="sm">AI-Powered</Badge>
                </div>
              </div>

              {!trendWeekly ? (
                <div className="text-center py-10 space-y-3">
                  <p className="text-sm text-text-muted font-body">
                    No weekly report yet.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={refreshWeekly}
                    disabled={trendsRefreshing === "weekly"}
                  >
                    {trendsRefreshing === "weekly" ? (
                      <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3 mr-1.5" />
                    )}
                    {trendsRefreshing === "weekly" ? "Generating..." : "Generate Report"}
                  </Button>
                </div>
              ) : (
                <>
                  {/* Viral Score Meter */}
                  <div className="text-center mb-6">
                    <div className="relative mx-auto h-24 w-24">
                      <svg viewBox="0 0 36 36" className="h-24 w-24 -rotate-90">
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9"
                          fill="none"
                          stroke="#f0ede8"
                          strokeWidth="2.5"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9"
                          fill="none"
                          stroke={viralScore >= 70 ? "#6b8f71" : viralScore >= 40 ? "#c4947a" : "#c4626a"}
                          strokeWidth="2.5"
                          strokeDasharray={`${viralScore} ${100 - viralScore}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold font-display text-text-primary">
                          {viralScore}
                        </span>
                        <span className="text-[9px] text-text-muted uppercase tracking-wider">
                          Score
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-text-muted mt-2 font-body">
                      Viral Trend Score
                    </p>
                  </div>

                  {/* Platform Breakdown */}
                  {trendWeekly.platforms.length > 0 && (
                    <div className="mb-5">
                      <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2 font-body">
                        Platform Breakdown
                      </p>
                      <div className="space-y-2">
                        {trendWeekly.platforms.map((p, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="text-text-secondary font-body truncate">{p.name}</span>
                            <div className="flex items-center gap-2">
                              {p.topTrend && (
                                <span className="text-[10px] text-text-muted truncate max-w-[80px]">{p.topTrend}</span>
                              )}
                              <Badge variant="info" size="sm">{p.trendCount} trends</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cross-Platform Trends */}
                  {trendWeekly.topTrends && trendWeekly.topTrends.length > 0 && (
                    <div className="mb-5">
                      <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2 font-body">
                        Cross-Platform Trends
                      </p>
                      <div className="space-y-1.5">
                        {trendWeekly.topTrends.slice(0, 5).map((t, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="text-text-primary font-medium font-body truncate">{t.topic}</span>
                            <span className="text-[10px] text-text-muted shrink-0 ml-2">
                              {t.platforms.length} platforms
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Recommendations */}
                  {trendWeekly.aiRecommendations.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-accent-primary">
                        AI Recommendations
                      </p>
                      {trendWeekly.aiRecommendations.map((rec, i) => (
                        <div key={i} className="rounded-lg p-2.5" style={{ backgroundColor: "rgba(196, 148, 122, 0.06)", border: "1px solid rgba(196, 148, 122, 0.12)" }}>
                          <p className="text-xs text-text-secondary font-body leading-relaxed">
                            {rec}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Last updated + Refresh */}
                  <div className="flex items-center justify-between pt-3 border-t border-card-border">
                    {trendWeeklyUpdated && (
                      <span className="text-[10px] text-text-muted">
                        Updated {formatRelativeTime(trendWeeklyUpdated)}
                      </span>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={refreshWeekly}
                      disabled={trendsRefreshing === "weekly"}
                    >
                      {trendsRefreshing === "weekly" ? (
                        <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3 mr-1.5" />
                      )}
                      Refresh
                    </Button>
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>
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
