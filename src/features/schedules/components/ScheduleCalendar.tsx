'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import type { ScheduleItem } from '@/features/schedules/components/ScheduleCard';
import {
  ScheduleStatusBadge,
  SchedulePriorityBadge,
} from '@/features/schedules/components/ScheduleStatusBadge';

interface ScheduleCalendarProps {
  schedules: ScheduleItem[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDateKey(value: string): string {
  try {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

function formatTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatMonth(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function ScheduleCalendar({
  schedules,
  isLoading,
  error,
  onRetry,
}: ScheduleCalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();

    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  });

  const year = visibleMonth.getUTCFullYear();
  const month = visibleMonth.getUTCMonth();

  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  const todayKey = new Date().toISOString().slice(0, 10);

  const schedulesByDate = useMemo(() => {
    const grouped = new Map<string, ScheduleItem[]>();

    for (const schedule of schedules) {
      const key = getDateKey(schedule.scheduledDate);

      if (!key) {
        continue;
      }

      const existing = grouped.get(key) ?? [];
      existing.push(schedule);
      grouped.set(key, existing);
    }

    for (const daySchedules of grouped.values()) {
      daySchedules.sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );
    }

    return grouped;
  }, [schedules]);

  const cells = Array.from(
    {
      length: Math.ceil((firstWeekday + daysInMonth) / 7) * 7,
    },
    (_, index) => {
      const day = index - firstWeekday + 1;

      if (day < 1 || day > daysInMonth) {
        return {
          key: `empty-${index}`,
          day: null as number | null,
          dateKey: '',
        };
      }

      const dateKey = [
        year,
        String(month + 1).padStart(2, '0'),
        String(day).padStart(2, '0'),
      ].join('-');

      return {
        key: dateKey,
        day,
        dateKey,
      };
    },
  );

  if (isLoading) {
    return <LoadingState message="Loading surgical schedules..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load schedules"
        message={error}
        onRetry={onRetry}
      />
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-midnight text-[20px] leading-tight font-bold tracking-[-0.02em]">
            {formatMonth(visibleMonth)}
          </h2>

          <p className="text-ink-muted mt-1 text-[11.5px]">
            Procedures are arranged by scheduled date and start time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setVisibleMonth(new Date(Date.UTC(year, month - 1, 1)))
            }
            aria-label="Previous month"
            className="border-ice-border bg-sheet text-ink-secondary hover:border-cobalt/30 hover:text-cobalt flex h-9 w-9 items-center justify-center rounded-full border shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt"
          >
            ←
          </button>

          <button
            type="button"
            onClick={() => {
              const now = new Date();

              setVisibleMonth(
                new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)),
              );
            }}
            className="border-ice-border bg-sheet text-ink-secondary hover:border-cobalt/30 hover:text-cobalt flex h-9 items-center rounded-full border px-3.5 text-[11.5px] font-semibold shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt"
          >
            Today
          </button>

          <button
            type="button"
            onClick={() =>
              setVisibleMonth(new Date(Date.UTC(year, month + 1, 1)))
            }
            aria-label="Next month"
            className="border-ice-border bg-sheet text-ink-secondary hover:border-cobalt/30 hover:text-cobalt flex h-9 w-9 items-center justify-center rounded-full border shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt"
          >
            →
          </button>
        </div>
      </div>

      <section
        className="border-ice-border bg-sheet shadow-xs space-y-4 rounded-[var(--radius-panel)] border p-4 md:hidden"
        aria-label="Schedule agenda"
      >
        {[...schedulesByDate.entries()]
          .filter(([dateKey]) =>
            dateKey.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`),
          )
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([dateKey, daySchedules]) => (
            <section key={dateKey} aria-labelledby={`agenda-${dateKey}`}>
              <div className="border-rule-soft flex items-baseline justify-between gap-2 border-b pb-2">
                <h3
                  id={`agenda-${dateKey}`}
                  className="font-display text-midnight text-[15px] leading-tight font-bold tracking-[-0.02em]"
                >
                  {new Intl.DateTimeFormat('en-IN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    timeZone: 'UTC',
                  }).format(new Date(`${dateKey}T00:00:00Z`))}
                </h3>
                <span className="text-ink-subtle text-[11px] tabular-nums">
                  {daySchedules.length}{' '}
                  {daySchedules.length === 1 ? 'case' : 'cases'}
                </span>
              </div>
              <div className="divide-rule-soft divide-y">
                {daySchedules.map((schedule) => (
                  <Link
                    key={schedule.id}
                    href={`/schedules/${schedule.id}`}
                    className="focus-visible:outline-primary grid min-h-14 grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-3 py-3 focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <span className="text-ink-secondary font-mono text-[11.5px] tabular-nums">
                      {formatTime(schedule.startTime)}
                    </span>
                    <span className="min-w-0">
                      <span className="text-midnight block truncate text-[12.5px] font-semibold">
                        {schedule.procedure}
                      </span>
                      <span className="text-ink-muted mt-0.5 block truncate text-[11px]">
                        {schedule.otRoom?.name || 'Unassigned'} ·{' '}
                        {schedule.surgeon?.name || 'Unassigned'}
                      </span>
                    </span>
                    <ScheduleStatusBadge status={schedule.status} />
                  </Link>
                ))}
              </div>
            </section>
          ))}
        {schedules.length === 0 && (
          <p className="text-ink-muted rounded-[var(--radius-md)] border border-dashed border-ice-border bg-porcelain/60 px-4 py-5 text-[12px]">
            No schedules match the current filters. Adjust the filters or
            navigate to another month.
          </p>
        )}
      </section>

      <div className="hidden overflow-x-auto md:block">
        <div className="min-w-[980px]">
          <div className="border-ice-border bg-porcelain grid grid-cols-7 overflow-hidden rounded-t-[var(--radius-panel)] border border-b-0">
            {WEEKDAYS.map((weekday) => (
              <div
                key={weekday}
                className="text-ink-subtle px-3 py-3 text-center text-[10px] font-semibold tracking-[0.08em] uppercase"
              >
                {weekday}
              </div>
            ))}
          </div>

          <div className="bg-rule-soft grid grid-cols-7 gap-px overflow-hidden rounded-b-[var(--radius-panel)] border border-ice-border shadow-xs">
            {cells.map((cell) => {
              if (cell.day === null) {
                return (
                  <div
                    key={cell.key}
                    aria-hidden="true"
                    className="bg-porcelain/70 min-h-36"
                  />
                );
              }

              const daySchedules = schedulesByDate.get(cell.dateKey) ?? [];

              return (
                <div key={cell.key} className="bg-sheet min-h-36 p-2 transition-colors hover:bg-porcelain/50">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-[11.5px] font-semibold tabular-nums ${
                        cell.dateKey === todayKey
                          ? 'bg-cobalt text-white'
                          : 'text-ink-secondary'
                      }`}
                    >
                      {cell.day}
                    </span>

                    {daySchedules.length > 0 && (
                      <span className="text-ink-subtle text-[10px] font-medium">
                        {daySchedules.length}{' '}
                        {daySchedules.length === 1 ? 'case' : 'cases'}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {daySchedules.slice(0, 3).map((schedule) => (
                      <Link
                        key={schedule.id}
                        href={`/schedules/${schedule.id}`}
                        title={`${schedule.procedure} — ${schedule.surgeon?.name || 'Unassigned'}`}
                        className="border-ice-border hover:border-cobalt/35 hover:bg-cobalt-soft/25 block space-y-1.5 rounded-[10px] border bg-white p-2 text-[11px] shadow-xs transition-colors"
                      >
                        <p className="text-midnight line-clamp-2 font-semibold">
                          {schedule.procedure}
                        </p>

                        <p className="text-ink-muted font-mono text-[10px] tabular-nums">
                          {formatTime(schedule.startTime)} –{' '}
                          {formatTime(schedule.endTime)}
                        </p>

                        <p className="text-ink-secondary truncate">
                          {schedule.surgeon?.name || 'Unassigned'}
                        </p>

                        <p className="text-ink-muted truncate text-[10px]">
                          OT: {schedule.otRoom?.name || 'Unassigned'}
                        </p>

                        <div className="flex flex-wrap gap-1">
                          <ScheduleStatusBadge status={schedule.status} />
                          <SchedulePriorityBadge priority={schedule.priority} />
                        </div>
                      </Link>
                    ))}

                    {daySchedules.length > 3 && (
                      <p className="text-ink-muted px-1 text-[11px] font-medium">
                        +{daySchedules.length - 3} more · See list view
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {(schedules.length === 0 ||
        ![...schedulesByDate.keys()].some((dateKey) =>
          dateKey.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`),
        )) && (
        <p className="text-ink-muted rounded-[var(--radius-panel)] border border-dashed border-ice-border bg-porcelain/60 px-4 py-6 text-[12.5px]">
          No procedures are scheduled in this month. Use the month controls to
          review another period.
        </p>
      )}
    </section>
  );
}
