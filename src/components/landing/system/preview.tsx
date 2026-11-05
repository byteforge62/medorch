import React from 'react';
import type { ReactNode } from 'react';
import { StatusPill } from '@/components/ui/StatusPill';
import {
  AvailabilityIndicator,
  Timeline,
  TimelineItem,
} from '@/components/ui/Indicators';
import { auditRows, equipmentRows, scheduleRows } from './content';

/*======================================================================
  Product previews
  ======================================================================
  A framed slice of the real interface vocabulary: the six schedule states,
  equipment availability and the audit trail. Rows are sample records, and
  every frame is labelled "Preview" so a landing prototype can never be
  mistaken for live clinical data.
====================================================================== */

export function ProductFrame({
  title = 'MedOrch · Schedules',
  meta,
  children,
  tone = 'light',
  className = '',
}: {
  title?: string;
  meta?: ReactNode;
  children: ReactNode;
  tone?: 'light' | 'dark';
  className?: string;
}) {
  const dark = tone === 'dark';

  return (
    <div
      className={`overflow-hidden rounded-[var(--radius-xl)] border shadow-xl ${
        dark ? 'border-white/10 bg-[#0d1c22]' : 'border-border bg-sheet'
      } ${className}`}
    >
      <div
        className={`flex items-center justify-between gap-3 border-b px-4 py-2.5 ${
          dark
            ? 'border-white/10 bg-white/[0.03]'
            : 'border-rule-soft bg-surface-subtle/60'
        }`}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${dark ? 'bg-[#7fe3c8]' : 'bg-primary'}`}
            aria-hidden="true"
          />
          <span
            className={`truncate font-mono text-[10px] tracking-[0.12em] uppercase ${
              dark ? 'text-white/60' : 'text-ink-muted'
            }`}
          >
            {title}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {meta}
          <span
            className={`rounded-[3px] px-1.5 py-0.5 font-mono text-[9px] tracking-[0.1em] uppercase ${
              dark
                ? 'bg-white/10 text-white/50'
                : 'bg-surface-muted text-ink-muted'
            }`}
          >
            Preview
          </span>
        </div>
      </div>
      <div className={dark ? 'text-white' : ''}>{children}</div>
    </div>
  );
}

const stateTone = {
  Scheduled: 'neutral',
  Confirmed: 'info',
  'In progress': 'attention',
  Delayed: 'critical',
  Cancelled: 'critical',
  Completed: 'positive',
} as const;

function SchedulePreview({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const dark = tone === 'dark';

  return (
    <div>
      <div
        className={`flex items-center justify-between gap-3 px-4 py-2.5 ${
          dark ? 'text-white/60' : 'text-ink-muted'
        }`}
      >
        <span className="font-mono text-[10px] tracking-[0.12em] uppercase">
          Today · 6 cases
        </span>
        <span className="font-mono text-[10px] tracking-[0.12em] uppercase">
          4 theatres
        </span>
      </div>

      <ul className={`divide-y ${dark ? 'divide-white/10' : 'divide-rule-soft'}`}>
        {scheduleRows.map((row) => (
          <li
            key={`${row.room}-${row.time}`}
            className={`flex items-center gap-3 px-4 py-3 transition-colors ${
              dark ? 'hover:bg-white/[0.04]' : 'hover:bg-surface-subtle/60'
            }`}
          >
            <span
              className={`tnum w-11 shrink-0 font-mono text-[11px] ${
                dark ? 'text-white/70' : 'text-ink-secondary'
              }`}
            >
              {row.time}
            </span>

            <span
              className={`hidden w-12 shrink-0 font-mono text-[10px] tracking-[0.08em] sm:block ${
                dark ? 'text-white/45' : 'text-ink-subtle'
              }`}
            >
              {row.room}
            </span>

            <span className="min-w-0 flex-1">
              <span
                className={`block truncate text-[12px] font-medium ${
                  dark ? 'text-white/90' : 'text-foreground'
                }`}
              >
                {row.procedure}
              </span>
              <span
                className={`mt-0.5 block truncate text-[10px] ${
                  dark ? 'text-white/45' : 'text-ink-muted'
                }`}
              >
                {row.priority} · {row.duration}
              </span>
            </span>

            <StatusPill tone={stateTone[row.state]} size="sm" dot className="shrink-0">
              {row.state}
            </StatusPill>
          </li>
        ))}
      </ul>

      <div
        className={`flex items-center justify-between gap-3 border-t px-4 py-2.5 ${
          dark
            ? 'border-white/10 text-white/50'
            : 'border-rule-soft text-ink-muted'
        }`}
      >
        <span className="font-mono text-[9px] tracking-[0.1em] uppercase">
          Sample schedule · interface preview
        </span>
        <span className="font-mono text-[9px]">6 states</span>
      </div>
    </div>
  );
}

const equipmentStateMap = {
  Available: 'available',
  'In use': 'in-use',
  Maintenance: 'maintenance',
  Offline: 'offline',
} as const;

function EquipmentPreview() {
  return (
    <ul className="divide-rule-soft divide-y">
      {equipmentRows.map((row) => (
        <li
          key={row.name}
          className="flex items-center justify-between gap-4 px-4 py-3"
        >
          <div className="min-w-0">
            <p className="text-foreground truncate text-[12px] font-medium">
              {row.name}
            </p>
            <p className="text-ink-muted mt-0.5 text-[10px]">
              {row.location} · {row.detail}
            </p>
          </div>
          <AvailabilityIndicator
            state={equipmentStateMap[row.state]}
            label={row.state}
          />
        </li>
      ))}
    </ul>
  );
}

function AuditPreview() {
  return (
    <Timeline label="Audit preview" className="px-4 py-4">
      {auditRows.map((row, index) => (
        <TimelineItem
          key={row.time}
          time={row.time}
          title={row.event}
          description={`${row.detail} · ${row.actor}`}
          tone={index === 0 ? 'accent' : 'neutral'}
          last={index === auditRows.length - 1}
        />
      ))}
    </Timeline>
  );
}

export function ProductPreview({
  variant = 'schedule',
  tone = 'light',
}: {
  variant?: 'schedule' | 'equipment' | 'audit';
  tone?: 'light' | 'dark';
}) {
  if (variant === 'equipment') {
    return (
      <ProductFrame title="MedOrch · Equipment" tone={tone}>
        <EquipmentPreview />
      </ProductFrame>
    );
  }

  if (variant === 'audit') {
    return (
      <ProductFrame title="MedOrch · Audit trail" tone={tone}>
        <AuditPreview />
      </ProductFrame>
    );
  }

  return (
    <ProductFrame
      title="MedOrch · Schedules"
      tone={tone}
      meta={
        <span className="text-ink-muted hidden font-mono text-[9px] sm:inline">
          Mon · Theatre suite
        </span>
      }
    >
      <SchedulePreview tone={tone} />
    </ProductFrame>
  );
}
