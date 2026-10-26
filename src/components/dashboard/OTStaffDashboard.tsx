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

type StaffRole = 'SURGEON' | 'NURSE' | 'ANESTHETIST' | 'TECHNICIAN' | 'OTHER';

interface StaffAssignment {
  id: string;
  role: StaffRole;
  assignedAt: string;
  schedule: {
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

function formatLabel(value: string) {
  return value.replaceAll('_', ' ');
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

export function OTStaffDashboard({ userName }: { userName: string }) {
  const [assignments, setAssignments] = useState<StaffAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadAssignments() {
      try {
        const data = await apiClient.get<StaffAssignment[]>(
          '/api/me/staff-schedules',
        );

        if (!cancelled) {
          setAssignments(data);
          setError('');
        }
      } catch (caught: unknown) {
        if (!cancelled) {
          setError(
            caught instanceof ApiClientError
              ? caught.message
              : 'Unable to load your staff assignments.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadAssignments();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <LoadingState message="Loading your staff dashboard..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  const openAssignments = assignments.filter(
    ({ schedule }) =>
      schedule.status !== 'COMPLETED' && schedule.status !== 'CANCELLED',
  );

  const inProgressCount = assignments.filter(
    ({ schedule }) => schedule.status === 'IN_PROGRESS',
  ).length;

  const highPriorityCount = assignments.filter(
    ({ schedule }) =>
      schedule.priority === 'URGENT' || schedule.priority === 'EMERGENCY',
  ).length;

  const metrics = [
    {
      label: 'Total assignments',
      value: assignments.length,
      description: 'Assigned procedures',
    },
    {
      label: 'Open assignments',
      value: openAssignments.length,
      description: 'Not finished or cancelled',
    },
    {
      label: 'In progress',
      value: inProgressCount,
      description: 'Operating now',
    },
    {
      label: 'Urgent or emergency',
      value: highPriorityCount,
      description: 'Priority cases',
    },
  ];

  const sortedAssignments = [...assignments].sort(
    (a, b) => Date.parse(a.schedule.startTime) - Date.parse(b.schedule.startTime),
  );

  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-4 rounded-[var(--radius-xl)] border border-border-strong bg-surface p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
            Operating theatre workspace
          </p>

          <h1 className="mt-2 text-2xl font-bold text-foreground">
            Welcome, {userName}
          </h1>

          <p className="mt-2 text-sm text-foreground-secondary">
            Review your assigned procedures, responsibilities, and theatre
            schedules.
          </p>
        </div>

        <div className="shrink-0 rounded-[var(--radius-xl)] border border-border-strong bg-surface-muted p-4">
          <p className="text-xs text-foreground-muted">Assigned procedures</p>

          <p className="mt-1 tabular-nums text-3xl font-bold text-foreground">
            {assignments.length}
          </p>
        </div>
      </header>

      <section
        aria-label="Assignment summary"
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
          <h2 className="text-lg font-bold text-foreground">My procedure assignments</h2>

          <p className="mt-1 text-sm text-foreground-secondary">
            Procedures linked to your staff account, including completed
            assignments.
          </p>
        </div>

        {sortedAssignments.length === 0 ? (
          <EmptyState
            title="No assignments found"
            description="Procedures assigned to your staff account will appear here when available."
          />
        ) : (
          <div className="space-y-3">
            {sortedAssignments.map(({ id, role, schedule }) => (
              <Card key={id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground">
                      {schedule.procedure}
                    </h3>

                    <p className="mt-1 text-sm text-foreground-secondary">
                      {schedule.department.name} · {schedule.otRoom.name}
                    </p>

                    <dl className="mt-3 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
                      <div className="grid gap-1">
                        <dt className="text-xs text-foreground-muted">Patient</dt>

                        <dd className="font-medium text-foreground">
                          {schedule.patient.name}
                        </dd>

                        <dd className="text-xs text-foreground-muted">
                          {schedule.patient.patientCode}
                        </dd>
                      </div>

                      <div className="grid gap-1">
                        <dt className="text-xs text-foreground-muted">Your assignment</dt>

                        <dd className="font-medium text-foreground">
                          {formatLabel(role)}
                        </dd>
                      </div>

                      <div className="grid gap-1">
                        <dt className="text-xs text-foreground-muted">Scheduled date</dt>

                        <dd className="font-medium text-foreground">
                          {formatDate(schedule.scheduledDate)}
                        </dd>
                      </div>

                      <div className="grid gap-1">
                        <dt className="text-xs text-foreground-muted">Procedure time</dt>

                        <dd className="font-medium text-foreground">
                          {formatTime(schedule.startTime)} –{' '}
                          {formatTime(schedule.endTime)}
                        </dd>
                      </div>

                      <div className="grid gap-1">
                        <dt className="text-xs text-foreground-muted">Theatre code</dt>

                        <dd className="font-medium text-foreground">
                          {schedule.otRoom.code}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
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
