'use client';

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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
        setError('Invalid email or password');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="email"
          className="text-foreground mb-2 block text-sm font-medium"
        >
          Email
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
          className="border-border bg-surface text-foreground placeholder:text-foreground-muted hover:border-border-strong focus-visible:border-primary focus-visible:ring-ring min-h-11 w-full rounded-[var(--radius-control)] border px-3.5 py-2.5 text-sm transition outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="text-foreground mb-2 block text-sm font-medium"
        >
          Password
        </label>
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
          className="border-border bg-surface text-foreground placeholder:text-foreground-muted hover:border-border-strong focus-visible:border-primary focus-visible:ring-ring min-h-11 w-full rounded-[var(--radius-control)] border px-3.5 py-2.5 text-sm transition outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>

      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="border-danger-border bg-danger-soft text-danger rounded-[var(--radius-control)] border px-3.5 py-3 text-sm"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="bg-primary text-foreground-inverse hover:bg-primary-hover focus-visible:ring-ring active:bg-primary-active min-h-11 w-full rounded-[var(--radius-control)] px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}
