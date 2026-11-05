import React from 'react';
import Link from 'next/link';
import { Wordmark } from '@/components/brand/Brand';
import { SiteNav } from '@/components/ui/SiteNav';
import { StatusPill } from '@/components/ui/StatusPill';
import { Surface } from '@/components/ui/Surface';
import {
  AvailabilityIndicator,
  OperationalStatus,
  ProgressBar,
  Timeline,
  TimelineItem,
} from '@/components/ui/Indicators';
import { Display } from '@/components/ui/Type';
import {
  caseSets,
  caseTeam,
  coordinationEvents,
  dayLanes,
  roomRows,
  roomStateTone,
} from './operational-data';
import { Hero } from '../hero';
import { FeatureSection } from '../features';
import { Showcase } from '../showcase';
import { StatsBand } from '../stats';
import { Workflow } from '../workflow';
import { CtaBand } from '../cta';
import { SiteFooter } from '../footer';
import { ProductFrame, ProductPreview } from '../preview';
import { featureItems, platformFacts, scheduleStates, workflowSteps } from '../content';

/*======================================================================
  Direction C — Operational Intelligence
  ----------------------------------------------------------------------
  Register: a live operations desk. Graphite ground, mint signal, state
  legible at a glance. The interface leads — the hero is a dark field with
  the schedule already running beside the statement — then the day sheet,
  the state machine, the lifecycle as a timeline, and the audit trail.
  Composition: overlay hero, full-bleed plate, timeline, assembled rows.
====================================================================== */

const navItems = [
  { label: 'Live view', href: '#live' },
  { label: 'Rooms', href: '#rooms' },
  { label: 'Desk', href: '#coordination' },
  {
    label: 'Surfaces',
    children: [
      { label: 'Schedule', href: '#live', description: 'The running day' },
      { label: 'Room lanes', href: '#rooms', description: 'Occupancy by hour' },
      { label: 'Coordination', href: '#coordination', description: 'People, sets, events' },
      { label: 'States', href: '#states', description: 'The six transitions' },
    ],
  },
];

/*----------------------------------------------------------------------
  Room lanes — the day as occupancy across four theatres
  ----------------------------------------------------------------------
  A dark operations board. Each lane is an eight-hour track with the cases
  positioned by time, so idle rooms and collisions are visible without
  reading a table. Narrow screens get the same records as a time list.
---------------------------------------------------------------------- */
const laneTone = (label: string, roomState: string) => {
  if (label.includes('Held')) return 'bg-[#f2b455]/90 text-[#2a1c02]';
  if (label.includes('Turnover') || label.includes('service'))
    return 'border border-white/15 bg-white/[0.07] text-white/65';
  if (roomState === 'In progress')
    return 'bg-[#7fe3c8]/90 text-[#08231d]';
  return 'border border-white/20 bg-white/[0.04] text-white/70';
};

/* The hero plate: room state, not the full day sheet — the day sheet has its
   own section, and the first screen should answer "what is open?" */
function SuitePanelC() {
  return (
    <ProductFrame
      title="MedOrch · Theatres"
      tone="dark"
      meta={
        <span className="hidden font-mono text-[9px] text-white/50 sm:inline">
          Snapshot 09:42
        </span>
      }
    >
      <div className="flex items-center justify-between px-4 py-2.5 font-mono text-[10px] tracking-[0.12em] text-white/60 uppercase">
        <span>Room state</span>
        <span>4 theatres</span>
      </div>
      <ul className="divide-y divide-white/10">
        {roomRows.map((row) => (
          <li key={row.room} className="px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] tracking-[0.06em] text-white/45">
                {row.room}
              </span>
              <StatusPill tone={roomStateTone[row.state]} size="sm" dot>
                {row.state}
              </StatusPill>
            </div>
            <div className="mt-1 flex items-baseline justify-between gap-3">
              <p className="truncate text-[12px] font-medium text-white/90">
                {row.specialty}
              </p>
              <span className="tnum shrink-0 font-mono text-[10px] text-white/50">
                {row.occupancy}%
              </span>
            </div>
            <ProgressBar
              value={row.occupancy}
              size="sm"
              tone={row.state === 'Available' ? 'positive' : 'accent'}
              label={`${row.room} occupancy`}
              className="mt-2 [&>div:first-child]:hidden"
            />
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between border-t border-white/10 px-4 py-2.5 font-mono text-[9px] tracking-[0.1em] text-white/50 uppercase">
        <span>Sample theatre day · interface preview</span>
        <span>6 cases</span>
      </div>
    </ProductFrame>
  );
}

const laneTime = (hour: number) => {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

function RoomLanesC() {
  return (
    <section
      id="rooms"
      className="relative overflow-hidden bg-[#0a171b] py-[var(--ds-section-y)] text-[#e8f1ef]"
      aria-labelledby="rooms-title"
    >
      <div
        className="ds-grid-paper pointer-events-none absolute inset-0 opacity-20"
        aria-hidden="true"
      />

      <div className="ds-shell relative">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-[46ch]">
            <p className="font-mono text-[10px] tracking-[0.18em] text-[#7fe3c8] uppercase">
              Room lanes · 08:00 – 16:00
            </p>
            <Display as="h2" size="md" id="rooms-title" className="mt-4 text-[#f2f7f6]">
              Occupancy you can see at a glance.
            </Display>
            <p className="mt-4 text-[0.9375rem] leading-[1.65] text-[#a7bdb8]">
              Every theatre shows its day as a set of held windows. A gap is
              idle capacity; an overlap is a conflict the schedule would have
              refused.
            </p>
          </div>

          <dl className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {[
              { value: '2', label: 'In use' },
              { value: '1', label: 'Turnover' },
              { value: '1', label: 'Available' },
            ].map((item) => (
              <div key={item.label}>
                <dt className="font-mono text-[9px] tracking-[0.14em] text-white/45 uppercase">
                  {item.label}
                </dt>
                <dd className="tnum font-display mt-1 text-[1.5rem] leading-none font-semibold text-[#f2f7f6]">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-10 rounded-[var(--radius-xl)] border border-white/10 bg-[#0d1d22] p-4 sm:p-6">
          <div className="mb-5 hidden grid-cols-[4.5rem_minmax(0,1fr)] gap-4 sm:grid">
            <span className="font-mono text-[9px] tracking-[0.12em] text-white/35 uppercase">
              Room
            </span>
            <div className="flex justify-between font-mono text-[9px] tracking-[0.12em] text-white/35 uppercase">
              {['08', '10', '12', '14', '16'].map((hour) => (
                <span key={hour}>{hour}:00</span>
              ))}
            </div>
          </div>

          <ul className="space-y-4">
            {dayLanes.map((lane) => (
              <li
                key={lane.room}
                className="grid gap-2 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:items-center sm:gap-4"
              >
                <div className="flex items-center justify-between gap-2 sm:block">
                  <p className="font-mono text-[11px] tracking-[0.06em] text-white/80">
                    {lane.room}
                  </p>
                  <span className="font-mono text-[9px] tracking-[0.1em] text-white/45 uppercase sm:hidden">
                    {lane.state}
                  </span>
                </div>

                {/* Desktop: positioned blocks on an hour track */}
                <div className="relative hidden h-9 overflow-hidden rounded-[6px] bg-white/[0.04] sm:block">
                  {lane.blocks.map((block) => (
                    <div
                      key={`${lane.room}-${block.start}`}
                      title={`${laneTime(block.start)} · ${block.label}`}
                      className="absolute inset-y-0 flex items-center overflow-hidden px-2"
                      style={{
                        left: `${((block.start - 8) / 8) * 100}%`,
                        width: `${(block.span / 8) * 100}%`,
                      }}
                    >
                      <span
                        className={`flex h-7 w-full items-center truncate rounded-[4px] px-2 text-[10px] font-medium ${laneTone(
                          block.label,
                          lane.state
                        )}`}
                      >
                        <span className="truncate">
                          {block.span >= 1
                            ? `${laneTime(block.start)} · ${block.label}`
                            : block.label}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>

                {/* Mobile: the same windows as a compact list */}
                <ul className="space-y-1.5 sm:hidden">
                  {lane.blocks.map((block) => (
                    <li
                      key={`m-${lane.room}-${block.start}`}
                      className="flex items-center justify-between gap-3 rounded-[4px] border border-white/10 px-2.5 py-1.5"
                    >
                      <span className="text-[11px] text-white/75">
                        {block.label}
                      </span>
                      <span className="tnum font-mono text-[10px] text-white/50">
                        {laneTime(block.start)}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] text-white/55">
            {[
              { label: 'In progress', swatch: 'bg-[#7fe3c8]/90' },
              { label: 'Held / delayed', swatch: 'bg-[#f2b455]/90' },
              { label: 'Turnover', swatch: 'bg-white/20' },
              { label: 'Scheduled', swatch: 'border border-white/30' },
            ].map((item) => (
              <span key={item.label} className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-4 rounded-[2px] ${item.swatch}`}
                  aria-hidden="true"
                />
                {item.label}
              </span>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 font-mono text-[9px] tracking-[0.1em] text-white/40 uppercase">
            <span>Sample theatre day · interface preview</span>
            <span>4 rooms · 6 cases</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/*----------------------------------------------------------------------
  Coordination — the desk view: who is on the case, what is assigned, and
  the event stream that ties the two together.
---------------------------------------------------------------------- */
function CoordinationC() {
  return (
    <section
      id="coordination"
      className="border-rule-soft bg-paper border-t py-[var(--ds-section-y)]"
      aria-labelledby="coordination-title"
    >
      <div className="ds-shell grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="min-w-0 lg:col-span-7">
          <p className="text-secondary font-mono text-[10px] tracking-[0.14em] uppercase">
            Coordination · OT-01
          </p>
          <Display as="h2" size="md" id="coordination-title" className="mt-3">
            People and sets, on the same record.
          </Display>
          <p className="text-ink-muted mt-4 max-w-[52ch] text-[0.9375rem] leading-[1.65]">
            Assignments are written against the case, so the desk can see what
            is covered, what is pending and which instrument set the room is
            actually holding.
          </p>

          <div className="border-border bg-sheet mt-8 overflow-hidden rounded-[var(--radius-panel)] border shadow-sm">
            <div className="border-rule-soft flex items-center justify-between gap-3 border-b px-4 py-2.5">
              <span className="text-ink-muted font-mono text-[9px] tracking-[0.14em] uppercase">
                Case roster
              </span>
              <StatusPill tone="attention" size="sm" dot>
                In progress
              </StatusPill>
            </div>
            <ul className="divide-rule-soft divide-y">
              {caseTeam.map((member, index) => (
                <li
                  key={member.role}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <span className="text-ink-muted tnum w-5 shrink-0 font-mono text-[10px]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate text-[12px] font-medium">
                      {member.role}
                    </p>
                    <p className="text-ink-muted truncate text-[10px]">
                      {member.detail}
                    </p>
                  </div>
                  <StatusPill
                    tone={member.held ? 'positive' : 'attention'}
                    size="sm"
                    dot
                    className="shrink-0"
                  >
                    {member.held ? 'Held' : 'Pending'}
                  </StatusPill>
                </li>
              ))}
            </ul>
            <div className="border-rule-soft border-t px-4 py-3">
              <p className="text-ink-muted mb-2 font-mono text-[9px] tracking-[0.14em] uppercase">
                Sets held by the room
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {caseSets.slice(0, 2).map((set) => (
                  <AvailabilityIndicator
                    key={set.name}
                    state={set.state}
                    label={set.name}
                    detail={set.detail}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="min-w-0 lg:col-span-5">
          <Surface variant="inset" padding="md" className="h-full">
            <div className="flex items-center justify-between gap-3">
              <p className="text-ink-muted font-mono text-[9px] tracking-[0.14em] uppercase">
                Event stream
              </p>
              <StatusPill tone="neutral" size="sm">
                Attributed
              </StatusPill>
            </div>
            <Timeline label="Coordination events" className="mt-5">
              {coordinationEvents.map((event, index) => (
                <TimelineItem
                  key={event.time}
                  time={event.time}
                  title={event.title}
                  description={event.detail}
                  tone={event.tone}
                  last={index === coordinationEvents.length - 1}
                />
              ))}
            </Timeline>
            <dl className="border-rule-soft mt-1 grid grid-cols-3 gap-3 border-t pt-4">
              {[
                { value: '4 / 5', label: 'Roles held' },
                { value: '2', label: 'Sets assigned' },
                { value: '0', label: 'Conflicts' },
              ].map((item) => (
                <div key={item.label}>
                  <dt className="text-ink-muted font-mono text-[9px] tracking-[0.1em] uppercase">
                    {item.label}
                  </dt>
                  <dd className="text-secondary tnum font-display mt-1 text-[1.25rem] leading-none font-semibold">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="text-ink-muted border-rule-soft mt-4 border-t pt-3 text-[10px] leading-snug">
              Sample records · the audit trail is append-only in the product.
            </p>
          </Surface>
        </div>
      </div>
    </section>
  );
}

export function DirectionC() {
  return (
    <div data-palette="intelligence" className="bg-paper text-ink">
      <div className="bg-[#081216]">
        <SiteNav
          variant="transparent"
          brand={
            <Wordmark tone="chalk" subtitle="Operating theatre orchestration" />
          }
          items={navItems}
          secondary={{ label: 'Playground', href: '/design-system' }}
          cta={{ label: 'Sign in', href: '/login' }}
        />

        <Hero
          variant="overlay"
          eyebrow="Operational intelligence"
          title={
            <>
              The theatre is a
              <br />
              <span className="text-[#7fe3c8]">running system.</span>
            </>
          }
          description="Six schedule states, four theatres and one equipment set — read live, with every transition recorded against the person who made it."
          primary={{ label: 'Enter the platform', href: '/login' }}
          secondary={{ label: 'Request access', href: '/register' }}
          support={
            <div className="grid max-w-md grid-cols-2 gap-3">
              <OperationalStatus
                level="nominal"
                label="Suite state"
                detail="4 theatres reporting"
                live
              />
              <OperationalStatus
                level="watch"
                label="Turnover"
                detail="OT-03 delayed"
              />
            </div>
          }
          preview={<SuitePanelC />}
        />
      </div>

      <main>
        <RoomLanesC />

        <div id="live">
          <Showcase
            variant="bleed"
            eyebrow="The day sheet"
            title="One row per case, one state per row."
            description="The schedule is the operational record. Each row carries its room, its priority, its duration and its current state — and the state changes are the events."
            preview={<ProductPreview variant="schedule" />}
            annotations={['Room + window', 'Priority class', 'Six states', 'Attributed transitions']}
          />
        </div>

        <StatsBand variant="plate" facts={platformFacts} />

        <CoordinationC />

        <section
          id="states"
          className="bg-paper py-[var(--ds-section-y)]"
          aria-labelledby="states-title"
        >
          <div className="ds-shell grid gap-10 lg:grid-cols-12">
            <div className="min-w-0 lg:col-span-5">
              <p className="text-secondary font-mono text-[10px] tracking-[0.14em] uppercase">
                State machine
              </p>
              <h2
                id="states-title"
                className="display text-foreground mt-3 text-[clamp(1.75rem,3.6vw,2.5rem)]"
              >
                Six states, permitted transitions.
              </h2>
              <p className="text-ink-muted mt-4 max-w-[46ch] text-[0.9375rem] leading-[1.65]">
                A case does not move to an arbitrary status. Each transition is
                checked against the room, its window and the resources it holds,
                then written to the audit trail.
              </p>
            </div>

            <ul className="grid min-w-0 gap-px overflow-hidden rounded-[var(--radius-panel)] border border-border bg-border sm:grid-cols-2 lg:col-span-7">
              {scheduleStates.map((state) => (
                <li key={state.code} className="bg-sheet p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-secondary font-mono text-[10px] tracking-[0.12em]">
                      {state.code}
                    </span>
                    <StatusPill tone="neutral" size="sm">
                      {state.label}
                    </StatusPill>
                  </div>
                  <p className="text-ink-muted mt-3 text-[0.75rem] leading-snug">
                    {state.note}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div id="lifecycle">
          <Workflow
            variant="timeline"
            eyebrow="Lifecycle"
            title="Attributed at every move."
            description="Booking, resourcing, running, closing — each step leaves a dated record with an actor."
            steps={workflowSteps}
          />
        </div>

        <FeatureSection
          variant="rows"
          eyebrow="Operational domains"
          title="What the desk watches."
          description="The modules below are the operational surface. Each one reports state; none of them is a report."
          items={featureItems}
        />

        <CtaBand
          variant="centered"
          title="Open the live view."
          description="Sign in to see the day as the suite sees it — or request access and wait for an administrator to approve the account."
          primary={{ label: 'Sign in', href: '/login' }}
          secondary={{ label: 'Request access', href: '/register' }}
          meta={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <StatusPill tone="info" size="sm" dot>
                Interface previews use sample records
              </StatusPill>
              <Link
                href="/design-system"
                className="text-secondary text-[12px] font-medium underline decoration-1 underline-offset-4"
              >
                Compare variants in the playground
              </Link>
            </div>
          }
        />
      </main>

      <SiteFooter
        variant="compact"
        brand={<Wordmark tone="chalk" size="sm" />}
        note="MedOrch · operational intelligence for the theatre suite"
        columns={[
          {
            title: 'Product',
            links: [
              { label: 'Live view', href: '#live' },
              { label: 'Rooms', href: '#rooms' },
              { label: 'Desk', href: '#coordination' },
              { label: 'States', href: '#states' },
            ],
          },
          {
            title: 'Access',
            links: [
              { label: 'Sign in', href: '/login' },
              { label: 'Request access', href: '/register' },
            ],
          },
          {
            title: 'Design',
            links: [
              { label: 'Playground', href: '/design-system' },
              { label: 'Direction A', href: '/design-system/direction-a' },
              { label: 'Direction B', href: '/design-system/direction-b' },
            ],
          },
        ]}
      />
    </div>
  );
}
