import Link from "next/link";

export const metadata = {
  title: "Terms of Service | Nurplix",
  description: "Terms of Service for Nurplix — Your Social Media Claude Command Center.",
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-body text-[#c4947a] hover:opacity-80 transition-opacity mb-12"
        >
          <svg
            className="w-4 h-4 mr-1.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Home
        </Link>

        <h1 className="font-display text-4xl md:text-5xl text-[#2c2c2c] mb-4">
          Terms of Service
        </h1>
        <p className="font-body text-[#6b6b6b] text-lg mb-12">
          Claude Command Center by Nurplix
        </p>

        {/* Last Updated */}
        <p className="font-body text-sm text-[#6b6b6b] mb-10 border-b border-[#e5e2dc] pb-6">
          Last Updated: March 27, 2026
        </p>

        {/* 1. Acceptance of Terms */}
        <section className="mb-10">
          <h2 className="font-display text-2xl text-[#2c2c2c] mb-4">
            1. Acceptance of Terms
          </h2>
          <p className="font-body text-[#6b6b6b] leading-relaxed">
            By accessing or using Claude Command Center (&quot;the Service&quot;),
            operated by Nurplix (&quot;we,&quot; &quot;us,&quot; or
            &quot;our&quot;), you agree to be bound by these Terms of Service.
            If you do not agree to all of these terms, you may not access or use
            the Service. These Terms constitute a legally binding agreement
            between you and Nurplix governing your use of the Service.
          </p>
        </section>

        {/* 2. Description of Service */}
        <section className="mb-10">
          <h2 className="font-display text-2xl text-[#2c2c2c] mb-4">
            2. Description of Service
          </h2>
          <p className="font-body text-[#6b6b6b] leading-relaxed mb-4">
            Claude Command Center is a social media analytics dashboard designed for
            creators and businesses. The Service provides the following
            features:
          </p>
          <ul className="font-body text-[#6b6b6b] leading-relaxed list-disc pl-6 space-y-2">
            <li>
              Integration with social media platforms including Instagram,
              YouTube, and Facebook for analytics and performance tracking
            </li>
            <li>
              AI-powered insights and recommendations to help optimize your
              content strategy
            </li>
            <li>
              Brand deal CRM for managing partnerships, outreach, and
              collaboration opportunities
            </li>
            <li>
              Goal setting, tracking, and journaling tools to support your
              growth as a creator
            </li>
          </ul>
          <p className="font-body text-[#6b6b6b] leading-relaxed mt-4">
            Features may vary depending on your subscription plan and are
            subject to change as we continue to improve the Service.
          </p>
        </section>

        {/* 3. Account Registration */}
        <section className="mb-10">
          <h2 className="font-display text-2xl text-[#2c2c2c] mb-4">
            3. Account Registration
          </h2>
          <p className="font-body text-[#6b6b6b] leading-relaxed mb-4">
            To use the Service, you must create an account. By registering, you
            represent and warrant that:
          </p>
          <ul className="font-body text-[#6b6b6b] leading-relaxed list-disc pl-6 space-y-2">
            <li>You are at least 13 years of age</li>
            <li>
              All registration information you provide is truthful, accurate,
              and complete
            </li>
            <li>
              You will maintain the accuracy of such information and update it
              as necessary
            </li>
            <li>
              You are responsible for safeguarding your account credentials and
              for all activity that occurs under your account
            </li>
            <li>
              You will notify us immediately of any unauthorized use of your
              account
            </li>
          </ul>
          <p className="font-body text-[#6b6b6b] leading-relaxed mt-4">
            We reserve the right to suspend or terminate accounts that contain
            inaccurate or misleading information.
          </p>
        </section>

        {/* 4. Subscription Plans & Billing */}
        <section className="mb-10">
          <h2 className="font-display text-2xl text-[#2c2c2c] mb-4">
            4. Subscription Plans &amp; Billing
          </h2>
          <p className="font-body text-[#6b6b6b] leading-relaxed mb-4">
            Claude Command Center offers the following subscription tiers:
          </p>
          <ul className="font-body text-[#6b6b6b] leading-relaxed list-disc pl-6 space-y-2 mb-4">
            <li>
              <span className="text-[#2c2c2c] font-medium">Starter</span>{" "}
              &mdash; Free, with limited access to features
            </li>
            <li>
              <span className="text-[#2c2c2c] font-medium">Pro</span> &mdash;
              $29 per month, with expanded analytics and AI insights
            </li>
            <li>
              <span className="text-[#2c2c2c] font-medium">Business</span>{" "}
              &mdash; $79 per month, with full access to all features including
              advanced CRM and priority support
            </li>
          </ul>
          <p className="font-body text-[#6b6b6b] leading-relaxed mb-4">
            All paid subscriptions are billed through Stripe, our third-party
            payment processor. By subscribing to a paid plan, you authorize us
            to charge your payment method on a recurring monthly basis.
          </p>
          <p className="font-body text-[#6b6b6b] leading-relaxed mb-4">
            Paid subscriptions automatically renew at the end of each billing
            cycle unless you cancel before the renewal date. Cancellations take
            effect at the end of the current billing period, and you will retain
            access to paid features until that date.
          </p>
          <p className="font-body text-[#6b6b6b] leading-relaxed">
            No refunds will be issued for partial billing periods. If you
            downgrade or cancel mid-cycle, you will not receive a prorated
            refund for the remaining days in that period.
          </p>
        </section>

        {/* 5. Acceptable Use */}
        <section className="mb-10">
          <h2 className="font-display text-2xl text-[#2c2c2c] mb-4">
            5. Acceptable Use
          </h2>
          <p className="font-body text-[#6b6b6b] leading-relaxed mb-4">
            You agree to use the Service only for its intended purposes and in
            compliance with all applicable laws. You may not:
          </p>
          <ul className="font-body text-[#6b6b6b] leading-relaxed list-disc pl-6 space-y-2">
            <li>
              Abuse, disrupt, or interfere with the Service or its
              infrastructure
            </li>
            <li>
              Scrape, crawl, or use automated means to extract data from the
              Service
            </li>
            <li>
              Violate the terms of service of any third-party platform connected
              through the Service, including Instagram, YouTube, and Facebook
            </li>
            <li>
              Share, transfer, or allow others to use your account credentials
            </li>
            <li>
              Use the Service for any unlawful, fraudulent, or malicious purpose
            </li>
            <li>
              Attempt to reverse-engineer, decompile, or disassemble any part of
              the Service
            </li>
          </ul>
        </section>

        {/* 6. Intellectual Property */}
        <section className="mb-10">
          <h2 className="font-display text-2xl text-[#2c2c2c] mb-4">
            6. Intellectual Property
          </h2>
          <p className="font-body text-[#6b6b6b] leading-relaxed mb-4">
            The Service, including its design, features, code, branding, and all
            related intellectual property, is owned by Nurplix and is protected
            by applicable intellectual property laws. You may not copy,
            reproduce, or distribute any part of the Service without our prior
            written consent.
          </p>
          <p className="font-body text-[#6b6b6b] leading-relaxed">
            You retain full ownership of any data, content, and materials you
            provide through the Service. By using the Service, you grant Nurplix
            a limited, non-exclusive, worldwide license to access, process, and
            display your data solely for the purpose of providing and improving
            the Service. We will not sell your data to third parties.
          </p>
        </section>

        {/* 7. Third-Party Platforms */}
        <section className="mb-10">
          <h2 className="font-display text-2xl text-[#2c2c2c] mb-4">
            7. Third-Party Platforms
          </h2>
          <p className="font-body text-[#6b6b6b] leading-relaxed mb-4">
            The Service integrates with third-party platforms, including those
            operated by Google (YouTube) and Meta (Instagram, Facebook), by
            accessing their APIs. Your use of these integrations is subject to
            the respective terms of service and privacy policies of those
            platforms.
          </p>
          <p className="font-body text-[#6b6b6b] leading-relaxed">
            We are not responsible for any changes, limitations, or
            discontinuations of third-party APIs that may affect the
            availability or functionality of certain features within the
            Service. We will make reasonable efforts to adapt to such changes
            but cannot guarantee uninterrupted access to third-party data.
          </p>
        </section>

        {/* 8. Limitation of Liability */}
        <section className="mb-10">
          <h2 className="font-display text-2xl text-[#2c2c2c] mb-4">
            8. Limitation of Liability
          </h2>
          <p className="font-body text-[#6b6b6b] leading-relaxed mb-4">
            To the fullest extent permitted by applicable law, Nurplix and its
            officers, directors, employees, and agents shall not be liable for
            any indirect, incidental, special, consequential, or punitive
            damages, including but not limited to loss of profits, data,
            business opportunities, or goodwill, arising out of or in connection
            with your use of the Service.
          </p>
          <p className="font-body text-[#6b6b6b] leading-relaxed">
            The Service is provided on an &quot;as is&quot; and &quot;as
            available&quot; basis without warranties of any kind, whether express
            or implied, including but not limited to implied warranties of
            merchantability, fitness for a particular purpose, and
            non-infringement. Our total liability to you for any claims arising
            from your use of the Service shall not exceed the amount you paid to
            us in the twelve (12) months preceding the claim.
          </p>
        </section>

        {/* 9. Termination */}
        <section className="mb-10">
          <h2 className="font-display text-2xl text-[#2c2c2c] mb-4">
            9. Termination
          </h2>
          <p className="font-body text-[#6b6b6b] leading-relaxed mb-4">
            We reserve the right to suspend or terminate your access to the
            Service at any time, with or without notice, if we reasonably
            believe you have violated these Terms of Service or engaged in
            conduct that may harm the Service or other users.
          </p>
          <p className="font-body text-[#6b6b6b] leading-relaxed">
            You may delete your account at any time through the Service&apos;s
            account settings. Upon termination or account deletion, your right
            to use the Service will cease immediately. Any provisions of these
            Terms that by their nature should survive termination shall remain
            in effect, including intellectual property, limitation of liability,
            and governing law provisions.
          </p>
        </section>

        {/* 10. Changes to Terms */}
        <section className="mb-10">
          <h2 className="font-display text-2xl text-[#2c2c2c] mb-4">
            10. Changes to Terms
          </h2>
          <p className="font-body text-[#6b6b6b] leading-relaxed">
            We may update or modify these Terms of Service from time to time at
            our sole discretion. When we make material changes, we will update
            the &quot;Last Updated&quot; date at the top of this page and may
            notify you via email or through the Service. Your continued use of
            the Service after any such changes constitutes your acceptance of
            the revised Terms. We encourage you to review these Terms
            periodically.
          </p>
        </section>

        {/* 11. Governing Law */}
        <section className="mb-10">
          <h2 className="font-display text-2xl text-[#2c2c2c] mb-4">
            11. Governing Law
          </h2>
          <p className="font-body text-[#6b6b6b] leading-relaxed">
            These Terms of Service shall be governed by and construed in
            accordance with the laws of the United States, without regard to
            conflict of law principles. Any disputes arising out of or relating
            to these Terms or the Service shall be resolved in the federal or
            state courts located within the United States, and you consent to
            the personal jurisdiction of such courts.
          </p>
        </section>

        {/* 12. Contact */}
        <section className="mb-10 border-t border-[#e5e2dc] pt-10">
          <h2 className="font-display text-2xl text-[#2c2c2c] mb-4">
            12. Contact
          </h2>
          <p className="font-body text-[#6b6b6b] leading-relaxed">
            If you have any questions or concerns about these Terms of Service,
            please contact us at{" "}
            <a
              href="mailto:support@nurplix.com"
              className="text-[#c4947a] hover:opacity-80 transition-opacity"
            >
              support@nurplix.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
