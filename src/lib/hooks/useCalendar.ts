"use client";

import { useState, useEffect, useCallback } from "react";
import type { CalendarEvent } from "@/types";

interface DealDeadline {
  id: string;
  brand_name: string;
  deadline: string;
  status: string;
}

interface TaskDueDate {
  id: string;
  title: string;
  due_date: string;
  priority: string;
  is_completed: boolean;
}

interface CalendarData {
  events: CalendarEvent[];
  dealDeadlines: DealDeadline[];
  taskDueDates: TaskDueDate[];
}

export function useCalendar() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [data, setData] = useState<CalendarData>({ events: [], dealDeadlines: [], taskDueDates: [] });
  const [loading, setLoading] = useState(true);

  const fetchMonth = useCallback(async (y: number, m: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/calendar?year=${y}&month=${m}`);
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMonth(year, month); }, [year, month, fetchMonth]);

  const goNext = useCallback(() => {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
  }, [month]);

  const goPrev = useCallback(() => {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
  }, [month]);

  const createEvent = useCallback(async (eventData: Partial<CalendarEvent>) => {
    const res = await fetch("/api/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
    });
    if (res.ok) fetchMonth(year, month);
  }, [year, month, fetchMonth]);

  const deleteEvent = useCallback(async (id: string) => {
    await fetch(`/api/calendar/${id}`, { method: "DELETE" });
    setData((prev) => ({
      ...prev,
      events: prev.events.filter((e) => e.id !== id),
    }));
  }, []);

  return {
    year, month, ...data, loading,
    goNext, goPrev, createEvent, deleteEvent,
    refetch: () => fetchMonth(year, month),
  };
}
