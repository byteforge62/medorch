import React from 'react';
import Link from 'next/link';
import {
  FirstAidKit,
  ShieldCheck,
  Stethoscope,
  UserCircle,
} from '@phosphor-icons/react/dist/ssr';
import { Wordmark } from '@/components/shared/Brand';

/*======================================================================
  AuthShell — the front desk
  ======================================================================
  Split screen: a deep clinical-cobalt identity panel carrying the four
  access boundaries, and a white working panel carrying exactly one task.
  The plate states who the product is for; the form states what this
  screen does.

  On phones the panel compresses to a cobalt masthead so the form starts
  inside the first viewport.
====================================================================== */

const ACCESS_ROLES = [
  {
    label: 'Administrator',
    scope: 'Records, approvals, theatre and equipment registers',
    icon: <ShieldCheck size={15} weight="duotone" aria-hidden="true" />,
  },
  {
    label: 'Clinician',
    scope: 'Own surgical list, patients and case records',
    icon: <Stethoscope size={15} weight="duotone" aria-hidden="true" />,
  },
  {
    label: 'Theatre staff',
    scope: 'Assigned cases, room state and instruments',
    icon: <FirstAidKit size={15} weight="duotone" aria-hidden="true" />,
  },
  {
    label: 'Patient',
    scope: 'Own appointments only, in plain language',
    icon: <UserCircle size={15} weight="duotone" aria-hidden="true" />,
  },
];

export function AuthShell({
  plate,
  title,
  description,
  children,
  footer,
  asideNote,
}: {
  plate: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  asideNote?: string;
}) {
  return (
    <main className="bg-white lg:grid lg:min-h-screen lg:grid-cols-[minmax(0,1.04fr)_minmax(0,1fr)]">
      {/* — Identity panel — */}
      <aside className="bg-cobalt relative overflow-hidden text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:20px_20px] opacity-[0.14]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -right-28 h-[28rem] w-[28rem] rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-24 h-[24rem] w-[24rem] rounded-full bg-teal/20 blur-[110px]"
        />

        <div className="relative flex h-full flex-col px-5 py-5 sm:px-8 sm:py-7 lg:px-12 lg:py-10">
          <div className="flex items-center justify-between gap-3">
            <Wordmark href="/" tone="chalk" size="md" />
            <Link
              href="/"
              className="text-[10.5px] font-semibold text-white/70 transition-colors hover:text-white"
            >
              Back to site
            </Link>
          </div>

          <p className="mt-5 flex items-center gap-2 font-mono text-[9px] tracking-[0.14em] text-white/55 sm:mt-10">
            <span aria-hidden="true" className="h-px w-5 bg-white/40" />
            {plate}
          </p>

          <h2 className="mt-3 max-w-[16ch] text-[1.6rem] leading-[1.04] font-extrabold tracking-[-0.035em] sm:mt-4 sm:text-[clamp(1.9rem,2.5vw,2.7rem)]">
            Every theatre. Every case. One record.
          </h2>

          <p className="mt-3 max-w-[40ch] text-[12px] leading-[1.75] text-white/65 sm:mt-4">
            {asideNote ??
              'Schedules, rooms, teams, equipment and patient context — one calm operational record, authorised by role and attributed by event.'}
          </p>

          <ul className="mt-7 hidden space-y-2 sm:block lg:mt-9">
            {ACCESS_ROLES.map((role) => (
              <li
                key={role.label}
                className="flex items-start gap-3 rounded-[var(--radius-md)] border border-white/12 bg-white/[0.06] px-3 py-2.5 backdrop-blur-[2px]"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[9px] bg-white/10 text-teal-soft">
                  {role.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-[11.5px] leading-tight font-semibold text-white">
                    {role.label}
                  </p>
                  <p className="mt-0.5 text-[10px] leading-snug text-white/55">
                    {role.scope}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-auto hidden flex-wrap gap-x-4 gap-y-1 border-t border-white/15 pt-4 font-mono text-[8.5px] tracking-[0.1em] text-white/45 sm:flex">
            <span>ROLE-SCOPED</span>
            <span>ATTRIBUTED</span>
            <span>AUDITED</span>
          </div>
        </div>
      </aside>

      {/* — Working panel — */}
      <section className="bg-white">
        <div className="mx-auto flex min-h-screen w-full max-w-[28rem] flex-col justify-center px-5 py-8 sm:px-8 lg:px-10">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-cobalt-soft text-cobalt">
              <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
                <path
                  d="M6.4 2.6h7.2v3.8h3.8v7.2h-3.8v3.8H6.4v-3.8H2.6V6.4h3.8z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <p className="text-[9.5px] font-semibold tracking-[0.13em] text-ink-muted uppercase">
              {plate}
            </p>
          </div>

          <h1 className="mt-4 text-[clamp(1.65rem,4.6vw,2.15rem)] leading-[1.06] font-extrabold tracking-[-0.035em] text-midnight [&_em]:text-cobalt [&_em]:not-italic">
            {title}
          </h1>

          {description ? (
            <p className="mt-3 max-w-[44ch] text-[12.5px] leading-[1.7] text-ink-muted">
              {description}
            </p>
          ) : null}

          <div className="mt-6">{children}</div>

          {footer ? (
            <div className="mt-6 border-t border-rule pt-4 text-[10.5px] leading-relaxed text-ink-muted">
              {footer}
            </div>
          ) : null}

          <p className="mt-5 flex items-center gap-1.5 text-[9.5px] text-ink-subtle">
            <ShieldCheck size={12} weight="duotone" aria-hidden="true" />
            Protected clinical workspace · access is checked server-side
          </p>
        </div>
      </section>
    </main>
  );
}

/*======================================================================
  AccessBoundary — shared public exit for 401 / 404 / runtime errors.
====================================================================== */

export function AccessBoundary({
  code,
  title,
  description,
  children,
}: {
  code: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <main className="bg-paper text-ink relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-[size:20px_20px] opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      </div>

      <section className="relative z-10 w-full max-w-lg rounded-[var(--radius-xl)] border border-ice-border bg-white p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)] sm:p-8">
        <div className="flex items-center justify-between border-b border-rule pb-4">
          <Wordmark href="/" size="sm" />
          <span className="rounded-full border border-ice-border px-2.5 py-1 font-mono text-[9px] tracking-[0.08em] text-ink-muted">
            {code}
          </span>
        </div>

        <p className="ui-kicker mt-7">Access boundary</p>
        <h1 className="display mt-2 text-[clamp(2rem,5vw,2.8rem)]">{title}</h1>
        <p className="mt-3 max-w-[46ch] text-[12.5px] leading-relaxed text-ink-secondary">
          {description}
        </p>

        {children ? (
          <div className="mt-6 flex flex-wrap items-center gap-3">{children}</div>
        ) : null}

        <p className="mt-9 border-t border-rule pt-4 text-[10px] text-ink-subtle">
          If this keeps happening, contact the MedOrch administrator for your
          hospital.
        </p>
      </section>
    </main>
  );
}
