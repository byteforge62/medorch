'use client';

import { useEffect, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
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
  schedules: Appointment[];
}

type AppointmentFilter = 'ALL' | 'UPCOMING' | 'PAST';

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'full',
  }).format(date);
}

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatLabel(value: string) {
  return value.replaceAll('_', ' ');
}

export function MyAppointments() {
  const [patient, setPatient] = useState<PatientAppointmentsResponse | null>(
    null,
  );

  const [filter, setFilter] = useState<AppointmentFilter>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState<number | null>(null);

useEffect(() => {
  setCurrentTime(Date.now());
}, []);

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
      } catch (fetchError) {
        if (!cancelled) {
          setError(
            fetchError instanceof ApiClientError
              ? fetchError.message
              : 'Failed to load your appointments.',
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

  const appointments = useMemo(() => {
    const schedules = patient?.schedules ?? [];
if (currentTime === null) return [];

const now = currentTime;
    return schedules.filter((appointment) => {
      const isPast =
        new Date(appointment.endTime).getTime() < now ||
        appointment.status === 'COMPLETED' ||
        appointment.status === 'CANCELLED';

      if (filter === 'UPCOMING') {
        return !isPast;
      }

      if (filter === 'PAST') {
        return isPast;
      }

      return true;
    });
  }, [patient, filter,currentTime]);

  if (loading) {
    return <LoadingState message="Loading your appointments..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!patient) {
    return (
      <EmptyState
        title="Patient record unavailable"
        description="Your account does not have a linked patient record."
      />
    );
  }

  const filterOptions: {
    label: string;
    value: AppointmentFilter;
  }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Upcoming', value: 'UPCOMING' },
    { label: 'Past', value: 'PAST' },
  ];

  return (
    <main className="space-y-6">
      <section>
        <p className="text-sm font-medium text-[var(--color-primary)]">
          Patient Portal
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          My Appointments
        </h1>

        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Welcome, {patient.name}. Review your operating-theatre appointments
          and their current status.
        </p>

        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          Patient ID: {patient.patientCode}
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-[var(--color-text-muted)]">
            Total appointments
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {patient.schedules.length}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-[var(--color-text-muted)]">Upcoming</p>
          <p className="mt-2 text-2xl font-semibold">
            {
              patient.schedules.filter(
                (appointment) =>
                  currentTime !== null &&
new Date(appointment.endTime).getTime() >= currentTime &&
                  appointment.status !== 'CANCELLED' &&
                  appointment.status !== 'COMPLETED',
              ).length
            }
          </p>
        </Card>

        <Card>
          <p className="text-sm text-[var(--color-text-muted)]">Completed</p>
          <p className="mt-2 text-2xl font-semibold">
            {
              patient.schedules.filter(
                (appointment) => appointment.status === 'COMPLETED',
              ).length
            }
          </p>
        </Card>
      </section>

      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filter appointments"
      >
        {filterOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={filter === option.value}
            onClick={() => setFilter(option.value)}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
              filter === option.value
                ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                : 'border-[var(--color-border)] hover:bg-[var(--color-surface)]'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {appointments.length === 0 ? (
        <EmptyState
          title={
            filter === 'UPCOMING'
              ? 'No upcoming appointments'
              : filter === 'PAST'
                ? 'No past appointments'
                : 'No appointments found'
          }
          description="Appointments associated with your patient record will appear here."
        />
      ) : (
        <section className="space-y-4">
          {appointments.map((appointment) => (
            <Card key={appointment.id}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-3">
                  <div>
                    <h2 className="text-base font-semibold">
                      {appointment.procedure}
                    </h2>

                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                      {appointment.department.name}
                    </p>
                  </div>

                  <div className="grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        Scheduled date
                      </p>
                      <p className="mt-1 font-medium">
                        {formatDate(appointment.scheduledDate)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        Time
                      </p>
                      <p className="mt-1 font-medium">
                        {formatTime(appointment.startTime)} –{' '}
                        {formatTime(appointment.endTime)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        Operating theatre
                      </p>
                      <p className="mt-1 font-medium">
                        {appointment.otRoom.name}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {appointment.otRoom.code}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        Priority
                      </p>
                      <p className="mt-1 font-medium">
                        {formatLabel(appointment.priority)}
                      </p>
                    </div>
                  </div>
                </div>

                <Badge>{formatLabel(appointment.status)}</Badge>
              </div>
            </Card>
          ))}
        </section>
      )}
    </main>
  );
}
