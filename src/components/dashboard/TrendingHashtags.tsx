import { Card } from "@/components/ui/Card";
import { formatCompact } from "@/lib/utils";
import { trendingHashtags } from "@/lib/mock-data";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { TrendingHashtag } from "@/types";

const trendConfig = {
  up: { icon: TrendingUp, color: "text-accent-green" },
  down: { icon: TrendingDown, color: "text-accent-coral" },
  stable: { icon: Minus, color: "text-text-tertiary" },
} as const;

function HashtagRow({ hashtag }: { hashtag: TrendingHashtag }) {
  const isFirst = hashtag.rank === 1;
  const { icon: TrendIcon, color } = trendConfig[hashtag.trend];

  return (
    <div
      className={`flex items-center gap-3 py-2.5 border-b border-border-subtle last:border-0 ${
        isFirst ? "bg-accent-amber/5 -mx-3 px-3 rounded-lg" : ""
      }`}
    >
      {/* Rank */}
      <span
        className={`font-display font-bold w-6 text-center text-sm ${
          isFirst ? "text-accent-amber" : "text-text-tertiary"
        }`}
      >
        {hashtag.rank}
      </span>

      {/* Tag */}
      <span className="font-medium text-text-primary text-sm flex-1">
        {hashtag.tag}
      </span>

      {/* Post count */}
      <span className="text-xs text-text-tertiary">
        {formatCompact(hashtag.postCount)} posts
      </span>

      {/* Trend indicator */}
      <TrendIcon size={14} className={color} />

      {/* Change percent */}
      <span className={`text-xs w-10 text-right ${color}`}>
        {hashtag.trend === "down" ? "-" : "+"}
        {hashtag.changePercent}%
      </span>
    </div>
  );
}

export function TrendingHashtags() {
  return (
    <Card padding="lg">
      {/* Header */}
      <h2 className="font-display font-semibold text-lg text-text-primary mb-5">
        Trending Topics
      </h2>

      {/* List */}
      <div>
        {trendingHashtags.map((hashtag) => (
          <HashtagRow key={hashtag.rank} hashtag={hashtag} />
        ))}
      </div>
    </Card>
  );
}
