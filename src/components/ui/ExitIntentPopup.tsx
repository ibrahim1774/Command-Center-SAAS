"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const PLANS = [
  {
    id: "hobby" as const,
    name: "Hobby",
    originalPrice: 9,
    offerPrice: 5,
    discount: 44,
    features: ["1 account", "Instagram analytics", "Trending headlines", "Email support"],
    highlight: false,
  },
  {
    id: "pro" as const,
    name: "Pro",
    originalPrice: 29,
    offerPrice: 19,
    discount: 34,
    features: ["5 accounts", "All platforms", "Brand deal CRM", "Goals & tasks", "Priority support"],
    highlight: true,
  },
];

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// Warm-up delay before exit-intent listeners activate (ms)
const WARMUP_MS = 20_000;

export function ExitIntentPopup() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(600);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const triggeredRef = useRef(false);
  const readyRef = useRef(false); // true after warm-up

  const shouldSuppress = useCallback(() => {
    if (status === "loading") return true;
    if (!session?.user) return true; // must be signed in
    const plan = (session.user as { plan?: string }).plan;
    if (plan && plan !== "free") return true; // already paying
    return false;
  }, [session, status]);

  const trigger = useCallback(() => {
    if (!readyRef.current) return;
    if (triggeredRef.current) return;
    if (shouldSuppress()) return;
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem("exitOfferShown")) return;

    triggeredRef.current = true;
    if (typeof sessionStorage !== "undefined") sessionStorage.setItem("exitOfferShown", "true");
    setTimeLeft(600);
    setOpen(true);
  }, [shouldSuppress]);

  // Register exit-intent listeners only after warm-up delay
  useEffect(() => {
    const warmup = setTimeout(() => {
      readyRef.current = true;
    }, WARMUP_MS);

    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) trigger();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") trigger();
    };

    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearTimeout(warmup);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [trigger]);

  // Countdown timer
  useEffect(() => {
    if (!open) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setOpen(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [open]);

  async function handleClaim(planId: "hobby" | "pro") {
    setLoadingPlan(planId);
    try {
      const res = await fetch("/api/stripe/exit-offer-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setLoadingPlan(null);
    }
  }

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop — intentionally no onClick so user cannot dismiss by clicking outside */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Card */}
          <motion.div
            className="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto"
            style={{ border: "1px solid #e8e6e1" }}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            {/* X button — only close mechanism besides "No thanks" */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors"
              style={{ color: "#8a8580" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f0ede8")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-6">
              {/* Header */}
              <div className="text-center mb-6">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3"
                  style={{ backgroundColor: "#fff3cd", color: "#92400e" }}
                >
                  <span>⏱</span>
                  <span>Offer expires in {formatTime(timeLeft)}</span>
                </div>
                <h2
                  className="text-2xl font-bold mb-1"
                  style={{ fontFamily: "var(--font-display)", color: "#2c2825" }}
                >
                  Wait — One-Time Special Offer
                </h2>
                <p className="text-sm" style={{ color: "#8a8580" }}>
                  This discount disappears the moment you leave. Never shown again.
                </p>
              </div>

              {/* Plan cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    className="relative rounded-xl p-5 flex flex-col gap-3"
                    style={{
                      border: plan.highlight ? "2px solid #c4947a" : "1px solid #e8e6e1",
                      backgroundColor: plan.highlight ? "#fdf8f5" : "#fafaf8",
                    }}
                  >
                    {plan.highlight && (
                      <div
                        className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold"
                        style={{ backgroundColor: "#c4947a", color: "#fff" }}
                      >
                        MOST POPULAR
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="font-bold text-base" style={{ color: "#2c2825" }}>
                        {plan.name}
                      </span>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: "#d1fae5", color: "#065f46" }}
                      >
                        {plan.discount}% OFF
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold" style={{ color: "#2c2825" }}>
                        ${plan.offerPrice}
                      </span>
                      <span className="text-sm" style={{ color: "#8a8580" }}>/mo</span>
                      <span className="text-sm line-through ml-1" style={{ color: "#b0aca7" }}>
                        ${plan.originalPrice}/mo
                      </span>
                    </div>

                    <ul className="space-y-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-xs" style={{ color: "#6b6560" }}>
                          <span style={{ color: "#c4947a" }}>✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleClaim(plan.id)}
                      disabled={loadingPlan !== null}
                      className="mt-auto w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-60"
                      style={{
                        backgroundColor: plan.highlight ? "#c4947a" : "#2c2825",
                        color: "#fff",
                      }}
                    >
                      {loadingPlan === plan.id ? "Redirecting…" : "Claim This Offer"}
                    </button>
                  </div>
                ))}
              </div>

              {/* Dismiss */}
              <p className="text-center text-xs" style={{ color: "#b0aca7" }}>
                <button
                  onClick={() => setOpen(false)}
                  className="underline hover:no-underline transition-all"
                >
                  No thanks, I&apos;ll pay full price later
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
