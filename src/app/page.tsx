"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
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
  ChevronRight,
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
   Pricing section with monthly/yearly toggle
   ───────────────────────────────────────────── */
function PricingSection() {
  const [yearly, setYearly] = useState(false);

  const plans = [
    {
      name: "Hobby",
      monthlyPrice: 9,
      yearlyPrice: 60,
      cta: "Get Started",
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
      cta: "Get Started",
      planId: "pro",
      highlight: true,
      features: [
        "Access to all channels",
        "Instagram, X, YouTube, Facebook, TikTok",
        "Full analytics dashboard",
        "Trending headlines",
        "Brand deal CRM",
        "Goals & task management",
        "Priority support",
      ],
    },
  ];

  return (
    <section id="pricing" className="py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-6">
        <FadeUp>
          <p className="text-center text-sm font-medium uppercase tracking-widest text-accent-primary">
            Pricing
          </p>
          <h2 className="mt-3 text-center font-display text-3xl font-bold tracking-tight md:text-4xl">
            Invest in your growth
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-center text-text-secondary">
            Simple, transparent pricing. Pick the plan that fits your needs.
          </p>
        </FadeUp>

        {/* Monthly / Yearly toggle */}
        <FadeUp delay={0.08}>
          <div className="mt-10 flex items-center justify-center gap-3">
            <span
              className={`text-sm font-medium ${!yearly ? "text-text-primary" : "text-text-muted"}`}
            >
              Monthly
            </span>
            <button
              type="button"
              onClick={() => setYearly(!yearly)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                yearly ? "bg-accent-primary" : "bg-card-border"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                  yearly ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium ${yearly ? "text-text-primary" : "text-text-muted"}`}
            >
              Yearly
            </span>
            {yearly && (
              <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success">
                Save up to 45%
              </span>
            )}
          </div>
        </FadeUp>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {plans.map((plan, i) => (
            <FadeUp key={plan.name} delay={i * 0.08}>
              <div
                className={`relative flex flex-col rounded-2xl border p-7 md:p-9 ${
                  plan.highlight
                    ? "border-accent-primary bg-card-bg shadow-xl shadow-accent-primary/10"
                    : "border-card-border bg-card-bg"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent-primary px-4 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                )}

                <p className="font-display text-lg font-bold">{plan.name}</p>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold tracking-tight">
                    ${yearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-text-muted">
                    /{yearly ? "year" : "mo"}
                  </span>
                </div>
                {yearly && (
                  <p className="mt-1 text-xs text-text-muted">
                    ${(plan.yearlyPrice / 12).toFixed(2)}/mo billed annually
                  </p>
                )}

                <ul className="mt-7 flex flex-col gap-3">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2.5 text-sm text-text-secondary"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-8">
                  <Link
                    href={`/signup?plan=${plan.planId}&interval=${yearly ? "yearly" : "monthly"}`}
                    className={`block w-full rounded-full py-3 text-center text-sm font-medium transition-all ${
                      plan.highlight
                        ? "bg-accent-primary text-white hover:opacity-90 hover:shadow-md"
                        : "border border-card-border text-text-primary hover:border-accent-primary hover:text-accent-primary"
                    }`}
                  >
                    {plan.cta}
                  </Link>
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
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const { data: session } = useSession();

  useMotionValueEvent(scrollY, "change", (v) => {
    setScrolled(v > 40);
  });

  return (
    <div className="min-h-screen bg-page-bg text-text-primary font-body">
      {/* ── NAV ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md border-b border-card-border shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="font-display text-xl font-bold tracking-tight">
              Nurplix
            </span>
            <span className="text-xs font-medium uppercase tracking-widest text-text-muted">
              Command Center
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {session?.user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-primary text-xs font-bold text-white overflow-hidden"
                >
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    getInitials(session.user.name)
                  )}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:inline-flex items-center text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="#pricing"
                  className="rounded-full bg-accent-primary px-5 py-2 text-sm font-medium text-white transition-all hover:opacity-90 hover:shadow-md"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-32 pb-16 md:pt-44 md:pb-24">
        {/* subtle decorative circles */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-accent-primary/5" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-[360px] w-[360px] rounded-full bg-accent-primary/[0.03]" />

        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <FadeUp>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight">
              Your social media
              <br />
              empire,{" "}
              <span className="italic text-accent-primary">one dashboard</span>
            </h1>
          </FadeUp>

          <FadeUp delay={0.12}>
            <p className="mx-auto mt-6 max-w-xl text-lg text-text-secondary leading-relaxed md:text-xl">
              AI-powered analytics, brand deal CRM, goal tracking, and
              daily journaling — everything creators need to grow smarter.
            </p>
          </FadeUp>

          <FadeUp delay={0.22}>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="#pricing"
                className="inline-flex items-center gap-2 rounded-full bg-accent-primary px-8 py-3 text-base font-medium text-white transition-all hover:opacity-90 hover:shadow-lg"
              >
                View plans
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-1.5 rounded-full border border-card-border px-8 py-3 text-base font-medium text-text-secondary transition-colors hover:border-accent-primary hover:text-accent-primary"
              >
                See how it works
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </FadeUp>

          {/* Dashboard mockup */}
          <FadeUp delay={0.35}>
            <div className="mx-auto mt-16 max-w-4xl">
              <div className="overflow-hidden rounded-xl border border-card-border bg-white shadow-2xl shadow-black/5">
                {/* Browser toolbar */}
                <div className="flex items-center gap-2 border-b border-card-border bg-[#fafaf8] px-4 py-3">
                  <span className="h-3 w-3 rounded-full bg-[#ee6a5f]" />
                  <span className="h-3 w-3 rounded-full bg-[#f5bf4f]" />
                  <span className="h-3 w-3 rounded-full bg-[#62c554]" />
                  <div className="ml-4 flex-1">
                    <div className="mx-auto h-5 w-56 rounded-md bg-card-border/60" />
                  </div>
                </div>

                {/* Dashboard content */}
                <div className="p-5 md:p-8">
                  {/* Top metric cards */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                    {[
                      { label: "Followers", value: "24.8K", change: "+12.3%" },
                      { label: "Engagement", value: "4.7%", change: "+0.8%" },
                      { label: "Impressions", value: "1.2M", change: "+23%" },
                      { label: "Revenue", value: "$3,420", change: "+18.5%" },
                    ].map((m) => (
                      <div
                        key={m.label}
                        className="rounded-lg border border-card-border bg-page-bg/60 p-3 md:p-4"
                      >
                        <p className="text-xs text-text-muted">{m.label}</p>
                        <p className="mt-1 font-display text-lg font-bold md:text-xl">
                          {m.value}
                        </p>
                        <p className="mt-0.5 text-xs font-medium text-success">
                          {m.change}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Fake chart area */}
                  <div className="mt-5 rounded-lg border border-card-border bg-page-bg/40 p-4 md:p-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-text-secondary">
                        Audience Growth
                      </p>
                      <p className="text-xs text-text-muted">Last 30 days</p>
                    </div>
                    <div className="relative mt-4 h-28 w-full md:h-36">
                      <svg
                        viewBox="0 0 400 120"
                        className="h-full w-full"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <linearGradient
                            id="chartGrad"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#c4947a"
                              stopOpacity="0.25"
                            />
                            <stop
                              offset="100%"
                              stopColor="#c4947a"
                              stopOpacity="0"
                            />
                          </linearGradient>
                        </defs>
                        <path
                          d="M0 100 Q30 95 60 85 T120 70 T180 55 T240 50 T300 35 T360 28 T400 15"
                          fill="none"
                          stroke="#c4947a"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M0 100 Q30 95 60 85 T120 70 T180 55 T240 50 T300 35 T360 28 T400 15 L400 120 L0 120Z"
                          fill="url(#chartGrad)"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <FadeUp>
            <p className="text-center text-sm font-medium uppercase tracking-widest text-accent-primary">
              Everything you need
            </p>
            <h2 className="mt-3 text-center font-display text-3xl font-bold tracking-tight md:text-4xl">
              Built for creators who mean business
            </h2>
          </FadeUp>

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {[
              {
                icon: BarChart3,
                title: "Every platform, one view",
                body: "Connect Instagram, YouTube, and Facebook to see all your analytics unified in a single, beautiful dashboard.",
              },
              {
                icon: Sparkles,
                title: "AI that actually helps",
                body: "Daily briefings on what\u2019s working, what\u2019s flopping, and what to post next \u2014 powered by real data, not guesswork.",
              },
              {
                icon: Handshake,
                title: "Brand deal CRM",
                body: "Manage your entire brand partnership pipeline from inquiry to payment with drag-and-drop kanban boards.",
              },
              {
                icon: Target,
                title: "Your personal HQ",
                body: "Goal tracking, daily journaling, task management, and calendar \u2014 all in one space designed for focus.",
              },
            ].map((f, i) => (
              <FadeUp key={f.title} delay={i * 0.08}>
                <div className="group rounded-2xl border border-card-border bg-card-bg p-7 transition-all hover:border-accent-primary/40 hover:shadow-lg hover:shadow-accent-primary/5 md:p-9">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-primary/10 text-accent-primary transition-colors group-hover:bg-accent-primary group-hover:text-white">
                    <f.icon className="h-5 w-5" strokeWidth={1.8} />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold">
                    {f.title}
                  </h3>
                  <p className="mt-2 leading-relaxed text-text-secondary">
                    {f.body}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <FadeUp>
            <p className="text-center text-sm font-medium uppercase tracking-widest text-accent-primary">
              Simple as 1-2-3
            </p>
            <h2 className="mt-3 text-center font-display text-3xl font-bold tracking-tight md:text-4xl">
              Up and running in minutes
            </h2>
          </FadeUp>

          <div className="relative mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
            {/* connecting line (desktop) */}
            <div className="pointer-events-none absolute top-7 left-[16.67%] right-[16.67%] hidden h-px bg-card-border md:block" />

            {[
              {
                step: "1",
                title: "Connect your accounts",
                body: "Link Instagram, YouTube, and Facebook in seconds. We handle all the OAuth so you don\u2019t have to.",
              },
              {
                step: "2",
                title: "Get AI-powered insights",
                body: "Daily briefings tell you exactly what\u2019s working, surface trends, and recommend your next move.",
              },
              {
                step: "3",
                title: "Grow your empire",
                body: "Make data-driven decisions, close more brand deals, and watch your audience grow week after week.",
              },
            ].map((s, i) => (
              <FadeUp key={s.step} delay={i * 0.12}>
                <div className="flex flex-col items-center text-center">
                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-accent-primary font-display text-lg font-bold text-white shadow-md shadow-accent-primary/20">
                    {s.step}
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold">
                    {s.title}
                  </h3>
                  <p className="mt-2 max-w-xs leading-relaxed text-text-secondary">
                    {s.body}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <PricingSection />


      {/* ── FINAL CTA ── */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent-primary/[0.06] via-transparent to-accent-primary/[0.04]" />
        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <FadeUp>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
              Ready to see what&apos;s working?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-lg text-text-secondary">
              Start growing smarter today.
            </p>
            <div className="mt-10">
              <Link
                href="#pricing"
                className="inline-flex items-center gap-2 rounded-full bg-accent-primary px-10 py-4 text-base font-medium text-white transition-all hover:opacity-90 hover:shadow-lg"
              >
                Choose your plan
                <ArrowRight className="h-4 w-4" />
              </Link>
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
                <span className="font-display text-lg font-bold tracking-tight">
                  Nurplix
                </span>
                <span className="text-xs font-medium uppercase tracking-widest text-text-muted">
                  Command Center
                </span>
              </Link>
              <p className="mt-1 text-sm text-text-muted">
                Built with love for creators
              </p>
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
                <Link
                  key={link.label}
                  href={link.href}
                  className="transition-colors hover:text-text-primary"
                >
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
