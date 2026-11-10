'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthShell } from '@/components/auth/AuthShell';
import {
  authButtonClass,
  authLinkClass,
  authNoticeClass,
} from '@/components/auth/auth-styles';

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
    <AuthShell
      plate="Account verification · 04"
      title={
        <>
          Confirm your <em className="text-pine italic">email</em>.
        </>
      }
      description="This step confirms that the address belongs to you. It does not grant a clinical role; an administrator still approves the account."
      asideNote="Identity is established in two stages: the address is verified, then access is approved and scoped to a role."
      footer={
        <>
          Need a different link?{' '}
          <Link href="/resend-verification" className={authLinkClass}>
            Resend verification
          </Link>
          .
        </>
      }
    >
      {message ? (
        <p
          role="status"
          aria-live="polite"
          className={`${authNoticeClass} ${
            state === 'success'
              ? 'border-success/25 bg-success-soft text-success'
              : 'border-danger-border bg-danger-soft text-danger'
          }`}
        >
          {message}
        </p>
      ) : (
        <p className="text-ink-secondary text-[13px] leading-relaxed">
          Verify now to confirm this address. The link is checked against the
          token attached to your account.
        </p>
      )}

      {state !== 'success' ? (
        <button
          type="button"
          onClick={handleVerify}
          disabled={state === 'loading'}
          className={`${authButtonClass} mt-6`}
        >
          {state === 'loading'
            ? 'Verifying email…'
            : state === 'error'
              ? 'Try verification again'
              : 'Verify email'}
        </button>
      ) : (
        <Link href="/login" className={`${authButtonClass} mt-6`}>
          Continue to sign in
        </Link>
      )}
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="bg-paper flex min-h-screen items-center justify-center">
          <p className="text-ink-muted text-sm">Loading verification…</p>
        </main>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
