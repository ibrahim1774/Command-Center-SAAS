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
} {
  switch (rank) {
    case 1:
      return {
        border: "border-yellow-500/30",
        accent: "text-yellow-600",
      };
    case 2:
      return {
        border: "border-gray-400/30",
        accent: "text-gray-500",
      };
    case 3:
      return {
        border: "border-amber-600/30",
        accent: "text-amber-700",
      };
    default:
      return {
        border: "border-card-border",
        accent: "text-text-muted",
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
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="h-7 w-7 text-accent-primary" />
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
            Trending Now
          </h1>
        </div>
        <p className="text-text-secondary text-sm sm:text-base mt-1">
          Top trending topics updated daily from Google Trends
        </p>
        {lastUpdated && (
          <div className="flex items-center gap-1.5 mt-3 text-xs text-text-muted">
            <Clock className="h-3.5 w-3.5" />
            <span>Just updated</span>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} padding="lg">
              <div className="flex items-start gap-4 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-card-border/40" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-3/4 rounded bg-card-border/40" />
                  <div className="flex gap-2">
                    <div className="h-4 w-24 rounded bg-card-border/40" />
                    <div className="h-4 w-16 rounded bg-card-border/40" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card padding="lg">
          <div className="text-center py-4">
            <p className="text-danger text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 text-xs text-accent-primary hover:underline"
            >
              Try again
            </button>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && headlines.length === 0 && (
        <Card padding="lg">
          <div className="text-center py-8">
            <TrendingUp className="h-10 w-10 text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary text-sm">
              No trending headlines available right now.
            </p>
            <p className="text-text-muted text-xs mt-1">
              Check back later for the latest trends.
            </p>
          </div>
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
                className={`transition-colors hover:border-accent-primary/30 ${style.border}`}
                padding="lg"
              >
                <div className="flex items-start gap-4">
                  {/* Rank */}
                  <div className="flex-shrink-0 flex flex-col items-center w-8">
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
                    <h2 className="font-display text-base sm:text-lg font-semibold text-text-primary leading-snug">
                      {headline.title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-2 mt-2.5">
                      {headline.traffic && (
                        <Badge variant="info" size="sm">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {headline.traffic}
                        </Badge>
                      )}

                      {headline.pubDate && (
                        <span className="flex items-center gap-1 text-xs text-text-muted">
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
                      className="flex-shrink-0 flex items-center gap-1.5 text-xs text-accent-primary hover:text-text-primary transition-colors mt-0.5"
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
