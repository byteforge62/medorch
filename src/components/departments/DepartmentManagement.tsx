'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { apiClient, ApiClientError } from '@/lib/api/client';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';

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

const inputClass =
  'w-full rounded-lg border border-border-strong bg-surface px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-foreground-subtle focus:border-primary focus:ring-2 focus:ring-primary/20';

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof ApiClientError ? error.message : fallback;
}

export function DepartmentManagement() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<DepartmentStatus>('ALL');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState<DepartmentForm>({ ...EMPTY_FORM });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const [departmentData, doctorData] = await Promise.all([
      apiClient.get<Department[]>('/api/departments'),
      apiClient.get<DoctorOption[]>('/api/doctors'),
    ]);

    return { departmentData, doctorData };
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { departmentData, doctorData } = await fetchData();

      setDepartments(departmentData);
      setDoctors(doctorData);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Failed to load department data.',
      );
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  useEffect(() => {
    let cancelled = false;

    fetchData()
      .then(({ departmentData, doctorData }) => {
        if (cancelled) return;

        setDepartments(departmentData);
        setDoctors(doctorData);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;

        setError(getErrorMessage(err, 'Failed to load departments.'));
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fetchData]);

  const filteredDepartments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return departments.filter((department) => {
      const matchesSearch =
        !query ||
        department.name.toLowerCase().includes(query) ||
        (department.description ?? '').toLowerCase().includes(query) ||
        (department.headDoctor?.user.name ?? '').toLowerCase().includes(query);

      const matchesStatus =
        status === 'ALL' ||
        (status === 'ACTIVE' && department.isActive) ||
        (status === 'INACTIVE' && !department.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [departments, search, status]);

  const counts = useMemo(
    () => ({
      total: departments.length,
      active: departments.filter((item) => item.isActive).length,
      inactive: departments.filter((item) => !item.isActive).length,
      doctors: departments.reduce((sum, item) => sum + item._count.doctors, 0),
    }),
    [departments],
  );

  function openCreateForm() {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setFormError(null);
    setNotice(null);
    setShowForm(true);
  }

  function openEditForm(department: Department) {
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

  function updateForm<K extends keyof DepartmentForm>(
    key: K,
    value: DepartmentForm[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    setNotice(null);

    const name = form.name.trim();
    const description = form.description.trim();

    if (name.length < 2) {
      setFormError('Department name must contain at least 2 characters.');
      setSaving(false);
      return;
    }

    if (name.length > 100 || description.length > 500) {
      setFormError('The name or description exceeds the permitted length.');
      setSaving(false);
      return;
    }

    try {
      if (editing) {
        await apiClient.patch<Department>(`/api/departments/${editing.id}`, {
          name,
          description: description || null,
          headDoctorId: form.headDoctorId || null,
        });

        setNotice('Department updated successfully.');
      } else {
        await apiClient.post<Department>('/api/departments', {
          name,
          ...(description ? { description } : {}),
          ...(form.headDoctorId ? { headDoctorId: form.headDoctorId } : {}),
        });

        setNotice('Department created successfully.');
      }

      setShowForm(false);
      setEditing(null);
      await refreshData();
    } catch (err) {
      setFormError(
        getErrorMessage(
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

  async function toggleDepartmentStatus(department: Department) {
    const action = department.isActive ? 'deactivate' : 'reactivate';

    if (
      !window.confirm(
        `Are you sure you want to ${action} "${department.name}"?`,
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

      setNotice(`Department ${action}d successfully.`);
      await refreshData();
    } catch (err) {
      setError(getErrorMessage(err, `Failed to ${action} department.`));
    } finally {
      setPendingActionId(null);
    }
  }

  if (loading) {
    return <LoadingState message="Loading departments..." />;
  }

  if (error && departments.length === 0) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          void refreshData();
        }}
      />
    );
  }

  return (
    <main className="space-y-6 p-6 lg:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--color-primary)]">
            Organisation
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
            Department Management
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--color-foreground-muted)]">
            Organise clinical departments, assign department heads, and monitor
            their associated doctors, operating rooms, equipment, and schedules.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={openCreateForm}
            className="text-foreground-inverse rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
          >
            + New department
          </button>
        )}
      </header>

      {!isAdmin && (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm text-[var(--color-foreground-secondary)]">
          Read-only department access. Only administrators can create, edit, or
          deactivate departments.
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="border-success/30 bg-success/10 text-success rounded-lg border px-4 py-3 text-sm"
        >
          {notice}
        </div>
      )}

      {error && (
        <div className="border-danger/30 bg-danger/10 text-danger rounded-lg border px-4 py-3 text-sm">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void refreshData()}
            className="mt-2 font-semibold underline"
          >
            Retry loading
          </button>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-sm text-[var(--color-foreground-muted)]">
            Total departments
          </p>
          <p className="mt-2 text-2xl font-semibold text-[var(--color-foreground)]">
            {counts.total}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-[var(--color-foreground-muted)]">Active</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--color-foreground)]">
            {counts.active}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-[var(--color-foreground-muted)]">
            Inactive
          </p>
          <p className="mt-2 text-2xl font-semibold text-[var(--color-foreground)]">
            {counts.inactive}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-[var(--color-foreground-muted)]">
            Doctors across departments
          </p>
          <p className="mt-2 text-2xl font-semibold text-[var(--color-foreground)]">
            {counts.doctors}
          </p>
        </Card>
      </section>

      <Card>
        <div className="grid gap-4 md:grid-cols-[1fr_220px]">
          <div>
            <label
              htmlFor="department-search"
              className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
            >
              Search departments
            </label>
            <input
              id="department-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name, description, or department head"
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="department-status"
              className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
            >
              Status
            </label>
            <select
              id="department-status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as DepartmentStatus)
              }
              className={inputClass}
            >
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      </Card>

      {filteredDepartments.length === 0 ? (
        <EmptyState
          title="No departments found"
          description={
            departments.length === 0
              ? 'Create a department to start organising clinical operations.'
              : 'Try a different search term or status filter.'
          }
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredDepartments.map((department) => (
            <Card key={department.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold text-[var(--color-foreground)]">
                    {department.name}
                  </h2>
                  <p className="mt-1 text-xs text-[var(--color-foreground-muted)]">
                    Created{' '}
                    {new Date(department.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>

                <Badge>{department.isActive ? 'Active' : 'Inactive'}</Badge>
              </div>

              <p className="mt-4 min-h-10 text-sm text-[var(--color-foreground-secondary)]">
                {department.description || 'No description provided.'}
              </p>

              <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3">
                <p className="text-xs text-[var(--color-foreground-muted)]">
                  Department head
                </p>
                <p className="mt-1 text-sm font-medium text-[var(--color-foreground)]">
                  {department.headDoctor?.user.name ?? 'Not assigned'}
                </p>
                {department.headDoctor?.user.email && (
                  <p className="mt-0.5 text-xs break-all text-[var(--color-foreground-muted)]">
                    {department.headDoctor.user.email}
                  </p>
                )}
                {department.headDoctor?.specialization && (
                  <p className="mt-1 text-xs text-[var(--color-foreground-secondary)]">
                    {department.headDoctor.specialization}
                  </p>
                )}
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3">
                {(
                  [
                    ['Doctors', department._count.doctors],
                    ['OT rooms', department._count.otRooms],
                    ['Equipment', department._count.equipment],
                    ['Schedules', department._count.schedules],
                  ] as const
                ).map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-lg border border-[var(--color-border)] px-3 py-2"
                  >
                    <dt className="text-xs text-[var(--color-foreground-muted)]">
                      {label}
                    </dt>
                    <dd className="mt-1 text-lg font-semibold text-[var(--color-foreground)]">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>

              {isAdmin && (
                <div className="mt-5 flex flex-wrap gap-2 border-t border-[var(--color-border)] pt-4">
                  <button
                    type="button"
                    onClick={() => openEditForm(department)}
                    className="border-border-strong rounded-lg border px-3 py-2 text-xs font-semibold text-[var(--color-foreground-secondary)] hover:bg-[var(--color-surface-muted)]"
                  >
                    Edit department
                  </button>

                  <button
                    type="button"
                    onClick={() => void toggleDepartmentStatus(department)}
                    disabled={pendingActionId === department.id}
                    className="border-border-strong rounded-lg border px-3 py-2 text-xs font-semibold text-[var(--color-foreground-secondary)] hover:bg-[var(--color-surface-muted)] disabled:opacity-50"
                  >
                    {pendingActionId === department.id
                      ? 'Updating...'
                      : department.isActive
                        ? 'Deactivate'
                        : 'Reactivate'}
                  </button>
                </div>
              )}
            </Card>
          ))}
        </section>
      )}

      {showForm && (
        <div
          className="bg-surface/50 fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="department-form-title"
            className="my-auto w-full max-w-xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="department-form-title"
                  className="text-lg font-semibold text-[var(--color-foreground)]"
                >
                  {editing ? 'Edit department' : 'Create department'}
                </h2>
                <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">
                  Department names must be unique.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                aria-label="Close department form"
                className="rounded-lg px-2 py-1 text-xl text-[var(--color-foreground-muted)] hover:bg-[var(--color-surface-muted)] disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="department-name"
                  className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
                >
                  Department name <span aria-hidden="true">*</span>
                </label>
                <input
                  id="department-name"
                  required
                  minLength={2}
                  maxLength={100}
                  value={form.name}
                  onChange={(event) => updateForm('name', event.target.value)}
                  className={inputClass}
                  placeholder="e.g. Cardiology"
                />
              </div>

              <div>
                <label
                  htmlFor="department-description"
                  className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
                >
                  Description
                </label>
                <textarea
                  id="department-description"
                  rows={3}
                  maxLength={500}
                  value={form.description}
                  onChange={(event) =>
                    updateForm('description', event.target.value)
                  }
                  className={inputClass}
                  placeholder="Describe the department's scope..."
                />
                <p className="mt-1 text-right text-xs text-[var(--color-foreground-muted)]">
                  {form.description.length}/500
                </p>
              </div>

              <div>
                <label
                  htmlFor="department-head"
                  className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
                >
                  Head doctor
                </label>
                <select
                  id="department-head"
                  value={form.headDoctorId}
                  onChange={(event) =>
                    updateForm('headDoctorId', event.target.value)
                  }
                  className={inputClass}
                >
                  <option value="">Not assigned</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.user.name} — {doctor.user.email}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-[var(--color-foreground-muted)]">
                  Choose a doctor profile. Each department can have one head.
                </p>
              </div>

              {formError && (
                <p
                  role="alert"
                  className="border-danger/30 bg-danger/10 text-danger rounded-lg border px-3 py-2 text-sm"
                >
                  {formError}
                </p>
              )}

              <div className="flex justify-end gap-3 border-t border-[var(--color-border)] pt-4">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="border-border-strong rounded-lg border px-4 py-2.5 text-sm font-semibold text-[var(--color-foreground-secondary)] hover:bg-[var(--color-surface-muted)] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="text-foreground-inverse rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                >
                  {saving
                    ? 'Saving...'
                    : editing
                      ? 'Save changes'
                      : 'Create department'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
