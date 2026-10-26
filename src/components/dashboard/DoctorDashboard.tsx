'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient, ApiClientError } from '@/lib/api/client';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';

type ScheduleStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DELAYED';

type SchedulePriority = 'ELECTIVE' | 'URGENT' | 'EMERGENCY';

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

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
  }).format(date);
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

interface StatusBadgeProps {
  status: ScheduleStatus;
  className?: string;
}

function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  switch (status) {
    case 'IN_PROGRESS':
      return (
        <Badge variant="warning" className={className}>
          In Progress
        </Badge>
      );
    case 'CONFIRMED':
      return (
        <Badge variant="info" className={className}>
          Confirmed
        </Badge>
      );
    case 'COMPLETED':
      return (
        <Badge variant="success" className={className}>
          Completed
        </Badge>
      );
    case 'CANCELLED':
      return (
        <Badge variant="danger" className={className}>
          Cancelled
        </Badge>
      );
    case 'DELAYED':
      return (
        <Badge variant="warning" className={className}>
          Delayed
        </Badge>
      );
    default:
      return (
        <Badge variant="neutral" className={className}>
          Scheduled
        </Badge>
      );
  }
}

interface PriorityBadgeProps {
  priority: SchedulePriority;
  className?: string;
}

function PriorityBadge({ priority, className = '' }: PriorityBadgeProps) {
  switch (priority) {
    case 'EMERGENCY':
      return (
        <Badge variant="danger" className={className}>
          Emergency
        </Badge>
      );
    case 'URGENT':
      return (
        <Badge variant="warning" className={className}>
          Urgent
        </Badge>
      );
    default:
      return (
        <Badge variant="neutral" className={className}>
          Elective
        </Badge>
      );
  }
}

export function DoctorDashboard({ userName }: { userName: string }) {
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadSchedules() {
      try {
        const data = await apiClient.get<DoctorSchedule[]>(
          '/api/me/schedules',
        );

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
    return <LoadingState message="Loading your surgical schedule..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  const activeSchedules = schedules
    .filter(
      (schedule) =>
        schedule.status !== 'COMPLETED' &&
        schedule.status !== 'CANCELLED',
    )
    .sort(
      (a, b) => Date.parse(a.startTime) - Date.parse(b.startTime),
    );

  const completedCount = schedules.filter(
    (schedule) => schedule.status === 'COMPLETED',
  ).length;

  const urgentCount = schedules.filter(
    (schedule) =>
      schedule.priority === 'URGENT' ||
      schedule.priority === 'EMERGENCY',
  ).length;

  const metrics = [
    {
      label: 'Assigned procedures',
      value: schedules.length,
      description: 'Current workload',
    },
    {
      label: 'Active and scheduled',
      value: activeSchedules.length,
      description: 'Not finished or cancelled',
    },
    {
      label: 'In progress',
      value: schedules.filter(
        (schedule) => schedule.status === 'IN_PROGRESS',
      ).length,
      description: 'Operating now',
    },
    {
      label: 'Completed',
      value: completedCount,
      description: 'Finished procedures',
    },
  ];

  const nextSchedule = activeSchedules[0];

  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-4 rounded-[var(--radius-xl)] border border-border-strong bg-surface p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
            Clinical workspace
          </p>

          <h1 className="mt-2 text-2xl font-bold text-foreground">
            Welcome, {userName}
          </h1>

          <p className="mt-2 text-sm text-foreground-secondary">
            Review your assigned procedures, workload, and surgical schedule.
          </p>
        </div>

        <div className="shrink-0 rounded-[var(--radius-xl)] border border-border-strong bg-surface-muted p-4">
          <p className="text-xs text-foreground-muted">
            Urgent or emergency priority
          </p>

          <p className="mt-1 tabular-nums text-3xl font-bold text-foreground">
            {urgentCount}
          </p>
        </div>
      </header>

      <section
        aria-label="Doctor schedule summary"
        className="grid grid-cols-2 gap-4 sm:grid-cols-4"
      >
        {metrics.map((metric) => (
          <Card key={metric.label} className="p-4">
            <p className="text-xs text-foreground-muted">{metric.label}</p>

            <p className="mt-2 tabular-nums text-2xl font-bold text-foreground">
              {metric.value}
            </p>

            <p className="mt-0.5 text-[11px] text-foreground-subtle">
              {metric.description}
            </p>
          </Card>
        ))}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Next active procedure</h2>

          <p className="mt-1 text-sm text-foreground-secondary">
            Your next procedure that has not been completed or cancelled.
          </p>
        </div>

        {nextSchedule ? (
          <Card className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {nextSchedule.procedure}
                </h3>

                <p className="mt-1 text-sm text-foreground-secondary">
                  {nextSchedule.department.name}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <PriorityBadge priority={nextSchedule.priority} />
                <StatusBadge status={nextSchedule.status} />
              </div>
            </div>

            <dl className="mt-5 grid gap-4 border-t border-border-strong pt-4 text-sm sm:grid-cols-4">
              <div className="grid gap-1">
                <dt className="text-xs text-foreground-muted">Scheduled date</dt>

                <dd className="font-medium text-foreground">
                  {formatDate(nextSchedule.scheduledDate)}
                </dd>
              </div>

              <div className="grid gap-1">
                <dt className="text-xs text-foreground-muted">Procedure time</dt>

                <dd className="font-medium text-foreground">
                  {formatTime(nextSchedule.startTime)} –{' '}
                  {formatTime(nextSchedule.endTime)}
                </dd>
              </div>

              <div className="grid gap-1">
                <dt className="text-xs text-foreground-muted">Patient</dt>

                <dd className="font-medium text-foreground">
                  {nextSchedule.patient.name}
                </dd>

                <dd className="text-xs text-foreground-muted">
                  {nextSchedule.patient.patientCode}
                </dd>
              </div>

              <div className="grid gap-1">
                <dt className="text-xs text-foreground-muted">Operating theatre</dt>

                <dd className="font-medium text-foreground">
                  {nextSchedule.otRoom.name}
                </dd>

                <dd className="text-xs text-foreground-muted">
                  {nextSchedule.otRoom.code}
                </dd>
              </div>
            </dl>

            <div className="mt-4 flex justify-end">
              <Link
                href={`/schedules/${nextSchedule.id}`}
                className="inline-flex items-center gap-1.5 rounded-md border border-border-strong bg-primary px-4 py-2 text-sm font-medium text-foreground-inverse transition-colors hover:bg-primary-hoverfocus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Open schedule
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </Card>
        ) : (
          <EmptyState
            title="No active procedures"
            description="You currently have no procedures awaiting completion."
          />
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">My surgical schedule</h2>

          <p className="mt-1 text-sm text-foreground-secondary">
            Procedures assigned to your doctor account.
          </p>
        </div>

        {schedules.length === 0 ? (
          <EmptyState
            title="No assigned procedures"
            description="Procedures assigned to you will appear here."
          />
        ) : (
          <div className="space-y-3">
            {[...schedules]
              .sort(
                (a, b) => Date.parse(a.startTime) - Date.parse(b.startTime),
              )
              .map((schedule) => (
                <Card key={schedule.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground">
                        {schedule.procedure}
                      </h3>

                      <p className="mt-1 text-sm text-foreground-secondary">
                        {schedule.department.name} · {schedule.otRoom.name} (
                        {schedule.otRoom.code})
                      </p>

                      <p className="mt-1 text-sm text-foreground-muted tabular-nums">
                        {schedule.patient.name} ({schedule.patient.patientCode})
                        · {formatDate(schedule.scheduledDate)} ·{' '}
                        {formatTime(schedule.startTime)} –{' '}
                        {formatTime(schedule.endTime)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <PriorityBadge priority={schedule.priority} />
                      <StatusBadge status={schedule.status} />

                      <Link
                        href={`/schedules/${schedule.id}`}
                        className="text-sm font-semibold text-primary underline-offset-2 hover:underlinefocus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        View schedule →
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        )}
      </section>
    </main>
  );
}
