"use client";

import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { apiClient, ApiClientError } from "@/lib/api/client";

type DoctorStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED";

interface Doctor {
  id: string;
  userId: string;
  departmentId: string | null;
  specialization: string | null;
  licenseNumber: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    status: DoctorStatus;
  };
  department: {
    id: string;
    name: string;
  } | null;
}

const STATUS_OPTIONS: DoctorStatus[] = [
  "PENDING",
  "ACTIVE",
  "SUSPENDED",
  "REJECTED",
];

function formatStatus(status: DoctorStatus) {
  return status.replaceAll("_", " ");
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

export function DoctorDirectory() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<DoctorStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchDoctors() {
      try {
        const response = await apiClient.get<Doctor[]>("/api/doctors");

        if (!cancelled) {
          setDoctors(response ?? []);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(
            fetchError instanceof ApiClientError
              ? fetchError.message
              : "Failed to load doctors.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchDoctors();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredDoctors = useMemo(() => {
    const query = search.trim().toLowerCase();

    return doctors.filter((doctor) => {
      const matchesSearch =
        !query ||
        [
          doctor.user.name,
          doctor.user.email,
          doctor.user.phone,
          doctor.specialization,
          doctor.licenseNumber,
          doctor.department?.name,
        ].some((value) => value?.toLowerCase().includes(query));

      const matchesStatus =
        status === "ALL" || doctor.user.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [doctors, search, status]);

  const counts = useMemo(
    () => ({
      total: doctors.length,
      active: doctors.filter(
        (doctor) => doctor.user.status === "ACTIVE",
      ).length,
      pending: doctors.filter(
        (doctor) => doctor.user.status === "PENDING",
      ).length,
      other: doctors.filter(
        (doctor) =>
          doctor.user.status === "SUSPENDED" ||
          doctor.user.status === "REJECTED",
      ).length,
    }),
    [doctors],
  );

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <main className="space-y-6">
      <section className="space-y-2">
        <p className="text-sm font-medium text-[var(--color-primary)]">
          Clinical Operations
        </p>

        <h1 className="text-2xl font-semibold tracking-tight">
          Doctor Directory
        </h1>

        <p className="max-w-2xl text-sm text-[var(--color-text-muted)]">
          Review doctor profiles, departments, specializations, and
          account approval status.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-sm text-[var(--color-text-muted)]">
            Total doctors
          </p>
          <p className="mt-2 text-2xl font-semibold">{counts.total}</p>
        </Card>

        <Card>
          <p className="text-sm text-[var(--color-text-muted)]">
            Active
          </p>
          <p className="mt-2 text-2xl font-semibold">{counts.active}</p>
        </Card>

        <Card>
          <p className="text-sm text-[var(--color-text-muted)]">
            Pending approval
          </p>
          <p className="mt-2 text-2xl font-semibold">{counts.pending}</p>
        </Card>

        <Card>
          <p className="text-sm text-[var(--color-text-muted)]">
            Suspended or rejected
          </p>
          <p className="mt-2 text-2xl font-semibold">{counts.other}</p>
        </Card>
      </section>

      <Card>
        <div className="grid gap-4 md:grid-cols-[1fr_220px]">
          <div>
            <label
              htmlFor="doctor-search"
              className="mb-2 block text-sm font-medium"
            >
              Search doctors
            </label>

            <input
              id="doctor-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name, email, specialization, license..."
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)]"
            />
          </div>

          <div>
            <label
              htmlFor="doctor-status"
              className="mb-2 block text-sm font-medium"
            >
              Account status
            </label>

            <select
              id="doctor-status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as DoctorStatus | "ALL")
              }
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)]"
            >
              <option value="ALL">All statuses</option>

              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {formatStatus(option)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {filteredDoctors.length === 0 ? (
        <EmptyState
          title={
            doctors.length === 0
              ? "No doctor profiles"
              : "No matching doctors"
          }
          description={
            doctors.length === 0
              ? "Doctor profiles will appear here when they are created."
              : "Try adjusting your search or status filter."
          }
        />
      ) : (
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-semibold">Doctor profiles</h2>

            <span className="text-sm text-[var(--color-text-muted)]">
              {filteredDoctors.length}{" "}
              {filteredDoctors.length === 1 ? "record" : "records"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                <tr>
                  <th className="px-3 py-3 font-medium">Doctor</th>
                  <th className="px-3 py-3 font-medium">Specialization</th>
                  <th className="px-3 py-3 font-medium">Department</th>
                  <th className="px-3 py-3 font-medium">License number</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Profile created</th>
                </tr>
              </thead>

              <tbody>
                {filteredDoctors.map((doctor) => (
                  <tr
                    key={doctor.id}
                    className="border-b border-[var(--color-border)] last:border-0"
                  >
                    <td className="px-3 py-4">
                      <p className="font-medium">
                        {doctor.user.name || "Unnamed doctor"}
                      </p>
                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        {doctor.user.email}
                      </p>
                    </td>

                    <td className="px-3 py-4">
                      {doctor.specialization || "Not specified"}
                    </td>

                    <td className="px-3 py-4">
                      {doctor.department?.name || "Unassigned"}
                    </td>

                    <td className="px-3 py-4 font-mono text-xs">
                      {doctor.licenseNumber || "—"}
                    </td>

                    <td className="px-3 py-4">
                      <Badge>{formatStatus(doctor.user.status)}</Badge>
                    </td>

                    <td className="px-3 py-4 whitespace-nowrap">
                      {formatDate(doctor.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </main>
  );
}