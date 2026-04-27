import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-body text-[#6b6b6b] hover:text-[#c4947a] transition-colors mb-12"
        >
          <span className="mr-2">&larr;</span> Back to Home
        </Link>

        <h1 className="font-display text-4xl md:text-5xl text-[#2c2c2c] mb-4">
          Contact Us
        </h1>
        <p className="font-body text-lg text-[#6b6b6b] mb-12">
          We&apos;d love to hear from you
        </p>

        <div className="border border-[#e8e6e1] rounded-2xl bg-white p-8 md:p-10 mb-10">
          <h2 className="font-display text-2xl text-[#2c2c2c] mb-2">
            Get in Touch
          </h2>
          <p className="font-body text-[#6b6b6b] mb-6">
            Reach out to us directly via email.
          </p>
          <p className="font-body text-[#2c2c2c]">
            Email:{" "}
            <a
              href="mailto:support@davoxa.com"
              className="text-[#c4947a] hover:underline"
            >
              support@davoxa.com
            </a>
          </p>
          <p className="font-body text-sm text-[#6b6b6b] mt-3">
            We typically respond within 24 hours
          </p>
        </div>

        <div className="border border-[#e8e6e1] rounded-2xl bg-white p-8 md:p-10 mb-10">
          <h2 className="font-display text-2xl text-[#2c2c2c] mb-6">
            Common Topics
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-body font-semibold text-[#2c2c2c] mb-1">
                Account &amp; Billing
              </h3>
              <p className="font-body text-[#6b6b6b]">
                For subscription changes, visit your Settings page
              </p>
            </div>
            <div>
              <h3 className="font-body font-semibold text-[#2c2c2c] mb-1">
                Platform Connections
              </h3>
              <p className="font-body text-[#6b6b6b]">
                Having trouble connecting Instagram, YouTube, or Facebook? Check
                our FAQ
              </p>
            </div>
            <div>
              <h3 className="font-body font-semibold text-[#2c2c2c] mb-1">
                Bug Reports
              </h3>
              <p className="font-body text-[#6b6b6b]">
                Found a bug? Email us with details and we&apos;ll investigate
              </p>
            </div>
            <div>
              <h3 className="font-body font-semibold text-[#2c2c2c] mb-1">
                Feature Requests
              </h3>
              <p className="font-body text-[#6b6b6b]">
                We love hearing what creators need. Send us your ideas!
              </p>
            </div>
          </div>
        </div>

        <p className="font-body text-center text-sm text-[#6b6b6b]">
          Nurplix is built with love for creators
        </p>
      </div>
    </div>
  );
}
