export default function DealsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-card-border bg-card-bg p-5">
            <div className="h-3 bg-[#f0ede8] rounded w-1/2 mb-3" />
            <div className="h-6 bg-[#f0ede8] rounded w-2/3 mb-2" />
            <div className="h-3 bg-[#f0ede8] rounded w-1/3" />
          </div>
        ))}
      </div>
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="min-w-[280px] flex-1">
            <div className="h-5 bg-[#f0ede8] rounded w-24 mb-3" />
            <div className="space-y-3">
              {[1, 2].map((j) => (
                <div key={j} className="rounded-lg border border-card-border bg-card-bg p-4">
                  <div className="h-4 bg-[#f0ede8] rounded w-2/3 mb-2" />
                  <div className="h-5 bg-[#f0ede8] rounded w-1/3 mb-2" />
                  <div className="h-3 bg-[#f0ede8] rounded w-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
