'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { MagnifyingGlass, UserPlus } from '@phosphor-icons/react';
import { apiClient, ApiClientError } from '@/lib/api/client';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Button } from '@/components/ui/Button';

/*======================================================================
  Patient Registry — a working index, not a table
  ======================================================================
  A clinician does not arrive at this screen to read a grid of rows; they
  arrive with a person in mind. So the screen is a master–detail index:

    · discovery sits at the top, with the record count and the filters that
      actually matter to a ward (contactable / missing a number)
    · the left column is an identity-first list — monogram, name, code,
      contact state — where selecting a person is a single click
    · the right column is that person's plate: the record in full, its
      actions, and, when adding or editing, the form in place

  No horizontal table, no column headers, no row of database fields.

  All data access, validation, permissions and CRUD behaviour are unchanged:
  the same GET/POST/PATCH calls, the same payload shapes, the same
  ADMIN-only create and edit rules.
====================================================================== */

interface Patient {
  id: string;
  patientCode: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  medicalHistory?: string | null;
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

type ContactFilter = 'ALL' | 'REACHABLE' | 'MISSING';

function formatDate(value?: string | null) {
  if (!value) return 'Not recorded';

  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(
    new Date(value),
  );
}

function ageOf(value?: string | null) {
  if (!value) return null;

  const born = new Date(value);

  if (Number.isNaN(born.getTime())) return null;

  const now = new Date();
  let age = now.getFullYear() - born.getFullYear();
  const monthDelta = now.getMonth() - born.getMonth();

  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < born.getDate())) {
    age -= 1;
  }

  return age;
}

function monogram(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/* A compact field so the create and edit sheets share one visual language. */
function Field({
  id,
  label,
  required,
  children,
  className = '',
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="text-ink-secondary mb-1.5 block text-[12px] font-semibold"
      >
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </label>
      {children}
    </div>
  );
}

const INPUT =
  'border-rule bg-sheet text-ink placeholder:text-ink-subtle focus:border-pine w-full rounded-[var(--radius-control)] border px-3 py-2 text-[13px] outline-none transition-colors';

export function PatientRegistry() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [contactFilter, setContactFilter] = useState<ContactFilter>('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';
  const canOpenRecord =
    session?.user?.role === 'ADMIN' || session?.user?.role === 'DOCTOR';

  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState<PatientFormData>(EMPTY_PATIENT_FORM);

  useEffect(() => {
    let cancelled = false;

    async function fetchPatients() {
      try {
        const response = await apiClient.get<Patient[]>('/api/patients');

        if (!cancelled) setPatients(response ?? []);
      } catch (fetchError) {
        if (!cancelled) {
          setError(
            fetchError instanceof ApiClientError
              ? fetchError.message
              : 'Failed to load patients.',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchPatients();

    return () => {
      cancelled = true;
    };
  }, []);

  const contactable = useMemo(
    () => patients.filter((p) => Boolean(p.phone)).length,
    [patients],
  );

  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase();

    return patients.filter((patient) => {
      if (contactFilter === 'REACHABLE' && !patient.phone) return false;
      if (contactFilter === 'MISSING' && patient.phone) return false;

      if (!query) return true;

      return [patient.patientCode, patient.name, patient.email, patient.phone]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [patients, search, contactFilter]);

  // The selection follows the data: a filter that removes the selected person
  // moves the plate to the first remaining record instead of showing a stale one.
  const selected =
    filteredPatients.find((p) => p.id === selectedId) ?? filteredPatients[0] ?? null;

  function updateForm(field: keyof PatientFormData, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
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
      setSelectedId(createdPatient.id);
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

  function openEditForm(patient: Patient) {
    setCreateOpen(false);
    setEditingPatient(patient);
    setFormError('');

    setForm({
      patientCode: patient.patientCode,
      name: patient.name,
      email: patient.email ?? '',
      phone: patient.phone ?? '',
      dateOfBirth: patient.dateOfBirth
        ? new Date(patient.dateOfBirth).toISOString().slice(0, 10)
        : '',
      gender: patient.gender ?? '',
      medicalHistory: patient.medicalHistory ?? '',
    });
  }

  async function handleUpdatePatient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingPatient) return;

    setSaving(true);
    setFormError('');

    const payload = {
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      dateOfBirth: form.dateOfBirth || null,
      gender: form.gender.trim() || null,
      medicalHistory: form.medicalHistory.trim() || null,
    };

    try {
      const updatedPatient = await apiClient.patch<Patient>(
        `/api/patients/${editingPatient.id}`,
        payload,
      );

      setPatients((current) =>
        current.map((patient) =>
          patient.id === updatedPatient.id
            ? { ...patient, ...updatedPatient }
            : patient,
        ),
      );

      setEditingPatient(null);
      setForm(EMPTY_PATIENT_FORM);
    } catch (submitError) {
      setFormError(
        submitError instanceof ApiClientError
          ? submitError.message
          : 'Failed to update patient.',
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const editing = Boolean(editingPatient) || createOpen;

  return (
    <main className="space-y-5">
      {/* Masthead — the registry states its size before you search */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-ink-muted inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.12em] uppercase">
            <span className="bg-primary h-1.5 w-1.5 rounded-full" aria-hidden="true" />
            Clinical operations
          </p>

          <h1 className="text-ink mt-2 font-[family-name:var(--font-display)] text-[clamp(1.9rem,3.4vw,2.6rem)] leading-[1.05] tracking-[-0.02em]">
            Patient index
          </h1>

          <p className="text-ink-muted mt-2 max-w-[52ch] text-[14px]">
            {patients.length} records on file, {contactable} with a contact
            number. Select a person to open their plate.
          </p>
        </div>

        {isAdmin ? (
          <Button
            type="button"
            onClick={() => {
              setCreateOpen(true);
              setEditingPatient(null);
              setForm(EMPTY_PATIENT_FORM);
              setFormError('');
            }}
          >
            <UserPlus size={15} weight="bold" aria-hidden="true" />
            Register patient
          </Button>
        ) : null}
      </header>

      {filteredPatients.length === 0 ? (
        <EmptyState
          title={patients.length === 0 ? 'No patient records' : 'No matching patients'}
          description={
            patients.length === 0
              ? 'Patient records will appear here when they are added.'
              : 'Try a different name, patient code, email, or phone number.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          {/* Identity list */}
          <section aria-label="Patient records" className="panel-flush">
            <div className="border-rule-soft border-b px-3 pt-3 pb-2.5">
              <div className="flex items-baseline justify-between">
                <p className="text-ink text-[12.5px] font-semibold">
                  {filteredPatients.length} patients
                </p>
                <p className="text-ink-subtle text-[10px]">A–Z</p>
              </div>

              <label htmlFor="patient-search" className="sr-only">
                Search patients
              </label>

              <div className="well mt-2 flex items-center gap-2 px-2.5 py-1.5">
                <MagnifyingGlass
                  size={14}
                  className="text-ink-subtle shrink-0"
                  aria-hidden="true"
                />
                <input
                  id="patient-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Name, code, email or phone"
                  className="text-ink placeholder:text-ink-subtle w-full min-w-0 border-0 bg-transparent text-[13px] outline-none"
                />
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter records">
                {(
                  [
                    { key: 'ALL', label: 'All', count: patients.length },
                    { key: 'REACHABLE', label: 'Contactable', count: contactable },
                    { key: 'MISSING', label: 'No number', count: patients.length - contactable },
                  ] as const
                ).map((filter) => {
                  const active = contactFilter === filter.key;

                  return (
                    <button
                      key={filter.key}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setContactFilter(filter.key)}
                      className={`cursor-pointer rounded-full px-2.5 py-1 text-[11.5px] font-semibold transition-colors ${
                        active
                          ? 'bg-primary text-white'
                          : 'text-ink-secondary hover:bg-surface-muted'
                      }`}
                    >
                      {filter.label}
                      <span className={active ? 'ml-1.5 text-white/70' : 'text-ink-subtle ml-1.5'}>
                        {filter.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <ul className="max-h-[34rem] divide-rule-soft divide-y overflow-y-auto">
              {filteredPatients.map((patient) => {
                const active = selected?.id === patient.id;
                const age = ageOf(patient.dateOfBirth);

                return (
                  <li key={patient.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(patient.id);
                        setCreateOpen(false);
                        setEditingPatient(null);
                      }}
                      aria-current={active ? 'true' : undefined}
                      className={`flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors ${
                        active
                          ? 'bg-primary-soft'
                          : 'hover:bg-surface-subtle'
                      }`}
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ${
                          active
                            ? 'bg-primary text-white'
                            : 'bg-surface-muted text-ink-secondary'
                        }`}
                        aria-hidden="true"
                      >
                        {monogram(patient.name)}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="text-ink block truncate text-[14px] font-semibold">
                          {patient.name}
                        </span>
                        <span className="text-ink-muted mt-0.5 block truncate text-[12px]">
                          <span className="font-mono">{patient.patientCode}</span>
                          {age !== null ? ` · ${age}y` : ''}
                          {patient.gender ? ` · ${patient.gender.toLowerCase()}` : ''}
                        </span>
                      </span>

                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${
                          patient.phone
                            ? 'bg-success-soft text-success'
                            : 'bg-warning-soft text-warning'
                        }`}
                      >
                        {patient.phone ? 'Contactable' : 'No number'}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Record plate / form */}
          <section className="panel overflow-hidden lg:sticky lg:top-20">
            {editing ? (
              <form
                onSubmit={editingPatient ? handleUpdatePatient : handleCreatePatient}
                className="space-y-4 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-ink font-[family-name:var(--font-display)] text-xl leading-tight">
                      {editingPatient ? 'Edit record' : 'Register patient'}
                    </h2>
                    <p className="text-ink-muted mt-1 text-[12px]">
                      {editingPatient
                        ? `Record ${editingPatient.patientCode}`
                        : 'Registration and contact details.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingPatient(null);
                      setCreateOpen(false);
                      setForm(EMPTY_PATIENT_FORM);
                      setFormError('');
                    }}
                    className="text-ink-muted hover:bg-surface-muted cursor-pointer rounded-[var(--radius-control)] px-2 py-1 text-[12px] font-semibold"
                  >
                    Cancel
                  </button>
                </div>

                {formError ? (
                  <div
                    role="alert"
                    className="bg-danger-soft text-danger rounded-[var(--radius-control)] px-3 py-2 text-[12px]"
                  >
                    {formError}
                  </div>
                ) : null}

                <div className="grid gap-3 sm:grid-cols-2">
                  {!editingPatient ? (
                    <Field id="patient-code" label="Patient code" required>
                      <input
                        id="patient-code"
                        required
                        maxLength={50}
                        value={form.patientCode}
                        onChange={(e) => updateForm('patientCode', e.target.value)}
                        className={INPUT}
                      />
                    </Field>
                  ) : null}

                  <Field
                    id="patient-name"
                    label="Full name"
                    required
                    className={editingPatient ? 'sm:col-span-2' : ''}
                  >
                    <input
                      id="patient-name"
                      required
                      maxLength={150}
                      value={form.name}
                      onChange={(e) => updateForm('name', e.target.value)}
                      className={INPUT}
                    />
                  </Field>

                  <Field id="patient-email" label="Email">
                    <input
                      id="patient-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => updateForm('email', e.target.value)}
                      className={INPUT}
                    />
                  </Field>

                  <Field id="patient-phone" label="Phone">
                    <input
                      id="patient-phone"
                      type="tel"
                      maxLength={30}
                      value={form.phone}
                      onChange={(e) => updateForm('phone', e.target.value)}
                      className={INPUT}
                    />
                  </Field>

                  <Field id="patient-dob" label="Date of birth">
                    <input
                      id="patient-dob"
                      type="date"
                      value={form.dateOfBirth}
                      onChange={(e) => updateForm('dateOfBirth', e.target.value)}
                      className={INPUT}
                    />
                  </Field>

                  <Field id="patient-gender" label="Gender">
                    <input
                      id="patient-gender"
                      maxLength={30}
                      value={form.gender}
                      onChange={(e) => updateForm('gender', e.target.value)}
                      className={INPUT}
                    />
                  </Field>

                  <Field
                    id="patient-history"
                    label="Medical history"
                    className="sm:col-span-2"
                  >
                    <textarea
                      id="patient-history"
                      rows={3}
                      value={form.medicalHistory}
                      onChange={(e) =>
                        updateForm('medicalHistory', e.target.value)
                      }
                      className={INPUT}
                      placeholder={
                        editingPatient
                          ? 'Authorised clinical context held against this patient.'
                          : undefined
                      }
                    />
                  </Field>
                </div>

                <div className="border-rule-soft flex justify-end gap-2 border-t pt-4">
                  <Button type="submit" disabled={saving}>
                    {saving
                      ? 'Saving…'
                      : editingPatient
                        ? 'Save changes'
                        : 'Create record'}
                  </Button>
                </div>
              </form>
            ) : selected ? (
              <div>
                <div className="border-rule-soft border-b p-5">
                  <div className="flex items-start gap-3">
                    <span
                      className="bg-primary text-white flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[15px] font-semibold"
                      aria-hidden="true"
                    >
                      {monogram(selected.name)}
                    </span>

                    <div className="min-w-0">
                      <h2 className="text-ink truncate font-[family-name:var(--font-display)] text-[1.35rem] leading-tight">
                        {selected.name}
                      </h2>
                      <p className="text-ink-muted mt-1 text-[12px]">
                        <span className="font-mono">{selected.patientCode}</span>
                        {ageOf(selected.dateOfBirth) !== null
                          ? ` · ${ageOf(selected.dateOfBirth)} years`
                          : ''}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-rule-soft grid grid-cols-3 divide-x border-y">
                  {[
                    { label: 'Age', value: ageOf(selected.dateOfBirth) !== null ? String(ageOf(selected.dateOfBirth)) : '—', unit: ageOf(selected.dateOfBirth) !== null ? 'yrs' : '' },
                    { label: 'Sex', value: selected.gender ? selected.gender.slice(0, 3).toUpperCase() : '—', unit: '' },
                    { label: 'Contact', value: selected.phone ? 'On file' : 'Missing', unit: '' },
                  ].map((cell) => (
                    <div key={cell.label} className="px-4 py-3">
                      <p className="text-ink-subtle text-[10px] font-semibold tracking-[0.09em] uppercase">
                        {cell.label}
                      </p>
                      <p className="text-ink mt-1 flex items-baseline gap-1 font-[family-name:var(--font-display)] text-[15px] font-semibold">
                        {cell.value}
                        {cell.unit ? (
                          <span className="text-ink-subtle text-[10px] font-normal">{cell.unit}</span>
                        ) : null}
                      </p>
                    </div>
                  ))}
                </div>

                {!selected.phone ? (
                  <div className="border-rule-soft bg-warning-soft/60 flex items-start gap-2 border-b px-4 py-2.5">
                    <span className="bg-warning mt-1 h-1.5 w-1.5 shrink-0 rounded-full" aria-hidden="true" />
                    <p className="text-ink-secondary text-[11.5px] leading-relaxed">
                      No contact number: this record cannot be reached for scheduling changes.
                    </p>
                  </div>
                ) : null}

                <dl className="divide-rule-soft divide-y">
                  {[
                    { term: 'Date of birth', detail: formatDate(selected.dateOfBirth) },
                    { term: 'Sex', detail: selected.gender || 'Not recorded' },
                    { term: 'Email', detail: selected.email || 'Not recorded' },
                    {
                      term: 'Phone',
                      detail: selected.phone || 'No number on file',
                      mono: Boolean(selected.phone),
                    },
                  ].map((row) => (
                    <div key={row.term} className="flex items-baseline justify-between gap-4 px-5 py-3">
                      <dt className="text-ink-muted text-[12px]">{row.term}</dt>
                      <dd
                        className={`text-right text-[13px] ${
                          row.detail === 'Not recorded' || row.detail === 'No number on file'
                            ? 'text-ink-subtle'
                            : 'text-ink font-medium'
                        } ${row.mono ? 'font-mono' : ''}`}
                      >
                        {row.detail}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="border-rule-soft flex flex-wrap items-center gap-2 border-t p-4">
                  {canOpenRecord ? (
                    <Link
                      href={`/patients/${selected.id}`}
                      className="bg-primary hover:bg-primary-hover rounded-[var(--radius-control)] px-3.5 py-2 text-[13px] font-semibold text-white shadow-sm transition-colors"
                    >
                      Open full record
                    </Link>
                  ) : null}

                  {isAdmin ? (
                    <button
                      type="button"
                      onClick={() => openEditForm(selected)}
                      className="border-rule bg-sheet hover:bg-surface-subtle cursor-pointer rounded-[var(--radius-control)] border px-3.5 py-2 text-[13px] font-semibold transition-colors"
                    >
                      Edit details
                    </button>
                  ) : null}

                  <span className="text-ink-subtle ml-auto font-mono text-[10px]">
                    {filteredPatients.findIndex((p) => p.id === selected.id) + 1} of{' '}
                    {filteredPatients.length}
                  </span>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      )}
    </main>
  );
}
