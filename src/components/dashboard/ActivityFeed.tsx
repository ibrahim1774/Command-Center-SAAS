import { Card } from "@/components/ui/Card";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { formatRelativeTime } from "@/lib/utils";
import { activityFeed } from "@/lib/mock-data";
import { PLATFORM_CONFIG } from "@/lib/constants";
import type { ActivityItem } from "@/types";

const typeLabels: Record<ActivityItem["type"], string> = {
  comment: "Comment",
  like: "Like",
  milestone: "Milestone",
  mention: "Mention",
  share: "Share",
};

function ActivityRow({ item }: { item: ActivityItem }) {
  const platformColor = PLATFORM_CONFIG[item.platform].color;

  return (
    <div className="flex gap-3 py-3 border-b border-border-subtle last:border-0">
      {/* Timeline dot and line */}
      <div className="flex flex-col items-center pt-1">
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: platformColor }}
        />
        <div className="w-px flex-1 bg-border-subtle mt-1" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <PlatformIcon platform={item.platform} size={10} showBackground={false} />
          <span className="text-xs text-text-tertiary uppercase tracking-wider">
            {typeLabels[item.type]}
          </span>
          <span className="text-xs text-text-tertiary ml-auto shrink-0">
            {formatRelativeTime(item.timestamp)}
          </span>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">
          {item.message}
        </p>
      </div>
    </div>
  );
}

export function ActivityFeed() {
  const items = activityFeed.slice(0, 10);

  return (
    <Card padding="lg" className="flex flex-col">
      <h2 className="font-display font-semibold text-lg text-text-primary mb-4">
        Activity Feed
      </h2>

      <div className="flex-1 overflow-y-auto max-h-[400px] -mr-2 pr-2">
        {items.map((item) => (
          <ActivityRow key={item.id} item={item} />
        ))}
      </div>
    </Card>
  );
}
