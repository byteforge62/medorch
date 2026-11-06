/* Section-level loading state. The workspace layout owns the rail and command
   bar, so this fallback replaces only the working area during navigation. */

export default function WorkspaceLoading() {
  return (
    <main role="status" aria-label="Loading section" className="space-y-5">
      <div className="space-y-3">
        <div className="bg-surface-muted h-2.5 w-28 animate-pulse rounded-full" />
        <div className="bg-surface-muted h-8 w-64 animate-pulse rounded-[var(--radius-control)]" />
        <div className="bg-surface-muted h-3.5 w-full max-w-xl animate-pulse rounded-full" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="panel min-h-[22rem] p-5">
          <div className="bg-surface-muted h-3 w-32 animate-pulse rounded-full" />
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="border-rule-soft bg-surface-subtle h-20 animate-pulse rounded-[var(--radius-control)] border"
              />
            ))}
          </div>
        </div>

        <div className="panel min-h-[16rem] p-5">
          <div className="bg-surface-muted h-3 w-24 animate-pulse rounded-full" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="bg-surface-subtle h-8 animate-pulse rounded-[var(--radius-control)]"
              />
            ))}
          </div>
        </div>
      </div>

      <span className="sr-only">Loading content…</span>
    </main>
  );
}
