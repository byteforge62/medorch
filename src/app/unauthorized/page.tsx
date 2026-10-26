import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-foreground-subtle">
          Access denied
        </p>

        <h1 className="mt-4 text-3xl font-bold text-foreground">
          You cannot view this page
        </h1>

        <p className="mt-3 text-foreground-secondary">
          Your account does not have permission to access this resource.
          If you were looking for your own dashboard, sign in again.
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
