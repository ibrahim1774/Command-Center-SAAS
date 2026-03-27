"use client";

import { emailMetrics, emailAISummary, emails } from "@/lib/mock-data";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Sparkles, Mail, AlertCircle, Clock, Send } from "lucide-react";

const metricAccents: Record<string, string> = {
  Unread: "text-text-primary",
  "Brand Deal Inquiries": "text-accent-primary",
  "Needs Response": "text-danger",
};

export default function EmailPage() {
  const brandDeals = emails.filter((e) => e.category === "brand-deals");
  const customerMessages = emails.filter((e) => e.category === "customer");
  const newsletters = emails.filter((e) => e.category === "newsletter");
  const needsResponse = emails.filter((e) => e.needsResponse);

  return (
    <div className="space-y-8">
      {/* Row 1: Metric Cards */}
      <div className="grid grid-cols-3 gap-4">
        {emailMetrics.map((metric) => (
          <Card key={metric.label} padding="md">
            <p className="font-body text-[10px] font-medium uppercase tracking-wider text-text-secondary">
              {metric.label}
            </p>
            <p
              className={`font-display text-3xl font-bold ${metricAccents[metric.label] ?? "text-text-primary"}`}
            >
              {metric.value}
            </p>
            <p className="font-body text-xs text-text-secondary">
              {metric.change}
            </p>
          </Card>
        ))}
      </div>

      {/* Row 2: AI Email Summary */}
      <Card className="bg-[#faf8f5]" padding="md">
        <div className="mb-3 flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-accent-primary" />
          <h2 className="font-display text-lg font-semibold text-text-primary">
            Email Summary
          </h2>
          <Badge variant="info" size="sm">
            AI generated
          </Badge>
        </div>
        <p className="font-body text-sm leading-relaxed text-text-secondary">
          {emailAISummary}
        </p>
      </Card>

      {/* Row 3: 3-Column Email Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Brand Deals */}
        <Card variant="accent" padding="none">
          <div className="flex items-center gap-2 border-b border-card-border p-4">
            <Mail className="h-4 w-4 text-accent-primary" />
            <h3 className="font-display text-sm font-semibold text-text-primary">
              Brand Deals
            </h3>
            <Badge variant="info" size="sm">
              {brandDeals.length}
            </Badge>
          </div>
          <div className="divide-y divide-card-border">
            {brandDeals.map((email) => (
              <EmailItem key={email.id} email={email} />
            ))}
          </div>
        </Card>

        {/* Customer Messages */}
        <Card
          padding="none"
          className="border-l-2 border-l-[#7ca5c4]"
        >
          <div className="flex items-center gap-2 border-b border-card-border p-4">
            <Mail className="h-4 w-4 text-[#7ca5c4]" />
            <h3 className="font-display text-sm font-semibold text-text-primary">
              Customer Messages
            </h3>
            <Badge variant="neutral" size="sm">
              {customerMessages.length}
            </Badge>
          </div>
          <div className="divide-y divide-card-border">
            {customerMessages.map((email) => (
              <EmailItem key={email.id} email={email} />
            ))}
          </div>
        </Card>

        {/* Newsletters & Other */}
        <Card
          padding="none"
          className="border-l-2 border-l-text-muted"
        >
          <div className="flex items-center gap-2 border-b border-card-border p-4">
            <Mail className="h-4 w-4 text-text-muted" />
            <h3 className="font-display text-sm font-semibold text-text-primary">
              Newsletters & Other
            </h3>
            <Badge variant="neutral" size="sm">
              {newsletters.length}
            </Badge>
          </div>
          <div className="divide-y divide-card-border">
            {newsletters.map((email) => (
              <EmailItem key={email.id} email={email} />
            ))}
          </div>
        </Card>
      </div>

      {/* Row 4: Needs Your Response */}
      <Card padding="md">
        <div className="mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-danger" />
          <h2 className="font-display text-lg font-semibold text-danger">
            Needs Your Response
          </h2>
        </div>
        <div className="space-y-4">
          {needsResponse.map((email) => (
            <div
              key={email.id}
              className="flex items-start justify-between gap-4 rounded-lg border border-card-border bg-[#faf8f5] p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-body text-sm font-semibold text-text-primary">
                  {email.from}
                </p>
                <p className="font-body text-sm font-medium text-text-primary">
                  {email.subject}
                </p>
                <p className="font-body text-xs text-text-secondary line-clamp-1">
                  {email.preview}
                </p>
              </div>
              <Button variant="secondary" size="sm" className="shrink-0">
                <Send className="mr-1.5 h-3 w-3" />
                Draft Reply
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Email list item used inside each column                           */
/* ------------------------------------------------------------------ */

const priorityDot: Record<string, string> = {
  high: "bg-danger",
  medium: "bg-amber-400",
  low: "bg-gray-300",
};

function EmailItem({ email }: { email: (typeof emails)[number] }) {
  return (
    <div
      className={`px-4 py-3 ${!email.read ? "bg-[#faf8f5]" : ""}`}
    >
      <div className="mb-0.5 flex items-center justify-between gap-2">
        <span className="font-body text-sm font-semibold text-text-primary truncate">
          {email.from}
        </span>
        <span className="font-body text-xs text-text-muted whitespace-nowrap">
          {email.timestamp}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <span
          className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${priorityDot[email.priority]}`}
        />
        <p className="font-body text-sm font-medium text-text-primary truncate">
          {email.subject}
        </p>
      </div>
      <p className="font-body mt-0.5 text-xs text-text-secondary line-clamp-1">
        {email.preview}
      </p>
    </div>
  );
}
