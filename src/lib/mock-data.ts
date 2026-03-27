import type {
  MetricCard, InsightItem, AIBriefing, SocialHeadline, FollowerComment,
  FollowerGrowthPoint, CommunityMember, InstagramAccount, ProgressGoal,
  InstagramPost, InstagramComment, DailyReachPoint, YouTubeVideo,
  YouTubeComment, ViewsDataPoint, FacebookPost, FacebookComment,
  PostReachPoint, Deal, Payout, MonthlyEarning, ConnectedAccount,
  UserProfile, NotificationSetting
} from "@/types";

// ==================== OVERVIEW PAGE ====================

export const overviewMetrics: MetricCard[] = [
  { label: "Total Followers", value: "847,293", change: "+12.4%", changeType: "positive" },
  { label: "Total Reach (30D)", value: "2.4M", change: "+8.7%", changeType: "positive" },
  { label: "Engagement Rate", value: "4.82%", change: "+0.3%", changeType: "positive" },
  { label: "Revenue This Month", value: "$24,850", change: "+18.2%", changeType: "positive", prefix: "$" },
];

export const aiBriefing: AIBriefing = {
  date: "2026-03-26",
  summary: "Your Instagram Reels are outperforming all other content formats this week, with an average engagement rate of 6.8% — nearly double your carousel posts. YouTube subscriber growth accelerated after your collaboration video with @techreviewer hit 340K views. Facebook reach dipped 12% due to algorithm changes favoring short-form video. Consider repurposing your top-performing Reels for Facebook to recover lost reach. Three brand deal inquiries came in overnight — Glossier, Nike Digital, and a recurring ask from Adobe Creative Cloud.",
  highlights: [
    "Instagram Reels averaging 6.8% engagement rate this week",
    "YouTube collab video hit 340K views, driving 2,400 new subscribers",
    "3 new brand deal inquiries: Glossier, Nike Digital, Adobe CC",
    "Facebook reach down 12% — algorithm shift toward short-form video",
  ],
};

export const whatsWorking: InsightItem[] = [
  { text: "Behind-the-scenes Reels getting 3x more saves than polished content", platform: "instagram", metric: "+312% saves" },
  { text: "YouTube Shorts crossposted from TikTok driving subscriber growth", platform: "youtube", metric: "+2.4K subs/week" },
  { text: "Carousel posts with data visualizations earning high shares", platform: "instagram", metric: "48 avg shares" },
  { text: "Responding to comments within 1hr boosting engagement", metric: "+22% reply rate" },
];

export const whatsFlopping: InsightItem[] = [
  { text: "Facebook text-only posts reaching less than 2% of followers", platform: "facebook", metric: "1.8% reach" },
  { text: "YouTube thumbnails with text overlays underperforming clean shots", platform: "youtube", metric: "-18% CTR" },
  { text: "Instagram Stories posted after 9pm getting minimal views", platform: "instagram", metric: "-45% views" },
  { text: "Promotional posts without storytelling seeing engagement drops", metric: "-34% engagement" },
];

export const socialHeadlines: SocialHeadline[] = [
  { title: "Instagram Tests New 'Blend' Feature for Shared Reels Feeds", source: "TechCrunch", timestamp: "2h ago" },
  { title: "YouTube Shorts Fund Expanding to $300M in 2026", source: "The Verge", timestamp: "4h ago" },
  { title: "Meta Announces AI-Powered Content Scheduling Tools", source: "Social Media Today", timestamp: "6h ago" },
  { title: "TikTok Creator Marketplace Opens to Mid-Tier Influencers", source: "Business Insider", timestamp: "8h ago" },
  { title: "New Study: Best Posting Times Shifted Post-Algorithm Update", source: "Hootsuite Blog", timestamp: "12h ago" },
];

export const followerComments: FollowerComment[] = [
  { username: "@sarah.designs", platform: "instagram", comment: "Your content literally changed how I approach my own brand. The carousel on color theory was *chef's kiss*", timestamp: "2h ago" },
  { username: "Mike Chen", platform: "youtube", comment: "Been watching since you had 10K subs. So proud of how far you've come. Your editing style is genuinely unique.", timestamp: "5h ago" },
  { username: "@creativejuice", platform: "instagram", comment: "Just landed my first brand deal because of your negotiation tips video. Thank you!!", timestamp: "8h ago" },
  { username: "Emma Rodriguez", platform: "facebook", comment: "Shared your latest post with my entire marketing team. Everyone agrees — best content in the space.", timestamp: "12h ago" },
];

// Generate 30 days of follower growth data
export const followerGrowthData: FollowerGrowthPoint[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(2026, 1, 25 + i); // Start from Feb 25
  const base = 820000 + i * 900;
  const noise = Math.sin(i * 0.8) * 500 + Math.random() * 300;
  return {
    date: date.toISOString().split("T")[0],
    followers: Math.round(base + noise),
  };
});

export const communityMembers: CommunityMember[] = [
  { name: "Alex Thompson", joinedAt: "2h ago", tier: "Pro" },
  { name: "Priya Patel", joinedAt: "5h ago", tier: "Starter" },
  { name: "Jordan Kim", joinedAt: "1d ago", tier: "Pro" },
  { name: "Casey Rivera", joinedAt: "1d ago", tier: "Enterprise" },
  { name: "Morgan Lee", joinedAt: "2d ago", tier: "Starter" },
];

// ==================== INSTAGRAM PAGE ====================

export const instagramAccounts: InstagramAccount[] = [
  {
    handle: "@commandhq",
    followers: 94200,
    following: 842,
    posts: 1247,
    engagementRate: 4.8,
    profileViews28d: 28400,
    accountsEngaged28d: 12800,
    interactions28d: 48200,
    reach28d: 342000,
  },
  {
    handle: "@command.studio",
    followers: 67400,
    following: 634,
    posts: 892,
    engagementRate: 5.2,
    profileViews28d: 19200,
    accountsEngaged28d: 8900,
    interactions28d: 35100,
    reach28d: 218000,
  },
];

export const instagramProgressGoals: ProgressGoal[] = [
  { handle: "@commandhq", current: 94200, target: 100000, ytdGrowth: 14200, monthlyPace: 2840, eta: "Jun 2026" },
  { handle: "@command.studio", current: 67400, target: 100000, ytdGrowth: 8400, monthlyPace: 1680, eta: "Mar 2028" },
];

export const instagramDailyReach: DailyReachPoint[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(2026, 1, 25 + i);
  const base = 10000 + Math.sin(i * 0.5) * 3000;
  const spike = i === 12 || i === 23 ? 8000 : 0;
  return {
    date: date.toISOString().split("T")[0],
    reach: Math.round(base + spike + Math.random() * 2000),
  };
});

export const instagramPosts: InstagramPost[] = [
  { id: "ig1", caption: "The anatomy of a viral post — breaking down what actually works in 2026 📊", likes: 4820, comments: 342, timestamp: "2h ago", account: "@commandhq", type: "Carousel", color: "#e3f2fd" },
  { id: "ig2", caption: "Studio tour update! New setup who dis 🎬", likes: 3210, comments: 189, timestamp: "1d ago", account: "@commandhq", type: "Reel", color: "#fce4ec" },
  { id: "ig3", caption: "5 tools I can't live without for content creation", likes: 5100, comments: 421, timestamp: "2d ago", account: "@commandhq", type: "Carousel", color: "#e8f5e9" },
  { id: "ig4", caption: "Monday motivation — consistency beats perfection every single time", likes: 2890, comments: 156, timestamp: "3d ago", account: "@commandhq", type: "Static", color: "#f3e5f5" },
  { id: "ig5", caption: "Brand deal negotiation tips that doubled my rates 💰", likes: 6200, comments: 534, timestamp: "4d ago", account: "@commandhq", type: "Reel", color: "#fff3e0" },
  { id: "ig6", caption: "Color grading tutorial — warm tones edition 🎨", likes: 3400, comments: 267, timestamp: "6h ago", account: "@command.studio", type: "Reel", color: "#fce4ec" },
  { id: "ig7", caption: "Client work showcase — before and after transformations", likes: 2100, comments: 134, timestamp: "1d ago", account: "@command.studio", type: "Carousel", color: "#e3f2fd" },
  { id: "ig8", caption: "The editing workflow that saves me 10 hours a week", likes: 4500, comments: 389, timestamp: "2d ago", account: "@command.studio", type: "Reel", color: "#e8f5e9" },
  { id: "ig9", caption: "Behind the scenes — product shoot for @glossier", likes: 1800, comments: 98, timestamp: "3d ago", account: "@command.studio", type: "Static", color: "#f3e5f5" },
  { id: "ig10", caption: "Lighting techniques that make everything look expensive ✨", likes: 3900, comments: 278, timestamp: "5d ago", account: "@command.studio", type: "Carousel", color: "#fff3e0" },
];

export const instagramComments: InstagramComment[] = [
  { id: "ic1", author: "@design.daily", text: "This is exactly what I needed to see today! Your color theory series has been incredible.", timestamp: "1h ago", account: "@commandhq" },
  { id: "ic2", author: "@marketingmaven", text: "The data breakdowns in your carousels are always so clean. What tool do you use?", timestamp: "3h ago", account: "@commandhq" },
  { id: "ic3", author: "@startuplife", text: "Just implemented your posting strategy and saw a 40% increase in reach!", timestamp: "5h ago", account: "@commandhq" },
  { id: "ic4", author: "@visualarts_co", text: "The warm tone grading tutorial was perfect. My feed looks so much more cohesive now.", timestamp: "2h ago", account: "@command.studio" },
  { id: "ic5", author: "@photog.life", text: "Your lighting setup is goals. Would love a full breakdown video!", timestamp: "4h ago", account: "@command.studio" },
  { id: "ic6", author: "@brand.builders", text: "The Glossier BTS content was amazing. More brand shoot content please!", timestamp: "7h ago", account: "@command.studio" },
];

export const instagramAnalysisWorking: InsightItem[] = [
  { text: "Reels with face-to-camera hooks in first 2 seconds get 4x more views", metric: "+312% views" },
  { text: "Carousels with data/stats on slide 1 earn highest saves", metric: "89 avg saves" },
  { text: "Posting between 11am-1pm EST consistently outperforms other times", metric: "+28% reach" },
];

export const instagramAnalysisFlopping: InsightItem[] = [
  { text: "Static image posts getting minimal engagement vs Reels", metric: "-62% engagement" },
  { text: "Stories posted after 9pm getting less than half typical views", metric: "-45% views" },
  { text: "Hashtags over 15 per post are hurting reach", metric: "-18% reach" },
];

// ==================== YOUTUBE PAGE ====================

export const youtubeMetrics: MetricCard[] = [
  { label: "Subscribers", value: "234,800", change: "+2,400", changeType: "positive" },
  { label: "Views (30D)", value: "1.8M", change: "+24.3%", changeType: "positive" },
  { label: "Watch Time (hrs)", value: "42,600", change: "+15.8%", changeType: "positive" },
  { label: "Avg View Duration", value: "8:42", change: "+0:34", changeType: "positive" },
];

export const youtubeViewsData: ViewsDataPoint[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(2026, 1, 25 + i);
  const base = 45000 + Math.sin(i * 0.4) * 15000;
  const spike = i === 8 ? 85000 : i === 22 ? 65000 : 0;
  return {
    date: date.toISOString().split("T")[0],
    views: Math.round(base + spike + Math.random() * 5000),
  };
});

export const youtubeVideos: YouTubeVideo[] = [
  { id: "yt1", title: "I Tried Every AI Video Tool So You Don't Have To", views: 342000, likes: 18200, comments: 2100, publishedAt: "3d ago", duration: "18:42", retention: 62, thumbnailColor: "#ff6b6b" },
  { id: "yt2", title: "The Content Strategy That Got Me to 200K Subscribers", views: 189000, likes: 12400, comments: 1800, publishedAt: "1w ago", duration: "22:15", retention: 58, thumbnailColor: "#4ecdc4" },
  { id: "yt3", title: "Reacting to My First YouTube Video (Cringe Warning)", views: 156000, likes: 14800, comments: 3200, publishedAt: "2w ago", duration: "14:08", retention: 71, thumbnailColor: "#45b7d1" },
  { id: "yt4", title: "How I Edit Videos in Half the Time — Full Workflow", views: 98000, likes: 8900, comments: 920, publishedAt: "2w ago", duration: "25:33", retention: 54, thumbnailColor: "#96ceb4" },
  { id: "yt5", title: "Brand Deals 101: What Nobody Tells You", views: 224000, likes: 16100, comments: 2800, publishedAt: "3w ago", duration: "19:47", retention: 65, thumbnailColor: "#ffeaa7" },
];

export const youtubeComments: YouTubeComment[] = [
  { id: "yc1", author: "TechCreator Mike", text: "The AI tools comparison was incredibly thorough. Saved me hours of research. Subscribed!", likes: 342, videoTitle: "I Tried Every AI Video Tool So You Don't Have To", timestamp: "2h ago" },
  { id: "yc2", author: "Sarah Studios", text: "Your editing workflow video literally changed my life. I went from spending 8 hours to 3 hours per video.", likes: 218, videoTitle: "How I Edit Videos in Half the Time", timestamp: "5h ago" },
  { id: "yc3", author: "Creative Nomad", text: "The brand deals video came at the perfect time. Just got my first offer and used your negotiation framework!", likes: 156, videoTitle: "Brand Deals 101: What Nobody Tells You", timestamp: "8h ago" },
  { id: "yc4", author: "Film School Dropout", text: "Watching your old video vs now is genuinely inspiring. Shows that consistency really does pay off.", likes: 421, videoTitle: "Reacting to My First YouTube Video", timestamp: "12h ago" },
  { id: "yc5", author: "Marketing Pro", text: "200K subscriber strategy video should be required viewing for all content creators. Pure gold.", likes: 289, videoTitle: "The Content Strategy That Got Me to 200K", timestamp: "1d ago" },
  { id: "yc6", author: "Aspiring Creator", text: "Can you do a deep dive on thumbnail design? Your thumbnails always stand out in my feed.", likes: 134, videoTitle: "I Tried Every AI Video Tool So You Don't Have To", timestamp: "1d ago" },
  { id: "yc7", author: "Digital Dave", text: "Just binged your entire channel. The production quality jump from 2024 to now is insane.", likes: 198, videoTitle: "The Content Strategy That Got Me to 200K", timestamp: "2d ago" },
  { id: "yc8", author: "Indie Filmmaker", text: "Your workflow tips cut my editing time by 40%. No exaggeration. Thank you!", likes: 167, videoTitle: "How I Edit Videos in Half the Time", timestamp: "2d ago" },
];

export const youtubeAnalysis = {
  working: [
    { text: "Long-form tutorials (15-25 min) getting highest watch time", metric: "8:42 avg duration" },
    { text: "Collaboration videos driving 3x subscriber growth", metric: "+2,400 subs" },
    { text: "Videos with clear numbered lists in titles outperforming", metric: "+34% CTR" },
  ] as InsightItem[],
  flopping: [
    { text: "Thumbnails with text overlays underperforming clean portraits", metric: "-18% CTR" },
    { text: "Videos over 30 minutes seeing significant drop-off", metric: "42% retention" },
    { text: "Shorts reposts getting less traction than native content", metric: "-55% views" },
  ] as InsightItem[],
  contentIdeas: [
    "Deep dive on thumbnail design psychology — high demand in comments",
    "Creator economy predictions for 2026 Q3 — trending topic",
    "Collab with @filmmakerSarah — complementary audiences, 180K overlap",
  ],
};

// ==================== FACEBOOK PAGE ====================

export const facebookMetrics: MetricCard[] = [
  { label: "Page Followers", value: "128,400", change: "+1.2%", changeType: "positive" },
  { label: "Page Likes", value: "124,800", change: "+0.8%", changeType: "positive" },
  { label: "Post Reach (30D)", value: "892K", change: "-12.4%", changeType: "negative" },
  { label: "Engagement Rate", value: "2.1%", change: "-0.4%", changeType: "negative" },
];

export const facebookPostReach: PostReachPoint[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(2026, 1, 25 + i);
  const base = 25000 - i * 200;
  return {
    date: date.toISOString().split("T")[0],
    reach: Math.round(Math.max(15000, base + Math.random() * 5000)),
  };
});

export const facebookPosts: FacebookPost[] = [
  { id: "fb1", content: "Just wrapped up an incredible Q1. Here's what we learned about content creation in 2026 — the landscape has shifted more than ever before...", type: "text", reactions: { like: 234, love: 89, wow: 12, haha: 5 }, comments: 67, shares: 34, reach: 28400, publishedAt: "1d ago" },
  { id: "fb2", content: "New blog post: '10 Content Creation Myths That Are Holding You Back' — Link in comments 👇", type: "link", reactions: { like: 456, love: 123, wow: 34, haha: 8 }, comments: 89, shares: 156, reach: 45200, publishedAt: "3d ago" },
  { id: "fb3", content: "Behind the scenes of our latest studio shoot. The team crushed it! 📸", type: "image", reactions: { like: 312, love: 178, wow: 45, haha: 2 }, comments: 56, shares: 23, reach: 32100, publishedAt: "5d ago" },
  { id: "fb4", content: "Quick tip: The best time to post on Facebook in 2026 isn't what you think. We analyzed 10,000 posts and here's what we found...", type: "video", reactions: { like: 567, love: 145, wow: 67, haha: 12 }, comments: 134, shares: 89, reach: 52300, publishedAt: "1w ago" },
  { id: "fb5", content: "Excited to announce our new community membership program! Early bird pricing available now 🚀", type: "text", reactions: { like: 789, love: 234, wow: 56, haha: 3 }, comments: 198, shares: 67, reach: 41800, publishedAt: "1w ago" },
];

export const facebookComments: FacebookComment[] = [
  { id: "fc1", author: "Jennifer Walsh", text: "This is exactly the kind of content that keeps me coming back to this page. So valuable!", timestamp: "2h ago" },
  { id: "fc2", author: "David Chen", text: "Signed up for the membership immediately. Been following since day one!", timestamp: "5h ago" },
  { id: "fc3", author: "Rachel Kim", text: "The posting time analysis was eye-opening. Changed my strategy and already seeing results.", timestamp: "1d ago" },
  { id: "fc4", author: "Mark Thompson", text: "Would love to see more behind-the-scenes content. The studio tour was incredible!", timestamp: "2d ago" },
  { id: "fc5", author: "Lisa Patel", text: "Shared the myths article with my entire team. We debunked 3 of our own assumptions!", timestamp: "3d ago" },
];

export const facebookInsights = {
  working: [
    { text: "Video posts getting 3x more reach than text posts", metric: "+312% reach" },
    { text: "Link posts with strong hooks driving website traffic", metric: "+1,200 clicks" },
    { text: "Community posts generating highest comment rates", metric: "34 avg comments" },
  ] as InsightItem[],
  flopping: [
    { text: "Text-only posts reaching less than 2% of followers", metric: "1.8% reach" },
    { text: "Posting more than once per day cannibalizing reach", metric: "-24% per post" },
    { text: "Shared content from other platforms underperforming native", metric: "-40% engagement" },
  ] as InsightItem[],
};

// ==================== DEALS PAGE ====================

export const dealMetrics: MetricCard[] = [
  { label: "Active Deals", value: "8", change: "+2 this month", changeType: "positive" },
  { label: "Pipeline Value", value: "$142,500", change: "+$34K", changeType: "positive", prefix: "$" },
  { label: "Pending Payouts", value: "$28,400", change: "3 invoices", changeType: "neutral" },
  { label: "Completed This Month", value: "4", change: "+$48,200", changeType: "positive" },
];

export const deals: Deal[] = [
  { id: "d1", brand: "Glossier", value: 12000, stage: "inquiry", deadline: "2026-04-15", platform: "instagram", description: "Spring campaign — 3 Reels over 6 weeks" },
  { id: "d2", brand: "Nike Digital", value: 35000, stage: "negotiating", deadline: "2026-05-01", platform: "youtube", description: "Creator program — 2 long-form videos + social" },
  { id: "d3", brand: "Squarespace", value: 8500, stage: "inquiry", deadline: "2026-04-30", platform: "youtube", description: "Sponsored segment in 1 video" },
  { id: "d4", brand: "Adobe Creative Cloud", value: 24000, stage: "in-progress", deadline: "2026-06-30", platform: "instagram", description: "Annual partnership — monthly content" },
  { id: "d5", brand: "Canva", value: 6000, stage: "inquiry", deadline: "2026-04-20", platform: "instagram", description: "Creator spotlight feature" },
  { id: "d6", brand: "Notion", value: 15000, stage: "negotiating", deadline: "2026-05-15", platform: "youtube", description: "Workflow series — 3 videos" },
  { id: "d7", brand: "Samsung", value: 42000, stage: "in-progress", deadline: "2026-07-31", platform: "youtube", description: "Galaxy Creator Program — Q2/Q3" },
  { id: "d8", brand: "Skillshare", value: 18000, stage: "completed", deadline: "2026-03-15", platform: "youtube", description: "Original class + promotional content" },
  { id: "d9", brand: "Monday.com", value: 10000, stage: "completed", deadline: "2026-03-01", platform: "instagram", description: "Productivity series — 5 Reels" },
  { id: "d10", brand: "Epidemic Sound", value: 7500, stage: "completed", deadline: "2026-02-28", platform: "youtube", description: "Music licensing integration" },
  { id: "d11", brand: "Riverside.fm", value: 12700, stage: "completed", deadline: "2026-02-15", platform: "youtube", description: "Podcast tool review + tutorial" },
];

export const payouts: Payout[] = [
  { id: "p1", brand: "Adobe Creative Cloud", dealValue: 24000, status: "pending", paymentDate: "2026-04-01", invoiceNumber: "INV-2026-041" },
  { id: "p2", brand: "Samsung", dealValue: 42000, status: "pending", paymentDate: "2026-04-15", invoiceNumber: "INV-2026-042" },
  { id: "p3", brand: "Skillshare", dealValue: 18000, status: "paid", paymentDate: "2026-03-20", invoiceNumber: "INV-2026-038" },
  { id: "p4", brand: "Monday.com", dealValue: 10000, status: "paid", paymentDate: "2026-03-10", invoiceNumber: "INV-2026-035" },
  { id: "p5", brand: "Epidemic Sound", dealValue: 7500, status: "overdue", paymentDate: "2026-03-15", invoiceNumber: "INV-2026-036" },
  { id: "p6", brand: "Riverside.fm", dealValue: 12700, status: "paid", paymentDate: "2026-03-01", invoiceNumber: "INV-2026-032" },
];

export const monthlyEarnings: MonthlyEarning[] = [
  { month: "Oct", amount: 18500 },
  { month: "Nov", amount: 24200 },
  { month: "Dec", amount: 31400 },
  { month: "Jan", amount: 22800 },
  { month: "Feb", amount: 28900 },
  { month: "Mar", amount: 48200 },
];

// ==================== SETTINGS PAGE ====================

export const connectedAccounts: ConnectedAccount[] = [
  { platform: "Instagram", handle: "@commandhq", connected: true, lastSync: "2 minutes ago", icon: "Instagram" },
  { platform: "YouTube", handle: "Command HQ", connected: true, lastSync: "5 minutes ago", icon: "Youtube" },
  { platform: "Facebook", handle: "", connected: false, icon: "Facebook" },

];

export const userProfile: UserProfile = {
  name: "Ibrahim",
  email: "ibrahim@commandhq.co",
  businessName: "Command HQ Media",
};

export const notificationSettings: NotificationSetting[] = [
  { id: "daily-briefing", label: "Daily Briefing", description: "AI-generated summary every morning at 9am", enabled: true },
  { id: "brand-deals", label: "Brand Deal Alerts", description: "Notify when new brand deal inquiries arrive", enabled: true },
  { id: "weekly-report", label: "Weekly Report", description: "Comprehensive analytics report every Monday", enabled: true },
  { id: "comment-alerts", label: "Comment Alerts", description: "Notify on high-engagement comments", enabled: false },
];
