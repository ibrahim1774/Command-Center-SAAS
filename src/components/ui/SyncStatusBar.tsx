"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

interface SyncStatusBarProps {
  lastSynced: string | null;
  platform: string;
  onRefreshComplete?: () => void;
}

function formatSyncTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function SyncStatusBar({
  lastSynced,
  platform,
  onRefreshComplete,
}: SyncStatusBarProps) {
  const [syncing, setSyncing] = useState(false);

  async function handleRefresh() {
    setSyncing(true);
    try {
      await fetch("/api/sync/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      });
      onRefreshComplete?.();
    } catch {
      // Silent fail — user can retry
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <p className="text-sm text-text-secondary">
        {lastSynced ? (
          <>Last synced: {formatSyncTime(lastSynced)}</>
        ) : (
          "Not yet synced"
        )}
      </p>
      <button
        onClick={handleRefresh}
        disabled={syncing}
        className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer disabled:opacity-50"
      >
        <RefreshCw
          className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`}
        />
        {syncing ? "Syncing..." : "Refresh"}
      </button>
    </div>
  );
}
