"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Task } from "@/types";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const createTask = useCallback(async (data: Partial<Task>) => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const { task } = await res.json();
      setTasks((prev) => [task, ...prev]);
    }
  }, []);

  const updateTask = useCallback(async (id: string, data: Partial<Task>) => {
    // Optimistic
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
    await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  }, []);

  const clearCompleted = useCallback(async () => {
    const completed = tasks.filter((t) => t.is_completed);
    setTasks((prev) => prev.filter((t) => !t.is_completed));
    await Promise.all(
      completed.map((t) => fetch(`/api/tasks/${t.id}`, { method: "DELETE" }))
    );
  }, [tasks]);

  // Group tasks
  const grouped = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const weekEnd = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

    const todayTasks: Task[] = [];
    const thisWeek: Task[] = [];
    const upcoming: Task[] = [];
    const completed: Task[] = [];

    for (const t of tasks) {
      if (t.is_completed) {
        completed.push(t);
      } else if (t.due_date && t.due_date <= today) {
        todayTasks.push(t);
      } else if (t.due_date && t.due_date <= weekEnd) {
        thisWeek.push(t);
      } else {
        upcoming.push(t);
      }
    }

    return { today: todayTasks, thisWeek, upcoming, completed };
  }, [tasks]);

  return { tasks, grouped, loading, createTask, updateTask, deleteTask, clearCompleted, refetch: fetchTasks };
}
