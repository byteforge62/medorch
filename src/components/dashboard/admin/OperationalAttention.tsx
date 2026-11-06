'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react';

import {
  CountTag,
  Panel,
  PanelEmpty,
  PanelError,
  PanelHeader,
} from './DashboardPrimitives';
import { formatClock, formatDay, formatTimeRange } from './format';
import type {
  AlertRecord,
  DashboardErrors,
  Equipment,
  Room,
  Schedule,
  User,
} from './types';

type AttentionItem = {
  id: string;
  source: string;
  title: string;
  detail: string;
  href: string;
  tone: 'critical' | 'warning' | 'info';
};

const toneStyles = {
  critical: {
    rail: 'bg-danger',
    label: 'text-danger',
    plate: 'bg-danger-soft/55',
  },
  warning: {
    rail: 'bg-warning',
    label: 'text-warning',
    plate: 'bg-warning-soft/55',
  },
  info: {
    rail: 'bg-primary',
    label: 'text-primary',
    plate: 'bg-primary-soft/45',
  },
} as const;

export function OperationalAttention({
  rooms,
  schedules,
  equipment,
  alerts,
  users,
  errors,
  now,
  onRetry,
}: {
  rooms: Room[];
  schedules: Schedule[];
  equipment: Equipment[];
  alerts: AlertRecord[];
  users: User[];
  errors: DashboardErrors;
  now: Date;
  onRetry: () => void;
}) {
  const items = useMemo(() => {
    const result: AttentionItem[] = [];

    for (const alert of alerts) {
      if (!alert.isRead && alert.severity === 'CRITICAL') {
        result.push({
          id: `alert-${alert.id}`,
          source: 'Critical alert',
          title: alert.title,
          detail: alert.message,
          href: '/alerts',
          tone: 'critical',
        });
      }
    }

    for (const schedule of schedules) {
      if (schedule.status === 'DELAYED') {
        result.push({
          id: `delay-${schedule.id}`,
          source: 'Delayed case',
          title: schedule.procedure,
          detail: `${schedule.otRoom?.code ?? 'Theatre unassigned'} · ${formatDay(
            schedule.startTime,
          )} ${formatTimeRange(schedule.startTime, schedule.endTime)}`,
          href: `/schedules/${schedule.id}`,
          tone: 'critical',
        });
      }
    }

    for (const room of rooms) {
      if (room.isActive && (room.status === 'MAINTENANCE' || room.status === 'DISABLED')) {
        result.push({
          id: `room-${room.id}`,
          source: 'Theatre availability',
          title: `${room.code} is ${room.status.toLowerCase()}`,
          detail: `${room.name} · ${room.department?.name ?? 'Unassigned department'}`,
          href: '/ot-rooms',
          tone: 'warning',
        });
      }
    }

    const nowMs = now.getTime();
    const dueSoon = nowMs + 7 * 24 * 60 * 60 * 1000;

    for (const item of equipment) {
      const due = item.maintenanceDueAt ? new Date(item.maintenanceDueAt).getTime() : null;
      const isOverdue = due !== null && due < nowMs;

      if (item.status === 'MAINTENANCE' || isOverdue) {
        result.push({
          id: `equipment-${item.id}`,
          source: 'Equipment readiness',
          title: `${item.name} ${isOverdue ? 'is overdue for maintenance' : 'is in maintenance'}`,
          detail: `${item.department?.name ?? 'No department'}${
            item.maintenanceDueAt
              ? ` · due ${formatDay(item.maintenanceDueAt)}`
              : ''
          }`,
          href: '/equipment',
          tone: isOverdue ? 'critical' : 'warning',
        });
      } else if (due !== null && due <= dueSoon) {
        result.push({
          id: `equipment-${item.id}`,
          source: 'Equipment readiness',
          title: `${item.name} maintenance is due`,
          detail: `${item.department?.name ?? 'No department'} · ${formatDay(
            item.maintenanceDueAt!,
          )}`,
          href: '/equipment',
          tone: 'warning',
        });
      }
    }

    if (!errors.users) {
      const pending = users.filter(
        (user) =>
          user.status === 'PENDING' &&
          (user.role === 'DOCTOR' || user.role === 'OT_STAFF' || user.role === 'ADMIN'),
      );

      if (pending.length > 0) {
        const doctors = pending.filter((user) => user.role === 'DOCTOR').length;
        const theatreStaff = pending.filter((user) => user.role === 'OT_STAFF').length;
        const parts = [
          doctors ? `${doctors} doctor${doctors === 1 ? '' : 's'}` : '',
          theatreStaff ? `${theatreStaff} theatre staff` : '',
        ].filter(Boolean);

        result.push({
          id: 'pending-accounts',
          source: 'Pending decision',
          title: `${pending.length} account${pending.length === 1 ? '' : 's'} awaiting approval`,
          detail: parts.join(' · '),
          href: '/users',
          tone: 'info',
        });
      }
    }

    return result;
  }, [alerts, equipment, errors.users, now, rooms, schedules, users]);

  const unavailable = [
    errors.rooms ? 'theatres' : '',
    errors.schedules ? 'schedules' : '',
    errors.equipment ? 'equipment' : '',
    errors.alerts ? 'alerts' : '',
    errors.users ? 'accounts' : '',
  ].filter(Boolean);

  const hasCritical = items.some((item) => item.tone === 'critical');

  return (
    <Panel labelledBy="operational-attention">
      <PanelHeader
        id="operational-attention"
        title="Operational attention"
        caption="Unresolved conditions that can affect the theatre day. Each item opens its source record."
        aside={
          <div className="flex items-center gap-2">
            <CountTag tone={hasCritical ? 'critical' : items.length ? 'warning' : 'positive'}>
              {items.length ? `${items.length} open` : 'Clear'}
            </CountTag>
            <Link
              href="/alerts"
              className="text-ink-muted hover:text-primary hidden text-[11px] font-semibold sm:inline"
            >
              Alert register
            </Link>
          </div>
        }
      />

      {unavailable.length ? (
        <div
          role="status"
          className="border-warning/25 bg-warning-soft/45 text-ink-secondary flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2 text-[11.5px] sm:px-5"
        >
          <span>
            Attention scan is partial: {unavailable.join(', ')} unavailable.
          </span>
          <button
            type="button"
            onClick={onRetry}
            className="text-primary font-semibold underline decoration-current/30 underline-offset-4"
          >
            Retry
          </button>
        </div>
      ) : null}

      {!errors.rooms &&
      !errors.schedules &&
      !errors.equipment &&
      !errors.alerts &&
      !errors.users &&
      items.length === 0 ? (
        <PanelEmpty
          title="No urgent exceptions"
          description="No critical alert, delayed case, theatre outage, maintenance exception or pending account was found in the current data."
        />
      ) : items.length === 0 ? (
        <PanelError message="No usable operational feed was available, so no urgency conclusion can be drawn." />
      ) : (
        <ul className="bg-rule-soft grid gap-px sm:grid-cols-2">
          {items.map((item) => {
            const tone = toneStyles[item.tone];

            return (
              <li key={item.id} className="bg-sheet min-w-0">
                <Link
                  href={item.href}
                  className="group hover:bg-surface-subtle relative flex h-full items-start gap-3 px-4 py-3.5 transition-colors sm:px-5"
                >
                  <span
                    className={`${tone.rail} absolute top-0 bottom-0 left-0 w-[3px]`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`${tone.label} text-[10px] font-semibold tracking-[0.08em] uppercase`}>
                      {item.source}
                    </p>
                    <p className="text-ink mt-1 text-[12.5px] leading-snug font-semibold">
                      {item.title}
                    </p>
                    <p className="text-ink-muted mt-0.5 line-clamp-2 text-[11px] leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                  <ArrowRight
                    size={13}
                    weight="bold"
                    className="text-ink-subtle group-hover:text-primary mt-1 shrink-0 transition-colors"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {items.length > 0 ? (
        <p className="border-rule-soft text-ink-subtle border-t px-4 py-2 text-[10.5px] sm:px-5">
          Review time {formatClock(now)} · warnings remain visible until the source record changes.
        </p>
      ) : null}
    </Panel>
  );
}
