
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { apiClient, ApiClientError } from "@/lib/api/client";

type AppointmentStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "DELAYED";

interface Appointment {
  id: string;
  procedure: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  priority: "ELECTIVE" | "URGENT" | "EMERGENCY";
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
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "full",
  }).format(date);
}

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Time unavailable";
  }

  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

export function AppointmentDetail({
  appointmentId,
}: {
  appointmentId: string;
}) {
  const [appointment, setAppointment] =
    useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadAppointment() {
      try {
        const patient =
          await apiClient.get<PatientAppointmentsResponse>(
            "/api/me/appointments",
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
              : "Unable to load this appointment.",
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
      label: "Scheduled date",
      value: formatDate(appointment.scheduledDate),
    },
    {
      label: "Start time",
      value: formatTime(appointment.startTime),
    },
    {
      label: "End time",
      value: formatTime(appointment.endTime),
    },
    {
      label: "Department",
      value: appointment.department.name,
    },
    {
      label: "Operating theatre",
      value: appointment.otRoom.name,
    },
    {
      label: "Room code",
      value: appointment.otRoom.code,
    },
    {
      label: "Priority",
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

          <Badge>{formatLabel(appointment.status)}</Badge>
        </div>

        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Review the details and current status of your appointment.
        </p>
      </section>

      <Card>
        <h2 className="text-lg font-semibold">
          {appointment.procedure}
        </h2>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {details.map((detail) => (
            <div
              key={detail.label}
              className="border-b border-[var(--color-border)] pb-3"
            >
              <p className="text-xs text-[var(--color-text-muted)]">
                {detail.label}
              </p>

              <p className="mt-1 text-sm font-medium">
                {detail.value}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </main>
  );
}
