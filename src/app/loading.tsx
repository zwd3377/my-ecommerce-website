export default function Loading() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero skeleton */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-2xl space-y-5">
            <div className="h-6 w-40 rounded-full bg-white/20 animate-pulse" />
            <div className="h-12 w-3/4 rounded-xl bg-white/20 animate-pulse" />
            <div className="h-12 w-2/3 rounded-xl bg-white/20 animate-pulse" />
            <div className="h-12 w-full max-w-lg rounded-full bg-white/30 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features skeleton */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white p-5 shadow-sm h-28 animate-pulse" />
          ))}
        </div>
      </section>

      {/* Products skeleton */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="h-10 w-48 bg-gray-200 rounded mb-8 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
              <div className="aspect-square bg-gray-200 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                <div className="h-5 w-1/3 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
