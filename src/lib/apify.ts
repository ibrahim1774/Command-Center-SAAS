const APIFY_TOKEN = process.env.APIFY_API_TOKEN || "";
const APIFY_BASE = "https://api.apify.com/v2";

async function runActor(actorId: string, input: Record<string, unknown>): Promise<unknown[]> {
  // Start the actor run
  const runRes = await fetch(
    `${APIFY_BASE}/acts/${actorId}/runs?token=${APIFY_TOKEN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );

  if (!runRes.ok) {
    const err = await runRes.text();
    throw new Error(`Apify actor start failed: ${err}`);
  }

  const runData = await runRes.json();
  const runId = runData.data?.id;

  if (!runId) throw new Error("No run ID returned from Apify");

  // Poll for completion (max 120 seconds)
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 2000));

    const statusRes = await fetch(
      `${APIFY_BASE}/actor-runs/${runId}?token=${APIFY_TOKEN}`
    );
    const statusData = await statusRes.json();
    const status = statusData.data?.status;

    if (status === "SUCCEEDED") {
      // Fetch dataset items
      const datasetId = statusData.data?.defaultDatasetId;
      const itemsRes = await fetch(
        `${APIFY_BASE}/datasets/${datasetId}/items?token=${APIFY_TOKEN}`
      );
      return await itemsRes.json();
    }

    if (status === "FAILED" || status === "ABORTED" || status === "TIMED-OUT") {
      throw new Error(`Apify actor run ${status}`);
    }
  }

  throw new Error("Apify actor run timed out");
}

export interface ScrapedInstagramProfile {
  username: string;
  fullName: string;
  biography: string;
  followersCount: number;
  followsCount: number;
  postsCount: number;
  profilePicUrl: string | null;
  isVerified: boolean;
  posts: {
    id: string;
    caption: string;
    likesCount: number;
    commentsCount: number;
    type: string;
    timestamp: string;
    url: string;
    displayUrl: string | null;
  }[];
}

export async function scrapeInstagramProfile(
  handle: string
): Promise<ScrapedInstagramProfile | null> {
  const username = handle.replace(/^@/, "");

  const items = await runActor("apify~instagram-profile-scraper", {
    usernames: [username],
    resultsLimit: 12,
  });

  if (!items || items.length === 0) return null;

  const profile = items[0] as Record<string, unknown>;
  const latestPosts = ((profile.latestPosts || []) as Record<string, unknown>[]).slice(0, 12);

  return {
    username: (profile.username as string) || username,
    fullName: (profile.fullName as string) || "",
    biography: (profile.biography as string) || "",
    followersCount: (profile.followersCount as number) || 0,
    followsCount: (profile.followsCount as number) || 0,
    postsCount: (profile.postsCount as number) || 0,
    profilePicUrl: (profile.profilePicUrl as string) || null,
    isVerified: (profile.verified as boolean) || false,
    posts: latestPosts.map((p) => ({
      id: (p.id as string) || (p.shortCode as string) || "",
      caption: (p.caption as string) || "",
      likesCount: (p.likesCount as number) || 0,
      commentsCount: (p.commentsCount as number) || 0,
      type: (p.type as string) || "Image",
      timestamp: (p.timestamp as string) || new Date().toISOString(),
      url: (p.url as string) || "",
      displayUrl: (p.displayUrl as string) || null,
    })),
  };
}

export interface ScrapedInstagramComment {
  id: string;
  username: string;
  text: string;
  timestamp: string;
  likesCount: number;
}

export async function scrapeInstagramComments(
  postUrls: string[],
  maxComments: number = 10
): Promise<ScrapedInstagramComment[]> {
  if (postUrls.length === 0) return [];

  // Only scrape top 3 posts to keep costs down, limit total comments to maxComments
  const urls = postUrls.slice(0, 3);

  const items = await runActor("apify~instagram-comment-scraper", {
    directUrls: urls,
    resultsLimit: maxComments,
  });

  if (!items || items.length === 0) return [];

  return (items as Record<string, unknown>[]).slice(0, maxComments).map((c) => ({
    id: (c.id as string) || "",
    username: (c.ownerUsername as string) || (c.username as string) || "",
    text: (c.text as string) || "",
    timestamp: (c.timestamp as string) || (c.createdAt as string) || new Date().toISOString(),
    likesCount: (c.likesCount as number) || 0,
  }));
}

export interface ScrapedYouTubeChannel {
  channelName: string;
  subscriberCount: number;
  totalViews: number;
  videoCount: number;
  description: string;
  thumbnailUrl: string | null;
  videos: {
    id: string;
    title: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    duration: string;
    publishedAt: string;
    thumbnailUrl: string | null;
  }[];
}

export async function scrapeYouTubeChannel(
  channelUrl: string
): Promise<ScrapedYouTubeChannel | null> {
  const items = await runActor("streamers~youtube-channel-scraper", {
    channelUrls: [channelUrl],
    maxResults: 10,
  });

  if (!items || items.length === 0) return null;

  const channel = items[0] as Record<string, unknown>;
  const videos = ((channel.videos || channel.items || []) as Record<string, unknown>[]).slice(0, 10);

  return {
    channelName: (channel.channelName as string) || (channel.title as string) || "",
    subscriberCount: (channel.subscriberCount as number) || (channel.numberOfSubscribers as number) || 0,
    totalViews: (channel.viewCount as number) || (channel.numberOfViews as number) || 0,
    videoCount: (channel.videoCount as number) || (channel.numberOfVideos as number) || 0,
    description: (channel.description as string) || "",
    thumbnailUrl: (channel.thumbnailUrl as string) || (channel.avatar as string) || null,
    videos: videos.map((v) => ({
      id: (v.id as string) || (v.videoId as string) || "",
      title: (v.title as string) || "",
      viewCount: (v.viewCount as number) || (v.views as number) || 0,
      likeCount: (v.likeCount as number) || (v.likes as number) || 0,
      commentCount: (v.commentCount as number) || (v.comments as number) || 0,
      duration: (v.duration as string) || "",
      publishedAt: (v.publishedAt as string) || (v.date as string) || "",
      thumbnailUrl: (v.thumbnailUrl as string) || (v.thumbnail as string) || null,
    })),
  };
}

export interface ScrapedTikTokProfile {
  username: string;
  nickname: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  heartsCount: number;
  videoCount: number;
  profilePicUrl: string | null;
  isVerified: boolean;
  videos: {
    id: string;
    caption: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    shareCount: number;
    timestamp: string;
  }[];
}

export async function scrapeTikTokProfile(
  username: string
): Promise<ScrapedTikTokProfile | null> {
  const handle = username.replace(/^@/, "");

  const items = await runActor("clockworks~tiktok-profile-scraper", {
    profiles: [handle],
    resultsPerPage: 10,
  });

  if (!items || items.length === 0) return null;

  const profile = items[0] as Record<string, unknown>;
  const videos = ((profile.latestVideos || profile.videos || []) as Record<string, unknown>[]).slice(0, 10);

  return {
    username: (profile.uniqueId as string) || (profile.username as string) || handle,
    nickname: (profile.nickname as string) || "",
    bio: (profile.signature as string) || (profile.bio as string) || "",
    followersCount: (profile.followerCount as number) || (profile.fans as number) || 0,
    followingCount: (profile.followingCount as number) || (profile.following as number) || 0,
    heartsCount: (profile.heartCount as number) || (profile.heart as number) || 0,
    videoCount: (profile.videoCount as number) || 0,
    profilePicUrl: (profile.avatarLarger as string) || (profile.avatar as string) || null,
    isVerified: (profile.verified as boolean) || false,
    videos: videos.map((v) => ({
      id: (v.id as string) || "",
      caption: (v.text as string) || (v.desc as string) || "",
      viewCount: (v.playCount as number) || (v.views as number) || 0,
      likeCount: (v.diggCount as number) || (v.likes as number) || 0,
      commentCount: (v.commentCount as number) || (v.comments as number) || 0,
      shareCount: (v.shareCount as number) || (v.shares as number) || 0,
      timestamp: (v.createTime as string) || new Date().toISOString(),
    })),
  };
}

// ── Trend Intelligence Scrapers ──

export async function scrapeCrossPlatformTrends(keywords?: string[]): Promise<unknown[]> {
  const input: Record<string, unknown> = {};
  if (keywords && keywords.length > 0) {
    input.searchTerms = keywords;
    input.keywords = keywords;
  }
  return runActor("manju4k~social-media-trend-scraper-6-in-1-ai-analysis", input);
}
