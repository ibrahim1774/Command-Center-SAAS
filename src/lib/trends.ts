// ── Trend Intelligence Types & Normalizers ──

export interface TrendHashtag {
  name: string;
  viewCount: number;
  videoCount: number;
  isNew: boolean;
  rank: number;
  rankDiff: number;
}

export interface TrendSound {
  name: string;
  artist: string;
  useCount: number;
  isNew: boolean;
  rank: number;
}

export interface TrendCreator {
  username: string;
  avatar: string;
  profileUrl: string;
  isNew: boolean;
  rank: number;
}

export interface DailyTrends {
  hashtags: TrendHashtag[];
  sounds: TrendSound[];
  creators: TrendCreator[];
}

export interface PlatformTrend {
  name: string;
  trendCount: number;
  topTrend: string;
  avgScore: number;
  maxScore: number;
}

export interface WeeklyTrend {
  topic: string;
  platforms: string[];
  score: number;
  recommendation: string;
}

export interface WeeklyReport {
  viralScore: number;
  platforms: PlatformTrend[];
  aiRecommendations: string[];
  topTrends: WeeklyTrend[];
  insights: string[];
  topViral: {
    content: string;
    author: string;
    platform: string;
    trendScore: number;
    metrics: { views?: number; likes?: number };
  }[];
}

// ── Daily Trends Normalizer ──
// clockworks~tiktok-trends-scraper returns:
// [{ id, name, rank, type:"hashtag", viewCount, videoCount, rankDiff,
//    markedAsNew, relatedCreators:[{avatar, nickName, profileUrl}] }]

export function normalizeDailyTrends(raw: unknown[]): DailyTrends {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { hashtags: [], sounds: [], creators: [] };
  }

  const hashtags: TrendHashtag[] = [];
  const creators: TrendCreator[] = [];
  const seenCreators = new Set<string>();

  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const r = item as Record<string, unknown>;

    // Extract hashtag
    const name = (r.name as string) || (r.title as string) || "";
    if (!name) continue;

    hashtags.push({
      name,
      viewCount: (r.viewCount as number) || 0,
      videoCount: (r.videoCount as number) || 0,
      isNew: (r.markedAsNew as boolean) || (r.isNew as boolean) || false,
      rank: (r.rank as number) || hashtags.length + 1,
      rankDiff: (r.rankDiff as number) || 0,
    });

    // Extract related creators from this hashtag
    const related = r.relatedCreators as unknown[];
    if (Array.isArray(related)) {
      for (const c of related) {
        if (!c || typeof c !== "object") continue;
        const cr = c as Record<string, unknown>;
        const nick = (cr.nickName as string) || (cr.nickname as string) || "";
        if (!nick || seenCreators.has(nick)) continue;
        seenCreators.add(nick);

        creators.push({
          username: nick,
          avatar: (cr.avatar as string) || "",
          profileUrl: (cr.profileUrl as string) || "",
          isNew: false,
          rank: creators.length + 1,
        });
      }
    }
  }

  // Actor doesn't return sounds — leave empty
  return {
    hashtags: hashtags.slice(0, 30),
    sounds: [],
    creators: creators.slice(0, 30),
  };
}

// ── Weekly Report Normalizer ──
// manju4k~social-media-trend-scraper-6-in-1-ai-analysis returns:
// [{ trends: { tiktok: { items, totalFound, topHashtags }, instagram: {...}, ... },
//    insights: string[],
//    recommendations: [{ action, platform, priority, expectedROI }],
//    comparisonAnalysis: { platformMetrics, crossPlatformTrends, viralContent },
//    metadata: { platforms, totalPlatforms } }]

export function normalizeWeeklyReport(raw: unknown[]): WeeklyReport {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { viralScore: 0, platforms: [], aiRecommendations: [], topTrends: [], insights: [], topViral: [] };
  }

  const first = raw[0] as Record<string, unknown>;

  // ── Extract platforms from trends object ──
  const platforms: PlatformTrend[] = [];
  const trendsObj = first.trends as Record<string, unknown> | undefined;

  if (trendsObj && typeof trendsObj === "object") {
    for (const [platformName, platformData] of Object.entries(trendsObj)) {
      if (!platformData || typeof platformData !== "object") continue;
      const pd = platformData as Record<string, unknown>;

      const topHashtags = pd.topHashtags as { hashtag: string; count: number }[] | undefined;
      const topHashtag = Array.isArray(topHashtags) && topHashtags.length > 0
        ? topHashtags[0].hashtag
        : "";

      platforms.push({
        name: platformName.charAt(0).toUpperCase() + platformName.slice(1),
        trendCount: (pd.totalFound as number) || 0,
        topTrend: topHashtag,
        avgScore: 0,
        maxScore: 0,
      });
    }
  }

  // ── Extract platform metrics for scores ──
  const comparison = first.comparisonAnalysis as Record<string, unknown> | undefined;
  const platformMetrics = comparison?.platformMetrics as Record<string, unknown> | undefined;

  if (platformMetrics && typeof platformMetrics === "object") {
    for (const p of platforms) {
      const key = p.name.toLowerCase();
      const metrics = platformMetrics[key] as Record<string, unknown> | undefined;
      if (metrics) {
        p.avgScore = (metrics.avgTrendScore as number) || 0;
        p.maxScore = (metrics.maxTrendScore as number) || 0;
      }
    }
  }

  // ── Compute viral score (0-100) ──
  // Use the highest maxTrendScore across platforms, normalize to 0-100
  const allMaxScores = platforms.map(p => p.maxScore).filter(s => s > 0);
  let viralScore = 0;
  if (allMaxScores.length > 0) {
    const highest = Math.max(...allMaxScores);
    // Scale: 1M+ = 100, log scale for lower values
    if (highest > 0) {
      viralScore = Math.min(100, Math.round(Math.log10(highest) / Math.log10(10000000) * 100));
    }
  }

  // ── Extract recommendations ──
  const aiRecommendations: string[] = [];
  const recs = first.recommendations as unknown[];
  if (Array.isArray(recs)) {
    for (const rec of recs) {
      if (!rec || typeof rec !== "object") continue;
      const r = rec as Record<string, unknown>;
      const action = (r.action as string) || "";
      const platform = (r.platform as string) || "";
      const priority = (r.priority as string) || "";
      if (action) {
        const prefix = platform ? `[${platform.toUpperCase()}${priority === "high" ? " — HIGH" : ""}] ` : "";
        aiRecommendations.push(`${prefix}${action}`);
      }
    }
  }

  // ── Extract insights ──
  const rawInsights = first.insights as unknown[];
  const insights: string[] = [];
  if (Array.isArray(rawInsights)) {
    for (const ins of rawInsights) {
      if (typeof ins === "string" && ins.length > 0) insights.push(ins);
    }
  }

  // If no recommendations, fall back to insights
  if (aiRecommendations.length === 0 && insights.length > 0) {
    aiRecommendations.push(...insights.slice(0, 5));
  }

  // Also pull from comparisonAnalysis.insights
  const compInsights = comparison?.insights as unknown[];
  if (Array.isArray(compInsights)) {
    for (const ins of compInsights) {
      if (typeof ins === "string" && ins.length > 0 && !insights.includes(ins)) {
        insights.push(ins);
      }
    }
  }

  // ── Extract cross-platform trends ──
  const topTrends: WeeklyTrend[] = [];
  const crossPlatformTrends = comparison?.crossPlatformTrends as unknown[];
  if (Array.isArray(crossPlatformTrends)) {
    for (const t of crossPlatformTrends) {
      if (!t || typeof t !== "object") continue;
      const tr = t as Record<string, unknown>;
      topTrends.push({
        topic: (tr.hashtag as string) || (tr.topic as string) || "",
        platforms: Array.isArray(tr.platforms) ? (tr.platforms as string[]) : [],
        score: (tr.viralScore as number) || 0,
        recommendation: (tr.recommendation as string) || "",
      });
    }
  }

  // ── Extract top viral content ──
  const topViral: WeeklyReport["topViral"] = [];
  const viralContent = comparison?.viralContent as Record<string, unknown> | undefined;
  const topViralRaw = viralContent?.topViral as unknown[];
  if (Array.isArray(topViralRaw)) {
    for (const v of topViralRaw.slice(0, 5)) {
      if (!v || typeof v !== "object") continue;
      const vr = v as Record<string, unknown>;
      const metrics = (vr.metrics || {}) as Record<string, unknown>;
      topViral.push({
        content: (vr.content as string) || "",
        author: (vr.author as string) || "",
        platform: (vr.platform as string) || "",
        trendScore: (vr.trendScore as number) || 0,
        metrics: {
          views: (metrics.views as number) || undefined,
          likes: (metrics.likes as number) || undefined,
        },
      });
    }
  }

  return {
    viralScore,
    platforms,
    aiRecommendations: aiRecommendations.slice(0, 5),
    topTrends: topTrends.slice(0, 10),
    insights: insights.slice(0, 5),
    topViral,
  };
}
