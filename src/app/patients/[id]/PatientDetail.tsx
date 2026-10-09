'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { apiClient, ApiClientError } from '@/lib/api/client';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';

interface PatientDetailRecord {
  id: string;
  patientCode: string;
  name: string;
  email: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  medicalHistory: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    status: string;
  } | null;
}

function formatDate(value: string | null) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
  }).format(date);
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-sm text-[var(--color-text-muted)]">{label}</dt>
      <dd className="mt-1 text-sm font-medium break-words">{value || '—'}</dd>
    </div>
  );
}

export function PatientDetail({ patientId }: { patientId: string }) {
  const [patient, setPatient] = useState<PatientDetailRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function fetchPatient() {
      try {
        const response = await apiClient.get<PatientDetailRecord>(
          `/api/patients/${patientId}`,
        );

        if (!cancelled) {
          setPatient(response);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(
            fetchError instanceof ApiClientError
              ? fetchError.message
              : 'Failed to load patient details.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchPatient();

    return () => {
      cancelled = true;
    };
  }, [patientId]);

  if (loading) {
    return <LoadingState />;
  }

  if (error || !patient) {
    return (
      <main className="space-y-4">
        <Link
          href="/patients"
          className="text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          ← Patient Registry
        </Link>

        <ErrorState message={error || 'Patient record not found.'} />
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <Link
        href="/patients"
        className="text-sm font-medium text-[var(--color-primary)] hover:underline"
      >
        ← Patient Registry
      </Link>

      <section className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--color-primary)]">
            Clinical Operations
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {patient.name}
          </h1>

          <p className="mt-2 font-mono text-sm text-[var(--color-text-muted)]">
            Patient code: {patient.patientCode}
          </p>
        </div>

        <Badge>Patient record</Badge>
      </section>

      <Card>
        <h2 className="font-semibold">Patient information</h2>

        <dl className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <DetailField label="Full name" value={patient.name} />
          <DetailField label="Email" value={patient.email} />
          <DetailField label="Phone" value={patient.phone} />
          <DetailField
            label="Date of birth"
            value={formatDate(patient.dateOfBirth)}
          />
          <DetailField label="Gender" value={patient.gender} />
          <DetailField
            label="Registered"
            value={formatDate(patient.createdAt)}
          />
          <DetailField
            label="Last updated"
            value={formatDate(patient.updatedAt)}
          />
        </dl>
      </Card>

      <Card>
        <h2 className="font-semibold">Medical history</h2>

        <div className="mt-4 rounded-lg border border-[var(--color-border)] p-4">
          <p className="text-sm leading-6 whitespace-pre-wrap">
            {patient.medicalHistory?.trim() ||
              'No medical history has been recorded.'}
          </p>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold">Linked user account</h2>

        {patient.user ? (
          <>
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <DetailField label="Account name" value={patient.user.name} />
              <DetailField label="Account email" value={patient.user.email} />
              <DetailField label="Account phone" value={patient.user.phone} />
            </div>

            <div className="mt-4">
              <Badge>{patient.user.status}</Badge>
            </div>
          </>
        ) : (
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">
            No user account is linked to this patient record.
          </p>
        )}
      </Card>
    </main>
  );
}
