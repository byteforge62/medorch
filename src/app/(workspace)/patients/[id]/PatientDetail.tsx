'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft } from '@phosphor-icons/react';

import { apiClient, ApiClientError } from '@/lib/api/client';
import { Badge } from '@/components/ui/Badge';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import {
  SchedulePriorityBadge,
  ScheduleStatusBadge,
  type SchedulePriority,
  type ScheduleStatus,
} from '@/components/schedules/ScheduleStatusBadge';

interface PatientSchedule {
  id: string;
  procedure: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status: string;
  priority: string;
  department: {
    name: string;
  };
  otRoom: {
    name: string;
    code: string;
  };
}

interface PatientDetailRecord {
  id: string;
  patientCode: string;
  schedules: PatientSchedule[];
  name: string;
  email: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  medicalHistory: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    status: string;
  } | null;
}

function formatDate(value: string | null) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(date);
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

function initials(name: string) {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'PT'
  );
}

function DetailField({
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

export function PatientDetail({ patientId }: { patientId: string }) {
  const [patient, setPatient] = useState<PatientDetailRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function fetchPatient() {
      try {
        const response = await apiClient.get<PatientDetailRecord>(
          `/api/patients/${patientId}`,
        );

        if (!cancelled) setPatient(response);
      } catch (fetchError) {
        if (!cancelled) {
          setError(
            fetchError instanceof ApiClientError
              ? fetchError.message
              : 'Failed to load patient details.',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchPatient();

    return () => {
      cancelled = true;
    };
  }, [patientId]);

  if (loading) return <LoadingState message="Loading patient record…" />;

  if (error || !patient) {
    return (
      <main className="space-y-4">
        <Link
          href="/patients"
          className="text-ink-muted hover:text-ink text-[12px] font-medium"
        >
          ← Patient registry
        </Link>
        <ErrorState message={error || 'Patient record not found.'} />
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <Link
        href="/patients"
        className="text-ink-muted hover:text-ink inline-flex items-center gap-1.5 text-[12px] font-medium"
      >
        <ArrowLeft size={13} weight="bold" aria-hidden="true" />
        Patient registry
      </Link>

      <header className="pb-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <span
              className="bg-primary-soft text-primary flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-[15px] font-semibold"
              aria-hidden="true"
            >
              {initials(patient.name)}
            </span>
            <div className="min-w-0">
              <p className="text-primary text-[10.5px] font-semibold tracking-[0.08em] uppercase">
                Patient record
              </p>
              <h1 className="display mt-1 text-[clamp(1.9rem,4vw,2.6rem)]">
                {patient.name}
              </h1>
              <p className="text-ink-secondary mt-1.5 font-mono text-[12px]">
                {patient.patientCode}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="info">
              {patient.schedules.length}{' '}
              {patient.schedules.length === 1 ? 'procedure' : 'procedures'}
            </Badge>
            {patient.user ? (
              <Badge>{patient.user.status.replaceAll('_', ' ')}</Badge>
            ) : (
              <Badge>No linked account</Badge>
            )}
          </div>
        </div>
      </header>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(16rem,0.7fr)_minmax(0,1.5fr)]">
        <div className="space-y-5">
          <section
            className="panel overflow-hidden"
            aria-labelledby="patient-identity-title"
          >
            <div className="border-rule-soft border-b px-5 py-3.5">
              <h2
                id="patient-identity-title"
                className="text-ink text-[13px] font-semibold"
              >
                Identity and contact
              </h2>
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-4 px-5 py-4">
              <DetailField label="Full name" value={patient.name} />
              <DetailField
                label="Date of birth"
                value={formatDate(patient.dateOfBirth)}
              />
              <DetailField label="Gender" value={patient.gender} />
              <DetailField
                label="Registered"
                value={formatDate(patient.createdAt)}
              />
              <div className="col-span-2">
                <DetailField label="Email" value={patient.email} />
              </div>
              <div className="col-span-2">
                <DetailField label="Phone" value={patient.phone} />
              </div>
            </dl>

            <div className="border-rule-soft bg-surface-subtle border-t px-5 py-3">
              <p className="text-ink-subtle font-mono text-[9.5px] break-all">
                RECORD {patient.id} · UPDATED {formatDate(patient.updatedAt)}
              </p>
            </div>
          </section>

          <section
            className="panel overflow-hidden"
            aria-labelledby="linked-account-title"
          >
            <div className="border-rule-soft border-b px-5 py-3.5">
              <h2
                id="linked-account-title"
                className="text-ink text-[13px] font-semibold"
              >
                Linked patient account
              </h2>
            </div>

            {patient.user ? (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-4 px-5 py-4">
                <DetailField label="Account name" value={patient.user.name} />
                <DetailField
                  label="Status"
                  value={patient.user.status.replaceAll('_', ' ')}
                />
                <div className="col-span-2">
                  <DetailField label="Email" value={patient.user.email} />
                </div>
                <div className="col-span-2">
                  <DetailField label="Phone" value={patient.user.phone} />
                </div>
              </dl>
            ) : (
              <p className="text-ink-muted px-5 py-4 text-[12px]">
                No user account is linked to this patient record.
              </p>
            )}
          </section>
        </div>

        <div className="space-y-5">
          <section
            className="panel overflow-hidden"
            aria-labelledby="medical-history-title"
          >
            <div className="border-rule-soft flex items-center justify-between gap-3 border-b px-5 py-3.5">
              <div>
                <h2
                  id="medical-history-title"
                  className="text-ink text-[13px] font-semibold"
                >
                  Medical history
                </h2>
                <p className="text-ink-muted mt-0.5 text-[11px]">
                  Authorised clinical context held against this patient.
                </p>
              </div>
              <Badge variant="danger">Clinical note</Badge>
            </div>

            <div className="px-5 py-4">
              <p className="text-ink-secondary text-[13px] leading-[1.8] whitespace-pre-wrap">
                {patient.medicalHistory?.trim() ||
                  'No medical history has been recorded for this patient.'}
              </p>
            </div>
          </section>

          <section
            className="panel-flush overflow-hidden"
            aria-labelledby="surgical-history-title"
          >
            <div className="border-rule-soft flex flex-wrap items-end justify-between gap-2 border-b px-4 py-3.5">
              <div>
                <h2
                  id="surgical-history-title"
                  className="text-ink text-[13px] font-semibold"
                >
                  Surgical timeline
                </h2>
                <p className="text-ink-muted mt-0.5 text-[11px]">
                  Every theatre case recorded against this patient.
                </p>
              </div>
              <p className="text-ink-subtle font-mono text-[10px]">
                {patient.schedules.length} total
              </p>
            </div>

            {patient.schedules.length === 0 ? (
              <p className="text-ink-muted px-5 py-6 text-[12px]">
                No schedules have been recorded for this patient.
              </p>
            ) : (
              <ol className="divide-rule-soft divide-y">
                {patient.schedules.map((schedule) => {
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
      </div>
    </main>
  );
}
