import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const CACHE_KEY = "trending_headlines";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const GOOGLE_TRENDS_RSS = "https://trends.google.com/trending/rss?geo=US";

interface TrendingHeadline {
  title: string;
  traffic: string;
  link: string;
  pubDate: string;
}

function parseRSSItems(xml: string): TrendingHeadline[] {
  const headlines: TrendingHeadline[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];

    const titleMatch = itemXml.match(
      /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/
    );
    const trafficMatch = itemXml.match(
      /<ht:approx_traffic>(.*?)<\/ht:approx_traffic>/
    );
    const linkMatch = itemXml.match(/<link>(.*?)<\/link>/);
    const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/);

    const title = titleMatch
      ? (titleMatch[1] || titleMatch[2] || "").trim()
      : "";
    if (!title) continue;

    headlines.push({
      title,
      traffic: trafficMatch ? trafficMatch[1].trim() : "N/A",
      link: linkMatch ? linkMatch[1].trim() : "",
      pubDate: pubDateMatch ? pubDateMatch[1].trim() : "",
    });
  }

  return headlines;
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    // Check cache
    const { data: cached, error: cacheError } = await supabase
      .from("cached_data")
      .select("value, updated_at")
      .eq("key", CACHE_KEY)
      .single();

    if (!cacheError && cached) {
      const updatedAt = new Date(cached.updated_at).getTime();
      const now = Date.now();

      if (now - updatedAt < CACHE_TTL_MS) {
        return NextResponse.json({
          headlines: cached.value,
          lastUpdated: cached.updated_at,
        });
      }
    }

    // Fetch fresh data from Google Trends RSS
    const rssResponse = await fetch(GOOGLE_TRENDS_RSS, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; CommandCenter/1.0)",
      },
    });

    if (!rssResponse.ok) {
      throw new Error(`Google Trends RSS returned ${rssResponse.status}`);
    }

    const xml = await rssResponse.text();
    const headlines = parseRSSItems(xml);

    // Upsert into cache
    const now = new Date().toISOString();
    const { error: upsertError } = await supabase
      .from("cached_data")
      .upsert(
        {
          key: CACHE_KEY,
          value: headlines,
          updated_at: now,
        },
        { onConflict: "key" }
      );

    if (upsertError) {
      console.error("Failed to cache trending data:", upsertError);
    }

    return NextResponse.json({
      headlines,
      lastUpdated: now,
    });
  } catch (error) {
    console.error("Trending headlines API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending headlines" },
      { status: 500 }
    );
  }
}
