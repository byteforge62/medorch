import Link from 'next/link';

import { BrandMark } from '@/components/shared/Brand';

const columns = [
  {
    title: 'Theatre',
    links: [
      { label: 'Theatre day', href: '/schedules' },
      { label: 'Theatres', href: '/ot-rooms' },
      { label: 'Equipment', href: '/equipment' },
      { label: 'Alerts', href: '/alerts' },
    ],
  },
  {
    title: 'Records',
    links: [
      { label: 'Appointments', href: '/patients/appointments' },
      { label: 'Clinicians', href: '/doctors' },
      { label: 'Patients', href: '/patients' },
      { label: 'Audit trail', href: '/audit' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign in', href: '/login' },
      { label: 'Request access', href: '/register' },
      { label: 'Reset password', href: '/forgot-password' },
    ],
  },
];

export function CobaltFooter() {
  return (
    <footer className="border-t border-ice-border bg-white">
      <div className="mx-auto w-full max-w-[84rem] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,0.7fr))]">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 rounded-full"
              aria-label="MedOrch home"
            >
              <BrandMark className="h-8 w-8" />
              <span className="font-display text-[19px] font-extrabold tracking-[-0.045em] text-midnight">
                Med<span className="text-cobalt">Orch</span>
              </span>
            </Link>

            <p className="mt-3 max-w-[36ch] text-[12px] leading-relaxed text-ink-muted">
              Theatre scheduling and coordination for a hospital surgical suite.
              The case, the room, the surgeon and the set in one record.
            </p>

            <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-ice-border bg-porcelain px-3 py-1.5 font-mono text-[9px] tracking-[0.08em] text-ink-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-teal" aria-hidden="true" />
              ROLE-SCOPED · AUDITED
            </p>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <p className="text-[10px] font-semibold tracking-[0.1em] text-ink-subtle uppercase">
                {column.title}
              </p>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-6 items-center text-[12px] text-ink-secondary transition-colors hover:text-cobalt"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-ice-border pt-5 text-[10.5px] text-ink-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 MedOrch. Demonstration data is synthetic.</p>
          <p className="font-mono text-[9.5px] tracking-[0.06em]">
            ORCHESTRATE · SCHEDULE · CARE
          </p>
        </div>
      </div>
    </footer>
  );
}
