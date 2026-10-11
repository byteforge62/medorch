
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(date);
}

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Time unavailable";

  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function statusClasses(status: AppointmentStatus) {
  switch (status) {
    case "CONFIRMED":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400";
    case "IN_PROGRESS":
      return "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400";
    case "COMPLETED":
      return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400";
    case "CANCELLED":
      return "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400";
    case "DELAYED":
      return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400";
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  }
}

export function PatientDashboard({
  userName,
}: {
  userName: string;
}) {
  const [patient, setPatient] =
    useState<PatientAppointmentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  

  useEffect(() => {
    let cancelled = false;

    async function loadAppointments() {
      try {
        const response =
          await apiClient.get<PatientAppointmentsResponse>(
            "/api/me/appointments",
          );

        if (!cancelled) {
          setPatient(response);
        }
      } catch (caught: unknown) {
        if (!cancelled) {
          setError(
            caught instanceof ApiClientError
              ? caught.message
              : "Unable to load your appointments. Please try again later.",
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
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        Loading your patient dashboard...
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/20"
      >
        <h2 className="font-semibold text-red-800 dark:text-red-300">
          Unable to load your dashboard
        </h2>
        <p className="mt-2 text-sm text-red-700 dark:text-red-400">
          {error || "Your patient record could not be found."}
        </p>
        <Link
          href="/patients/appointments"
          className="mt-4 inline-block text-sm font-semibold text-red-800 underline dark:text-red-300"
        >
          Open My Appointments
        </Link>
      </div>
    );
  }

const appointments = patient.schedules;
const currentTime = patient.currentTime;

const upcoming = appointments
  .filter(
    (appointment) =>
      Date.parse(appointment.endTime) >= currentTime &&
      appointment.status !== "CANCELLED" &&
      appointment.status !== "COMPLETED",
  )
  .sort(
    (a, b) =>
      Date.parse(a.startTime) - Date.parse(b.startTime),
  );

const recentAppointments = appointments
  .filter(
    (appointment) =>
      Date.parse(appointment.endTime) < currentTime ||
      appointment.status === "COMPLETED" ||
      appointment.status === "CANCELLED",
  )
  .sort(
    (a, b) =>
      Date.parse(b.startTime) - Date.parse(a.startTime),
  )
  .slice(0, 3);

const nextAppointment = upcoming[0];

  const metrics = [
    {
      label: "Total appointments",
      value: appointments.length,
    },
    {
      label: "Upcoming appointments",
      value: upcoming.length,
    },
    {
      label: "Completed appointments",
      value: appointments.filter(
        (appointment) => appointment.status === "COMPLETED",
      ).length,
    },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Patient portal
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            Welcome, {userName}
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            View your upcoming appointments and appointment history.
          </p>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Patient ID: {patient.patientCode}
          </p>
        </div>

        <Link
          href="/patients/appointments"
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          My Appointments
          <span className="ml-2" aria-hidden="true">→</span>
        </Link>
      </header>

      <section
        aria-label="Appointment summary"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {metric.label}
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
              {metric.value}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Next appointment
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Your nearest scheduled appointment.
            </p>
          </div>
          <Link
            href="/patients/appointments"
            className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
          >
            View all
          </Link>
        </div>

        {nextAppointment ? (
          <div className="mt-5 rounded-xl bg-slate-50 p-5 dark:bg-slate-800/60">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {nextAppointment.procedure}
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {nextAppointment.department.name}
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(nextAppointment.status)}`}
              >
                {formatLabel(nextAppointment.status)}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-200 pt-4 dark:border-slate-700 sm:grid-cols-3">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Date
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                  {formatDate(nextAppointment.scheduledDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Time
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                  {formatTime(nextAppointment.startTime)} –{" "}
                  {formatTime(nextAppointment.endTime)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Priority
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                  {formatLabel(nextAppointment.priority)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-xl bg-slate-50 p-6 dark:bg-slate-800/60">
            <p className="font-medium text-slate-900 dark:text-white">
              No upcoming appointments
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Your scheduled appointments will appear here when available.
            </p>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Recent appointment history
          </h2>
          <Link
            href="/patients/appointments"
            className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
          >
            View all
          </Link>
        </div>

        {recentAppointments.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Your previous appointments will appear here.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">
            {recentAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {appointment.procedure}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {formatDate(appointment.scheduledDate)} ·{" "}
                    {appointment.department.name}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(appointment.status)}`}
                >
                  {formatLabel(appointment.status)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
