import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle,
  LockKey,
  SealCheck,
  ShieldCheck,
} from '@phosphor-icons/react/dist/ssr';

import { ArrowGlyph, buttonClasses } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/Type';

import { CobaltHeader } from '@/features/landing/components/cobalt/cobalt-header';
import { TheatreDayPreview } from '@/features/landing/components/cobalt/theatre-day-preview';
import { ModuleGrid } from '@/features/landing/components/cobalt/module-grid';
import { CaseFlow } from '@/features/landing/components/cobalt/case-flow';
import { AccessBand } from '@/features/landing/components/cobalt/access-band';
import { RoleGrid } from '@/features/landing/components/cobalt/role-grid';
import { CobaltFooter } from '@/features/landing/components/cobalt/cobalt-footer';

/*======================================================================
  MedOrch — the public front desk
  ======================================================================
  This page sells the product that is in this repository: a theatre day
  built from real cases, six modules, the booking rules, and the access
  model. Illustrative data only; nothing here reads a patient record.

  The visual language (porcelain canvas, cobalt, bio-teal, pill nav) is the
  house system. The content is MedOrch, not a design-token specimen.
====================================================================== */

const promises = [
  {
    title: 'Overlaps refused',
    copy: 'Room, surgeon and patient are checked as one booking, in the service and again in the database.',
    icon: LockKey,
  },
  {
    title: 'Scoped by role',
    copy: 'A signed-in account reaches its own records and nothing else — enforced in the query.',
    icon: ShieldCheck,
  },
  {
    title: 'Attributed end to end',
    copy: 'Approvals, delays, completions and cancellations name the account responsible.',
    icon: SealCheck,
  },
];

export function CobaltLanding() {
  return (
    <div className="cobalt-mesh text-ink min-h-screen overflow-x-clip">
      <a
        href="#main"
        className="focus:bg-sheet focus:text-cobalt sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[80] focus:rounded-full focus:px-4 focus:py-2 focus:text-[12px] focus:font-semibold focus:shadow-lg"
      >
        Skip to content
      </a>

      <CobaltHeader />

      <main id="main">
        {/* ——— Hero ——— */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(60%_100%_at_50%_0%,rgba(219,234,254,0.55),transparent_70%)]"
          />

          <div className="relative mx-auto w-full max-w-[84rem] px-4 pt-12 pb-10 sm:px-6 sm:pt-16 lg:px-8 lg:pt-20">
            <div className="mx-auto max-w-[56rem] text-center">
              <p className="inline-flex items-center gap-2 rounded-full border border-cobalt/15 bg-white/80 px-3.5 py-1.5 text-[11px] font-semibold text-ink-secondary shadow-xs backdrop-blur">
                <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal" />
                </span>
                Theatre scheduling for one hospital day
              </p>

              <h1 className="display-hero mt-5 text-[clamp(2.1rem,0.4rem+7.4vw,4.35rem)] text-midnight">
                <span className="block">The theatre day,</span>
                <span className="mt-1 block text-cobalt">on one record.</span>
              </h1>

              <p className="mx-auto mt-5 max-w-[52ch] text-[13.5px] leading-[1.7] text-ink-secondary sm:text-[15px]">
                MedOrch books the case, the room, the surgeon and the set
                together — then keeps the theatre board, the ward and the front
                desk planning from the same schedule instead of three.
              </p>

              <div className="mt-7 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
                <Link
                  href="/dashboard"
                  className={`${buttonClasses({ size: 'lg' })} w-full sm:w-auto`}
                >
                  Open the workspace
                  <ArrowGlyph />
                </Link>
                <a
                  href="#booking"
                  className={`${buttonClasses({ variant: 'secondary', size: 'lg' })} w-full sm:w-auto`}
                >
                  How a case is booked
                  <ArrowRight size={13} weight="bold" aria-hidden="true" />
                </a>
              </div>

              <p className="mx-auto mt-4 flex max-w-[44ch] items-start justify-center gap-1.5 text-[10.5px] leading-relaxed text-ink-subtle">
                <CheckCircle
                  size={12}
                  weight="fill"
                  className="mt-px shrink-0 text-teal"
                  aria-hidden="true"
                />
                <span>
                  Approved accounts only · role-scoped records · every change
                  attributed
                </span>
              </p>
            </div>

            <div id="theatre-day" className="mt-10 scroll-mt-28 sm:mt-12">
              <TheatreDayPreview />
            </div>

            <ul className="mt-8 grid gap-4 border-y border-cobalt/10 py-5 sm:grid-cols-3 sm:gap-6">
              {promises.map((promise) => {
                const Icon = promise.icon;

                return (
                  <li key={promise.title} className="flex items-start gap-2.5">
                    <Icon
                      size={16}
                      weight="duotone"
                      className="mt-0.5 shrink-0 text-cobalt"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-[11.5px] font-semibold text-midnight">
                        {promise.title}
                      </p>
                      <p className="mt-1 text-[10.5px] leading-relaxed text-ink-muted">
                        {promise.copy}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* ——— Modules ——— */}
        <section
          id="modules"
          className="scroll-mt-24 border-t border-ice-border/70 bg-white/70"
        >
          <div className="mx-auto w-full max-w-[84rem] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
            <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeading
                eyebrow="What the workspace holds"
                title={
                  <>
                    Six registers,
                    <br className="hidden sm:block" /> one theatre day.
                  </>
                }
              />
              <p className="max-w-[38ch] text-[12.5px] leading-[1.7] text-ink-muted lg:pb-1">
                Each module is a working screen, not a dashboard decoration. They
                read from the same case record, so a delay in one is visible in
                the others.
              </p>
            </div>

            <ModuleGrid />
          </div>
        </section>

        {/* ——— Booking rules ——— */}
        <section id="booking" className="scroll-mt-24 border-y border-ice-border/70 bg-[#F7FAFF]">
          <div className="mx-auto w-full max-w-[84rem] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
            <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeading
                eyebrow="How a case is booked"
                title="Three rules before a room is promised."
              />
              <p className="max-w-[38ch] text-[12.5px] leading-[1.7] text-ink-muted lg:pb-1">
                Scheduling breaks when two screens disagree about a theatre. The
                booking path is built so they cannot.
              </p>
            </div>

            <CaseFlow />
          </div>
        </section>

        {/* ——— Access ——— */}
        <section id="access" className="scroll-mt-24 bg-white">
          <div className="mx-auto w-full max-w-[84rem] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
            <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeading
                eyebrow="Access & accountability"
                title="Clinical records need a boundary, not a login screen."
              />
            </div>

            <AccessBand />
          </div>
        </section>

        {/* ——— Roles ——— */}
        <section id="roles" className="scroll-mt-24 border-t border-ice-border/70 bg-[#FBFDFF]">
          <div className="mx-auto w-full max-w-[84rem] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
            <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeading
                eyebrow="Who signs in"
                title="One day, four points of view."
              />
              <p className="max-w-[38ch] text-[12.5px] leading-[1.7] text-ink-muted lg:pb-1">
                The same case looks different to the administrator, the surgeon,
                the theatre team and the patient. Each role is given what it
                needs and no more.
              </p>
            </div>

            <RoleGrid />
          </div>
        </section>

        {/* ——— Close ——— */}
        <section className="border-t border-ice-border/70 bg-white">
          <div className="mx-auto w-full max-w-[84rem] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
            <div className="relative overflow-hidden rounded-[var(--radius-panel)] border border-cobalt/15 bg-[#F4F8FF] px-5 py-8 sm:px-8 sm:py-10">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(60%_100%_at_100%_50%,rgba(13,148,136,0.12),transparent_70%)]"
              />
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-[46ch]">
                  <p className="text-[10px] font-semibold tracking-[0.1em] text-cobalt uppercase">
                    Start with today
                  </p>
                  <h2 className="display mt-3 text-[clamp(1.6rem,1rem+2.4vw,2.4rem)] text-midnight">
                    Open the theatre day your team is already running.
                  </h2>
                  <p className="mt-3 text-[12.5px] leading-relaxed text-ink-muted">
                    Sign in with an approved account, or request access and an
                    administrator will review it.
                  </p>
                </div>

                <div className="flex flex-col gap-2.5 sm:flex-row">
                  <Link href="/login" className={buttonClasses({ size: 'lg' })}>
                    Sign in
                    <ArrowGlyph />
                  </Link>
                  <Link
                    href="/register"
                    className={buttonClasses({ variant: 'secondary', size: 'lg' })}
                  >
                    Request access
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <CobaltFooter />
    </div>
  );
}
