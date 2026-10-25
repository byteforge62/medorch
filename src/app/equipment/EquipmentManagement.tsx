'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { apiClient, ApiClientError } from '@/lib/api/client';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';

type EquipmentStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'RETIRED';

interface Equipment {
  id: string;
  name: string;
  category: string;
  departmentId?: string | null;
  serialNumber?: string | null;
  status: EquipmentStatus;
  maintenanceDueAt?: string | null;
  department?: {
    id: string;
    name: string;
  } | null;
}

interface DepartmentOption {
  id: string;
  name: string;
}

interface EquipmentForm {
  name: string;
  category: string;
  serialNumber: string;
  departmentId: string;
  maintenanceDueAt: string;
}

const EMPTY_FORM: EquipmentForm = {
  name: '',
  category: '',
  serialNumber: '',
  departmentId: '',
  maintenanceDueAt: '',
};

const STATUS_OPTIONS: EquipmentStatus[] = [
  'AVAILABLE',
  'IN_USE',
  'MAINTENANCE',
  'RETIRED',
];

function formatStatus(status: EquipmentStatus) {
  return status.replace('_', ' ');
}

function formatDate(value?: string | null) {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

export function EquipmentManagement() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<EquipmentStatus | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingEquipmentId, setUpdatingEquipmentId] = useState<string | null>(
    null,
  );
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(
    null,
  );
  const [form, setForm] = useState<EquipmentForm>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;

    apiClient
      .get<DepartmentOption[]>('/api/departments')
      .then((response) => {
        if (!cancelled) setDepartments(response);
      })
      .catch((fetchError: unknown) => {
        if (!cancelled) {
          setFormError(
            fetchError instanceof ApiClientError
              ? fetchError.message
              : 'Failed to load departments.',
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  function openCreateForm() {
    setEditingEquipment(null);
    setForm({ ...EMPTY_FORM });
    setFormError('');
    setShowForm(true);
  }

  function openEditForm(item: Equipment) {
    setEditingEquipment(item);
    setForm({
      name: item.name,
      category: item.category,
      serialNumber: item.serialNumber ?? '',
      departmentId: item.department?.id ?? item.departmentId ?? '',
      maintenanceDueAt: item.maintenanceDueAt
        ? new Date(item.maintenanceDueAt).toISOString().slice(0, 10)
        : '',
    });
    setFormError('');
    setShowForm(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFormError('');

    const common = {
      name: form.name.trim(),
      category: form.category.trim(),
    };
    const payload = editingEquipment
      ? {
          ...common,
          serialNumber: form.serialNumber.trim() || null,
          departmentId: form.departmentId || null,
          maintenanceDueAt: form.maintenanceDueAt || null,
        }
      : {
          ...common,
          ...(form.serialNumber.trim()
            ? { serialNumber: form.serialNumber.trim() }
            : {}),
          ...(form.departmentId ? { departmentId: form.departmentId } : {}),
          ...(form.maintenanceDueAt
            ? { maintenanceDueAt: form.maintenanceDueAt }
            : {}),
        };

    try {
      const saved = editingEquipment
        ? await apiClient.patch<Equipment>(
            `/api/equipment/${editingEquipment.id}`,
            payload,
          )
        : await apiClient.post<Equipment>('/api/equipment', payload);
      setEquipment((current) =>
        editingEquipment
          ? current.map((item) =>
              item.id === saved.id ? { ...item, ...saved } : item,
            )
          : [saved, ...current],
      );
      setShowForm(false);
      setEditingEquipment(null);
      setForm({ ...EMPTY_FORM });
    } catch (submitError) {
      setFormError(
        submitError instanceof ApiClientError
          ? submitError.message
          : `Failed to ${editingEquipment ? 'update' : 'create'} equipment.`,
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(id: string, nextStatus: EquipmentStatus) {
    setUpdatingEquipmentId(id);
    setError('');

    try {
      const updated = await apiClient.patch<Equipment>(
        `/api/equipment/${id}/status`,
        { status: nextStatus },
      );
      setEquipment((current) =>
        current.map((item) =>
          item.id === id ? { ...item, ...updated } : item,
        ),
      );
    } catch (updateError) {
      setError(
        updateError instanceof ApiClientError
          ? updateError.message
          : 'Failed to update equipment status.',
      );
    } finally {
      setUpdatingEquipmentId(null);
    }
  }

  useEffect(() => {
    let cancelled = false;

    const fetchEquipment = async () => {
      try {
        const response = await apiClient.get<Equipment[]>('/api/equipment');

        if (!cancelled) {
          setEquipment(response ?? []);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(
            fetchError instanceof ApiClientError
              ? fetchError.message
              : 'Failed to load equipment.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchEquipment();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredEquipment = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return equipment.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        item.name.toLowerCase().includes(normalizedSearch) ||
        item.category.toLowerCase().includes(normalizedSearch) ||
        item.serialNumber?.toLowerCase().includes(normalizedSearch) ||
        item.department?.name.toLowerCase().includes(normalizedSearch);

      const matchesStatus = status === 'ALL' || item.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [equipment, search, status]);

  const counts = useMemo(
    () => ({
      total: equipment.length,
      available: equipment.filter((item) => item.status === 'AVAILABLE').length,
      inUse: equipment.filter((item) => item.status === 'IN_USE').length,
      maintenance: equipment.filter((item) => item.status === 'MAINTENANCE')
        .length,
    }),
    [equipment],
  );

  if (loading) {
    return <LoadingState />;
  }

  if (error && equipment.length === 0) {
    return <ErrorState message={error} />;
  }

  return (
    <main className="space-y-6">
      <section className="space-y-2">
        <p className="text-sm font-medium text-[var(--color-primary)]">
          Resource Registry
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Equipment</h1>
        <p className="max-w-2xl text-sm text-[var(--color-text-muted)]">
          View equipment availability, category, assignment state, and
          maintenance information.
        </p>
      </section>

      {isAdmin && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white"
          >
            Add equipment
          </button>
        </div>
      )}

      {showForm && isAdmin && (
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-lg font-semibold">
              {editingEquipment ? 'Edit equipment' : 'Add equipment'}
            </h2>
            {formError && (
              <p role="alert" className="text-sm text-[var(--color-danger)]">
                {formError}
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span>Name</span>
                <input
                  required
                  maxLength={150}
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className="border-border-strong bg-surface text-foreground placeholder:text-foreground-subtle focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-3 py-2 transition outline-none focus:ring-2"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span>Category</span>
                <input
                  required
                  maxLength={100}
                  value={form.category}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                  className="border-border-strong bg-surface text-foreground placeholder:text-foreground-subtle focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-3 py-2 transition outline-none focus:ring-2"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span>Serial number</span>
                <input
                  maxLength={100}
                  value={form.serialNumber}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      serialNumber: event.target.value,
                    }))
                  }
                  className="border-border-strong bg-surface text-foreground placeholder:text-foreground-subtle focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-3 py-2 transition outline-none focus:ring-2"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span>Department</span>
                <select
                  value={form.departmentId}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      departmentId: event.target.value,
                    }))
                  }
                  className="border-border-strong bg-surface text-foreground placeholder:text-foreground-subtle focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-3 py-2 transition outline-none focus:ring-2"
                >
                  <option value="">Unassigned</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-sm">
                <span>Maintenance due</span>
                <input
                  type="date"
                  value={form.maintenanceDueAt}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      maintenanceDueAt: event.target.value,
                    }))
                  }
                  className="border-border-strong bg-surface text-foreground placeholder:text-foreground-subtle focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-3 py-2 transition outline-none focus:ring-2"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => setShowForm(false)}
                className="border-border-strong rounded-lg border px-3 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving
                  ? 'Saving…'
                  : editingEquipment
                    ? 'Save changes'
                    : 'Create'}
              </button>
            </div>
          </form>
        </Card>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-danger)]"
        >
          {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-sm text-[var(--color-text-muted)]">Total</p>
          <p className="mt-2 text-2xl font-semibold">{counts.total}</p>
        </Card>

        <Card>
          <p className="text-sm text-[var(--color-text-muted)]">Available</p>
          <p className="mt-2 text-2xl font-semibold">{counts.available}</p>
        </Card>

        <Card>
          <p className="text-sm text-[var(--color-text-muted)]">In Use</p>
          <p className="mt-2 text-2xl font-semibold">{counts.inUse}</p>
        </Card>

        <Card>
          <p className="text-sm text-[var(--color-text-muted)]">Maintenance</p>
          <p className="mt-2 text-2xl font-semibold">{counts.maintenance}</p>
        </Card>
      </section>

      <Card>
        <div className="grid gap-4 md:grid-cols-[1fr_220px]">
          <div>
            <label
              htmlFor="equipment-search"
              className="mb-2 block text-sm font-medium"
            >
              Search equipment
            </label>
            <input
              id="equipment-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name, category, serial number, department"
              className="border-border-strong bg-surface text-foreground placeholder:text-foreground-subtle focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-3 py-2.5 text-sm transition outline-none focus:ring-2"
            />
          </div>

          <div>
            <label
              htmlFor="equipment-status"
              className="mb-2 block text-sm font-medium"
            >
              Status
            </label>
            <select
              id="equipment-status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as EquipmentStatus | 'ALL')
              }
              className="border-border-strong bg-surface text-foreground placeholder:text-foreground-subtle focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-3 py-2.5 text-sm transition outline-none focus:ring-2"
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

      {filteredEquipment.length === 0 ? (
        <EmptyState
          title="No equipment found"
          description="Try changing the search or status filter."
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredEquipment.map((item) => (
            <Card key={item.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate font-semibold">{item.name}</h2>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    {item.category}
                  </p>
                </div>

                {isAdmin ? (
                  <select
                    aria-label={`Status for ${item.name}`}
                    value={item.status}
                    disabled={updatingEquipmentId === item.id}
                    onChange={(event) =>
                      void handleStatusChange(
                        item.id,
                        event.target.value as EquipmentStatus,
                      )
                    }
                    className="border-border-strong bg-surface text-foreground focus:border-primary focus:ring-primary/20 rounded-lg border px-2 py-1 text-xs transition outline-none focus:ring-2"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option
                        key={option}
                        value={option}
                        disabled={option === 'IN_USE'}
                      >
                        {formatStatus(option)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Badge>{formatStatus(item.status)}</Badge>
                )}
              </div>

              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--color-text-muted)]">
                    Serial number
                  </dt>
                  <dd className="text-right">{item.serialNumber ?? '—'}</dd>
                </div>

                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--color-text-muted)]">Department</dt>
                  <dd className="text-right">
                    {item.department?.name ?? 'Unassigned'}
                  </dd>
                </div>

                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--color-text-muted)]">
                    Maintenance due
                  </dt>
                  <dd className="text-right">
                    {formatDate(item.maintenanceDueAt)}
                  </dd>
                </div>
              </dl>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => openEditForm(item)}
                  className="mt-4 text-sm font-medium text-[var(--color-primary)]"
                >
                  Edit details
                </button>
              )}
            </Card>
          ))}
        </section>
      )}
    </main>
  );
}
