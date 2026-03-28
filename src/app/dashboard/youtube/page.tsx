"use client";

import { youtubeAnalysis as mockAnalysis } from "@/lib/mock-data";
import { useDashboardData } from "@/lib/hooks/useDashboardData";
import { useAIInsights } from "@/lib/hooks/useAIInsights";
import { ConnectAccountCard } from "@/components/ui/ConnectAccountCard";
import { UpgradeGate } from "@/components/ui/UpgradeGate";
import { SyncStatusBar } from "@/components/ui/SyncStatusBar";
import { DashboardSkeleton } from "@/components/ui/LoadingSkeleton";
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
  TrendingUp,
  TrendingDown,
  Play,
  ThumbsUp,
  MessageCircle,
  Lightbulb,
  Sparkles,
  RefreshCw,
  Loader2,
} from "lucide-react";

interface YouTubeData {
  connected: boolean;
  lastSynced: string | null;
  channel: {
    title: string;
    subscriber_count: number;
    total_views: number;
    video_count: number;
  } | null;
  videos: Array<{
    id: string;
    video_id: string;
    title: string;
    thumbnail_url: string;
    published_at: string;
    views: number;
    likes: number;
    comments_count: number;
  }>;
  comments: Array<{
    id: string;
    author: string;
    text: string;
    like_count: number;
    published_at: string;
  }>;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, "") + "K";
  return n.toLocaleString();
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

export default function YouTubePage() {
  return (
    <UpgradeGate feature="YouTube analytics">
      <YouTubePageContent />
    </UpgradeGate>
  );
}

function YouTubePageContent() {
  const { data, loading, connected, lastSynced, refetch } =
    useDashboardData<YouTubeData>("/api/dashboard/youtube");
  const { insights, generating, regenerate } = useAIInsights();

  if (loading) return <DashboardSkeleton />;
  if (!connected) return <ConnectAccountCard platform="youtube" />;

  const channel = data?.channel;
  const videos = data?.videos || [];
  const comments = data?.comments || [];

  const ytWorking = insights?.youtube?.whats_working ?? mockAnalysis.working;
  const ytFlopping = insights?.youtube?.whats_flopping ?? mockAnalysis.flopping;
  const ytIdeas = insights?.youtube?.content_ideas ?? mockAnalysis.contentIdeas;

  return (
    <div className="space-y-8">
      <SyncStatusBar
        lastSynced={lastSynced}
        platform="youtube"
        onRefreshComplete={refetch}
      />

      {/* Row 1: Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md">
          <p className="text-[10px] font-medium uppercase tracking-widest text-text-muted mb-1">
            Subscribers
          </p>
          <p className="text-2xl font-bold font-[family-name:var(--font-display)] text-text-primary">
            {fmt(channel?.subscriber_count || 0)}
          </p>
        </Card>
        <Card padding="md">
          <p className="text-[10px] font-medium uppercase tracking-widest text-text-muted mb-1">
            Total Views
          </p>
          <p className="text-2xl font-bold font-[family-name:var(--font-display)] text-text-primary">
            {fmt(channel?.total_views || 0)}
          </p>
        </Card>
        <Card padding="md">
          <p className="text-[10px] font-medium uppercase tracking-widest text-text-muted mb-1">
            Videos
          </p>
          <p className="text-2xl font-bold font-[family-name:var(--font-display)] text-text-primary">
            {channel?.video_count || 0}
          </p>
        </Card>
        <Card padding="md">
          <p className="text-[10px] font-medium uppercase tracking-widest text-text-muted mb-1">
            Avg Views/Video
          </p>
          <p className="text-2xl font-bold font-[family-name:var(--font-display)] text-text-primary">
            {channel && channel.video_count > 0
              ? fmt(Math.round(channel.total_views / channel.video_count))
              : "0"}
          </p>
        </Card>
      </div>

      {/* Row 2: Views Chart (from video data) */}
      {videos.length > 0 && (
        <Card padding="lg">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-xl font-semibold font-[family-name:var(--font-display)] text-text-primary">
              Recent Video Views
            </h2>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[...videos].reverse()}>
                <defs>
                  <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d4897a" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#d4897a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e6e1" vertical={false} />
                <XAxis
                  dataKey="published_at"
                  tick={{ fontSize: 11, fill: "#a09a90" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e8e6e1" }}
                  tickFormatter={(value: string) => {
                    const d = new Date(value);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#a09a90" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value: number) => fmt(value)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e8e6e1",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontFamily: "var(--font-body)",
                  }}
                  formatter={(value) => [Number(value).toLocaleString(), "Views"]}
                  labelFormatter={(label) => {
                    const d = new Date(label);
                    return d.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#d4897a"
                  strokeWidth={2}
                  fill="url(#viewsFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Row 3: Recent Uploads */}
      {videos.length > 0 && (
        <Card padding="lg">
          <h2 className="text-xl font-semibold font-[family-name:var(--font-display)] text-text-primary mb-6">
            Recent Uploads
          </h2>
          <div className="divide-y divide-card-border">
            {videos.map((video) => (
              <div key={video.id} className="py-5 first:pt-0 last:pb-0">
                <div className="flex items-start gap-4">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt=""
                      className="w-[120px] h-[68px] rounded-lg shrink-0 object-cover"
                    />
                  ) : (
                    <div className="w-[120px] h-[68px] rounded-lg shrink-0 bg-[#f0ede8]" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium text-text-primary text-sm line-clamp-2">
                        {video.title}
                      </p>
                      <span className="text-xs text-text-muted shrink-0">
                        {timeAgo(video.published_at)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary mt-2">
                      <span className="inline-flex items-center gap-1">
                        <Play className="w-3.5 h-3.5" />
                        {video.views.toLocaleString()}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        {video.likes.toLocaleString()}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5" />
                        {video.comments_count.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Row 4: Top Comments */}
      {comments.length > 0 && (
        <Card padding="lg">
          <h2 className="text-xl font-semibold font-[family-name:var(--font-display)] text-text-primary mb-6">
            Top Comments
          </h2>
          <div className="divide-y divide-card-border">
            {comments.map((comment) => (
              <div key={comment.id} className="py-4 first:pt-0 last:pb-0">
                <p className="text-sm font-semibold text-text-primary">{comment.author}</p>
                <p className="text-sm text-text-secondary mt-1">{comment.text}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="inline-flex items-center gap-1 text-xs text-text-secondary">
                    <ThumbsUp className="w-3 h-3" />
                    {comment.like_count.toLocaleString()}
                  </span>
                  <span className="text-xs text-text-muted">
                    {timeAgo(comment.published_at)}
                  </span>
                </div>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="success" padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-success" />
            <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] text-success">
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
              {ytWorking.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                  <span className="text-success mt-0.5 shrink-0">&#8226;</span>
                  <span>
                    {item.text}
                    {item.metric && (
                      <Badge variant="positive" size="sm" className="ml-2">
                        {item.metric}
                      </Badge>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card variant="danger" padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-danger" />
            <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] text-danger">
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
              {ytFlopping.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                  <span className="text-danger mt-0.5 shrink-0">&#8226;</span>
                  <span>
                    {item.text}
                    {item.metric && (
                      <Badge variant="negative" size="sm" className="ml-2">
                        {item.metric}
                      </Badge>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-accent-primary" />
            <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] text-accent-primary">
              Content Ideas
            </h3>
          </div>
          {generating ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-3 bg-[#e8e6e1] rounded w-full" />
              <div className="h-3 bg-[#e8e6e1] rounded w-5/6" />
              <div className="h-3 bg-[#e8e6e1] rounded w-4/6" />
            </div>
          ) : (
            <ol className="space-y-3">
              {ytIdeas.map((idea, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-text-secondary">
                  <span className="text-accent-primary font-semibold shrink-0">{i + 1}.</span>
                  <span>{idea}</span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    </div>
  );
}
