"use client";

import { Menu, Search, Bell } from "lucide-react";
import { useSidebar } from "@/hooks/useSidebar";
import { cn } from "@/lib/utils";

export default function Header() {
  const { toggle } = useSidebar();

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border-subtle bg-surface-secondary px-6">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-tertiary hover:text-text-primary"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <h1 className="font-display text-lg font-semibold text-text-primary">
          Dashboard
        </h1>
      </div>

      {/* Center: Search */}
      <div className="mx-auto w-full max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search anything..."
            className={cn(
              "w-full rounded-lg bg-surface-primary py-2 pl-10 pr-16 text-sm text-text-primary placeholder:text-text-tertiary",
              "border border-border-subtle outline-none transition-colors",
              "focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/25"
            )}
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 rounded-md border border-border-default bg-surface-tertiary px-1.5 py-0.5 text-[10px] font-medium text-text-tertiary">
            <span className="text-xs">&#8984;</span>K
          </kbd>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-tertiary hover:text-text-primary"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent-coral ring-2 ring-surface-secondary" />
        </button>

        {/* User avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-blue text-xs font-bold text-white select-none">
          IB
        </div>
      </div>
    </header>
  );
}
