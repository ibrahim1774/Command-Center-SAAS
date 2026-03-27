"use client";

import { facebookInsights as mockInsights } from "@/lib/mock-data";
import { useDashboardData } from "@/lib/hooks/useDashboardData";
import { useAIInsights } from "@/lib/hooks/useAIInsights";
import { ConnectAccountCard } from "@/components/ui/ConnectAccountCard";
import { SyncStatusBar } from "@/components/ui/SyncStatusBar";
import { DashboardSkeleton } from "@/components/ui/LoadingSkeleton";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  TrendingUp,
  TrendingDown,
  MessageCircle,
  Share2,
  Sparkles,
  RefreshCw,
  Loader2,
} from "lucide-react";

interface FacebookData {
  connected: boolean;
  lastSynced: string | null;
  page: {
    name: string;
    followers: number;
    likes: number;
  } | null;
  posts: Array<{
    id: string;
    post_id: string;
    message: string | null;
    post_type: string;
    reactions: Record<string, number>;
    comments_count: number;
    shares: number;
    reach: number;
    created_time: string;
  }>;
  comments: Array<{
    id: string;
    author: string;
    text: string;
    timestamp: string;
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

export default function FacebookPage() {
  const { data, loading, connected, lastSynced, refetch } =
    useDashboardData<FacebookData>("/api/dashboard/facebook");
  const { insights, generating, regenerate } = useAIInsights();

  if (loading) return <DashboardSkeleton />;
  if (!connected) return <ConnectAccountCard platform="facebook" />;

  const page = data?.page;
  const posts = data?.posts || [];
  const comments = data?.comments || [];

  const fbWorking = insights?.facebook?.whats_working ?? mockInsights.working;
  const fbFlopping = insights?.facebook?.whats_flopping ?? mockInsights.flopping;

  return (
    <div className="space-y-8">
      <SyncStatusBar
        lastSynced={lastSynced}
        platform="facebook"
        onRefreshComplete={refetch}
      />

      {/* Row 1: Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md">
          <p className="text-[10px] font-medium uppercase tracking-widest text-text-muted mb-1">
            Page Name
          </p>
          <p className="text-lg font-bold font-[family-name:var(--font-display)] text-text-primary">
            {page?.name || "—"}
          </p>
        </Card>
        <Card padding="md">
          <p className="text-[10px] font-medium uppercase tracking-widest text-text-muted mb-1">
            Page Followers
          </p>
          <p className="text-2xl font-bold font-[family-name:var(--font-display)] text-text-primary">
            {fmt(page?.followers || 0)}
          </p>
        </Card>
        <Card padding="md">
          <p className="text-[10px] font-medium uppercase tracking-widest text-text-muted mb-1">
            Page Likes
          </p>
          <p className="text-2xl font-bold font-[family-name:var(--font-display)] text-text-primary">
            {fmt(page?.likes || 0)}
          </p>
        </Card>
        <Card padding="md">
          <p className="text-[10px] font-medium uppercase tracking-widest text-text-muted mb-1">
            Total Posts
          </p>
          <p className="text-2xl font-bold font-[family-name:var(--font-display)] text-text-primary">
            {posts.length}
          </p>
        </Card>
      </div>

      {/* Row 2: Recent Posts */}
      {posts.length > 0 && (
        <Card padding="lg">
          <h2 className="text-xl font-semibold font-[family-name:var(--font-display)] text-text-primary mb-6">
            Recent Posts
          </h2>
          <div className="divide-y divide-card-border">
            {posts.map((post) => (
              <div key={post.id} className="py-5 first:pt-0 last:pb-0">
                <div className="flex items-start gap-3 mb-3">
                  <Badge variant="platform" size="sm" className="shrink-0 capitalize">
                    {post.post_type}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-text-primary line-clamp-2 text-sm">
                      {post.message || "(no text)"}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      {timeAgo(post.created_time)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary">
                  {post.reactions?.total > 0 && (
                    <span>👍 {post.reactions.total.toLocaleString()}</span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5" />
                    {post.comments_count.toLocaleString()}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Share2 className="w-3.5 h-3.5" />
                    {post.shares.toLocaleString()}
                  </span>
                  {post.reach > 0 && (
                    <Badge variant="neutral" size="sm">
                      Reach: {post.reach.toLocaleString()}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Row 3: Recent Comments */}
      {comments.length > 0 && (
        <Card padding="lg">
          <h2 className="text-xl font-semibold font-[family-name:var(--font-display)] text-text-primary mb-6">
            Comments
          </h2>
          <div className="divide-y divide-card-border">
            {comments.map((comment) => (
              <div key={comment.id} className="py-4 first:pt-0 last:pb-0">
                <p className="text-sm font-bold text-text-primary">{comment.author}</p>
                <p className="text-sm text-text-secondary mt-1">{comment.text}</p>
                <p className="text-xs text-text-muted mt-1.5">
                  {timeAgo(comment.timestamp)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Row 4: AI Insights */}
      <div className="flex items-center gap-3 mb-1">
        <Sparkles className="h-4 w-4 text-accent-primary" />
        <h3 className="font-display text-sm font-semibold text-text-secondary uppercase tracking-wider">
          AI Insights
        </h3>
        <Badge variant="info" size="sm">AI generated</Badge>
        <Button variant="ghost" size="sm" onClick={regenerate} disabled={generating} className="ml-auto">
          {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card variant="success" padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-success" />
            <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] text-text-primary">
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
              {fbWorking.map((item, i) => (
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
            <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] text-text-primary">
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
              {fbFlopping.map((item, i) => (
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
      </div>
    </div>
  );
}
