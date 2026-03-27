"use client";

import { useState } from "react";
import { SlidePanel } from "@/components/ui/SlidePanel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { DEAL_STAGE_CONFIG, PAYMENT_STATUS_CONFIG, DEAL_TYPE_LABELS } from "@/lib/constants";
import { useDealDetail } from "@/lib/hooks/useDealDetail";
import { Calendar, DollarSign, User, Mail, Trash2, Check, Plus, Send } from "lucide-react";

function formatCurrency(n: number) { return `$${n.toLocaleString()}`; }
function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

interface Props {
  dealId: string | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export function DealDetailPanel({ dealId, onClose, onDelete }: Props) {
  const { deal, notes, checklist, loading, addNote, addChecklistItem, toggleChecklistItem, deleteChecklistItem, updateDeal } = useDealDetail(dealId);
  const [noteText, setNoteText] = useState("");
  const [newItem, setNewItem] = useState("");

  if (!dealId) return null;

  async function handleAddNote() {
    if (!noteText.trim()) return;
    await addNote(noteText.trim());
    setNoteText("");
  }

  async function handleAddItem() {
    if (!newItem.trim()) return;
    await addChecklistItem(newItem.trim());
    setNewItem("");
  }

  const stageConfig = deal ? DEAL_STAGE_CONFIG[deal.status] : null;
  const payConfig = deal ? PAYMENT_STATUS_CONFIG[deal.payment_status] : null;

  return (
    <SlidePanel open={!!dealId} onClose={onClose} title={deal?.brand_name || "Deal"}>
      {loading || !deal ? (
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-[#f0ede8] rounded w-1/3" />
          <div className="h-4 bg-[#f0ede8] rounded w-2/3" />
          <div className="h-4 bg-[#f0ede8] rounded w-1/2" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Info + Notes (3/5) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Description */}
            {deal.description && (
              <div>
                <h4 className="text-xs font-medium uppercase tracking-wider text-text-secondary mb-2">Description</h4>
                <p className="text-sm text-text-primary font-body leading-relaxed">{deal.description}</p>
              </div>
            )}

            {/* Notes Timeline */}
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-text-secondary mb-3">Notes</h4>
              <div className="space-y-3 mb-4">
                {notes.map((note) => (
                  <div key={note.id} className="bg-[#faf8f5] rounded-lg p-3">
                    <p className="text-sm text-text-primary font-body">{note.content}</p>
                    <p className="text-[10px] text-text-muted mt-1.5">{timeAgo(note.created_at)}</p>
                  </div>
                ))}
                {notes.length === 0 && (
                  <p className="text-xs text-text-muted italic">No notes yet. Add your first note below.</p>
                )}
              </div>
              <div className="flex gap-2">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a note..."
                  rows={2}
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-card-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/40 resize-none"
                />
                <Button variant="primary" size="sm" onClick={handleAddNote} disabled={!noteText.trim()} className="self-end">
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Right: Status + Details (2/5) */}
          <div className="lg:col-span-2 space-y-5">
            {/* Status */}
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-text-secondary mb-2">Status</h4>
              <select
                value={deal.status}
                onChange={(e) => updateDeal({ status: e.target.value as typeof deal.status })}
                className="w-full h-9 px-3 text-sm rounded-lg border-2 font-medium focus:outline-none"
                style={{ borderColor: stageConfig?.color, color: stageConfig?.color }}
              >
                {Object.entries(DEAL_STAGE_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>

            {/* Payment */}
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-text-secondary mb-2">Payment</h4>
              <div className="bg-[#faf8f5] rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Deal Value</span>
                  <span className="font-semibold text-text-primary">{formatCurrency(deal.deal_value)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Received</span>
                  <span className="font-semibold text-success">{formatCurrency(deal.payment_received)}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#e8e6e1] mt-1">
                  <div
                    className="h-full rounded-full bg-accent-primary transition-all"
                    style={{ width: `${Math.min(100, (deal.payment_received / Math.max(deal.deal_value, 1)) * 100)}%` }}
                  />
                </div>
                <select
                  value={deal.payment_status}
                  onChange={(e) => updateDeal({ payment_status: e.target.value as typeof deal.payment_status })}
                  className="w-full h-8 px-2 text-xs rounded border border-card-border bg-white mt-1"
                >
                  {Object.entries(PAYMENT_STATUS_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2.5">
              {deal.contact_person && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-3.5 h-3.5 text-text-muted" />
                  <span className="text-text-primary">{deal.contact_person}</span>
                </div>
              )}
              {deal.contact_email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-3.5 h-3.5 text-text-muted" />
                  <span className="text-text-secondary">{deal.contact_email}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-3.5 h-3.5 text-text-muted" />
                <span className="text-text-secondary">Deadline: {formatDate(deal.deadline)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-3.5 h-3.5 text-text-muted" />
                <span className="text-text-secondary">{DEAL_TYPE_LABELS[deal.deal_type] || deal.deal_type}</span>
              </div>
              {deal.platforms?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {deal.platforms.map((p) => (
                    <Badge key={p} variant="platform" size="sm">
                      <PlatformIcon platform={p as import("@/types").Platform} size={12} showBackground={false} className="mr-1" />{p}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Checklist */}
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-text-secondary mb-2">Deliverables</h4>
              <div className="space-y-1.5">
                {checklist.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 group">
                    <button
                      onClick={() => toggleChecklistItem(item.id, !item.completed)}
                      className={`w-4.5 h-4.5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        item.completed ? "bg-accent-primary border-accent-primary" : "border-card-border hover:border-accent-primary"
                      }`}
                    >
                      {item.completed && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <span className={`text-sm flex-1 ${item.completed ? "line-through text-text-muted" : "text-text-primary"}`}>
                      {item.label}
                    </span>
                    <button onClick={() => deleteChecklistItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-danger transition-opacity">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                  placeholder="Add item..."
                  className="flex-1 h-8 px-2 text-xs rounded border border-card-border bg-white focus:outline-none focus:ring-1 focus:ring-accent-primary/40"
                />
                <button onClick={handleAddItem} className="text-accent-primary hover:text-accent-primary/80">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Delete */}
            <Button variant="danger" size="sm" className="w-full" onClick={() => { onDelete(deal.id); onClose(); }}>
              <Trash2 className="w-3.5 h-3.5 mr-2" />Delete Deal
            </Button>
          </div>
        </div>
      )}
    </SlidePanel>
  );
}
