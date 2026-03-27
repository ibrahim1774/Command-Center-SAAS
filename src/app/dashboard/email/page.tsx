"use client";

import { emailAISummary } from "@/lib/mock-data";
import { useDashboardData } from "@/lib/hooks/useDashboardData";
import { ConnectAccountCard } from "@/components/ui/ConnectAccountCard";
import { SyncStatusBar } from "@/components/ui/SyncStatusBar";
import { DashboardSkeleton } from "@/components/ui/LoadingSkeleton";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Sparkles, Mail } from "lucide-react";

interface EmailData {
  connected: boolean;
  lastSynced: string | null;
  emails: Array<{
    id: string;
    email_id: string;
    from_name: string | null;
    from_email: string | null;
    subject: string | null;
    snippet: string | null;
    category: string;
    priority: string;
    received_at: string;
    needs_response: boolean;
  }>;
  unreadCount: number;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const priorityDot: Record<string, string> = {
  high: "bg-danger",
  medium: "bg-amber-400",
  low: "bg-gray-300",
};

export default function EmailPage() {
  const { data, loading, connected, lastSynced, refetch } =
    useDashboardData<EmailData>("/api/dashboard/email");

  if (loading) return <DashboardSkeleton />;
  if (!connected) return <ConnectAccountCard platform="gmail" />;

  const emails = data?.emails || [];
  const unreadCount = data?.unreadCount || 0;

  return (
    <div className="space-y-8">
      <SyncStatusBar
        lastSynced={lastSynced}
        platform="gmail"
        onRefreshComplete={refetch}
      />

      {/* Row 1: Metric Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card padding="md">
          <p className="font-body text-[10px] font-medium uppercase tracking-wider text-text-secondary">
            Total Emails
          </p>
          <p className="font-display text-3xl font-bold text-text-primary">
            {emails.length}
          </p>
          <p className="font-body text-xs text-text-secondary">
            in inbox
          </p>
        </Card>
        <Card padding="md">
          <p className="font-body text-[10px] font-medium uppercase tracking-wider text-text-secondary">
            Unread
          </p>
          <p className="font-display text-3xl font-bold text-accent-primary">
            {unreadCount}
          </p>
          <p className="font-body text-xs text-text-secondary">
            messages
          </p>
        </Card>
        <Card padding="md">
          <p className="font-body text-[10px] font-medium uppercase tracking-wider text-text-secondary">
            Latest
          </p>
          <p className="font-display text-3xl font-bold text-text-primary">
            {emails.length > 0 ? timeAgo(emails[0].received_at) : "—"}
          </p>
          <p className="font-body text-xs text-text-secondary">
            most recent
          </p>
        </Card>
      </div>

      {/* Row 2: AI Email Summary (mock) */}
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

      {/* Row 3: Email List */}
      <Card padding="none">
        <div className="flex items-center gap-2 border-b border-card-border p-4">
          <Mail className="h-4 w-4 text-accent-primary" />
          <h3 className="font-display text-sm font-semibold text-text-primary">
            Inbox
          </h3>
          <Badge variant="info" size="sm">
            {emails.length}
          </Badge>
        </div>
        <div className="divide-y divide-card-border">
          {emails.map((email) => (
            <div key={email.id} className="px-4 py-3">
              <div className="mb-0.5 flex items-center justify-between gap-2">
                <span className="font-body text-sm font-semibold text-text-primary truncate">
                  {email.from_name || email.from_email || "Unknown"}
                </span>
                <span className="font-body text-xs text-text-muted whitespace-nowrap">
                  {timeAgo(email.received_at)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${priorityDot[email.priority] || "bg-gray-300"}`}
                />
                <p className="font-body text-sm font-medium text-text-primary truncate">
                  {email.subject || "(no subject)"}
                </p>
              </div>
              {email.snippet && (
                <p className="font-body mt-0.5 text-xs text-text-secondary line-clamp-1">
                  {email.snippet}
                </p>
              )}
            </div>
          ))}
          {emails.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-text-secondary">
              No emails found. Try refreshing.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
