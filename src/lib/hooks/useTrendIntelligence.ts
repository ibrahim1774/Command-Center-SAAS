"use client";

import { useState, useEffect, useCallback } from "react";
import type { DailyTrends, WeeklyReport } from "@/lib/trends";

interface TrendIntelligenceResult {
  daily: DailyTrends | null;
  weekly: WeeklyReport | null;
  dailyUpdated: string | null;
  weeklyUpdated: string | null;
  dailyStale: boolean;
  weeklyStale: boolean;
  loading: boolean;
  refreshing: "daily" | "weekly" | null;
  refreshDaily: () => void;
  refreshWeekly: () => void;
}

export function useTrendIntelligence(): TrendIntelligenceResult {
  const [daily, setDaily] = useState<DailyTrends | null>(null);
  const [weekly, setWeekly] = useState<WeeklyReport | null>(null);
  const [dailyUpdated, setDailyUpdated] = useState<string | null>(null);
  const [weeklyUpdated, setWeeklyUpdated] = useState<string | null>(null);
  const [dailyStale, setDailyStale] = useState(false);
  const [weeklyStale, setWeeklyStale] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState<"daily" | "weekly" | null>(null);

  // Fetch cached data on mount
  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      try {
        const [dailyRes, weeklyRes] = await Promise.all([
          fetch("/api/dashboard/trends/daily"),
          fetch("/api/dashboard/trends/weekly"),
        ]);

        if (cancelled) return;

        if (dailyRes.ok) {
          const data = await dailyRes.json();
          setDaily(data.trends);
          setDailyUpdated(data.lastUpdated);
          setDailyStale(data.stale);
        }

        if (weeklyRes.ok) {
          const data = await weeklyRes.json();
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
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshDaily = useCallback(async () => {
    setRefreshing("daily");
    try {
      const res = await fetch("/api/dashboard/trends/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "daily" }),
      });

      if (res.ok) {
        const data = await res.json();
        setDaily(data.trends);
        setDailyUpdated(data.lastUpdated);
        setDailyStale(false);
      }
    } catch (err) {
      console.error("Failed to refresh daily trends:", err);
    } finally {
      setRefreshing(null);
    }
  }, []);

  const refreshWeekly = useCallback(async () => {
    setRefreshing("weekly");
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
      setRefreshing(null);
    }
  }, []);

  return {
    daily,
    weekly,
    dailyUpdated,
    weeklyUpdated,
    dailyStale,
    weeklyStale,
    loading,
    refreshing,
    refreshDaily,
    refreshWeekly,
  };
}
