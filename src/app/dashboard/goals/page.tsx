"use client";

import { useState } from "react";
import { useGoals } from "@/lib/hooks/useGoals";
import { UpgradeGate } from "@/components/ui/UpgradeGate";
import { GoalGrid } from "./_components/GoalGrid";
import { AddGoalModal } from "./_components/AddGoalModal";
import { JournalSection } from "./_components/JournalSection";
import { TaskList } from "./_components/TaskList";
import { CalendarGrid } from "./_components/CalendarGrid";
import { Target, BookOpen, CheckSquare, Calendar } from "lucide-react";
import type { Goal } from "@/types";

export default function GoalsPage() {
  return (
    <UpgradeGate feature="Goals & task management">
      <GoalsPageContent />
    </UpgradeGate>
  );
}

function GoalsPageContent() {
  const { goals, loading, createGoal, updateGoal, deleteGoal } = useGoals();
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  function handleEditGoal(goal: Goal) {
    setEditingGoal(goal);
    setShowGoalModal(true);
  }

  async function handleSaveGoal(data: Partial<Goal>) {
    if (editingGoal) {
      await updateGoal(editingGoal.id, data);
    } else {
      await createGoal(data);
    }
    setEditingGoal(null);
  }

  return (
    <div className="space-y-10">
      {/* Section 1: Goals */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <Target className="w-5 h-5 text-accent-primary" />
          <h2 className="font-display text-2xl font-bold text-text-primary">Goals</h2>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-card-border bg-white p-5 animate-pulse">
                <div className="h-4 bg-[#f0ede8] rounded w-1/3 mb-3" />
                <div className="h-5 bg-[#f0ede8] rounded w-2/3 mb-2" />
                <div className="h-2 bg-[#f0ede8] rounded w-full mt-4" />
              </div>
            ))}
          </div>
        ) : (
          <GoalGrid
            goals={goals}
            onEdit={handleEditGoal}
            onAdd={() => { setEditingGoal(null); setShowGoalModal(true); }}
          />
        )}
      </section>

      {/* Section 2: Journal + Tasks */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Journal (3/5) */}
        <div className="lg:col-span-3">
          <div className="flex items-center gap-3 mb-5">
            <BookOpen className="w-5 h-5 text-accent-primary" />
            <h2 className="font-display text-2xl font-bold text-text-primary">Journal</h2>
          </div>
          <JournalSection />
        </div>

        {/* Tasks (2/5) */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-5">
            <CheckSquare className="w-5 h-5 text-accent-primary" />
            <h2 className="font-display text-2xl font-bold text-text-primary">To Do</h2>
          </div>
          <TaskList />
        </div>
      </section>

      {/* Section 3: Calendar */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <Calendar className="w-5 h-5 text-accent-primary" />
          <h2 className="font-display text-2xl font-bold text-text-primary">Calendar</h2>
        </div>
        <CalendarGrid />
      </section>

      {/* Goal Modal */}
      <AddGoalModal
        open={showGoalModal}
        onClose={() => { setShowGoalModal(false); setEditingGoal(null); }}
        onSave={handleSaveGoal}
        editGoal={editingGoal}
      />
    </div>
  );
}
