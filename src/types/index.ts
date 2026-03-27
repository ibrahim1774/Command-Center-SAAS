export type Platform =
  | "instagram"
  | "twitter"
  | "tiktok"
  | "youtube"
  | "linkedin"
  | "facebook";

export interface PlatformStats {
  platform: Platform;
  followers: number;
  followersChange: number;
  engagementRate: number;
  postsCount: number;
}

export interface EngagementDataPoint {
  date: string;
  impressions: number;
  engagements: number;
  reach: number;
}

export interface Post {
  id: string;
  platform: Platform;
  content: string;
  thumbnail?: string;
  publishedAt: string;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
}

export interface DemographicSegment {
  label: string;
  value: number;
  color: string;
}

export interface TrendingHashtag {
  rank: number;
  tag: string;
  postCount: number;
  trend: "up" | "down" | "stable";
  changePercent: number;
}

export interface ActivityItem {
  id: string;
  platform: Platform;
  message: string;
  timestamp: string;
  type: "comment" | "like" | "milestone" | "mention" | "share";
}

export interface QuickStat {
  label: string;
  value: number;
  previousValue: number;
  format: "number" | "percentage" | "compact";
  sparklineData: number[];
}
