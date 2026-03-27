"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTasks } from "@/lib/hooks/useTasks";
import { TASK_PRIORITY_CONFIG } from "@/lib/constants";
import { Check, Trash2, ChevronDown, ChevronRight, Plus } from "lucide-react";
import type { Task, TaskPriority, TaskCategory } from "@/types";

function TaskItem({ task, onToggle, onDelete }: { task: Task; onToggle: () => void; onDelete: () => void }) {
  const priorityCfg = TASK_PRIORITY_CONFIG[task.priority] || TASK_PRIORITY_CONFIG.normal;
  return (
    <div className="flex items-center gap-2.5 py-1.5 group">
      <button
        onClick={onToggle}
        className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
          task.is_completed ? "bg-accent-primary border-accent-primary" : "border-card-border hover:border-accent-primary"
        }`}
      >
        {task.is_completed && <Check className="w-3 h-3 text-white" />}
      </button>
      <div className="flex-1 min-w-0">
        <span className={`text-sm ${task.is_completed ? "line-through text-text-muted" : "text-text-primary"}`}>
          {task.title}
        </span>
      </div>
      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: priorityCfg.color }} />
      {task.due_date && (
        <span className="text-[10px] text-text-muted shrink-0">
          {new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
      )}
      <button onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-danger transition-opacity shrink-0">
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}

function TaskGroup({ title, tasks, onToggle, onDelete }: {
  title: string; tasks: Task[];
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}) {
  if (tasks.length === 0) return null;
  return (
    <div className="mb-4">
      <h4 className="text-[10px] font-medium uppercase tracking-wider text-text-secondary mb-1.5">{title}</h4>
      {tasks.map((t) => (
        <TaskItem key={t.id} task={t} onToggle={() => onToggle(t.id, !t.is_completed)} onDelete={() => onDelete(t.id)} />
      ))}
    </div>
  );
}

export function TaskList() {
  const { grouped, loading, createTask, updateTask, deleteTask, clearCompleted } = useTasks();
  const [input, setInput] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);

  async function handleAdd() {
    if (!input.trim()) return;
    await createTask({ title: input.trim() });
    setInput("");
  }

  function handleToggle(id: string, completed: boolean) {
    updateTask(id, { is_completed: completed });
  }

  return (
    <div className="space-y-3">
      {/* Add task input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add a task..."
          className="flex-1 h-9 px-3 text-sm rounded-lg border border-card-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/40"
        />
        <Button variant="primary" size="sm" onClick={handleAdd} disabled={!input.trim()}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Task groups */}
      <Card padding="md">
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-4 bg-[#f0ede8] rounded w-3/4" />)}
          </div>
        ) : (
          <>
            <TaskGroup title="Today" tasks={grouped.today} onToggle={handleToggle} onDelete={deleteTask} />
            <TaskGroup title="This Week" tasks={grouped.thisWeek} onToggle={handleToggle} onDelete={deleteTask} />
            <TaskGroup title="Upcoming" tasks={grouped.upcoming} onToggle={handleToggle} onDelete={deleteTask} />

            {grouped.completed.length > 0 && (
              <div>
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-text-muted hover:text-text-secondary mb-1.5"
                >
                  {showCompleted ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  Completed ({grouped.completed.length})
                </button>
                {showCompleted && (
                  <>
                    {grouped.completed.map((t) => (
                      <TaskItem key={t.id} task={t} onToggle={() => handleToggle(t.id, false)} onDelete={() => deleteTask(t.id)} />
                    ))}
                    <button onClick={clearCompleted}
                      className="text-[10px] text-text-muted hover:text-danger mt-1">
                      Clear completed
                    </button>
                  </>
                )}
              </div>
            )}

            {grouped.today.length === 0 && grouped.thisWeek.length === 0 && grouped.upcoming.length === 0 && grouped.completed.length === 0 && (
              <p className="text-sm text-text-muted text-center py-4 italic">No tasks yet. Add one above.</p>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
