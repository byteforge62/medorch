'use client';

import Link from 'next/link';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="max-w-md text-center">
        <p className="text-foreground-subtle text-xs font-semibold tracking-widest uppercase">
          Something went wrong
        </p>

        <h1 className="text-foreground mt-4 text-3xl font-bold">
          We hit a temporary problem
        </h1>

        <p className="text-foreground-secondary mt-3">
          The application could not finish this request. This is usually
          temporary, and your work is safe.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="bg-primary text-foreground-inverse hover:bg-primary-hover focus:outline-primary inline-flex items-center justify-center rounded-[var(--radius-xl)] px-5 py-2.5 text-sm font-semibold transition-colors focus:outline-2 focus:outline-offset-2"
          >
            Try again
          </button>

          <Link
            href="/dashboard"
            className="border-border-strong text-foreground-secondary hover:bg-surface focus:outline-primary inline-flex items-center justify-center rounded-[var(--radius-xl)] border px-5 py-2.5 text-sm font-medium transition-colors focus:outline-2 focus:outline-offset-2"
          >
            Return to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
