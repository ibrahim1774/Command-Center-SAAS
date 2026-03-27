"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/Badge";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { PAYMENT_STATUS_CONFIG } from "@/lib/constants";
import { Clock } from "lucide-react";
import type { BrandDeal } from "@/types";

function formatCurrency(n: number) {
  return `$${n.toLocaleString()}`;
}

function deadlineText(deadline: string | null): { text: string; urgent: boolean; overdue: boolean } | null {
  if (!deadline) return null;
  const diff = new Date(deadline).getTime() - Date.now();
  const days = Math.ceil(diff / 86400000);
  if (days < 0) return { text: "Overdue", urgent: false, overdue: true };
  if (days === 0) return { text: "Today", urgent: true, overdue: false };
  if (days <= 3) return { text: `${days}d left`, urgent: true, overdue: false };
  if (days <= 7) return { text: `${days}d left`, urgent: false, overdue: false };
  return { text: new Date(deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" }), urgent: false, overdue: false };
}

interface Props {
  deal: BrandDeal;
  onClick: () => void;
  overlay?: boolean;
}

export function DealKanbanCard({ deal, onClick, overlay }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: deal.id,
    data: { deal },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const dl = deadlineText(deal.deadline);
  const payConfig = PAYMENT_STATUS_CONFIG[deal.payment_status] || PAYMENT_STATUS_CONFIG.unpaid;

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={overlay ? undefined : style}
      {...(overlay ? {} : { ...attributes, ...listeners })}
      onClick={onClick}
      className="bg-white border border-card-border rounded-lg p-4 hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-shadow cursor-pointer"
    >
      {/* Brand + Contact Avatar */}
      <div className="flex items-start gap-2.5">
        <div className="h-8 w-8 rounded-full bg-[#f0ede8] flex items-center justify-center text-xs font-bold text-text-secondary shrink-0">
          {deal.brand_name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-body font-semibold text-text-primary text-sm truncate">
            {deal.brand_name}
          </p>
          {deal.contact_person && (
            <p className="text-[10px] text-text-muted font-body">{deal.contact_person}</p>
          )}
        </div>
      </div>

      {/* Value */}
      <p className="font-display font-bold text-lg text-text-primary mt-2">
        {formatCurrency(deal.deal_value)}
      </p>

      {/* Description */}
      {deal.description && (
        <p className="font-body text-xs text-text-secondary mt-1 line-clamp-2">
          {deal.description}
        </p>
      )}

      {/* Platform tags */}
      {deal.platforms && deal.platforms.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {deal.platforms.map((p) => (
            <span key={p} className="inline-flex items-center gap-1 text-[10px] font-medium text-text-secondary bg-[#f0ede8] rounded-full px-2 py-0.5">
              <PlatformIcon platform={p as import("@/types").Platform} size={10} showBackground={false} />
              {p}
            </span>
          ))}
        </div>
      )}

      {/* Footer: deadline + payment */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#f0ede8]">
        {dl ? (
          <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${
            dl.overdue ? "text-danger" : dl.urgent ? "text-amber-600" : "text-text-secondary"
          }`}>
            <Clock className="w-3 h-3" />
            {dl.text}
          </span>
        ) : (
          <span />
        )}
        <span
          className="text-[10px] font-medium rounded-full px-2 py-0.5"
          style={{ backgroundColor: payConfig.bg, color: payConfig.color }}
        >
          {payConfig.label}
        </span>
      </div>
    </div>
  );
}
