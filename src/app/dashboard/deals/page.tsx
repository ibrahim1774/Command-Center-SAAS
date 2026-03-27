"use client";

import { dealMetrics, deals, payouts, monthlyEarnings } from "@/lib/mock-data";
import { DEAL_STAGE_CONFIG } from "@/lib/constants";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DollarSign, Clock, CheckCircle, AlertCircle } from "lucide-react";

const STAGES = ["inquiry", "negotiating", "in-progress", "completed"] as const;

function formatCurrency(value: number) {
  return `$${value.toLocaleString()}`;
}

function formatYAxis(value: number) {
  return `$${value / 1000}K`;
}

const paymentStatusStyles: Record<string, { className: string; label: string }> = {
  paid: { className: "bg-[#6b8f71]/10 text-[#6b8f71]", label: "Paid" },
  pending: { className: "bg-[#f59e0b]/10 text-[#f59e0b]", label: "Pending" },
  overdue: { className: "bg-[#c4626a]/10 text-[#c4626a]", label: "Overdue" },
};

const metricIcons = [DollarSign, DollarSign, Clock, CheckCircle];

export default function DealsPage() {
  return (
    <div className="space-y-8">
      {/* Row 1: Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {dealMetrics.map((metric, i) => {
          const Icon = metricIcons[i];
          const isPendingPayouts = metric.label === "Pending Payouts";
          const isCompleted = metric.label === "Completed This Month";

          return (
            <Card key={metric.label} padding="md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-body uppercase tracking-widest text-text-secondary mb-1">
                    {metric.label}
                  </p>
                  <p
                    className={`text-2xl font-display font-bold ${
                      isPendingPayouts
                        ? "text-accent-primary"
                        : isCompleted
                        ? "text-success"
                        : "text-text-primary"
                    }`}
                  >
                    {metric.value}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-[#f0ede8]">
                  <Icon className="w-4 h-4 text-text-secondary" />
                </div>
              </div>
              <div className="mt-3">
                <Badge
                  variant={metric.changeType as "positive" | "negative" | "neutral"}
                  size="sm"
                >
                  {metric.change}
                </Badge>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Row 2: Kanban Board */}
      <div>
        <h2 className="font-display text-xl font-semibold text-text-primary mb-4">
          Deal Pipeline
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STAGES.map((stage) => {
            const config = DEAL_STAGE_CONFIG[stage];
            const stageDeals = deals.filter((d) => d.stage === stage);

            return (
              <div
                key={stage}
                className="rounded-xl p-3 min-h-[300px]"
                style={{ backgroundColor: config.bg }}
              >
                {/* Column Header */}
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: config.color }}
                  />
                  <span className="font-body text-sm font-semibold text-text-primary">
                    {config.label}
                  </span>
                  <span
                    className="text-[10px] font-body font-medium rounded-full px-2 py-0.5"
                    style={{
                      backgroundColor: config.color + "1a",
                      color: config.color,
                    }}
                  >
                    {stageDeals.length}
                  </span>
                </div>

                {/* Deal Cards */}
                <div className="space-y-2.5">
                  {stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="bg-white border border-card-border rounded-lg p-4 hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-shadow"
                    >
                      <p className="font-body font-semibold text-text-primary text-sm">
                        {deal.brand}
                      </p>
                      <p className="font-body text-xs text-text-secondary mt-0.5 line-clamp-2">
                        {deal.description}
                      </p>
                      <p className="font-display font-bold text-text-primary mt-2">
                        {formatCurrency(deal.value)}
                      </p>
                      <div className="flex items-center justify-between mt-2.5">
                        <Badge variant="platform" size="sm">
                          {deal.platform}
                        </Badge>
                        <span className="flex items-center gap-1 text-[10px] font-body text-text-secondary">
                          <Clock className="w-3 h-3" />
                          {new Date(deal.deadline).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 3: Payout Status Table */}
      <Card padding="md">
        <h2 className="font-display text-xl font-semibold text-text-primary mb-5">
          Payout Status
        </h2>

        {/* Table Header */}
        <div className="grid grid-cols-5 gap-4 px-4 py-2.5 text-[10px] font-body uppercase tracking-widest text-text-secondary border-b border-card-border">
          <span>Brand</span>
          <span>Deal Value</span>
          <span>Payment Status</span>
          <span>Payment Date</span>
          <span>Invoice #</span>
        </div>

        {/* Table Rows */}
        {payouts.map((payout) => {
          const statusStyle = paymentStatusStyles[payout.status];
          return (
            <div
              key={payout.id}
              className="grid grid-cols-5 gap-4 px-4 py-3.5 items-center border-b border-card-border last:border-b-0 hover:bg-[#f9f8f6] transition-colors"
            >
              <span className="font-body text-sm font-medium text-text-primary">
                {payout.brand}
              </span>
              <span className="font-body text-sm text-text-primary">
                {formatCurrency(payout.dealValue)}
              </span>
              <span>
                <span
                  className={`inline-flex items-center rounded-full text-[11px] font-medium px-2.5 py-1 ${statusStyle.className}`}
                >
                  {payout.status === "paid" && <CheckCircle className="w-3 h-3 mr-1" />}
                  {payout.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                  {payout.status === "overdue" && <AlertCircle className="w-3 h-3 mr-1" />}
                  {statusStyle.label}
                </span>
              </span>
              <span className="font-body text-sm text-text-secondary">
                {new Date(payout.paymentDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="font-body text-sm text-text-secondary font-mono">
                {payout.invoiceNumber}
              </span>
            </div>
          );
        })}
      </Card>

      {/* Row 4: Monthly Earnings Chart */}
      <Card padding="md">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-display text-xl font-semibold text-text-primary">
            Monthly Earnings
          </h2>
          <span className="font-body text-xs text-text-secondary">Last 6 months</span>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyEarnings}
              margin={{ top: 5, right: 5, bottom: 5, left: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e6e1" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6b6b6b", fontFamily: "DM Sans" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={formatYAxis}
                tick={{ fontSize: 12, fill: "#6b6b6b", fontFamily: "DM Sans" }}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value)), "Earnings"]}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e8e6e1",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  fontFamily: "DM Sans",
                  fontSize: "13px",
                }}
                cursor={{ fill: "rgba(196,148,122,0.08)" }}
              />
              <Bar
                dataKey="amount"
                fill="#c4947a"
                radius={[6, 6, 0, 0]}
                maxBarSize={56}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
