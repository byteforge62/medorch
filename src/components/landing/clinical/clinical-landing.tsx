import Link from 'next/link';
import { LandingHero } from './landing-hero';
import {
  ArrowDown,
  ArrowUpRight,
  CalendarBlank,
  CheckCircle,
  DoorOpen,
  ShieldCheck,
  Stack,
  UsersThree,
} from '@phosphor-icons/react/dist/ssr';

import { BrandMark, Wordmark } from '@/components/brand/Brand';

import { ClinicalHeader } from './clinical-header';
import {
  AccessMap,
  ConflictTriptych,
  EquipmentSurface,
  HeroStage,
  LandingMarker,
  ModuleAtlas,
  ResourceMap,
  TheatrePlate,
  WorkflowPath,
} from './landing-art';
import { TheatrePreview } from './theatre-preview';

const primaryButton =
  'group inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-primary px-5 text-[12px] font-semibold text-primary-ink shadow-[0_10px_24px_rgba(112,85,190,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[0_14px_30px_rgba(112,85,190,0.28)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

const secondaryButton =
  'inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border border-rule-strong bg-sheet/70 px-5 text-[12px] font-semibold text-ink-secondary transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-sheet hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

const landingSections = [
  ['#platform', 'Theatre day'],
  ['#coordination', 'Coordination'],
  ['#theatre', 'Theatre floor'],
  ['#resources', 'Resources'],
  ['#equipment', 'Equipment'],
  ['#access', 'Access'],
  ['#modules', 'Modules'],
] as const;

const theatreStates = [
  ['Available', 'bg-success'],
  ['In use', 'bg-primary'],
  ['Turnover', 'bg-warning'],
  ['Maintenance', 'bg-danger'],
] as const;

export function ClinicalLanding({
  production = false,
}: {
  production?: boolean;
}) {
  return (
    <div className="landing-clinical bg-paper text-ink min-h-screen overflow-x-clip">
      <a
        href="#main"
        className="focus:bg-sheet focus:text-primary sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:px-4 focus:py-2 focus:text-[12px] focus:font-semibold focus:shadow-lg"
      >
        Skip to content
      </a>

      <ClinicalHeader homeHref={production ? '/' : '/design-system/clinical'} />

      <main id="main">
        {/* ——— The stage ——— */}
        <LandingHero/>

        {/* ——— Scheduling ——— */}
        <section id="platform" className="defer-render scroll-mt-20 bg-[#fbfaff] px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-[1360px]">
            <div className="landing-reveal border-rule/80 grid gap-7 border-b pb-8 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <LandingMarker index="01">THE WORKING DAY</LandingMarker>
                <h2 className="display text-ink mt-5 max-w-[22ch] text-[clamp(1.85rem,1.2rem+1.9vw,3rem)] leading-[1.02]">
                  The day is the interface.
                </h2>
              </div>
              <p className="text-ink-muted max-w-[44ch] text-[13px] leading-[1.8] lg:col-span-4 lg:pb-1">
                Theatre lanes, recorded durations and selected-case context share one surface.
                The desk and the theatre are reading the same day, not two versions of it.
              </p>
            </div>

            <div className="landing-reveal landing-reveal-late mt-10">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <span className="text-ink-subtle font-mono text-[8.5px] tracking-[0.1em]">
                  PRODUCT SURFACE / SCHEDULE
                </span>
                <span className="text-ink-subtle flex items-center gap-1.5 font-mono text-[8px]">
                  <span className="bg-success h-1.5 w-1.5 rounded-full" aria-hidden="true" />
                  ILLUSTRATIVE · NO PATIENT DATA
                </span>
              </div>

              <div className="overflow-hidden rounded-[18px] shadow-[0_24px_70px_rgba(41,36,61,0.1)]">
                <TheatrePreview />
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {[
                  ['Recorded time', 'Blocks sit at their real start and end.'],
                  ['Room first', 'Every lane is a theatre with its own state.'],
                  ['Selected context', 'Team, set and priority stay in view.'],
                ].map(([title, copy]) => (
                  <div key={title} className="border-rule border-t pt-3">
                    <p className="text-primary flex items-center gap-1.5 text-[10px] font-semibold">
                      <span className="bg-primary h-1 w-1 rounded-full" aria-hidden="true" />
                      {title}
                    </p>
                    <p className="text-ink-muted mt-1.5 text-[11px] leading-[1.55]">{copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ——— Conflict ——— */}
        <section id="coordination" className="defer-render bg-rail scroll-mt-20 overflow-hidden text-white">
          <div className="mx-auto grid max-w-[1360px] gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-12 lg:items-start lg:gap-14 lg:px-8">
            <div className="landing-reveal lg:col-span-5">
              <LandingMarker index="02" tone="dark">
                COORDINATION / CONFLICT
              </LandingMarker>
              <h2 className="font-display mt-5 max-w-[12ch] text-[clamp(2.2rem,1.4rem+2.2vw,3.5rem)] leading-[0.98] font-semibold">
                A conflict should never reach the corridor.
              </h2>
              <p className="mt-5 max-w-[44ch] text-[13px] leading-[1.8] text-white/60">
                Room, surgeon and patient ranges are checked together. A conflicting request is
                refused by the service and again by the database, then written to the record.
              </p>

              <ul className="mt-7 space-y-3 border-t border-white/12 pt-5">
                {[
                  'Room, surgeon and patient checked in one request',
                  'PostgreSQL repeats the exclusion rule',
                  'Accepted and refused decisions remain attributable',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[10.5px] leading-relaxed text-white/70">
                    <CheckCircle
                      size={13}
                      weight="fill"
                      className="text-brand-lavender mt-0.5 shrink-0"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>

              <p className="mt-8 flex items-center gap-2 font-mono text-[8.5px] tracking-[0.08em] text-white/60">
                <span className="h-px w-8 bg-white/20" aria-hidden="true" />
                ILLUSTRATIVE REQUEST / REAL VALIDATION MODEL
              </p>
            </div>

            <div className="landing-reveal landing-reveal-late lg:col-span-7">
              <ConflictTriptych />
            </div>
          </div>
        </section>

        {/* ——— Theatre ——— */}
        <section id="theatre" className="defer-render bg-paper-deep scroll-mt-20 overflow-hidden">
          <div className="mx-auto max-w-[1360px] px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <div className="grid gap-9 lg:grid-cols-12 lg:items-center lg:gap-6">
              <div className="landing-reveal lg:col-span-4 lg:pt-10">
                <LandingMarker index="03">THE THEATRE FLOOR</LandingMarker>
                <h2 className="display text-ink mt-5 max-w-[14ch] text-[clamp(1.8rem,1.2rem+1.5vw,2.65rem)] leading-[1.04]">
                  A room with a memory.
                </h2>
                <p className="text-ink-muted mt-4 max-w-[38ch] text-[13px] leading-[1.8]">
                  Identity, department ownership, capacity and current state belong to the theatre.
                  A case is booked into that room — availability is a fact, not a recollection.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {theatreStates.map(([label, tone]) => (
                    <span
                      key={label}
                      className="border-rule bg-sheet/70 text-ink-secondary flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[9.5px]"
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${tone}`} aria-hidden="true" />
                      {label}
                    </span>
                  ))}
                </div>

                <p className="text-ink-muted mt-6 flex items-start gap-1.5 text-[9.5px] leading-relaxed">
                  <DoorOpen size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
                  Room codes and states come from the theatre register.
                </p>
              </div>

              <div className="landing-reveal landing-reveal-late lg:col-span-8">
                <TheatrePlate />
              </div>
            </div>
          </div>
        </section>

        {/* ——— Resources ——— */}
        <section id="resources" className="defer-render scroll-mt-20 bg-[#fbfaff] px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-[1360px]">
            <div className="landing-reveal mb-9 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="lg:max-w-[54%]">
                <LandingMarker index="04">RESOURCE COORDINATION</LandingMarker>
                <h2 className="display text-ink mt-5 max-w-[20ch] text-[clamp(1.9rem,1.2rem+1.8vw,2.9rem)] leading-[1.03]">
                  Every dependency,
                  <span className="text-ink-muted mt-1 block text-[0.7em] font-normal">
                    attached to the case.
                  </span>
                </h2>
              </div>
              <p className="text-ink-muted max-w-[38ch] text-[13px] leading-[1.8]">
                Staff roles and equipment attach to the schedule itself. A set is claimed while the
                case is open and released when it closes, with maintenance state visible at the
                point of choice.
              </p>
            </div>

            <div className="landing-reveal landing-reveal-late">
              <ResourceMap />
            </div>

            <p className="text-ink-subtle mt-4 flex items-start gap-1.5 text-[9.5px] leading-relaxed">
              <ShieldCheck size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
              Availability is read from the schedule record, never a manually maintained badge.
            </p>
          </div>
        </section>

        {/* ——— Equipment ——— */}
        <section id="equipment" className="defer-render scroll-mt-20 bg-paper px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-[1360px]">
            <div className="landing-reveal grid gap-7 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-5">
                <LandingMarker index="05">EQUIPMENT READINESS</LandingMarker>
                <h2 className="display text-ink mt-5 max-w-[16ch] text-[clamp(1.8rem,1.2rem+1.5vw,2.55rem)] leading-[1.04]">
                  Readiness is part of the record.
                </h2>
              </div>
              <p className="text-ink-muted max-w-[46ch] text-[13px] leading-[1.8] lg:col-span-7 lg:pb-1">
                A set is not ready because someone says it is. Assignment, release and maintenance
                due dates are read from the same operational register.
              </p>
            </div>

            <div className="landing-reveal landing-reveal-late mt-9">
              <EquipmentSurface />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[9px] text-ink-subtle">
              <span className="flex items-center gap-1.5">
                <UsersThree size={12} aria-hidden="true" />
                Equipment assignment is visible to the theatre team.
              </span>
              <span className="font-mono text-[8px] tracking-[0.08em]">NO PATIENT RECORD IN THIS VIEW</span>
            </div>
          </div>
        </section>

        {/* ——— Access ——— */}
        <section id="access" className="defer-render scroll-mt-20 bg-[#efe9f8] px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-[1360px]">
            <div className="landing-reveal grid gap-7 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <LandingMarker index="06">ACCESS AND MEMORY</LandingMarker>
                <h2 className="display text-ink mt-5 max-w-[20ch] text-[clamp(1.85rem,1.2rem+1.7vw,2.7rem)] leading-[1.03]">
                  Four roles. One boundary.
                </h2>
              </div>
              <p className="text-ink-muted max-w-[40ch] text-[13px] leading-[1.8] lg:col-span-4 lg:pb-1">
                A hidden button is not a boundary. Every request is checked on the server, and every
                accepted mutation carries the person and role responsible.
              </p>
            </div>

            <div className="landing-reveal landing-reveal-late mt-9">
              <AccessMap />
            </div>
          </div>
        </section>

        {/* ——— Modules and workflow ——— */}
        <section id="modules" className="defer-render scroll-mt-20 bg-[#fbfaff] px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-[1360px]">
            <div className="landing-reveal grid gap-7 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <LandingMarker index="07">THE REGISTER</LandingMarker>
                <h2 className="display text-ink mt-5 max-w-[22ch] text-[clamp(1.85rem,1.2rem+1.7vw,2.7rem)] leading-[1.03]">
                  Ten records. One relational spine.
                </h2>
              </div>
              <p className="text-ink-muted max-w-[40ch] text-[13px] leading-[1.8] lg:col-span-4 lg:pb-1">
                The same relational records read through different operational views. Each module
                owns a real job, and the same case keeps its context across all of them.
              </p>
            </div>

            <div className="landing-reveal landing-reveal-late mt-10">
              <WorkflowPath />
            </div>

            <div className="landing-reveal landing-reveal-late mt-12">
              <ModuleAtlas />
            </div>
          </div>
        </section>
      </main>

      {/* ——— Close ——— */}
      <footer className="bg-rail relative overflow-hidden text-white">
        <div aria-hidden="true" className="landing-dark-grid pointer-events-none absolute inset-0 opacity-45" />
        <BrandMark
          tone="dark"
          className="pointer-events-none absolute -right-8 -bottom-6 hidden h-[24rem] w-[24rem] opacity-[0.06] lg:block"
        />

        <div className="relative mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-9 border-b border-white/12 py-16 sm:py-20 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="flex items-center gap-2 font-mono text-[8.5px] tracking-[0.12em] text-white/60">
                <Stack size={12} aria-hidden="true" />
                OPEN THE RECORD
              </p>
              <h2 className="font-display mt-4 max-w-[18ch] text-[clamp(2.2rem,1.5rem+2.2vw,3.8rem)] leading-[1.0] font-semibold">
                Bring the whole theatre day into view.
              </h2>
              <p className="mt-4 max-w-[52ch] text-[12px] leading-[1.8] text-white/55">
                New accounts are verified, then approved with a role before they can reach a record.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
              <Link
                href="/register"
                prefetch={false}
                className="text-ink hover:bg-paper inline-flex h-11 items-center gap-1.5 rounded-[10px] bg-white px-5 text-[11.5px] font-semibold transition-colors"
              >
                Request access
                <ArrowUpRight size={13} weight="bold" aria-hidden="true" />
              </Link>
              <Link
                href="/login"
                prefetch={false}
                className="inline-flex h-11 items-center rounded-[10px] border border-white/25 px-5 text-[11.5px] font-semibold text-white transition-colors hover:bg-white/10"
              >
                Sign in
              </Link>
            </div>
          </div>

          <div className="grid gap-9 py-10 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,.6fr))]">
            <div>
              <Wordmark tone="chalk" size="lg" subtitle="Theatre operations" href="/" />
              <p className="mt-4 max-w-[34ch] text-[10.5px] leading-[1.7] text-white/60">
                Operating theatre orchestration for hospital operations, clinical teams and patients.
              </p>
              <p className="mt-5 flex items-center gap-2 font-mono text-[8px] tracking-[0.1em] text-white/60">
                <span className="landing-pulse h-1.5 w-1.5 rounded-full bg-success-bright" aria-hidden="true" />
                MEDORCH / THEATRE DESK / 2026
              </p>
            </div>

            <nav aria-label="Platform" className="text-[10.5px]">
              <p className="font-semibold text-white/70">Platform</p>
              <ul className="mt-3 space-y-2">
                {landingSections.slice(0, 4).map(([href, label]) => (
                  <li key={href}>
                    <a
                      href={href}
                      className="inline-flex min-h-6 items-center text-white/60 transition-colors hover:text-white"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Operations" className="text-[10.5px]">
              <p className="font-semibold text-white/70">Operations</p>
              <ul className="mt-3 space-y-2">
                {landingSections.slice(4).map(([href, label]) => (
                  <li key={href}>
                    <a
                      href={href}
                      className="inline-flex min-h-6 items-center text-white/60 transition-colors hover:text-white"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Account" className="text-[10.5px]">
              <p className="font-semibold text-white/70">Account</p>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link
                    href="/login"
                    prefetch={false}
                    className="inline-flex min-h-6 items-center text-white/60 transition-colors hover:text-white"
                  >
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    prefetch={false}
                    className="inline-flex min-h-6 items-center text-white/60 transition-colors hover:text-white"
                  >
                    Request access
                  </Link>
                </li>
                {!production ? (
                  <li>
                    <Link
                      href="/design-system"
                      prefetch={false}
                      className="inline-flex min-h-6 items-center text-white/60 transition-colors hover:text-white"
                    >
                      Design system
                    </Link>
                  </li>
                ) : null}
              </ul>
            </nav>
          </div>

          <div className="flex flex-col gap-2 border-t border-white/12 py-5 text-[8.5px] text-white/60 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 MedOrch. Product preview data is synthetic.</p>
            <p>Clinical operations · schedules · rooms · teams · equipment</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
