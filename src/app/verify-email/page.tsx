'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type VerificationState = 'idle' | 'loading' | 'success' | 'error';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [state, setState] = useState<VerificationState>('idle');
  const [message, setMessage] = useState('');

  async function handleVerify() {
    if (!token) {
      setState('error');
      setMessage('The verification link is missing its token.');
      return;
    }

    setState('loading');
    setMessage('');

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data: { message?: string } = await response.json();

      if (!response.ok) {
        setState('error');
        setMessage(data.message ?? 'Email verification failed.');
        return;
      }

      setState('success');
      setMessage(data.message ?? 'Your email has been verified successfully.');
    } catch {
      setState('error');
      setMessage('Unable to contact the server. Please try again.');
    }
  }

  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-4 py-12">
      <section className="border-border bg-surface w-full max-w-md rounded-[var(--radius-card)] border p-8 shadow-xs">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          Verify your email
        </h1>

        <p className="text-foreground-muted mt-3 text-sm leading-6">
          Confirm your email address to continue with your MedOrch registration.
        </p>

        {message && (
          <p
            role="status"
            aria-live="polite"
            className={`mt-5 rounded-lg border p-3 text-sm leading-6 ${
              state === 'success'
                ? 'border-success/40 bg-success-soft text-success'
                : 'border-danger-border bg-danger-soft text-danger'
            }`}
          >
            {message}
          </p>
        )}

        {state !== 'success' && (
          <button
            type="button"
            onClick={handleVerify}
            disabled={state === 'loading'}
            className="bg-primary text-foreground-inverse hover:bg-primary-hover active:bg-primary-active mt-6 w-full rounded-[var(--radius-control)] px-4 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            {state === 'loading'
              ? 'Verifying...'
              : state === 'error'
                ? 'Try again'
                : 'Verify email'}
          </button>
        )}

        {state === 'success' && (
          <a
            href="/login"
            className="bg-primary text-foreground-inverse hover:bg-primary-hover active:bg-primary-active mt-6 block w-full rounded-[var(--radius-control)] px-4 py-3 text-center text-sm font-semibold transition-colors"
          >
            Continue to login
          </a>
        )}
      </section>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="bg-background flex min-h-screen items-center justify-center">
          <p className="text-foreground-muted text-sm">
            Loading verification page...
          </p>
        </main>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
