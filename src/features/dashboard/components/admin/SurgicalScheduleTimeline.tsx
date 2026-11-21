'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react';

import {
  Panel,
  PanelEmpty,
  PanelError,
  PanelHeader,
} from '@/features/dashboard/components/admin/DashboardPrimitives';
import {
  addDays,
  dateKey,
  durationMinutes,
  formatClock,
  formatDayHeading,
  formatDuration,
  formatTimeRange,
  hasOverlap,
  isOpenSchedule,
  minutesOfDay,
  PRIORITY,
  SCHEDULE_STATUS,
} from '@/features/dashboard/components/admin/format';
import type { Schedule, ScheduleDetail } from '@/features/dashboard/components/admin/types';

type Scope = 'TODAY' | 'WEEK' | 'ALL';

function buildAxis(schedules: Schedule[]) {
  const starts = schedules
    .map((schedule) => minutesOfDay(schedule.startTime))
    .filter((value): value is number => value !== null);
  const ends = schedules
    .map((schedule) => minutesOfDay(schedule.endTime))
    .filter((value): value is number => value !== null);

  const from = starts.length ? Math.min(...starts) : 8 * 60;
  const to = ends.length ? Math.max(...ends) : 18 * 60;
  const startHour = Math.max(0, Math.floor(from / 60) - 1);
  const endHour = Math.min(24, Math.max(startHour + 6, Math.ceil(to / 60) + 1));
  const span = (endHour - startHour) * 60;

  return {
    startHour,
    endHour,
    pct: (minutes: number) => ((minutes - startHour * 60) / span) * 100,
  };
}

function packLanes(schedules: Schedule[]) {
  const sorted = schedules.slice().sort((first, second) => {
    return new Date(first.startTime).getTime() - new Date(second.startTime).getTime();
  });
  const laneEnds: number[] = [];
  const withLane = sorted.map((schedule) => {
    const start = new Date(schedule.startTime).getTime();
    const end = new Date(schedule.endTime).getTime();
    let lane = laneEnds.findIndex((laneEnd) => laneEnd <= start);

    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(end);
    } else {
      laneEnds[lane] = end;
    }

    return { schedule, lane };
  });

  return { items: withLane, laneCount: Math.max(1, laneEnds.length) };
}

function isWithinWeek(schedule: Schedule, today: Date) {
  const key = dateKey(schedule.startTime);
  const from = dateKey(today);
  const to = dateKey(addDays(today, 6));
  return key >= from && key <= to;
}

export function SurgicalScheduleTimeline({
  schedules,
  details,
  detailsError,
  now,
  error,
  onRetry,
}: {
  schedules: Schedule[];
  details: Record<string, ScheduleDetail>;
  detailsError?: string;
  now: Date;
  error?: string;
  onRetry: () => void;
}) {
  const [scope, setScope] = useState<Scope>('WEEK');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const view = useMemo(() => {
    const today = now;
    const open = schedules
      .filter((schedule) => isOpenSchedule(schedule.status))
      .slice()
      .sort(
        (first, second) =>
          new Date(first.startTime).getTime() - new Date(second.startTime).getTime(),
      );

    const counts = {
      TODAY: open.filter((schedule) => dateKey(schedule.startTime) === dateKey(today)).length,
      WEEK: open.filter((schedule) => isWithinWeek(schedule, today)).length,
      ALL: open.length,
    };

    const visible = open.filter((schedule) => {
      if (scope === 'TODAY') return dateKey(schedule.startTime) === dateKey(today);
      if (scope === 'WEEK') return isWithinWeek(schedule, today);
      return true;
    });

    const groups = new Map<string, Schedule[]>();
    for (const schedule of visible) {
      const key = dateKey(schedule.startTime);
      const current = groups.get(key) ?? [];
      current.push(schedule);
      groups.set(key, current);
    }

    const conflictIds = new Set<string>();
    for (const group of groups.values()) {
      for (const schedule of group) {
        for (const other of group) {
          if (
            schedule.id !== other.id &&
            schedule.otRoomId === other.otRoomId &&
            hasOverlap(schedule, other) &&
            schedule.status !== 'CANCELLED' &&
            other.status !== 'CANCELLED'
          ) {
            conflictIds.add(schedule.id);
          }
        }
      }
    }

    const selected =
      visible.find((schedule) => schedule.id === selectedId) ??
      visible.find((schedule) => schedule.status === 'IN_PROGRESS') ??
      visible[0] ??
      null;

    return {
      open,
      visible,
      groups: [...groups.entries()],
      selected,
      counts,
      conflictIds,
      axis: buildAxis(visible),
    };
  }, [now, scope, schedules, selectedId]);

  const selected = view.selected;
  const selectedDetail = selected ? details[selected.id] : undefined;
  const hourTicks: number[] = [];
  for (let hour = view.axis.startHour; hour <= view.axis.endHour; hour += 2) {
    hourTicks.push(hour);
  }

  return (
    <Panel labelledBy="surgical-schedule" tone="primary">
      <PanelHeader
        id="surgical-schedule"
        title="Surgical schedule"
        caption="Open cases by day and theatre, sized by recorded start and end times."
        aside={
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            {(
              [
                ['TODAY', 'Today', view.counts.TODAY],
                ['WEEK', '7 days', view.counts.WEEK],
                ['ALL', 'All open', view.counts.ALL],
              ] as const
            ).map(([key, label, count]) => (
              <button
                key={key}
                type="button"
                aria-pressed={scope === key}
                onClick={() => setScope(key)}
                className={`rounded-full px-2.5 py-1 text-[10.5px] font-semibold transition-colors ${
                  scope === key
                    ? 'bg-primary text-primary-ink'
                    : 'bg-surface-muted text-ink-secondary hover:bg-surface-subtle'
                }`}
              >
                {label}
                <span className={scope === key ? 'ml-1 text-primary-ink/70' : 'ml-1 text-ink-subtle'}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        }
      />

      {error ? <PanelError message={error} onRetry={onRetry} /> : null}

      {!error && view.visible.length === 0 ? (
        <PanelEmpty
          title="No cases in this view"
          description={
            scope === 'TODAY'
              ? 'No open cases are scheduled for the rest of today.'
              : scope === 'WEEK'
                ? 'No open cases are booked in the next seven days.'
                : 'No open cases are currently scheduled.'
          }
        />
      ) : null}

      {!error && view.visible.length > 0 ? (
        <>
          {/* Desktop: a time-positioned week board. */}
          <div className="hidden overflow-x-auto md:block">
            <div className="min-w-[620px] px-4 pt-4 pb-3 sm:px-5">
              <div className="relative ml-[6.75rem] h-4">
                {hourTicks.map((hour) => (
                  <span
                    key={hour}
                    className="text-ink-subtle absolute -translate-x-1/2 font-mono text-[9.5px] tabular-nums"
                    style={{ left: `${view.axis.pct(hour * 60)}%` }}
                  >
                    {String(hour).padStart(2, '0')}:00
                  </span>
                ))}
              </div>

              <div className="border-rule-soft mt-1 border-t">
                {view.groups.map(([key, daySchedules]) => {
                  const { items, laneCount } = packLanes(daySchedules);
                  const height = laneCount * 38 + 8;

                  return (
                    <div
                      key={key}
                      className="border-rule-soft grid grid-cols-[6.75rem_minmax(0,1fr)] border-b last:border-b-0"
                    >
                      <div className="py-3 pr-3">
                        <p className="text-ink text-[11px] font-semibold">
                          {formatDayHeading(daySchedules[0].startTime)}
                        </p>
                        <p className="text-ink-subtle mt-0.5 text-[10px]">
                          {daySchedules.length} case{daySchedules.length === 1 ? '' : 's'}
                        </p>
                      </div>

                      <div className="relative" style={{ height }}>
                        {hourTicks.map((hour) => (
                          <span
                            key={hour}
                            className="bg-rule-soft absolute top-0 bottom-0 w-px"
                            style={{ left: `${view.axis.pct(hour * 60)}%` }}
                            aria-hidden="true"
                          />
                        ))}

                        {items.map(({ schedule, lane }) => {
                          const start = minutesOfDay(schedule.startTime);
                          const end = minutesOfDay(schedule.endTime);
                          if (start === null || end === null) return null;

                          const left = view.axis.pct(start);
                          const width = Math.max(7, view.axis.pct(end) - left);
                          const status = SCHEDULE_STATUS[schedule.status];
                          const priority = PRIORITY[schedule.priority];
                          const conflict = view.conflictIds.has(schedule.id);
                          const active = selected?.id === schedule.id;

                          return (
                            <button
                              key={schedule.id}
                              type="button"
                              onClick={() => setSelectedId(schedule.id)}
                              aria-pressed={active}
                              aria-label={`${schedule.procedure}, ${formatTimeRange(
                                schedule.startTime,
                                schedule.endTime,
                              )}, ${schedule.otRoom?.code ?? 'theatre unassigned'}, ${
                                status.label
                              }`}
                              className={`${status.tone} absolute overflow-hidden rounded-[10px] border px-2 py-1 text-left shadow-xs transition-[box-shadow,border-color] ${
                                active
                                  ? 'border-primary shadow-md ring-1 ring-primary/25'
                                  : 'border-transparent hover:border-primary/45'
                              } ${conflict ? 'outline outline-1 outline-danger/60' : ''}`}
                              style={{
                                left: `${left}%`,
                                width: `${width}%`,
                                top: lane * 38 + 4,
                                height: 34,
                              }}
                              title={`${schedule.procedure} · ${priority.label} · ${status.label}`}
                            >
                              <span className="flex items-center gap-1.5">
                                <span className={`${status.rail} h-1.5 w-1.5 shrink-0 rounded-full`} />
                                <span className="block truncate text-[10px] leading-tight font-semibold">
                                  {schedule.procedure}
                                </span>
                              </span>
                              <span className="mt-0.5 block truncate font-mono text-[9px] opacity-75 tabular-nums">
                                {formatClock(schedule.startTime)} · {schedule.otRoom?.code ?? '—'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mobile: day-grouped agenda. */}
          <div className="divide-rule-soft divide-y md:hidden">
            {view.groups.map(([key, daySchedules]) => (
              <div key={key}>
                <div className="bg-surface-subtle flex items-center justify-between px-4 py-2">
                  <p className="text-ink text-[11px] font-semibold">
                    {formatDayHeading(daySchedules[0].startTime)}
                  </p>
                  <span className="text-ink-subtle text-[10px]">{daySchedules.length}</span>
                </div>
                <ul>
                  {daySchedules.map((schedule) => {
                    const status = SCHEDULE_STATUS[schedule.status];
                    const active = selected?.id === schedule.id;

                    return (
                      <li key={schedule.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(schedule.id)}
                          aria-pressed={active}
                          className={`relative flex w-full items-center gap-3 px-4 py-3 text-left ${
                            active ? 'bg-primary-soft/55' : ''
                          }`}
                        >
                          <span className={`${status.rail} absolute top-0 bottom-0 left-0 w-[3px]`} />
                          <span className="text-ink-secondary w-[4.9rem] shrink-0 font-mono text-[10px] tabular-nums">
                            {formatClock(schedule.startTime)}
                            <br />
                            {formatClock(schedule.endTime)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="text-ink block truncate text-[11.5px] font-semibold">
                              {schedule.procedure}
                            </span>
                            <span className="text-ink-muted mt-0.5 block truncate text-[10.5px]">
                              {schedule.otRoom?.code ?? 'Theatre unassigned'} ·{' '}
                              {status.label}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          {selected ? (
            <div className="border-rule-soft bg-surface-subtle/35 border-t px-4 py-4 sm:px-5">
              <article className="border-rule bg-sheet overflow-hidden rounded-[14px] border shadow-[0_1px_2px_rgba(41,36,61,0.04)]">
                <div className="border-rule-soft flex flex-wrap items-start gap-4 border-b p-4">
                  <div className="border-rule bg-surface-subtle flex h-[4.25rem] w-[4.25rem] shrink-0 flex-col items-center justify-center rounded-[12px] border">
                    <span className="text-ink font-mono text-[1.45rem] leading-none font-semibold tabular-nums">
                      {new Date(selected.startTime).getDate()}
                    </span>
                    <span className="text-ink-subtle mt-1 text-[9px] font-semibold tracking-[0.12em] uppercase">
                      {new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(
                        new Date(selected.startTime),
                      )}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`${
                          SCHEDULE_STATUS[selected.status].tone
                        } inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[9.5px] font-bold tracking-[0.06em] uppercase`}
                      >
                        <span
                          className={`${SCHEDULE_STATUS[selected.status].rail} h-1.5 w-1.5 rounded-full`}
                          aria-hidden="true"
                        />
                        {SCHEDULE_STATUS[selected.status].label}
                      </span>
                      <span
                        className={`text-[10.5px] font-semibold ${PRIORITY[selected.priority].tone}`}
                      >
                        {PRIORITY[selected.priority].label}
                      </span>
                    </div>

                    <p className="text-ink mt-1.5 text-[15px] leading-snug font-semibold tracking-[-0.01em]">
                      {selected.procedure}
                    </p>
                    <p className="text-ink-muted mt-1 text-[11.5px]">
                      {formatDayHeading(selected.startTime)} ·{' '}
                      {formatTimeRange(selected.startTime, selected.endTime)} ·{' '}
                      {formatDuration(
                        durationMinutes(selected.startTime, selected.endTime),
                      )}
                    </p>
                  </div>

                  <Link
                    href={`/schedules/${selected.id}`}
                    className="bg-cobalt text-white hover:bg-cobalt-hover inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[11px] font-semibold shadow-[0_8px_18px_-10px_rgba(29,78,216,0.8)] transition-colors"
                  >
                    Open full record
                    <ArrowRight size={11} weight="bold" aria-hidden="true" />
                  </Link>
                </div>

                <div className="border-rule-soft border-b px-4 py-3">
                  <div className="text-ink-subtle flex items-center justify-between text-[9.5px] font-semibold tracking-[0.08em] uppercase">
                    <span>Case window</span>
                    <span className="font-mono tracking-normal">
                      {formatTimeRange(selected.startTime, selected.endTime)}
                    </span>
                  </div>
                  <div className="bg-surface-muted relative mt-1.5 h-2 overflow-hidden rounded-full">
                    <span
                      className="bg-primary absolute inset-y-0 rounded-full"
                      style={{
                        left: `${Math.max(
                          0,
                          view.axis.pct(minutesOfDay(selected.startTime) ?? 0),
                        )}%`,
                        width: `${Math.max(
                          2,
                          view.axis.pct(minutesOfDay(selected.endTime) ?? 0) -
                            view.axis.pct(minutesOfDay(selected.startTime) ?? 0),
                        )}%`,
                      }}
                      aria-hidden="true"
                    />
                  </div>
                </div>

                <dl className="grid grid-cols-2 gap-x-5 gap-y-3 p-4 sm:grid-cols-4">
                  <div>
                    <dt className="text-ink-subtle text-[9.5px] font-semibold tracking-[0.08em] uppercase">
                      Theatre
                    </dt>
                    <dd className="text-ink mt-1 font-mono text-[12px] font-semibold">
                      {selected.otRoom?.code ?? 'Unassigned'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ink-subtle text-[9.5px] font-semibold tracking-[0.08em] uppercase">
                      Department
                    </dt>
                    <dd className="text-ink mt-1 truncate text-[12px] font-medium">
                      {selected.department?.name ?? 'Unassigned'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ink-subtle text-[9.5px] font-semibold tracking-[0.08em] uppercase">
                      Surgeon
                    </dt>
                    <dd className="text-ink mt-1 truncate text-[12px] font-medium">
                      {selected.surgeon?.name ?? 'Unassigned'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ink-subtle text-[9.5px] font-semibold tracking-[0.08em] uppercase">
                      Staff assigned
                    </dt>
                    <dd className="text-ink mt-1 text-[12px] font-medium">
                      {selectedDetail ? selectedDetail.staff.length : '—'}
                    </dd>
                  </div>
                </dl>

                {detailsError ? (
                  <p className="border-rule-soft text-warning border-t px-4 py-3 text-[11px]">
                    Staffing and equipment detail could not be loaded. The case record above is
                    intact.
                  </p>
                ) : selectedDetail ? (
                  <div className="border-rule-soft bg-surface-subtle/40 grid gap-4 border-t p-4 sm:grid-cols-2">
                    <div>
                      <p className="text-ink-subtle text-[9.5px] font-semibold tracking-[0.08em] uppercase">
                        Assigned staff
                      </p>
                      {selectedDetail.staff.length > 0 ? (
                        <ul className="mt-2 flex flex-wrap gap-1.5">
                          {selectedDetail.staff.map((assignment) => (
                            <li
                              key={assignment.id}
                              className="border-rule bg-sheet inline-flex items-center gap-1.5 rounded-full border py-0.5 pr-2 pl-0.5"
                            >
                              <span className="bg-primary-soft text-primary grid h-5 w-5 place-items-center rounded-full text-[8.5px] font-semibold">
                                {assignment.user.name
                                  .split(' ')
                                  .filter(Boolean)
                                  .slice(0, 2)
                                  .map((part) => part[0]?.toUpperCase())
                                  .join('')}
                              </span>
                              <span className="text-ink-secondary text-[10.5px]">
                                {assignment.user.name}
                              </span>
                              <span className="text-ink-subtle text-[9px]">
                                {assignment.role.toLowerCase()}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-warning mt-2 text-[11px]">
                          No staff record is assigned to this case.
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-ink-subtle text-[9.5px] font-semibold tracking-[0.08em] uppercase">
                        Equipment assigned
                      </p>
                      {selectedDetail.equipment.filter((assignment) => !assignment.releasedAt)
                        .length > 0 ? (
                        <ul className="mt-2 flex flex-wrap gap-1.5">
                          {selectedDetail.equipment
                            .filter((assignment) => !assignment.releasedAt)
                            .map((assignment) => (
                              <li
                                key={assignment.id}
                                className="border-rule bg-sheet inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5"
                              >
                                <span className="text-ink-secondary text-[10.5px]">
                                  {assignment.equipment.name}
                                </span>
                                <span className="text-ink-subtle text-[9px]">
                                  {assignment.equipment.category}
                                </span>
                              </li>
                            ))}
                        </ul>
                      ) : (
                        <p className="text-ink-muted mt-2 text-[11px]">
                          No equipment is currently assigned.
                        </p>
                      )}
                    </div>
                  </div>
                ) : null}

                {view.conflictIds.has(selected.id) ? (
                  <p className="bg-danger-soft text-danger border-danger/20 border-t px-4 py-2.5 text-[11px] font-medium">
                    This case overlaps another non-cancelled case in the same theatre.
                  </p>
                ) : null}
              </article>
            </div>
          ) : null}
        </>
      ) : null}
    </Panel>
  );
}
