'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/AuthShell';
import {
  authButtonClass,
  authFieldClass,
  authLabelClass,
  authLinkClass,
  authNoticeClass,
} from '@/components/auth/auth-styles';

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

  return (
    <AuthShell
      plate="Enrolment · 02"
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
          <Link href="/login" className={authLinkClass}>
            Sign in
          </Link>
          . Staff accounts are issued by an administrator.
        </>
      }
    >
      {error ? (
        <p
          role="alert"
          className={`${authNoticeClass} border-danger-border bg-danger-soft text-danger mb-5`}
        >
          {error}
        </p>
      ) : null}

      {success ? (
        <div
          role="status"
          aria-live="polite"
          className={`${authNoticeClass} border-success/25 bg-success-soft text-success`}
        >
          <p className="mb-1 text-[11px] font-semibold tracking-[0.04em]">
            Registration received
          </p>
          {success}
        </div>
      ) : null}

      {!success ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className={authLabelClass}>
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
              className={authFieldClass}
            />
          </div>

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

          <div>
            <label htmlFor="phone" className={authLabelClass}>
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
              className={authFieldClass}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="password" className={authLabelClass}>
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
                className={authFieldClass}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className={authLabelClass}>
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
                className={authFieldClass}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`${authButtonClass} mt-2`}
          >
            {loading ? 'Submitting request…' : 'Request access'}
          </button>
        </form>
      ) : null}
    </AuthShell>
  );
}
