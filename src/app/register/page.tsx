'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';

type RegistrationResponse = {
  message?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
};

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 12) {
      setError('Password must contain at least 12 characters.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          ...(phone.trim() ? { phone: phone.trim() } : {}),
        }),
      });

      const data: RegistrationResponse = await response.json();

      if (!response.ok) {
        const validationMessage = data.errors
          ?.map((item) => item.message)
          .join(' ');

        setError(
          validationMessage ||
            data.message ||
            'Registration could not be completed.',
        );
        return;
      }

      setSuccess(
        data.message ??
          'If registration can be completed, a verification email will be sent to the provided address.',
      );

      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setConfirmPassword('');
    } catch {
      setError('Unable to contact the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20';

  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-4 py-10">
      <section className="border-border bg-card w-full max-w-md rounded-2xl border p-6 shadow-sm sm:p-8">
        <div className="mb-7">
          <p className="text-primary text-sm font-semibold tracking-wide">
            MEDORCH
          </p>

          <h1 className="text-foreground mt-3 text-2xl font-semibold tracking-tight">
            Create your patient account
          </h1>

          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Register to get started. You will need to verify your email before
            your account can be approved.
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="border-destructive/30 bg-destructive/10 text-foreground mb-5 rounded-lg border p-3 text-sm leading-6"
          >
            {error}
          </p>
        )}

        {success && (
          <div
            role="status"
            aria-live="polite"
            className="border-border bg-muted text-foreground mb-5 rounded-lg border p-3 text-sm leading-6"
          >
            {success}
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="text-foreground text-sm font-medium"
              >
                Full name
              </label>
              <input
                id="name"
                name="name"
                autoComplete="name"
                required
                minLength={2}
                maxLength={100}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your full name"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="text-foreground text-sm font-medium"
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
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="text-foreground text-sm font-medium"
              >
                Phone number{' '}
                <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                minLength={7}
                maxLength={20}
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Enter your phone number"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-foreground text-sm font-medium"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={12}
                maxLength={128}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 12 characters"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="text-foreground text-sm font-medium"
              >
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={12}
                maxLength={128}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter your password"
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-primary-foreground w-full rounded-lg px-4 py-3 text-sm font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        )}

        <p className="text-muted-foreground mt-6 text-center text-sm">
          Already registered?{' '}
          <Link
            href="/login"
            className="text-primary font-medium underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
