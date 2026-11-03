'use client';

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

/*======================================================================
  Sign-in form — printed fields, one signal button.
====================================================================== */

const fieldClass =
  'mt-2 w-full border border-rule bg-sheet px-3.5 py-3 text-[13px] text-ink outline-none transition-colors placeholder:text-ink-subtle focus:border-pine disabled:cursor-not-allowed disabled:opacity-60';

const labelClass =
  'font-mono text-[8px] uppercase tracking-[0.22em] text-ink-muted';

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
          className="border-danger bg-danger-soft text-danger border-l-2 px-3 py-2.5 text-[11px] leading-relaxed"
        >
          {error}
        </p>
      ) : null}

      <div>
        <label htmlFor="email" className={labelClass}>
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
          className={fieldClass}
        />
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="password" className={labelClass}>
            Password
          </label>
          <Link
            href="/forgot-password"
            className="link-draw font-mono text-[8px] tracking-[0.16em] text-ink-subtle uppercase hover:text-ink"
          >
            Forgot
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
          className={fieldClass}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="bg-pine text-chalk hover:bg-pine-deep group flex h-12 w-full items-center justify-between px-4 font-mono text-[10px] tracking-[0.2em] uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? 'Verifying…' : 'Sign in'}
        <span
          className="transition-transform duration-300 group-hover:translate-x-1"
          aria-hidden="true"
        >
          →
        </span>
      </button>

      <div className="text-ink-muted flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <Link
          href="/resend-verification"
          className="link-draw hover:text-ink"
        >
          Resend verification
        </Link>
        <Link href="/register" className="link-draw hover:text-ink">
          Request an account
        </Link>
      </div>
    </form>
  );
}
