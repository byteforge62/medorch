'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { AuthShell } from '@/components/auth/AuthShell';
import {
  authButtonClass,
  authFieldClass,
  authLabelClass,
  authLinkClass,
  authNoticeClass,
} from '@/components/auth/auth-styles';

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

      if (response.status === 429 || result?.data?.rateLimited) {
        setError(
          result?.data?.message ||
            "You've reached the password reset request limit. Please wait 15 minutes before trying again.",
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
    <AuthShell
      plate="Credential recovery · 01"
      title={
        <>
          Recover your <em className="text-pine italic">access</em>.
        </>
      }
      description="Enter the email registered to your MedOrch account. If it is eligible, a reset link will be sent to that address."
      asideNote="Recovery is deliberately quiet: the response does not reveal whether an account exists, and the reset link carries a single-use token."
      footer={
        <>
          Remembered your password?{' '}
          <Link href="/login" className={authLinkClass}>
            Return to sign in
          </Link>
          .
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className={authLabelClass}>
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
            className={authFieldClass}
          />
        </div>

        {message ? (
          <p
            role="status"
            className={`${authNoticeClass} border-success/25 bg-success-soft text-success`}
          >
            {message}
          </p>
        ) : null}

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
          disabled={loading || !email.trim()}
          className={authButtonClass}
        >
          {loading ? 'Sending reset link…' : 'Send reset link'}
        </button>
      </form>

      <p className="text-ink-subtle mt-5 text-center text-[11.5px] leading-relaxed">
        For your security, this page does not reveal whether an account exists.
      </p>
    </AuthShell>
  );
}
