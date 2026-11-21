/* Section-level loading state. The workspace layout owns the rail and command
   bar, so this fallback replaces only the working area during navigation.
   The skeleton cards mirror the real panels' box, so content arrives without
   a layout shift. */

import { SkeletonCard } from '@/components/ui/SkeletonCard';

export default function WorkspaceLoading() {
  return (
    <main role="status" aria-label="Loading section" className="space-y-5">
      <div className="space-y-3">
        <div className="h-2.5 w-28 animate-pulse rounded-full bg-surface-muted" />
        <div className="h-8 w-64 animate-pulse rounded-[var(--radius-control)] bg-surface-muted" />
        <div className="h-3.5 w-full max-w-xl animate-pulse rounded-full bg-surface-muted" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <SkeletonCard lines={5} className="min-h-[22rem]" />
        <SkeletonCard lines={4} className="min-h-[16rem]" />
      </div>

      <span className="sr-only">Loading content…</span>
    </main>
  );
}
