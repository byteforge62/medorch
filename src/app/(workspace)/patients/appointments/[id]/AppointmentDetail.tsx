'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { ScheduleStatusBadge } from '@/components/schedules/ScheduleStatusBadge';
import { Ledger, LedgerRow } from '@/components/ui/Ledger';
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

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'full',
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

export function AppointmentDetail({
  appointmentId,
}: {
  appointmentId: string;
}) {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
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
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadAppointment();

    return () => {
      cancelled = true;
    };
  }, [appointmentId]);

  if (loading) {
    return <LoadingState message="Loading appointment details..." />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <ErrorState message={error} />
        <Link
          href="/patients/appointments"
          className="text-sm font-semibold text-[var(--color-primary)] hover:underline"
        >
          ← Back to My Appointments
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
          className="text-sm font-semibold text-[var(--color-primary)] hover:underline"
        >
          ← Back to My Appointments
        </Link>
      </div>
    );
  }

  const details = [
    {
      label: 'Scheduled date',
      value: formatDate(appointment.scheduledDate),
    },
    {
      label: 'Start time',
      value: formatTime(appointment.startTime),
    },
    {
      label: 'End time',
      value: formatTime(appointment.endTime),
    },
    {
      label: 'Department',
      value: appointment.department.name,
    },
    {
      label: 'Operating theatre',
      value: appointment.otRoom.name,
    },
    {
      label: 'Room code',
      value: appointment.otRoom.code,
    },
    {
      label: 'Priority',
      value: formatLabel(appointment.priority),
    },
  ];

  return (
    <main className="space-y-6">
      <Link
        href="/patients/appointments"
        className="inline-flex text-sm font-semibold text-[var(--color-primary)] hover:underline"
      >
        ← Back to My Appointments
      </Link>

      <section>
        <p className="text-sm font-medium text-[var(--color-primary)]">
          Patient Portal
        </p>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            Appointment Details
          </h1>

          <ScheduleStatusBadge status={appointment.status} />
        </div>

        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Review the details and current status of your appointment.
        </p>
      </section>

      <section className="border-border bg-surface border">
        <header className="border-border-strong bg-surface-muted border-b px-4 py-4 sm:px-6">
          <p className="text-foreground-subtle font-mono text-[11px] tracking-[0.16em] uppercase">
            Appointment record
          </p>
          <h2 className="text-foreground mt-1 text-lg font-semibold">
            {appointment.procedure}
          </h2>
        </header>
        <Ledger className="border-0 border-b-0 sm:grid sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          {details.map((detail) => (
            <LedgerRow key={detail.label} className="px-4 py-3 sm:px-6">
              <p className="text-foreground-muted font-mono text-[10px] tracking-[0.12em] uppercase">
                {detail.label}
              </p>
              <p className="text-foreground mt-1 text-sm font-medium">
                {detail.value}
              </p>
            </LedgerRow>
          ))}
        </Ledger>
      </section>
    </main>
  );
}
