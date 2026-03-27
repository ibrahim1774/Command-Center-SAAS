"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useCalendar } from "@/lib/hooks/useCalendar";
import { EVENT_TYPE_CONFIG } from "@/lib/constants";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { EventType } from "@/types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  return days;
}

export function CalendarGrid() {
  const { year, month, events, dealDeadlines, taskDueDates, loading, goNext, goPrev, createEvent } = useCalendar();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [eventForm, setEventForm] = useState({ title: "", event_type: "personal" as EventType, notes: "" });

  const days = getMonthDays(year, month);
  const today = new Date();
  const isToday = (day: number) => today.getFullYear() === year && today.getMonth() + 1 === month && today.getDate() === day;

  function getDotsForDay(day: number) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dots: string[] = [];
    if (dealDeadlines.some((d) => d.deadline?.startsWith(dateStr))) dots.push("#c4947a");
    if (taskDueDates.some((t) => t.due_date === dateStr)) dots.push("#3b82f6");
    if (events.some((e) => e.event_date === dateStr)) dots.push("#a09a90");
    return dots;
  }

  function getDayItems(day: number) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return {
      deals: dealDeadlines.filter((d) => d.deadline?.startsWith(dateStr)),
      tasks: taskDueDates.filter((t) => t.due_date === dateStr),
      events: events.filter((e) => e.event_date === dateStr),
    };
  }

  const monthName = new Date(year, month - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  async function handleAddEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDay || !eventForm.title.trim()) return;
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
    await createEvent({ ...eventForm, event_date: dateStr });
    setShowAddEvent(false);
    setEventForm({ title: "", event_type: "personal", notes: "" });
  }

  const dayItems = selectedDay ? getDayItems(selectedDay) : null;

  return (
    <Card padding="md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-xl font-semibold text-text-primary">{monthName}</h3>
        <div className="flex items-center gap-1">
          <button onClick={goPrev} className="p-1.5 rounded-lg hover:bg-[#f0ede8] transition-colors">
            <ChevronLeft className="w-4 h-4 text-text-secondary" />
          </button>
          <button onClick={goNext} className="p-1.5 rounded-lg hover:bg-[#f0ede8] transition-colors">
            <ChevronRight className="w-4 h-4 text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium uppercase tracking-wider text-text-muted py-1.5">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} className="h-16" />;
          const dots = getDotsForDay(day);
          const selected = selectedDay === day;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(selected ? null : day)}
              className={`h-16 rounded-lg flex flex-col items-center pt-1.5 transition-colors ${
                selected ? "bg-accent-primary/10 ring-1 ring-accent-primary" :
                isToday(day) ? "bg-[#fdf4f0]" : "hover:bg-[#faf8f5]"
              }`}
            >
              <span className={`text-sm font-medium ${
                isToday(day) ? "text-accent-primary font-bold" : "text-text-primary"
              }`}>{day}</span>
              {dots.length > 0 && (
                <div className="flex gap-0.5 mt-1">
                  {dots.slice(0, 3).map((color, j) => (
                    <span key={j} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Day detail */}
      {selectedDay && dayItems && (
        <div className="mt-4 pt-4 border-t border-card-border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-display text-sm font-semibold text-text-primary">
              {new Date(year, month - 1, selectedDay).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </h4>
            <Button variant="secondary" size="sm" onClick={() => setShowAddEvent(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Event
            </Button>
          </div>
          <div className="space-y-2">
            {dayItems.deals.map((d) => (
              <div key={d.id} className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-accent-primary" />
                <span className="text-text-primary">{d.brand_name}</span>
                <span className="text-text-muted text-xs">Deal deadline</span>
              </div>
            ))}
            {dayItems.tasks.map((t) => (
              <div key={t.id} className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className={t.is_completed ? "line-through text-text-muted" : "text-text-primary"}>{t.title}</span>
              </div>
            ))}
            {dayItems.events.map((e) => (
              <div key={e.id} className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: EVENT_TYPE_CONFIG[e.event_type]?.color || "#a09a90" }} />
                <span className="text-text-primary">{e.title}</span>
                {e.event_time && <span className="text-text-muted text-xs">{e.event_time}</span>}
              </div>
            ))}
            {dayItems.deals.length === 0 && dayItems.tasks.length === 0 && dayItems.events.length === 0 && (
              <p className="text-xs text-text-muted italic">No items for this day.</p>
            )}
          </div>
        </div>
      )}

      {/* Add event modal */}
      <Modal open={showAddEvent} onClose={() => setShowAddEvent(false)} title="Add Event" size="sm">
        <form onSubmit={handleAddEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Title</label>
            <input value={eventForm.title} onChange={(e) => setEventForm((f) => ({ ...f, title: e.target.value }))} required
              className="w-full h-9 px-3 text-sm rounded-lg border border-card-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/40" />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Type</label>
            <select value={eventForm.event_type} onChange={(e) => setEventForm((f) => ({ ...f, event_type: e.target.value as EventType }))}
              className="w-full h-9 px-3 text-sm rounded-lg border border-card-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/40">
              {Object.entries(EVENT_TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Notes</label>
            <textarea value={eventForm.notes} onChange={(e) => setEventForm((f) => ({ ...f, notes: e.target.value }))} rows={2}
              className="w-full px-3 py-2 text-sm rounded-lg border border-card-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/40 resize-none" />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setShowAddEvent(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm" disabled={!eventForm.title.trim()}>Save</Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}
