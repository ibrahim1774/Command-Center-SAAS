"use client";

import { useState } from "react";
import { useDeals } from "@/lib/hooks/useDeals";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DealKanbanBoard } from "./_components/DealKanbanBoard";
import { DealTableView } from "./_components/DealTableView";
import { DealDetailPanel } from "./_components/DealDetailPanel";
import { AddDealModal } from "./_components/AddDealModal";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  DollarSign, Clock, CheckCircle, TrendingUp,
  Plus, LayoutGrid, Table2, Loader2,
} from "lucide-react";

function formatCurrency(n: number) { return `$${n.toLocaleString()}`; }
function formatYAxis(v: number) { return v >= 1000 ? `$${v / 1000}K` : `$${v}`; }

export default function DealsPage() {
  const { deals, metrics, loading, createDeal, updateDealStatus, deleteDeal } = useDeals();
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const metricCards = [
    { label: "Active Deals", value: String(metrics?.activeDeals ?? 0), icon: TrendingUp, color: "text-text-primary" },
    { label: "Pipeline Value", value: formatCurrency(metrics?.pipelineValue ?? 0), icon: DollarSign, color: "text-text-primary" },
    { label: "Pending Payouts", value: formatCurrency(metrics?.pendingPayouts ?? 0), icon: Clock, color: "text-amber-600" },
    { label: "Earned This Month", value: formatCurrency(metrics?.earnedThisMonth ?? 0), icon: CheckCircle, color: "text-success" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-text-primary">Brand Deals</h1>
        <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add New Deal
        </Button>
      </div>

      {/* Row 1: Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((m) => (
          <Card key={m.label} padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-body uppercase tracking-widest text-text-secondary mb-1">
                  {m.label}
                </p>
                <p className={`text-2xl font-display font-bold ${m.color}`}>{m.value}</p>
              </div>
              <div className="p-2 rounded-lg bg-[#f0ede8]">
                <m.icon className="w-4 h-4 text-text-secondary" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-2">
        <h2 className="font-display text-xl font-semibold text-text-primary flex-1">Deal Pipeline</h2>
        <div className="flex rounded-lg border border-card-border overflow-hidden">
          <button
            onClick={() => setViewMode("kanban")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
              viewMode === "kanban" ? "bg-accent-primary text-white" : "bg-white text-text-secondary hover:bg-[#f8f7f4]"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Kanban
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
              viewMode === "table" ? "bg-accent-primary text-white" : "bg-white text-text-secondary hover:bg-[#f8f7f4]"
            }`}
          >
            <Table2 className="w-3.5 h-3.5" /> Table
          </button>
        </div>
      </div>

      {/* Kanban or Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-accent-primary" />
        </div>
      ) : viewMode === "kanban" ? (
        <DealKanbanBoard
          deals={deals}
          onStatusChange={updateDealStatus}
          onCardClick={setSelectedDealId}
        />
      ) : (
        <DealTableView deals={deals} onCardClick={setSelectedDealId} />
      )}

      {/* Monthly Earnings Chart */}
      {metrics?.monthlyEarnings && metrics.monthlyEarnings.some((m) => m.amount > 0) && (
        <Card padding="md">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="font-display text-xl font-semibold text-text-primary">Monthly Earnings</h2>
            <span className="font-body text-xs text-text-secondary">Last 6 months</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.monthlyEarnings} margin={{ top: 5, right: 5, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e6e1" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false}
                  tick={{ fontSize: 12, fill: "#6b6b6b", fontFamily: "DM Sans" }} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={formatYAxis}
                  tick={{ fontSize: 12, fill: "#6b6b6b", fontFamily: "DM Sans" }} />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value)), "Earnings"]}
                  contentStyle={{
                    backgroundColor: "#ffffff", border: "1px solid #e8e6e1",
                    borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    fontFamily: "DM Sans", fontSize: "13px",
                  }}
                  cursor={{ fill: "rgba(196,148,122,0.08)" }}
                />
                <Bar dataKey="amount" fill="#c4947a" radius={[6, 6, 0, 0]} maxBarSize={56} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Modals / Panels */}
      <AddDealModal open={showAddModal} onClose={() => setShowAddModal(false)} onSave={createDeal} />
      <DealDetailPanel dealId={selectedDealId} onClose={() => setSelectedDealId(null)} onDelete={deleteDeal} />
    </div>
  );
}
