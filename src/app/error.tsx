"use client";

import { Button } from "@/components/ui/Button";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-page-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-card-bg border border-card-border rounded-2xl p-10 text-center">
        <div className="w-14 h-14 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-5">
          <span className="text-2xl text-danger font-display">!</span>
        </div>
        <h2 className="font-display text-2xl text-text-primary mb-2">Something went wrong</h2>
        <p className="text-sm text-text-secondary mb-8 leading-relaxed">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <Button onClick={reset} variant="primary" size="md">
          Try Again
        </Button>
      </div>
    </div>
  );
}
