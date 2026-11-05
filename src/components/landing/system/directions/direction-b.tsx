import React from 'react';
import Link from 'next/link';
import { Wordmark } from '@/components/brand/Brand';
import { SiteNav } from '@/components/ui/SiteNav';
import { StatusPill } from '@/components/ui/StatusPill';
import { Surface } from '@/components/ui/Surface';
import { AvailabilityIndicator, ProgressBar } from '@/components/ui/Indicators';
import { Body, Display, Eyebrow } from '@/components/ui/Type';
import { caseSets, caseTeam, roomRows, roomStateTone } from './operational-data';
import { Hero } from '../hero';
import { FeatureSection } from '../features';
import { Showcase } from '../showcase';
import { StatsBand } from '../stats';
import { Workflow } from '../workflow';
import { CtaBand } from '../cta';
import { SiteFooter } from '../footer';
import { ProductPreview } from '../preview';
import { featureItems, platformFacts, workflowSteps } from '../content';

/*======================================================================
  Direction B — Premium Enterprise
  ----------------------------------------------------------------------
  Register: printed stationery for a serious institution. Warm porcelain,
  near-black ink, bronze accent. A centred declaration instead of a split
  hero; capability plates that read like specification pages; a CTA set in
  a dark plate. Composition: centred hero, single-column alternating
  features, offset interface, dark close.
====================================================================== */

const navItems = [
  { label: 'Rooms', href: '#rooms' },
  { label: 'Coordination', href: '#coordination' },
  { label: 'Capabilities', href: '#capabilities' },
  {
    label: 'The platform',
    children: [
      { label: 'The record', href: '#record', description: 'One case, one state' },
      { label: 'Lifecycle', href: '#lifecycle', description: 'Booking to closed record' },
      { label: 'Access', href: '/login', description: 'Approved accounts only' },
    ],
  },
];

/*----------------------------------------------------------------------
  Room register — an editorial specification page
  ----------------------------------------------------------------------
  Numbered rows, hairline rules, occupancy set as a display figure. The
  section reads like a register rather than a dashboard panel.
---------------------------------------------------------------------- */
function RoomRegisterB() {
  return (
    <section
      id="rooms"
      className="border-rule-soft bg-paper border-t py-[var(--ds-section-y)]"
      aria-labelledby="rooms-title"
    >
      <div className="ds-shell">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Eyebrow>The room register</Eyebrow>
            <Display as="h2" size="md" id="rooms-title" className="mt-4">
              Every theatre, on the record.
            </Display>
            <Body size="md" tone="secondary" className="mt-5">
              A room is a record with an owner, an occupancy and a turnover
              figure. The schedule reads from it; it is never a parallel chart
              maintained by hand.
            </Body>
            <p className="text-ink-muted mt-8 font-mono text-[10px] tracking-[0.14em] uppercase">
              Snapshot 09:42 · sample interface data
            </p>
          </div>

          <div className="min-w-0 lg:col-span-8">
            <ol className="border-ink/15 border-t">
              {roomRows.map((row, index) => (
                <li
                  key={row.room}
                  className="border-ink/15 group grid gap-4 border-b py-7 sm:grid-cols-[4.75rem_minmax(0,1fr)_9rem] sm:items-start sm:gap-6 lg:grid-cols-[4.75rem_minmax(0,1fr)_10rem_7.5rem]"
                >
                  <span className="text-ink-muted tnum flex items-baseline gap-2 font-mono text-[11px] tracking-[0.08em] whitespace-nowrap sm:block">
                    <span className="text-[9px] opacity-70">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="block">{row.room}</span>
                  </span>

                  <div className="min-w-0">
                    <p className="display text-foreground text-[1.375rem] leading-tight">
                      {row.specialty}
                    </p>
                    <p className="text-ink-secondary mt-2 text-[13px] leading-snug">
                      {row.case}
                    </p>
                    <p className="text-ink-muted mt-1 text-[12px]">
                      Next · {row.next} · {row.turnover} turnover
                    </p>
                  </div>

                  <div className="flex items-center gap-4 sm:block sm:pt-1">
                    <p className="text-secondary tnum font-display text-[1.75rem] leading-none font-semibold tracking-[-0.03em]">
                      {row.occupancy}
                      <span className="text-ink-muted ml-0.5 text-[0.8125rem] font-medium tracking-normal">
                        %
                      </span>
                    </p>
                    <ProgressBar
                      value={row.occupancy}
                      size="sm"
                      tone={row.state === 'Available' ? 'positive' : 'accent'}
                      label={`${row.room} occupancy`}
                      className="mt-2 min-w-0 flex-1 [&>div:first-child]:hidden sm:w-full"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end sm:pt-1.5">
                    <span className="text-ink-muted font-mono text-[9px] tracking-[0.12em] uppercase sm:hidden">
                      State
                    </span>
                    <StatusPill tone={roomStateTone[row.state]} size="sm" dot>
                      {row.state}
                    </StatusPill>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

/*----------------------------------------------------------------------
  Coordination — two plates, offset, one for the people, one for the set
---------------------------------------------------------------------- */
function CoordinationB() {
  return (
    <section
      id="coordination"
      className="bg-paper pb-[var(--ds-section-y)]"
      aria-labelledby="coordination-title"
    >
      <div className="ds-shell grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="min-w-0 lg:col-span-6">
          <Surface variant="feature" tone="inverse" padding="lg">
            <Eyebrow>Clinical team</Eyebrow>
            <h2
              id="coordination-title"
              className="display mt-4 text-[clamp(1.5rem,2.6vw,2rem)] leading-tight"
            >
              The case is staffed before the window opens.
            </h2>

            <ol className="mt-8 border-t border-white/15">
              {caseTeam.map((member, index) => (
                <li
                  key={member.role}
                  className="grid grid-cols-[1.75rem_minmax(0,1fr)_auto] items-baseline gap-3 border-b border-white/15 py-3.5"
                >
                  <span className="text-ink-muted tnum font-mono text-[10px]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium">{member.role}</p>
                    <p className="text-ink-muted mt-0.5 text-[11px]">
                      {member.detail}
                    </p>
                  </div>
                  <StatusPill
                    tone={member.held ? 'positive' : 'attention'}
                    size="sm"
                    dot
                  >
                    {member.held ? 'Held' : 'Pending'}
                  </StatusPill>
                </li>
              ))}
            </ol>
          </Surface>
        </div>

        <div className="min-w-0 lg:col-span-5 lg:col-start-8 lg:mt-16">
          <Surface variant="inset" padding="lg">
            <div className="flex items-center justify-between gap-3">
              <Eyebrow>Instrument set</Eyebrow>
              <span className="text-ink-muted font-mono text-[9px] tracking-[0.12em] uppercase">
                Preview
              </span>
            </div>
            <p className="display text-foreground mt-4 text-[1.375rem] leading-snug">
              Assigned, sterile and traceable to the case.
            </p>

            <ul className="border-rule-soft mt-6 border-t">
              {caseSets.map((set) => (
                <li key={set.name} className="border-rule-soft border-b py-4">
                  <AvailabilityIndicator
                    state={set.state}
                    label={set.name}
                    detail={set.detail}
                  />
                </li>
              ))}
            </ul>

            <p className="text-ink-muted mt-5 text-[11px] leading-relaxed">
              Maintenance state comes from the Equipment module, so an
              unavailable set is visible at booking rather than at handover.
            </p>
          </Surface>
        </div>
      </div>
    </section>
  );
}

export function DirectionB() {
  return (
    <div data-palette="enterprise" className="bg-paper text-ink">
      <SiteNav
        variant="floating"
        brand={<Wordmark subtitle="Clinical operations" size="sm" />}
        items={navItems}
        secondary={{ label: 'Playground', href: '/design-system' }}
        cta={{ label: 'Request access', href: '/register' }}
      />

      <main>
        <Hero
          variant="statement"
          eyebrow="MedOrch · Clinical operations"
          title={
            <>
              One operational record
              <br />
              for the <span className="text-secondary">theatre suite.</span>
            </>
          }
          description="Schedules, rooms, clinical teams, instrument sets and audit — held in one controlled system, with access scoped to the role that needs it."
          primary={{ label: 'Enter the platform', href: '/login' }}
          secondary={{ label: 'Request an account', href: '/register' }}
          support={
            <p className="text-ink-muted font-mono text-[10px] tracking-[0.14em] uppercase">
              Next.js 16 · Prisma 7 · PostgreSQL · attributed audit
            </p>
          }
          preview={<ProductPreview variant="schedule" />}
        />

        <RoomRegisterB />

        <CoordinationB />

        <div id="capabilities">
          <FeatureSection
            variant="alternating"
            eyebrow="Capabilities"
            title="Specified, not decorated."
            description="Each capability below is a domain the platform owns, with the record and the permission scope to match."
            items={featureItems}
          />
        </div>

        <div id="record">
          <Showcase
            variant="offset"
            eyebrow="The record"
            title="The interface is the record."
            description="A schedule row is not a summary of a case; it is the case's current state, with the room, the team and the equipment attached — and every change kept in an attributable trail."
            preview={<ProductPreview variant="audit" />}
          />
        </div>

        <div id="lifecycle">
          <Workflow
            variant="rail"
            eyebrow="Lifecycle"
            title="Four moves, every case."
            description="Booking, resourcing, running and closing — the same sequence whether the case is elective or an emergency."
            steps={workflowSteps}
          />
        </div>

        <StatsBand variant="rail" facts={platformFacts} />

        <CtaBand
          variant="panel"
          title="Adopt the record."
          description="Accounts are approved before access is granted. Request an account and an administrator will verify it."
          primary={{ label: 'Sign in', href: '/login' }}
          secondary={{ label: 'Request access', href: '/register' }}
          meta={
            <div className="flex flex-wrap items-center gap-3">
              <StatusPill tone="neutral" size="sm">
                v0.1.0
              </StatusPill>
              <Link
                href="/design-system"
                className="text-[12px] font-medium text-white/70 underline decoration-1 underline-offset-4"
              >
                Open the design-system playground
              </Link>
            </div>
          }
        />
      </main>

      <SiteFooter
        variant="editorial"
        brand={<Wordmark subtitle="Clinical operations" size="lg" />}
        note={
          <>
            MedOrch is the orchestration layer for the operating theatre.
            <br />
            One schedule, one record, one audit spine.
          </>
        }
        columns={[
          {
            title: 'Platform',
            links: [
              { label: 'Rooms', href: '#rooms' },
              { label: 'Coordination', href: '#coordination' },
              { label: 'Capabilities', href: '#capabilities' },
              { label: 'The record', href: '#record' },
            ],
          },
          {
            title: 'Access',
            links: [
              { label: 'Sign in', href: '/login' },
              { label: 'Request access', href: '/register' },
              { label: 'Forgot password', href: '/forgot-password' },
            ],
          },
          {
            title: 'Design',
            links: [
              { label: 'Playground', href: '/design-system' },
              { label: 'Direction A', href: '/design-system/direction-a' },
              { label: 'Direction C', href: '/design-system/direction-c' },
            ],
          },
        ]}
      />
    </div>
  );
}
