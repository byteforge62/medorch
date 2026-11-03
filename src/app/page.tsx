import Link from 'next/link';
import { Wordmark, BrandMark } from '@/components/brand/Brand';
import { TheatrePlan } from '@/components/visual/TheatrePlan';
import { DeptGlyph } from '@/components/visual/DeptGlyph';
import { Reveal } from '@/components/motion/Reveal';

/*======================================================================
  MedOrch — title sheet
  ======================================================================
  The landing page is composed as the front matter of a surgical atlas:
  a masthead, plate 01 (the hero), then numbered plates for the day sheet,
  the suite, the access model and the instrumentation. Content is drawn from
  the real system — the six schedule states, the ten operational modules and
  the four role scopes are the application's own vocabulary, not invented
  marketing metrics.
====================================================================== */

const modules = [
  {
    code: '01',
    name: 'Dashboard',
    note: 'Role-composed operational overview.',
  },
  { code: '02', name: 'Schedules', note: 'Bookings, status and conflict checks.' },
  { code: '03', name: 'Departments', note: 'Clinical structure and theatre ownership.' },
  { code: '04', name: 'Patients', note: 'Registry, records and clinical access.' },
  { code: '05', name: 'Doctors', note: 'Surgeons, specialities and assignments.' },
  { code: '06', name: 'Equipment', note: 'Instruments, availability and maintenance.' },
  { code: '07', name: 'Theatres', note: 'Room state, occupancy and turnover.' },
  { code: '08', name: 'Appointments', note: 'The patient-facing schedule view.' },
  { code: '09', name: 'Accounts', note: 'Verification and approval control.' },
  { code: '10', name: 'Audit trail', note: 'Every action, attributed and dated.' },
];

const statuses = [
  { code: 'SC', label: 'Scheduled', note: 'Booked, resources held.' },
  { code: 'CF', label: 'Confirmed', note: 'Team and theatre agreed.' },
  { code: 'IP', label: 'In progress', note: 'Case open in theatre.' },
  { code: 'DL', label: 'Delayed', note: 'Held with a reason.' },
  { code: 'CN', label: 'Cancelled', note: 'Released, recorded.' },
  { code: 'CP', label: 'Completed', note: 'Closed and auditable.' },
];

const roles = [
  {
    role: 'Administrator',
    scope: '25 permissions',
    glyph: 'theatre' as const,
    lines: ['Accounts and approvals', 'Full schedule control', 'Audit trail access'],
  },
  {
    role: 'Doctor',
    scope: '13 permissions',
    glyph: 'imaging' as const,
    lines: ['Clinical patient record', 'Schedule and notes', 'Own alert management'],
  },
  {
    role: 'OT staff',
    scope: '9 permissions',
    glyph: 'sterile' as const,
    lines: ['Assigned theatres only', 'Redacted patient detail', 'Read-only resources'],
  },
  {
    role: 'Patient',
    scope: '4 permissions',
    glyph: 'anaesthesia' as const,
    lines: ['Own appointments', 'Own alert stream', 'No clinical exposure'],
  },
];

const stack = [
  ['Runtime', 'Next.js 16 · React 19'],
  ['Data', 'Prisma 7 · PostgreSQL'],
  ['Identity', 'NextAuth · JWT sessions'],
  ['Validation', 'Zod · server-enforced'],
  ['Audit', 'Attributed event log'],
];

function PlateMark({
  index,
  label,
}: {
  index: string;
  label: string;
}) {
  return (
    <div className="mb-8 flex items-baseline gap-4">
      <span className="text-vermilion tnum font-mono text-[10px] tracking-[0.2em]">
        {index}
      </span>
      <span className="bg-rule h-px flex-1" aria-hidden="true" />
      <span className="eyebrow">{label}</span>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="bg-paper text-ink relative min-h-screen">
      {/* ————————————————————————— Masthead ————————————————————————— */}
      <header className="border-rule bg-paper/95 sticky top-0 z-40 border-b backdrop-blur-[2px]">
        <div className="mx-auto flex h-[72px] max-w-[90rem] items-center justify-between gap-3 px-5 sm:gap-6 sm:px-8 lg:px-12">
          <Wordmark subtitle="Operating theatre orchestration" />

          <nav aria-label="Sections" className="hidden items-center gap-9 lg:flex">
            {[
              ['01', 'Theatre', '#theatre'],
              ['02', 'Suite', '#suite'],
              ['03', 'Access', '#access'],
              ['04', 'Build', '#build'],
            ].map(([code, label, href]) => (
              <a
                key={href}
                href={href}
                className="group link-draw flex items-baseline gap-2 font-mono text-[9px] tracking-[0.22em] uppercase"
              >
                <span className="text-vermilion/70">{code}</span>
                <span className="text-ink-muted group-hover:text-ink transition-colors">
                  {label}
                </span>
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/register"
              className="link-draw hidden font-mono text-[9px] tracking-[0.22em] text-ink-muted uppercase transition-colors hover:text-ink sm:inline"
            >
              Request access
            </Link>
            <Link
              href="/login"
              className="bg-pine text-chalk hover:bg-pine-deep inline-flex h-9 shrink-0 items-center gap-2 px-4 font-mono text-[9px] tracking-[0.2em] whitespace-nowrap uppercase transition-colors"
            >
              Sign in
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </header>

      <main id="main">
        {/* ——————————————————— Plate 01 · Hero ——————————————————— */}
        <section className="border-rule border-b" aria-labelledby="hero-title">
          <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-12">
            <div className="grid gap-x-12 gap-y-14 py-12 lg:grid-cols-12 lg:py-16">
              {/* Title column */}
              <div className="lg:col-span-7 lg:pt-6">
                <div className="flex items-center gap-3">
                  <BrandMark className="text-vermilion h-4 w-4" />
                  <p className="eyebrow">Plate 01 · Theatre orchestration</p>
                </div>

                <h1
                  id="hero-title"
                  className="display mt-7 text-[clamp(2.75rem,6.4vw,5.4rem)]"
                >
                  The operating theatre,
                  <br />
                  in a <em>single field</em>
                  <br />
                  of view.
                </h1>

                <p className="text-ink-secondary mt-8 max-w-[52ch] text-[15px] leading-[1.7]">
                  MedOrch coordinates the schedule, the room, the clinical team,
                  the instrument set and the patient record as one continuous
                  operational object — with access scoped to the role that needs
                  it, and every action attributed in the audit trail.
                </p>

                <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    href="/login"
                    className="bg-pine text-chalk hover:bg-pine-deep group inline-flex h-12 items-center justify-between gap-8 px-5 font-mono text-[10px] tracking-[0.2em] uppercase transition-colors sm:justify-start"
                  >
                    Enter the platform
                    <span
                      className="transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </Link>

                  <Link
                    href="/register"
                    className="border-ink text-ink hover:bg-sheet inline-flex h-12 items-center border px-5 font-mono text-[10px] tracking-[0.2em] uppercase transition-colors"
                  >
                    Request an account
                  </Link>
                </div>

                {/* Real system facts, not invented metrics */}
                <dl className="border-rule mt-12 grid grid-cols-3 border-t">
                  {[
                    ['10', 'Operational modules'],
                    ['6', 'Schedule states'],
                    ['4', 'Role scopes'],
                  ].map(([value, label], index) => (
                    <div
                      key={label}
                      className={`py-4 ${index > 0 ? 'border-rule border-l pl-5' : ''}`}
                    >
                      <dt className="sr-only">{label}</dt>
                      <dd>
                        <span className="tnum block font-mono text-[15px] font-medium">
                          {value}
                        </span>
                        <span className="text-ink-muted mt-1 block font-mono text-[8px] tracking-[0.18em] uppercase">
                          {label}
                        </span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Plate column */}
              <div className="lg:col-span-5">
                <figure className="corner-ticks border-rule bg-sheet relative border p-4 sm:p-5">
                  <figcaption className="mb-3 flex items-center justify-between font-mono text-[8px] tracking-[0.22em] uppercase">
                    <span className="text-ink-muted">Fig. 1 — Theatre suite</span>
                    <span className="text-vermilion">Plan</span>
                  </figcaption>

                  <div className="border-rule-soft bg-paper/60 border">
                    <TheatrePlan className="text-ink h-auto w-full" />
                  </div>

                  <div className="border-rule-soft text-ink-muted mt-3 flex items-center justify-between border-t pt-2.5 font-mono text-[8px] tracking-[0.18em] uppercase">
                    <span>Suite 01</span>
                    <span aria-hidden="true">·</span>
                    <span>Laminar flow</span>
                    <span aria-hidden="true">·</span>
                    <span>2 lamp heads</span>
                  </div>
                </figure>
              </div>
            </div>
          </div>
        </section>

        {/* ——————————————— Plate 02 · The day sheet ——————————————— */}
        <section id="theatre" aria-labelledby="day-sheet-title" className="border-rule border-b">
          <div className="mx-auto max-w-[90rem] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
            <PlateMark index="02" label="The day sheet" />

            <div className="grid gap-x-14 gap-y-12 lg:grid-cols-12">
              <Reveal className="lg:col-span-5">
                <h2
                  id="day-sheet-title"
                  className="display text-[clamp(2rem,3.6vw,3.1rem)]"
                >
                  Every case, from booking to close.
                </h2>
                <p className="text-ink-secondary mt-6 max-w-[44ch] text-[14px] leading-[1.75]">
                  A theatre day is a sequence of states, not a list of cards.
                  MedOrch models the schedule as a state machine with permitted
                  transitions, conflict checks against the room and its window,
                  and an audit event at every move.
                </p>
                <p className="text-ink-muted mt-5 max-w-[44ch] text-[13px] leading-[1.75]">
                  Priority is recorded alongside time and theatre, so an
                  emergency is visible as an emergency rather than a colour.
                </p>

                <div className="border-rule mt-9 border-t pt-5">
                  <p className="eyebrow mb-3">Priority classes</p>
                  <div className="flex flex-wrap gap-2">
                    {['ELECTIVE', 'URGENT', 'EMERGENCY'].map((priority) => (
                      <span
                        key={priority}
                        className="border-rule text-ink-muted border px-2 py-1 font-mono text-[8px] tracking-[0.18em]"
                      >
                        {priority}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>

              <Reveal delay={120} className="lg:col-span-7">
                <div className="border-rule bg-sheet border">
                  <div className="border-rule-soft flex items-center justify-between border-b px-4 py-2.5">
                    <span className="font-mono text-[8px] tracking-[0.22em] text-ink-muted uppercase">
                      Schedule state machine
                    </span>
                    <span className="font-mono text-[8px] tracking-[0.22em] text-vermilion uppercase">
                      6 states
                    </span>
                  </div>

                  <ol className="divide-rule-soft divide-y">
                    {statuses.map((status, index) => (
                      <li
                        key={status.code}
                        className="hover:bg-paper/60 group flex items-center gap-4 px-4 py-3.5 transition-colors sm:gap-6"
                      >
                        <span className="text-ink-subtle tnum font-mono text-[9px]">
                          {String(index + 1).padStart(2, '0')}
                        </span>

                        <span className="border-rule bg-paper text-ink flex h-8 w-9 shrink-0 items-center justify-center border font-mono text-[9px] tracking-[0.08em]">
                          {status.code}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="text-ink block text-[13px] font-medium">
                            {status.label}
                          </span>
                          <span className="text-ink-muted block text-[11px]">
                            {status.note}
                          </span>
                        </span>

                        <span
                          className="text-ink-subtle shrink-0 font-mono text-[10px] transition-transform duration-300 group-hover:translate-x-1"
                          aria-hidden="true"
                        >
                          →
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ————————————————— Plate 03 · The suite ————————————————— */}
        <section id="suite" aria-labelledby="suite-title" className="border-rule border-b">
          <div className="mx-auto max-w-[90rem] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
            <PlateMark index="03" label="The suite" />

            <div className="mb-12 grid gap-x-14 gap-y-6 lg:grid-cols-12">
              <Reveal className="lg:col-span-7">
                <h2 id="suite-title" className="display text-[clamp(2rem,3.6vw,3.1rem)]">
                  Ten modules. One operational record.
                </h2>
              </Reveal>
              <Reveal delay={80} className="lg:col-span-5 lg:pt-2">
                <p className="text-ink-secondary max-w-[44ch] text-[13px] leading-[1.75]">
                  Each module owns a domain and shares the same identity,
                  authorisation and audit spine — so a change in one is
                  immediately legible in the others.
                </p>
              </Reveal>
            </div>

            <Reveal>
              <ul className="border-rule divide-rule-soft grid border-t border-b sm:grid-cols-2 lg:grid-cols-5">
                {modules.map((module, index) => (
                  <li
                    key={module.code}
                    className={`group hover:bg-sheet relative p-4 transition-colors ${
                      index % 5 !== 0 ? 'lg:border-rule lg:border-l' : ''
                    } ${index % 2 !== 0 ? 'sm:border-rule sm:border-l lg:border-l-0' : ''} ${
                      index >= 2 ? 'border-rule border-t sm:border-t-0' : ''
                    }`}
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="text-vermilion tnum font-mono text-[9px]">
                        {module.code}
                      </span>
                      <span
                        className="text-ink-subtle font-mono text-[9px] opacity-0 transition-opacity group-hover:opacity-100"
                        aria-hidden="true"
                      >
                        ↗
                      </span>
                    </div>
                    <p className="text-ink mt-2 text-[13px] font-medium">{module.name}</p>
                    <p className="text-ink-muted mt-1 text-[11px] leading-[1.5]">
                      {module.note}
                    </p>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        {/* ————————————————— Plate 04 · Access ————————————————— */}
        <section
          id="access"
          aria-labelledby="access-title"
          className="bg-ink text-chalk relative overflow-hidden"
        >
          <div className="blueprint-ink absolute inset-0 opacity-40" aria-hidden="true" />

          <div className="relative mx-auto max-w-[90rem] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
            <div className="mb-10 flex items-baseline gap-4">
              <span className="text-brass tnum font-mono text-[10px] tracking-[0.2em]">04</span>
              <span className="bg-white/15 h-px flex-1" aria-hidden="true" />
              <span className="font-mono text-[9px] tracking-[0.24em] text-rail-muted uppercase">
                The access model
              </span>
            </div>

            <div className="grid gap-x-14 gap-y-10 lg:grid-cols-12">
              <Reveal className="lg:col-span-5">
                <h2 id="access-title" className="display text-[clamp(2rem,3.6vw,3.1rem)] text-chalk">
                  Four scopes.
                  <br />
                  No <em className="text-brass italic">implicit</em> access.
                </h2>
                <p className="mt-6 max-w-[42ch] text-[13px] leading-[1.75] text-white/60">
                  Authorisation is evaluated server-side on every request from a
                  fixed permission matrix per role — not from what the interface
                  chose to show.
                </p>
              </Reveal>

              <Reveal delay={120} className="lg:col-span-7">
                <ul className="grid gap-px bg-white/12 sm:grid-cols-2">
                  {roles.map((role) => (
                    <li key={role.role} className="bg-ink p-5">
                      <div className="flex items-start justify-between">
                        <DeptGlyph kind={role.glyph} className="h-7 w-7 text-brass/80" />
                        <span className="font-mono text-[8px] tracking-[0.18em] text-white/40 uppercase">
                          {role.scope}
                        </span>
                      </div>
                      <p className="mt-4 font-mono text-[10px] tracking-[0.2em] text-chalk uppercase">
                        {role.role}
                      </p>
                      <ul className="mt-3 space-y-1.5">
                        {role.lines.map((line) => (
                          <li
                            key={line}
                            className="flex items-start gap-2 text-[11px] leading-snug text-white/55"
                          >
                            <span
                              className="bg-brass mt-1.5 h-[3px] w-[3px] shrink-0"
                              aria-hidden="true"
                            />
                            {line}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ————————————————— Plate 05 · Build ————————————————— */}
        <section id="build" aria-labelledby="build-title" className="border-rule border-b">
          <div className="mx-auto max-w-[90rem] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
            <PlateMark index="05" label="Instrumentation" />

            <div className="grid gap-x-14 gap-y-10 lg:grid-cols-12">
              <Reveal className="lg:col-span-5">
                <h2 id="build-title" className="display text-[clamp(2rem,3.6vw,3.1rem)]">
                  Built to be trusted with the record.
                </h2>
                <p className="text-ink-secondary mt-6 max-w-[44ch] text-[13px] leading-[1.75]">
                  Password hashing, attempt limiting, session versioning and
                  server-enforced validation are part of the foundation, not a
                  later hardening pass.
                </p>
              </Reveal>

              <Reveal delay={100} className="lg:col-span-7">
                <dl className="border-rule border-t">
                  {stack.map(([key, value]) => (
                    <div
                      key={key}
                      className="border-rule-soft group flex items-baseline justify-between gap-6 border-b py-3.5"
                    >
                      <dt className="font-mono text-[8px] tracking-[0.22em] text-ink-muted uppercase">
                        {key}
                      </dt>
                      <dd className="text-ink text-right text-[12px] transition-transform duration-300 group-hover:-translate-x-1">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-6 flex flex-wrap gap-2">
                  {[
                    'bcrypt · 12 rounds',
                    'JWT session versioning',
                    'Zod at the boundary',
                    'Attributed audit log',
                  ].map((item) => (
                    <span
                      key={item}
                      className="border-rule text-ink-muted border px-2 py-1 font-mono text-[8px] tracking-[0.14em] uppercase"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ———————————————————— Closing ———————————————————— */}
        <section className="mx-auto max-w-[90rem] px-5 py-14 sm:px-8 lg:px-12">
          <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">Access</p>
              <p className="display mt-3 text-[clamp(1.6rem,3vw,2.4rem)]">
                Bring the theatre into one view.
              </p>
            </div>
            <Link
              href="/login"
              className="bg-pine text-chalk hover:bg-pine-deep group inline-flex h-12 items-center gap-8 px-5 font-mono text-[10px] tracking-[0.2em] uppercase transition-colors"
            >
              Sign in to MedOrch
              <span
                className="transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              >
                →
              </span>
            </Link>
          </div>
        </section>
      </main>

      {/* ————————————————————— Colophon ————————————————————— */}
      <footer className="border-rule bg-paper-deep/60 border-t">
        <div className="mx-auto max-w-[90rem] px-5 py-10 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="display text-[clamp(2.5rem,7vw,5rem)] leading-none">MedOrch</p>
              <p className="text-ink-muted mt-3 max-w-[38ch] font-mono text-[8px] tracking-[0.2em] uppercase">
                Operating theatre orchestration · v0.1.0
              </p>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-2">
              {[
                ['Sign in', '/login'],
                ['Request access', '/register'],
                ['Forgot password', '/forgot-password'],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="link-draw font-mono text-[9px] tracking-[0.2em] text-ink-muted uppercase hover:text-ink"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="border-rule-soft mt-8 flex flex-col gap-2 border-t pt-4 font-mono text-[8px] tracking-[0.16em] text-ink-subtle uppercase sm:flex-row sm:items-center sm:justify-between">
            <span>Drawn as a surgical atlas · not a dashboard</span>
            <span>Authorised clinical use only</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
