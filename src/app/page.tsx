"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  useInView,
} from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
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
   Platform icons
   ───────────────────────────────────────────── */
function PlatformLogos() {
  const iconClass = "h-6 w-6 opacity-50";
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-xs font-medium text-text-muted mr-0.5">Works with</span>
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
  );
}

/* ─────────────────────────────────────────────
   FAQ accordion item
   ───────────────────────────────────────────── */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-card-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left cursor-pointer"
      >
        <span className="text-base font-medium text-text-primary pr-4">{question}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        className="overflow-hidden"
      >
        <p className="pb-5 text-base leading-relaxed text-text-secondary">{answer}</p>
      </motion.div>
    </div>
  );
}

/* ═════════════════════════════════════════════
   PAGE
   ═════════════════════════════════════════════ */
function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const { data: session } = useSession();
  const heroRef = useRef<HTMLElement>(null);
  const [pastHero, setPastHero] = useState(false);

  useMotionValueEvent(scrollY, "change", (v) => {
    setScrolled(v > 40);
    setPastHero(v > 600);
  });

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
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
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
                <Link href="/login" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="rounded-full bg-accent-primary px-5 py-2 text-sm font-semibold text-white transition-all hover:opacity-90"
                >
                  Try Nurplix Free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── FLOATING MOBILE CTA ── */}
      <motion.div
        initial={false}
        animate={{ y: pastHero ? 0 : 80 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-md border-t border-card-border px-4 py-3"
      >
        <Link
          href="/signup"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-accent-primary py-3.5 text-base font-semibold text-white"
        >
          Try Nurplix Free <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="mt-1.5 text-center text-xs text-text-muted">
          3-day free trial · No charge until day 4
        </p>
      </motion.div>

      {/* ══════════════════════════════════════
         SECTION 1: HERO
         ══════════════════════════════════════ */}
      <section ref={heroRef} className="relative overflow-hidden pt-20 pb-8 md:pt-32 md:pb-20">
        <div className="pointer-events-none absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-accent-primary/5" />

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
            {/* Left — Copy */}
            <div>
              <FadeUp>
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight text-text-primary">
                  Your social media, brand deals, and goals{" "}
                  <span className="text-accent-primary">Claude command center.</span>
                </h1>
              </FadeUp>

              <FadeUp delay={0.1}>
                <div className="mt-4 md:mt-5 space-y-2.5">
                  <p className="text-base text-text-secondary leading-relaxed md:text-lg">
                    Pull your followers, engagement, and brand deals from Instagram, YouTube, TikTok, and Facebook — automatically. Plus AI that shows you what&apos;s working and what&apos;s not.
                  </p>
                </div>
              </FadeUp>

              <FadeUp delay={0.18}>
                <div className="mt-5 md:mt-7">
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 rounded-full bg-accent-primary px-8 py-3.5 min-h-[48px] text-base font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg w-full sm:w-auto justify-center"
                  >
                    Try Nurplix Free
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <p className="mt-3 text-sm text-text-muted">
                    3-day free trial · Cancel in two clicks · No charge until day 4
                  </p>
                </div>
              </FadeUp>

              <FadeUp delay={0.24}>
                <div className="mt-4 md:mt-6">
                  <PlatformLogos />
                </div>
              </FadeUp>
            </div>

            {/* Right — Screenshot */}
            <FadeUp delay={0.15}>
              <div className="relative">
                <Image
                  src="/SCR-20260402-ngtw.png"
                  alt="Nurplix overview dashboard showing aggregated follower metrics, AI daily briefing, and What's Working / What's Flopping cards"
                  width={1200}
                  height={800}
                  priority
                  className="w-full rounded-xl border border-card-border shadow-2xl shadow-black/5 max-h-[220px] md:max-h-none object-cover object-top"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
         SECTION 2: PAIN AGITATION
         ══════════════════════════════════════ */}
      <section className="py-8 md:py-12 bg-white">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <FadeUp>
            <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
              Sound familiar?
            </h2>
          </FadeUp>
          <FadeUp delay={0.1}>
            <p className="mt-5 text-base leading-relaxed text-text-secondary md:text-lg">
              You check four apps every morning just to see your numbers. Brand deals are buried in your inbox. You don&apos;t know which posts actually grew your audience.
            </p>
          </FadeUp>
          <FadeUp delay={0.2}>
            <p className="mt-5 font-display text-xl font-bold text-text-primary md:text-2xl">
              There&apos;s a better way.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════════════════
         SECTION 3: CORE VALUE BLOCKS
         ══════════════════════════════════════ */}
      <section className="py-10 md:py-14">
        <div className="mx-auto max-w-6xl px-6">
          {/* Block 1: AI Insights — image right */}
          <div className="grid items-center gap-8 md:grid-cols-2">
            <FadeUp>
              <div>
                <p className="text-sm font-medium uppercase tracking-widest text-accent-primary mb-2">
                  AI Insights
                </p>
                <h3 className="font-display text-2xl font-bold text-text-primary md:text-3xl">
                  Know what to double down on.
                </h3>
                <p className="mt-3 text-base leading-relaxed text-text-secondary">
                  AI splits your posts into &ldquo;Working&rdquo; and &ldquo;Flopping&rdquo; cards with real numbers. No guessing.
                </p>
              </div>
            </FadeUp>
            <FadeUp delay={0.1}>
              <Image
                src="/SCR-20260402-nicv.png"
                alt="AI analysis cards showing What's Working and What's Flopping with specific engagement metrics"
                width={1200}
                height={800}
                className="w-full rounded-xl border border-card-border shadow-lg"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </FadeUp>
          </div>

          {/* Block 2: Brand Deals — image left */}
          <div className="mt-14 md:mt-20 grid items-center gap-8 md:grid-cols-2">
            <FadeUp className="order-2 md:order-1">
              <Image
                src="/SCR-20260402-nieu.png"
                alt="Brand deals CRM showing deal pipeline with company names, dollar amounts, payment status, and monthly earnings chart"
                width={1200}
                height={800}
                className="w-full rounded-xl border border-card-border shadow-lg"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </FadeUp>
            <FadeUp delay={0.1} className="order-1 md:order-2">
              <div>
                <p className="text-sm font-medium uppercase tracking-widest text-accent-primary mb-2">
                  Brand Deals
                </p>
                <h3 className="font-display text-2xl font-bold text-text-primary md:text-3xl">
                  Track every deal. Pitch to payment.
                </h3>
                <p className="mt-3 text-base leading-relaxed text-text-secondary">
                  Pipeline value, pending payouts, monthly earnings. Every deal has a card. Nothing slips through.
                </p>
              </div>
            </FadeUp>
          </div>

          {/* Block 3: Trends — image right */}
          <div className="mt-14 md:mt-20 grid items-center gap-8 md:grid-cols-2">
            <FadeUp>
              <div>
                <p className="text-sm font-medium uppercase tracking-widest text-accent-primary mb-2">
                  Trends
                </p>
                <h3 className="font-display text-2xl font-bold text-text-primary md:text-3xl">
                  Catch what&apos;s blowing up first.
                </h3>
                <p className="mt-3 text-base leading-relaxed text-text-secondary">
                  Weekly trend reports with viral scores, top hashtags, and the topics gaining traction in your niche.
                </p>
              </div>
            </FadeUp>
            <FadeUp delay={0.1}>
              <Image
                src="/SCR-20260403-kybm.png"
                alt="Cross-platform trend report showing viral score, platform breakdown, and AI recommendations"
                width={1200}
                height={800}
                className="w-full rounded-xl border border-card-border shadow-lg"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </FadeUp>
          </div>

          {/* CTA #2 — contextually earned */}
          <FadeUp>
            <div className="mt-16 text-center">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-accent-primary px-8 py-3.5 min-h-[48px] text-base font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg"
              >
                Try Nurplix Free <ArrowRight className="h-5 w-5" />
              </Link>
              <p className="mt-3 text-sm text-text-muted">
                3-day free trial · Cancel in two clicks · No charge until day 4
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════════════════
         SECTION 4: HOW IT WORKS
         ══════════════════════════════════════ */}
      <section className="py-8 md:py-12 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <FadeUp>
            <p className="text-center text-sm font-medium uppercase tracking-widest text-accent-primary">
              How it works
            </p>
            <h2 className="mt-2 text-center font-display text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
              Set up in 2 minutes.
            </h2>
          </FadeUp>

          <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-6">
            {[
              {
                step: "1",
                icon: <UserPlus className="h-5 w-5" />,
                title: "Connect your accounts",
                body: "Enter your username. That's it.",
              },
              {
                step: "2",
                icon: <Zap className="h-5 w-5" />,
                title: "See your data",
                body: "Dashboard fills in 90 seconds.",
              },
              {
                step: "3",
                icon: <Rocket className="h-5 w-5" />,
                title: "Post smarter",
                body: "AI tells you what's working and what's not.",
              },
            ].map((s, i) => (
              <FadeUp key={s.step} delay={i * 0.1}>
                <div className="flex flex-col items-center text-center">
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-accent-primary text-white shadow-md shadow-accent-primary/20">
                    {s.icon}
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-text-primary">
                    {s.title}
                  </h3>
                  <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-text-secondary">
                    {s.body}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>

          <FadeUp delay={0.3}>
            <p className="mt-8 text-center text-sm text-text-muted">
              Also includes: goal tracking, daily journal, task manager, and trending Google headlines.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════════════════
         SECTION 7: FAQ
         ══════════════════════════════════════ */}
      <section className="py-8 md:py-14">
        <div className="mx-auto max-w-3xl px-6">
          <FadeUp>
            <h2 className="text-center font-display text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
              Questions you might have
            </h2>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="mt-8">
              <FAQItem
                question="Is it safe to connect my accounts?"
                answer="Yes. Read-only access. We see your public data. We can't post, delete, or change anything."
              />
              <FAQItem
                question="How is this different from free analytics?"
                answer="Free analytics show one platform at a time. Nurplix shows all of them — plus AI analysis, deal tracking, and trends."
              />
              <FAQItem
                question="Can I cancel easily?"
                answer="Two clicks. Settings → Cancel. No calls, no emails. Cancel in 3 days and you're never charged."
              />
              <FAQItem
                question="Never heard of Nurplix. Why trust you?"
                answer="We're new. The product works. Try it free for 3 days. If it's not useful, cancel. You lose nothing."
              />
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════════════════
         SECTION 8: FINAL CTA
         ══════════════════════════════════════ */}
      <section className="relative overflow-hidden py-14 md:py-20">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent-primary/[0.06] via-transparent to-accent-primary/[0.04]" />
        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <FadeUp>
            <h2 className="font-display text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
              Your Claude command center for analytics, deals, and trends.
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-lg text-text-secondary">
              Get your first AI insights in under 2 minutes.
            </p>
            <div className="mt-6">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-accent-primary px-10 py-4 min-h-[48px] text-lg font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg w-full sm:w-auto justify-center"
              >
                Try Nurplix Free
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            <p className="mt-3 text-sm text-text-muted">
              No charge for 3 days · Cancel in two clicks
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-card-border bg-white py-8 pb-24 md:pb-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
            <div>
              <Link href="/" className="flex items-baseline gap-2">
                <span className="font-display text-lg font-bold tracking-tight">Nurplix</span>
              </Link>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-text-secondary">
              {[
                { label: "Pricing", href: "/pricing" },
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
