"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { Goal, GoalCategory } from "@/types";

const CATEGORIES: GoalCategory[] = ["growth", "revenue", "content", "personal", "brand"];

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Goal>) => Promise<void>;
  editGoal?: Goal | null;
}

export function AddGoalModal({ open, onClose, onSave, editGoal }: Props) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", category: "personal" as GoalCategory,
    target_value: "100", current_value: "0", unit: "%", deadline: "", why: "",
  });

  useEffect(() => {
    if (editGoal) {
      setForm({
        title: editGoal.title, description: editGoal.description || "",
        category: editGoal.category, target_value: String(editGoal.target_value),
        current_value: String(editGoal.current_value), unit: editGoal.unit,
        deadline: editGoal.deadline || "", why: editGoal.why || "",
      });
    } else {
      setForm({ title: "", description: "", category: "personal", target_value: "100", current_value: "0", unit: "%", deadline: "", why: "" });
    }
  }, [editGoal, open]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave({
      ...form,
      target_value: parseFloat(form.target_value) || 100,
      current_value: parseFloat(form.current_value) || 0,
      deadline: form.deadline || null,
    } as Partial<Goal>);
    setSaving(false);
    onClose();
  }

  const inputClass = "w-full h-9 px-3 text-sm rounded-lg border border-card-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/40";

  return (
    <Modal open={open} onClose={onClose} title={editGoal ? "Edit Goal" : "Set New Goal"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">Goal Title *</label>
          <input name="title" value={form.title} onChange={handleChange} required className={inputClass}
            placeholder="e.g. Hit 100K Instagram followers" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Category</label>
            <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Target Date</label>
            <input name="deadline" type="date" value={form.deadline} onChange={handleChange} className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Target</label>
            <input name="target_value" type="number" value={form.target_value} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Current</label>
            <input name="current_value" type="number" value={form.current_value} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Unit</label>
            <input name="unit" value={form.unit} onChange={handleChange} className={inputClass} placeholder="%, followers, $" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={2}
            className="w-full px-3 py-2 text-sm rounded-lg border border-card-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/40 resize-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">Why this matters to me</label>
          <textarea name="why" value={form.why} onChange={handleChange} rows={2}
            className="w-full px-3 py-2 text-sm rounded-lg border border-card-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/40 resize-none"
            placeholder="Motivate your future self..." />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" size="sm" disabled={saving || !form.title}>
            {saving ? "Saving..." : editGoal ? "Update Goal" : "Create Goal"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
