import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-foreground-subtle">
          Page not found
        </p>

        <h1 className="mt-4 text-3xl font-bold text-foreground">
          We could not find that page
        </h1>

        <p className="mt-3 text-foreground-secondary">
          The page you requested does not exist or has been moved.
          Return to the dashboard or sign in again if you think this is a mistake.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-[var(--radius-xl)] bg-primary px-5 py-2.5 text-sm font-semibold text-foreground-inverse transition-colors hover:bg-primary-hover focus:outline-2 focus:outline-offset-2 focus:outline-primary"
          >
            Return to dashboard
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-[var(--radius-xl)] border border-border-strong px-5 py-2.5 text-sm font-medium text-foreground-secondary transition-colors hover:bg-surface focus:outline-2 focus:outline-offset-2 focus:outline-primary"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
