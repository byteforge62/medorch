import React from 'react';
import Link from 'next/link';
import {
  Fingerprint,
  FirstAidKit,
  ShieldCheck,
  Stethoscope,
  UserCircle,
} from '@phosphor-icons/react/dist/ssr';
import { Wordmark } from '@/components/brand/Brand';

/*======================================================================
  AuthShell — the access card
  ======================================================================
  A single floating card on the theatre's dark ground: an identity plate
  on the left carrying the product's four access boundaries, and a paper
  panel on the right carrying exactly one task.

  The plate is not decoration with a headline floating in it — it states
  who the product is for, and the form states what this screen does.
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
    <main className="bg-rail relative min-h-screen overflow-hidden px-3 py-3 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:56px_56px]" />
        <div className="bg-primary/25 absolute -top-40 -left-32 h-[30rem] w-[30rem] rounded-full blur-[130px]" />
        <div className="bg-brand-lavender/15 absolute -right-40 -bottom-48 h-[34rem] w-[34rem] rounded-full blur-[140px]" />
      </div>

      <div className="relative mx-auto w-full max-w-[74rem] overflow-hidden rounded-[22px] border border-white/10 bg-sheet shadow-[0_50px_130px_-50px_rgba(12,8,26,0.85)] lg:grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        {/* Identity plate */}
        <aside className="bg-rail relative flex flex-col overflow-hidden px-6 pt-7 pb-8 text-white sm:px-9 lg:px-11 lg:py-10">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.06),transparent_55%)]"
          />
          <div
            aria-hidden="true"
            className="absolute -top-24 -right-24 h-64 w-64 rounded-full border border-white/10"
          />

          <div className="relative">
            <Wordmark href="/" subtitle="Theatre operations" tone="chalk" size="md" />

            <p className="mt-9 flex items-center gap-2 font-mono text-[9px] tracking-[0.12em] text-white/40">
              <span aria-hidden="true" className="h-px w-5 bg-white/30" />
              {plate}
            </p>

            <h2 className="mt-4 max-w-[15ch] text-[clamp(1.9rem,2.6vw,2.6rem)] leading-[1.02] font-semibold tracking-[-0.035em] text-white">
              The operating day, in one record.
            </h2>

            <p className="mt-4 max-w-[38ch] text-[12px] leading-[1.75] text-white/55">
              {asideNote ??
                'Schedules, rooms, teams, equipment and patient context — one calm operational record, authorised by role and attributed by event.'}
            </p>
          </div>

          <ul className="relative mt-8 hidden space-y-2 sm:block">
            {ACCESS_ROLES.map((role) => (
              <li
                key={role.label}
                className="flex items-start gap-3 rounded-[10px] border border-white/[0.07] bg-white/[0.035] px-3 py-2.5"
              >
                <span className="text-brand-lavender grid h-7 w-7 shrink-0 place-items-center rounded-[8px] bg-white/[0.08]">
                  {role.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-[11.5px] leading-tight font-semibold text-white/90">
                    {role.label}
                  </p>
                  <p className="mt-0.5 text-[10px] leading-snug text-white/45">{role.scope}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="relative mt-8 flex flex-wrap gap-x-4 gap-y-1 border-t border-white/10 pt-3 font-mono text-[8.5px] tracking-[0.09em] text-white/35 lg:mt-auto lg:pt-6">
            <span>ROLE-SCOPED</span>
            <span>ATTRIBUTED</span>
            <span>AUDITED</span>
          </div>
        </aside>

        {/* Working panel */}
        <section className="bg-paper relative flex flex-col px-5 py-7 sm:px-8 lg:px-12 lg:py-10">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/"
              className="text-ink-muted hover:text-ink ml-auto text-[10.5px] font-semibold transition-colors"
            >
              Return to MedOrch
            </Link>
          </div>

          <div className="mx-auto flex w-full max-w-[25rem] flex-1 flex-col justify-center py-7 lg:py-8">
            <div className="flex items-center gap-2.5">
              <span className="border-rule bg-sheet text-primary grid h-9 w-9 place-items-center rounded-[10px] border shadow-[var(--shadow-xs)]">
                <Fingerprint size={18} weight="duotone" aria-hidden="true" />
              </span>
              <p className="text-ink-muted text-[9.5px] font-semibold tracking-[0.13em] uppercase">
                {plate}
              </p>
            </div>

            <h1 className="text-ink mt-5 text-[clamp(1.9rem,2.9vw,2.4rem)] leading-[1.04] font-semibold tracking-[-0.035em] [&_em]:text-primary [&_em]:not-italic">
              {title}
            </h1>

            {description ? (
              <p className="text-ink-muted mt-3 max-w-[44ch] text-[12.5px] leading-[1.7]">
                {description}
              </p>
            ) : null}

            <div className="mt-6">{children}</div>

            {footer ? (
              <div className="border-rule text-ink-muted mt-6 border-t pt-4 text-[10.5px] leading-relaxed">
                {footer}
              </div>
            ) : null}

            <p className="text-ink-subtle mt-5 flex items-center gap-1.5 text-[9.5px]">
              <ShieldCheck size={12} weight="duotone" aria-hidden="true" />
              Protected clinical workspace · access is checked server-side
            </p>
          </div>
        </section>
      </div>
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
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(112,85,190,0.04)_1px,transparent_1px)] bg-[size:64px_100%] [mask-image:linear-gradient(to_right,transparent,black)]" />
      </div>

      <section className="border-rule bg-sheet relative z-10 w-full max-w-lg border p-6 shadow-[0_20px_55px_rgba(41,36,61,0.08)] sm:p-8">
        <div className="border-rule flex items-center justify-between border-b pb-4">
          <Wordmark href="/" size="sm" />
          <span className="border-rule text-ink-muted border px-2 py-1 font-mono text-[9px] tracking-[0.08em]">
            {code}
          </span>
        </div>

        <p className="ui-kicker mt-7">Access boundary</p>
        <h1 className="display mt-2 text-[clamp(2rem,5vw,2.8rem)]">{title}</h1>
        <p className="text-ink-secondary mt-3 max-w-[46ch] text-[12px] leading-relaxed">
          {description}
        </p>

        {children ? <div className="mt-6 flex flex-wrap items-center gap-3">{children}</div> : null}

        <p className="text-ink-subtle border-rule mt-9 border-t pt-4 text-[10px]">
          If this keeps happening, contact the MedOrch administrator for your hospital.
        </p>
      </section>
    </main>
  );
}
