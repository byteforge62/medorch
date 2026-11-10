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
    <AuthShell
      plate="Account verification · 03"
      title={
        <>
          Resend the <em className="text-pine italic">verification</em>.
        </>
      }
      description="Enter the address you registered with. If the account still needs verification, a fresh link will be sent."
      asideNote="Verification protects the first step of access. An account remains unable to sign in until its email has been confirmed and a role approved."
      footer={
        <>
          Already verified?{' '}
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
          {loading ? 'Sending verification…' : 'Send verification link'}
        </button>
      </form>

      <p className="text-ink-subtle mt-5 text-center text-[11.5px] leading-relaxed">
        For your security, the response will not reveal whether an account
        exists or is eligible for verification.
      </p>
    </AuthShell>
  );
}
