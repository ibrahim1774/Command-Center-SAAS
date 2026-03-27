"use client";

import { useState, useEffect, useCallback } from "react";
import type { Goal } from "@/types";

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/goals");
      if (res.ok) {
        const data = await res.json();
        setGoals(data.goals || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const createGoal = useCallback(async (data: Partial<Goal>) => {
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) fetchGoals();
  }, [fetchGoals]);

  const updateGoal = useCallback(async (id: string, data: Partial<Goal>) => {
    const res = await fetch(`/api/goals/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const { goal } = await res.json();
      setGoals((prev) => prev.map((g) => (g.id === id ? goal : g)));
    }
  }, []);

  const deleteGoal = useCallback(async (id: string) => {
    await fetch(`/api/goals/${id}`, { method: "DELETE" });
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  return { goals, loading, createGoal, updateGoal, deleteGoal, refetch: fetchGoals };
}
