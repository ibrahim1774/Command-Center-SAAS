"use client";

import {
  instagramAnalysisWorking as mockWorking,
  instagramAnalysisFlopping as mockFlopping,
} from "@/lib/mock-data";
import { useDashboardData } from "@/lib/hooks/useDashboardData";
import { useAIInsights } from "@/lib/hooks/useAIInsights";
import { ConnectAccountCard } from "@/components/ui/ConnectAccountCard";
import { SyncStatusBar } from "@/components/ui/SyncStatusBar";
import { DashboardSkeleton } from "@/components/ui/LoadingSkeleton";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { POST_TYPE_COLORS } from "@/lib/constants";
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
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  MessageCircle,
  Sparkles,
  RefreshCw,
  Loader2,
} from "lucide-react";

interface InstagramData {
  connected: boolean;
  lastSynced: string | null;
  profile: {
    username: string;
    follower_count: number;
    following_count: number;
    media_count: number;
  } | null;
  posts: Array<{
    id: string;
    post_id: string;
    caption: string | null;
    media_type: string | null;
    likes: number;
    comments_count: number;
    timestamp: string;
    thumbnail_url?: string | null;
    media_url?: string | null;
    permalink?: string | null;
  }>;
  comments: Array<{
    id: string;
    username: string;
    text: string;
    timestamp: string;
  }>;
  dailyMetrics: Array<{
    date: string;
    reach: number;
    impressions: number;
    follower_count: number;
  }>;
}

function fmt(n: number | null | undefined): string {
  const v = n || 0;
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (v >= 1_000) return (v / 1_000).toFixed(v >= 10_000 ? 0 : 1).replace(/\.0$/, "") + "K";
  return v.toLocaleString();
}

function fmtWhole(n: number | null | undefined): string {
  return (n || 0).toLocaleString();
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getMediaTypeLabel(type: string | null): string {
  if (!type) return "Post";
  const map: Record<string, string> = {
    IMAGE: "Static",
    VIDEO: "Reel",
    CAROUSEL_ALBUM: "Carousel",
  };
  return map[type] || type;
}

export default function InstagramPage() {
  const { data, loading, connected, lastSynced, refetch } =
    useDashboardData<InstagramData>("/api/dashboard/instagram");
  const { insights, generating, regenerate } = useAIInsights();

  if (loading) return <DashboardSkeleton />;
  if (!connected) return <ConnectAccountCard platform="instagram" />;

  const igWorking = insights?.instagram?.whats_working ?? mockWorking;
  const igFlopping = insights?.instagram?.whats_flopping ?? mockFlopping;

  const profile = data?.profile;
  const posts = data?.posts || [];
  const comments = data?.comments || [];

  // Calculate avg likes from posts
  const avgLikes = posts.length > 0
    ? Math.round(posts.reduce((sum, p) => sum + (p.likes || 0), 0) / posts.length)
    : 0;

  return (
    <div className="space-y-8">
      <SyncStatusBar
        lastSynced={lastSynced}
        platform="instagram"
        onRefreshComplete={refetch}
      />

      {/* Row 1: Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Followers"
          value={fmtWhole(profile?.follower_count || 0)}
          icon={<Users className="h-4 w-4 text-[#c4947a]" />}
        />
        <MetricCard
          label="Following"
          value={fmtWhole(profile?.following_count || 0)}
        />
        <MetricCard
          label="Posts"
          value={fmtWhole(profile?.media_count || 0)}
          icon={<MessageCircle className="h-4 w-4 text-[#c4947a]" />}
        />
        <MetricCard
          label="Avg Likes"
          value={fmt(avgLikes)}
          icon={<Eye className="h-4 w-4 text-[#c4947a]" />}
        />
      </div>

      {/* Row 2: Latest Posts */}
      {posts.length > 0 && (
        <Card>
          <h3 className="font-display text-lg font-semibold text-text-primary mb-4">
            Latest Posts
          </h3>
          <div className="space-y-3">
            {posts.map((post) => {
              const typeLabel = getMediaTypeLabel(post.media_type);
              const typeColor = POST_TYPE_COLORS[typeLabel] ?? {
                bg: "#f0ede8",
                text: "#6b6b6b",
              };
              return (
                <a
                  key={post.id}
                  href={post.media_url || post.permalink || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 hover:bg-page-bg/60 rounded-lg p-1 -m-1 transition-colors"
                >
                  {post.thumbnail_url ? (
                    <img
                      src={post.thumbnail_url}
                      alt=""
                      className="h-12 w-12 rounded object-cover flex-shrink-0"
                    />
                  ) : (
                    <div
                      className="h-12 w-12 rounded flex-shrink-0"
                      style={{ backgroundColor: "#f0ede8" }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary font-body line-clamp-2">
                      {post.caption || "(no caption)"}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-text-secondary font-body">
                        {fmtWhole(post.likes)} likes
                      </span>
                      <span className="text-xs text-text-secondary font-body">
                        {fmtWhole(post.comments_count)} comments
                      </span>
                      <Badge
                        size="sm"
                        className="ml-auto"
                        style={{
                          backgroundColor: typeColor.bg,
                          color: typeColor.text,
                        }}
                      >
                        {typeLabel}
                      </Badge>
                      <span className="text-[10px] text-text-secondary font-body">
                        {timeAgo(post.timestamp)}
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </Card>
      )}

      {/* Row 4: Recent Comments */}
      {comments.length > 0 && (
        <Card>
          <h3 className="font-display text-lg font-semibold text-text-primary mb-4">
            Recent Comments
          </h3>
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id}>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-text-primary font-body">
                    {comment.username}
                  </p>
                  <span className="text-[10px] text-text-secondary font-body">
                    {timeAgo(comment.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-text-secondary font-body mt-0.5">
                  {comment.text}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Row 5: AI Analysis */}
      <div className="flex items-center gap-3 mb-1">
        <Sparkles className="h-4 w-4 text-accent-primary" />
        <h3 className="font-display text-sm font-semibold text-text-secondary uppercase tracking-wider">
          AI Analysis
        </h3>
        <Badge variant="info" size="sm">AI generated</Badge>
        <Button variant="ghost" size="sm" onClick={regenerate} disabled={generating} className="ml-auto">
          {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card variant="success">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-[#6b8f71]" />
            <h3 className="font-display text-lg font-semibold text-text-primary">
              What&apos;s Working
            </h3>
          </div>
          {generating ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-3 bg-[#e8e6e1] rounded w-full" />
              <div className="h-3 bg-[#e8e6e1] rounded w-5/6" />
              <div className="h-3 bg-[#e8e6e1] rounded w-4/6" />
            </div>
          ) : (
            <ul className="space-y-3">
              {igWorking.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#6b8f71] flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-text-primary font-body">{item.text}</p>
                    {item.metric && (
                      <Badge variant="positive" size="sm" className="mt-1">
                        {item.metric}
                      </Badge>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card variant="danger">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="h-5 w-5 text-[#c4626a]" />
            <h3 className="font-display text-lg font-semibold text-text-primary">
              What&apos;s Flopping
            </h3>
          </div>
          {generating ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-3 bg-[#e8e6e1] rounded w-full" />
              <div className="h-3 bg-[#e8e6e1] rounded w-5/6" />
              <div className="h-3 bg-[#e8e6e1] rounded w-4/6" />
            </div>
          ) : (
            <ul className="space-y-3">
              {igFlopping.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#c4626a] flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-text-primary font-body">{item.text}</p>
                    {item.metric && (
                      <Badge variant="negative" size="sm" className="mt-1">
                        {item.metric}
                      </Badge>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] uppercase tracking-wider text-text-secondary font-body">
          {label}
        </p>
        {icon && icon}
      </div>
      <p className="text-2xl font-display font-bold text-text-primary">
        {value}
      </p>
    </Card>
  );
}
