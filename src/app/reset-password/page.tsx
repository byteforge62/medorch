'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useState } from 'react';
import { AuthShell } from '@/components/auth/AuthShell';
import {
  authButtonClass,
  authFieldClass,
  authLabelClass,
  authLinkClass,
  authNoticeClass,
} from '@/components/auth/auth-styles';

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
    <AuthShell
      plate="Credential recovery · 02"
      title={
        <>
          Set a new <em className="text-pine italic">password</em>.
        </>
      }
      description="Choose a password between 12 and 128 characters. Completing this step replaces the previous credential immediately."
      asideNote="A reset link is single-use and expires. The new credential is verified on the next request and never shown again."
      footer={
        <>
          Need a fresh link?{' '}
          <Link href="/forgot-password" className={authLinkClass}>
            Request another
          </Link>
          .
        </>
      }
    >
      {!token ? (
        <p
          role="alert"
          className={`${authNoticeClass} border-danger-border bg-danger-soft text-danger mb-5`}
        >
          No reset token was found in this link. Open the latest reset email or
          request another link.
        </p>
      ) : null}

      {!completed ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="password" className={authLabelClass}>
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
              placeholder="12 characters minimum"
              className={authFieldClass}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className={authLabelClass}>
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
              className={authFieldClass}
            />
          </div>

          {error ? (
            <p
              role="alert"
              className={`${authNoticeClass} border-danger-border bg-danger-soft text-danger`}
            >
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading || !token}
            className={authButtonClass}
          >
            {loading ? 'Updating credential…' : 'Reset password'}
          </button>
        </form>
      ) : null}

      {message ? (
        <p
          role="status"
          className={`${authNoticeClass} border-success/25 bg-success-soft text-success ${completed ? '' : 'mt-5'}`}
        >
          {message}
        </p>
      ) : null}

      {completed ? (
        <Link href="/login" className={`${authButtonClass} mt-5`}>
          Continue to sign in
        </Link>
      ) : null}
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="bg-paper text-ink-muted flex min-h-screen items-center justify-center text-sm">
          Loading password reset…
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
