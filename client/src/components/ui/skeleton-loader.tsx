/**
 * Skeleton Loader Component
 * Better loading experience than spinners
 */

export function SkeletonCard() {
  return (
    <div className="rounded-3xl border-2 border-white/60 bg-white/40 p-6 shadow-xl animate-pulse">
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded-lg w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="space-y-2 pt-2">
          <div className="h-20 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonExclusion() {
  return (
    <div className="rounded-2xl border-2 bg-gray-100/60 p-5 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 rounded w-4/5"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
        <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-200 rounded"
          style={{ width: i === lines - 1 ? "80%" : "100%" }}
        ></div>
      ))}
    </div>
  );
}
