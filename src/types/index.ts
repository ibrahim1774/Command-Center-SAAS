// Platform types
export type Platform = "instagram" | "youtube" | "facebook" | "twitter" | "tiktok" | "linkedin";
export type TabId = "overview" | "instagram" | "youtube" | "facebook" | "deals" | "goals" | "settings";

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

// Deals page
export type DealStage = "inquiry" | "negotiating" | "confirmed" | "in-progress" | "completed";
export type PaymentStatus = "unpaid" | "invoiced" | "paid";
export type DealType = "sponsored_post" | "brand_ambassador" | "affiliate" | "product_review" | "ugc" | "other";

// Legacy mock types (kept for mock-data.ts compatibility)
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

// CRM Deal types (Supabase-backed)
export interface BrandDeal {
  id: string;
  user_id: string;
  brand_name: string;
  contact_person: string | null;
  contact_email: string | null;
  deal_value: number;
  platforms: string[];
  deal_type: DealType;
  description: string | null;
  deadline: string | null;
  status: DealStage;
  payment_status: PaymentStatus;
  payment_received: number;
  created_at: string;
  updated_at: string;
}

export interface DealNote {
  id: string;
  deal_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface DealChecklistItem {
  id: string;
  deal_id: string;
  user_id: string;
  label: string;
  completed: boolean;
  sort_order: number;
  created_at: string;
}

// Goals & Journal types
export type MoodType = "amazing" | "good" | "okay" | "tough" | "rough";
export type TaskPriority = "urgent" | "important" | "normal";
export type TaskCategory = "content" | "deals" | "admin" | "personal";
export type GoalCategory = "growth" | "revenue" | "content" | "personal" | "brand";
export type EventType = "content_deadline" | "brand_deal" | "meeting" | "personal" | "other";

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: GoalCategory;
  target_value: number;
  current_value: number;
  unit: string;
  deadline: string | null;
  why: string | null;
  created_at: string;
  updated_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  content: string;
  mood: MoodType | null;
  tags: string[];
  entry_date: string;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  due_date: string | null;
  priority: TaskPriority;
  category: TaskCategory;
  related_deal_id: string | null;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  event_date: string;
  event_time: string | null;
  event_type: EventType;
  notes: string | null;
  color: string | null;
  created_at: string;
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

// Database types
export interface DbUser {
  id: string;
  email: string;
  name: string | null;
  password_hash: string | null;
  avatar_url: string | null;
  plan: string;
  created_at: string;
  updated_at: string;
}

export interface DbConnectedAccount {
  id: string;
  user_id: string;
  platform: "instagram" | "youtube" | "facebook";
  access_token: string;
  refresh_token: string | null;
  token_expires_at: string | null;
  platform_username: string | null;
  platform_user_id: string | null;
  scopes: string | null;
  connected_at: string;
  last_synced: string | null;
  status: "active" | "expired" | "revoked";
}
