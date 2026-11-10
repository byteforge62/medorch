import Link from 'next/link';
import { AccessBoundary } from '@/components/auth/AuthShell';
import { buttonClasses } from '@/components/ui/Button';

export default function UnauthorizedPage() {
  return (
    <AccessBoundary
      code="403 · scope"
      title="This record is outside your access."
      description="Your account is active, but its role does not include this area. Nothing has changed and no data was exposed. Return to your own workspace, or sign in with an account that holds the required permission."
    >
      <Link href="/dashboard" className={buttonClasses({ size: 'md' })}>
        Return to my workspace
      </Link>
      <Link
        href="/login"
        className={buttonClasses({ variant: 'outline', size: 'md' })}
      >
        Sign in with another account
      </Link>
    </AccessBoundary>
  );
}
