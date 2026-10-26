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
          <h2 className="text-lg font-semibold text-foreground">
            {formatMonth(visibleMonth)}
          </h2>

          <p className="mt-1 text-xs text-foreground-muted">
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
            className="rounded-md border border-border-strong px-3 py-2 text-sm hover:bg-surface-hoverfocus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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
            className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-surface-hover"
          >
            Today
          </button>

          <button
            type="button"
            onClick={() =>
              setVisibleMonth(new Date(Date.UTC(year, month + 1, 1)))
            }
            aria-label="Next month"
            className="rounded-md border border-border-strong px-3 py-2 text-sm hover:bg-surface-hoverfocus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            →
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl">
        <div className="min-w-[980px]">
          <div className="grid grid-cols-7 border-b border-border bg-surface-muted">
            {WEEKDAYS.map((weekday) => (
              <div
                key={weekday}
                className="px-3 py-3 text-center text-xs font-semibold text-foreground-muted"
              >
                {weekday}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px border border-border bg-border">
            {cells.map((cell) => {
              if (cell.day === null) {
                return (
                  <div
                    key={cell.key}
                    aria-hidden="true"
                    className="min-h-36 bg-surface-subtle"
                  />
                );
              }

              const daySchedules = schedulesByDate.get(cell.dateKey) ?? [];

              return (
                <div
                  key={cell.key}
                  className="min-h-36 bg-surface p-2"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                        cell.dateKey === todayKey
                          ? 'bg-primary text-foreground-inverse'
                          : 'text-foreground-secondary'
                      }`}
                    >
                      {cell.day}
                    </span>

                    {daySchedules.length > 0 && (
                      <span className="text-[10px] font-medium text-foreground-subtle">
                        {daySchedules.length} {daySchedules.length === 1 ? 'case' : 'cases'}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {daySchedules.slice(0, 3).map((schedule) => (
                      <Link
                        key={schedule.id}
                        href={`/schedules/${schedule.id}`}
                        title={`${schedule.procedure} — ${schedule.surgeon?.name || 'Unassigned'}`}
                        className="block space-y-1.5 rounded-md border border-border p-2 text-xs transition-colors hover:border-border-strong hover:bg-surface-hover"
                      >
                        <p className="line-clamp-2 font-semibold text-foreground">
                          {schedule.procedure}
                        </p>

                        <p className="font-mono text-foreground-muted">
                          {formatTime(schedule.startTime)} –{' '}
                          {formatTime(schedule.endTime)}
                        </p>

                        <p className="truncate text-foreground-secondary">
                          {schedule.surgeon?.name || 'Unassigned'}
                        </p>

                        <p className="truncate text-foreground-muted">
                          OT: {schedule.otRoom?.name || 'Unassigned'}
                        </p>

                        <div className="flex flex-wrap gap-1">
                          <ScheduleStatusBadge status={schedule.status} />
                          <SchedulePriorityBadge priority={schedule.priority} />
                        </div>
                      </Link>
                    ))}

                    {daySchedules.length > 3 && (
                      <p className="px-1 text-xs font-medium text-foreground-muted">
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

      {schedules.length === 0 && (
        <p className="text-sm text-foreground-muted">
          No schedules match the current filters. Adjust the filters or navigate
          to another month to explore the calendar.
        </p>
      )}
    </section>
  );
}
