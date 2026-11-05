import Link from 'next/link';
import { ClinicalHeader } from './clinical-header';
import { TheatrePreview } from './theatre-preview';
import { ModuleIndex } from './module-index';
import { AccessPanel } from './access-panel';
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

export function ClinicalLanding({
  production = false,
}: {
  production?: boolean;
}) {
  return (
    <div className="min-h-screen bg-[#F5F8FB] font-sans text-[#243447]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-[13px] focus:font-medium focus:text-[#245B8F] focus:shadow-md"
      >
        Skip to content
      </a>

      <ClinicalHeader homeHref={production ? '/' : '/design-system/clinical'} />

      <main id="main">
        {/* Hero */}
        <section className="mx-auto max-w-[1200px] px-5 pb-14 pt-10 lg:px-8 lg:pb-20 lg:pt-16">
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-14">
            <div className="max-w-[500px] lg:pt-2">
              <p className="text-[12.5px] font-medium text-[#168C91]">
                Clinical operations platform
              </p>
              <h1 className="mt-3 text-[clamp(2.05rem,1.35rem+1.75vw,2.6rem)] font-semibold leading-[1.14] tracking-[-0.025em] text-[#243447]">
                The operating theatre, coordinated end to end.
              </h1>
              <p className="mt-4 text-[16px] leading-[1.65] text-[#526478]">
                MedOrch connects theatre schedules, room state, clinical teams,
                equipment and patient context in one operational record — with
                role-based access and an attributed audit trail.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/register"
                  className="inline-flex h-10 items-center rounded-md bg-[#245B8F] px-5 text-[14px] font-medium text-white transition-colors hover:bg-[#1D4A76] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245B8F]"
                >
                  Request access
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-10 items-center rounded-md border border-[#CBD8E5] bg-white px-5 text-[14px] font-medium text-[#245B8F] transition-colors hover:border-[#9FB6CB] hover:bg-[#F7FAFC] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245B8F]"
                >
                  Sign in
                </Link>
              </div>

              <p className="mt-4 max-w-[44ch] text-[12.5px] leading-[1.6] text-[#718096]">
                Built for administrators, surgeons, theatre staff and patients.
                Accounts are verified and approved before a role is granted.
              </p>

              <p className="mt-6 max-w-[440px] border-t border-[#D9E3EC] pt-3.5 text-[12px] leading-[1.7] text-[#718096]">
                <span className="font-medium text-[#526478]">10 modules</span> · 6 schedule
                states · 4 role scopes · 1 audit trail
              </p>
            </div>

            <TheatrePreview />
          </div>
        </section>

        {/* How the day moves */}
        <section id="platform" className="border-y border-[#E3EAF0] bg-white py-14 lg:py-20">
          <div className="mx-auto max-w-[1200px] px-5 lg:px-8">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-end lg:gap-16">
              <h2 className="max-w-[22ch] text-[27px] font-semibold leading-[1.22] tracking-[-0.015em] text-[#243447] lg:text-[31px]">
                How the theatre day moves through MedOrch
              </h2>
              <p className="max-w-[52ch] text-[14px] leading-[1.7] text-[#526478]">
                One record follows the case from the booking desk to the theatre and
                into the audit trail. Nothing is re-entered between stages, and each
                stage keeps the context the next one needs.
              </p>
            </div>

            <ol className="mt-10 border-t border-[#D9E3EC]">
              {steps.map((step) => (
                <li
                  key={step.index}
                  className="grid gap-x-10 gap-y-2 border-b border-[#E3EAF0] py-5 lg:grid-cols-[56px_minmax(0,0.95fr)_minmax(0,1fr)] lg:items-baseline lg:py-6"
                >
                  <span className="font-mono text-[11px] text-[#168C91]">{step.index}</span>
                  <h3 className="text-[15px] font-semibold text-[#243447]">{step.title}</h3>
                  <div className="lg:col-start-3">
                    <p className="max-w-[62ch] text-[13.5px] leading-[1.65] text-[#526478]">
                      {step.body}
                    </p>
                    <p className="mt-2 text-[11.5px] leading-[1.5] text-[#718096]">
                      Holds: {step.holds}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Modules */}
        <section id="modules" className="py-14 lg:py-20">
          <div className="mx-auto max-w-[1200px] px-5 lg:px-8">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-end lg:gap-16">
              <h2 className="max-w-[20ch] text-[27px] font-semibold leading-[1.22] tracking-[-0.015em] text-[#243447] lg:text-[31px]">
                Ten modules, each with its own job
              </h2>
              <p className="max-w-[54ch] text-[14px] leading-[1.7] text-[#526478]">
                The same records are read through different operational views.
                Open a module to see what it owns, who works in it and what the
                permission model allows.
              </p>
            </div>

            <div className="mt-9">
              <div className="hidden grid-cols-[200px_minmax(0,1fr)_190px_24px] gap-x-6 border-b border-[#D9E3EC] pb-2 text-[11px] font-medium text-[#718096] lg:grid">
                <span>Module</span>
                <span>Responsibility</span>
                <span>Primary users</span>
                <span />
              </div>
              <ModuleIndex />
            </div>
          </div>
        </section>

        {/* Access and audit */}
        <section id="access" className="border-y border-[#E3EAF0] bg-white py-14 lg:py-20">
          <div className="mx-auto max-w-[1200px] px-5 lg:px-8">
            <h2 className="max-w-[26ch] text-[27px] font-semibold leading-[1.22] tracking-[-0.015em] text-[#243447] lg:text-[31px]">
              Access is part of the workflow, not a settings page
            </h2>
            <p className="mt-3 max-w-[68ch] text-[14px] leading-[1.7] text-[#526478]">
              Four roles, four permission sets, enforced on the server for every
              request. Actions written to the audit trail carry the person, role and
              record they touched.
            </p>

            <div className="mt-8">
              <AccessPanel />
            </div>
          </div>
        </section>

        {/* Engineering */}
        <section id="engineering" className="bg-[#EDF3F8] py-14 lg:py-18">
          <div className="mx-auto max-w-[1200px] px-5 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
              <div>
                <h2 className="max-w-[20ch] text-[26px] font-semibold leading-[1.25] tracking-[-0.015em] text-[#243447] lg:text-[29px]">
                  Built on a stack your team can inspect
                </h2>
                <p className="mt-3 max-w-[46ch] text-[13.5px] leading-[1.7] text-[#526478]">
                  The platform is built from parts a hospital IT team can review:
                  server-rendered records, relational data, session-based identity
                  and schema validation at every write.
                </p>
              </div>

              <dl className="divide-y divide-[#D5E1EC] border-t border-[#CBD9E5]">
                {stackNotes.map(([area, value, note]) => (
                  <div
                    key={area}
                    className="grid gap-1 py-3.5 sm:grid-cols-[110px_190px_minmax(0,1fr)] sm:gap-5"
                  >
                    <dt className="text-[11.5px] font-medium text-[#718096]">{area}</dt>
                    <dd className="text-[12.5px] font-medium text-[#243447]">{value}</dd>
                    <dd className="text-[12px] leading-[1.55] text-[#526478]">{note}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* Closing */}
        <section className="bg-white py-12 lg:py-14">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <div>
              <h2 className="text-[22px] font-semibold leading-[1.3] tracking-[-0.01em] text-[#243447]">
                Review MedOrch against your theatre day
              </h2>
              <p className="mt-1.5 max-w-[58ch] text-[13.5px] leading-[1.6] text-[#526478]">
                Access is by request. New accounts are verified, then approved with a
                role before they can reach a record.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex h-10 items-center rounded-md bg-[#245B8F] px-5 text-[14px] font-medium text-white transition-colors hover:bg-[#1D4A76] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245B8F]"
              >
                Request access
              </Link>
              <Link
                href="/login"
                className="inline-flex h-10 items-center rounded-md border border-[#CBD8E5] px-5 text-[14px] font-medium text-[#245B8F] transition-colors hover:border-[#9FB6CB] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245B8F]"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#E3EAF0] bg-white">
        <div className="mx-auto grid max-w-[1200px] gap-8 px-5 py-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_220px_220px] lg:px-8">
          <div>
            <p className="text-[15px] font-semibold text-[#243447]">MedOrch</p>
            <p className="mt-1 max-w-[36ch] text-[12.5px] leading-[1.6] text-[#718096]">
              Operating theatre orchestration for hospital operations, clinical
              teams and patients.
            </p>
            {production ? null : (
              <p className="mt-4 text-[11.5px] text-[#9AAABB]">
                Direction preview · not the production landing page.
              </p>
            )}
          </div>

          <nav aria-label="Platform" className="text-[12.5px]">
            <p className="font-medium text-[#718096]">Platform</p>
            <ul className="mt-2 space-y-2">
              <li><a href="#platform" className="text-[#47586B] hover:text-[#245B8F]">How it works</a></li>
              <li><a href="#modules" className="text-[#47586B] hover:text-[#245B8F]">Modules</a></li>
              <li><a href="#access" className="text-[#47586B] hover:text-[#245B8F]">Access and audit</a></li>
              <li><a href="#engineering" className="text-[#47586B] hover:text-[#245B8F]">Engineering</a></li>
            </ul>
          </nav>

          <nav aria-label="Account" className="text-[12.5px]">
            <p className="font-medium text-[#718096]">Account</p>
            <ul className="mt-2 space-y-2">
              <li><Link href="/login" className="text-[#47586B] hover:text-[#245B8F]">Sign in</Link></li>
              <li><Link href="/register" className="text-[#47586B] hover:text-[#245B8F]">Request access</Link></li>
              {production ? null : (
                <li><Link href="/design-system" className="text-[#47586B] hover:text-[#245B8F]">Design system</Link></li>
              )}
            </ul>
          </nav>
        </div>
        <div className="border-t border-[#EDF3F8]">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-1 px-5 py-4 text-[11px] text-[#9AAABB] sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <p>© 2026 MedOrch. Preview data throughout.</p>
            <p>Clinical operations · schedules · rooms · teams · equipment</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
