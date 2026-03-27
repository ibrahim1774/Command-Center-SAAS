"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card padding="lg" className="max-w-md text-center">
        <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-xl text-danger font-display">!</span>
        </div>
        <h2 className="font-display text-xl text-text-primary mb-2">Something went wrong</h2>
        <p className="text-sm text-text-secondary mb-6">
          {error.message || "An unexpected error occurred."}
        </p>
        <Button onClick={reset} variant="primary" size="sm">
          Try Again
        </Button>
      </Card>
    </div>
  );
}
