"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DEAL_STAGE_CONFIG, PAYMENT_STATUS_CONFIG } from "@/lib/constants";
import { ArrowUpDown } from "lucide-react";
import type { BrandDeal } from "@/types";

function formatCurrency(n: number) { return `$${n.toLocaleString()}`; }

type SortKey = "brand_name" | "deal_value" | "status" | "deadline" | "payment_status";

interface Props {
  deals: BrandDeal[];
  onCardClick: (id: string) => void;
}

export function DealTableView({ deals, onCardClick }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("deal_value");
  const [sortAsc, setSortAsc] = useState(false);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  }

  const sorted = [...deals].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "deal_value") cmp = a.deal_value - b.deal_value;
    else if (sortKey === "deadline") cmp = (a.deadline || "").localeCompare(b.deadline || "");
    else cmp = String(a[sortKey] || "").localeCompare(String(b[sortKey] || ""));
    return sortAsc ? cmp : -cmp;
  });

  const headerClass = "text-[10px] font-body uppercase tracking-widest text-text-secondary cursor-pointer hover:text-text-primary transition-colors select-none";

  return (
    <Card padding="none">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-card-border">
              {[
                { key: "brand_name" as SortKey, label: "Brand" },
                { key: "deal_value" as SortKey, label: "Value" },
                { key: "status" as SortKey, label: "Stage" },
                { key: "payment_status" as SortKey, label: "Payment" },
                { key: "deadline" as SortKey, label: "Deadline" },
              ].map(({ key, label }) => (
                <th key={key} className="px-4 py-3 text-left" onClick={() => toggleSort(key)}>
                  <span className={`${headerClass} inline-flex items-center gap-1`}>
                    {label} <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
              ))}
              <th className={`px-4 py-3 text-left ${headerClass}`}>Platform</th>
              <th className={`px-4 py-3 text-left ${headerClass}`}>Contact</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((deal) => {
              const stage = DEAL_STAGE_CONFIG[deal.status];
              const pay = PAYMENT_STATUS_CONFIG[deal.payment_status];
              return (
                <tr
                  key={deal.id}
                  onClick={() => onCardClick(deal.id)}
                  className="border-b border-card-border last:border-b-0 hover:bg-[#faf8f5] transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <span className="text-sm font-semibold text-text-primary">{deal.brand_name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-display font-bold text-text-primary">{formatCurrency(deal.deal_value)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-medium rounded-full px-2.5 py-1"
                      style={{ backgroundColor: stage?.bg, color: stage?.color }}>
                      {stage?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-medium rounded-full px-2.5 py-1"
                      style={{ backgroundColor: pay?.bg, color: pay?.color }}>
                      {pay?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {deal.deadline
                      ? new Date(deal.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {deal.platforms?.map((p) => (
                        <Badge key={p} variant="platform" size="sm">{p}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{deal.contact_person || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
