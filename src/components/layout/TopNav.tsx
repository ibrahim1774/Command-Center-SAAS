"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { RefreshCw, LogOut, Lock } from "lucide-react";
import { TAB_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";
import { useSession, signOut } from "next-auth/react";

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

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function TopNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <nav className="sticky top-0 z-50 bg-card-bg border-b border-card-border">
      {/* Header Bar */}
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <Link href="/dashboard" className="flex items-baseline gap-2">
            <span className="font-display text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
              Nurplix
            </span>
            <span className="hidden sm:inline text-xs font-medium uppercase tracking-widest text-text-muted">
              Claude Command Center
            </span>
          </Link>

          {/* Center: Live indicator */}
          <div className="hidden sm:block">
            <LiveIndicator />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              className="flex h-9 items-center gap-2 rounded-lg px-3 text-sm text-text-secondary transition-colors hover:bg-[#f0ede8] hover:text-text-primary"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* User Avatar + Dropdown */}
            <div className="relative ml-1" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((p) => !p)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-primary text-xs font-bold text-white select-none cursor-pointer overflow-hidden"
              >
                {status === "loading" ? (
                  <span className="h-4 w-4 rounded-full bg-white/30 animate-pulse" />
                ) : session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(session?.user?.name)
                )}
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-card-border bg-card-bg shadow-lg py-2 z-50"
                  style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
                >
                  {session?.user && (
                    <div className="px-4 py-2 border-b border-card-border mb-1">
                      <p className="text-sm font-semibold text-text-primary truncate">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-text-secondary truncate">
                        {session.user.email}
                      </p>
                    </div>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:bg-[#f0ede8] hover:text-text-primary transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex gap-0 overflow-x-auto scrollbar-none -mb-px snap-x snap-mandatory sm:snap-none">
          {TAB_ITEMS.map((tab) => {
            const isActive =
              tab.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(tab.href);
            const userPlan = (session?.user?.plan as string) || "free";
            const isLocked = tab.requiresPro && userPlan !== "pro";

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={cn(
                  "relative flex items-center gap-1.5 px-3.5 sm:px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors snap-start",
                  isActive
                    ? "text-text-primary"
                    : isLocked
                      ? "text-text-muted/60"
                      : "text-text-muted hover:text-text-secondary"
                )}
              >
                {tab.label}
                {isLocked && <Lock className="h-3 w-3" />}
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
