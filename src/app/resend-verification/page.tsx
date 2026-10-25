'use client';

import { FormEvent, useState } from 'react';

export default function ResendVerificationPage() {
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
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const result = await response.json().catch(() => null);
      const payload = result?.data;

      if (response.status === 429 || payload?.rateLimited) {
        setError(
          payload?.message ||
            "You've reached the resend limit. Please wait 15 minutes before trying again.",
        );
        return;
      }

      if (!response.ok || result?.success === false) {
        throw new Error(
          result?.message ||
            'Unable to process your request. Please try again.',
        );
      }

      setMessage(
        payload?.message ||
          'If an eligible account exists, a verification email will be sent.',
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
    <main className="bg-background text-foreground flex min-h-screen items-center justify-center px-4 py-12">
      <section className="border-border bg-surface w-full max-w-md rounded-[var(--radius-card)] border p-8 shadow-xs">
        <a
          href="/login"
          className="text-primary text-sm transition hover:underline"
        >
          ← Back to login
        </a>

        <div className="mt-8">
          <p className="text-primary text-sm font-semibold tracking-[0.2em] uppercase">
            MedOrch
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Resend verification
          </h1>

          <p className="text-foreground-muted mt-3 text-sm leading-6">
            Enter the email address you registered with. If your account
            requires verification, we’ll send you a new verification link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="text-foreground mb-2 block text-sm font-medium"
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
              className="border-border-strong bg-surface text-foreground placeholder:text-foreground-subtle focus:border-primary focus-visible:ring-ring w-full rounded-[var(--radius-control)] border px-4 py-3 text-sm transition-colors outline-none focus-visible:ring-2"
            />
          </div>

          {message && (
            <p
              role="status"
              className="border-success/40 bg-success-soft text-success rounded-[var(--radius-control)] border p-3 text-sm leading-6"
            >
              {message}
            </p>
          )}

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
            disabled={loading || !email.trim()}
            className="bg-primary text-foreground-inverse hover:bg-primary-hover active:bg-primary-active w-full rounded-[var(--radius-control)] px-4 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Sending request...' : 'Send verification link'}
          </button>
        </form>

        <p className="text-foreground-muted mt-6 text-center text-xs leading-5">
          For your security, the response won’t reveal whether an account exists
          or is eligible for verification.
        </p>
      </section>
    </main>
  );
}
