import React from 'react';
import Link from 'next/link';
import { Fingerprint, ShieldCheck } from '@phosphor-icons/react/dist/ssr';
import { Wordmark } from '@/components/brand/Brand';

/*======================================================================
  AuthShell — the theatre front desk.
  ======================================================================
  The left plate is a dark instrument panel with an architectural plan
  line, not an illustration floating in blur. The form sits directly on
  lavender paper and is not wrapped in another white card.
====================================================================== */

function DeskPlan() {
  return (
    <svg
      viewBox="0 0 520 420"
      fill="none"
      className="h-auto w-full text-white/55"
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1">
        <rect x="64" y="68" width="392" height="284" strokeOpacity="0.25" />
        <rect x="64" y="68" width="76" height="284" strokeOpacity="0.16" />
        <rect x="140" y="68" width="206" height="284" strokeOpacity="0.2" />
        <rect x="346" y="68" width="110" height="284" strokeOpacity="0.16" />
        <path d="M64 262h76M140 156h206M346 216h110" strokeOpacity="0.12" />
        <rect x="191" y="157" width="104" height="110" rx="20" strokeOpacity="0.65" />
        <path d="M243 157v110M191 212h104" strokeOpacity="0.28" strokeDasharray="3 6" />
        <circle cx="112" cy="118" r="18" strokeOpacity="0.35" />
        <circle cx="112" cy="118" r="7" strokeOpacity="0.6" />
        <circle cx="408" cy="304" r="18" strokeOpacity="0.35" />
        <path d="M64 334h26M64 340v-12M430 68h26M430 62v12" strokeOpacity="0.45" />
      </g>
      <g fill="currentColor" fontFamily="ui-monospace, monospace" fontSize="7.5" letterSpacing="1.1">
        <text x="80" y="58" fillOpacity="0.4">ANAESTHESIA</text>
        <text x="214" y="58" fillOpacity="0.4">LAMINAR FIELD</text>
        <text x="372" y="58" fillOpacity="0.4">STERILE</text>
        <text x="80" y="380" fillOpacity="0.4">THEATRE 01 / SCHEMATIC</text>
        <text x="420" y="380" fillOpacity="0.25">N</text>
      </g>
    </svg>
  );
}

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
    <main className="bg-paper text-ink min-h-screen lg:p-3">
      <div className="bg-rail mx-auto min-h-screen overflow-hidden lg:grid lg:min-h-[calc(100vh-1.5rem)] lg:max-w-[1480px] lg:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)]">
        <aside className="relative hidden min-h-[calc(100vh-1.5rem)] flex-col overflow-hidden px-10 py-9 text-white lg:flex xl:px-14 xl:py-11">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:64px_64px]"
          />
          <div
            aria-hidden="true"
            className="absolute -top-40 right-[-10rem] h-[32rem] w-[32rem] rounded-full border border-white/10"
          />

          <div className="relative z-10">
            <Wordmark
              href="/"
              subtitle="Theatre operations"
              tone="chalk"
              size="md"
            />
          </div>

          <div className="relative z-10 mt-14 max-w-[32rem]">
            <p className="flex items-center gap-2 font-mono text-[8.5px] tracking-[0.1em] text-white/40">
              <span className="h-px w-5 bg-white/30" aria-hidden="true" />
              {plate}
            </p>
            <h2 className="font-display mt-5 max-w-[15ch] text-[clamp(2.3rem,3.6vw,3.5rem)] leading-[0.98] font-medium text-white">
              The operating day,
              <br />
              in one record.
            </h2>
            <p className="mt-5 max-w-[36ch] text-[11.5px] leading-[1.8] text-white/55">
              {asideNote ??
                'Schedules, rooms, teams, equipment and patient context — one calm operational record, authorised by role and attributed by event.'}
            </p>
          </div>

          <div className="relative z-10 my-8 flex min-h-0 flex-1 items-center px-3">
            <DeskPlan />
          </div>

          <div className="relative z-10 grid grid-cols-2 border-t border-white/10 pt-4">
            {[
              ['Role-scoped', 'Four access boundaries'],
              ['Attributed', 'Every action recorded'],
            ].map(([label, detail]) => (
              <div key={label}>
                <p className="text-[10px] font-semibold text-white/85">{label}</p>
                <p className="mt-0.5 text-[9px] text-white/40">{detail}</p>
              </div>
            ))}
          </div>
        </aside>

        <section className="bg-paper relative flex min-h-screen flex-col lg:min-h-[calc(100vh-1.5rem)]">
          <div className="flex h-[4.6rem] shrink-0 items-center justify-between px-5 sm:px-8 lg:px-12">
            <div className="lg:hidden">
              <Wordmark size="sm" href="/" />
            </div>
            <Link
              href="/"
              className="text-ink-muted hover:text-ink ml-auto text-[10.5px] font-semibold transition-colors"
            >
              Return to MedOrch
            </Link>
          </div>

          <div className="flex flex-1 items-start px-5 pt-3 pb-12 sm:px-8 lg:items-center lg:px-12 lg:py-10 xl:px-16">
            <div className="mx-auto w-full max-w-[27rem]">
              <div className="border-rule bg-sheet flex h-10 w-10 items-center justify-center border">
                <Fingerprint size={21} weight="duotone" className="text-primary" aria-hidden="true" />
              </div>

              <p className="ui-kicker mt-6">{plate}</p>
              <h1 className="display text-ink mt-3 text-[clamp(2.1rem,3.5vw,2.75rem)]">
                {title}
              </h1>
              {description ? (
                <p className="text-ink-secondary mt-3.5 max-w-[42ch] text-[12px] leading-[1.75]">
                  {description}
                </p>
              ) : null}

              <div className="mt-7">{children}</div>

              {footer ? (
                <div className="border-rule text-ink-muted mt-7 border-t pt-5 text-[10.5px] leading-relaxed">
                  {footer}
                </div>
              ) : null}

              <p className="text-ink-subtle mt-6 flex items-center gap-1.5 text-[9.5px]">
                <ShieldCheck size={12} weight="duotone" aria-hidden="true" />
                Protected clinical workspace · access is checked server-side
              </p>
            </div>
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
