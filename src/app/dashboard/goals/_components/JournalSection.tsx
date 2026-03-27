"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MOOD_CONFIG } from "@/lib/constants";
import { useJournal } from "@/lib/hooks/useJournal";
import { Smile, SmilePlus, Meh, Frown, CloudRain, ChevronDown, Trash2 } from "lucide-react";
import type { MoodType } from "@/types";

const MOOD_ICONS: Record<string, React.ElementType> = {
  amazing: Smile, good: SmilePlus, okay: Meh, tough: Frown, rough: CloudRain,
};

export function JournalSection() {
  const { entries, loading, createEntry, deleteEntry, loadMore, total } = useJournal();
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<MoodType | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  async function handleSave() {
    if (!content.trim()) return;
    const tags = tagInput.split(",").map((t) => t.trim()).filter(Boolean);
    await createEntry({ content: content.trim(), mood, tags });
    setContent("");
    setMood(null);
    setTagInput("");
  }

  return (
    <div className="space-y-4">
      {/* Today's date */}
      <p className="font-display text-base text-text-secondary italic">{today}</p>

      {/* Input */}
      <Card padding="md" className="space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind today?"
          rows={4}
          className="w-full px-0 py-0 text-sm rounded-none border-0 bg-transparent text-text-primary focus:outline-none resize-none font-body leading-relaxed placeholder:text-text-muted"
        />

        {/* Mood selector */}
        <div className="flex items-center gap-1.5">
          {Object.entries(MOOD_CONFIG).map(([key, cfg]) => {
            const Icon = MOOD_ICONS[key];
            const selected = mood === key;
            return (
              <button
                key={key}
                onClick={() => setMood(selected ? null : key as MoodType)}
                className={`p-1.5 rounded-lg transition-all ${
                  selected
                    ? "bg-accent-primary/10 scale-110"
                    : "hover:bg-[#f0ede8]"
                }`}
                title={cfg.label}
              >
                <Icon className="w-5 h-5" style={{ color: selected ? cfg.color : "#a09a90" }} />
              </button>
            );
          })}
        </div>

        {/* Tags */}
        <input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          placeholder="Tags (comma separated): #grateful, #content-ideas"
          className="w-full h-8 px-0 text-xs border-0 bg-transparent text-text-secondary focus:outline-none placeholder:text-text-muted"
        />

        <div className="flex justify-end">
          <Button variant="primary" size="sm" onClick={handleSave} disabled={!content.trim()}>
            Save Entry
          </Button>
        </div>
      </Card>

      {/* Previous entries */}
      <div className="space-y-3">
        {entries.map((entry) => {
          const isExpanded = expanded.has(entry.id);
          const moodCfg = entry.mood ? MOOD_CONFIG[entry.mood] : null;
          const MoodIcon = entry.mood ? MOOD_ICONS[entry.mood] : null;

          return (
            <Card key={entry.id} padding="md" className="group">
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-text-secondary">
                    {new Date(entry.entry_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  {MoodIcon && moodCfg && (
                    <MoodIcon className="w-3.5 h-3.5" style={{ color: moodCfg.color }} />
                  )}
                </div>
                <button onClick={() => deleteEntry(entry.id)}
                  className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-danger transition-opacity">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <p className={`text-sm text-text-primary font-body leading-relaxed ${!isExpanded ? "line-clamp-3" : ""}`}>
                {entry.content}
              </p>
              {entry.content.length > 200 && (
                <button
                  onClick={() => setExpanded((s) => { const n = new Set(s); isExpanded ? n.delete(entry.id) : n.add(entry.id); return n; })}
                  className="text-xs text-accent-primary font-medium mt-1 hover:underline"
                >
                  {isExpanded ? "Show less" : "Read more"}
                </button>
              )}
              {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {entry.tags.map((tag) => (
                    <Badge key={tag} variant="neutral" size="sm">#{tag}</Badge>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {entries.length < total && (
        <button onClick={loadMore} className="flex items-center gap-1 text-xs text-accent-primary font-medium mx-auto hover:underline">
          <ChevronDown className="w-3.5 h-3.5" /> Load more
        </button>
      )}
    </div>
  );
}
