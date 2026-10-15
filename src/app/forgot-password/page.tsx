'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || result?.success === false) {
        throw new Error(
          result?.message ||
            'Unable to process your request. Please try again.',
        );
      }

      setMessage(
        result?.data?.message ||
          'If an account exists for this email, password reset instructions will be sent.',
      );
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
            Forgot password?
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Enter your registered email address. If an account exists,
            we&apos;ll send instructions to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Email address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              disabled={loading}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm transition outline-none placeholder:text-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-60"
            />
          </div>

          {message && (
            <p
              role="status"
              className="rounded-xl border border-emerald-800 bg-emerald-950/50 p-3 text-sm leading-6 text-emerald-300"
            >
              {message}
            </p>
          )}

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
            disabled={loading || !email.trim()}
            className="w-full rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Sending request...' : 'Send reset link'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-5 text-slate-500">
          For your security, this page does not reveal whether an account
          exists.
        </p>
      </section>
    </main>
  );
}
