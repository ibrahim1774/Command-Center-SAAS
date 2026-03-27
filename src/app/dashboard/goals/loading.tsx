export default function GoalsLoading() {
  return (
    <div className="space-y-10 animate-pulse">
      <div>
        <div className="h-6 bg-[#f0ede8] rounded w-24 mb-5" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-card-border bg-card-bg p-5">
              <div className="h-3 bg-[#f0ede8] rounded w-1/3 mb-3" />
              <div className="h-5 bg-[#f0ede8] rounded w-2/3 mb-2" />
              <div className="h-2 bg-[#f0ede8] rounded w-full mt-4" />
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <div className="h-6 bg-[#f0ede8] rounded w-24 mb-5" />
          <div className="rounded-xl border border-card-border bg-card-bg p-6">
            <div className="h-32 bg-[#f0ede8] rounded mb-4" />
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 bg-[#f0ede8] rounded" />
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="h-6 bg-[#f0ede8] rounded w-16 mb-5" />
          <div className="rounded-xl border border-card-border bg-card-bg p-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 bg-[#f0ede8] rounded w-3/4 mb-3" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
