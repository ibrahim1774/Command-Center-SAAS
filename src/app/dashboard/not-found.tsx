import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default function DashboardNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card padding="lg" className="max-w-md text-center">
        <h1 className="font-display text-5xl font-bold text-accent-primary mb-3">404</h1>
        <h2 className="font-display text-lg text-text-primary mb-2">Page not found</h2>
        <p className="text-sm text-text-secondary mb-6">
          This dashboard page doesn&apos;t exist.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center px-5 py-2 bg-accent-primary text-white text-sm font-medium rounded-full hover:bg-accent-primary/90 transition-colors"
        >
          Back to Overview
        </Link>
      </Card>
    </div>
  );
}
