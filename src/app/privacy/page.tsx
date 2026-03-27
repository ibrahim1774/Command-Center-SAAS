import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Nurplix",
  description: "Privacy Policy for Nurplix — Your Social Media Command Center.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[#c4947a] font-body text-sm tracking-wide hover:opacity-80 transition-opacity mb-12"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        <header className="mb-16">
          <h1 className="font-display text-4xl md:text-5xl text-[#2c2c2c] tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="font-body text-sm text-[#6b6b6b] tracking-wide uppercase">
            Last Updated — March 27, 2026
          </p>
        </header>

        <div className="space-y-12">
          {/* Introduction */}
          <section>
            <h2 className="font-display text-2xl text-[#2c2c2c] mb-4">
              Introduction
            </h2>
            <p className="font-body text-[#6b6b6b] leading-relaxed">
              Welcome to Command Center, a product by Nurplix. We are a social
              media analytics platform designed for creators who want meaningful
              insights into their audience and content performance. This Privacy
              Policy explains how we collect, use, store, and protect your
              information when you use our services. By using Command Center, you
              agree to the practices described in this policy.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="font-display text-2xl text-[#2c2c2c] mb-4">
              Information We Collect
            </h2>
            <div className="space-y-6 font-body text-[#6b6b6b] leading-relaxed">
              <div>
                <h3 className="font-body font-semibold text-[#2c2c2c] mb-1.5">
                  Account Information
                </h3>
                <p>
                  When you sign up, we collect your name and email address
                  through Google Sign-In or Facebook Sign-In via NextAuth. We do
                  not collect or store your Google or Facebook passwords.
                </p>
              </div>
              <div>
                <h3 className="font-body font-semibold text-[#2c2c2c] mb-1.5">
                  Social Media Data
                </h3>
                <p>
                  When you connect your Instagram, YouTube, or Facebook
                  accounts, we access data such as posts, follower counts,
                  engagement metrics, and audience demographics through the
                  respective platform APIs. This data is used solely to provide
                  you with analytics and insights.
                </p>
              </div>
              <div>
                <h3 className="font-body font-semibold text-[#2c2c2c] mb-1.5">
                  Payment Information
                </h3>
                <p>
                  Subscription payments are processed entirely by Stripe. We do
                  not store your credit card number or full payment details on
                  our servers. We retain only the information necessary to manage
                  your subscription, such as your Stripe customer ID and
                  subscription status.
                </p>
              </div>
              <div>
                <h3 className="font-body font-semibold text-[#2c2c2c] mb-1.5">
                  Usage Data
                </h3>
                <p>
                  We collect information about how you interact with Command
                  Center, including pages visited, features used, and general
                  usage patterns. This helps us improve the product experience.
                </p>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="font-display text-2xl text-[#2c2c2c] mb-4">
              How We Use Your Information
            </h2>
            <ul className="font-body text-[#6b6b6b] leading-relaxed space-y-2.5 list-disc list-outside ml-5">
              <li>
                Provide comprehensive analytics across your connected social
                media platforms.
              </li>
              <li>
                Generate AI-powered insights and recommendations to help you
                grow your audience and optimize content strategy.
              </li>
              <li>
                Process subscription payments and manage your billing through
                Stripe.
              </li>
              <li>
                Improve and refine the Command Center platform, including
                performance, reliability, and feature development.
              </li>
              <li>
                Communicate important updates about your account or changes to
                our services.
              </li>
            </ul>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="font-display text-2xl text-[#2c2c2c] mb-4">
              Third-Party Services
            </h2>
            <p className="font-body text-[#6b6b6b] leading-relaxed mb-6">
              We rely on trusted third-party services to operate Command Center.
              Each service has its own privacy policy governing how they handle
              your data.
            </p>
            <div className="space-y-6 font-body text-[#6b6b6b] leading-relaxed">
              <div>
                <h3 className="font-body font-semibold text-[#2c2c2c] mb-1.5">
                  Google
                </h3>
                <p>
                  Used for OAuth authentication (Google Sign-In) and YouTube
                  Data API access. Subject to{" "}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#c4947a] underline underline-offset-2 hover:opacity-80 transition-opacity"
                  >
                    Google&apos;s Privacy Policy
                  </a>
                  .
                </p>
              </div>
              <div>
                <h3 className="font-body font-semibold text-[#2c2c2c] mb-1.5">
                  Meta
                </h3>
                <p>
                  Used for OAuth authentication (Facebook Sign-In) and access to
                  Instagram and Facebook platform APIs. Subject to{" "}
                  <a
                    href="https://www.facebook.com/privacy/policy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#c4947a] underline underline-offset-2 hover:opacity-80 transition-opacity"
                  >
                    Meta&apos;s Privacy Policy
                  </a>
                  .
                </p>
              </div>
              <div>
                <h3 className="font-body font-semibold text-[#2c2c2c] mb-1.5">
                  Stripe
                </h3>
                <p>
                  Handles all payment processing for subscriptions. Subject to{" "}
                  <a
                    href="https://stripe.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#c4947a] underline underline-offset-2 hover:opacity-80 transition-opacity"
                  >
                    Stripe&apos;s Privacy Policy
                  </a>
                  .
                </p>
              </div>
              <div>
                <h3 className="font-body font-semibold text-[#2c2c2c] mb-1.5">
                  Supabase
                </h3>
                <p>
                  Provides database hosting and infrastructure for storing your
                  account and analytics data. Subject to{" "}
                  <a
                    href="https://supabase.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#c4947a] underline underline-offset-2 hover:opacity-80 transition-opacity"
                  >
                    Supabase&apos;s Privacy Policy
                  </a>
                  .
                </p>
              </div>
              <div>
                <h3 className="font-body font-semibold text-[#2c2c2c] mb-1.5">
                  Anthropic
                </h3>
                <p>
                  Powers our AI-driven insights and analysis features using the
                  Claude API. We send only anonymized and aggregated metrics to
                  Anthropic for processing — raw content from your social media
                  accounts is never shared. Subject to{" "}
                  <a
                    href="https://www.anthropic.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#c4947a] underline underline-offset-2 hover:opacity-80 transition-opacity"
                  >
                    Anthropic&apos;s Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </div>
          </section>

          {/* Data Storage & Security */}
          <section>
            <h2 className="font-display text-2xl text-[#2c2c2c] mb-4">
              Data Storage &amp; Security
            </h2>
            <div className="font-body text-[#6b6b6b] leading-relaxed space-y-3">
              <p>
                Your data is stored securely using Supabase&apos;s managed
                database infrastructure, which provides encryption at rest and
                in transit.
              </p>
              <p>
                OAuth access tokens for your connected social media platforms are
                encrypted before being stored in our database.
              </p>
              <p>
                All communication between your browser and Command Center is
                encrypted via HTTPS.
              </p>
              <p>
                While we implement industry-standard security measures to
                protect your information, no method of transmission or storage is
                completely secure. We are committed to promptly addressing any
                security concerns that may arise.
              </p>
            </div>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="font-display text-2xl text-[#2c2c2c] mb-4">
              Data Retention
            </h2>
            <div className="font-body text-[#6b6b6b] leading-relaxed space-y-3">
              <p>
                We retain your data for as long as your account remains active
                and as needed to provide you with our services.
              </p>
              <p>
                If you choose to delete your account, we will remove your
                personal data and associated analytics data within 30 days of
                your request. Some data may be retained in anonymized form for
                aggregate analytics purposes.
              </p>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="font-display text-2xl text-[#2c2c2c] mb-4">
              Your Rights
            </h2>
            <p className="font-body text-[#6b6b6b] leading-relaxed mb-4">
              You have the following rights regarding your personal data:
            </p>
            <ul className="font-body text-[#6b6b6b] leading-relaxed space-y-2.5 list-disc list-outside ml-5">
              <li>
                <span className="font-semibold text-[#2c2c2c]">Access</span>{" "}
                — Request a copy of the personal data we hold about you.
              </li>
              <li>
                <span className="font-semibold text-[#2c2c2c]">
                  Correction
                </span>{" "}
                — Request corrections to any inaccurate or incomplete personal
                data.
              </li>
              <li>
                <span className="font-semibold text-[#2c2c2c]">Deletion</span>{" "}
                — Request the deletion of your account and associated data.
              </li>
              <li>
                <span className="font-semibold text-[#2c2c2c]">
                  Disconnect Platforms
                </span>{" "}
                — Revoke access to any connected social media platform at any
                time from your account settings. This immediately stops data
                collection from that platform.
              </li>
            </ul>
            <p className="font-body text-[#6b6b6b] leading-relaxed mt-4">
              To exercise any of these rights, please contact us at{" "}
              <a
                href="mailto:support@nurplix.com"
                className="text-[#c4947a] underline underline-offset-2 hover:opacity-80 transition-opacity"
              >
                support@nurplix.com
              </a>
              .
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="font-display text-2xl text-[#2c2c2c] mb-4">
              Cookies
            </h2>
            <div className="font-body text-[#6b6b6b] leading-relaxed space-y-3">
              <p>
                Command Center uses session cookies that are essential for
                authentication and maintaining your logged-in state. These
                cookies are strictly necessary for the platform to function.
              </p>
              <p>
                We do not use third-party tracking cookies, and we do not share
                cookie data with advertisers or external analytics services.
              </p>
            </div>
          </section>

          {/* Changes to This Policy */}
          <section>
            <h2 className="font-display text-2xl text-[#2c2c2c] mb-4">
              Changes to This Policy
            </h2>
            <p className="font-body text-[#6b6b6b] leading-relaxed">
              We may update this Privacy Policy from time to time to reflect
              changes in our practices, technology, or legal requirements. When
              we make significant changes, we will notify you via the email
              address associated with your account. We encourage you to review
              this page periodically for the latest information on our privacy
              practices.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="font-display text-2xl text-[#2c2c2c] mb-4">
              Contact Us
            </h2>
            <p className="font-body text-[#6b6b6b] leading-relaxed">
              If you have any questions, concerns, or requests regarding this
              Privacy Policy or how we handle your data, please reach out to us
              at{" "}
              <a
                href="mailto:support@nurplix.com"
                className="text-[#c4947a] underline underline-offset-2 hover:opacity-80 transition-opacity"
              >
                support@nurplix.com
              </a>
              .
            </p>
          </section>
        </div>

        <footer className="mt-20 pt-8 border-t border-[#e5e2dc]">
          <p className="font-body text-xs text-[#6b6b6b] tracking-wide">
            &copy; 2026 Nurplix. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
