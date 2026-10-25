'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useState } from 'react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setError('');

    if (!/^[a-f0-9]{64}$/i.test(token)) {
      setError('This password reset link is invalid or incomplete.');
      return;
    }

    if (password.length < 12 || password.length > 128) {
      setError('Your password must contain between 12 and 128 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || result?.success === false) {
        throw new Error(
          result?.message || 'Unable to reset your password. Please try again.',
        );
      }

      setMessage(
        result?.data?.message || 'Your password has been reset successfully.',
      );
      setCompleted(true);
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="bg-background text-foreground flex min-h-screen items-center justify-center px-4 py-12">
      <section className="border-border bg-surface w-full max-w-md rounded-[var(--radius-card)] border p-8 shadow-xs">
        <Link
          href="/login"
          className="text-primary text-sm transition hover:underline"
        >
          ← Back to login
        </Link>

        <div className="mt-8">
          <p className="text-primary text-sm font-semibold tracking-[0.2em] uppercase">
            MedOrch
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Reset password
          </h1>

          <p className="text-foreground-muted mt-3 text-sm leading-6">
            Choose a new password for your MedOrch account.
          </p>
        </div>

        {!token && (
          <p
            role="alert"
            className="border-danger-border bg-danger-soft text-danger mt-6 rounded-[var(--radius-control)] border p-3 text-sm"
          >
            No reset token was found in this link. Open the latest reset email
            or request another link.
          </p>
        )}

        {!completed && (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="password"
                className="text-foreground mb-2 block text-sm font-medium"
              >
                New password
              </label>

              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={12}
                maxLength={128}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={loading || !token}
                placeholder="Enter your new password"
                className="border-border-strong bg-surface text-foreground placeholder:text-foreground-subtle focus:border-primary focus-visible:ring-ring w-full rounded-[var(--radius-control)] border px-4 py-3 text-sm transition-colors outline-none focus-visible:ring-2 disabled:opacity-60"
              />
              <p className="text-foreground-subtle mt-2 text-xs">
                Use between 12 and 128 characters.
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="text-foreground mb-2 block text-sm font-medium"
              >
                Confirm new password
              </label>

              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                maxLength={128}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                disabled={loading || !token}
                placeholder="Re-enter your new password"
                className="border-border-strong bg-surface text-foreground placeholder:text-foreground-subtle focus:border-primary focus-visible:ring-ring w-full rounded-[var(--radius-control)] border px-4 py-3 text-sm transition-colors outline-none focus-visible:ring-2 disabled:opacity-60"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="border-danger-border bg-danger-soft text-danger rounded-[var(--radius-control)] border p-3 text-sm leading-6"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !token}
              className="bg-primary text-foreground-inverse hover:bg-primary-hover active:bg-primary-active w-full rounded-[var(--radius-control)] px-4 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Resetting password...' : 'Reset password'}
            </button>
          </form>
        )}

        {message && (
          <p
            role="status"
            className="border-success/40 bg-success-soft text-success mt-6 rounded-[var(--radius-control)] border p-3 text-sm leading-6"
          >
            {message}
          </p>
        )}

        {completed && (
          <Link
            href="/login"
            className="bg-primary text-foreground-inverse hover:bg-primary-hover active:bg-primary-active mt-5 block w-full rounded-[var(--radius-control)] px-4 py-3 text-center text-sm font-semibold transition-colors"
          >
            Return to login
          </Link>
        )}
      </section>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="bg-background text-foreground-muted flex min-h-screen items-center justify-center text-sm">
          Loading password reset...
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
