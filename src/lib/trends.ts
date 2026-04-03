// ── Trend Intelligence Types & Normalizers ──

export interface TrendHashtag {
  name: string;
  viewCount: number;
  isNew: boolean;
  rank: number;
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
  followers: number;
  growth: string;
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
}

export interface WeeklyTrend {
  topic: string;
  platforms: string[];
  score: number;
  growth: string;
}

export interface WeeklyReport {
  viralScore: number;
  platforms: PlatformTrend[];
  aiRecommendations: string[];
  topTrends: WeeklyTrend[];
}

// ── Normalizers ──
// Apify actors return unpredictable shapes. These functions defensively
// cast raw output into our typed interfaces with safe fallbacks.

export function normalizeDailyTrends(raw: unknown[]): DailyTrends {
  const hashtags: TrendHashtag[] = [];
  const sounds: TrendSound[] = [];
  const creators: TrendCreator[] = [];

  for (const item of raw) {
    const r = item as Record<string, unknown>;
    const type = (r.type as string) || (r.category as string) || "";

    if (type.toLowerCase().includes("hashtag") || r.hashtag || r.challengeName) {
      hashtags.push({
        name: (r.name as string) || (r.hashtag as string) || (r.challengeName as string) || (r.title as string) || "",
        viewCount: (r.viewCount as number) || (r.views as number) || (r.videoCount as number) || 0,
        isNew: (r.isNew as boolean) || (r.isBreakout as boolean) || (r.breakout as boolean) || false,
        rank: (r.rank as number) || hashtags.length + 1,
      });
    } else if (type.toLowerCase().includes("sound") || type.toLowerCase().includes("music") || r.musicId || r.soundId) {
      sounds.push({
        name: (r.name as string) || (r.title as string) || (r.musicName as string) || "",
        artist: (r.artist as string) || (r.authorName as string) || (r.creator as string) || "Unknown",
        useCount: (r.useCount as number) || (r.videoCount as number) || (r.usageCount as number) || 0,
        isNew: (r.isNew as boolean) || (r.isBreakout as boolean) || false,
        rank: (r.rank as number) || sounds.length + 1,
      });
    } else if (type.toLowerCase().includes("creator") || type.toLowerCase().includes("user") || r.uniqueId || r.authorId) {
      creators.push({
        username: (r.username as string) || (r.uniqueId as string) || (r.name as string) || "",
        followers: (r.followers as number) || (r.followerCount as number) || (r.fans as number) || 0,
        growth: (r.growth as string) || (r.growthRate as string) || "",
        isNew: (r.isNew as boolean) || (r.isBreakout as boolean) || false,
        rank: (r.rank as number) || creators.length + 1,
      });
    } else {
      // Unknown type — try to infer from fields
      if (r.challengeName || r.hashtag || (r.name && r.viewCount)) {
        hashtags.push({
          name: (r.name as string) || (r.hashtag as string) || (r.challengeName as string) || "",
          viewCount: (r.viewCount as number) || (r.views as number) || 0,
          isNew: (r.isNew as boolean) || false,
          rank: (r.rank as number) || hashtags.length + 1,
        });
      } else if (r.musicId || r.soundId) {
        sounds.push({
          name: (r.name as string) || (r.title as string) || "",
          artist: (r.artist as string) || "Unknown",
          useCount: (r.useCount as number) || 0,
          isNew: (r.isNew as boolean) || false,
          rank: (r.rank as number) || sounds.length + 1,
        });
      }
    }
  }

  // If the actor returns a flat list without types, treat all as hashtags
  if (hashtags.length === 0 && sounds.length === 0 && creators.length === 0) {
    for (const item of raw.slice(0, 20)) {
      const r = item as Record<string, unknown>;
      hashtags.push({
        name: (r.name as string) || (r.title as string) || (r.hashtag as string) || (r.challengeName as string) || String(r.id || ""),
        viewCount: (r.viewCount as number) || (r.views as number) || (r.videoCount as number) || (r.count as number) || 0,
        isNew: (r.isNew as boolean) || (r.isBreakout as boolean) || false,
        rank: (r.rank as number) || hashtags.length + 1,
      });
    }
  }

  return {
    hashtags: hashtags.slice(0, 20),
    sounds: sounds.slice(0, 20),
    creators: creators.slice(0, 20),
  };
}

export function normalizeWeeklyReport(raw: unknown[]): WeeklyReport {
  // The 6-in-1 actor may return a single object or array of trend items
  const first = (raw[0] || {}) as Record<string, unknown>;

  // Try to extract structured report if available
  const viralScore = (first.viralScore as number) || (first.viral_score as number) || (first.score as number) || 0;

  // Extract platform breakdown
  const rawPlatforms = (first.platforms as unknown[]) || (first.platformBreakdown as unknown[]) || [];
  const platforms: PlatformTrend[] = (rawPlatforms as Record<string, unknown>[]).map((p) => ({
    name: (p.name as string) || (p.platform as string) || "",
    trendCount: (p.trendCount as number) || (p.count as number) || (p.trends as number) || 0,
    topTrend: (p.topTrend as string) || (p.top as string) || "",
  }));

  // If no structured platforms, try to build from individual items
  if (platforms.length === 0) {
    const platformMap = new Map<string, { count: number; top: string }>();
    for (const item of raw) {
      const r = item as Record<string, unknown>;
      const platform = (r.platform as string) || (r.source as string) || "Unknown";
      const existing = platformMap.get(platform) || { count: 0, top: "" };
      existing.count++;
      if (!existing.top) existing.top = (r.title as string) || (r.name as string) || "";
      platformMap.set(platform, existing);
    }
    for (const [name, data] of platformMap) {
      platforms.push({ name, trendCount: data.count, topTrend: data.top });
    }
  }

  // Extract AI recommendations
  const rawRecs = (first.recommendations as unknown[]) || (first.aiRecommendations as unknown[]) || (first.insights as unknown[]) || [];
  const aiRecommendations: string[] = [];
  for (const rec of rawRecs) {
    if (typeof rec === "string") {
      aiRecommendations.push(rec);
    } else if (rec && typeof rec === "object") {
      const r = rec as Record<string, unknown>;
      aiRecommendations.push((r.text as string) || (r.recommendation as string) || (r.insight as string) || "");
    }
  }

  // If no recs found, try top-level text fields
  if (aiRecommendations.length === 0 && first.aiAnalysis) {
    aiRecommendations.push(String(first.aiAnalysis));
  }
  if (aiRecommendations.length === 0 && first.summary) {
    aiRecommendations.push(String(first.summary));
  }

  // Extract top trends
  const rawTrends = (first.topTrends as unknown[]) || (first.trends as unknown[]) || raw.slice(0, 10);
  const topTrends: WeeklyTrend[] = (rawTrends as Record<string, unknown>[]).map((t) => ({
    topic: (t.topic as string) || (t.title as string) || (t.name as string) || "",
    platforms: Array.isArray(t.platforms) ? (t.platforms as string[]) : [(t.platform as string) || ""],
    score: (t.score as number) || (t.viralScore as number) || 0,
    growth: (t.growth as string) || (t.growthRate as string) || "",
  }));

  // Compute viral score from top trends if not directly available
  const finalViralScore = viralScore || (topTrends.length > 0
    ? Math.round(topTrends.reduce((sum, t) => sum + t.score, 0) / topTrends.length)
    : 0);

  return {
    viralScore: Math.min(100, Math.max(0, finalViralScore)),
    platforms,
    aiRecommendations,
    topTrends: topTrends.slice(0, 10),
  };
}
