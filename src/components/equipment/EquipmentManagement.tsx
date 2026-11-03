'use client'

import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useSession } from 'next-auth/react'
import { apiClient, ApiClientError } from '@/lib/api/client'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'

type EquipmentStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'RETIRED'

interface Equipment {
  id: string
  name: string
  category: string
  departmentId?: string | null
  serialNumber?: string | null
  status: EquipmentStatus
  maintenanceDueAt?: string | null
  department?: { id: string; name: string } | null
}

interface DepartmentOption {
  id: string
  name: string
}

interface EquipmentForm {
  name: string
  category: string
  serialNumber: string
  departmentId: string
  maintenanceDueAt: string
}

const EMPTY_FORM: EquipmentForm = {
  name: '',
  category: '',
  serialNumber: '',
  departmentId: '',
  maintenanceDueAt: '',
}

const STATUS_OPTIONS: EquipmentStatus[] = [
  'AVAILABLE',
  'IN_USE',
  'MAINTENANCE',
  'RETIRED',
]

function formatStatus(status: EquipmentStatus) {
  return status.replace('_', ' ')
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(
    new Date(value),
  )
}

export function EquipmentManagement() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<EquipmentStatus | 'ALL'>('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingEquipmentId, setUpdatingEquipmentId] = useState<string | null>(
    null,
  )
  const [departments, setDepartments] = useState<DepartmentOption[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(
    null,
  )
  const [form, setForm] = useState<EquipmentForm>(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isAdmin) return
    let cancelled = false
    apiClient
      .get<DepartmentOption[]>('/api/departments')
      .then((response) => {
        if (!cancelled) setDepartments(response)
      })
      .catch(() => {
        if (!cancelled) setFormError('Failed to load departments.')
      })
    return () => { cancelled = true }
  }, [isAdmin])

  function openCreateForm() {
    setEditingEquipment(null)
    setForm({ ...EMPTY_FORM })
    setFormError('')
    setShowForm(true)
  }

  function openEditForm(item: Equipment) {
    setEditingEquipment(item)
    setForm({
      name: item.name,
      category: item.category,
      serialNumber: item.serialNumber ?? '',
      departmentId: item.department?.id ?? item.departmentId ?? '',
      maintenanceDueAt: item.maintenanceDueAt
        ? new Date(item.maintenanceDueAt).toISOString().slice(0, 10)
        : '',
    })
    setFormError('')
    setShowForm(true)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setFormError('')
    const common = { name: form.name.trim(), category: form.category.trim() }
    const payload = editingEquipment
      ? {
          ...common,
          serialNumber: form.serialNumber.trim() || null,
          departmentId: form.departmentId || null,
          maintenanceDueAt: form.maintenanceDueAt || null,
        }
      : {
          ...common,
          ...(form.serialNumber.trim() ? { serialNumber: form.serialNumber.trim() } : {}),
          ...(form.departmentId ? { departmentId: form.departmentId } : {}),
          ...(form.maintenanceDueAt ? { maintenanceDueAt: form.maintenanceDueAt } : {}),
        }
    try {
      const saved = editingEquipment
        ? await apiClient.patch<Equipment>(
            `/api/equipment/${editingEquipment.id}`,
            payload,
          )
        : await apiClient.post<Equipment>('/api/equipment', payload)
      setEquipment((current) =>
        editingEquipment
          ? current.map((item) => (item.id === saved.id ? { ...item, ...saved } : item))
          : [saved, ...current],
      )
      setShowForm(false)
      setEditingEquipment(null)
      setForm({ ...EMPTY_FORM })
    } catch (submitError) {
      setFormError(
        submitError instanceof ApiClientError
          ? submitError.message
          : `Failed to ${editingEquipment ? 'update' : 'create'} equipment.`,
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusChange(id: string, nextStatus: EquipmentStatus) {
    setUpdatingEquipmentId(id)
    setError('')
    try {
      const updated = await apiClient.patch<Equipment>(
        `/api/equipment/${id}/status`,
        { status: nextStatus },
      )
      setEquipment((current) =>
        current.map((item) => (item.id === id ? { ...item, ...updated } : item)),
      )
    } catch (updateError) {
      setError(
        updateError instanceof ApiClientError
          ? updateError.message
          : 'Failed to update equipment status.',
      )
    } finally {
      setUpdatingEquipmentId(null)
    }
  }

  useEffect(() => {
    let cancelled = false
    const fetchEquipment = async () => {
      try {
        const response = await apiClient.get<Equipment[]>('/api/equipment')
        if (!cancelled) setEquipment(response ?? [])
      } catch (fetchError) {
        if (!cancelled) setError(fetchError instanceof ApiClientError ? fetchError.message : 'Failed to load equipment.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void fetchEquipment()
    return () => { cancelled = true }
  }, [])

  const filteredEquipment = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return equipment.filter((item) => {
      const matchesSearch = !normalizedSearch ||
        item.name.toLowerCase().includes(normalizedSearch) ||
        item.category.toLowerCase().includes(normalizedSearch) ||
        (item.serialNumber?.toLowerCase().includes(normalizedSearch) ?? false) ||
        (item.department?.name?.toLowerCase().includes(normalizedSearch) ?? false)
      const matchesStatus = status === 'ALL' || item.status === status
      return matchesSearch && matchesStatus
    })
  }, [equipment, search, status])

  const counts = useMemo(() => ({
    total: equipment.length,
    available: equipment.filter((item) => item.status === 'AVAILABLE').length,
    inUse: equipment.filter((item) => item.status === 'IN_USE').length,
    maintenance: equipment.filter((item) => item.status === 'MAINTENANCE').length,
  }), [equipment])

  if (loading) return <LoadingState />
  if (error && equipment.length === 0) return <ErrorState message={error} />

  const statusOptionsJSX = STATUS_OPTIONS.map((opt) => (
    <option key={opt} value={opt} disabled={opt === 'IN_USE'}>
      {formatStatus(opt)}
    </option>
  ))

  return (
    <main className="space-y-6 sm:space-y-8 lg:space-y-10">
      <PageHeader
        eyebrow="Resource registry"
        title="Equipment"
        description="View equipment availability, category, assignment state, and maintenance information."
        actions={isAdmin ? (
          <Button type="button" onClick={openCreateForm}>
            Add equipment
          </Button>
        ) : null}
      />
      <section className="space-y-3">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          <div>
            <div className="border-border rounded-0 bg-primary-soft/20 border-b-2 border-primary p-3">
              <div className="text-primary font-medium text-sm font-mono tracking-[0.18em] uppercase mb-1">
                {counts.total}
              </div>
              <p className="text-xs text-muted-foreground">Total items</p>
            </div>
          </div>
          <div>
            <div className="border-border rounded-0 bg-success-soft/20 border-b-2 border-success p-3">
              <div className="text-success font-medium text-sm font-mono tracking-[0.18em] uppercase mb-1">
                {counts.available}
              </div>
              <p className="text-xs text-muted-foreground">Available</p>
            </div>
          </div>
          <div>
            <div className="border-border rounded-0 bg-warning-soft/20 border-b-2 border-warning p-3">
              <div className="text-warning font-medium text-sm font-mono tracking-[0.18em] uppercase mb-1">
                {counts.inUse}
              </div>
              <p className="text-xs text-muted-foreground">In use</p>
            </div>
          </div>
          <div>
            <div className="border-border rounded-0 bg-danger-soft/20 border-b-2 border-danger p-3">
              <div className="text-danger font-medium text-sm font-mono tracking-[0.18em] uppercase mb-1">
                {counts.maintenance}
              </div>
              <p className="text-xs text-muted-foreground">Maintenance</p>
            </div>
          </div>
        </div>
      </section>
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
            <div className="grid gap-3 sm:grid-cols-2">
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
          className="border border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-danger)]"
        >
          {error}
        </div>
      )}
      {filteredEquipment.length === 0 ? (
        <EmptyState
          title="No equipment found"
          description="Try changing the search or status filter."
        />
      ) : (
        <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredEquipment.map((item) => (
            <Card
              key={item.id}
              className="border border-border-line rounded-0 overflow-hidden"
            >
              <div className="flex items-start justify-between gap-4 px-4 py-4">
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold text-foreground">
                    {item.name}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.category}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className="ml-2 text-xs">
                    {formatStatus(item.status)}
                  </Badge>

                  {isAdmin && (
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
                      className="border-border-strong bg-surface text-foreground focus:border-primary focus:ring-primary/20 border px-2 py-1 text-xs transition outline-none focus:ring-2"
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
                  )}
                </div>
              </div>

              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Serial number</dt>
                  <dd className="text-right">{item.serialNumber ?? '—'}</dd>
                </div>

                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Department</dt>
                  <dd className="text-right">
                    {item.department?.name ?? 'Unassigned'}
                  </dd>
                </div>

                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Maintenance due</dt>
                  <dd className="text-right">
                    {formatDate(item.maintenanceDueAt)}
                  </dd>
                </div>
              </dl>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => openEditForm(item)}
                  className="mt-3 text-sm font-medium text-primary"
                >
                  Edit details
                </button>
              )}
            </Card>
          ))}
        </section>
      )}
    </main>
  )
}