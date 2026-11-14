import { AuthShell } from '@/components/auth/AuthShell';
import { LoginForm } from '@/components/auth/LoginForm';

/* Messages returned by the Google sign-in callback, and by NextAuth itself. */
const OAUTH_ERRORS: Record<string, string> = {
  account_pending_approval:
    'Your Google account is recognised, but the MedOrch account is awaiting administrator approval.',
  email_not_verified:
    'Verify your email address before signing in. Use the resend verification link below if needed.',
  google_no_email:
    'Google did not return an email address, so MedOrch could not match an account.',
  account_not_found:
    'No MedOrch account uses that Google address. Request an account first — a new Google sign-up becomes a pending patient account.',
  AccessDenied:
    'That account cannot sign in. Access is limited to active MedOrch accounts.',
  Configuration: 'Authentication is not fully configured on this deployment.',
};

/**
 * Sign-in — the front desk.
 * The identity plate carries the product; the paper panel carries one task.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const initialError = error
    ? OAUTH_ERRORS[error] ?? 'Sign-in could not be completed. Please try again.'
    : '';

  return (
    <AuthShell
      plate="Access · 01"
      title={
        <>
          Enter the <em>theatre</em>.
        </>
      }
      description="Access is scoped to your assigned role and account status. Sessions are verified on every request."
      asideNote="Schedule, theatre, team, instruments and patient record — one controlled workspace for the operating suite."
      footer={
        <>
          Authorised users only. Clinical access is governed by the role
          permission matrix and logged to the audit trail.
        </>
      }
    >
      <LoginForm
        initialError={initialError}
        googleEnabled={Boolean(
          process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
        )}
      />
    </AuthShell>
  );
}
