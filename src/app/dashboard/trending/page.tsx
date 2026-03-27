"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TrendingUp, ExternalLink, Flame, Clock } from "lucide-react";

interface TrendingHeadline {
  title: string;
  traffic: string;
  link: string;
  pubDate: string;
}

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function getRankStyle(rank: number): {
  border: string;
  accent: string;
  label: string;
} {
  switch (rank) {
    case 1:
      return {
        border: "border-yellow-500/40",
        accent: "text-yellow-400",
        label: "gold",
      };
    case 2:
      return {
        border: "border-gray-400/40",
        accent: "text-gray-300",
        label: "silver",
      };
    case 3:
      return {
        border: "border-amber-700/40",
        accent: "text-amber-600",
        label: "bronze",
      };
    default:
      return {
        border: "border-white/5",
        accent: "text-white/40",
        label: "",
      };
  }
}

export default function TrendingPage() {
  const [headlines, setHeadlines] = useState<TrendingHeadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    async function fetchTrending() {
      try {
        setLoading(true);
        const res = await fetch("/api/dashboard/trending");
        if (!res.ok) throw new Error("Failed to fetch trending data");
        const data = await res.json();
        setHeadlines(data.headlines ?? data ?? []);
        setLastUpdated(new Date());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchTrending();
  }, []);

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="h-7 w-7 text-accent-primary" />
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Trending Now
          </h1>
        </div>
        <p className="text-white/50 text-sm sm:text-base mt-1">
          Top social media headlines updated daily
        </p>
        {lastUpdated && (
          <div className="flex items-center gap-1.5 mt-3 text-xs text-white/30">
            <Clock className="h-3.5 w-3.5" />
            <span>
              Last updated:{" "}
              {Math.max(
                0,
                Math.floor(
                  (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60)
                )
              )}{" "}
              hours ago
            </span>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-5 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-white/5" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-3/4 rounded bg-white/5" />
                  <div className="flex gap-2">
                    <div className="h-4 w-24 rounded bg-white/5" />
                    <div className="h-4 w-16 rounded bg-white/5" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="p-8 text-center">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-xs text-accent-primary hover:underline"
          >
            Try again
          </button>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && headlines.length === 0 && (
        <Card className="p-12 text-center">
          <TrendingUp className="h-10 w-10 text-white/10 mx-auto mb-4" />
          <p className="text-white/40 text-sm">
            No trending headlines available right now.
          </p>
          <p className="text-white/20 text-xs mt-1">
            Check back later for the latest trends.
          </p>
        </Card>
      )}

      {/* Headlines List */}
      {!loading && !error && headlines.length > 0 && (
        <div className="space-y-3">
          {headlines.map((headline, index) => {
            const rank = index + 1;
            const style = getRankStyle(rank);
            const isTopThree = rank <= 3;

            return (
              <Card
                key={index}
                className={`p-5 border transition-colors hover:border-white/10 ${style.border}`}
              >
                <div className="flex items-start gap-4">
                  {/* Rank */}
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <span
                      className={`font-display text-2xl font-bold leading-none ${style.accent}`}
                    >
                      {rank}
                    </span>
                    {isTopThree && (
                      <Flame
                        className={`h-4 w-4 mt-1 ${style.accent}`}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h2 className="font-display text-base sm:text-lg font-semibold text-white leading-snug">
                      {headline.title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-2 mt-2.5">
                      {headline.traffic && (
                        <Badge>
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {headline.traffic}
                        </Badge>
                      )}

                      {headline.pubDate && (
                        <span className="flex items-center gap-1 text-xs text-white/30">
                          <Clock className="h-3 w-3" />
                          {getTimeAgo(headline.pubDate)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* External Link */}
                  {headline.link && (
                    <a
                      href={headline.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 flex items-center gap-1.5 text-xs text-accent-primary hover:text-white transition-colors mt-0.5"
                      title="View on Google Trends"
                    >
                      <span className="hidden sm:inline">View</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
