'use client';

import Link from 'next/link';
import { AccessBoundary } from '@/components/auth/AuthShell';
import { buttonClasses } from '@/components/ui/Button';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <AccessBoundary
      code="500 · runtime"
      title="The request stopped before it finished."
      description="A temporary application fault interrupted this screen. Your signed-in session is unaffected. Try the request again; if the fault repeats, give the administrator the time it occurred."
    >
      <button
        type="button"
        onClick={() => reset()}
        className={buttonClasses({ size: 'md' })}
      >
        Try this request again
      </button>
      <Link
        href="/dashboard"
        className={buttonClasses({ variant: 'outline', size: 'md' })}
      >
        Return to dashboard
      </Link>
    </AccessBoundary>
  );
}
