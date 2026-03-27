"use client";

import { useState, useEffect, useCallback } from "react";
import type { BrandDeal, DealStage } from "@/types";

interface DealsMetrics {
  activeDeals: number;
  pipelineValue: number;
  pendingPayouts: number;
  earnedThisMonth: number;
  monthlyEarnings: { month: string; amount: number }[];
}

interface UseDealsResult {
  deals: BrandDeal[];
  metrics: DealsMetrics | null;
  loading: boolean;
  error: string | null;
  createDeal: (data: Partial<BrandDeal>) => Promise<BrandDeal | null>;
  updateDeal: (id: string, data: Partial<BrandDeal>) => Promise<void>;
  deleteDeal: (id: string) => Promise<void>;
  updateDealStatus: (id: string, status: DealStage) => Promise<void>;
  refetch: () => void;
}

export function useDeals(): UseDealsResult {
  const [deals, setDeals] = useState<BrandDeal[]>([]);
  const [metrics, setMetrics] = useState<DealsMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dealsRes, metricsRes] = await Promise.all([
        fetch("/api/deals"),
        fetch("/api/deals/metrics"),
      ]);
      if (dealsRes.ok) {
        const d = await dealsRes.json();
        setDeals(d.deals || []);
      }
      if (metricsRes.ok) {
        const m = await metricsRes.json();
        setMetrics(m);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch deals");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const createDeal = useCallback(
    async (data: Partial<BrandDeal>): Promise<BrandDeal | null> => {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) return null;
      const { deal } = await res.json();
      fetchAll();
      return deal;
    },
    [fetchAll]
  );

  const updateDeal = useCallback(
    async (id: string, data: Partial<BrandDeal>) => {
      await fetch(`/api/deals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      fetchAll();
    },
    [fetchAll]
  );

  const deleteDeal = useCallback(
    async (id: string) => {
      await fetch(`/api/deals/${id}`, { method: "DELETE" });
      fetchAll();
    },
    [fetchAll]
  );

  const updateDealStatus = useCallback(
    async (id: string, status: DealStage) => {
      // Optimistic update
      setDeals((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status } : d))
      );
      try {
        await fetch(`/api/deals/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        fetchAll();
      } catch {
        fetchAll(); // Revert on error
      }
    },
    [fetchAll]
  );

  return {
    deals,
    metrics,
    loading,
    error,
    createDeal,
    updateDeal,
    deleteDeal,
    updateDealStatus,
    refetch: fetchAll,
  };
}
