'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient, ApiClientError } from '@/lib/api/client';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  SchedulePriorityBadge,
  ScheduleStatusBadge,
} from '@/components/schedules/ScheduleStatusBadge';
import type {
  SchedulePriority,
  ScheduleStatus,
} from '@/components/schedules/ScheduleStatusBadge';

interface DoctorSchedule {
  id: string;
  procedure: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status: ScheduleStatus;
  priority: SchedulePriority;
  patient: {
    name: string;
    patientCode: string;
  };
  department: {
    name: string;
  };
  otRoom: {
    name: string;
    code: string;
  };
}

const railTone: Record<ScheduleStatus, string> = {
  IN_PROGRESS: 'bg-danger',
  DELAYED: 'bg-warning',
  CONFIRMED: 'bg-primary',
  SCHEDULED: 'bg-border-strong',
  COMPLETED: 'bg-success',
  CANCELLED: 'bg-border-strong/50',
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
  }).format(date);
}

function localTodayKey() {
  const now = new Date();

  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
}

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Time unavailable';
  }

  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * DoctorDashboard — the clinical day plan.
 *
 * The doctor's question is "what am I doing next, and what follows it?", so
 * the screen is built around one focus panel for the next case and a single
 * time-ordered run sheet beneath it. Facts live in a two-column spec list on
 * the focus panel instead of a row of metric cards. This layout deliberately
 * shares no structure with the administrator control room.
 */
export function DoctorDashboard({ userName }: { userName: string }) {
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadSchedules() {
      try {
        const data = await apiClient.get<DoctorSchedule[]>('/api/me/schedules');

        if (!cancelled) {
          setSchedules(data);
          setError('');
        }
      } catch (caught: unknown) {
        if (!cancelled) {
          setError(
            caught instanceof ApiClientError
              ? caught.message
              : 'Unable to load your assigned procedures.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSchedules();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <LoadingState message="Loading your surgical schedule…" />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  const activeSchedules = schedules
    .filter(
      (schedule) =>
        schedule.status !== 'COMPLETED' && schedule.status !== 'CANCELLED',
    )
    .sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime));

  const nextSchedule = activeSchedules[0];
  const inTheatre = schedules.filter(
    (schedule) => schedule.status === 'IN_PROGRESS',
  ).length;
  const completedCount = schedules.filter(
    (schedule) => schedule.status === 'COMPLETED',
  ).length;
  const urgentCount = schedules.filter(
    (schedule) =>
      schedule.priority === 'URGENT' || schedule.priority === 'EMERGENCY',
  ).length;

  const isTerminal = (schedule: DoctorSchedule) =>
    schedule.status === 'COMPLETED' || schedule.status === 'CANCELLED';

  const sortedSchedules = [...schedules].sort((a, b) => {
    const terminalDelta = Number(isTerminal(a)) - Number(isTerminal(b));

    if (terminalDelta !== 0) return terminalDelta;

    return Date.parse(a.startTime) - Date.parse(b.startTime);
  });

  const todayKey = localTodayKey();

  return (
    <main className="space-y-7">
      <PageHeader
        eyebrow="Clinical workspace"
        title="Day plan"
        meta={userName}
        description="Your assigned procedures in time order — next case first, finished cases pushed to the foot of the list."
        actions={
          <div className="border-border bg-surface flex divide-x divide-border overflow-hidden rounded-[var(--radius-panel)] border shadow-sm">
            {[
              { label: 'Upcoming', value: activeSchedules.length },
              { label: 'In theatre', value: inTheatre },
              { label: 'Priority', value: urgentCount },
              { label: 'Done', value: completedCount },
            ].map((item) => (
              <div key={item.label} className="px-4 py-2 text-center">
                <p className="text-foreground font-mono text-xl leading-none font-semibold tabular-nums">
                  {item.value}
                </p>
                <p className="eyebrow mt-1.5">{item.label}</p>
              </div>
            ))}
          </div>
        }
      />

      {/* Focus: the next case, split panel with a spec list */}
      <section aria-labelledby="next-case-title" className="panel-flush">
        <div className="border-border flex items-center justify-between gap-3 border-b bg-surface-subtle px-4 py-2.5 sm:px-5">
          <p className="eyebrow">Next case</p>
          {nextSchedule ? (
            <p className="text-foreground-muted font-mono text-[10px] tracking-[0.14em] uppercase">
              {nextSchedule.scheduledDate.slice(0, 10) === localTodayKey()
                ? 'Today'
                : formatDate(nextSchedule.scheduledDate)}
            </p>
          ) : null}
        </div>

        {nextSchedule ? (
          <div className="grid bg-surface lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <div className="border-border relative border-b p-5 sm:p-6 lg:border-r lg:border-b-0">
              <span
                className={`absolute top-0 bottom-0 left-0 w-1 ${railTone[nextSchedule.status]}`}
                aria-hidden="true"
              />

              <div className="flex flex-wrap items-center gap-2 pl-3">
                <SchedulePriorityBadge priority={nextSchedule.priority} />
                <ScheduleStatusBadge status={nextSchedule.status} />
              </div>

              <h2
                id="next-case-title"
                className="text-foreground mt-3 pl-3 text-[clamp(1.35rem,2.4vw,1.9rem)] leading-tight font-semibold tracking-[-0.02em]"
              >
                {nextSchedule.procedure}
              </h2>

              <p className="text-foreground-muted mt-2 pl-3 text-sm">
                {nextSchedule.department.name}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3 pl-3">
                <Link
                  href={`/schedules/${nextSchedule.id}`}
                  className="bg-primary hover:bg-primary-hover inline-flex items-center gap-2 rounded-[var(--radius-control)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors"
                >
                  Open schedule
                  <span aria-hidden="true">→</span>
                </Link>

                <span className="text-foreground-muted font-mono text-[11px] tracking-[0.12em] uppercase">
                  Case record below
                </span>
              </div>
            </div>

            <dl className="bg-surface divide-y divide-border text-sm">
              {[
                {
                  term: 'Theatre time',
                  detail: `${formatTime(nextSchedule.startTime)} – ${formatTime(nextSchedule.endTime)}`,
                  meta: formatDate(nextSchedule.scheduledDate),
                },
                {
                  term: 'Patient',
                  detail: nextSchedule.patient.name,
                  meta: nextSchedule.patient.patientCode,
                },
                {
                  term: 'Operating theatre',
                  detail: nextSchedule.otRoom.name,
                  meta: nextSchedule.otRoom.code,
                },
              ].map((item) => (
                <div key={item.term} className="px-5 py-4">
                  <dt className="eyebrow">{item.term}</dt>
                  <dd className="text-foreground mt-1.5 font-medium">
                    {item.detail}
                  </dd>
                  <dd className="text-foreground-muted mt-0.5 font-mono text-[11px] tabular-nums">
                    {item.meta}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ) : (
          <div className="bg-surface p-5">
            <EmptyState
              title="No active procedures"
              description="You currently have no procedures awaiting completion."
            />
          </div>
        )}
      </section>

      {/* Run sheet */}
      <section aria-labelledby="run-sheet-title" className="panel-flush">
        <div className="border-border flex flex-wrap items-end justify-between gap-3 border-b px-4 py-3.5 sm:px-5">
          <div>
            <p className="eyebrow">Assigned list</p>
            <h2
              id="run-sheet-title"
              className="text-foreground mt-1.5 text-base font-semibold tracking-tight"
            >
              My surgical schedule
            </h2>
          </div>

          <span className="text-foreground-muted font-mono text-[10px] tracking-[0.14em] uppercase">
            {schedules.length} records
          </span>
        </div>

        {schedules.length === 0 ? (
          <div className="bg-surface">
            <EmptyState
              title="No assigned procedures"
              description="Procedures assigned to you will appear here."
            />
          </div>
        ) : (
          <ul className="bg-border divide-y divide-border">
            {sortedSchedules.map((schedule) => {
              const terminal =
                schedule.status === 'COMPLETED' ||
                schedule.status === 'CANCELLED';
              const isToday =
                schedule.scheduledDate.slice(0, 10) === todayKey;

              return (
                <li key={schedule.id} className="bg-surface">
                  <div
                    className={`relative flex flex-col gap-3 py-4 pr-4 pl-5 sm:flex-row sm:items-center sm:gap-5 ${
                      terminal ? 'opacity-65' : ''
                    }`}
                  >
                    <span
                      className={`absolute top-0 bottom-0 left-0 w-[3px] ${railTone[schedule.status]}`}
                      aria-hidden="true"
                    />

                    <div className="shrink-0 sm:w-44">
                      <p className="text-foreground font-mono text-xs font-semibold tabular-nums">
                        {formatDate(schedule.scheduledDate)}
                        {isToday ? (
                          <span className="text-primary ml-2">TODAY</span>
                        ) : null}
                      </p>
                      <p className="text-foreground-muted mt-0.5 font-mono text-[11px] tabular-nums">
                        {formatTime(schedule.startTime)} –{' '}
                        {formatTime(schedule.endTime)}
                      </p>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-foreground font-semibold">
                        {schedule.procedure}
                      </p>

                      <p className="text-foreground-muted mt-1 text-sm">
                        {schedule.patient.name} ({schedule.patient.patientCode}){' '}
                        · {schedule.department.name} · {schedule.otRoom.name} (
                        {schedule.otRoom.code})
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <SchedulePriorityBadge priority={schedule.priority} />
                      <ScheduleStatusBadge status={schedule.status} />

                      <Link
                        href={`/schedules/${schedule.id}`}
                        aria-label={`View schedule for ${schedule.procedure}`}
                        className="text-primary hover:text-primary-hover focus-visible:outline-ring ml-1 font-mono text-[11px] font-semibold tracking-[0.1em] uppercase underline-offset-4 hover:underline focus-visible:outline-2"
                      >
                        Open →
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
