"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  useInView,
} from "framer-motion";
import {
  BarChart3,
  Sparkles,
  Handshake,
  Target,
  Check,
  ArrowRight,
  TrendingUp,
  UserPlus,
  Zap,
  Rocket,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Reusable fade-up wrapper
   ───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   Platform icons (muted monochrome SVGs)
   ───────────────────────────────────────────── */
function PlatformLogos() {
  const iconClass = "h-7 w-7 opacity-50";
  return (
    <FadeUp delay={0.3}>
      <div className="mt-8 flex items-center justify-center gap-2">
        <span className="text-sm font-medium text-text-muted mr-1">Works with</span>
        {/* Instagram */}
        <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
        {/* TikTok */}
        <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
        {/* YouTube */}
        <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
        {/* Facebook */}
        <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </div>
    </FadeUp>
  );
}

/* ─────────────────────────────────────────────
   Pricing section
   ───────────────────────────────────────────── */
function PricingSection() {
  const [yearly, setYearly] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const handleCheckout = async (planId: string) => {
    setCheckoutLoading(planId);
    try {
      if (typeof window !== "undefined" && (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq) {
        (window as unknown as { fbq: (...args: unknown[]) => void }).fbq("track", "InitiateCheckout");
      }
      const res = await fetch("/api/stripe/guest-checkout", {
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
    <section id="pricing" className="py-16 md:py-24 scroll-mt-24">
      <div className="mx-auto max-w-4xl px-6">
        <FadeUp>
          <p className="text-center text-sm font-medium uppercase tracking-widest text-accent-primary">
            Pricing
          </p>
          <h2 className="mt-3 text-center font-display text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
            Invest in your growth
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-center text-base text-text-secondary">
            Simple, transparent pricing. Pick the plan that fits your needs.
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
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent-primary px-4 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                )}

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
  );
}

/* ═════════════════════════════════════════════
   PAGE
   ═════════════════════════════════════════════ */
function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function scrollToPricing() {
  const el = document.getElementById("pricing");
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  // Re-scroll after lazy images load and shift the layout
  setTimeout(() => {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 600);
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const { data: session } = useSession();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 40));

  return (
    <div className="min-h-screen bg-page-bg text-text-primary font-body">
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
            <span className="text-xs font-medium uppercase tracking-widest text-text-muted hidden sm:inline">
              Command Center
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
              Features
            </Link>
            <button onClick={scrollToPricing} className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
              Pricing
            </button>
          </div>

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
                <button
                  onClick={scrollToPricing}
                  className="rounded-full border border-accent-primary/30 bg-accent-primary/5 px-4 py-2 text-sm font-medium text-accent-primary transition-all hover:bg-accent-primary hover:text-white cursor-pointer"
                >
                  Start Free Trial
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-32 pb-16 md:pt-44 md:pb-24">
        <div className="pointer-events-none absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-accent-primary/5" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-[360px] w-[360px] rounded-full bg-accent-primary/[0.03]" />

        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <FadeUp>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight text-text-primary">
              Your social media
              <br />
              empire,{" "}
              <span className="italic text-accent-primary">one dashboard</span>
            </h1>
          </FadeUp>

          <FadeUp delay={0.12}>
            <p className="mx-auto mt-6 max-w-xl text-lg text-text-secondary leading-relaxed md:text-xl">
              Multi-platform analytics, AI-powered insights, brand deal tracking,
              and goal management — everything creators need to grow smarter.
            </p>
          </FadeUp>

          <FadeUp delay={0.22}>
            <div className="mt-10">
              <button
                onClick={scrollToPricing}
                className="inline-flex items-center gap-2 rounded-full bg-accent-primary px-10 py-4 min-h-[48px] text-lg font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg w-full sm:w-auto justify-center cursor-pointer"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </FadeUp>

          {/* Works with logos */}
          <PlatformLogos />

          {/* Dashboard screenshot */}
          <FadeUp delay={0.4}>
            <div className="mx-auto mt-14 max-w-4xl">
              <img
                src="/SCR-20260402-ngtw.png"
                alt="Nurplix overview dashboard showing all channels, follower metrics, AI briefing, and goal trackers"
                className="w-full rounded-xl border border-card-border shadow-2xl shadow-black/5"
              />
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── TREND INTELLIGENCE MARKETING ── */}
      <section className="py-16 md:py-24 bg-[#1a1a1a]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            {/* Left — Copy */}
            <FadeUp>
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#c4947a] mb-4">
                  Trend Intelligence
                </p>
                <h2
                  className="text-3xl font-bold tracking-tight text-white md:text-4xl leading-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Know What&rsquo;s Going Viral Before Everyone Else
                </h2>
                <p className="mt-5 text-base text-white/60 leading-relaxed">
                  Your AI-powered trend report scans TikTok, Instagram, YouTube,
                  Reddit, and Twitter — then tells you exactly which hashtags to
                  use, which content is blowing up, and what to post next.
                </p>

                <ul className="mt-8 space-y-4">
                  <li className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#c4947a]/15">
                      <TrendingUp className="h-3.5 w-3.5 text-[#c4947a]" />
                    </span>
                    <span className="text-[15px] text-white/80">
                      Cross-platform viral score tracking
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#c4947a]/15">
                      <BarChart3 className="h-3.5 w-3.5 text-[#c4947a]" />
                    </span>
                    <span className="text-[15px] text-white/80">
                      AI-generated hashtag recommendations per platform
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#c4947a]/15">
                      <Sparkles className="h-3.5 w-3.5 text-[#c4947a]" />
                    </span>
                    <span className="text-[15px] text-white/80">
                      See the exact posts going viral right now
                    </span>
                  </li>
                </ul>

                <div className="mt-10">
                  <button
                    onClick={scrollToPricing}
                    className="inline-flex items-center gap-2 rounded-full bg-[#c4947a] px-8 py-3.5 min-h-[48px] text-base font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg hover:shadow-[#c4947a]/20 cursor-pointer"
                  >
                    Start Free Trial
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </FadeUp>

            {/* Right — Screenshot */}
            <FadeUp delay={0.15}>
              <div className="relative">
                <img
                  src="/SCR-20260403-kybm.png"
                  alt="Cross-Platform Trend Report showing viral score, platform breakdown, AI recommendations, and top viral content"
                  className="w-full rounded-xl border border-white/[0.08] shadow-2xl shadow-black/40"
                  loading="lazy"
                />
              </div>
            </FadeUp>
          </div>

          {/* Bold statement */}
          <FadeUp delay={0.24}>
            <p
              className="mt-16 text-center text-xl font-bold text-white md:text-2xl leading-snug max-w-2xl mx-auto"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Creators using trend intelligence post at the right time, with
              the right sounds, on the right platforms. That&rsquo;s the
              difference between 500 views and 500,000.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── FEATURES SHOWCASE ── */}
      <section id="features" className="py-16 md:py-24 scroll-mt-20">
        <div className="mx-auto max-w-6xl px-6">
          <FadeUp>
            <p className="text-center text-sm font-medium uppercase tracking-widest text-accent-primary">
              See it in action
            </p>
            <h2 className="mt-3 text-center font-display text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
              Built for creators who mean business
            </h2>
          </FadeUp>

          {/* Feature 1: Instagram Analytics */}
          <div className="mt-20 grid items-center gap-10 md:grid-cols-2">
            <FadeUp>
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-primary/10 text-accent-primary mb-4">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <h3 className="font-display text-2xl font-bold text-text-primary">
                  Track your growth with a clear goal in mind
                </h3>
                <p className="mt-3 text-base leading-relaxed text-text-secondary">
                  Set a follower goal and watch your progress with a visual tracker. See per-post engagement rates, browse your latest posts with thumbnails, and read recent comments — all in one place.
                </p>
                <button onClick={scrollToPricing} className="mt-4 inline-flex items-center gap-1 text-base font-medium text-accent-primary hover:opacity-80 transition-opacity cursor-pointer">
                  See what&apos;s included <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </FadeUp>
            <FadeUp delay={0.1}>
              <img
                src="/SCR-20260402-nibp.png"
                alt="Instagram dashboard with follower goal tracker, latest posts with engagement rates, and recent comments"
                className="w-full rounded-xl border border-card-border shadow-lg"
                loading="lazy"
              />
            </FadeUp>
          </div>

          {/* Feature 2: AI-Powered Insights */}
          <div className="mt-24 grid items-center gap-10 md:grid-cols-2">
            <FadeUp className="order-2 md:order-1">
              <img
                src="/SCR-20260402-nicv.png"
                alt="AI analysis showing what's working and what's flopping with specific metrics"
                className="w-full rounded-xl border border-card-border shadow-lg"
                loading="lazy"
              />
            </FadeUp>
            <FadeUp delay={0.1} className="order-1 md:order-2">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-primary/10 text-accent-primary mb-4">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="font-display text-2xl font-bold text-text-primary">
                  AI tells you exactly what&apos;s working
                </h3>
                <p className="mt-3 text-base leading-relaxed text-text-secondary">
                  Get AI-powered analysis that breaks down your performance into clear &ldquo;What&apos;s Working&rdquo; and &ldquo;What&apos;s Flopping&rdquo; cards with real metrics. No vague advice — just specific, actionable insights based on your actual data.
                </p>
              </div>
            </FadeUp>
          </div>

          <FadeUp>
            <div className="mt-12 text-center">
              <button onClick={scrollToPricing} className="inline-flex items-center gap-2 rounded-full bg-accent-primary px-8 py-3.5 min-h-[48px] text-base font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg cursor-pointer">
                Start Free Trial <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── HOW IT WORKS (moved after 2nd feature) ── */}
      <section id="how-it-works" className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <FadeUp>
            <p className="text-center text-sm font-medium uppercase tracking-widest text-accent-primary">
              Simple as 1-2-3
            </p>
            <h2 className="mt-3 text-center font-display text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
              Up and running in minutes
            </h2>
          </FadeUp>

          <div className="relative mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
            <div className="pointer-events-none absolute top-7 left-[16.67%] right-[16.67%] hidden h-px bg-card-border md:block" />

            {[
              {
                step: "1",
                icon: <UserPlus className="h-5 w-5" />,
                title: "Enter your usernames",
                body: "Type in your Instagram, YouTube, TikTok, or Facebook handle. No complicated setup \u2014 just your public username and we pull your data automatically.",
              },
              {
                step: "2",
                icon: <Zap className="h-5 w-5" />,
                title: "Get AI-powered insights",
                body: "Our AI analyzes your posts, engagement, and comments across every platform to tell you exactly what\u2019s working and what needs improvement.",
              },
              {
                step: "3",
                icon: <Rocket className="h-5 w-5" />,
                title: "Grow your empire",
                body: "Set follower goals, track brand deals, manage daily tasks, and watch your audience grow week after week with data-driven decisions.",
              },
            ].map((s, i) => (
              <FadeUp key={s.step} delay={i * 0.12}>
                <div className="flex flex-col items-center text-center">
                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-accent-primary text-white shadow-md shadow-accent-primary/20">
                    {s.icon}
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold text-text-primary">
                    {s.title}
                  </h3>
                  <p className="mt-2 max-w-xs text-base leading-relaxed text-text-secondary">
                    {s.body}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>

          <FadeUp>
            <div className="mt-12 text-center">
              <button onClick={scrollToPricing} className="inline-flex items-center gap-2 rounded-full bg-accent-primary px-8 py-3.5 min-h-[48px] text-base font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg cursor-pointer">
                Start Free Trial <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── MORE FEATURES ── */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          {/* Feature 3: Brand Deals */}
          <div className="grid items-center gap-10 md:grid-cols-2">
            <FadeUp>
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-primary/10 text-accent-primary">
                    <Handshake className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-accent-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-accent-primary">PRO</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-text-primary">
                  Manage every brand deal in one place
                </h3>
                <p className="mt-3 text-base leading-relaxed text-text-secondary">
                  Track deals from first inquiry to final payment with a visual pipeline. See your total pipeline value, pending payouts, and monthly earnings chart — so nothing falls through the cracks.
                </p>
              </div>
            </FadeUp>
            <FadeUp delay={0.1}>
              <img
                src="/SCR-20260402-nieu.png"
                alt="Brand deals CRM with deal pipeline stages, monthly earnings chart, and payout tracking"
                className="w-full rounded-xl border border-card-border shadow-lg"
                loading="lazy"
              />
            </FadeUp>
          </div>

          {/* Feature 4: Goals & Journal */}
          <div className="mt-24 grid items-center gap-10 md:grid-cols-2">
            <FadeUp className="order-2 md:order-1">
              <img
                src="/SCR-20260402-nigf.png"
                alt="Goals dashboard with progress tracking, daily journal entries, and to-do task management"
                className="w-full rounded-xl border border-card-border shadow-lg"
                loading="lazy"
              />
            </FadeUp>
            <FadeUp delay={0.1} className="order-1 md:order-2">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-primary/10 text-accent-primary">
                    <Target className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-accent-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-accent-primary">PRO</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-text-primary">
                  Stay on track with goals, journal, and daily tasks
                </h3>
                <p className="mt-3 text-base leading-relaxed text-text-secondary">
                  Set measurable goals with progress bars, keep a daily journal to reflect on your creator journey, and manage your to-do list — all in one place. Stay focused and consistent.
                </p>
              </div>
            </FadeUp>
          </div>

          {/* Feature 5: Trending */}
          <div className="mt-24 grid items-center gap-10 md:grid-cols-2">
            <FadeUp>
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-primary/10 text-accent-primary mb-4">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h3 className="font-display text-2xl font-bold text-text-primary">
                  Never miss a trending topic
                </h3>
                <p className="mt-3 text-base leading-relaxed text-text-secondary">
                  See what&apos;s trending right now with daily updates from Google Trends. Jump on viral topics early, create timely content, and ride the wave before everyone else catches on.
                </p>
              </div>
            </FadeUp>
            <FadeUp delay={0.1}>
              <img
                src="/SCR-20260402-nihq.png"
                alt="Trending topics dashboard showing daily trending searches from Google Trends"
                className="w-full rounded-xl border border-card-border shadow-lg"
                loading="lazy"
              />
            </FadeUp>
          </div>

          <FadeUp>
            <div className="mt-12 text-center">
              <button onClick={scrollToPricing} className="inline-flex items-center gap-2 rounded-full bg-accent-primary px-8 py-3.5 min-h-[48px] text-base font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg cursor-pointer">
                Start Free Trial <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── PRICING ── */}
      <PricingSection />

      {/* ── FINAL CTA ── */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent-primary/[0.06] via-transparent to-accent-primary/[0.04]" />
        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <FadeUp>
            <h2 className="font-display text-3xl font-bold tracking-tight text-text-primary md:text-5xl">
              See your first insights today
            </h2>
            <p className="mx-auto mt-4 max-w-md text-lg text-text-secondary">
              Pick a plan and start growing in minutes.
            </p>
            <div className="mt-10">
              <button
                onClick={scrollToPricing}
                className="inline-flex items-center gap-2 rounded-full bg-accent-primary px-10 py-4 min-h-[48px] text-lg font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg w-full sm:w-auto justify-center cursor-pointer"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-card-border bg-white py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
            <div>
              <Link href="/" className="flex items-baseline gap-2">
                <span className="font-display text-lg font-bold tracking-tight">Nurplix</span>
                <span className="text-xs font-medium uppercase tracking-widest text-text-muted">Command Center</span>
              </Link>
              <p className="mt-1 text-sm text-text-muted">Built with love for creators</p>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-text-secondary">
              {[
                { label: "Features", href: "#features" },
                { label: "Pricing", href: "#pricing" },
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
