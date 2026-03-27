// Platform types
export type Platform = "instagram" | "youtube" | "facebook" | "twitter" | "tiktok" | "linkedin";
export type TabId = "overview" | "hq" | "youtube" | "deals" | "instagram";

// Shared
export interface MetricCard {
  label: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  prefix?: string;
}

export interface InsightItem {
  text: string;
  platform?: Platform;
  metric?: string;
}

// Overview page
export interface AIBriefing {
  date: string;
  summary: string;
  highlights: string[];
}

export interface SocialHeadline {
  title: string;
  source: string;
  timestamp: string;
  url?: string;
}

export interface FollowerComment {
  username: string;
  platform: Platform;
  comment: string;
  timestamp: string;
}

export interface FollowerGrowthPoint {
  date: string;
  followers: number;
}

export interface CommunityMember {
  name: string;
  joinedAt: string;
  tier: string;
}

// Instagram page
export interface InstagramAccount {
  handle: string;
  followers: number;
  following: number;
  posts: number;
  engagementRate: number;
  profileViews28d: number;
  accountsEngaged28d: number;
  interactions28d: number;
  reach28d: number;
}

export interface ProgressGoal {
  handle: string;
  current: number;
  target: number;
  ytdGrowth: number;
  monthlyPace: number;
  eta: string;
}

export interface InstagramPost {
  id: string;
  caption: string;
  likes: number;
  comments: number;
  timestamp: string;
  account: string;
  type: "Reel" | "Carousel" | "Static";
  color: string; // thumbnail placeholder color
}

export interface InstagramComment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  account: string;
}

export interface DailyReachPoint {
  date: string;
  reach: number;
}

// YouTube page
export interface YouTubeVideo {
  id: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  publishedAt: string;
  duration: string;
  retention: number; // percentage
  thumbnailColor: string;
}

export interface YouTubeComment {
  id: string;
  author: string;
  text: string;
  likes: number;
  videoTitle: string;
  timestamp: string;
}

export interface ViewsDataPoint {
  date: string;
  views: number;
}

// Facebook page
export interface FacebookPost {
  id: string;
  content: string;
  type: "text" | "image" | "video" | "link";
  reactions: { like: number; love: number; wow: number; haha: number; };
  comments: number;
  shares: number;
  reach: number;
  publishedAt: string;
}

export interface FacebookComment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface PostReachPoint {
  date: string;
  reach: number;
}

// Email page
export interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  timestamp: string;
  category: "brand-deals" | "customer" | "newsletter";
  priority: "high" | "medium" | "low";
  read: boolean;
  needsResponse: boolean;
}

// Deals page
export type DealStage = "inquiry" | "negotiating" | "in-progress" | "completed";

export interface Deal {
  id: string;
  brand: string;
  value: number;
  stage: DealStage;
  deadline: string;
  platform: Platform;
  description: string;
}

export interface Payout {
  id: string;
  brand: string;
  dealValue: number;
  status: "paid" | "pending" | "overdue";
  paymentDate: string;
  invoiceNumber: string;
}

export interface MonthlyEarning {
  month: string;
  amount: number;
}

// Settings page
export interface ConnectedAccount {
  platform: string;
  handle: string;
  connected: boolean;
  lastSync?: string;
  icon: string;
}

export interface UserProfile {
  name: string;
  email: string;
  businessName: string;
  avatar?: string;
}

export interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}
