export default function InstagramLoading() {
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
      <div className="rounded-xl border border-card-border bg-card-bg p-6">
        <div className="h-4 bg-[#f0ede8] rounded w-1/4 mb-4" />
        <div className="h-48 bg-[#f0ede8] rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-card-border bg-card-bg p-5">
            <div className="h-4 bg-[#f0ede8] rounded w-3/4 mb-2" />
            <div className="h-3 bg-[#f0ede8] rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
