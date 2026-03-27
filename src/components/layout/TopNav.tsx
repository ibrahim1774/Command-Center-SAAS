"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { RefreshCw, Settings, Mail } from "lucide-react";
import { TAB_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

function LiveIndicator() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm text-text-secondary">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
      </span>
      <span className="font-medium text-text-primary">LIVE</span>
      {time && <span className="tabular-nums">{time}</span>}
    </div>
  );
}

export default function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-card-bg border-b border-card-border">
      {/* Header Bar */}
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <Link href="/dashboard" className="flex items-baseline gap-1.5">
            <span className="font-display text-2xl font-bold text-text-primary tracking-tight">
              Command
            </span>
            <span className="font-display text-2xl italic text-accent-primary tracking-tight">
              Center
            </span>
          </Link>

          {/* Center: Live indicator */}
          <LiveIndicator />

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              className="flex h-9 items-center gap-2 rounded-lg px-3 text-sm text-text-secondary transition-colors hover:bg-[#f0ede8] hover:text-text-primary"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <Link
              href="/dashboard/email"
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                pathname === "/dashboard/email"
                  ? "bg-[#f0ede8] text-text-primary"
                  : "text-text-secondary hover:bg-[#f0ede8] hover:text-text-primary"
              )}
            >
              <Mail className="h-4 w-4" />
            </Link>

            <Link
              href="/dashboard/settings"
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                pathname === "/dashboard/settings"
                  ? "bg-[#f0ede8] text-text-primary"
                  : "text-text-secondary hover:bg-[#f0ede8] hover:text-text-primary"
              )}
            >
              <Settings className="h-4 w-4" />
            </Link>

            <div className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-accent-primary text-xs font-bold text-white select-none">
              IB
            </div>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex gap-0 overflow-x-auto scrollbar-none -mb-px">
          {TAB_ITEMS.map((tab) => {
            const isActive =
              tab.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={cn(
                  "relative flex items-center px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors",
                  isActive
                    ? "text-text-primary"
                    : "text-text-muted hover:text-text-secondary"
                )}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-5 right-5 h-0.5 bg-accent-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
