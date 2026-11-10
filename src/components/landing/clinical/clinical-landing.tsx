import Link from 'next/link';
import {
  ArrowRight,
  CalendarCheck,
  ShieldCheck,
  Stack,
} from '@phosphor-icons/react/dist/ssr';
import { ClinicalHeader } from './clinical-header';
import { TheatrePreview } from './theatre-preview';
import { ModuleIndex } from './module-index';
import { AccessPanel } from './access-panel';
import { MedicalOrbit } from '@/components/visual/MedicalOrbit';
import { stackNotes } from './clinical-data';

const steps = [
  {
    index: '01',
    title: 'Book the case',
    body: 'Procedure, priority, theatre, surgeon and department are recorded together. The schedule opens as Scheduled, with a start and end time that the rest of the day is built on.',
    holds: 'Procedure · priority · room · surgeon · department',
  },
  {
    index: '02',
    title: 'Allocate the resources',
    body: 'Staff roles and equipment are attached to the case. Room and surgeon overlaps are rejected by the server when the booking is written, rather than discovered in the corridor.',
    holds: 'ScheduleStaff · ScheduleEquipment · overlap checks',
  },
  {
    index: '03',
    title: 'Run the theatre day',
    body: 'The desk sees every room and state. Theatre staff see the cases they are assigned to, with clinical notes withheld by the schedule API.',
    holds: 'Room state · set assignment · role-scoped schedule',
  },
  {
    index: '04',
    title: 'Close the record',
    body: 'Status moves through Confirmed, In progress and Completed — or Delayed and Cancelled with a recorded reason. The reason stays with the case, not in a message thread.',
    holds: 'Status history · recorded reason · case record',
  },
];

const buttonPrimary =
  'inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-primary px-5 text-[13.5px] font-semibold text-white shadow-[0_8px_20px_rgba(101,80,181,0.22)] transition-colors hover:bg-primary-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

const buttonSecondary =
  'inline-flex h-11 items-center justify-center gap-2 rounded-[12px] border border-rule-strong bg-sheet px-5 text-[13.5px] font-semibold text-primary transition-colors hover:border-primary/30 hover:bg-pine-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

export function ClinicalLanding({
  production = false,
}: {
  production?: boolean;
}) {
  return (
    <div className="bg-paper text-ink min-h-screen font-sans [&_h1]:font-display [&_h2]:font-display">
      <a
        href="#main"
        className="focus:bg-sheet focus:text-primary sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-xl focus:px-4 focus:py-2 focus:text-[13px] focus:font-semibold focus:shadow-lg"
      >
        Skip to content
      </a>

      <ClinicalHeader homeHref={production ? '/' : '/design-system/clinical'} />

      <main id="main" className="relative overflow-hidden">
        {/* ——— Hero ——— */}
        <section className="px-3 pt-3 sm:px-5 lg:px-6 lg:pt-5">
          <div className="border-rule relative mx-auto max-w-[1280px] overflow-hidden rounded-[28px] border bg-[linear-gradient(125deg,#EDE7F8_0%,#E8E1F7_55%,#DED4F2_100%)] sm:rounded-[32px]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
            >
              <div className="absolute -top-36 -left-24 h-[30rem] w-[30rem] rounded-full border border-[#6550B5]/10" />
              <div className="absolute top-[18%] -left-20 h-[22rem] w-[22rem] rounded-full bg-[#F5F1FC]/55 blur-3xl" />
              <div className="absolute right-[-7rem] bottom-[-9rem] h-[30rem] w-[30rem] rounded-full bg-[#CBBEEA]/45 blur-2xl" />
              <div className="absolute top-10 right-[38%] h-1.5 w-1.5 rounded-full bg-primary/25" />
            </div>

            <div className="relative z-10 grid items-center gap-2 px-5 pt-10 sm:px-8 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-6 lg:px-14 lg:pt-14 xl:px-16">
              <div className="max-w-[610px] lg:pb-16">
                <span className="border-rule bg-sheet/75 text-primary inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10.5px] font-semibold tracking-[0.1em] uppercase backdrop-blur-sm">
                  <CalendarCheck size={14} weight="duotone" aria-hidden="true" />
                  Clinical operations platform
                </span>

                <h1 className="mt-5 text-[clamp(2.4rem,1.25rem+3.1vw,4.15rem)] leading-[0.99] font-semibold tracking-[-0.042em]">
                  The operating theatre,
                  <br />
                  <span className="text-primary">coordinated</span> end to end.
                </h1>

                <p className="text-ink-secondary mt-5 max-w-[50ch] text-[14.5px] leading-[1.75] sm:text-[15.5px]">
                  MedOrch connects theatre schedules, room state, clinical
                  teams, equipment and patient context in one operational
                  record — with role-based access and an attributed audit trail.
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Link href="/register" className={buttonPrimary}>
                    Request access
                    <ArrowRight size={15} weight="bold" aria-hidden="true" />
                  </Link>
                  <Link href="/login" className={buttonSecondary}>
                    Sign in
                  </Link>
                </div>

                <p className="text-ink-muted mt-4 max-w-[46ch] text-[12px] leading-[1.65]">
                  Built for administrators, surgeons, theatre staff and
                  patients. Accounts are verified and approved before a role is
                  granted.
                </p>

                <div className="border-rule text-ink-muted mt-7 max-w-[500px] border-t pt-4 text-[11.5px] leading-relaxed">
                  <span className="text-ink-secondary font-semibold">
                    10 modules
                  </span>{' '}
                  · 6 schedule states · 4 role scopes · 1 audit trail
                </div>
              </div>

              <div className="relative flex min-h-[290px] items-end justify-center lg:min-h-[510px]">
                <div
                  aria-hidden="true"
                  className="absolute top-[20%] h-[62%] w-[70%] rounded-full bg-[#F5F1FC]/60 blur-2xl"
                />
                <MedicalOrbit className="relative z-10 mb-[-2.5rem] h-auto w-[min(100%,33rem)] drop-shadow-[0_26px_46px_rgba(101,80,181,0.13)] sm:mb-[-4rem] lg:mb-[-5rem]" />
              </div>
            </div>
          </div>
        </section>

        {/* ——— Product preview ——— */}
        <section className="mx-auto max-w-[1280px] px-3 pt-4 sm:px-5 lg:px-6">
          <div className="border-rule bg-sheet rounded-[24px] border p-3 shadow-[0_18px_54px_rgba(66,48,112,0.08)] sm:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
              <div>
                <p className="text-primary text-[10px] font-semibold tracking-[0.1em] uppercase">
                  Inside the working day
                </p>
                <h2 className="mt-1 text-[17px] font-semibold tracking-[-0.025em]">
                  A theatre day, without the whiteboard
                </h2>
              </div>
              <span className="bg-surface-subtle text-ink-muted rounded-full px-2.5 py-1 text-[10.5px] font-medium">
                Synthetic preview data
              </span>
            </div>
            <TheatrePreview />
          </div>
        </section>

        {/* ——— How the day moves ——— */}
        <section id="platform" className="px-3 py-10 sm:px-5 lg:px-6 lg:py-16">
          <div className="border-rule bg-sheet mx-auto max-w-[1280px] overflow-hidden rounded-[28px] border shadow-[0_14px_44px_rgba(66,48,112,0.05)]">
            <div className="grid gap-5 px-6 pt-8 pb-7 sm:px-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-end lg:gap-16 lg:px-12 lg:pt-11">
              <div>
                <p className="eyebrow">One continuous record</p>
                <h2 className="mt-3 max-w-[22ch] text-[clamp(1.7rem,1.2rem+1.1vw,2.35rem)] leading-[1.1] font-semibold tracking-[-0.03em]">
                  How the theatre day moves through MedOrch
                </h2>
              </div>
              <p className="text-ink-secondary max-w-[54ch] text-[13.5px] leading-[1.75]">
                One record follows the case from the booking desk to the theatre
                and into the audit trail. Nothing is re-entered between stages,
                and each stage keeps the context the next one needs.
              </p>
            </div>

            <ol className="border-rule border-t px-6 sm:px-9 lg:px-12">
              {steps.map((step) => (
                <li
                  key={step.index}
                  className="border-rule-soft grid gap-x-6 gap-y-2 border-b py-5 last:border-b-0 lg:grid-cols-[52px_minmax(0,0.75fr)_minmax(0,1fr)] lg:items-start lg:py-6"
                >
                  <span className="bg-primary-soft text-primary flex h-9 w-9 items-center justify-center rounded-[11px] font-mono text-[10.5px] font-semibold">
                    {step.index}
                  </span>
                  <h3 className="text-ink text-[14.5px] font-semibold">
                    {step.title}
                  </h3>
                  <div>
                    <p className="text-ink-secondary max-w-[64ch] text-[13px] leading-[1.7]">
                      {step.body}
                    </p>
                    <p className="text-ink-muted mt-2 text-[11px] leading-[1.5]">
                      Holds: {step.holds}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ——— Modules ——— */}
        <section id="modules" className="px-3 pb-10 sm:px-5 lg:px-6 lg:pb-16">
          <div className="border-rule mx-auto max-w-[1280px] overflow-hidden rounded-[28px] border bg-[linear-gradient(180deg,#F3EEFB_0%,#EDE6F8_100%)]">
            <div className="grid gap-4 px-6 pt-8 pb-7 sm:px-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-end lg:gap-16 lg:px-12 lg:pt-10">
              <div>
                <p className="eyebrow">Module index</p>
                <h2 className="mt-3 max-w-[20ch] text-[clamp(1.7rem,1.2rem+1.1vw,2.35rem)] leading-[1.1] font-semibold tracking-[-0.03em]">
                  Ten modules, each with its own job
                </h2>
              </div>
              <p className="text-ink-secondary max-w-[54ch] text-[13.5px] leading-[1.75]">
                The same records are read through different operational views.
                Open a module to see what it owns, who works in it and what the
                permission model allows.
              </p>
            </div>

            <div className="border-rule bg-sheet border-t">
              <div className="text-ink-muted hidden grid-cols-[200px_minmax(0,1fr)_190px_24px] gap-x-6 border-b border-rule px-8 pt-4 pb-2 text-[10px] font-semibold tracking-[0.08em] uppercase lg:grid">
                <span>Module</span>
                <span>Responsibility</span>
                <span>Primary users</span>
                <span />
              </div>
              <ModuleIndex />
            </div>
          </div>
        </section>

        {/* ——— Access and audit ——— */}
        <section id="access" className="px-3 pb-10 sm:px-5 lg:px-6 lg:pb-16">
          <div className="border-rule bg-sheet mx-auto max-w-[1280px] overflow-hidden rounded-[28px] border p-6 shadow-[0_14px_44px_rgba(66,48,112,0.05)] sm:p-9 lg:p-12">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end lg:gap-16">
              <div>
                <span className="bg-primary-soft text-primary mb-4 flex h-10 w-10 items-center justify-center rounded-[13px]">
                  <ShieldCheck size={21} weight="duotone" aria-hidden="true" />
                </span>
                <h2 className="max-w-[26ch] text-[clamp(1.7rem,1.2rem+1.1vw,2.3rem)] leading-[1.1] font-semibold tracking-[-0.03em]">
                  Access is part of the workflow, not a settings page
                </h2>
              </div>
              <p className="text-ink-secondary max-w-[62ch] text-[13.5px] leading-[1.75]">
                Four roles, four permission sets, enforced on the server for
                every request. Actions written to the audit trail carry the
                person, role and record they touched.
              </p>
            </div>

            <div className="border-rule-soft mt-8 border-t pt-7">
              <AccessPanel />
            </div>
          </div>
        </section>

        {/* ——— Engineering ——— */}
        <section
          id="engineering"
          className="px-3 pb-10 sm:px-5 lg:px-6 lg:pb-16"
        >
          <div className="border-rule mx-auto max-w-[1280px] overflow-hidden rounded-[28px] border bg-[linear-gradient(120deg,#E9E2F7_0%,#F3EEFB_60%,#EDE6F8_100%)]">
            <div className="grid gap-8 p-6 sm:p-9 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16 lg:p-12">
              <div>
                <span className="bg-sheet/80 text-primary mb-4 flex h-10 w-10 items-center justify-center rounded-[13px]">
                  <Stack size={21} weight="duotone" aria-hidden="true" />
                </span>
                <h2 className="max-w-[20ch] text-[clamp(1.6rem,1.2rem+0.9vw,2.1rem)] leading-[1.15] font-semibold tracking-[-0.03em]">
                  Built on a stack your team can inspect
                </h2>
                <p className="text-ink-secondary mt-3 max-w-[46ch] text-[13px] leading-[1.75]">
                  The platform is built from parts a hospital IT team can
                  review: server-rendered records, relational data,
                  session-based identity and schema validation at every write.
                </p>
              </div>

              <dl className="border-rule bg-sheet/72 divide-rule overflow-hidden rounded-[18px] border shadow-[0_8px_24px_rgba(66,48,112,0.04)] backdrop-blur-sm">
                {stackNotes.map(([area, value, note]) => (
                  <div
                    key={area}
                    className="border-rule-soft grid gap-1 border-b px-4 py-3.5 last:border-b-0 sm:grid-cols-[100px_180px_minmax(0,1fr)] sm:gap-4"
                  >
                    <dt className="text-ink-muted text-[10.5px] font-semibold tracking-[0.04em] uppercase">
                      {area}
                    </dt>
                    <dd className="text-ink text-[12.5px] font-semibold">
                      {value}
                    </dd>
                    <dd className="text-ink-secondary text-[11.5px] leading-[1.6]">
                      {note}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* ——— Closing ——— */}
        <section className="px-3 sm:px-5 lg:px-6">
          <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[28px] bg-[linear-gradient(125deg,#6550B5_0%,#58449F_58%,#473586_100%)] px-6 py-10 text-white sm:px-9 lg:px-12 lg:py-12">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
            >
              <div className="absolute -top-28 right-[-4rem] h-80 w-80 rounded-full border border-white/12" />
              <div className="absolute -top-16 right-4 h-56 w-56 rounded-full bg-white/6 blur-2xl" />
              <div className="absolute bottom-[-7rem] left-[32%] h-56 w-56 rounded-full border border-white/8" />
            </div>

            <div className="relative z-10 flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.12em] text-white/60 uppercase">
                  Request-based access
                </p>
                <h2 className="mt-3 max-w-[24ch] text-[clamp(1.6rem,1.2rem+1vw,2.3rem)] leading-[1.15] font-semibold tracking-[-0.03em]">
                  Review MedOrch against your theatre day
                </h2>
                <p className="mt-2 max-w-[58ch] text-[13px] leading-[1.7] text-white/70">
                  New accounts are verified, then approved with a role before
                  they can reach a record.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-3">
                <Link
                  href="/register"
                  className="text-primary inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-white px-5 text-[13.5px] font-semibold shadow-sm transition-colors hover:bg-[#F5F1FC] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Request access
                  <ArrowRight size={15} weight="bold" aria-hidden="true" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center justify-center rounded-[12px] border border-white/25 px-5 text-[13.5px] font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-10 border-t border-rule bg-sheet">
        <div className="mx-auto grid max-w-[1280px] gap-8 px-6 py-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_220px_220px] lg:px-8">
          <div>
            <p className="text-ink text-[15px] font-semibold">MedOrch</p>
            <p className="text-ink-muted mt-1 max-w-[36ch] text-[12px] leading-[1.65]">
              Operating theatre orchestration for hospital operations, clinical
              teams and patients.
            </p>
            {production ? null : (
              <p className="text-ink-subtle mt-4 text-[11px]">
                Direction preview · not the production landing page.
              </p>
            )}
          </div>

          <nav aria-label="Platform" className="text-[12px]">
            <p className="text-ink-muted font-semibold">Platform</p>
            <ul className="mt-2.5 space-y-2">
              {[
                ['#platform', 'How it works'],
                ['#modules', 'Modules'],
                ['#access', 'Access and audit'],
                ['#engineering', 'Engineering'],
              ].map(([href, label]) => (
                <li key={href}>
                  <a
                    href={href}
                    className="text-ink-secondary hover:text-primary transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Account" className="text-[12px]">
            <p className="text-ink-muted font-semibold">Account</p>
            <ul className="mt-2.5 space-y-2">
              <li>
                <Link
                  href="/login"
                  className="text-ink-secondary hover:text-primary transition-colors"
                >
                  Sign in
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-ink-secondary hover:text-primary transition-colors"
                >
                  Request access
                </Link>
              </li>
              {production ? null : (
                <li>
                  <Link
                    href="/design-system"
                    className="text-ink-secondary hover:text-primary transition-colors"
                  >
                    Design system
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
        <div className="border-rule border-t">
          <div className="text-ink-subtle mx-auto flex max-w-[1280px] flex-col gap-1 px-6 py-4 text-[10.5px] sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <p>© 2026 MedOrch. Preview data throughout.</p>
            <p>Clinical operations · schedules · rooms · teams · equipment</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
