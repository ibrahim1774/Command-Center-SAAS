"use client";

import { useState, useEffect, useCallback } from "react";
import type { AIInsightsResponse } from "@/types/ai";

interface AIInsightsResult {
  insights: AIInsightsResponse | null;
  loading: boolean;
  generating: boolean;
  error: string | null;
  regenerate: () => void;
}

export function useAIInsights(): AIInsightsResult {
  const [insights, setInsights] = useState<AIInsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (regenerate = false) => {
    setGenerating(true);
    setError(null);
    try {
      const url = regenerate
        ? "/api/ai/insights?regenerate=true"
        : "/api/ai/insights";
      const res = await fetch(url, { method: "POST" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Failed to generate insights");
      }
      const json = await res.json();
      setInsights(json.insights);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setGenerating(false);
    }
  }, []);

  // On mount: check cache, auto-generate if not cached
  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      try {
        const res = await fetch("/api/ai/insights");
        if (!res.ok) throw new Error("Failed to check insights cache");
        const json = await res.json();

        if (cancelled) return;

        if (json.cached && json.insights) {
          setInsights(json.insights);
          setLoading(false);
        } else {
          // Not cached — auto-generate
          setLoading(false);
          generate();
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
          setLoading(false);
        }
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [generate]);

  const regenerate = useCallback(() => {
    generate(true);
  }, [generate]);

  return { insights, loading, generating, error, regenerate };
}
