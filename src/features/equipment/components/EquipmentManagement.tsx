'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { FirstAidKit, Plus } from '@phosphor-icons/react';
import { apiClient, ApiClientError } from '@/lib/api/client';
import { EmptyState } from '@/components/ui/EmptyState';
import { Field, Select, TextInput } from '@/components/ui/Input';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { EQUIPMENT_STATUS } from '@/lib/operational-status';

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

/* Status reads as a badge even though the control stays editable. */
const STATUS_TONE: Record<EquipmentStatus, string> = {
  AVAILABLE: 'border-success/25 bg-success-soft text-success',
  IN_USE: 'border-primary/25 bg-primary-soft text-primary',
  MAINTENANCE: 'border-warning/25 bg-warning-soft text-warning',
  RETIRED: 'border-rule bg-surface-muted text-ink-muted',
};

function formatStatus(status: EquipmentStatus) {
  return EQUIPMENT_STATUS[status].label;
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
        <section
          className="panel overflow-hidden"
          aria-labelledby="equipment-form-title"
        >
          <div className="border-rule-soft flex items-start justify-between gap-3 border-b px-5 py-3">
            <div>
              <p className="text-ink-subtle text-[10px] font-semibold tracking-[0.07em] uppercase">
                Inventory record
              </p>
              <h2
                id="equipment-form-title"
                className="text-ink mt-0.5 text-[15px] font-semibold"
              >
                {editingEquipment ? 'Edit equipment' : 'Add equipment'}
              </h2>
            </div>
            <button
              type="button"
              disabled={saving}
              onClick={() => setShowForm(false)}
              className="text-ink-muted hover:text-ink text-[11.5px] font-semibold disabled:opacity-50"
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

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" htmlFor="equipment-name" required>
                <TextInput
                  id="equipment-name"
                  required
                  maxLength={150}
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </Field>

              <Field label="Category" htmlFor="equipment-category" required>
                <TextInput
                  id="equipment-category"
                  required
                  maxLength={100}
                  value={form.category}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                />
              </Field>

              <Field label="Serial number" htmlFor="equipment-serial">
                <TextInput
                  id="equipment-serial"
                  maxLength={100}
                  value={form.serialNumber}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      serialNumber: event.target.value,
                    }))
                  }
                />
              </Field>

              <Field label="Department" htmlFor="equipment-department">
                <Select
                  id="equipment-department"
                  value={form.departmentId}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      departmentId: event.target.value,
                    }))
                  }
                >
                  <option value="">Unassigned</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Maintenance due" htmlFor="equipment-maintenance">
                <TextInput
                  id="equipment-maintenance"
                  type="date"
                  value={form.maintenanceDueAt}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      maintenanceDueAt: event.target.value,
                    }))
                  }
                />
              </Field>
            </div>

            <div className="border-rule-soft flex justify-end gap-2 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={saving}
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={saving}>
                {saving
                  ? 'Saving…'
                  : editingEquipment
                    ? 'Save changes'
                    : 'Create equipment'}
              </Button>
            </div>
          </form>
        </section>
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

          <ul className="divide-rule-soft divide-y md:hidden">
            {filteredEquipment.map((item) => {
              const readiness = readinessFor(item.maintenanceDueAt);

              return (
                <li key={item.id} className="px-4 py-3.5">
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="bg-primary-soft text-primary grid h-9 w-9 shrink-0 place-items-center rounded-[8px]"
                    >
                      <FirstAidKit size={16} weight="duotone" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="text-ink text-[13.5px] leading-tight font-semibold">
                        {item.name}
                      </p>
                      <p className="text-ink-muted mt-0.5 truncate text-[11px]">
                        {item.category}
                      </p>
                    </div>

                    <div className="shrink-0">
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
                          className={`h-8 max-w-[7.5rem] rounded-full border px-2 text-[9.5px] font-semibold tracking-[0.04em] uppercase transition-colors outline-none disabled:opacity-50 ${STATUS_TONE[item.status]}`}
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
                        <span
                          className={`inline-flex h-8 items-center rounded-full border px-2 text-[9.5px] font-semibold tracking-[0.04em] uppercase ${STATUS_TONE[item.status]}`}
                        >
                          {formatStatus(item.status)}
                        </span>
                      )}
                    </div>
                  </div>

                  <dl className="border-rule-soft mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t pt-2.5">
                    <div className="min-w-0">
                      <dt className="text-ink-subtle text-[9px] font-semibold tracking-[0.08em] uppercase">
                        Serial
                      </dt>
                      <dd className="text-ink-muted mt-0.5 truncate font-mono text-[10.5px] tabular-nums">
                        {item.serialNumber ?? '—'}
                      </dd>
                    </div>

                    <div className="min-w-0">
                      <dt className="text-ink-subtle text-[9px] font-semibold tracking-[0.08em] uppercase">
                        Location
                      </dt>
                      <dd className="text-ink-muted mt-0.5 truncate font-mono text-[9.5px] tracking-[0.1em] uppercase">
                        {item.department?.name ?? 'Unassigned'}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-ink-subtle text-[9px] font-semibold tracking-[0.08em] uppercase">
                        Readiness
                      </dt>
                      <dd
                        className={`mt-0.5 font-mono text-[10.5px] tabular-nums ${readiness.className}`}
                      >
                        {readiness.label}
                      </dd>
                      <dd className="text-ink-subtle font-mono text-[9.5px] tabular-nums">
                        {formatDate(item.maintenanceDueAt)}
                      </dd>
                    </div>
                  </dl>

                  {isAdmin ? (
                    <button
                      type="button"
                      onClick={() => openEditForm(item)}
                      className="text-primary mt-3 inline-flex min-h-8 items-center text-[12px] font-semibold"
                    >
                      Edit record
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ul>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[840px] text-left">
              <thead>
                <tr className="border-rule bg-surface-subtle border-b">
                  <th className="text-ink-muted px-4 py-2.5 text-[10px] font-semibold tracking-[0.09em] uppercase">Item</th>
                  <th className="text-ink-muted px-4 py-2.5 text-[10px] font-semibold tracking-[0.09em] uppercase">Category</th>
                  <th className="text-ink-muted px-4 py-2.5 text-[10px] font-semibold tracking-[0.09em] uppercase whitespace-nowrap">
                    Serial
                  </th>
                  <th className="text-ink-muted px-4 py-2.5 text-[10px] font-semibold tracking-[0.09em] uppercase">Location</th>
                  <th className="text-ink-muted px-4 py-2.5 text-[10px] font-semibold tracking-[0.09em] uppercase whitespace-nowrap">
                    Readiness
                  </th>
                  <th className="text-ink-muted px-4 py-2.5 text-[10px] font-semibold tracking-[0.09em] uppercase">State</th>
                  <th className="text-ink-muted px-4 py-2.5 text-right text-[10px] font-semibold tracking-[0.09em] uppercase">
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
                        <div className="flex items-center gap-2.5">
                          <span
                            aria-hidden="true"
                            className="bg-primary-soft text-primary grid h-8 w-8 shrink-0 place-items-center rounded-[8px]"
                          >
                            <FirstAidKit size={15} weight="duotone" />
                          </span>
                          <p className="text-ink text-[13.5px] leading-tight font-semibold">
                            {item.name}
                          </p>
                        </div>
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
                            className={`h-8 rounded-full border px-2.5 text-[10px] font-semibold tracking-[0.04em] uppercase transition-colors outline-none disabled:opacity-50 ${STATUS_TONE[item.status]}`}
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
