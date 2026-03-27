"use client";

import { useState, useEffect, useCallback } from "react";

interface DashboardDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastSynced: string | null;
  connected: boolean;
  refetch: () => void;
}

export function useDashboardData<T>(endpoint: string): DashboardDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error("Failed to fetch data");
      const json = await res.json();
      setConnected(json.connected ?? false);
      setLastSynced(json.lastSynced ?? null);
      if (json.connected) {
        setData(json);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, lastSynced, connected, refetch: fetchData };
}
