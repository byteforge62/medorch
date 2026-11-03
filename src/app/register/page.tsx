'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/AuthShell';

type RegistrationResponse = {
  message?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
};

const fieldClass =
  'mt-2 w-full border border-rule bg-sheet px-3.5 py-3 text-[13px] text-ink outline-none transition-colors placeholder:text-ink-subtle focus:border-pine disabled:cursor-not-allowed disabled:opacity-60';

const labelClass =
  'font-mono text-[8px] uppercase tracking-[0.22em] text-ink-muted';

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

  return (
    <AuthShell
      plate="Enrolment · Plate 02"
      title={
        <>
          Request patient <em className="text-pine italic">access</em>.
        </>
      }
      description="Patient accounts are verified by email and approved by an administrator before the first sign-in."
      asideNote="Patient enrolment is gated by verification and approval. Records remain invisible until the account is active."
      footer={
        <>
          Already registered?{' '}
          <Link href="/login" className="link-draw text-ink">
            Sign in
          </Link>
          . Staff accounts are issued by an administrator.
        </>
      }
    >
      {error ? (
        <p
          role="alert"
          className="border-danger bg-danger-soft text-danger mb-5 border-l-2 px-3 py-2.5 text-[11px] leading-relaxed"
        >
          {error}
        </p>
      ) : null}

      {success ? (
        <div
          role="status"
          aria-live="polite"
          className="border-success bg-success-soft text-success border-l-2 px-3 py-3 text-[11px] leading-relaxed"
        >
          <p className="mb-1 font-mono text-[8px] tracking-[0.22em] uppercase">
            Registration received
          </p>
          {success}
        </div>
      ) : null}

      {!success ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className={labelClass}>
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
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="email" className={labelClass}>
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
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="phone" className={labelClass}>
              Phone <span className="normal-case">(optional)</span>
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
              className={fieldClass}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="password" className={labelClass}>
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
                placeholder="12 characters minimum"
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className={labelClass}>
                Confirm
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
                placeholder="Re-enter password"
                className={fieldClass}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-pine text-chalk hover:bg-pine-deep group mt-2 flex h-12 w-full items-center justify-between px-4 font-mono text-[10px] tracking-[0.2em] uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Submitting…' : 'Request access'}
            <span
              className="transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            >
              →
            </span>
          </button>
        </form>
      ) : null}
    </AuthShell>
  );
}
