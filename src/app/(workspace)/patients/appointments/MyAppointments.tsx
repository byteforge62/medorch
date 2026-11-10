'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiClient, ApiClientError } from '@/lib/api/client';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { buttonClasses } from '@/components/ui/Button';
import { ScheduleStatusBadge } from '@/components/schedules/ScheduleStatusBadge';

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
  schedules: Appointment[];
  currentTime: number;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'full' }).format(date);
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
    return { day: '—', month: '', weekday: '' };
  }

  return {
    day: new Intl.DateTimeFormat('en-IN', { day: '2-digit' }).format(date),
    month: new Intl.DateTimeFormat('en-IN', { month: 'long' }).format(date),
    weekday: new Intl.DateTimeFormat('en-IN', { weekday: 'long' }).format(date),
  };
}

function isPastVisit(appointment: Appointment, currentTime: number) {
  if (
    appointment.status === 'COMPLETED' ||
    appointment.status === 'CANCELLED'
  ) {
    return true;
  }

  const end = new Date(appointment.endTime).getTime();
  return Number.isFinite(end) ? end < currentTime : false;
}

function appointmentTime(appointment: Appointment) {
  const value = new Date(appointment.startTime).getTime();
  return Number.isFinite(value) ? value : 0;
}

function VisitRow({ appointment }: { appointment: Appointment }) {
  const date = datePlate(appointment.scheduledDate);

  return (
    <li>
      <Link
        href={`/patients/appointments/${appointment.id}`}
        className="group hover:bg-surface-subtle grid grid-cols-[3.8rem_minmax(0,1fr)] gap-3 px-4 py-4 transition-colors sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] sm:px-5"
      >
        <div className="border-rule-soft border-r pr-3">
          <p className="text-ink font-mono text-[19px] leading-none">
            {date.day}
          </p>
          <p className="text-ink-subtle mt-1 text-[9.5px] font-semibold tracking-[0.05em] uppercase">
            {date.month}
          </p>
        </div>

        <div className="min-w-0">
          <h3 className="text-ink text-[13.5px] font-semibold">
            {appointment.procedure}
          </h3>
          <p className="text-ink-muted mt-1 text-[11.5px]">
            {date.weekday} · {formatTime(appointment.startTime)} –{' '}
            {formatTime(appointment.endTime)}
          </p>
          <p className="text-ink-subtle mt-0.5 text-[10.5px]">
            {appointment.department.name} · {appointment.otRoom.name} (
            {appointment.otRoom.code})
          </p>
        </div>

        <div className="col-span-2 flex items-center justify-between gap-2 sm:col-span-1 sm:flex-col sm:items-end sm:justify-center">
          <ScheduleStatusBadge status={appointment.status} />
          <span className="text-ink-subtle text-[9.5px] font-medium opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            Open visit
          </span>
        </div>
      </Link>
    </li>
  );
}

export function MyAppointments() {
  const [patient, setPatient] = useState<PatientAppointmentsResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadAppointments() {
      try {
        const response = await apiClient.get<PatientAppointmentsResponse>(
          '/api/me/appointments',
        );

        if (!cancelled) setPatient(response);
      } catch (fetchError) {
        if (!cancelled) {
          setError(
            fetchError instanceof ApiClientError
              ? fetchError.message
              : 'Failed to load your appointments.',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadAppointments();

    return () => {
      cancelled = true;
    };
  }, []);

  const appointments = useMemo(() => patient?.schedules ?? [], [patient]);
  const currentTime = patient?.currentTime ?? 0;

  const { upcoming, past } = useMemo(() => {
    const groups = {
      upcoming: [] as Appointment[],
      past: [] as Appointment[],
    };

    for (const appointment of appointments) {
      if (isPastVisit(appointment, currentTime)) {
        groups.past.push(appointment);
      } else {
        groups.upcoming.push(appointment);
      }
    }

    groups.upcoming.sort((a, b) => appointmentTime(a) - appointmentTime(b));
    groups.past.sort((a, b) => appointmentTime(b) - appointmentTime(a));

    return groups;
  }, [appointments, currentTime]);

  if (loading) {
    return <LoadingState message="Loading your theatre visits…" />;
  }

  if (error) return <ErrorState message={error} />;

  if (!patient) {
    return (
      <EmptyState
        title="Patient record unavailable"
        description="Your account does not have a linked patient record."
      />
    );
  }

  const nextVisit = upcoming[0] ?? null;
  const nextDate = nextVisit ? datePlate(nextVisit.scheduledDate) : null;

  return (
    <main className="space-y-6">
      <header className="border-rule border-b pb-6">
        <p className="text-primary flex items-center gap-2 text-[10.5px] font-semibold tracking-[0.08em] uppercase">
          <span className="bg-primary h-1.5 w-1.5 rounded-full" aria-hidden="true" />
          Patient portal
        </p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="display text-[clamp(2rem,4vw,2.85rem)]">
              Your theatre visits
            </h1>
            <p className="lede mt-3 text-[14px]">
              {patient.name}, these are the operating-theatre appointments held
              against your patient record.
            </p>
          </div>
          <p className="text-ink-subtle shrink-0 font-mono text-[10.5px]">
            {patient.patientCode} · {appointments.length}{' '}
            {appointments.length === 1 ? 'visit' : 'visits'}
          </p>
        </div>
      </header>

      {nextVisit && nextDate ? (
        <section
          aria-labelledby="next-visit-title"
          className="panel overflow-hidden"
        >
          <div className="grid md:grid-cols-[9.5rem_minmax(0,1fr)_auto]">
            <div className="relative flex flex-col justify-between overflow-hidden bg-[linear-gradient(150deg,#7C67C7_0%,#6550B5_48%,#4E3A94_100%)] px-6 py-5 text-white md:px-5">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full border border-white/15"
              />
              <p className="relative font-mono text-[10px] tracking-[0.14em] text-white/55 uppercase">
                Next visit
              </p>
              <div className="relative mt-5 md:mt-0">
                <p className="font-mono text-[42px] leading-none">
                  {nextDate.day}
                </p>
                <p className="mt-1 text-[13px] font-semibold text-white/90">
                  {nextDate.month}
                </p>
                <p className="mt-0.5 text-[10.5px] text-white/55">
                  {nextDate.weekday}
                </p>
              </div>
            </div>

            <div className="min-w-0 px-5 py-5 sm:px-6">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2
                    id="next-visit-title"
                    className="text-ink text-[19px] leading-tight font-semibold"
                  >
                    {nextVisit.procedure}
                  </h2>
                  <p className="text-ink-muted mt-1 text-[12px]">
                    {formatDate(nextVisit.scheduledDate)} ·{' '}
                    {formatTime(nextVisit.startTime)} –{' '}
                    {formatTime(nextVisit.endTime)}
                  </p>
                </div>
                <ScheduleStatusBadge status={nextVisit.status} />
              </div>

              <dl className="border-rule-soft mt-4 grid grid-cols-2 gap-3 border-t pt-3">
                <div>
                  <dt className="text-ink-subtle text-[10px]">Department</dt>
                  <dd className="text-ink mt-0.5 text-[12px] font-medium">
                    {nextVisit.department.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-subtle text-[10px]">
                    Operating theatre
                  </dt>
                  <dd className="text-ink mt-0.5 text-[12px] font-medium">
                    {nextVisit.otRoom.name} · {nextVisit.otRoom.code}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex items-center px-5 pb-5 md:px-4 md:pb-0">
              <Link
                href={`/patients/appointments/${nextVisit.id}`}
                className={buttonClasses({ size: 'sm' })}
              >
                View visit
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {appointments.length === 0 ? (
        <EmptyState
          title="No appointments found"
          description="Appointments associated with your patient record will appear here."
        />
      ) : (
        <div className="space-y-6">
          <section
            className="panel-flush overflow-hidden"
            aria-labelledby="upcoming-visits-title"
          >
            <div className="border-rule-soft flex items-end justify-between gap-3 border-b px-4 py-3.5 sm:px-5">
              <div>
                <h2
                  id="upcoming-visits-title"
                  className="text-ink text-[13px] font-semibold"
                >
                  Upcoming
                </h2>
                <p className="text-ink-muted mt-0.5 text-[11px]">
                  Visits still ahead in the theatre schedule.
                </p>
              </div>
              <span className="text-ink-subtle font-mono text-[10px]">
                {upcoming.length}
              </span>
            </div>

            {upcoming.length === 0 ? (
              <p className="text-ink-muted px-5 py-5 text-[12px]">
                No upcoming visits are currently scheduled.
              </p>
            ) : (
              <ol className="divide-rule-soft divide-y">
                {upcoming.map((appointment) => (
                  <VisitRow key={appointment.id} appointment={appointment} />
                ))}
              </ol>
            )}
          </section>

          <section
            className="panel-flush overflow-hidden"
            aria-labelledby="past-visits-title"
          >
            <div className="border-rule-soft flex items-end justify-between gap-3 border-b px-4 py-3.5 sm:px-5">
              <div>
                <h2
                  id="past-visits-title"
                  className="text-ink text-[13px] font-semibold"
                >
                  Past visits
                </h2>
                <p className="text-ink-muted mt-0.5 text-[11px]">
                  Completed and cancelled appointments, most recent first.
                </p>
              </div>
              <span className="text-ink-subtle font-mono text-[10px]">
                {past.length}
              </span>
            </div>

            {past.length === 0 ? (
              <p className="text-ink-muted px-5 py-5 text-[12px]">
                No past visits are held on this record.
              </p>
            ) : (
              <ol className="divide-rule-soft divide-y">
                {past.map((appointment) => (
                  <VisitRow key={appointment.id} appointment={appointment} />
                ))}
              </ol>
            )}
          </section>
        </div>
      )}

      <p className="border-rule text-ink-muted border-t pt-4 text-[11px] leading-relaxed">
        If a visit detail looks wrong, contact the hospital&apos;s theatre
        coordination desk. MedOrch shows the scheduling record, not clinical
        advice.
      </p>
    </main>
  );
}
