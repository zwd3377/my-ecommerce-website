export default function Loading() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="h-5 w-40 bg-gray-200 rounded mb-6 animate-pulse" />
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden ring-1 ring-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-4 sm:p-6">
              <div className="aspect-square w-full rounded-2xl bg-gray-200 animate-pulse" />
            </div>
            <div className="p-6 sm:p-10 space-y-5">
              <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-1/3 bg-gray-200 rounded animate-pulse" />
              <div className="h-12 w-1/2 bg-gray-200 rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
