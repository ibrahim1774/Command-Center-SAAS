"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { DEAL_TYPE_LABELS } from "@/lib/constants";
import type { BrandDeal } from "@/types";

const PLATFORMS = ["instagram", "youtube", "tiktok", "facebook", "linkedin"] as const;
const STAGES = ["inquiry", "negotiating", "confirmed", "in-progress", "completed"] as const;
const PAYMENT_STATUSES = ["unpaid", "invoiced", "paid"] as const;

interface AddDealModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<BrandDeal>) => Promise<BrandDeal | null>;
}

export function AddDealModal({ open, onClose, onSave }: AddDealModalProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    brand_name: "",
    contact_person: "",
    contact_email: "",
    deal_value: "",
    platforms: [] as string[],
    deal_type: "other",
    description: "",
    deadline: "",
    status: "inquiry",
    payment_status: "unpaid",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function togglePlatform(p: string) {
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(p)
        ? f.platforms.filter((x) => x !== p)
        : [...f.platforms, p],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave({
      ...form,
      deal_value: parseFloat(form.deal_value) || 0,
      deadline: form.deadline || null,
    } as Partial<BrandDeal>);
    setSaving(false);
    setForm({
      brand_name: "", contact_person: "", contact_email: "", deal_value: "",
      platforms: [], deal_type: "other", description: "", deadline: "",
      status: "inquiry", payment_status: "unpaid",
    });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Add New Deal" size="xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Brand Name *</label>
            <input name="brand_name" value={form.brand_name} onChange={handleChange} required
              className="w-full h-9 px-3 text-sm rounded-lg border border-card-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/40" />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Deal Value ($)</label>
            <input name="deal_value" value={form.deal_value} onChange={handleChange} type="number" min="0" step="0.01"
              className="w-full h-9 px-3 text-sm rounded-lg border border-card-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/40" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Contact Person</label>
            <input name="contact_person" value={form.contact_person} onChange={handleChange}
              className="w-full h-9 px-3 text-sm rounded-lg border border-card-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/40" />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Contact Email</label>
            <input name="contact_email" value={form.contact_email} onChange={handleChange} type="email"
              className="w-full h-9 px-3 text-sm rounded-lg border border-card-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/40" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-2">Platforms</label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button key={p} type="button" onClick={() => togglePlatform(p)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  form.platforms.includes(p)
                    ? "border-accent-primary bg-accent-primary/10 text-accent-primary"
                    : "border-card-border bg-white text-text-secondary hover:bg-[#f8f7f4]"
                }`}>
                <PlatformIcon platform={p} size={14} showBackground={false} />
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Deal Type</label>
            <select name="deal_type" value={form.deal_type} onChange={handleChange}
              className="w-full h-9 px-3 text-sm rounded-lg border border-card-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/40">
              {Object.entries(DEAL_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Status</label>
            <select name="status" value={form.status} onChange={handleChange}
              className="w-full h-9 px-3 text-sm rounded-lg border border-card-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/40">
              {STAGES.map((s) => (
                <option key={s} value={s}>{s.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Payment</label>
            <select name="payment_status" value={form.payment_status} onChange={handleChange}
              className="w-full h-9 px-3 text-sm rounded-lg border border-card-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/40">
              {PAYMENT_STATUSES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">Deadline</label>
          <input name="deadline" value={form.deadline} onChange={handleChange} type="date"
            className="w-full h-9 px-3 text-sm rounded-lg border border-card-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/40" />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3}
            className="w-full px-3 py-2 text-sm rounded-lg border border-card-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/40 resize-none"
            placeholder="What does this deal involve? Deliverables, timeline, etc." />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" size="sm" disabled={saving || !form.brand_name}>
            {saving ? "Saving..." : "Create Deal"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
