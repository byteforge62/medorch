import React from 'react';
import Link from 'next/link';
import { Wordmark } from '@/components/brand/Brand';
import { TheatrePlan } from '@/components/visual/TheatrePlan';

/*======================================================================
  AuthShell — the front desk, drawn as a plate.
  ======================================================================
  The left panel is the dark frontispiece: the mark, one editorial statement
  set full-width, and the theatre plan layered behind it as a technical
  watermark. Layering rather than splitting the panel keeps the statement at
  an unhurried measure — no orphaned words from a squeezed column.

  On small screens the frontispiece is dropped entirely and the form becomes
  the whole page.
====================================================================== */

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
    <main className="bg-paper text-ink min-h-screen lg:grid lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
      {/* ——— Frontispiece ——— */}
      <aside className="bg-ink text-chalk relative hidden flex-col justify-between overflow-hidden px-10 py-10 lg:flex xl:px-14 xl:py-12">
        <div className="blueprint-ink absolute inset-0 opacity-50" aria-hidden="true" />

        {/* Plan drawn behind the statement, cropped by the panel edge. */}
        <TheatrePlan
          className="pointer-events-none absolute top-1/2 -right-16 h-[88%] w-auto -translate-y-1/2 text-white/[0.17]"
          animate={false}
          showLabels={false}
        />

        <div className="relative">
          <Wordmark tone="chalk" href="/" subtitle="Theatre orchestration" />
        </div>

        <div className="relative my-8 flex flex-1 items-center">
          <div className="max-w-[23ch]">
            <p className="font-mono text-[9px] tracking-[0.26em] text-rail-muted uppercase">
              {plate}
            </p>
            <p className="display mt-5 text-[clamp(2.1rem,3.5vw,3.25rem)] text-chalk">
              One continuous record of the{' '}
              <em className="text-brass italic">theatre day</em>.
            </p>
            <p className="mt-6 max-w-[36ch] text-[12px] leading-[1.8] text-white/50">
              {asideNote ??
                'Schedules, rooms, teams, instruments and patients — authorised by role, attributed by event.'}
            </p>
          </div>
        </div>

        <div className="relative flex items-center justify-between border-t border-white/12 pt-4 font-mono text-[8px] tracking-[0.2em] text-rail-muted uppercase">
          <span>MedOrch v0.1.0</span>
          <span>Authorised access</span>
        </div>
      </aside>

      {/* ——— Working sheet ——— */}
      <section className="relative flex min-h-screen flex-col">
        <div className="border-rule flex h-[68px] shrink-0 items-center justify-between border-b px-5 sm:px-8 lg:justify-end">
          <div className="lg:hidden">
            <Wordmark size="sm" href="/" />
          </div>
          <Link
            href="/"
            className="link-draw font-mono text-[9px] tracking-[0.2em] text-ink-muted uppercase hover:text-ink"
          >
            ← Index
          </Link>
        </div>

        <div className="flex flex-1 items-start px-5 pt-8 pb-12 sm:px-8 lg:items-center lg:px-12 lg:py-10">
          <div className="mx-auto w-full max-w-[26rem]">
            <div className="border-ink border-t-2 pt-5">
              <p className="eyebrow">{plate}</p>
              <h1 className="display mt-3 text-[clamp(1.9rem,3.4vw,2.6rem)]">{title}</h1>
              {description ? (
                <p className="text-ink-secondary mt-3 max-w-[42ch] text-[13px] leading-[1.7]">
                  {description}
                </p>
              ) : null}
            </div>

            <div className="mt-8">{children}</div>

            {footer ? (
              <div className="border-rule-soft text-ink-muted mt-8 border-t pt-5 text-[11px] leading-relaxed">
                {footer}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
