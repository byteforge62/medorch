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
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-white">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <Link
          href="/login"
          className="text-sm text-sky-400 transition hover:text-sky-300"
        >
          ← Back to login
        </Link>

        <div className="mt-8">
          <p className="text-sm font-medium tracking-[0.2em] text-sky-400 uppercase">
            MedOrch
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Reset password
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Choose a new password for your MedOrch account.
          </p>
        </div>

        {!token && (
          <p
            role="alert"
            className="mt-6 rounded-xl border border-red-800 bg-red-950/50 p-3 text-sm text-red-300"
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
                className="mb-2 block text-sm font-medium text-slate-200"
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
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm transition outline-none placeholder:text-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-60"
              />
              <p className="mt-2 text-xs text-slate-500">
                Use between 12 and 128 characters.
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-slate-200"
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
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm transition outline-none placeholder:text-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-60"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-800 bg-red-950/50 p-3 text-sm leading-6 text-red-300"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Resetting password...' : 'Reset password'}
            </button>
          </form>
        )}

        {message && (
          <p
            role="status"
            className="mt-6 rounded-xl border border-emerald-800 bg-emerald-950/50 p-3 text-sm leading-6 text-emerald-300"
          >
            {message}
          </p>
        )}

        {completed && (
          <Link
            href="/login"
            className="mt-5 block w-full rounded-xl bg-sky-500 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
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
        <main className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-400">
          Loading password reset...
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
