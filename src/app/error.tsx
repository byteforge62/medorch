'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-foreground-subtle">
          Something went wrong
        </p>

        <h1 className="mt-4 text-3xl font-bold text-foreground">
          We hit a temporary problem
        </h1>

        <p className="mt-3 text-foreground-secondary">
          The application could not finish this request. This is usually
          temporary, and your work is safe.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-[var(--radius-xl)] bg-primary px-5 py-2.5 text-sm font-semibold text-foreground-inverse transition-colors hover:bg-primary-hover focus:outline-2 focus:outline-offset-2 focus:outline-primary"
          >
            Try again
          </button>

          <a
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-[var(--radius-xl)] border border-border-strong px-5 py-2.5 text-sm font-medium text-foreground-secondary transition-colors hover:bg-surface focus:outline-2 focus:outline-offset-2 focus:outline-primary"
          >
            Return to dashboard
          </a>
        </div>
      </div>
    </main>
  );
}
