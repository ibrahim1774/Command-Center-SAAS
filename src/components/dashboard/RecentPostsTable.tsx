import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import {
  formatCompact,
  formatRelativeTime,
  formatPercentage,
} from "@/lib/utils";
import { recentPosts } from "@/lib/mock-data";
import { Heart, MessageCircle, Share2, ArrowUpRight } from "lucide-react";
import type { Post } from "@/types";

function engagementVariant(rate: number) {
  if (rate > 5) return "positive" as const;
  if (rate >= 2) return "info" as const;
  return "neutral" as const;
}

const columns = [
  { label: "Post", className: "flex-[2]" },
  { label: "Date", className: "w-24" },
  { label: "Likes", className: "w-20" },
  { label: "Comments", className: "w-20" },
  { label: "Shares", className: "w-20" },
  { label: "Eng. Rate", className: "w-20" },
] as const;

function PostRow({ post }: { post: Post }) {
  return (
    <div className="flex items-center px-4 py-3 border-b border-border-subtle last:border-0 hover:bg-surface-tertiary/30 transition-colors">
      {/* Post content */}
      <div className="flex-[2] flex items-center gap-2 min-w-0">
        <PlatformIcon platform={post.platform} size={14} showBackground={false} />
        <span className="text-sm text-text-secondary line-clamp-1">
          {post.content}
        </span>
      </div>

      {/* Date */}
      <div className="w-24 text-xs text-text-tertiary">
        {formatRelativeTime(post.publishedAt)}
      </div>

      {/* Likes */}
      <div className="w-20 flex items-center gap-1.5">
        <Heart size={12} className="text-text-tertiary" />
        <span className="text-sm text-text-secondary">
          {formatCompact(post.likes)}
        </span>
      </div>

      {/* Comments */}
      <div className="w-20 flex items-center gap-1.5">
        <MessageCircle size={12} className="text-text-tertiary" />
        <span className="text-sm text-text-secondary">
          {formatCompact(post.comments)}
        </span>
      </div>

      {/* Shares */}
      <div className="w-20 flex items-center gap-1.5">
        <Share2 size={12} className="text-text-tertiary" />
        <span className="text-sm text-text-secondary">
          {formatCompact(post.shares)}
        </span>
      </div>

      {/* Engagement Rate */}
      <div className="w-20">
        <Badge variant={engagementVariant(post.engagementRate)} size="sm">
          {formatPercentage(post.engagementRate)}
        </Badge>
      </div>
    </div>
  );
}

export function RecentPostsTable() {
  const posts = recentPosts.slice(0, 8);

  return (
    <Card padding="lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display font-semibold text-lg text-text-primary">
          Recent Posts
        </h2>
        <a
          href="#"
          className="text-accent-blue text-sm hover:underline inline-flex items-center gap-1"
        >
          View All
          <ArrowUpRight size={14} />
        </a>
      </div>

      {/* Column headers */}
      <div className="flex items-center bg-surface-primary/50 rounded-lg px-4 py-2 mb-1">
        {columns.map((col) => (
          <div
            key={col.label}
            className={`${col.className} text-xs uppercase tracking-wider text-text-tertiary font-body`}
          >
            {col.label}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div>
        {posts.map((post) => (
          <PostRow key={post.id} post={post} />
        ))}
      </div>
    </Card>
  );
}
