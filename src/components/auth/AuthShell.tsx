import React from 'react';
import Link from 'next/link';
import { Fingerprint, ShieldCheck } from '@phosphor-icons/react/dist/ssr';
import { BrandMark, Wordmark } from '@/components/brand/Brand';
import { MedicalOrbit } from '@/components/visual/MedicalOrbit';

/*======================================================================
  AuthShell — the lavender front desk.
  ======================================================================
  The left panel is a soft illustrated plate, not a dark technical
  watermark: a drawn clinician, layered lavender geometry and one clear
  statement. The right panel is the working form on white. On small
  screens the illustration is omitted and the form becomes the page.
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
    <main className="bg-paper text-ink min-h-screen lg:p-4">
      <div className="border-rule bg-sheet/60 mx-auto min-h-screen overflow-hidden shadow-[0_24px_80px_rgba(66,48,112,0.10)] backdrop-blur-sm lg:grid lg:min-h-[calc(100vh-2rem)] lg:max-w-[92rem] lg:grid-cols-[minmax(0,1.03fr)_minmax(0,0.97fr)] lg:rounded-[32px] lg:border">
        {/* ——— Illustrated frontispiece ——— */}
        <aside className="bg-paper-deep relative hidden flex-col overflow-hidden px-10 py-9 lg:flex xl:px-14 xl:py-11">
          <div
            className="absolute -top-24 -left-20 h-[24rem] w-[24rem] rounded-full border border-[#6550B5]/12"
            aria-hidden="true"
          />
          <div
            className="absolute top-12 left-10 h-[17rem] w-[17rem] rounded-full bg-[#D9CFF0]/55 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="absolute right-[-4rem] bottom-[-2rem] h-[21rem] w-[21rem] rounded-full bg-[#CBBEEA]/40 blur-2xl"
            aria-hidden="true"
          />

          <div className="relative z-10">
            <Wordmark href="/" subtitle="Theatre orchestration" />
          </div>

          <div className="relative z-10 mt-12 max-w-[31rem]">
            <span className="bg-sheet/70 border-rule text-primary inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold tracking-[0.1em] uppercase">
              <span className="bg-primary h-1.5 w-1.5 rounded-full" aria-hidden="true" />
              {plate}
            </span>
            <h2 className="display mt-5 text-[clamp(2.35rem,3.8vw,3.65rem)] leading-[1.02]">
              The theatre day,
              <br />
              held together.
            </h2>
            <p className="text-ink-secondary mt-5 max-w-[33ch] text-[13px] leading-[1.75]">
              {asideNote ??
                'Schedules, rooms, teams, equipment and patient context — one calm operational record, authorised by role and attributed by event.'}
            </p>
          </div>

          <div className="relative z-10 -mt-2 flex min-h-0 flex-1 items-center justify-center">
            <MedicalOrbit className="h-auto w-[min(88%,29rem)] drop-shadow-[0_24px_42px_rgba(101,80,181,0.12)]" />
          </div>

          <div className="relative z-10 flex items-center gap-2.5">
            {[
              ['Role-scoped', 'Four access boundaries'],
              ['Attributed', 'Every action recorded'],
            ].map(([titleText, detail]) => (
              <div
                key={titleText}
                className="bg-sheet/70 border-rule-soft flex-1 rounded-[16px] border px-3.5 py-2.5 backdrop-blur-sm"
              >
                <p className="text-ink text-[10.5px] font-semibold">{titleText}</p>
                <p className="text-ink-muted mt-0.5 text-[9.5px]">{detail}</p>
              </div>
            ))}
          </div>
        </aside>

        {/* ——— Working sheet ——— */}
        <section className="relative flex min-h-screen flex-col bg-[linear-gradient(180deg,#FFFDFF_0%,#FBF9FF_100%)]">
          <div className="flex h-[4.6rem] shrink-0 items-center justify-between px-5 sm:px-8">
            <div className="lg:hidden">
              <Wordmark size="sm" href="/" />
            </div>
            <Link
              href="/"
              className="text-ink-muted hover:text-ink ml-auto text-[11.5px] font-semibold transition-colors"
            >
              MedOrch index
            </Link>
          </div>

          <div className="flex flex-1 items-start px-5 pt-4 pb-12 sm:px-8 lg:items-center lg:px-12 lg:py-8">
            <div className="mx-auto w-full max-w-[27.5rem]">
              <div className="border-rule bg-sheet rounded-[26px] border p-6 shadow-[0_18px_50px_rgba(66,48,112,0.08)] sm:p-8">
                <div className="bg-primary-soft text-primary flex h-11 w-11 items-center justify-center rounded-[14px]">
                  <Fingerprint size={23} weight="duotone" aria-hidden="true" />
                </div>

                <p className="eyebrow mt-5">{plate}</p>
                <h1 className="display mt-2.5 text-[clamp(1.85rem,3.4vw,2.45rem)]">
                  {title}
                </h1>
                {description ? (
                  <p className="text-ink-secondary mt-3 text-[12.5px] leading-[1.7]">
                    {description}
                  </p>
                ) : null}

                <div className="mt-6">{children}</div>

                {footer ? (
                  <div className="border-rule-soft text-ink-muted mt-6 border-t pt-5 text-[11px] leading-relaxed">
                    {footer}
                  </div>
                ) : null}
              </div>

              <p className="text-ink-subtle mt-4 flex items-center justify-center gap-1.5 text-[10.5px]">
                <ShieldCheck size={13} weight="duotone" aria-hidden="true" />
                Protected clinical workspace
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
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute top-[-10rem] right-[-8rem] h-[28rem] w-[28rem] rounded-full border border-[#6550B5]/10" />
        <div className="absolute top-[-6rem] right-[-4rem] h-[19rem] w-[19rem] rounded-full bg-[#D9CFF0]/45 blur-3xl" />
        <div className="absolute bottom-[-12rem] left-[-6rem] h-[30rem] w-[30rem] rounded-full bg-[#E8E1F7]/80 blur-3xl" />
      </div>

      <section className="border-rule bg-sheet relative z-10 w-full max-w-lg overflow-hidden rounded-[28px] border p-6 shadow-[0_24px_70px_rgba(66,48,112,0.12)] sm:p-8">
        <div className="border-rule-soft flex items-center justify-between border-b pb-4">
          <Link
            href="/"
            className="flex items-center gap-2.5"
            aria-label="MedOrch home"
          >
            <BrandMark className="text-primary h-7 w-7" />
            <span className="text-[14px] font-semibold">MedOrch</span>
          </Link>
          <span className="bg-surface-subtle text-ink-secondary rounded-full px-2.5 py-1 font-mono text-[10px] tracking-[0.12em]">
            {code}
          </span>
        </div>

        <div className="bg-primary-soft text-primary mt-7 flex h-12 w-12 items-center justify-center rounded-[16px]">
          <ShieldCheck size={24} weight="duotone" aria-hidden="true" />
        </div>
        <p className="text-primary mt-4 text-[10.5px] font-semibold tracking-[0.1em] uppercase">
          Access boundary
        </p>
        <h1 className="display mt-2 text-[clamp(1.9rem,5vw,2.7rem)]">{title}</h1>
        <p className="text-ink-secondary mt-3 max-w-[46ch] text-[13.5px] leading-relaxed">
          {description}
        </p>

        {children ? (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {children}
          </div>
        ) : null}

        <p className="text-ink-subtle border-rule-soft mt-10 border-t pt-4 text-[11px]">
          If this keeps happening, contact the MedOrch administrator for your
          hospital.
        </p>
      </section>
    </main>
  );
}
