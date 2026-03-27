import type {
  PlatformStats,
  EngagementDataPoint,
  Post,
  DemographicSegment,
  TrendingHashtag,
  ActivityItem,
  QuickStat,
} from "@/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateTimelineData(days: number): EngagementDataPoint[] {
  const rand = seededRandom(42);
  const data: EngagementDataPoint[] = [];
  const now = new Date();

  let impressionBase = 28_000;
  let engagementBase = 1_800;
  let reachBase = 20_000;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Slow upward trend with weekly seasonality and noise
    const weekday = date.getDay();
    const weekendDip = weekday === 0 || weekday === 6 ? 0.82 : 1;
    const midweekBoost = weekday === 2 || weekday === 3 ? 1.12 : 1;
    const trendFactor = 1 + (days - i) * 0.0012;
    const noise = 0.85 + rand() * 0.3;

    const impressions = Math.round(
      impressionBase * trendFactor * weekendDip * midweekBoost * noise
    );
    const engagements = Math.round(
      engagementBase * trendFactor * weekendDip * midweekBoost * (0.8 + rand() * 0.4)
    );
    const reach = Math.round(
      reachBase * trendFactor * weekendDip * midweekBoost * (0.85 + rand() * 0.3)
    );

    data.push({
      date: date.toISOString().split("T")[0],
      impressions: Math.max(15_000, Math.min(45_000, impressions)),
      engagements: Math.max(800, Math.min(3_500, engagements)),
      reach: Math.max(10_000, Math.min(35_000, reach)),
    });

    // Slight drift in bases
    impressionBase += (rand() - 0.45) * 400;
    engagementBase += (rand() - 0.45) * 60;
    reachBase += (rand() - 0.45) * 300;
  }

  return data;
}

function hoursAgo(h: number): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - Math.round(h * 60));
  return d.toISOString();
}

// ---------------------------------------------------------------------------
// Platform stats
// ---------------------------------------------------------------------------

export const platformStats: PlatformStats[] = [
  {
    platform: "instagram",
    followers: 145_200,
    followersChange: 2_340,
    engagementRate: 4.2,
    postsCount: 312,
  },
  {
    platform: "twitter",
    followers: 89_300,
    followersChange: 1_120,
    engagementRate: 1.8,
    postsCount: 1_847,
  },
  {
    platform: "tiktok",
    followers: 234_500,
    followersChange: 8_920,
    engagementRate: 7.3,
    postsCount: 189,
  },
  {
    platform: "youtube",
    followers: 67_800,
    followersChange: 980,
    engagementRate: 3.1,
    postsCount: 94,
  },
  {
    platform: "linkedin",
    followers: 42_100,
    followersChange: 560,
    engagementRate: 2.6,
    postsCount: 156,
  },
  {
    platform: "facebook",
    followers: 112_400,
    followersChange: -430,
    engagementRate: 1.4,
    postsCount: 278,
  },
];

// ---------------------------------------------------------------------------
// Engagement timeline (90 days)
// ---------------------------------------------------------------------------

export const engagementTimeline: EngagementDataPoint[] = generateTimelineData(90);

// ---------------------------------------------------------------------------
// Recent posts
// ---------------------------------------------------------------------------

export const recentPosts: Post[] = [
  {
    id: "post-001",
    platform: "instagram",
    content:
      "Behind the scenes of our latest product shoot. The team crushed it today! 📸✨ #BTS #ProductLaunch",
    thumbnail: "/thumbnails/ig-bts.jpg",
    publishedAt: hoursAgo(2),
    likes: 4_832,
    comments: 247,
    shares: 89,
    engagementRate: 5.1,
  },
  {
    id: "post-002",
    platform: "twitter",
    content:
      "We just crossed 500K total community members across all platforms. Thank you for being part of this journey. 🎉",
    publishedAt: hoursAgo(5),
    likes: 2_109,
    comments: 342,
    shares: 1_204,
    engagementRate: 3.2,
  },
  {
    id: "post-003",
    platform: "tiktok",
    content:
      "POV: You finally automate your social media workflow and get your weekends back 😂 #SocialMediaManager #Relatable",
    thumbnail: "/thumbnails/tt-pov.jpg",
    publishedAt: hoursAgo(8),
    likes: 18_432,
    comments: 1_023,
    shares: 3_241,
    engagementRate: 9.7,
  },
  {
    id: "post-004",
    platform: "youtube",
    content:
      "How We Grew From 0 to 100K Followers in 6 Months — Full Strategy Breakdown",
    thumbnail: "/thumbnails/yt-growth.jpg",
    publishedAt: hoursAgo(18),
    likes: 3_210,
    comments: 489,
    shares: 672,
    engagementRate: 4.8,
  },
  {
    id: "post-005",
    platform: "linkedin",
    content:
      "Hiring managers: your employer brand is your biggest recruiting advantage. Here are 5 content strategies that actually work in 2026.",
    publishedAt: hoursAgo(22),
    likes: 1_847,
    comments: 312,
    shares: 428,
    engagementRate: 3.9,
  },
  {
    id: "post-006",
    platform: "instagram",
    content:
      "Swipe to see our brand refresh → New colors, new energy, same mission. What do you think? 🎨",
    thumbnail: "/thumbnails/ig-rebrand.jpg",
    publishedAt: hoursAgo(26),
    likes: 6_102,
    comments: 534,
    shares: 211,
    engagementRate: 5.8,
  },
  {
    id: "post-007",
    platform: "facebook",
    content:
      "We're hosting a free live workshop next Thursday on building a content calendar that converts. Save your spot — link in comments!",
    thumbnail: "/thumbnails/fb-workshop.jpg",
    publishedAt: hoursAgo(30),
    likes: 982,
    comments: 187,
    shares: 324,
    engagementRate: 1.9,
  },
  {
    id: "post-008",
    platform: "tiktok",
    content:
      "When the algorithm finally picks up your video after 3 days 🚀 #FYP #ViralMoment #ContentCreator",
    thumbnail: "/thumbnails/tt-algo.jpg",
    publishedAt: hoursAgo(36),
    likes: 42_310,
    comments: 2_847,
    shares: 8_912,
    engagementRate: 12.4,
  },
  {
    id: "post-009",
    platform: "twitter",
    content:
      "Hot take: Consistency beats virality every single time. Your audience doesn't need one viral post — they need you showing up daily.",
    publishedAt: hoursAgo(40),
    likes: 5_621,
    comments: 892,
    shares: 2_340,
    engagementRate: 4.1,
  },
  {
    id: "post-010",
    platform: "youtube",
    content:
      "The Complete Guide to YouTube Shorts in 2026 — Algorithm Changes You Need to Know",
    thumbnail: "/thumbnails/yt-shorts.jpg",
    publishedAt: hoursAgo(48),
    likes: 1_543,
    comments: 218,
    shares: 390,
    engagementRate: 3.4,
  },
];

// ---------------------------------------------------------------------------
// Demographics
// ---------------------------------------------------------------------------

export const ageDistribution: DemographicSegment[] = [
  { label: "18-24", value: 28, color: "#6366F1" },
  { label: "25-34", value: 35, color: "#8B5CF6" },
  { label: "35-44", value: 22, color: "#A78BFA" },
  { label: "45-54", value: 10, color: "#C4B5FD" },
  { label: "55+", value: 5, color: "#DDD6FE" },
];

export const topCountries: { country: string; percentage: number }[] = [
  { country: "United States", percentage: 42 },
  { country: "United Kingdom", percentage: 15 },
  { country: "Canada", percentage: 11 },
  { country: "Australia", percentage: 8 },
  { country: "Germany", percentage: 6 },
];

// ---------------------------------------------------------------------------
// Trending hashtags
// ---------------------------------------------------------------------------

export const trendingHashtags: TrendingHashtag[] = [
  { rank: 1, tag: "#ContentStrategy", postCount: 118_400, trend: "up", changePercent: 24.3 },
  { rank: 2, tag: "#SocialMediaTips", postCount: 97_200, trend: "up", changePercent: 18.1 },
  { rank: 3, tag: "#MarketingTrends", postCount: 84_600, trend: "up", changePercent: 12.7 },
  { rank: 4, tag: "#CreatorEconomy", postCount: 72_300, trend: "up", changePercent: 31.5 },
  { rank: 5, tag: "#DigitalMarketing", postCount: 63_100, trend: "stable", changePercent: 1.2 },
  { rank: 6, tag: "#BrandBuilding", postCount: 45_800, trend: "up", changePercent: 8.4 },
  { rank: 7, tag: "#Reels", postCount: 38_900, trend: "down", changePercent: 5.6 },
  { rank: 8, tag: "#GrowthHacking", postCount: 21_400, trend: "down", changePercent: 9.2 },
  { rank: 9, tag: "#AIMarketing", postCount: 14_200, trend: "up", changePercent: 47.8 },
  { rank: 10, tag: "#CommunityFirst", postCount: 7_600, trend: "up", changePercent: 15.3 },
];

// ---------------------------------------------------------------------------
// Activity feed
// ---------------------------------------------------------------------------

export const activityFeed: ActivityItem[] = [
  { id: "act-01", platform: "instagram", message: "@emma_designs commented: \"Love this new look! 🔥\"", timestamp: hoursAgo(0.1), type: "comment" },
  { id: "act-02", platform: "tiktok", message: "Your video hit 10K views in the first hour", timestamp: hoursAgo(0.4), type: "milestone" },
  { id: "act-03", platform: "twitter", message: "@techcrunch mentioned you in a thread about creator tools", timestamp: hoursAgo(0.8), type: "mention" },
  { id: "act-04", platform: "youtube", message: "New subscriber milestone: 67,500 subscribers", timestamp: hoursAgo(1.2), type: "milestone" },
  { id: "act-05", platform: "linkedin", message: "Your post was shared by Sarah Chen, VP Marketing at Stripe", timestamp: hoursAgo(1.9), type: "share" },
  { id: "act-06", platform: "instagram", message: "@travel_with_jake liked your story", timestamp: hoursAgo(2.5), type: "like" },
  { id: "act-07", platform: "facebook", message: "12 new comments on your workshop announcement", timestamp: hoursAgo(3.1), type: "comment" },
  { id: "act-08", platform: "tiktok", message: "@socialmedia_guru shared your video with 45K followers", timestamp: hoursAgo(4.2), type: "share" },
  { id: "act-09", platform: "twitter", message: "Your thread received 340 new likes in the past hour", timestamp: hoursAgo(5.5), type: "like" },
  { id: "act-10", platform: "instagram", message: "@brand_collab_agency mentioned you in a partnership post", timestamp: hoursAgo(7.0), type: "mention" },
  { id: "act-11", platform: "youtube", message: "@digital_nomad_life commented: \"Best breakdown I've seen this year\"", timestamp: hoursAgo(9.3), type: "comment" },
  { id: "act-12", platform: "linkedin", message: "Your article was featured in the LinkedIn Marketing newsletter", timestamp: hoursAgo(12.0), type: "milestone" },
  { id: "act-13", platform: "tiktok", message: "50K likes milestone on your latest video", timestamp: hoursAgo(15.5), type: "milestone" },
  { id: "act-14", platform: "facebook", message: "@community_builder shared your post to 3 groups", timestamp: hoursAgo(19.0), type: "share" },
  { id: "act-15", platform: "twitter", message: "@marketing_daily mentioned you in their top creators list", timestamp: hoursAgo(23.0), type: "mention" },
];

// ---------------------------------------------------------------------------
// Quick stats
// ---------------------------------------------------------------------------

export const quickStats: QuickStat[] = [
  {
    label: "Total Followers",
    value: 691_300,
    previousValue: 678_100,
    format: "compact",
    sparklineData: [642, 648, 653, 659, 664, 668, 671, 675, 679, 683, 687, 691],
  },
  {
    label: "Engagement Rate",
    value: 3.4,
    previousValue: 3.1,
    format: "percentage",
    sparklineData: [2.8, 2.9, 3.0, 2.9, 3.1, 3.2, 3.0, 3.3, 3.1, 3.4, 3.3, 3.4],
  },
  {
    label: "Weekly Impressions",
    value: 2_100_000,
    previousValue: 1_940_000,
    format: "compact",
    sparklineData: [1720, 1780, 1810, 1860, 1890, 1920, 1950, 1980, 2010, 2040, 2070, 2100],
  },
  {
    label: "Posts This Month",
    value: 47,
    previousValue: 42,
    format: "number",
    sparklineData: [31, 34, 36, 38, 39, 40, 41, 42, 43, 44, 46, 47],
  },
];
