
"use client";

import { useEffect, useState } from "react";
import { apiClient, ApiClientError } from "@/lib/api/client";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";

type ScheduleStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "DELAYED";

type SchedulePriority = "ELECTIVE" | "URGENT" | "EMERGENCY";

interface DoctorSchedule {
  id: string;
  procedure: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status: ScheduleStatus;
  priority: SchedulePriority;
  patient: {
    name: string;
    patientCode: string;
  };
  department: {
    name: string;
  };
  otRoom: {
    name: string;
    code: string;
  };
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
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


function StatusBadge({ status }: { status: ScheduleStatus }) {
  switch (status) {
    case "IN_PROGRESS":
      return <Badge variant="warning">In Progress</Badge>;
    case "CONFIRMED":
      return <Badge variant="info">Confirmed</Badge>;
    case "COMPLETED":
      return <Badge variant="success">Completed</Badge>;
    case "CANCELLED":
      return <Badge variant="danger">Cancelled</Badge>;
    case "DELAYED":
      return <Badge variant="warning">Delayed</Badge>;
    default:
      return <Badge variant="neutral">Scheduled</Badge>;
  }
}

function PriorityBadge({ priority }: { priority: SchedulePriority }) {
  switch (priority) {
    case "EMERGENCY":
      return <Badge variant="danger">Emergency</Badge>;
    case "URGENT":
      return <Badge variant="warning">Urgent</Badge>;
    default:
      return <Badge variant="neutral">Elective</Badge>;
  }
}

export function DoctorDashboard({
  userName,
}: {
  userName: string;
}) {
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadSchedules() {
      try {
        const data = await apiClient.get<DoctorSchedule[]>(
          "/api/me/schedules",
        );

        if (!cancelled) {
          setSchedules(data);
          setError("");
        }
      } catch (caught: unknown) {
        if (!cancelled) {
          setError(
            caught instanceof ApiClientError
              ? caught.message
              : "Unable to load your assigned procedures.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSchedules();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <LoadingState message="Loading your doctor dashboard..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  const activeSchedules = schedules
    .filter(
      (schedule) =>
        schedule.status !== "COMPLETED" &&
        schedule.status !== "CANCELLED",
    )
    .sort(
      (a, b) => Date.parse(a.startTime) - Date.parse(b.startTime),
    );

  const completedCount = schedules.filter(
    (schedule) => schedule.status === "COMPLETED",
  ).length;

  const urgentCount = schedules.filter(
    (schedule) =>
      schedule.priority === "URGENT" ||
      schedule.priority === "EMERGENCY",
  ).length;

  const metrics = [
    {
      label: "Assigned procedures",
      value: schedules.length,
    },
    {
      label: "Active and scheduled",
      value: activeSchedules.length,
    },
    {
      label: "In progress",
      value: schedules.filter(
        (schedule) => schedule.status === "IN_PROGRESS",
      ).length,
    },
    {
      label: "Completed",
      value: completedCount,
    },
  ];

  const nextSchedule = activeSchedules[0];

  return (
    <main className="space-y-6">
      <header className="flex flex-col justify-between gap-4 rounded-[var(--radius-xl)] border border-border-strong bg-surface p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Clinical workspace
          </p>

          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            Welcome, {userName}
          </h1>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Review your assigned procedures, workload, and surgical schedule.
          </p>
        </div>

        <div className="rounded-[var(--radius-xl)] border border-border-strong bg-surface px-4 py-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Urgent or emergency priority
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {urgentCount}
          </p>
        </div>
      </header>

      <section
        aria-label="Doctor schedule summary"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {metric.label}
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
              {metric.value}
            </p>
          </Card>
        ))}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Next active procedure
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Your next procedure that has not been completed or cancelled.
          </p>
        </div>

        {nextSchedule ? (
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {nextSchedule.procedure}
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {nextSchedule.department.name}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <PriorityBadge priority={nextSchedule.priority} />
                <StatusBadge status={nextSchedule.status} />
              </div>
            </div>

            <div className="mt-5 grid gap-4 border-t border-border-strong pt-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Scheduled date
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                  {formatDate(nextSchedule.scheduledDate)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Procedure time
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                  {formatTime(nextSchedule.startTime)} –{" "}
                  {formatTime(nextSchedule.endTime)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Patient
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                  {nextSchedule.patient.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {nextSchedule.patient.patientCode}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Operating theatre
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                  {nextSchedule.otRoom.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {nextSchedule.otRoom.code}
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <EmptyState
            title="No active procedures"
            description="You currently have no procedures awaiting completion."
          />
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            My surgical schedule
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Procedures assigned to your doctor account.
          </p>
        </div>

        {schedules.length === 0 ? (
          <EmptyState
            title="No assigned procedures"
            description="Procedures assigned to you will appear here."
          />
        ) : (
          <div className="space-y-3">
            {[...schedules]
              .sort(
                (a, b) =>
                  Date.parse(a.startTime) - Date.parse(b.startTime),
              )
              .map((schedule) => (
                <Card key={schedule.id}>
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {schedule.procedure}
                      </h3>

                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {schedule.department.name} · {schedule.otRoom.name}
                      </p>

                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        Patient: {schedule.patient.name} (
                        {schedule.patient.patientCode})
                      </p>

                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {formatDate(schedule.scheduledDate)} ·{" "}
                        {formatTime(schedule.startTime)} –{" "}
                        {formatTime(schedule.endTime)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                      <PriorityBadge priority={schedule.priority} />
                      <StatusBadge status={schedule.status} />

                      <Link
                        href={`/schedules/${schedule.id}`}
                        className="text-sm font-semibold text-primary hover:underline"
                      >
                        View Schedule →
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        )}
      </section>
    </main>
  );
}
