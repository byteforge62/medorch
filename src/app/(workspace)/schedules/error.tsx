'use client';

import { WarningCircle } from '@phosphor-icons/react';

export default function SchedulesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="pb-8">
      <div className="border-rule bg-surface rounded-[var(--radius-panel)] border px-5 py-8 sm:px-7">
        <div className="bg-danger-soft text-danger flex h-9 w-9 items-center justify-center rounded-full">
          <WarningCircle size={18} weight="bold" aria-hidden="true" />
        </div>
        <p className="eyebrow mt-4">Theatre scheduling</p>
        <h1 className="text-ink mt-1.5 text-xl font-semibold tracking-tight">
          The theatre day could not be loaded
        </h1>
        <p className="text-ink-secondary mt-2 max-w-[60ch] text-[12px] leading-relaxed">
          The schedule read failed before the workspace was ready. No schedule
          changes were made. Retry the request or return after checking the
          server connection.
        </p>
        {error.digest ? (
          <p className="text-ink-subtle mt-2 font-mono text-[10px]">
            Reference {error.digest}
          </p>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={reset}
            className="bg-primary text-primary-ink hover:bg-primary-hover inline-flex min-h-9 items-center rounded-[var(--radius-control)] px-3.5 text-[11px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Retry theatre day
          </button>
          <a
            href="/dashboard"
            className="border-rule text-ink-secondary hover:border-border-strong hover:text-ink inline-flex min-h-9 items-center rounded-[var(--radius-control)] border px-3.5 text-[11px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Back to dashboard
          </a>
        </div>
      </div>
    </main>
  );
}
