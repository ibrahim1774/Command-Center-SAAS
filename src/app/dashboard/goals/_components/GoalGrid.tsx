"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { GOAL_CATEGORY_CONFIG } from "@/lib/constants";
import { Plus, Target } from "lucide-react";
import type { Goal } from "@/types";

interface Props {
  goals: Goal[];
  onEdit: (goal: Goal) => void;
  onAdd: () => void;
}

function GoalCard({ goal, onClick }: { goal: Goal; onClick: () => void }) {
  const pct = goal.target_value > 0 ? Math.round((goal.current_value / goal.target_value) * 100) : 0;
  const catConfig = GOAL_CATEGORY_CONFIG[goal.category] || GOAL_CATEGORY_CONFIG.personal;

  // Status based on deadline and progress
  let statusLabel = "On Track";
  let statusColor = "text-success";
  if (goal.deadline) {
    const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86400000);
    const expectedPct = goal.target_value > 0 ? Math.max(0, 100 - (daysLeft / 30) * 100) : 0;
    if (pct < expectedPct - 20) { statusLabel = "At Risk"; statusColor = "text-danger"; }
    else if (pct < expectedPct - 5) { statusLabel = "Behind"; statusColor = "text-amber-600"; }
  }

  return (
    <Card padding="md" className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-accent-primary" />
          <Badge size="sm" style={{ backgroundColor: catConfig.bg, color: catConfig.color }}>
            {catConfig.label}
          </Badge>
        </div>
        <span className={`text-xs font-medium ${statusColor}`}>{statusLabel}</span>
      </div>
      <h3 className="font-display text-base font-semibold text-text-primary mb-2">{goal.title}</h3>
      {goal.description && (
        <p className="text-xs text-text-secondary mb-3 line-clamp-2">{goal.description}</p>
      )}
      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-text-secondary">{goal.current_value.toLocaleString()} / {goal.target_value.toLocaleString()} {goal.unit}</span>
          <span className="font-semibold text-text-primary">{pct}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#f0ede8]">
          <div className="h-full rounded-full bg-accent-primary transition-all" style={{ width: `${Math.min(100, pct)}%` }} />
        </div>
      </div>
      {goal.deadline && (
        <p className="text-[10px] text-text-muted mt-2">
          Target: {new Date(goal.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
      )}
    </Card>
  );
}

export function GoalGrid({ goals, onEdit, onAdd }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {goals.map((goal) => (
        <GoalCard key={goal.id} goal={goal} onClick={() => onEdit(goal)} />
      ))}
      <button
        onClick={onAdd}
        className="rounded-xl border-2 border-dashed border-card-border hover:border-accent-primary min-h-[160px] flex flex-col items-center justify-center gap-2 transition-colors group"
      >
        <div className="p-2 rounded-full bg-[#f0ede8] group-hover:bg-accent-primary/10 transition-colors">
          <Plus className="w-5 h-5 text-text-secondary group-hover:text-accent-primary" />
        </div>
        <span className="text-sm text-text-secondary group-hover:text-accent-primary font-medium">Set New Goal</span>
      </button>
    </div>
  );
}
