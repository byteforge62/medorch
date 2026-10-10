"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { apiClient, ApiClientError } from "@/lib/api/client";

interface DoctorSchedule {
  id: string;
  procedure: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status: string;
  priority: string;
  department: {
    id: string;
    name: string;
  };
  otRoom: {
    id: string;
    name: string;
    code: string;
  };
}

interface DoctorDetailRecord {
  id: string;
  userId: string;
  departmentId: string | null;
  specialization: string | null;
  licenseNumber: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    status: string;
  };
  department: {
    id: string;
    name: string;
  } | null;
  schedules: DoctorSchedule[];
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(date);
}

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatStatus(value: string) {
  return value.replaceAll("_", " ");
}

export function DoctorDetail({
  doctorId,
}: {
  doctorId: string;
}) {
  const [doctor, setDoctor] = useState<DoctorDetailRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchDoctor() {
      try {
        const response = await apiClient.get<DoctorDetailRecord>(
          `/api/doctors/${doctorId}`,
        );

        if (!cancelled) {
          setDoctor(response);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(
            fetchError instanceof ApiClientError
              ? fetchError.message
              : "Failed to load doctor details.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchDoctor();

    return () => {
      cancelled = true;
    };
  }, [doctorId]);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!doctor) {
    return <ErrorState message="Doctor record was not found." />;
  }

  return (
    <main className="space-y-6">
      <div>
        <Link
          href="/doctors"
          className="text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          ← Back to Doctor Directory
        </Link>

        <div className="mt-4">
          <p className="text-sm font-medium text-[var(--color-primary)]">
            Clinical Operations
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {doctor.user.name || "Unnamed doctor"}
          </h1>

          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Doctor profile and scheduled operating-theatre procedures.
          </p>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-sm text-[var(--color-text-muted)]">
            Account status
          </p>
          <div className="mt-2">
            <Badge>{formatStatus(doctor.user.status)}</Badge>
          </div>
        </Card>

        <Card>
          <p className="text-sm text-[var(--color-text-muted)]">
            Department
          </p>
          <p className="mt-2 font-semibold">
            {doctor.department?.name || "Unassigned"}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-[var(--color-text-muted)]">
            Specialization
          </p>
          <p className="mt-2 font-semibold">
            {doctor.specialization || "Not specified"}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-[var(--color-text-muted)]">
            Scheduled procedures
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {doctor.schedules.length}
          </p>
        </Card>
      </section>

      <Card>
        <h2 className="font-semibold">Account and profile information</h2>

        <dl className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm text-[var(--color-text-muted)]">
              Email address
            </dt>
            <dd className="mt-1 break-all text-sm font-medium">
              {doctor.user.email}
            </dd>
          </div>

          <div>
            <dt className="text-sm text-[var(--color-text-muted)]">
              Phone number
            </dt>
            <dd className="mt-1 text-sm font-medium">
              {doctor.user.phone || "Not provided"}
            </dd>
          </div>

          <div>
            <dt className="text-sm text-[var(--color-text-muted)]">
              License number
            </dt>
            <dd className="mt-1 text-sm font-medium">
              {doctor.licenseNumber || "Not provided"}
            </dd>
          </div>

          <div>
            <dt className="text-sm text-[var(--color-text-muted)]">
              Profile created
            </dt>
            <dd className="mt-1 text-sm font-medium">
              {formatDate(doctor.createdAt)}
            </dd>
          </div>

          <div>
            <dt className="text-sm text-[var(--color-text-muted)]">
              Last profile update
            </dt>
            <dd className="mt-1 text-sm font-medium">
              {formatDate(doctor.updatedAt)}
            </dd>
          </div>
        </dl>
      </Card>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Schedule history</h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Operating-theatre procedures assigned to this surgeon.
          </p>
        </div>

        {doctor.schedules.length === 0 ? (
          <EmptyState
            title="No scheduled procedures"
            description="Procedures assigned to this doctor will appear here."
          />
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                  <tr>
                    <th className="px-3 py-3 font-medium">Procedure</th>
                    <th className="px-3 py-3 font-medium">Scheduled date</th>
                    <th className="px-3 py-3 font-medium">Time</th>
                    <th className="px-3 py-3 font-medium">Department</th>
                    <th className="px-3 py-3 font-medium">Operating theatre</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 font-medium">Priority</th>
                  </tr>
                </thead>

                <tbody>
                  {doctor.schedules.map((schedule) => (
                    <tr
                      key={schedule.id}
                      className="border-b border-[var(--color-border)] last:border-0"
                    >
                      <td className="px-3 py-4 font-medium">
                        {schedule.procedure}
                      </td>

                      <td className="whitespace-nowrap px-3 py-4">
                        {formatDate(schedule.scheduledDate)}
                      </td>

                      <td className="whitespace-nowrap px-3 py-4">
                        {formatTime(schedule.startTime)} –{" "}
                        {formatTime(schedule.endTime)}
                      </td>

                      <td className="px-3 py-4">
                        {schedule.department.name}
                      </td>

                      <td className="px-3 py-4">
                        <p>{schedule.otRoom.name}</p>
                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                          {schedule.otRoom.code}
                        </p>
                      </td>

                      <td className="px-3 py-4">
                        <Badge>{formatStatus(schedule.status)}</Badge>
                      </td>

                      <td className="px-3 py-4">
                        {formatStatus(schedule.priority)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </section>
    </main>
  );
}
