import { AuthShell } from '@/components/auth/AuthShell';
import { LoginForm } from '@/components/auth/LoginForm';

/**
 * Sign-in — the front desk.
 * The dark frontispiece carries the identity; the sheet carries the form.
 */
export default function LoginPage() {
  return (
    <AuthShell
      plate="Access · 01"
      title={
        <>
          Enter the <em className="text-pine italic">theatre</em>.
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
      <LoginForm />
    </AuthShell>
  );
}
