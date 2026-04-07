"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  useInView,
} from "framer-motion";
import { Check, ArrowLeft } from "lucide-react";
import { ExitIntentPopup } from "@/components/ui/ExitIntentPopup";

/* ── Fade-up wrapper ── */
function FadeUp({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const { data: session } = useSession();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 40));

  // Reset loading state when user navigates back from Stripe via browser back button
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) setCheckoutLoading(null);
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  // Fire CompleteRegistration pixel for OAuth signups arriving from post-signup redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("registered") === "true") {
      const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
      if (fbq) {
        fbq("track", "CompleteRegistration", { content_name: "google_signup" });
      }
      // Clean URL so it doesn't re-fire
      window.history.replaceState({}, "", "/pricing");
    }
  }, []);

  const handleCheckout = async (planId: string) => {
    setCheckoutLoading(planId);
    try {
      if (typeof window !== "undefined" && (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq) {
        (window as unknown as { fbq: (...args: unknown[]) => void }).fbq("track", "InitiateCheckout");
      }
      // Use authenticated checkout if logged in, guest checkout otherwise
      const endpoint = session?.user ? "/api/stripe/checkout" : "/api/stripe/guest-checkout";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, interval: yearly ? "yearly" : "monthly" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to start checkout. Please try again.");
        setCheckoutLoading(null);
      }
    } catch {
      alert("Something went wrong. Please try again.");
      setCheckoutLoading(null);
    }
  };

  const plans = [
    {
      name: "Hobby",
      monthlyPrice: 9,
      yearlyPrice: 60,
      planId: "hobby",
      highlight: false,
      features: [
        "Access to 1 channel (Instagram)",
        "Full analytics dashboard",
        "Trending headlines",
        "Email support",
      ],
    },
    {
      name: "Pro",
      monthlyPrice: 29,
      yearlyPrice: 199,
      planId: "pro",
      highlight: true,
      features: [
        "Access to all channels",
        "Instagram, YouTube, Facebook, TikTok",
        "Full analytics dashboard",
        "AI-powered insights",
        "Brand deal CRM",
        "Goals & task management",
        "Priority support",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-page-bg text-text-primary font-body">
      <ExitIntentPopup />
      {/* ── STICKY NAV ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-lg border-b border-card-border shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="font-display text-xl font-bold tracking-tight">Nurplix</span>
          </Link>

          <div className="flex items-center gap-3">
            {session?.user ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="hidden sm:inline text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                  Dashboard
                </Link>
                <button onClick={() => signOut({ callbackUrl: "/" })} className="hidden sm:inline text-sm font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
                  Sign Out
                </button>
                <Link href="/dashboard" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-primary text-xs font-bold text-white overflow-hidden">
                  {session.user.image ? <img src={session.user.image} alt="" className="h-full w-full object-cover" /> : getInitials(session.user.name)}
                </Link>
              </div>
            ) : (
              <>
                <Link href="/login" className="hidden sm:inline-flex items-center text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── PRICING ── */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="mx-auto max-w-4xl px-6">
          <FadeUp>
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors mb-8">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
            <p className="text-center text-sm font-medium uppercase tracking-widest text-accent-primary">
              Pricing
            </p>
            <h1 className="mt-3 text-center font-display text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
              Pick the plan that fits
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-center text-base text-text-secondary">
              Start with a 3-day free trial. Cancel in two clicks. You won&apos;t be charged until day 4.
            </p>
          </FadeUp>

          {/* Monthly / Yearly toggle */}
          <FadeUp delay={0.08}>
            <div className="mt-10 flex items-center justify-center gap-3">
              <span className={`text-sm font-medium ${!yearly ? "text-text-primary" : "text-text-muted"}`}>
                Monthly
              </span>
              <button
                type="button"
                onClick={() => setYearly(!yearly)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${yearly ? "bg-accent-primary" : "bg-card-border"}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${yearly ? "translate-x-6" : "translate-x-1"}`} />
              </button>
              <span className={`text-sm font-medium ${yearly ? "text-text-primary" : "text-text-muted"}`}>
                Yearly
              </span>
              <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success">
                {yearly ? "Save up to 45%" : "Save 20%+"}
              </span>
            </div>
          </FadeUp>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {plans.map((plan, i) => (
              <FadeUp key={plan.name} delay={i * 0.08}>
                <div
                  className={`relative flex flex-col rounded-2xl border p-7 md:p-9 transition-shadow ${
                    plan.highlight
                      ? "border-accent-primary bg-card-bg shadow-xl shadow-accent-primary/10 md:scale-[1.03]"
                      : "border-card-border bg-card-bg"
                  }`}
                >
                  <p className="font-display text-xl font-bold text-text-primary">{plan.name}</p>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="font-display text-4xl font-bold tracking-tight text-text-primary">
                      ${yearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-text-muted text-base">
                      /{yearly ? "year" : "mo"}
                    </span>
                  </div>
                  {yearly && (
                    <p className="mt-1 text-sm text-text-muted">
                      ${(plan.yearlyPrice / 12).toFixed(2)}/mo billed annually
                    </p>
                  )}
                  <p className="mt-2 text-sm font-medium text-success">
                    Free for 3 days — cancel anytime
                  </p>

                  <ul className="mt-7 flex flex-col gap-3.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-base text-text-secondary">
                        <Check className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-8">
                    <button
                      onClick={() => handleCheckout(plan.planId)}
                      disabled={checkoutLoading !== null}
                      className={`block w-full rounded-full py-3 min-h-[48px] text-center text-base font-semibold transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                        plan.highlight
                          ? "bg-accent-primary text-white hover:opacity-90 hover:shadow-md"
                          : "border border-card-border text-text-primary hover:border-accent-primary hover:text-accent-primary"
                      }`}
                    >
                      {checkoutLoading === plan.planId ? "Loading..." : "Start 3-Day Free Trial"}
                    </button>
                    <p className="mt-2.5 text-center text-sm text-text-muted">Cancel anytime</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-card-border bg-white py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
            <div>
              <Link href="/" className="flex items-baseline gap-2">
                <span className="font-display text-lg font-bold tracking-tight">Nurplix</span>
              </Link>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-text-secondary">
              {[
                { label: "Home", href: "/" },
                { label: "Login", href: "/login" },
                { label: "Contact", href: "/contact" },
                { label: "Terms", href: "/terms" },
                { label: "Privacy", href: "/privacy" },
              ].map((link) => (
                <Link key={link.label} href={link.href} className="transition-colors hover:text-text-primary">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-8 border-t border-card-border pt-6 text-center text-xs text-text-muted">
            &copy; 2026 Nurplix. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
