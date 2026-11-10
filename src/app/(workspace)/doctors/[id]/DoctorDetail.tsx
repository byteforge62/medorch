'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from '@phosphor-icons/react';

import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import {
  SchedulePriorityBadge,
  ScheduleStatusBadge,
  type SchedulePriority,
  type ScheduleStatus,
} from '@/components/schedules/ScheduleStatusBadge';
import { apiClient, ApiClientError } from '@/lib/api/client';

interface DoctorSchedule {
  id: string;
  procedure: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status: string;
  priority: string;
  department: {
    id: string;
    name: string;
  };
  otRoom: {
    id: string;
    name: string;
    code: string;
  };
}

interface DoctorDetailRecord {
  id: string;
  userId: string;
  departmentId: string | null;
  specialization: string | null;
  licenseNumber: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    status: string;
  };
  department: {
    id: string;
    name: string;
  } | null;
  schedules: DoctorSchedule[];
}

function formatDate(value: string | null) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
  }).format(date);
}

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function datePlate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return { day: '—', month: '', year: '' };
  }

  return {
    day: new Intl.DateTimeFormat('en-IN', { day: '2-digit' }).format(date),
    month: new Intl.DateTimeFormat('en-IN', { month: 'short' }).format(date),
    year: new Intl.DateTimeFormat('en-IN', { year: 'numeric' }).format(date),
  };
}

function initials(name: string | null) {
  return (
    (name ?? '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'DR'
  );
}

function Detail({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-ink-muted text-[12px] font-medium">{label}</dt>
      <dd
        className={`text-ink mt-1 text-[13px] font-medium break-words ${
          mono ? 'font-mono text-[12px]' : ''
        }`}
      >
        {value || '—'}
      </dd>
    </div>
  );
}

export function DoctorDetail({ doctorId }: { doctorId: string }) {
  const [doctor, setDoctor] = useState<DoctorDetailRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function fetchDoctor() {
      try {
        const response = await apiClient.get<DoctorDetailRecord>(
          `/api/doctors/${doctorId}`,
        );

        if (!cancelled) setDoctor(response);
      } catch (fetchError) {
        if (!cancelled) {
          setError(
            fetchError instanceof ApiClientError
              ? fetchError.message
              : 'Failed to load doctor details.',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchDoctor();

    return () => {
      cancelled = true;
    };
  }, [doctorId]);

  if (loading) return <LoadingState message="Loading clinician record…" />;

  if (error || !doctor) {
    return (
      <main className="space-y-4">
        <Link
          href="/doctors"
          className="text-ink-muted hover:text-ink inline-flex items-center gap-1.5 text-[12px] font-medium"
        >
          <ArrowLeft size={13} weight="bold" aria-hidden="true" />
          Doctor directory
        </Link>
        <ErrorState message={error || 'Doctor record was not found.'} />
      </main>
    );
  }

  const upcomingish = doctor.schedules.filter(
    (schedule) => schedule.status !== 'CANCELLED',
  ).length;

  const clinicalContext = Array.from(
    new Set(
      [doctor.specialization, doctor.department?.name].filter(
        (value): value is string => Boolean(value),
      ),
    ),
  );

  return (
    <main className="space-y-6">
      <Link
        href="/doctors"
        className="text-ink-muted hover:text-ink inline-flex items-center gap-1.5 text-[12px] font-medium"
      >
        <ArrowLeft size={13} weight="bold" aria-hidden="true" />
        Doctor directory
        </Link>

      <header className="pb-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <span
              className="bg-primary-soft text-primary flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-[15px] font-semibold"
              aria-hidden="true"
            >
              {initials(doctor.user.name)}
            </span>
            <div className="min-w-0">
              <p className="text-pine text-[11px] font-semibold">
                Clinician record
              </p>
              <h1 className="display mt-1 text-[clamp(1.9rem,4vw,2.6rem)]">
                {doctor.user.name || 'Unnamed doctor'}
              </h1>
              <p className="text-ink-secondary mt-1.5 text-[13px]">
                {clinicalContext.length > 0
                  ? clinicalContext.join(' · ')
                  : 'Specialty not recorded'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge>{doctor.user.status.replaceAll('_', ' ')}</Badge>
            <span className="text-ink-secondary border-rule bg-sheet inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold">
              {doctor.schedules.length} case
              {doctor.schedules.length === 1 ? '' : 's'} on record
            </span>
          </div>
        </div>
      </header>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(16rem,0.68fr)_minmax(0,1.55fr)]">
        <section
          className="panel overflow-hidden"
          aria-labelledby="credentials-title"
        >
          <div className="border-rule-soft border-b px-5 py-3.5">
            <h2
              id="credentials-title"
              className="text-ink text-[13px] font-semibold"
            >
              Credentials and contact
            </h2>
            <p className="text-ink-muted mt-0.5 text-[11px]">
              The professional identity held on file.
            </p>
          </div>

          <dl className="space-y-4 px-5 py-4">
            <Detail label="Specialty" value={doctor.specialization} />
            <Detail label="Department" value={doctor.department?.name} />
            <Detail label="Medical licence" value={doctor.licenseNumber} mono />
            <Detail label="Email" value={doctor.user.email} />
            <Detail label="Phone" value={doctor.user.phone} />
          </dl>

          <dl className="border-rule-soft grid grid-cols-2 gap-3 border-t px-5 py-4">
            <Detail
              label="Profile created"
              value={formatDate(doctor.createdAt)}
            />
            <Detail label="Last updated" value={formatDate(doctor.updatedAt)} />
          </dl>

          <div className="border-rule-soft bg-surface-subtle border-t px-5 py-3">
            <p className="text-ink-subtle font-mono text-[9.5px] break-all">
              PROFILE {doctor.id}
            </p>
          </div>
        </section>

        <section
          className="panel-flush overflow-hidden"
          aria-labelledby="operating-list-title"
        >
          <div className="border-rule-soft flex flex-wrap items-end justify-between gap-2 border-b px-4 py-3.5">
            <div>
              <h2
                id="operating-list-title"
                className="text-ink text-[13px] font-semibold"
              >
                Operating list
              </h2>
              <p className="text-ink-muted mt-0.5 text-[11px]">
                Theatre procedures assigned to this clinician.
              </p>
            </div>
            <p className="text-ink-subtle font-mono text-[10px]">
              {upcomingish} active · {doctor.schedules.length} total
            </p>
          </div>

          {doctor.schedules.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="No scheduled procedures"
                description="Procedures assigned to this doctor will appear here."
              />
            </div>
          ) : (
            <ol className="divide-rule-soft divide-y">
              {doctor.schedules.map((schedule) => {
                const date = datePlate(schedule.scheduledDate);

                return (
                  <li key={schedule.id}>
                    <Link
                      href={`/schedules/${schedule.id}`}
                      className="group hover:bg-surface-subtle grid grid-cols-[3.6rem_minmax(0,1fr)] gap-3 px-4 py-3.5 transition-colors sm:grid-cols-[4.2rem_minmax(0,1fr)_auto]"
                    >
                      <div className="border-rule-soft border-r pr-3">
                        <p className="text-ink font-mono text-[18px] leading-none">
                          {date.day}
                        </p>
                        <p className="text-ink-subtle mt-1 text-[9.5px] font-semibold tracking-[0.05em] uppercase">
                          {date.month} {date.year}
                        </p>
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-ink text-[13px] font-semibold">
                            {schedule.procedure}
                          </h3>
                          <SchedulePriorityBadge
                            priority={schedule.priority as SchedulePriority}
                          />
                        </div>
                        <p className="text-ink-muted mt-1 text-[11.5px]">
                          {formatTime(schedule.startTime)} –{' '}
                          {formatTime(schedule.endTime)} ·{' '}
                          {schedule.otRoom.name} ({schedule.otRoom.code})
                        </p>
                        <p className="text-ink-subtle mt-0.5 text-[10.5px]">
                          {schedule.department.name}
                        </p>
                      </div>

                      <div className="col-span-2 flex items-center justify-between gap-2 sm:col-span-1 sm:flex-col sm:items-end sm:justify-center">
                        <ScheduleStatusBadge
                          status={schedule.status as ScheduleStatus}
                        />
                        <span className="text-ink-subtle text-[9.5px] font-medium opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                          Open case
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </div>
    </main>
  );
}
