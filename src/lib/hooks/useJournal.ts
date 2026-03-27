"use client";

import { useState, useEffect, useCallback } from "react";
import type { JournalEntry } from "@/types";

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async (offset = 0) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/journal?offset=${offset}`);
      if (res.ok) {
        const data = await res.json();
        if (offset === 0) {
          setEntries(data.entries || []);
        } else {
          setEntries((prev) => [...prev, ...(data.entries || [])]);
        }
        setTotal(data.total || 0);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const createEntry = useCallback(async (data: Partial<JournalEntry>) => {
    const res = await fetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const { entry } = await res.json();
      setEntries((prev) => [entry, ...prev]);
      setTotal((t) => t + 1);
    }
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    await fetch(`/api/journal/${id}`, { method: "DELETE" });
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setTotal((t) => t - 1);
  }, []);

  const loadMore = useCallback(() => {
    if (entries.length < total) fetchEntries(entries.length);
  }, [entries.length, total, fetchEntries]);

  return { entries, total, loading, createEntry, deleteEntry, loadMore, refetch: () => fetchEntries(0) };
}
