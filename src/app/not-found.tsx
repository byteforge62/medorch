import Link from 'next/link';
import { AccessBoundary } from '@/components/auth/AuthShell';
import { buttonClasses } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <AccessBoundary
      code="404 · path"
      title="That record is not on this route."
      description="The page you requested does not exist, has moved, or belongs to a different part of MedOrch. Existing links and bookmarks continue to resolve to their current destinations."
    >
      <Link href="/dashboard" className={buttonClasses({ size: 'md' })}>
        Return to dashboard
      </Link>
      <Link
        href="/login"
        className={buttonClasses({ variant: 'outline', size: 'md' })}
      >
        Sign in
      </Link>
    </AccessBoundary>
  );
}
