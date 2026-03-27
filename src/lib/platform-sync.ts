import { getSupabaseAdmin } from "./supabase-admin";
import { getValidGoogleToken, getValidMetaToken } from "./token-refresh";
import { logSync, updateLastSynced, type SyncResult } from "./sync-helpers";

const META_API = "https://graph.facebook.com/v21.0";
const YOUTUBE_API = "https://www.googleapis.com/youtube/v3";
const GMAIL_API = "https://gmail.googleapis.com/gmail/v1";

// ─── Instagram ───────────────────────────────────────────────────────────────

export async function syncInstagram(userId: string): Promise<SyncResult> {
  const supabase = getSupabaseAdmin();

  try {
    const token = await getValidMetaToken(userId, "instagram");

    // Get IG business account ID from connected_accounts
    const { data: account } = await supabase
      .from("connected_accounts")
      .select("platform_user_id")
      .eq("user_id", userId)
      .eq("platform", "instagram")
      .eq("status", "active")
      .single();

    if (!account?.platform_user_id) {
      throw new Error("No Instagram business account ID found");
    }

    const igUserId = account.platform_user_id;

    // 1. Fetch profile
    const profileRes = await fetch(
      `${META_API}/${igUserId}?fields=id,username,name,profile_picture_url,followers_count,follows_count,media_count&access_token=${token}`
    );
    if (!profileRes.ok) throw new Error(`Profile fetch failed: ${profileRes.status}`);
    const profile = await profileRes.json();

    await supabase.from("instagram_profiles").upsert(
      {
        user_id: userId,
        username: profile.username || profile.name,
        follower_count: profile.followers_count || 0,
        following_count: profile.follows_count || 0,
        media_count: profile.media_count || 0,
        profile_picture_url: profile.profile_picture_url || null,
        last_synced: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    // 2. Fetch media
    const mediaRes = await fetch(
      `${META_API}/${igUserId}/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp,like_count,comments_count&limit=12&access_token=${token}`
    );
    let posts: Array<Record<string, unknown>> = [];
    if (mediaRes.ok) {
      const mediaData = await mediaRes.json();
      posts = mediaData.data || [];

      for (const post of posts) {
        await supabase.from("instagram_posts").upsert(
          {
            user_id: userId,
            post_id: post.id as string,
            caption: (post.caption as string) || null,
            media_type: (post.media_type as string) || null,
            media_url: (post.media_url as string) || null,
            thumbnail_url: (post.thumbnail_url as string) || null,
            likes: (post.like_count as number) || 0,
            comments_count: (post.comments_count as number) || 0,
            timestamp: post.timestamp as string,
          },
          { onConflict: "user_id,post_id" }
        );
      }
    }

    // 3. Fetch comments for top 5 posts
    const topPosts = posts.slice(0, 5);
    for (const post of topPosts) {
      const commentsRes = await fetch(
        `${META_API}/${post.id}/comments?fields=id,text,username,timestamp&limit=20&access_token=${token}`
      );
      if (!commentsRes.ok) continue;
      const commentsData = await commentsRes.json();

      // Get the internal post UUID
      const { data: dbPost } = await supabase
        .from("instagram_posts")
        .select("id")
        .eq("user_id", userId)
        .eq("post_id", post.id as string)
        .single();

      if (dbPost && commentsData.data) {
        for (const comment of commentsData.data) {
          await supabase.from("instagram_comments").upsert(
            {
              post_id: dbPost.id,
              user_id: userId,
              username: comment.username || "Unknown",
              text: comment.text || "",
              timestamp: comment.timestamp,
            },
            { ignoreDuplicates: true }
          );
        }
      }
    }

    // 4. Fetch insights (daily metrics)
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 86400;
    const now = Math.floor(Date.now() / 1000);
    const insightsRes = await fetch(
      `${META_API}/${igUserId}/insights?metric=reach,impressions,follower_count&period=day&since=${thirtyDaysAgo}&until=${now}&access_token=${token}`
    );
    if (insightsRes.ok) {
      const insightsData = await insightsRes.json();
      const metrics: Record<string, Record<string, number>> = {};

      for (const metric of insightsData.data || []) {
        for (const val of metric.values || []) {
          const date = val.end_time?.split("T")[0];
          if (!date) continue;
          if (!metrics[date]) metrics[date] = {};
          metrics[date][metric.name] = val.value;
        }
      }

      for (const [date, values] of Object.entries(metrics)) {
        await supabase.from("instagram_daily_metrics").upsert(
          {
            user_id: userId,
            date,
            reach: values.reach || 0,
            impressions: values.impressions || 0,
            follower_count: values.follower_count || 0,
          },
          { onConflict: "user_id,date" }
        );
      }
    }

    await updateLastSynced(userId, "instagram");
    await logSync(userId, "instagram", "success");
    return { success: true, recordsProcessed: posts.length };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    await logSync(userId, "instagram", "error", msg);
    return { success: false, error: msg };
  }
}

// ─── YouTube ─────────────────────────────────────────────────────────────────

export async function syncYouTube(userId: string): Promise<SyncResult> {
  const supabase = getSupabaseAdmin();

  try {
    const token = await getValidGoogleToken(userId, "youtube");
    const headers = { Authorization: `Bearer ${token}` };

    // 1. Fetch channel
    const channelRes = await fetch(
      `${YOUTUBE_API}/channels?part=snippet,statistics&mine=true`,
      { headers }
    );
    if (!channelRes.ok) throw new Error(`Channel fetch failed: ${channelRes.status}`);
    const channelData = await channelRes.json();
    const channel = channelData.items?.[0];
    if (!channel) throw new Error("No YouTube channel found");

    await supabase.from("youtube_channels").upsert(
      {
        user_id: userId,
        channel_id: channel.id,
        title: channel.snippet?.title || "",
        subscriber_count: parseInt(channel.statistics?.subscriberCount || "0"),
        total_views: parseInt(channel.statistics?.viewCount || "0"),
        video_count: parseInt(channel.statistics?.videoCount || "0"),
        last_synced: new Date().toISOString(),
      },
      { onConflict: "user_id,channel_id" }
    );

    // 2. Fetch recent videos
    const searchRes = await fetch(
      `${YOUTUBE_API}/search?part=snippet&forMine=true&type=video&order=date&maxResults=10`,
      { headers }
    );
    let videos: Array<Record<string, unknown>> = [];
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const videoIds = (searchData.items || [])
        .map((item: Record<string, Record<string, unknown>>) => item.id?.videoId)
        .filter(Boolean)
        .join(",");

      if (videoIds) {
        // 3. Fetch video stats
        const videosRes = await fetch(
          `${YOUTUBE_API}/videos?part=snippet,statistics&id=${videoIds}`,
          { headers }
        );
        if (videosRes.ok) {
          const videosData = await videosRes.json();
          videos = videosData.items || [];

          for (const video of videos) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const v = video as any;
            await supabase.from("youtube_videos").upsert(
              {
                user_id: userId,
                video_id: String(v.id ?? ""),
                title: v.snippet?.title || "",
                thumbnail_url:
                  v.snippet?.thumbnails?.high?.url ||
                  v.snippet?.thumbnails?.default?.url ||
                  "",
                published_at: v.snippet?.publishedAt || new Date().toISOString(),
                views: parseInt(v.statistics?.viewCount || "0"),
                likes: parseInt(v.statistics?.likeCount || "0"),
                comments_count: parseInt(v.statistics?.commentCount || "0"),
              },
              { onConflict: "user_id,video_id" }
            );
          }
        }
      }
    }

    // 4. Fetch comments for each video
    for (const video of videos) {
      const v = video as Record<string, unknown>;
      const videoId = v.id as string;
      const commentsRes = await fetch(
        `${YOUTUBE_API}/commentThreads?part=snippet&videoId=${videoId}&maxResults=20&order=relevance`,
        { headers }
      );
      if (!commentsRes.ok) continue;
      const commentsData = await commentsRes.json();

      const { data: dbVideo } = await supabase
        .from("youtube_videos")
        .select("id")
        .eq("user_id", userId)
        .eq("video_id", videoId)
        .single();

      if (dbVideo && commentsData.items) {
        for (const item of commentsData.items) {
          const comment = item.snippet?.topLevelComment?.snippet;
          if (!comment) continue;
          await supabase.from("youtube_comments").upsert(
            {
              video_id: dbVideo.id,
              user_id: userId,
              author: comment.authorDisplayName || "Unknown",
              text: comment.textDisplay || "",
              like_count: comment.likeCount || 0,
              published_at: comment.publishedAt || new Date().toISOString(),
            },
            { ignoreDuplicates: true }
          );
        }
      }
    }

    await updateLastSynced(userId, "youtube");
    await logSync(userId, "youtube", "success");
    return { success: true, recordsProcessed: videos.length };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    await logSync(userId, "youtube", "error", msg);
    return { success: false, error: msg };
  }
}

// ─── Facebook ────────────────────────────────────────────────────────────────

export async function syncFacebook(userId: string): Promise<SyncResult> {
  const supabase = getSupabaseAdmin();

  try {
    const userToken = await getValidMetaToken(userId, "facebook");

    // Get stored page ID
    const { data: account } = await supabase
      .from("connected_accounts")
      .select("platform_user_id")
      .eq("user_id", userId)
      .eq("platform", "facebook")
      .eq("status", "active")
      .single();

    if (!account?.platform_user_id) {
      throw new Error("No Facebook page ID found");
    }

    const pageId = account.platform_user_id;

    // 1. Get page access token
    const pagesRes = await fetch(
      `${META_API}/me/accounts?access_token=${userToken}`
    );
    if (!pagesRes.ok) throw new Error(`Pages fetch failed: ${pagesRes.status}`);
    const pagesData = await pagesRes.json();
    const page = (pagesData.data || []).find(
      (p: Record<string, string>) => p.id === pageId
    );
    if (!page) throw new Error("Page not found in user's accounts");
    const pageToken = page.access_token;

    // 2. Fetch page info
    const pageInfoRes = await fetch(
      `${META_API}/${pageId}?fields=name,followers_count,fan_count&access_token=${pageToken}`
    );
    if (pageInfoRes.ok) {
      const pageInfo = await pageInfoRes.json();
      await supabase.from("facebook_pages").upsert(
        {
          user_id: userId,
          page_id: pageId,
          name: pageInfo.name || "",
          followers: pageInfo.followers_count || 0,
          likes: pageInfo.fan_count || 0,
          last_synced: new Date().toISOString(),
        },
        { onConflict: "user_id,page_id" }
      );
    }

    // 3. Fetch posts
    const postsRes = await fetch(
      `${META_API}/${pageId}/posts?fields=id,message,type,created_time,shares&limit=10&access_token=${pageToken}`
    );
    let posts: Array<Record<string, unknown>> = [];
    if (postsRes.ok) {
      const postsData = await postsRes.json();
      posts = postsData.data || [];

      for (const post of posts) {
        // Fetch reactions and comments summary
        const detailRes = await fetch(
          `${META_API}/${post.id}?fields=reactions.summary(true),comments.summary(true)&access_token=${pageToken}`
        );
        let reactionsCount = 0;
        let commentsCount = 0;
        if (detailRes.ok) {
          const detail = await detailRes.json();
          reactionsCount = detail.reactions?.summary?.total_count || 0;
          commentsCount = detail.comments?.summary?.total_count || 0;
        }

        await supabase.from("facebook_posts").upsert(
          {
            user_id: userId,
            post_id: post.id as string,
            message: (post.message as string) || null,
            post_type: (post.type as string) || "status",
            reactions: { total: reactionsCount },
            comments_count: commentsCount,
            shares: (post.shares as Record<string, number>)?.count || 0,
            created_time: post.created_time as string,
          },
          { onConflict: "user_id,post_id" }
        );
      }
    }

    // 4. Fetch comments for top 5 posts
    const topPosts = posts.slice(0, 5);
    for (const post of topPosts) {
      const commentsRes = await fetch(
        `${META_API}/${post.id}/comments?fields=from,message,created_time&limit=20&access_token=${pageToken}`
      );
      if (!commentsRes.ok) continue;
      const commentsData = await commentsRes.json();

      const { data: dbPost } = await supabase
        .from("facebook_posts")
        .select("id")
        .eq("user_id", userId)
        .eq("post_id", post.id as string)
        .single();

      if (dbPost && commentsData.data) {
        for (const comment of commentsData.data) {
          await supabase.from("facebook_comments").upsert(
            {
              post_id: dbPost.id,
              user_id: userId,
              author: comment.from?.name || "Unknown",
              text: comment.message || "",
              timestamp: comment.created_time,
            },
            { ignoreDuplicates: true }
          );
        }
      }
    }

    await updateLastSynced(userId, "facebook");
    await logSync(userId, "facebook", "success");
    return { success: true, recordsProcessed: posts.length };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    await logSync(userId, "facebook", "error", msg);
    return { success: false, error: msg };
  }
}

// ─── Gmail ───────────────────────────────────────────────────────────────────

export async function syncGmail(userId: string): Promise<SyncResult> {
  const supabase = getSupabaseAdmin();

  try {
    const token = await getValidGoogleToken(userId, "gmail");
    const headers = { Authorization: `Bearer ${token}` };

    // 1. Fetch message list
    const listRes = await fetch(
      `${GMAIL_API}/users/me/messages?maxResults=30&q=is:inbox`,
      { headers }
    );
    if (!listRes.ok) throw new Error(`Gmail list failed: ${listRes.status}`);
    const listData = await listRes.json();
    const messageIds: string[] = (listData.messages || []).map(
      (m: Record<string, string>) => m.id
    );

    let processed = 0;
    for (const msgId of messageIds) {
      const msgRes = await fetch(
        `${GMAIL_API}/users/me/messages/${msgId}?format=metadata&metadataHeaders=From,Subject,Date`,
        { headers }
      );
      if (!msgRes.ok) continue;
      const msg = await msgRes.json();

      const getHeader = (name: string): string => {
        const header = (msg.payload?.headers || []).find(
          (h: Record<string, string>) =>
            h.name?.toLowerCase() === name.toLowerCase()
        );
        return header?.value || "";
      };

      const fromRaw = getHeader("From");
      const fromMatch = fromRaw.match(/^(.+?)\s*<(.+?)>$/);
      const fromName = fromMatch ? fromMatch[1].replace(/"/g, "").trim() : fromRaw;
      const fromEmail = fromMatch ? fromMatch[2] : fromRaw;

      const dateStr = getHeader("Date");
      let receivedAt: string;
      try {
        receivedAt = new Date(dateStr).toISOString();
      } catch {
        receivedAt = new Date().toISOString();
      }

      await supabase.from("emails").upsert(
        {
          user_id: userId,
          email_id: msgId,
          from_name: fromName,
          from_email: fromEmail,
          subject: getHeader("Subject") || "(no subject)",
          snippet: msg.snippet || "",
          category: "uncategorized",
          priority: "medium",
          received_at: receivedAt,
          needs_response: false,
        },
        { onConflict: "user_id,email_id" }
      );
      processed++;
    }

    await updateLastSynced(userId, "gmail");
    await logSync(userId, "gmail", "success");
    return { success: true, recordsProcessed: processed };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    await logSync(userId, "gmail", "error", msg);
    return { success: false, error: msg };
  }
}
