'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from '@phosphor-icons/react';

import { ScheduleStatusBadge } from '@/components/schedules/ScheduleStatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { apiClient, ApiClientError } from '@/lib/api/client';

type AppointmentStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DELAYED';

interface Appointment {
  id: string;
  procedure: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  priority: 'ELECTIVE' | 'URGENT' | 'EMERGENCY';
  department: {
    name: string;
  };
  otRoom: {
    name: string;
    code: string;
  };
}

interface PatientAppointmentsResponse {
  id: string;
  patientCode: string;
  name: string;
  currentTime: number;
  schedules: Appointment[];
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Date unavailable';

  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'full' }).format(date);
}

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Time unavailable';

  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function datePlate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return { day: '—', month: '', year: '', weekday: '' };
  }

  return {
    day: new Intl.DateTimeFormat('en-IN', { day: '2-digit' }).format(date),
    month: new Intl.DateTimeFormat('en-IN', { month: 'long' }).format(date),
    year: new Intl.DateTimeFormat('en-IN', { year: 'numeric' }).format(date),
    weekday: new Intl.DateTimeFormat('en-IN', { weekday: 'long' }).format(date),
  };
}

function formatLabel(value: string) {
  return value.replaceAll('_', ' ');
}

function Fact({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-ink-muted text-[10.5px] font-medium">{label}</dt>
      <dd
        className={`text-ink mt-1 text-[13px] font-medium break-words ${
          mono ? 'font-mono text-[11.5px]' : ''
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

export function AppointmentDetail({
  appointmentId,
}: {
  appointmentId: string;
}) {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [patientName, setPatientName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadAppointment() {
      try {
        const patient = await apiClient.get<PatientAppointmentsResponse>(
          '/api/me/appointments',
        );

        const ownAppointment = patient.schedules.find(
          (item) => item.id === appointmentId,
        );

        if (!cancelled) {
          setAppointment(ownAppointment ?? null);
          setPatientName(patient.name);
        }
      } catch (caught: unknown) {
        if (!cancelled) {
          setError(
            caught instanceof ApiClientError
              ? caught.message
              : 'Unable to load this appointment.',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadAppointment();

    return () => {
      cancelled = true;
    };
  }, [appointmentId]);

  if (loading) return <LoadingState message="Loading visit record…" />;

  if (error) {
    return (
      <div className="space-y-4">
        <ErrorState message={error} />
        <Link
          href="/patients/appointments"
          className="text-ink-muted hover:text-ink inline-flex items-center gap-1.5 text-[12px] font-semibold"
        >
          <ArrowLeft size={13} weight="bold" aria-hidden="true" />
          My appointments
        </Link>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="space-y-4">
        <EmptyState
          title="Appointment not found"
          description="This appointment is not associated with your patient record, or it no longer exists."
        />
        <Link
          href="/patients/appointments"
          className="text-ink-muted hover:text-ink inline-flex items-center gap-1.5 text-[12px] font-semibold"
        >
          <ArrowLeft size={13} weight="bold" aria-hidden="true" />
          My appointments
        </Link>
      </div>
    );
  }

  const date = datePlate(appointment.scheduledDate);

  return (
    <main className="space-y-6">
      <Link
        href="/patients/appointments"
        className="text-ink-muted hover:text-ink inline-flex items-center gap-1.5 text-[12px] font-medium"
      >
        <ArrowLeft size={13} weight="bold" aria-hidden="true" />
        My appointments
      </Link>

      <header className="border-rule border-b pb-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-primary text-[10.5px] font-semibold tracking-[0.08em] uppercase">
              Visit record
            </p>
            <h1 className="display mt-2 text-[clamp(1.9rem,4vw,2.6rem)]">
              {appointment.procedure}
            </h1>
            <p className="text-ink-secondary mt-2 text-[13px]">
              {formatDate(appointment.scheduledDate)}
            </p>
          </div>
          <ScheduleStatusBadge status={appointment.status} />
        </div>
      </header>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(15rem,0.7fr)]">
        <section
          className="panel overflow-hidden"
          aria-labelledby="visit-sheet-title"
        >
          <div className="grid sm:grid-cols-[8.5rem_minmax(0,1fr)]">
            <div className="relative flex flex-col justify-between overflow-hidden bg-[linear-gradient(150deg,#7C67C7_0%,#6550B5_48%,#4E3A94_100%)] px-5 py-5 text-white">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full border border-white/15"
              />
              <p className="relative font-mono text-[9.5px] tracking-[0.14em] text-white/55 uppercase">
                Scheduled
              </p>
              <div className="relative mt-4 sm:mt-0">
                <p className="font-mono text-[42px] leading-none">{date.day}</p>
                <p className="mt-1 text-[13px] font-semibold text-white/90">
                  {date.month}
                </p>
                <p className="mt-0.5 text-[10.5px] text-white/55">
                  {date.year} · {date.weekday}
                </p>
              </div>
            </div>

            <div className="px-5 py-5">
              <h2
                id="visit-sheet-title"
                className="text-ink text-[17px] font-semibold"
              >
                {appointment.procedure}
              </h2>
              <p className="text-ink-muted mt-1 text-[12px]">
                {formatTime(appointment.startTime)} –{' '}
                {formatTime(appointment.endTime)} ·{' '}
                {appointment.department.name}
              </p>

              <dl className="border-rule-soft mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-t pt-4">
                <Fact
                  label="Scheduled date"
                  value={formatDate(appointment.scheduledDate)}
                />
                <Fact
                  label="Visit window"
                  value={`${formatTime(appointment.startTime)} – ${formatTime(
                    appointment.endTime,
                  )}`}
                />
                <Fact label="Department" value={appointment.department.name} />
                <Fact
                  label="Operating theatre"
                  value={`${appointment.otRoom.name} (${appointment.otRoom.code})`}
                />
                <Fact
                  label="Planning priority"
                  value={formatLabel(appointment.priority)}
                />
                <Fact label="Status" value={formatLabel(appointment.status)} />
              </dl>
            </div>
          </div>

          <div className="border-rule-soft bg-surface-subtle border-t px-5 py-3">
            <p className="text-ink-subtle font-mono text-[9.5px] break-all">
              VISIT {appointment.id}
            </p>
          </div>
        </section>

        <aside
          className="panel overflow-hidden"
          aria-labelledby="visit-notes-title"
        >
          <div className="border-rule-soft border-b px-5 py-3.5">
            <h2
              id="visit-notes-title"
              className="text-ink text-[13px] font-semibold"
            >
              About this record
            </h2>
          </div>

          <div className="space-y-4 px-5 py-4">
            <p className="text-ink-secondary text-[12px] leading-[1.75]">
              This is the theatre coordination record for your visit. The status
              above is updated by hospital staff as the schedule changes.
            </p>

            <dl className="space-y-3">
              <div>
                <dt className="text-ink-subtle text-[10px]">Patient</dt>
                <dd className="text-ink mt-0.5 text-[12px] font-medium">
                  {patientName || 'Your linked patient record'}
                </dd>
              </div>
              <div>
                <dt className="text-ink-subtle text-[10px]">Where to go</dt>
                <dd className="text-ink mt-0.5 text-[12px] font-medium">
                  {appointment.otRoom.name} · {appointment.otRoom.code}
                </dd>
              </div>
            </dl>
          </div>

          <div className="border-rule-soft bg-pine-soft border-t px-5 py-4">
            <p className="text-pine text-[11.5px] leading-relaxed">
              If these details look wrong, contact the hospital&apos;s theatre
              coordination desk and quote visit reference{' '}
              <span className="font-mono text-[10.5px]">
                {appointment.id.slice(0, 8)}
              </span>
              .
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
