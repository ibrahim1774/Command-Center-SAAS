"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { useSession } from "next-auth/react";

interface UpgradeGateProps {
  feature: string;
  children: React.ReactNode;
}

export function UpgradeGate({ feature, children }: UpgradeGateProps) {
  const { data: session } = useSession();
  const plan = (session?.user?.plan as string) || "free";
  const isPro = plan === "pro";

  if (isPro) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-primary/10 mb-6">
        <Lock className="h-7 w-7 text-accent-primary" />
      </div>
      <h2 className="font-display text-2xl font-bold text-text-primary mb-2">
        Pro Feature
      </h2>
      <p className="text-text-secondary max-w-md mb-8">
        {feature} is available on the Pro plan. Upgrade to unlock access to all
        channels, brand deal CRM, goals, and more.
      </p>
      <Link
        href="/#pricing"
        className="inline-flex items-center gap-2 rounded-full bg-accent-primary px-8 py-3 text-sm font-medium text-white transition-all hover:opacity-90 hover:shadow-lg"
      >
        Upgrade to Pro
      </Link>
    </div>
  );
}
