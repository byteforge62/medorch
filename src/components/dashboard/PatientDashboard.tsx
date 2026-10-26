'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiClient, ApiClientError } from '@/lib/api/client';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
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
function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
  }).format(date);
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
function StatusChip({ status }: { status: AppointmentStatus }) {
  switch (status) {
    case 'CONFIRMED':
      return <Badge variant="info">Confirmed</Badge>;
    case 'IN_PROGRESS':
      return <Badge variant="warning">In Progress</Badge>;
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
export function PatientDashboard({ userName }: { userName: string }) {
  const [patient, setPatient] = useState<PatientAppointmentsResponse | null>(null);
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
            className="text-sm font-semibold text-danger underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
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
  const recentAppointments = appointments
    .filter(
      (appointment) =>
        Date.parse(appointment.endTime) < currentTime ||
        appointment.status === 'COMPLETED' ||
        appointment.status === 'CANCELLED',
    )
    .sort((a, b) => Date.parse(b.startTime) - Date.parse(a.startTime))
    .slice(0, 3);
  const nextAppointment = upcoming[0];
  const metrics = [
    {
      label: 'Total appointments',
      value: appointments.length,
      description: 'Recorded appointments',
    },
    {
      label: 'Upcoming appointments',
      value: upcoming.length,
      description: 'Not finished or cancelled',
    },
    {
      label: 'Completed appointments',
      value: appointments.filter(
        (appointment) => appointment.status === 'COMPLETED',
      ).length,
      description: 'Finished appointments',
    },
  ];
  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-4 rounded-[var(--radius-xl)] border border-border-strong bg-surface p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
            Patient portal
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground">
            Welcome, {userName}
          </h1>
          <p className="mt-2 text-sm text-foreground-secondary">
            View your upcoming appointments and appointment history.
          </p>
          <p className="mt-3 text-xs text-foreground-muted">
            Patient ID: {patient.patientCode}
          </p>
        </div>
        <Link
          href="/patients/appointments"
          className="inline-flex items-center justify-center rounded-[var(--radius-xl)] bg-primary px-4 py-3 text-sm font-semibold text-foreground-inverse transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          My Appointments
          <span className="ml-2" aria-hidden="true">
            →
          </span>
        </Link>
      </header>
      <section aria-label="Appointment summary" className="grid grid-cols-3 gap-4">
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
      <section className="rounded-[var(--radius-xl)] border border-border-strong bg-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">Next appointment</h2>
            <p className="mt-1 text-sm text-foreground-secondary">
              Your nearest scheduled appointment.
            </p>
          </div>
          <Link
            href="/patients/appointments"
            className="text-sm font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            View all
          </Link>
        </div>
        {nextAppointment ? (
          <div className="mt-5 rounded-[var(--radius-lg)] bg-surface-muted p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-foreground">
                  {nextAppointment.procedure}
                </h3>
                <p className="mt-2 text-sm text-foreground-secondary">
                  {nextAppointment.department.name}
                </p>
              </div>
              <StatusChip status={nextAppointment.status} />
            </div>
            <dl className="mt-5 grid grid-cols-1 gap-4 border-t border-border-strong pt-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs text-foreground-muted">Date</dt>
                <dd className="font-medium text-foreground">
                  {formatDate(nextAppointment.scheduledDate)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-foreground-muted">Time</dt>
                <dd className="font-medium text-foreground">
                  {formatTime(nextAppointment.startTime)} –{' '}
                  {formatTime(nextAppointment.endTime)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-foreground-muted">Priority</dt>
                <dd className="font-medium text-foreground">
                  {formatLabel(nextAppointment.priority)}
                </dd>
              </div>
            </dl>
          </div>
        ) : (
          <div className="mt-5 rounded-[var(--radius-lg)] bg-surface-muted p-6">
            <p className="font-medium text-foreground">No upcoming appointments</p>
            <p className="mt-2 text-sm text-foreground-secondary">
              Your scheduled appointments will appear here when available.
            </p>
          </div>
        )}
      </section>
      <section className="rounded-[var(--radius-xl)] border border-border-strong bg-surface p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-foreground">Recent appointment history</h2>
          <Link
            href="/patients/appointments"
            className="text-sm font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            View all
          </Link>
        </div>
        {recentAppointments.length === 0 ? (
          <p className="mt-4 text-sm text-foreground-secondary">
            Your previous appointments will appear here when available.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {recentAppointments.map((appointment) => (
              <li
                key={appointment.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-foreground">{appointment.procedure}</p>
                  <p className="mt-1 text-sm text-foreground-secondary">
                    {formatDate(appointment.scheduledDate)} · {' '}
                    {appointment.department.name}
                  </p>
                </div>
                <StatusChip status={appointment.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
