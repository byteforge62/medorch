import React from 'react';

/**
 * SkeletonCard — the structural mirror of `Card`.
 *
 * Same border, radius, padding and header/body rhythm, with shimmer bars
 * standing in for the text. Because the box is identical, swapping in real
 * data causes no layout shift. Marked aria-hidden and paired with a polite
 * status message by the calling surface.
 */
export function SkeletonCard({
  lines = 3,
  showMedia = false,
  className = '',
}: {
  lines?: number;
  showMedia?: boolean;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-[var(--radius-panel)] border border-border bg-surface p-5 shadow-xs sm:p-6 ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="h-4 w-1/2 animate-pulse rounded-full bg-[var(--surface-muted)]" />
        <div className="h-5 w-16 animate-pulse rounded-full bg-[var(--surface-muted)]" />
      </div>

      {showMedia ? (
        <div className="mt-4 h-28 w-full animate-pulse rounded-[var(--radius-md)] bg-[var(--surface-subtle)]" />
      ) : null}

      <div className="mt-4 space-y-2.5">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className="h-3 animate-pulse rounded-full bg-[var(--surface-muted)]"
            style={{ width: `${88 - index * 14}%` }}
          />
        ))}
      </div>

      <div className="mt-5 flex items-center gap-2 border-t border-rule-soft pt-3">
        <div className="h-3 w-20 animate-pulse rounded-full bg-[var(--surface-muted)]" />
        <div className="ml-auto h-6 w-16 animate-pulse rounded-full bg-[var(--surface-muted)]" />
      </div>
    </div>
  );
}

/** A grid of skeleton cards with an announced loading status. */
export function SkeletonGrid({
  count = 3,
  label = 'Loading operational records',
  className = 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3',
}: {
  count?: number;
  label?: string;
  className?: string;
}) {
  return (
    <div>
      <p role="status" className="sr-only">
        {label}
      </p>
      <div className={className}>
        {Array.from({ length: count }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </div>
  );
}
