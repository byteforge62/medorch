'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import type { ScheduleItem } from './ScheduleCard';
import {
  ScheduleStatusBadge,
  SchedulePriorityBadge,
} from './ScheduleStatusBadge';

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
          <h2 className="text-foreground text-lg font-semibold">
            {formatMonth(visibleMonth)}
          </h2>

          <p className="text-foreground-muted mt-1 text-xs">
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
            className="border-border-strong hover:bg-surface-muted focus-visible:outline-primary rounded-md border px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
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
            className="border-border-strong hover:bg-surface-muted focus-visible:outline-primary rounded-md border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Today
          </button>

          <button
            type="button"
            onClick={() =>
              setVisibleMonth(new Date(Date.UTC(year, month + 1, 1)))
            }
            aria-label="Next month"
            className="border-border-strong hover:bg-surface-muted focus-visible:outline-primary rounded-md border px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            →
          </button>
        </div>
      </div>

      <section className="space-y-5 md:hidden" aria-label="Schedule agenda">
        {[...schedulesByDate.entries()]
          .filter(([dateKey]) =>
            dateKey.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`),
          )
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([dateKey, daySchedules]) => (
            <section key={dateKey} aria-labelledby={`agenda-${dateKey}`}>
              <div className="border-border-strong flex items-baseline justify-between border-b pb-2">
                <h3
                  id={`agenda-${dateKey}`}
                  className="text-foreground font-mono text-sm font-semibold tabular-nums"
                >
                  {new Intl.DateTimeFormat('en-IN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    timeZone: 'UTC',
                  }).format(new Date(`${dateKey}T00:00:00Z`))}
                </h3>
                <span className="text-foreground-muted font-mono text-[11px] tabular-nums">
                  {daySchedules.length}{' '}
                  {daySchedules.length === 1 ? 'case' : 'cases'}
                </span>
              </div>
              <div className="divide-border divide-y">
                {daySchedules.map((schedule) => (
                  <Link
                    key={schedule.id}
                    href={`/schedules/${schedule.id}`}
                    className="focus-visible:outline-primary grid min-h-14 grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-3 py-3 focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <span className="text-foreground-secondary font-mono text-xs tabular-nums">
                      {formatTime(schedule.startTime)}
                    </span>
                    <span className="min-w-0">
                      <span className="text-foreground block truncate text-sm font-semibold">
                        {schedule.procedure}
                      </span>
                      <span className="text-foreground-muted mt-0.5 block truncate text-xs">
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
          <p className="text-foreground-muted border-border border px-4 py-5 text-sm">
            No schedules match the current filters. Adjust the filters or
            navigate to another month.
          </p>
        )}
      </section>

      <div className="hidden overflow-x-auto md:block">
        <div className="min-w-[980px]">
          <div className="border-border bg-surface-muted grid grid-cols-7 border-b">
            {WEEKDAYS.map((weekday) => (
              <div
                key={weekday}
                className="text-foreground-muted px-3 py-3 text-center text-xs font-semibold"
              >
                {weekday}
              </div>
            ))}
          </div>

          <div className="border-border bg-border grid grid-cols-7 gap-px border">
            {cells.map((cell) => {
              if (cell.day === null) {
                return (
                  <div
                    key={cell.key}
                    aria-hidden="true"
                    className="bg-surface-subtle min-h-36"
                  />
                );
              }

              const daySchedules = schedulesByDate.get(cell.dateKey) ?? [];

              return (
                <div key={cell.key} className="bg-surface min-h-36 p-2">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-none text-xs font-semibold ${
                        cell.dateKey === todayKey
                          ? 'bg-primary text-foreground-inverse'
                          : 'text-foreground-secondary'
                      }`}
                    >
                      {cell.day}
                    </span>

                    {daySchedules.length > 0 && (
                      <span className="text-foreground-subtle text-[10px] font-medium">
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
                        className="border-border hover:border-border-strong hover:bg-surface-hover block space-y-1.5 rounded-md border p-2 text-xs transition-colors"
                      >
                        <p className="text-foreground line-clamp-2 font-semibold">
                          {schedule.procedure}
                        </p>

                        <p className="text-foreground-muted font-mono">
                          {formatTime(schedule.startTime)} –{' '}
                          {formatTime(schedule.endTime)}
                        </p>

                        <p className="text-foreground-secondary truncate">
                          {schedule.surgeon?.name || 'Unassigned'}
                        </p>

                        <p className="text-foreground-muted truncate">
                          OT: {schedule.otRoom?.name || 'Unassigned'}
                        </p>

                        <div className="flex flex-wrap gap-1">
                          <ScheduleStatusBadge status={schedule.status} />
                          <SchedulePriorityBadge priority={schedule.priority} />
                        </div>
                      </Link>
                    ))}

                    {daySchedules.length > 3 && (
                      <p className="text-foreground-muted px-1 text-xs font-medium">
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
        <p className="text-foreground-muted border-border border px-4 py-5 text-sm">
          No procedures are scheduled in this month. Use the month controls to
          review another period.
        </p>
      )}
    </section>
  );
}
