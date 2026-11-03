'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';
import {
  SchedulePriorityBadge,
  ScheduleStatusBadge,
} from '@/components/schedules/ScheduleStatusBadge';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';

type Schedule = {
  id: string;
  procedure: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status:
    | 'SCHEDULED'
    | 'CONFIRMED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'DELAYED';
  priority: 'ELECTIVE' | 'URGENT' | 'EMERGENCY';
  patient?: {
    name: string;
    patientCode: string;
  };
  otRoom?: {
    name: string;
  };
  surgeon?: {
    name: string;
  };
};

type ScheduleFilter = 'TODAY' | 'UPCOMING' | 'ALL';

const statusRail: Record<Schedule['status'], string> = {
  IN_PROGRESS: 'bg-danger',
  DELAYED: 'bg-warning',
  CONFIRMED: 'bg-primary',
  SCHEDULED: 'bg-border-strong',
  COMPLETED: 'bg-success',
  CANCELLED: 'bg-border-strong/50',
};

const filters: { key: ScheduleFilter; label: string }[] = [
  { key: 'TODAY', label: 'Today' },
  { key: 'UPCOMING', label: 'Upcoming' },
  { key: 'ALL', label: 'All' },
];

function timeOf(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function dateOf(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short' })
    .format(date)
    .toUpperCase();
}

/**
 * RecentSchedulesList — the case board.
 *
 * An agenda, not a table: each case is a ruled row with a status rail down its
 * left edge, a tabular time gutter so a day's list lines up vertically, and the
 * clinical detail in the middle. Finished and cancelled cases drop to the foot
 * of the list and recede visually; anything in theatre carries a red rail.
 */
export function RecentSchedulesList() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<ScheduleFilter>('TODAY');

  const [refreshKey, setRefreshKey] = useState(0);

  const fetchSchedules = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadSchedules() {
      try {
        setError(null);
        const data = await apiClient.get<Schedule[]>('/api/schedules');

        if (!cancelled) {
          setSchedules(data || []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch schedules:', err);
          setError('Failed to load schedules');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadSchedules();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const sortedSchedules = [...schedules].sort((a, b) => {
    const priorityOrder = {
      EMERGENCY: 0,
      URGENT: 1,
      ELECTIVE: 2,
    };

    const activeOrder = (status: Schedule['status']) =>
      status === 'IN_PROGRESS' ? 0 : 1;

    const aTerminal = a.status === 'COMPLETED' || a.status === 'CANCELLED';
    const bTerminal = b.status === 'COMPLETED' || b.status === 'CANCELLED';

    if (aTerminal !== bTerminal) {
      return aTerminal ? 1 : -1;
    }

    if (!aTerminal && activeOrder(a.status) !== activeOrder(b.status)) {
      return activeOrder(a.status) - activeOrder(b.status);
    }

    if (!aTerminal && priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }

    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });

  const toLocalDateKey = (value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const now = new Date();

  const todayKey = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');

  const filteredSchedules = sortedSchedules.filter((schedule) => {
    const scheduleDate = toLocalDateKey(schedule.scheduledDate);

    if (activeFilter === 'ALL') return true;

    if (activeFilter === 'TODAY') {
      return scheduleDate === todayKey;
    }

    return (
      scheduleDate > todayKey &&
      schedule.status !== 'COMPLETED' &&
      schedule.status !== 'CANCELLED'
    );
  });

  return (
    <section
      aria-labelledby="case-board-title"
      className="border border-border"
    >
      <div className="border-border flex flex-wrap items-end justify-between gap-3 border-b px-4 py-3.5 sm:px-5">
        <div>
          <p className="eyebrow">Case list</p>
          <h2
            id="case-board-title"
            className="text-foreground mt-1.5 text-base font-semibold tracking-tight"
          >
            Surgical schedule
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="border-border bg-surface-subtle flex border"
            role="group"
            aria-label="Filter schedules"
          >
            {filters.map((filter) => {
              const isActive = activeFilter === filter.key;

              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setActiveFilter(filter.key)}
                  aria-pressed={isActive}
                  className={`border-border -ml-px first:ml-0 border-l px-3 py-1.5 font-mono text-[10px] font-semibold tracking-[0.14em] uppercase transition-colors first:border-l-0 ${
                    isActive
                      ? 'bg-foreground text-foreground-inverse'
                      : 'text-foreground-muted hover:bg-surface hover:text-foreground'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          <span className="text-foreground-muted font-mono text-[10px] tracking-[0.14em] uppercase">
            {isLoading ? '…' : filteredSchedules.length}
          </span>

          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              fetchSchedules();
            }}
            className="text-primary hover:text-primary-hover font-mono text-[10px] font-semibold tracking-[0.14em] uppercase transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-surface">
          <LoadingState message="Loading surgical schedules..." />
        </div>
      ) : error ? (
        <div className="bg-surface">
          <ErrorState message={error} onRetry={fetchSchedules} />
        </div>
      ) : filteredSchedules.length === 0 ? (
        <div className="bg-surface">
          <EmptyState
            title="No cases on the board"
            description={
              activeFilter === 'TODAY'
                ? 'No procedures are scheduled for today.'
                : activeFilter === 'UPCOMING'
                  ? 'No upcoming procedures found.'
                  : 'No procedures are currently available.'
            }
          />
        </div>
      ) : (
        <ul className="bg-border divide-y divide-border">
          {filteredSchedules.map((schedule) => {
            const terminal =
              schedule.status === 'COMPLETED' ||
              schedule.status === 'CANCELLED';

            return (
              <li key={schedule.id} className="bg-surface">
                <Link
                  href={`/schedules/${schedule.id}`}
                  className={`group hover:bg-surface-subtle relative flex flex-col gap-3 py-3.5 pr-4 pl-5 transition-colors sm:flex-row sm:items-center sm:gap-5 ${
                    terminal ? 'opacity-65' : ''
                  }`}
                >
                  <span
                    className={`absolute top-0 bottom-0 left-0 w-[3px] ${statusRail[schedule.status]}`}
                    aria-hidden="true"
                  />

                  <div className="shrink-0 sm:w-32">
                    <p className="text-foreground font-mono text-xs font-semibold tracking-tight tabular-nums">
                      {dateOf(schedule.scheduledDate)} ·{' '}
                      {timeOf(schedule.startTime)}
                    </p>
                    <p className="text-foreground-muted mt-0.5 font-mono text-[11px] tabular-nums">
                      → {timeOf(schedule.endTime)}
                    </p>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate text-sm font-semibold">
                      {schedule.procedure}
                    </p>

                    <p className="text-foreground-muted mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
                      {schedule.patient ? (
                        <span>
                          {schedule.patient.name} ·{' '}
                          {schedule.patient.patientCode}
                        </span>
                      ) : null}
                      {schedule.otRoom?.name ? (
                        <span>Room {schedule.otRoom.name}</span>
                      ) : null}
                      {schedule.surgeon?.name ? (
                        <span>{schedule.surgeon.name}</span>
                      ) : null}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <SchedulePriorityBadge priority={schedule.priority} />
                    <ScheduleStatusBadge status={schedule.status} />
                    <span
                      aria-hidden="true"
                      className="text-foreground-subtle group-hover:text-primary font-mono text-xs transition-colors group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
