'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { MagnifyingGlass, Plus } from '@phosphor-icons/react';
import { apiClient, ApiClientError } from '@/lib/api/client';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Button } from '@/components/ui/Button';

interface DoctorOption {
  id: string;
  specialization?: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    status: string;
  };
}

interface Department {
  id: string;
  name: string;
  description: string | null;
  headDoctorId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  headDoctor: {
    id: string;
    specialization: string | null;
    licenseNumber: string | null;
    user: {
      id: string;
      name: string;
      email: string;
    };
  } | null;
  _count: {
    doctors: number;
    otRooms: number;
    equipment: number;
    schedules: number;
  };
}

type DepartmentStatus = 'ALL' | 'ACTIVE' | 'INACTIVE';

interface DepartmentForm {
  name: string;
  description: string;
  headDoctorId: string;
}

const EMPTY_FORM: DepartmentForm = {
  name: '',
  description: '',
  headDoctorId: '',
};

const INPUT =
  'control mt-2 h-10 w-full px-3 text-[13px] text-ink outline-none placeholder:text-ink-subtle';

function errorMessage(error: unknown, fallback: string) {
  return error instanceof ApiClientError ? error.message : fallback;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Not recorded';

  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(date);
}

function initials(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function DepartmentManagement() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<DepartmentStatus>('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState<DepartmentForm>({ ...EMPTY_FORM });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  const loadDirectory = useCallback(async () => {
    const [departmentData, doctorData] = await Promise.all([
      apiClient.get<Department[]>('/api/departments'),
      apiClient.get<DoctorOption[]>('/api/doctors'),
    ]);

    return { departmentData, doctorData };
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { departmentData, doctorData } = await loadDirectory();
      setDepartments(departmentData);
      setDoctors(doctorData);
    } catch (err) {
      setError(errorMessage(err, 'Failed to load the department directory.'));
    } finally {
      setLoading(false);
    }
  }, [loadDirectory]);

  useEffect(() => {
    let cancelled = false;

    loadDirectory()
      .then(({ departmentData, doctorData }) => {
        if (cancelled) return;
        setDepartments(departmentData);
        setDoctors(doctorData);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(errorMessage(err, 'Failed to load departments.'));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [loadDirectory]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return departments
      .filter((department) => {
        const matchesSearch =
          !query ||
          department.name.toLowerCase().includes(query) ||
          (department.description ?? '').toLowerCase().includes(query) ||
          (department.headDoctor?.user.name ?? '')
            .toLowerCase()
            .includes(query);

        const matchesStatus =
          status === 'ALL' ||
          (status === 'ACTIVE' && department.isActive) ||
          (status === 'INACTIVE' && !department.isActive);

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  }, [departments, search, status]);

  const selected =
    filtered.find((department) => department.id === selectedId) ??
    filtered[0] ??
    null;

  const counts = useMemo(
    () => ({
      total: departments.length,
      active: departments.filter((item) => item.isActive).length,
      inactive: departments.filter((item) => !item.isActive).length,
      doctors: departments.reduce((sum, item) => sum + item._count.doctors, 0),
    }),
    [departments],
  );

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setFormError(null);
    setNotice(null);
    setShowForm(true);
  }

  function openEdit(department: Department) {
    setEditing(department);
    setForm({
      name: department.name,
      description: department.description ?? '',
      headDoctorId: department.headDoctorId ?? '',
    });
    setFormError(null);
    setNotice(null);
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;
    setShowForm(false);
    setEditing(null);
    setFormError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    const description = form.description.trim();

    if (name.length < 2) {
      setFormError('Department name must contain at least 2 characters.');
      return;
    }

    if (name.length > 100 || description.length > 500) {
      setFormError('The name or description exceeds the permitted length.');
      return;
    }

    setSaving(true);
    setFormError(null);
    setNotice(null);

    try {
      if (editing) {
        const saved = await apiClient.patch<Department>(
          `/api/departments/${editing.id}`,
          {
            name,
            description: description || null,
            headDoctorId: form.headDoctorId || null,
          },
        );
        setSelectedId(saved.id);
        setNotice('Department updated.');
      } else {
        const created = await apiClient.post<Department>('/api/departments', {
          name,
          ...(description ? { description } : {}),
          ...(form.headDoctorId ? { headDoctorId: form.headDoctorId } : {}),
        });
        setSelectedId(created.id);
        setNotice('Department created.');
      }

      setShowForm(false);
      setEditing(null);
      await refresh();
    } catch (err) {
      setFormError(
        errorMessage(
          err,
          editing
            ? 'Failed to update department.'
            : 'Failed to create department.',
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(department: Department) {
    const action = department.isActive ? 'deactivate' : 'reactivate';

    if (
      !window.confirm(
        `Are you sure you want to ${action} “${department.name}”?`,
      )
    ) {
      return;
    }

    setPendingActionId(department.id);
    setNotice(null);
    setError(null);

    try {
      if (department.isActive) {
        await apiClient.delete<Department>(`/api/departments/${department.id}`);
      } else {
        await apiClient.patch<Department>(`/api/departments/${department.id}`, {
          isActive: true,
        });
      }

      setNotice(
        department.isActive
          ? 'Department paused. Its record is retained.'
          : 'Department reactivated.',
      );
      await refresh();
    } catch (err) {
      setError(errorMessage(err, `Failed to ${action} department.`));
    } finally {
      setPendingActionId(null);
    }
  }

  if (loading) {
    return <LoadingState message="Loading clinical divisions…" />;
  }

  if (error && departments.length === 0) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          void refresh();
        }}
      />
    );
  }

  return (
    <main className="space-y-6">
      <header className="border-rule border-b pb-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-primary inline-flex items-center gap-2 text-[10.5px] font-semibold tracking-[0.08em] uppercase">
              <span className="bg-primary h-1.5 w-1.5 rounded-full" aria-hidden="true" />
              Organisation
            </p>
            <h1 className="display mt-3 text-[clamp(2rem,4vw,2.85rem)]">
              Clinical divisions
            </h1>
            <p className="lede mt-3 text-[14px]">
              The hospital&apos;s operating structure, the clinician who leads
              each division, and the people, theatres and equipment it holds.
            </p>
          </div>

          {isAdmin ? (
            <Button type="button" onClick={openCreate}>
              <Plus size={15} weight="bold" aria-hidden="true" />
              New department
            </Button>
          ) : null}
        </div>

        <dl className="border-rule-soft bg-rule mt-6 grid grid-cols-2 gap-px border-y sm:grid-cols-4">
          {[
            { term: 'Divisions', value: counts.total },
            { term: 'Operating', value: counts.active },
            { term: 'Paused', value: counts.inactive },
            { term: 'Clinicians', value: counts.doctors },
          ].map((item) => (
            <div key={item.term} className="bg-sheet px-4 py-3">
              <dt className="text-ink-muted text-[11px] font-medium">
                {item.term}
              </dt>
              <dd className="text-ink mt-1 font-mono text-[22px] leading-none tabular-nums">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </header>

      {!isAdmin ? (
        <p className="border-rule bg-surface-subtle text-ink-secondary rounded-[var(--radius-control)] border px-4 py-3 text-[12.5px]">
          Read-only organisational view. Creating, editing and pausing a
          department require administrator access.
        </p>
      ) : null}

      {notice ? (
        <p
          role="status"
          className="border-success/25 bg-success-soft text-success rounded-[var(--radius-control)] border px-4 py-2.5 text-[12.5px]"
        >
          {notice}
        </p>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="border-danger-border bg-danger-soft text-danger flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-control)] border px-4 py-2.5 text-[12.5px]"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => void refresh()}
            className="font-semibold underline underline-offset-4"
          >
            Reload directory
          </button>
        </div>
      ) : null}

      {showForm && isAdmin ? (
        <section
          className="panel overflow-hidden"
          aria-labelledby="department-form-title"
        >
          <div className="border-rule-soft bg-surface-subtle flex items-center justify-between gap-3 border-b px-5 py-3">
            <div>
              <p className="text-ink-subtle text-[10px] font-medium tracking-[0.08em] uppercase">
                {editing ? 'Edit division' : 'New division'}
              </p>
              <h2
                id="department-form-title"
                className="text-ink mt-0.5 text-[15px] font-semibold"
              >
                {editing ? editing.name : 'Add to the operating structure'}
              </h2>
            </div>
            <button
              type="button"
              onClick={closeForm}
              disabled={saving}
              className="text-ink-muted hover:text-ink text-[12px] font-semibold disabled:opacity-50"
            >
              Close
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 p-5">
            {formError ? (
              <p
                role="alert"
                className="border-danger-border bg-danger-soft text-danger rounded-[var(--radius-control)] border px-3 py-2 text-[12.5px]"
              >
                {formError}
              </p>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-ink-secondary text-[12px] font-medium">
                  Department name <span className="text-danger">*</span>
                </span>
                <input
                  required
                  minLength={2}
                  maxLength={100}
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className={INPUT}
                />
              </label>

              <label className="block">
                <span className="text-ink-secondary text-[12px] font-medium">
                  Department head
                </span>
                <select
                  value={form.headDoctorId}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      headDoctorId: event.target.value,
                    }))
                  }
                  className={INPUT}
                >
                  <option value="">No head assigned</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.user.name}
                      {doctor.specialization
                        ? ` — ${doctor.specialization}`
                        : ''}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block md:col-span-2">
                <span className="text-ink-secondary text-[12px] font-medium">
                  Description
                </span>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="What the division is responsible for, and how it relates to theatre operations."
                  className={`${INPUT} h-auto min-h-24 resize-y py-2.5`}
                />
                <span className="text-ink-subtle mt-1 block text-[11px]">
                  {form.description.length}/500
                </span>
              </label>
            </div>

            <div className="border-rule-soft flex items-center justify-end gap-2 border-t pt-4">
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="control text-ink-secondary hover:bg-surface-subtle h-9 px-3.5 text-[12.5px] font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <Button type="submit" size="sm" isLoading={saving}>
                {editing ? 'Save changes' : 'Create department'}
              </Button>
            </div>
          </form>
        </section>
      ) : null}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(17rem,0.76fr)_minmax(0,1.4fr)]">
        <section aria-label="Department directory" className="panel-flush">
          <div className="border-rule-soft border-b p-4">
            <label htmlFor="department-search" className="sr-only">
              Search departments
            </label>
            <div className="control flex h-10 items-center gap-2 px-3">
              <MagnifyingGlass
                size={14}
                className="text-ink-subtle shrink-0"
                aria-hidden="true"
              />
              <input
                id="department-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name, head or description"
                className="text-ink placeholder:text-ink-subtle w-full min-w-0 border-0 bg-transparent text-[13px] outline-none"
              />
            </div>

            <div
              className="mt-3 flex items-center gap-1"
              role="group"
              aria-label="Filter departments by status"
            >
              {(
                [
                  { key: 'ALL', label: 'All', count: departments.length },
                  { key: 'ACTIVE', label: 'Operating', count: counts.active },
                  { key: 'INACTIVE', label: 'Paused', count: counts.inactive },
                ] as const
              ).map((option) => {
                const active = status === option.key;

                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setStatus(option.key)}
                    aria-pressed={active}
                    className={`cursor-pointer rounded-full px-2.5 py-1 text-[11.5px] font-semibold transition-colors ${
                      active
                        ? 'bg-pine text-white'
                        : 'text-ink-secondary hover:bg-surface-subtle'
                    }`}
                  >
                    {option.label}
                    <span
                      className={`ml-1.5 ${
                        active ? 'text-white/65' : 'text-ink-subtle'
                      }`}
                    >
                      {option.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="No departments match"
                description="Try a different search term or status filter."
              />
            </div>
          ) : (
            <ul className="divide-rule-soft max-h-[38rem] divide-y overflow-y-auto">
              {filtered.map((department) => {
                const active = selected?.id === department.id;
                const head = department.headDoctor?.user.name;

                return (
                  <li key={department.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(department.id)}
                      aria-pressed={active}
                      className={`group relative flex w-full cursor-pointer gap-3 px-4 py-3.5 text-left transition-colors ${
                        active ? 'bg-pine-soft' : 'hover:bg-surface-subtle'
                      }`}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span
                            className={`truncate text-[13.5px] font-semibold ${
                              active ? 'text-pine' : 'text-ink'
                            }`}
                          >
                            {department.name}
                          </span>
                          <span className="flex shrink-0 items-center gap-2">
                            <span className="text-ink-subtle font-mono text-[10.5px]">
                              {department._count.doctors} clinicians
                            </span>
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                department.isActive
                                  ? 'bg-success'
                                  : 'bg-rule-strong'
                              }`}
                              aria-hidden="true"
                            />
                          </span>
                        </span>
                        <span className="text-ink-muted mt-0.5 block truncate text-[11.5px]">
                          {head ? `Head: ${head}` : 'No head assigned'}
                        </span>
                        <span className="text-ink-subtle mt-1 flex gap-3 text-[10.5px]">
                          <span>{department._count.otRooms} theatres</span>
                          <span>{department._count.equipment} equipment</span>
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="border-rule-soft text-ink-subtle flex items-center justify-between border-t px-4 py-2.5 text-[10.5px]">
            <span>
              {filtered.length} of {departments.length} divisions
            </span>
            <span>A–Z · active first</span>
          </div>
        </section>

        {selected ? (
          <article
            className="panel overflow-hidden"
            aria-labelledby="division-title"
          >
            <div className="border-rule-soft border-b px-5 py-4 sm:px-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-ink-subtle text-[10px] font-medium tracking-[0.08em] uppercase">
                    Division record
                  </p>
                  <h2
                    id="division-title"
                    className="text-ink mt-1 text-[clamp(1.35rem,2.4vw,1.8rem)] leading-tight font-semibold tracking-[-0.02em]"
                  >
                    {selected.name}
                  </h2>
                  <p className="text-ink-muted mt-2 max-w-[62ch] text-[13px] leading-relaxed">
                    {selected.description ||
                      'No description has been recorded for this division.'}
                  </p>
                </div>

                <span
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    selected.isActive
                      ? 'bg-success-soft text-success'
                      : 'bg-surface-muted text-ink-secondary'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      selected.isActive ? 'bg-success' : 'bg-rule-strong'
                    }`}
                    aria-hidden="true"
                  />
                  {selected.isActive ? 'Operating' : 'Paused'}
                </span>
              </div>

              {isAdmin ? (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openEdit(selected)}
                    className="bg-pine hover:bg-pine-deep h-8 rounded-[var(--radius-control)] px-3 text-[12px] font-semibold text-white transition-colors"
                  >
                    Edit division
                  </button>
                  <button
                    type="button"
                    disabled={pendingActionId === selected.id}
                    onClick={() => void toggleStatus(selected)}
                    className="text-ink-muted hover:text-ink text-[12px] font-semibold disabled:opacity-50"
                  >
                    {selected.isActive
                      ? 'Pause department'
                      : 'Reactivate department'}
                  </button>
                </div>
              ) : null}
            </div>

            <div className="border-rule-soft bg-rule grid gap-px border-b sm:grid-cols-2">
              <div className="bg-sheet px-5 py-4 sm:px-6">
                <p className="text-ink-subtle text-[10.5px] font-medium">
                  Department head
                </p>
                {selected.headDoctor ? (
                  <div className="mt-2 flex items-center gap-3">
                    <span
                      className="bg-pine-soft text-pine flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
                      aria-hidden="true"
                    >
                      {initials(selected.headDoctor.user.name)}
                    </span>
                    <div className="min-w-0">
                      <Link
                        href={`/doctors/${selected.headDoctor.id}`}
                        className="text-ink hover:text-pine block truncate text-[13px] font-semibold"
                      >
                        {selected.headDoctor.user.name}
                      </Link>
                      <p className="text-ink-muted mt-0.5 truncate text-[11.5px]">
                        {selected.headDoctor.specialization ||
                          'Specialty not recorded'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-ink-muted mt-2 text-[12.5px]">
                    No head assigned.
                  </p>
                )}
              </div>

              <div className="bg-sheet px-5 py-4 sm:px-6">
                <p className="text-ink-subtle text-[10.5px] font-medium">
                  Record history
                </p>
                <dl className="mt-2 grid grid-cols-2 gap-3">
                  <div>
                    <dt className="text-ink-muted text-[10.5px]">Created</dt>
                    <dd className="text-ink mt-0.5 text-[12px] font-medium">
                      {formatDate(selected.createdAt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ink-muted text-[10.5px]">Updated</dt>
                    <dd className="text-ink mt-0.5 text-[12px] font-medium">
                      {formatDate(selected.updatedAt)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="px-5 py-4 sm:px-6">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-ink text-[13px] font-semibold">
                  Operational footprint
                </h3>
                <p className="text-ink-subtle text-[10.5px]">
                  Live relationships in this division
                </p>
              </div>

              <dl className="border-rule bg-rule mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-control)] border sm:grid-cols-4">
                {[
                  {
                    term: 'Clinicians',
                    value: selected._count.doctors,
                    note: 'profiles',
                  },
                  {
                    term: 'Theatres',
                    value: selected._count.otRooms,
                    note: 'rooms',
                  },
                  {
                    term: 'Equipment',
                    value: selected._count.equipment,
                    note: 'assets',
                  },
                  {
                    term: 'Case records',
                    value: selected._count.schedules,
                    note: 'all time',
                  },
                ].map((item) => (
                  <div key={item.term} className="bg-sheet px-3.5 py-3">
                    <dt className="text-ink-muted text-[10.5px]">
                      {item.term}
                    </dt>
                    <dd className="text-ink mt-1 font-mono text-[21px] leading-none tabular-nums">
                      {item.value}
                    </dd>
                    <dd className="text-ink-subtle mt-1 text-[10px]">
                      {item.note}
                    </dd>
                  </div>
                ))}
              </dl>

              {!selected.isActive ? (
                <p className="border-warning/25 bg-warning-soft text-ink-secondary mt-4 rounded-[var(--radius-control)] border px-3 py-2 text-[11.5px] leading-relaxed">
                  This division is paused. Its existing records remain visible,
                  but it is not an operating unit.
                </p>
              ) : null}
            </div>
          </article>
        ) : (
          <section className="panel p-6">
            <EmptyState
              title="No division selected"
              description="Choose a department from the directory to inspect its operational footprint."
            />
          </section>
        )}
      </div>
    </main>
  );
}
