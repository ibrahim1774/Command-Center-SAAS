"use client";

import { useDashboardData } from "@/lib/hooks/useDashboardData";
import { ConnectAccountCard } from "@/components/ui/ConnectAccountCard";
import { UpgradeGate } from "@/components/ui/UpgradeGate";
import { DashboardSkeleton } from "@/components/ui/LoadingSkeleton";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Heart,
  Eye,
  MessageCircle,
  Share2,
  Play,
  TrendingUp,
} from "lucide-react";

interface TikTokData {
  connected: boolean;
  lastSynced: string | null;
  profile: {
    username: string;
    followers: number;
    following: number;
    videoCount: number;
  } | null;
  metrics: {
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
  } | null;
  videos: Array<{
    id: string;
    title: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    thumbnail: string;
    createdAt: string;
  }>;
  comments?: Array<{
    id: string;
    author: string;
    text: string;
    likes: number;
    timestamp: string;
  }>;
}

function fmt(n: number): string {
  if (n >= 1_000_000)
    return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000)
    return (n / 1_000)
      .toFixed(n >= 10_000 ? 0 : 1)
      .replace(/\.0$/, "") + "K";
  return n.toLocaleString();
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function TikTokPage() {
  return (
    <UpgradeGate feature="TikTok analytics">
      <TikTokPageContent />
    </UpgradeGate>
  );
}

function TikTokPageContent() {
  const { data, loading, connected } =
    useDashboardData<TikTokData>("/api/dashboard/tiktok");

  if (loading) return <DashboardSkeleton />;
  if (!connected) return <ConnectAccountCard platform="tiktok" />;

  const profile = data?.profile;
  const metrics = data?.metrics;
  const videos = data?.videos || [];

  return (
    <div className="space-y-8">
      {/* Profile Section */}
      {profile && (
        <Card>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-[#f0ede8] flex items-center justify-center">
              <Play className="h-6 w-6 text-[#c4947a]" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-text-primary">
                {profile.username || "TikTok Account"}
              </h2>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-sm text-text-secondary font-body">
                  <strong className="text-text-primary">{fmt(profile.followers)}</strong> followers
                </span>
                <span className="text-sm text-text-secondary font-body">
                  <strong className="text-text-primary">{fmt(profile.following)}</strong> following
                </span>
                <span className="text-sm text-text-secondary font-body">
                  <strong className="text-text-primary">{fmt(profile.videoCount)}</strong> videos
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Views"
          value={fmt(metrics?.totalViews || 0)}
          icon={<Eye className="h-4 w-4 text-[#c4947a]" />}
        />
        <MetricCard
          label="Likes"
          value={fmt(metrics?.totalLikes || 0)}
          icon={<Heart className="h-4 w-4 text-[#c4947a]" />}
        />
        <MetricCard
          label="Comments"
          value={fmt(metrics?.totalComments || 0)}
          icon={<MessageCircle className="h-4 w-4 text-[#c4947a]" />}
        />
        <MetricCard
          label="Shares"
          value={fmt(metrics?.totalShares || 0)}
          icon={<Share2 className="h-4 w-4 text-[#c4947a]" />}
        />
      </div>

      {/* Recent Videos */}
      {videos.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-[#c4947a]" />
            <h3 className="font-display text-lg font-semibold text-text-primary">
              Recent Videos
            </h3>
          </div>
          <div className="space-y-3">
            {videos.map((video) => (
              <div key={video.id} className="flex items-start gap-3">
                {video.thumbnail ? (
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="h-12 w-12 rounded object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="h-12 w-12 rounded bg-[#f0ede8] flex items-center justify-center flex-shrink-0">
                    <Play className="h-4 w-4 text-text-secondary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary font-body line-clamp-1">
                    {video.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-text-secondary font-body flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {fmt(video.views)}
                    </span>
                    <span className="text-xs text-text-secondary font-body flex items-center gap-1">
                      <Heart className="h-3 w-3" /> {fmt(video.likes)}
                    </span>
                    <span className="text-xs text-text-secondary font-body flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" /> {fmt(video.comments)}
                    </span>
                    {video.createdAt && (
                      <span className="text-[10px] text-text-secondary font-body ml-auto">
                        {timeAgo(video.createdAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Empty state */}
      {videos.length === 0 && (
        <Card className="text-center py-12">
          <Play className="h-10 w-10 text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary font-body">
            No videos found yet. Data will appear after the first sync.
          </p>
        </Card>
      )}
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
