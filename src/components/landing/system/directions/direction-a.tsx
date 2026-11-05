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
import {
  featureItems,
  platformFacts,
  workflowSteps,
} from '../content';

/*======================================================================
  Direction A — Clinical Technology
  ----------------------------------------------------------------------
  Register: precision instrument. Cool clinical ground, teal working
  colour, a split hero that pairs a statement with the schedule, then a
  measured sequence: facts → interface → capabilities → method → close.
  Composition: asymmetric 6/6 hero, 3-column feature grid, centred plate.
====================================================================== */

const navItems = [
  { label: 'Theatres', href: '#theatres' },
  { label: 'Coordination', href: '#coordination' },
  { label: 'Interface', href: '#interface' },
  {
    label: 'Modules',
    children: [
      { label: 'Schedules', href: '#interface', description: 'States and conflict checks' },
      { label: 'Theatres', href: '#theatres', description: 'Room state and turnover' },
      { label: 'Equipment', href: '#coordination', description: 'Availability and maintenance' },
      { label: 'Audit trail', href: '#platform', description: 'Attributed event log' },
    ],
  },
];

/*----------------------------------------------------------------------
  Theatre board — the room record as a ruled table
  ----------------------------------------------------------------------
  Column alignment is the design: room, domain, the case in it, how full
  the room is, and its state. On narrow screens the same values re-flow
  into a stacked row rather than scrolling sideways.
---------------------------------------------------------------------- */
function TheatreBoardA() {
  return (
    <section
      id="theatres"
      className="border-rule-soft bg-paper border-t py-[var(--ds-section-y)]"
      aria-labelledby="theatres-title"
    >
      <div className="ds-shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-[52ch]">
            <Eyebrow tone="accent">Theatre availability</Eyebrow>
            <Display as="h2" size="md" id="theatres-title" className="mt-3">
              Four rooms, stated plainly.
            </Display>
            <Body size="md" tone="secondary" className="mt-4">
              Occupancy, turnover and the current case are read from the same
              room record the schedule writes to — no separate theatre chart to
              keep in step.
            </Body>
          </div>
          <div className="flex items-center gap-3">
            <StatusPill tone="neutral" size="sm" dot>
              Snapshot 09:42
            </StatusPill>
            <span className="text-ink-muted font-mono text-[10px] tracking-[0.12em] uppercase">
              Interface preview
            </span>
          </div>
        </div>

        <div className="border-border bg-sheet mt-10 overflow-hidden rounded-[var(--radius-panel)] border shadow-sm">
          <div className="border-rule-soft text-ink-muted hidden border-b px-5 py-2.5 font-mono text-[9px] tracking-[0.14em] uppercase lg:grid lg:grid-cols-[5rem_minmax(0,1fr)_minmax(0,1.6fr)_10rem_8.5rem] lg:gap-5">
            <span>Room</span>
            <span>Domain</span>
            <span>Case</span>
            <span>Occupancy</span>
            <span className="text-right">State</span>
          </div>

          <ul className="divide-rule-soft divide-y">
            {roomRows.map((row) => (
              <li
                key={row.room}
                className="grid gap-3 px-5 py-5 transition-colors hover:bg-surface-subtle/50 lg:grid-cols-[5rem_minmax(0,1fr)_minmax(0,1.6fr)_10rem_8.5rem] lg:items-center lg:gap-5"
              >
                <span className="text-foreground tnum font-mono text-[12px] font-medium tracking-[0.06em]">
                  {row.room}
                </span>

                <span className="text-ink-secondary text-[12px]">
                  {row.specialty}
                </span>

                <span className="min-w-0">
                  <span className="text-foreground block truncate text-[13px] font-medium">
                    {row.case}
                  </span>
                  <span className="text-ink-muted mt-0.5 block truncate text-[11px]">
                    Next · {row.next}
                  </span>
                </span>

                <div className="min-w-0 flex-1 lg:flex-none">
                  <div className="mb-1.5 flex items-baseline justify-between gap-2">
                    <span className="text-ink-secondary tnum text-[11px] font-medium">
                      {row.occupancy}% held
                    </span>
                    <span className="text-ink-muted font-mono text-[9px] tracking-[0.06em] whitespace-nowrap uppercase">
                      {row.turnover}
                    </span>
                  </div>
                  <ProgressBar
                    value={row.occupancy}
                    size="sm"
                    tone={row.state === 'Available' ? 'positive' : 'accent'}
                    label={`${row.room} occupancy`}
                    className="[&>div:first-child]:hidden"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 lg:justify-end">
                  <span className="text-ink-muted font-mono text-[9px] tracking-[0.12em] uppercase lg:hidden">
                    State
                  </span>
                  <StatusPill tone={roomStateTone[row.state]} size="sm" dot>
                    {row.state}
                  </StatusPill>
                </div>
              </li>
            ))}
          </ul>

          <div className="border-rule-soft text-ink-muted flex flex-wrap items-center justify-between gap-2 border-t px-5 py-3 font-mono text-[9px] tracking-[0.1em] uppercase">
            <span>Sample theatre day · interface preview</span>
            <span>4 rooms · 6 cases</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/*----------------------------------------------------------------------
  Coordination — one case, its people and its set
---------------------------------------------------------------------- */
function CoordinationA() {
  return (
    <section
      id="coordination"
      className="bg-surface-subtle/50 py-[var(--ds-section-y)]"
      aria-labelledby="coordination-title"
    >
      <div className="ds-shell grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="min-w-0 lg:col-span-4">
          <Eyebrow tone="accent">Coordination</Eyebrow>
          <Display as="h2" size="md" id="coordination-title" className="mt-3">
            A case holds people and a set.
          </Display>
          <Body size="md" tone="secondary" className="mt-4">
            Team assignment and instrument readiness are attached to the case
            itself. A gap in either is visible while the case is still a
            booking, not when the patient is in the room.
          </Body>

          <dl className="border-rule mt-8 grid grid-cols-3 gap-4 border-t pt-5">
            {[
              { value: '5', label: 'Roles per case' },
              { value: '3', label: 'Sets attached' },
              { value: '1', label: 'Conflict check' },
            ].map((item) => (
              <div key={item.label}>
                <dt className="text-ink-muted font-mono text-[9px] tracking-[0.12em] uppercase">
                  {item.label}
                </dt>
                <dd className="text-secondary tnum font-display mt-1 text-[1.5rem] leading-none font-semibold">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="min-w-0 lg:col-span-8">
          <Surface variant="preview" padding="none">
            <div className="border-rule-soft flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3">
              <div className="flex items-center gap-2.5">
                <span className="bg-primary h-1.5 w-1.5 rounded-full" aria-hidden="true" />
                <span className="text-ink-muted font-mono text-[10px] tracking-[0.12em] uppercase">
                  Case · OT-01 · 08:00
                </span>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill tone="attention" size="sm" dot>
                  In progress
                </StatusPill>
                <span className="bg-surface-muted text-ink-muted rounded-[3px] px-1.5 py-0.5 font-mono text-[9px] tracking-[0.1em] uppercase">
                  Preview
                </span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2">
              <div className="border-rule-soft sm:border-r">
                <p className="text-ink-muted border-rule-soft border-b px-5 py-2 font-mono text-[9px] tracking-[0.14em] uppercase">
                  Clinical team
                </p>
                <ul className="divide-rule-soft divide-y">
                  {caseTeam.map((member) => (
                    <li
                      key={member.role}
                      className="flex items-start justify-between gap-4 px-5 py-3"
                    >
                      <div className="min-w-0">
                        <p className="text-foreground text-[12px] font-medium">
                          {member.role}
                        </p>
                        <p className="text-ink-muted mt-0.5 truncate text-[10px]">
                          {member.detail}
                        </p>
                      </div>
                      <StatusPill
                        tone={member.held ? 'positive' : 'attention'}
                        size="sm"
                        dot
                        className="shrink-0"
                      >
                        {member.held ? 'Assigned' : 'Pending'}
                      </StatusPill>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-ink-muted border-rule-soft border-b px-5 py-2 font-mono text-[9px] tracking-[0.14em] uppercase">
                  Instrument set
                </p>
                <ul className="divide-rule-soft divide-y">
                  {caseSets.map((set) => (
                    <li key={set.name} className="px-5 py-3">
                      <AvailabilityIndicator
                        state={set.state}
                        label={set.name}
                        detail={set.detail}
                      />
                    </li>
                  ))}
                </ul>
                <p className="text-ink-muted border-rule-soft mt-1 border-t px-5 py-3 text-[10px] leading-snug">
                  Equipment state is shared with the Equipment module — a set
                  in maintenance cannot be assigned to a case.
                </p>
              </div>
            </div>
          </Surface>
        </div>
      </div>
    </section>
  );
}

export function DirectionA() {
  return (
    <div className="bg-paper text-ink">
      <SiteNav
        variant="minimal"
        brand={<Wordmark subtitle="Operating theatre orchestration" />}
        items={navItems}
        secondary={{ label: 'Playground', href: '/design-system' }}
        cta={{ label: 'Sign in', href: '/login' }}
      />

      <main>
        <Hero
          variant="split"
          eyebrow="Clinical technology"
          title={
            <>
              The theatre day,
              <br />
              read as <span className="text-secondary">one record.</span>
            </>
          }
          description="MedOrch holds the schedule, the room, the clinical team, the instrument set and the audit trail together — so the state of a case is legible before anyone has to ask for it."
          primary={{ label: 'Enter the platform', href: '/login' }}
          secondary={{ label: 'Request an account', href: '/register' }}
          support={
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <StatusPill tone="positive" size="sm" dot>
                Six schedule states
              </StatusPill>
              <StatusPill tone="info" size="sm" dot>
                Four role scopes
              </StatusPill>
              <span className="text-ink-muted text-[11px]">
                Server-side authorisation on every request
              </span>
            </div>
          }
          preview={<ProductPreview variant="schedule" />}
        />

        <StatsBand variant="inline" facts={platformFacts} />

        <TheatreBoardA />

        <CoordinationA />

        <div id="interface">
          <Showcase
            variant="framed"
            eyebrow="Interface"
            title="The set and the trail, beside the case."
            description="Instruments carry availability and service state; every change to a case is written to an attributable trail. Both are read from the same record the schedule operates on."
            preview={
              <div className="grid gap-4 md:grid-cols-2">
                <ProductPreview variant="audit" />
                <ProductPreview variant="equipment" />
              </div>
            }
          />
        </div>

        <div id="platform">
          <FeatureSection
            variant="grid"
            eyebrow="Platform"
            title="Modules that share one spine."
            description="Identity, authorisation and audit are not per-module features. Every module below inherits the same record."
            items={featureItems}
          />
        </div>

        <div id="method">
          <Workflow
            variant="steps"
            eyebrow="Method"
            title="From booking to a closed record."
            description="The case lifecycle, as the system models it — each transition conflict-checked and attributed."
            steps={workflowSteps}
          />
        </div>

        <CtaBand
          variant="split"
          title="Bring the theatre into one view."
          description="Sign in to the platform, or request an account and wait for approval — registration alone does not grant access."
          primary={{ label: 'Sign in to MedOrch', href: '/login' }}
          secondary={{ label: 'Request access', href: '/register' }}
          meta={
            <div className="flex flex-wrap items-center gap-3">
              <Eyebrow>Evidence playground</Eyebrow>
              <Link
                href="/design-system"
                className="text-secondary text-[12px] font-medium underline decoration-1 underline-offset-4"
              >
                Compare component variants
              </Link>
            </div>
          }
        />
      </main>

      <SiteFooter
        variant="columns"
        brand={<Wordmark subtitle="Operating theatre orchestration" />}
        note="A clinical operations platform for the operating theatre: one schedule, one record, one audit spine."
        columns={[
          {
            title: 'Product',
            links: [                { label: 'Schedules', href: '#interface' },
                { label: 'Theatres', href: '#theatres' },
                { label: 'Equipment', href: '#coordination' },
                { label: 'Audit trail', href: '#platform' },
            ],
          },
          {
            title: 'Access',
            links: [
              { label: 'Sign in', href: '/login' },
              { label: 'Request access', href: '/register' },
              { label: 'Reset password', href: '/forgot-password' },
            ],
          },
          {
            title: 'Design system',
            links: [
              { label: 'Playground', href: '/design-system' },
              { label: 'Direction B', href: '/design-system/direction-b' },
              { label: 'Direction C', href: '/design-system/direction-c' },
            ],
          },
        ]}
      />
    </div>
  );
}
