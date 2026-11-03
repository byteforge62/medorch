'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiClient, ApiClientError } from '@/lib/api/client';
import { ScheduleStatusBadge } from '@/components/schedules/ScheduleStatusBadge';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageHeader } from '@/components/ui/PageHeader';

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
  department: { name: string };
  otRoom: { name: string; code: string };
}

interface PatientAppointmentsResponse {
  id: string;
  patientCode: string;
  name: string;
  schedules: Appointment[];
  currentTime: number;
}

function formatLong(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Date unavailable';

  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function dayOf(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '--';

  return String(date.getDate()).padStart(2, '0');
}

function monthOf(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-IN', { month: 'short' })
    .format(date)
    .toUpperCase();
}

function weekdayOf(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-IN', { weekday: 'short' })
    .format(date)
    .toUpperCase();
}

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Time unavailable';

  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatLabel(value: string) {
  return value.replaceAll('_', ' ');
}

/**
 * PatientDashboard — the patient portal.
 *
 * Patients arrive with one question ("when is my appointment, and what
 * happens?"), so this screen is written in plain language at a comfortable
 * reading measure: a large calendar plate for the next appointment, then a
 * short chronological list. No operational metrics, no dense tables, no
 * theatre jargon — it belongs to the same product but speaks differently.
 */
export function PatientDashboard({ userName }: { userName: string }) {
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

        if (!cancelled) {
          setPatient(response);
        }
      } catch (caught) {
        if (!cancelled) {
          setError(
            caught instanceof ApiClientError
              ? caught.message
              : 'Unable to load your appointments. Please try again later.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadAppointments();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <LoadingState message="Loading your appointments…" />;
  }

  if (error || !patient) {
    return (
      <ErrorState
        title="Unable to load your dashboard"
        message={error || 'Your patient record could not be found.'}
        action={
          <Link
            href="/patients/appointments"
            className="text-danger focus-visible:outline-danger text-sm font-semibold underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Open My Appointments
          </Link>
        }
      />
    );
  }

  const appointments = patient.schedules;
  const currentTime = patient.currentTime;

  const upcoming = appointments
    .filter(
      (appointment) =>
        Date.parse(appointment.endTime) >= currentTime &&
        appointment.status !== 'CANCELLED' &&
        appointment.status !== 'COMPLETED',
    )
    .sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime));

  const past = appointments
    .filter(
      (appointment) =>
        Date.parse(appointment.endTime) < currentTime ||
        appointment.status === 'COMPLETED' ||
        appointment.status === 'CANCELLED',
    )
    .sort((a, b) => Date.parse(b.startTime) - Date.parse(a.startTime));

  const nextAppointment = upcoming[0];
  const rest = upcoming.slice(1);

  return (
    <main className="mx-auto max-w-4xl space-y-9">
      <PageHeader
        eyebrow="Patient portal"
        title={`Hello, ${String(userName).split(' ')[0]}`}
        meta={patient.patientCode}
        description="Your appointments, in plain language and in order. Bring your patient ID to every visit."
        actions={
          <Link
            href="/patients/appointments"
            className="bg-primary hover:bg-primary-hover inline-flex items-center gap-2 rounded-[var(--radius-control)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors"
          >
            All my appointments
            <span aria-hidden="true">→</span>
          </Link>
        }
      />

      {/* Next appointment — calendar plate + detail */}
      <section aria-labelledby="next-appointment-title">
        <p className="eyebrow mb-3">What is next</p>

        {nextAppointment ? (
          <div className="panel-flush">
            <div className="grid sm:grid-cols-[9.5rem_minmax(0,1fr)]">
              <div className="border-border flex flex-row items-center justify-between gap-4 border-b bg-surface-subtle p-5 sm:flex-col sm:items-start sm:justify-center sm:border-r sm:border-b-0">
                <div>
                  <p className="text-foreground font-mono text-5xl leading-none font-semibold tabular-nums">
                    {dayOf(nextAppointment.scheduledDate)}
                  </p>
                  <p className="text-foreground-muted mt-2 font-mono text-[11px] tracking-[0.2em] uppercase">
                    {monthOf(nextAppointment.scheduledDate)} ·{' '}
                    {weekdayOf(nextAppointment.scheduledDate)}
                  </p>
                </div>

                <ScheduleStatusBadge status={nextAppointment.status} />
              </div>

              <div className="p-5 sm:p-6">
                <h2
                  id="next-appointment-title"
                  className="text-foreground text-[clamp(1.3rem,2.4vw,1.75rem)] leading-tight font-semibold tracking-[-0.02em]"
                >
                  {nextAppointment.procedure}
                </h2>

                <p className="text-foreground-muted mt-2 text-base">
                  {nextAppointment.department.name}
                </p>

                <dl className="border-border-surface mt-5 grid gap-x-6 gap-y-4 border-t pt-4 sm:grid-cols-3">
                  <div>
                    <dt className="eyebrow">Date</dt>
                    <dd className="text-foreground mt-1.5 text-sm font-medium">
                      {formatLong(nextAppointment.scheduledDate)}
                    </dd>
                  </div>

                  <div>
                    <dt className="eyebrow">Arrival time</dt>
                    <dd className="text-foreground mt-1.5 font-mono text-sm font-medium tabular-nums">
                      {formatTime(nextAppointment.startTime)} –{' '}
                      {formatTime(nextAppointment.endTime)}
                    </dd>
                  </div>

                  <div>
                    <dt className="eyebrow">Location</dt>
                    <dd className="text-foreground mt-1.5 text-sm font-medium">
                      {nextAppointment.otRoom.name} (
                      {nextAppointment.otRoom.code})
                    </dd>
                  </div>
                </dl>

                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <Link
                    href={`/patients/appointments/${nextAppointment.id}`}
                    className="bg-primary hover:bg-primary-hover inline-flex items-center gap-2 rounded-[var(--radius-control)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors"
                  >
                    Appointment details
                    <span aria-hidden="true">→</span>
                  </Link>

                  <span className="text-foreground-muted text-sm">
                    Priority:{' '}
                    {formatLabel(nextAppointment.priority).toLowerCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="panel p-6">
            <p className="text-foreground text-lg font-semibold">
              Nothing scheduled right now
            </p>
            <p className="text-foreground-muted mt-2 max-w-prose text-sm">
              When a clinician books an appointment for you, it will appear
              here with the date, time and where to go.
            </p>

            <Link
              href="/patients/appointments"
              className="text-primary mt-4 inline-block text-sm font-semibold underline-offset-4 hover:underline"
            >
              View appointment history →
            </Link>
          </div>
        )}
      </section>

      {/* Remaining upcoming */}
      {rest.length > 0 ? (
        <section aria-labelledby="upcoming-title">
          <div className="border-border flex items-end justify-between border-b pb-2">
            <p className="eyebrow" id="upcoming-title">
              Also coming up
            </p>
            <span className="text-foreground-muted font-mono text-[10px] tracking-[0.14em] uppercase">
              {rest.length} more
            </span>
          </div>

          <ul className="divide-y divide-border">
            {rest.map((appointment) => (
              <li key={appointment.id}>
                <Link
                  href={`/patients/appointments/${appointment.id}`}
                  className="hover:bg-surface-subtle flex flex-wrap items-center justify-between gap-4 py-4 transition-colors"
                >
                  <span className="min-w-0">
                    <span className="text-foreground block font-medium">
                      {appointment.procedure}
                    </span>
                    <span className="text-foreground-muted mt-1 block text-sm">
                      {formatLong(appointment.scheduledDate)} ·{' '}
                      {formatTime(appointment.startTime)}
                    </span>
                  </span>

                  <ScheduleStatusBadge status={appointment.status} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* History */}
      <section aria-labelledby="history-title">
        <div className="border-border flex items-end justify-between border-b pb-2">
          <p className="eyebrow" id="history-title">
            Past visits
          </p>
          <span className="text-foreground-muted font-mono text-[10px] tracking-[0.14em] uppercase">
            {past.length} on record
          </span>
        </div>

        {past.length === 0 ? (
          <p className="text-foreground-muted py-5 text-sm">
            Your previous appointments will appear here once they are
            completed.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {past.map((appointment) => (
              <li key={appointment.id}>
                <Link
                  href={`/patients/appointments/${appointment.id}`}
                  className="hover:bg-surface-subtle flex flex-wrap items-center justify-between gap-4 py-4 transition-colors"
                >
                  <span className="min-w-0">
                    <span className="text-foreground block font-medium">
                      {appointment.procedure}
                    </span>
                    <span className="text-foreground-muted mt-1 block text-sm">
                      {formatLong(appointment.scheduledDate)} ·{' '}
                      {appointment.department.name}
                    </span>
                  </span>

                  <ScheduleStatusBadge status={appointment.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
