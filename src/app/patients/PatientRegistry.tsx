"use client";

import { useEffect, useMemo, useState } from "react";

import { apiClient, ApiClientError } from "@/lib/api/client";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";

interface Patient {
  id: string;
  patientCode: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
}

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function PatientRegistry() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchPatients() {
      try {
        const response =
          await apiClient.get<Patient[]>("/api/patients");

        if (!cancelled) {
          setPatients(response ?? []);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(
            fetchError instanceof ApiClientError
              ? fetchError.message
              : "Failed to load patients.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchPatients();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredPatients = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return patients;
    }

    return patients.filter((patient) =>
      [
        patient.patientCode,
        patient.name,
        patient.email,
        patient.phone,
      ].some((value) =>
        value?.toLowerCase().includes(normalizedSearch),
      ),
    );
  }, [patients, search]);

  const patientsWithPhone = useMemo(
    () => patients.filter((patient) => patient.phone).length,
    [patients],
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
          Patient Registry
        </h1>

        <p className="max-w-2xl text-sm text-[var(--color-text-muted)]">
          Review patient records and contact information.
          Search by patient code, name, email, or phone number.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-sm text-[var(--color-text-muted)]">
            Total patients
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {patients.length}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-[var(--color-text-muted)]">
            Contact number recorded
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {patientsWithPhone}
          </p>
        </Card>
      </section>

      <Card>
        <label
          htmlFor="patient-search"
          className="mb-2 block text-sm font-medium"
        >
          Search patients
        </label>

        <input
          id="patient-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Patient code, name, email, or phone"
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)]"
        />
      </Card>

      {filteredPatients.length === 0 ? (
        <EmptyState
          title={
            patients.length === 0
              ? "No patient records"
              : "No matching patients"
          }
          description={
            patients.length === 0
              ? "Patient records will appear here when they are added."
              : "Try a different name, patient code, email, or phone number."
          }
        />
      ) : (
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-semibold">Patient records</h2>

            <span className="text-sm text-[var(--color-text-muted)]">
              {filteredPatients.length}{" "}
              {filteredPatients.length === 1 ? "record" : "records"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                <tr>
                  <th className="px-3 py-3 font-medium">
                    Patient
                  </th>
                  <th className="px-3 py-3 font-medium">
                    Contact
                  </th>
                  <th className="px-3 py-3 font-medium">
                    Date of birth
                  </th>
                  <th className="px-3 py-3 font-medium">
                    Gender
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="border-b border-[var(--color-border)] last:border-0"
                  >
                    <td className="px-3 py-4">
                      <p className="font-medium">
                        {patient.name}
                      </p>
                      <p className="mt-1 font-mono text-xs text-[var(--color-text-muted)]">
                        {patient.patientCode}
                      </p>
                    </td>

                    <td className="px-3 py-4">
                      <p>{patient.email || "—"}</p>
                      <p className="mt-1 text-[var(--color-text-muted)]">
                        {patient.phone || "—"}
                      </p>
                    </td>

                    <td className="px-3 py-4 whitespace-nowrap">
                      {formatDate(patient.dateOfBirth)}
                    </td>

                    <td className="px-3 py-4">
                      {patient.gender ? (
                        <Badge>{patient.gender}</Badge>
                      ) : (
                        "—"
                      )}
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