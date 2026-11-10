'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { Plus } from '@phosphor-icons/react';
import { apiClient, ApiClientError } from '@/lib/api/client';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';

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

/**
 * Readiness derived from the maintenance date the record already carries.
 * Nothing is invented: if there is no date, the register says so.
 */
function readinessFor(value?: string | null) {
  if (!value) {
    return { label: 'no date', className: 'text-foreground-subtle' };
  }

  const due = new Date(value);

  if (Number.isNaN(due.getTime())) {
    return { label: 'no date', className: 'text-foreground-subtle' };
  }

  const days = Math.ceil((due.getTime() - Date.now()) / 86_400_000);

  if (days < 0) {
    return {
      label: `overdue ${Math.abs(days)}d`,
      className: 'text-danger font-semibold',
    };
  }

  if (days <= 14) {
    return { label: `due in ${days}d`, className: 'text-warning' };
  }

  return { label: `due in ${days}d`, className: 'text-foreground-secondary' };
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
      <PageHeader
        eyebrow="Resource registry"
        title="Equipment"
        meta={`${counts.total} items · ${counts.available} available · ${counts.maintenance} in maintenance`}
        description="View equipment availability, category, assignment state, and maintenance information."
        actions={
          isAdmin ? (
            <Button type="button" onClick={openCreateForm}>
              <Plus size={15} weight="bold" aria-hidden="true" />
              Add equipment
            </Button>
          ) : null
        }
      />

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
                  className="border-border-strong bg-surface text-foreground placeholder:text-foreground-subtle focus:border-primary focus:ring-primary/20 w-full border px-3 py-2 transition outline-none focus:ring-2"
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
                  className="border-border-strong bg-surface text-foreground placeholder:text-foreground-subtle focus:border-primary focus:ring-primary/20 w-full border px-3 py-2 transition outline-none focus:ring-2"
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
                  className="border-border-strong bg-surface text-foreground placeholder:text-foreground-subtle focus:border-primary focus:ring-primary/20 w-full border px-3 py-2 transition outline-none focus:ring-2"
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
                  className="border-border-strong bg-surface text-foreground placeholder:text-foreground-subtle focus:border-primary focus:ring-primary/20 w-full border px-3 py-2 transition outline-none focus:ring-2"
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
                  className="border-border-strong bg-surface text-foreground placeholder:text-foreground-subtle focus:border-primary focus:ring-primary/20 w-full border px-3 py-2 transition outline-none focus:ring-2"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => setShowForm(false)}
                className="border-border-strong border px-3 py-2 text-sm"
              >
                Cancel
              </button>
              <Button type="submit" disabled={saving}>
                {saving
                  ? 'Saving…'
                  : editingEquipment
                    ? 'Save changes'
                    : 'Create'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {error && (
        <div
          role="alert"
          className="border-danger-border bg-danger-soft text-danger rounded-[14px] border px-4 py-3 text-sm"
        >
          {error}
        </div>
      )}


      <div className="border-rule bg-sheet flex flex-col gap-2 rounded-[15px] border px-4 py-2.5 shadow-xs sm:flex-row sm:items-center sm:gap-4">
        <label htmlFor="equipment-search" className="eyebrow shrink-0">
          Find item
        </label>

        <input
          id="equipment-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Name, category, serial number, department"
          className="text-foreground placeholder:text-foreground-subtle w-full min-w-0 border-0 bg-transparent px-0 py-1 text-sm sm:flex-1"
        />

        <label htmlFor="equipment-status" className="sr-only">
          Filter by status
        </label>

        <select
          id="equipment-status"
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as EquipmentStatus | 'ALL')
          }
          className="border-border-strong bg-surface text-foreground focus:border-primary h-8 shrink-0 rounded-[var(--radius-control)] border px-2 font-mono text-[11px] tracking-[0.08em] uppercase outline-none"
        >
          <option value="ALL">All states</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {formatStatus(option)}
            </option>
          ))}
        </select>
      </div>

      {filteredEquipment.length === 0 ? (
        <EmptyState
          title="No equipment found"
          description="Try changing the search or status filter."
        />
      ) : (
        <section className="panel-flush">
          <header className="border-rule bg-surface-subtle/60 flex flex-wrap items-baseline justify-between gap-2 border-b px-4 py-2.5">
            <h2 className="eyebrow">Inventory register</h2>

            <p className="text-foreground-muted font-mono text-[11px] tabular-nums">
              {filteredEquipment.length} of {equipment.length} items
            </p>
          </header>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-left">
              <thead>
                <tr className="border-border border-b">
                  <th className="eyebrow px-4 py-2 font-normal">Item</th>
                  <th className="eyebrow px-4 py-2 font-normal">Category</th>
                  <th className="eyebrow px-4 py-2 font-normal whitespace-nowrap">
                    Serial
                  </th>
                  <th className="eyebrow px-4 py-2 font-normal">Location</th>
                  <th className="eyebrow px-4 py-2 font-normal whitespace-nowrap">
                    Readiness
                  </th>
                  <th className="eyebrow px-4 py-2 font-normal">State</th>
                  <th className="eyebrow px-4 py-2 text-right font-normal">
                    Manage
                  </th>
                </tr>
              </thead>

              <tbody className="divide-rule-soft divide-y">
                {filteredEquipment.map((item) => {
                  const readiness = readinessFor(item.maintenanceDueAt);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-surface-subtle transition-colors"
                    >
                      <td className="px-4 py-3.5 align-baseline">
                        <p className="text-[14px] leading-tight font-medium">
                          {item.name}
                        </p>
                      </td>

                      <td className="text-foreground-secondary px-4 py-3.5 align-baseline text-[13px]">
                        {item.category}
                      </td>

                      <td className="text-foreground-muted px-4 py-3.5 align-baseline font-mono text-[11px] whitespace-nowrap tabular-nums">
                        {item.serialNumber ?? '—'}
                      </td>

                      <td className="text-foreground-muted px-4 py-3.5 align-baseline font-mono text-[10px] tracking-[0.12em] uppercase">
                        {item.department?.name ?? 'Unassigned'}
                      </td>

                      <td className="px-4 py-3.5 align-baseline whitespace-nowrap">
                        <p
                          className={`font-mono text-[11px] tabular-nums ${readiness.className}`}
                        >
                          {readiness.label}
                        </p>

                        <p className="text-foreground-subtle mt-0.5 font-mono text-[10px] tabular-nums">
                          {formatDate(item.maintenanceDueAt)}
                        </p>
                      </td>

                      <td className="px-4 py-3.5 align-baseline">
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
                            className="border-border-strong bg-surface text-foreground focus:border-primary h-8 rounded-[var(--radius-control)] border px-2 text-[12px] transition outline-none disabled:opacity-50"
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
                          <span className="text-[11px] tracking-[0.14em] uppercase">
                            {formatStatus(item.status)}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right align-baseline whitespace-nowrap">
                        {isAdmin ? (
                          <button
                            type="button"
                            onClick={() => openEditForm(item)}
                            className="text-primary link-draw text-[13px] font-medium"
                          >
                            Edit
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
