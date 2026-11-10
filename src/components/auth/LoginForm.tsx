'use client';

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  authButtonClass,
  authFieldClass,
  authLabelClass,
  authLinkClass,
  authNoticeClass,
} from './auth-styles';

/*======================================================================
  Sign-in form — printed fields, one signal button.
====================================================================== */

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        const authCode = result?.code ?? '';

        if (authCode === 'email_not_verified') {
          setError(
            'Verify your email before signing in. Use the resend verification link below if needed.',
          );
        } else if (authCode === 'account_pending_approval') {
          setError(
            'Your email is verified, but your account is awaiting administrator approval.',
          );
        } else {
          setError('Invalid email or password.');
        }

        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error ? (
        <p
          role="alert"
          className={`${authNoticeClass} border-danger-border bg-danger-soft text-danger`}
        >
          {error}
        </p>
      ) : null}

      <div>
        <label htmlFor="email" className={authLabelClass}>
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="admin@medorch.local"
          required
          disabled={isLoading}
          className={authFieldClass}
        />
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="password" className={authLabelClass}>
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-ink-muted hover:text-ink text-[12px] font-medium"
          >
            Forgot password
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          required
          disabled={isLoading}
          className={authFieldClass}
        />
      </div>

      <button type="submit" disabled={isLoading} className={authButtonClass}>
        {isLoading ? 'Verifying access…' : 'Sign in'}
      </button>

      <div className="text-ink-muted flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <Link href="/resend-verification" className={authLinkClass}>
          Resend verification
        </Link>
        <Link href="/register" className={authLinkClass}>
          Request an account
        </Link>
      </div>
    </form>
  );
}
