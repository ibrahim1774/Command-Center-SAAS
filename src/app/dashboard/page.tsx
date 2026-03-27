import { QuickStatsBar } from "@/components/dashboard/QuickStatsBar";
import EngagementChart from "@/components/dashboard/EngagementChart";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { PlatformOverviewCards } from "@/components/dashboard/PlatformOverviewCards";
import { RecentPostsTable } from "@/components/dashboard/RecentPostsTable";
import { TrendingHashtags } from "@/components/dashboard/TrendingHashtags";
import { AudienceDemographics } from "@/components/dashboard/AudienceDemographics";
import { AnimatedContainer, AnimatedItem } from "@/components/ui/AnimatedCard";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Row 1: Quick Stats */}
      <AnimatedContainer delay={0}>
        <AnimatedItem>
          <QuickStatsBar />
        </AnimatedItem>
      </AnimatedContainer>

      {/* Row 2: Engagement Chart + Activity Feed */}
      <AnimatedContainer delay={0.15} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <AnimatedItem className="lg:col-span-8">
          <EngagementChart />
        </AnimatedItem>
        <AnimatedItem className="lg:col-span-4">
          <ActivityFeed />
        </AnimatedItem>
      </AnimatedContainer>

      {/* Row 3: Platform Overview */}
      <AnimatedContainer delay={0.3}>
        <AnimatedItem>
          <PlatformOverviewCards />
        </AnimatedItem>
      </AnimatedContainer>

      {/* Row 4: Recent Posts + Trending Hashtags */}
      <AnimatedContainer delay={0.45} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <AnimatedItem className="lg:col-span-8">
          <RecentPostsTable />
        </AnimatedItem>
        <AnimatedItem className="lg:col-span-4">
          <TrendingHashtags />
        </AnimatedItem>
      </AnimatedContainer>

      {/* Row 5: Audience Demographics */}
      <AnimatedContainer delay={0.6} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatedItem>
          <AudienceDemographics />
        </AnimatedItem>
      </AnimatedContainer>
    </div>
  );
}
