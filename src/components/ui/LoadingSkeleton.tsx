"use client";

function Pulse({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-[#f0ede8] ${className ?? ""}`}
    />
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="rounded-[10px] border border-card-border bg-card-bg p-5 space-y-3">
      <Pulse className="h-3 w-24" />
      <Pulse className="h-8 w-32" />
      <Pulse className="h-3 w-16" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-[10px] border border-card-border bg-card-bg p-7 space-y-4">
      <Pulse className="h-5 w-40" />
      <Pulse className="h-48 w-full" />
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="rounded-[10px] border border-card-border bg-card-bg p-7 space-y-4">
      <Pulse className="h-5 w-40" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Pulse className="h-10 w-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Pulse className="h-3 w-3/4" />
            <Pulse className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
      <ChartSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ListSkeleton />
        <ListSkeleton />
      </div>
    </div>
  );
}
