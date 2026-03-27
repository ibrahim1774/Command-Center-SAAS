"use client";

import { useState, useEffect, useCallback } from "react";
import type { BrandDeal, DealNote, DealChecklistItem } from "@/types";

interface UseDealDetailResult {
  deal: BrandDeal | null;
  notes: DealNote[];
  checklist: DealChecklistItem[];
  loading: boolean;
  addNote: (content: string) => Promise<void>;
  addChecklistItem: (label: string) => Promise<void>;
  toggleChecklistItem: (itemId: string, completed: boolean) => Promise<void>;
  deleteChecklistItem: (itemId: string) => Promise<void>;
  updateDeal: (data: Partial<BrandDeal>) => Promise<void>;
  refetch: () => void;
}

export function useDealDetail(dealId: string | null): UseDealDetailResult {
  const [deal, setDeal] = useState<BrandDeal | null>(null);
  const [notes, setNotes] = useState<DealNote[]>([]);
  const [checklist, setChecklist] = useState<DealChecklistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!dealId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/deals/${dealId}`);
      if (res.ok) {
        const data = await res.json();
        setDeal(data.deal);
        setNotes(data.notes || []);
        setChecklist(data.checklist || []);
      }
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  useEffect(() => {
    if (dealId) fetchDetail();
    else {
      setDeal(null);
      setNotes([]);
      setChecklist([]);
    }
  }, [dealId, fetchDetail]);

  const addNote = useCallback(
    async (content: string) => {
      if (!dealId) return;
      const res = await fetch(`/api/deals/${dealId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const { note } = await res.json();
        setNotes((prev) => [note, ...prev]);
      }
    },
    [dealId]
  );

  const addChecklistItem = useCallback(
    async (label: string) => {
      if (!dealId) return;
      const res = await fetch(`/api/deals/${dealId}/checklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      });
      if (res.ok) {
        const { item } = await res.json();
        setChecklist((prev) => [...prev, item]);
      }
    },
    [dealId]
  );

  const toggleChecklistItem = useCallback(
    async (itemId: string, completed: boolean) => {
      if (!dealId) return;
      setChecklist((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, completed } : i))
      );
      await fetch(`/api/deals/${dealId}/checklist/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });
    },
    [dealId]
  );

  const deleteChecklistItem = useCallback(
    async (itemId: string) => {
      if (!dealId) return;
      setChecklist((prev) => prev.filter((i) => i.id !== itemId));
      await fetch(`/api/deals/${dealId}/checklist/${itemId}`, {
        method: "DELETE",
      });
    },
    [dealId]
  );

  const updateDeal = useCallback(
    async (data: Partial<BrandDeal>) => {
      if (!dealId) return;
      const res = await fetch(`/api/deals/${dealId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const { deal: updated } = await res.json();
        setDeal(updated);
      }
    },
    [dealId]
  );

  return {
    deal,
    notes,
    checklist,
    loading,
    addNote,
    addChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem,
    updateDeal,
    refetch: fetchDetail,
  };
}
