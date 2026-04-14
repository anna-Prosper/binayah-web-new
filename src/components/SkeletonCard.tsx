/** Reusable animated skeleton primitives used by loading.tsx files */

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`bg-muted animate-pulse rounded ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden border border-border bg-card">
      <SkeletonBlock className="h-48 w-full rounded-none" />
      <div className="p-4 space-y-2">
        <SkeletonBlock className="h-4 w-3/4" />
        <SkeletonBlock className="h-3 w-1/2" />
        <SkeletonBlock className="h-3 w-2/3" />
      </div>
    </div>
  );
}

export function SkeletonDetailPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <SkeletonBlock className="h-8 w-2/3" />
      <SkeletonBlock className="h-4 w-1/3" />
      <SkeletonBlock className="h-72 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-20 w-full" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}
