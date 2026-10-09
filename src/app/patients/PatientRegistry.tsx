"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useSession } from "next-auth/react";
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

type PatientFormData = {
  patientCode: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  medicalHistory: string;
};

const EMPTY_PATIENT_FORM: PatientFormData = {
  patientCode: '',
  name: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  medicalHistory: '',
};

export function PatientRegistry() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { data: session } = useSession();

  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState<PatientFormData>(EMPTY_PATIENT_FORM);

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

  function updateForm(field: keyof PatientFormData, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleCreatePatient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setFormError('');

    const payload = {
      patientCode: form.patientCode.trim(),
      name: form.name.trim(),
      ...(form.email.trim() ? { email: form.email.trim() } : {}),
      ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
      ...(form.dateOfBirth ? { dateOfBirth: form.dateOfBirth } : {}),
      ...(form.gender.trim() ? { gender: form.gender.trim() } : {}),
      ...(form.medicalHistory.trim()
        ? { medicalHistory: form.medicalHistory.trim() }
        : {}),
    };

    try {
      const createdPatient = await apiClient.post<Patient>(
        '/api/patients',
        payload,
      );

      setPatients((current) => [createdPatient, ...current]);
      setForm(EMPTY_PATIENT_FORM);
      setSearch('');
      setCreateOpen(false);
    } catch (submitError) {
      setFormError(
        submitError instanceof ApiClientError
          ? submitError.message
          : 'Failed to create patient.',
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <main className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-[var(--color-primary)]">
            Clinical Operations
          </p>

          <h1 className="text-2xl font-semibold tracking-tight">
            Patient Registry
          </h1>

          <p className="max-w-2xl text-sm text-[var(--color-text-muted)]">
            Review patient records and contact information. Search by patient
            code, name, email, or phone number.
          </p>
        </div>

        {session?.user?.role === 'ADMIN' && (
          <button
            type="button"
            onClick={() => {
              setCreateOpen((current) => !current);
              setFormError('');
            }}
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            {createOpen ? 'Close form' : 'Add patient'}
          </button>
        )}
      </section>

      {createOpen && session?.user?.role === 'ADMIN' && (
        <Card>
          <form onSubmit={handleCreatePatient} className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold">Add patient</h2>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Enter the patient's registration and contact details.
              </p>
            </div>

            {formError && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {formError}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="patient-code"
                  className="mb-2 block text-sm font-medium"
                >
                  Patient code *
                </label>
                <input
                  id="patient-code"
                  required
                  maxLength={50}
                  value={form.patientCode}
                  onChange={(event) =>
                    updateForm('patientCode', event.target.value)
                  }
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div>
                <label
                  htmlFor="patient-name"
                  className="mb-2 block text-sm font-medium"
                >
                  Full name *
                </label>
                <input
                  id="patient-name"
                  required
                  maxLength={150}
                  value={form.name}
                  onChange={(event) => updateForm('name', event.target.value)}
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div>
                <label
                  htmlFor="patient-email"
                  className="mb-2 block text-sm font-medium"
                >
                  Email
                </label>
                <input
                  id="patient-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => updateForm('email', event.target.value)}
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div>
                <label
                  htmlFor="patient-phone"
                  className="mb-2 block text-sm font-medium"
                >
                  Phone
                </label>
                <input
                  id="patient-phone"
                  type="tel"
                  maxLength={30}
                  value={form.phone}
                  onChange={(event) => updateForm('phone', event.target.value)}
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div>
                <label
                  htmlFor="patient-dob"
                  className="mb-2 block text-sm font-medium"
                >
                  Date of birth
                </label>
                <input
                  id="patient-dob"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(event) =>
                    updateForm('dateOfBirth', event.target.value)
                  }
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div>
                <label
                  htmlFor="patient-gender"
                  className="mb-2 block text-sm font-medium"
                >
                  Gender
                </label>
                <input
                  id="patient-gender"
                  maxLength={30}
                  value={form.gender}
                  onChange={(event) => updateForm('gender', event.target.value)}
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="patient-history"
                  className="mb-2 block text-sm font-medium"
                >
                  Medical history
                </label>
                <textarea
                  id="patient-history"
                  rows={3}
                  value={form.medicalHistory}
                  onChange={(event) =>
                    updateForm('medicalHistory', event.target.value)
                  }
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setCreateOpen(false);
                  setForm(EMPTY_PATIENT_FORM);
                  setFormError('');
                }}
                className="rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Create patient'}
              </button>
            </div>
          </form>
        </Card>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-sm text-[var(--color-text-muted)]">
            Total patients
          </p>
          <p className="mt-2 text-2xl font-semibold">{patients.length}</p>
        </Card>

        <Card>
          <p className="text-sm text-[var(--color-text-muted)]">
            Contact number recorded
          </p>
          <p className="mt-2 text-2xl font-semibold">{patientsWithPhone}</p>
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
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm transition outline-none focus:border-[var(--color-primary)]"
        />
      </Card>

      {filteredPatients.length === 0 ? (
        <EmptyState
          title={
            patients.length === 0
              ? 'No patient records'
              : 'No matching patients'
          }
          description={
            patients.length === 0
              ? 'Patient records will appear here when they are added.'
              : 'Try a different name, patient code, email, or phone number.'
          }
        />
      ) : (
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-semibold">Patient records</h2>

            <span className="text-sm text-[var(--color-text-muted)]">
              {filteredPatients.length}{' '}
              {filteredPatients.length === 1 ? 'record' : 'records'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                <tr>
                  <th className="px-3 py-3 font-medium">Patient</th>
                  <th className="px-3 py-3 font-medium">Contact</th>
                  <th className="px-3 py-3 font-medium">Date of birth</th>
                  <th className="px-3 py-3 font-medium">Gender</th>
                </tr>
              </thead>

              <tbody>
                {filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="border-b border-[var(--color-border)] last:border-0"
                  >
                    <td className="px-3 py-4">
                      <p className="font-medium">{patient.name}</p>
                      <p className="mt-1 font-mono text-xs text-[var(--color-text-muted)]">
                        {patient.patientCode}
                      </p>
                    </td>

                    <td className="px-3 py-4">
                      <p>{patient.email || '—'}</p>
                      <p className="mt-1 text-[var(--color-text-muted)]">
                        {patient.phone || '—'}
                      </p>
                    </td>

                    <td className="px-3 py-4 whitespace-nowrap">
                      {formatDate(patient.dateOfBirth)}
                    </td>

                    <td className="px-3 py-4">
                      {patient.gender ? <Badge>{patient.gender}</Badge> : '—'}
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