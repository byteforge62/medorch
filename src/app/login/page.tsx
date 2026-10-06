import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-surface text-foreground">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.8fr)]">
        <section className="hidden border-r border-border px-8 py-8 lg:flex lg:flex-col lg:justify-between lg:px-12 xl:px-16">
          <div>
            <Link href="/" className="text-sm font-bold tracking-[0.18em] text-foreground" aria-label="MedOrch home" >
              MEDORCH
            </Link>
          </div>

          <div className="max-w-xl py-16">
            <p className="mb-5 border-l-2 border-primary pl-3 text-xs font-semibold uppercase tracking-[0.16em] text-foreground-secondary">
              Operating Theatre Operations
            </p>

            <h1 className="text-5xl font-bold tracking-[-0.03em] text-foreground xl:text-6xl xl:leading-[1.05]">
              One system for the
              <span className="block text-primary">operating theatre.</span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-foreground-secondary">
              Coordinate schedules, rooms, clinical teams, equipment, patients,
              and operational alerts from one controlled workspace.
            </p>

            <ul className="mt-8 space-y-3 text-sm text-foreground-secondary">
              {["Centralized scheduling", "Operational resource coordination", "Role-based access"].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border-strong bg-surface-subtle" aria-hidden="true">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-foreground-muted">MedOrch Operations Platform</p>
        </section>

        <section className="flex min-h-screen items-center px-5 py-8 sm:px-8 lg:px-12 xl:px-16">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Link href="/" className="text-sm font-bold tracking-[0.18em] text-foreground" aria-label="MedOrch home">
                MEDORCH
              </Link>
            </div>

            <div className="mb-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-foreground-muted">Secure access</p>
              <h2 className="text-3xl font-bold tracking-[-0.02em] text-foreground">Sign in</h2>
              <p className="mt-2 text-sm leading-6 text-foreground-secondary">
                Access the operating theatre management system.
              </p>
            </div>

            <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5 sm:p-6">
              <LoginForm />
            </div>

            <p className="mt-5 text-center text-xs leading-5 text-foreground-muted">
              Authorized users only. Access is controlled by your assigned role and account status.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
