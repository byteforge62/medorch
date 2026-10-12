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

function StatusBadge({ status }: { status: ScheduleStatus }) {
  switch (status) {
    case 'IN_PROGRESS':
      return <Badge variant="warning">In Progress</Badge>;
    case 'CONFIRMED':
      return <Badge variant="info">Confirmed</Badge>;
    case 'COMPLETED':
      return <Badge variant="success">Completed</Badge>;
    case 'CANCELLED':
      return <Badge variant="danger">Cancelled</Badge>;
    case 'DELAYED':
      return <Badge variant="warning">Delayed</Badge>;
    default:
      return <Badge variant="neutral">Scheduled</Badge>;
  }
}

function PriorityBadge({ priority }: { priority: SchedulePriority }) {
  switch (priority) {
    case 'EMERGENCY':
      return <Badge variant="danger">Emergency</Badge>;
    case 'URGENT':
      return <Badge variant="warning">Urgent</Badge>;
    default:
      return <Badge variant="neutral">Elective</Badge>;
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
    },
    {
      label: 'Open assignments',
      value: openAssignments.length,
    },
    {
      label: 'In progress',
      value: inProgressCount,
    },
    {
      label: 'Urgent or emergency',
      value: highPriorityCount,
    },
  ];

  const sortedAssignments = [...assignments].sort(
    (a, b) =>
      Date.parse(a.schedule.startTime) - Date.parse(b.schedule.startTime),
  );

  return (
    <main className="space-y-6">
      <header className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900">
        <div>
          <p className="text-xs font-semibold tracking-wider text-blue-600 uppercase dark:text-blue-400">
            Operating theatre workspace
          </p>

          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            Welcome, {userName}
          </h1>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Review your assigned procedures, responsibilities, and theatre
            schedules.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Your assigned procedures
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {assignments.length}
          </p>
        </div>
      </header>

      <section
        aria-label="Assignment summary"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {metric.label}
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
              {metric.value}
            </p>
          </Card>
        ))}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            My procedure assignments
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Procedures linked to your staff account, including completed
            assignments.
          </p>
        </div>

        {sortedAssignments.length === 0 ? (
          <EmptyState
            title="No assignments found"
            description="Procedures assigned to your staff account will appear here."
          />
        ) : (
          <div className="space-y-3">
            {sortedAssignments.map(({ id, role, schedule }) => (
              <Card key={id}>
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {schedule.procedure}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {schedule.department.name} · {schedule.otRoom.name}
                      </p>
                    </div>

                    <div className="grid gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Patient
                        </p>
                        <p className="mt-1 font-medium text-slate-900 dark:text-white">
                          {schedule.patient.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {schedule.patient.patientCode}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Your assignment
                        </p>
                        <p className="mt-1 font-medium text-slate-900 dark:text-white">
                          {formatLabel(role)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Scheduled date
                        </p>
                        <p className="mt-1 font-medium text-slate-900 dark:text-white">
                          {formatDate(schedule.scheduledDate)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Procedure time
                        </p>
                        <p className="mt-1 font-medium text-slate-900 dark:text-white">
                          {formatTime(schedule.startTime)} –{' '}
                          {formatTime(schedule.endTime)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Theatre code
                        </p>
                        <p className="mt-1 font-medium text-slate-900 dark:text-white">
                          {schedule.otRoom.code}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                    <PriorityBadge priority={schedule.priority} />
                    <StatusBadge status={schedule.status} />

                    <Link
                      href={`/schedules/${schedule.id}`}
                      className="text-sm font-semibold text-[var(--color-primary)] hover:underline"
                    >
                      View Schedule →
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
