export default function SettingsLoading() {
  return (
    <div className="space-y-10 animate-pulse">
      {[1, 2, 3].map((section) => (
        <div key={section} className="rounded-xl border border-card-border bg-card-bg p-8">
          <div className="h-5 bg-[#f0ede8] rounded w-40 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#f0ede8]" />
                  <div>
                    <div className="h-4 bg-[#f0ede8] rounded w-24 mb-1" />
                    <div className="h-3 bg-[#f0ede8] rounded w-32" />
                  </div>
                </div>
                <div className="h-8 bg-[#f0ede8] rounded w-20" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
