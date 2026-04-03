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

// ── Helpers ──

function getStr(obj: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.length > 0) return v;
  }
  return "";
}

function getNum(obj: Record<string, unknown>, ...keys: string[]): number {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "number" && v > 0) return v;
    if (typeof v === "string") {
      const n = parseInt(v.replace(/[^0-9]/g, ""), 10);
      if (n > 0) return n;
    }
  }
  return 0;
}

function getBool(obj: Record<string, unknown>, ...keys: string[]): boolean {
  for (const k of keys) {
    if (obj[k] === true) return true;
  }
  return false;
}

// ── Daily Trends Normalizer ──
// The clockworks~tiktok-trends-scraper may return data in various formats.
// We try to detect sounds (music fields) and creators (user fields) first,
// then treat everything else as a hashtag/trend.

export function normalizeDailyTrends(raw: unknown[]): DailyTrends {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { hashtags: [], sounds: [], creators: [] };
  }

  const hashtags: TrendHashtag[] = [];
  const sounds: TrendSound[] = [];
  const creators: TrendCreator[] = [];

  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const r = item as Record<string, unknown>;

    // Check for nested structures that some actors use
    const musicMeta = (r.musicMeta || r.music || r.soundMeta) as Record<string, unknown> | undefined;
    const authorMeta = (r.authorMeta || r.author) as Record<string, unknown> | undefined;

    // ── Detect SOUND items ──
    // Has explicit music/sound fields at top level or nested
    const hasMusicFields = !!(
      r.musicId || r.soundId || r.musicTitle || r.musicName ||
      r.audioTitle || r.soundName ||
      (musicMeta && typeof musicMeta === "object")
    );

    // ── Detect CREATOR items ──
    // Has explicit user/creator fields (not just an author reference on a post)
    const hasCreatorFields = !!(
      (r.uniqueId && r.followerCount) ||
      (r.username && r.fans) ||
      (r.nickname && r.followerCount) ||
      (authorMeta && typeof authorMeta === "object" && (authorMeta as Record<string, unknown>).followerCount)
    );

    if (hasMusicFields) {
      const meta = (typeof musicMeta === "object" && musicMeta) ? musicMeta as Record<string, unknown> : r;
      sounds.push({
        name: getStr(r, "musicTitle", "musicName", "soundName", "audioTitle", "title", "name") ||
              (meta !== r ? getStr(meta, "title", "musicName", "name") : ""),
        artist: getStr(r, "musicAuthor", "musicArtist", "artist", "authorName", "creator") ||
                (meta !== r ? getStr(meta, "authorName", "artist", "author") : "") || "Unknown",
        useCount: getNum(r, "useCount", "videoCount", "usageCount", "stats_videoCount", "count") ||
                  (meta !== r ? getNum(meta, "useCount", "videoCount") : 0),
        isNew: getBool(r, "isNew", "isBreakout", "breakout", "isNewTrend"),
        rank: getNum(r, "rank", "position") || sounds.length + 1,
      });
    } else if (hasCreatorFields) {
      const meta = (typeof authorMeta === "object" && authorMeta) ? authorMeta as Record<string, unknown> : r;
      creators.push({
        username: getStr(r, "uniqueId", "username", "name", "nickname") ||
                  (meta !== r ? getStr(meta, "uniqueId", "username", "nickname") : ""),
        followers: getNum(r, "followerCount", "followers", "fans", "stats_followerCount") ||
                   (meta !== r ? getNum(meta, "followerCount", "fans") : 0),
        growth: getStr(r, "growth", "growthRate", "followerGrowth"),
        isNew: getBool(r, "isNew", "isBreakout", "breakout"),
        rank: getNum(r, "rank", "position") || creators.length + 1,
      });
    } else {
      // ── Default: treat as HASHTAG/TREND ──
      const name = getStr(r, "name", "title", "hashtag", "challengeName", "challenge",
                          "tag", "keyword", "topic", "trend", "text", "query");
      if (!name && !r.id) continue; // Skip completely empty items

      hashtags.push({
        name: name || String(r.id || ""),
        viewCount: getNum(r, "viewCount", "views", "videoCount", "count",
                          "stats_videoCount", "playCount", "totalViews",
                          "postsCount", "volume", "searchVolume"),
        isNew: getBool(r, "isNew", "isBreakout", "breakout", "isNewTrend", "trending"),
        rank: getNum(r, "rank", "position") || hashtags.length + 1,
      });
    }
  }

  return {
    hashtags: hashtags.slice(0, 30),
    sounds: sounds.slice(0, 30),
    creators: creators.slice(0, 30),
  };
}

// ── Weekly Report Normalizer ──
// The manju4k~social-media-trend-scraper-6-in-1-ai-analysis actor
// may return structured reports or flat trend items.

export function normalizeWeeklyReport(raw: unknown[]): WeeklyReport {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { viralScore: 0, platforms: [], aiRecommendations: [], topTrends: [] };
  }

  const first = raw[0] as Record<string, unknown>;

  // ── Try structured report format ──
  let viralScore = getNum(first, "viralScore", "viral_score", "score", "trendScore", "overallScore");
  let platforms: PlatformTrend[] = [];
  let aiRecommendations: string[] = [];
  let topTrends: WeeklyTrend[] = [];

  // Extract platforms
  const rawPlatforms = (first.platforms || first.platformBreakdown || first.platformData || first.sources) as unknown[];
  if (Array.isArray(rawPlatforms)) {
    platforms = rawPlatforms.map((p) => {
      const pl = p as Record<string, unknown>;
      return {
        name: getStr(pl, "name", "platform", "source", "network"),
        trendCount: getNum(pl, "trendCount", "count", "trends", "totalTrends", "numTrends"),
        topTrend: getStr(pl, "topTrend", "top", "topItem", "bestTrend"),
      };
    }).filter(p => p.name);
  }

  // Extract AI recommendations from various possible locations
  const recSources = [
    first.recommendations, first.aiRecommendations, first.insights,
    first.suggestions, first.actions, first.tips,
    first.ai_recommendations, first.ai_insights,
  ];
  for (const source of recSources) {
    if (Array.isArray(source) && aiRecommendations.length === 0) {
      for (const rec of source) {
        if (typeof rec === "string" && rec.length > 0) {
          aiRecommendations.push(rec);
        } else if (rec && typeof rec === "object") {
          const r = rec as Record<string, unknown>;
          const text = getStr(r, "text", "recommendation", "insight", "suggestion", "action", "tip", "content", "description");
          if (text) aiRecommendations.push(text);
        }
      }
    }
  }

  // Try top-level text fields for recommendations
  if (aiRecommendations.length === 0) {
    for (const key of ["aiAnalysis", "ai_analysis", "summary", "analysis", "recommendation", "insight", "description", "content"]) {
      const val = first[key];
      if (typeof val === "string" && val.length > 10) {
        aiRecommendations.push(val);
        break;
      }
    }
  }

  // Extract top trends
  const trendSources = first.topTrends || first.trends || first.trendData || first.items || first.results;
  if (Array.isArray(trendSources)) {
    topTrends = (trendSources as Record<string, unknown>[]).slice(0, 10).map((t) => ({
      topic: getStr(t, "topic", "title", "name", "keyword", "trend", "text", "query"),
      platforms: Array.isArray(t.platforms)
        ? (t.platforms as string[])
        : [getStr(t, "platform", "source", "network") || "Unknown"],
      score: getNum(t, "score", "viralScore", "viral_score", "trendScore", "popularity", "engagement"),
      growth: getStr(t, "growth", "growthRate", "change", "trend"),
    })).filter(t => t.topic);
  }

  // ── Fallback: if no structured data, build from individual items ──
  if (platforms.length === 0 && topTrends.length === 0) {
    const platformMap = new Map<string, { count: number; top: string; scores: number[] }>();

    for (const item of raw) {
      if (!item || typeof item !== "object") continue;
      const r = item as Record<string, unknown>;

      const platform = getStr(r, "platform", "source", "network", "socialMedia", "social_media") || "Unknown";
      const title = getStr(r, "title", "name", "topic", "keyword", "trend", "text", "query", "hashtag");
      const score = getNum(r, "score", "viralScore", "viral_score", "trendScore", "popularity",
                           "engagement", "engagementRate", "volume", "searchVolume");

      const existing = platformMap.get(platform) || { count: 0, top: "", scores: [] };
      existing.count++;
      if (!existing.top && title) existing.top = title;
      if (score > 0) existing.scores.push(score);
      platformMap.set(platform, existing);

      if (title) {
        topTrends.push({
          topic: title,
          platforms: [platform],
          score,
          growth: getStr(r, "growth", "growthRate", "change", "trend"),
        });
      }

      // Collect recommendation text from individual items
      const desc = getStr(r, "description", "analysis", "insight", "recommendation", "summary", "content", "aiAnalysis");
      if (desc && desc.length > 15 && aiRecommendations.length < 5) {
        aiRecommendations.push(desc);
      }
    }

    for (const [name, data] of platformMap) {
      platforms.push({ name, trendCount: data.count, topTrend: data.top });
    }

    // Compute viral score from collected scores
    const allScores = [...platformMap.values()].flatMap(d => d.scores);
    if (!viralScore && allScores.length > 0) {
      viralScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
    }
  }

  // Ensure viral score is in 0-100 range
  if (viralScore > 100) viralScore = Math.min(100, Math.round(viralScore / 10));
  viralScore = Math.min(100, Math.max(0, viralScore));

  // If still no viral score, generate one from data density
  if (!viralScore && topTrends.length > 0) {
    viralScore = Math.min(100, topTrends.length * 8);
  }

  return {
    viralScore,
    platforms,
    aiRecommendations: aiRecommendations.slice(0, 5),
    topTrends: topTrends.slice(0, 10),
  };
}
