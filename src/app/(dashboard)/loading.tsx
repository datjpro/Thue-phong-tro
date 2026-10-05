export default function Loading() {
  return (
    <div aria-busy="true" className="flex animate-pulse flex-col gap-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-44 rounded-lg bg-muted/60" />
          <div className="h-4 w-72 rounded-md bg-muted/40" />
        </div>
        <div className="h-10 w-28 rounded-lg bg-muted/60" />
      </div>

      {/* 4 Stats cards skeleton */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-xl border border-border/40 bg-card p-4 space-y-3">
            <div className="flex justify-between">
              <div className="h-4 w-20 rounded bg-muted/50" />
              <div className="size-8 rounded-lg bg-muted/60" />
            </div>
            <div className="h-7 w-16 rounded bg-muted/70" />
          </div>
        ))}
      </div>

      {/* List skeleton */}
      <div className="space-y-3">
        <div className="h-5 w-32 rounded bg-muted/50" />
        <div className="h-20 rounded-xl border border-border/40 bg-card" />
        <div className="h-20 rounded-xl border border-border/40 bg-card" />
      </div>
    </div>
  );
}
