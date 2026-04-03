"use client";

import { useState, useEffect, useCallback } from "react";
import type { WeeklyReport } from "@/lib/trends";

interface TrendIntelligenceResult {
  weekly: WeeklyReport | null;
  weeklyUpdated: string | null;
  weeklyStale: boolean;
  loading: boolean;
  refreshing: boolean;
  refreshWeekly: () => void;
}

export function useTrendIntelligence(): TrendIntelligenceResult {
  const [weekly, setWeekly] = useState<WeeklyReport | null>(null);
  const [weeklyUpdated, setWeeklyUpdated] = useState<string | null>(null);
  const [weeklyStale, setWeeklyStale] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      try {
        const res = await fetch("/api/dashboard/trends/weekly");
        if (cancelled) return;

        if (res.ok) {
          const data = await res.json();
          setWeekly(data.report);
          setWeeklyUpdated(data.lastUpdated);
          setWeeklyStale(data.stale);
        }
      } catch (err) {
        console.error("Failed to fetch trend intelligence:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  const refreshWeekly = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/dashboard/trends/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "weekly" }),
      });

      if (res.ok) {
        const data = await res.json();
        setWeekly(data.report);
        setWeeklyUpdated(data.lastUpdated);
        setWeeklyStale(false);
      }
    } catch (err) {
      console.error("Failed to refresh weekly report:", err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  return {
    weekly,
    weeklyUpdated,
    weeklyStale,
    loading,
    refreshing,
    refreshWeekly,
  };
}
