'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" aria-hidden="true" focusable="false">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.53 5.53 0 0 1-2.4 3.62v3.01h3.88c2.27-2.09 3.58-5.17 3.58-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.94-2.91l-3.88-3.01c-1.08.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.95H1.26v3.09A11.99 11.99 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.63H1.26A11.99 11.99 0 0 0 0 12c0 1.94.47 3.77 1.26 5.37l4.01-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.26 6.63l4.01 3.09C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}

export function GoogleAuthButton({
  enabled,
  label = 'Continue with Google',
}: {
  enabled: boolean;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('');

  async function handleClick() {
    if (!enabled) {
      setNote(
        'Google sign-in is not configured on this deployment. Add AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET, then restart.',
      );
      return;
    }

    setNote('');
    setLoading(true);

    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch {
      setNote('Google sign-in could not start. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={loading}
        aria-busy={loading}
        className="border-rule bg-sheet text-ink hover:border-rule-strong hover:bg-surface-subtle inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2.5 rounded-[var(--radius-control)] border px-4 text-[12.5px] font-semibold shadow-[var(--shadow-xs)] transition-colors disabled:cursor-wait disabled:opacity-60"
      >
        <GoogleMark />
        {loading ? 'Opening Google…' : label}
      </button>

      {note ? (
        <p role="alert" className="text-ink-muted mt-2 text-[10.5px] leading-relaxed">
          {note}
        </p>
      ) : null}
    </div>
  );
}

export function AuthDivider({ label = 'or use your email' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <span className="bg-rule h-px flex-1" />
      <span className="text-ink-subtle text-[9.5px] font-semibold tracking-[0.1em] uppercase">
        {label}
      </span>
      <span className="bg-rule h-px flex-1" />
    </div>
  );
}
