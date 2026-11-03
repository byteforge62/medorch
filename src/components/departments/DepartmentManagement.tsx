'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { ScheduleStatusBadge } from '@/components/schedules/ScheduleStatusBadge'

interface DoctorOption {
  id: string
  specialization?: string | null
  user: {
    id: string
    name: string
    email: string
    status: string
  }
}

interface Department {
  id: string
  name: string
  description: string | null
  headDoctorId: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  headDoctor: {
    id: string
    specialization: string | null
    licenseNumber: string | null
    user: {
      id: string
      name: string
      email: string
    }
  } | null
  _count: {
    doctors: number
    otRooms: number
    equipment: number
    schedules: number
  }
}

type DepartmentStatus = 'ALL' | 'ACTIVE' | 'INACTIVE'

interface DepartmentForm {
  name: string
  description: string
  headDoctorId: string
}

const EMPTY_FORM: DepartmentForm = {
  name: '',
  description: '',
  headDoctorId: '',
}

const inputClass =
  'w-full border border-border-strong bg-surface px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-foreground-subtle focus:border-primary focus:ring-2 focus:ring-primary/20'

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof ApiClientError ? error.message : fallback
}

export function DepartmentManagement() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'

  const [departments, setDepartments] = useState<Department[]>([])
  const [doctors, setDoctors] = useState<DoctorOption[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<DepartmentStatus>('ALL')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Department | null>(null)
  const [form, setForm] = useState<DepartmentForm>({ ...EMPTY_FORM })
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [pendingActionId, setPendingActionId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    const [departmentData, doctorData] = await Promise.all([
      apiClient.get<Department[]>('/api/departments'),
      apiClient.get<DoctorOption[]>('/api/doctors'),
    ])

    return { departmentData, doctorData }
  }, [])

  const refreshData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { departmentData, doctorData } = await fetchData()

      setDepartments(departmentData)
      setDoctors(doctorData)
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Failed to load department data.',
      )
    } finally {
      setLoading(false)
    }
  }, [fetchData])

  useEffect(() => {
    let cancelled = false

    fetchData()
      .then(({ departmentData, doctorData }) => {
        if (cancelled) return

        setDepartments(departmentData)
        setDoctors(doctorData)
        setError(null)
      })
      .catch((err: unknown) => {
        if (cancelled) return

        setError(getErrorMessage(err, 'Failed to load departments.'))
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [fetchData])

  const filteredDepartments = useMemo(() => {
    const query = search.trim().toLowerCase()

    return departments.filter((department) => {
      const matchesSearch =
        !query ||
        department.name.toLowerCase().includes(query) ||
        (department.description ?? '').toLowerCase().includes(query) ||
        (department.headDoctor?.user.name ?? '').toLowerCase().includes(query)

      const matchesStatus =
        status === 'ALL' ||
        (status === 'ACTIVE' && department.isActive) ||
        (status === 'INACTIVE' && !department.isActive)

      return matchesSearch && matchesStatus
    })
  }, [departments, search, status])

  const counts = useMemo(
    () => ({
      total: departments.length,
      active: departments.filter((item) => item.isActive).length,
      inactive: departments.filter((item) => !item.isActive).length,
      doctors: departments.reduce((sum, item) => sum + item._count.doctors, 0),
    }),
    [departments],
  )

  function openCreateForm() {
    setEditing(null)
    setForm({ ...EMPTY_FORM })
    setFormError(null)
    setNotice(null)
    setShowForm(true)
  }

  function openEditForm(department: Department) {
    setEditing(department)
    setForm({
      name: department.name,
      description: department.description ?? '',
      headDoctorId: department.headDoctorId ?? '',
    })
    setFormError(null)
    setNotice(null)
    setShowForm(true)
  }

  function closeForm() {
    if (saving) return

    setShowForm(false)
    setEditing(null)
    setFormError(null)
  }

  function updateForm<K extends keyof DepartmentForm>(
    key: K,
    value: DepartmentForm[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setFormError(null)
    setNotice(null)

    const name = form.name.trim()
    const description = form.description.trim()

    if (name.length < 2) {
      setFormError('Department name must contain at least 2 characters.')
      setSaving(false)
      return
    }

    if (name.length > 100 || description.length > 500) {
      setFormError('The name or description exceeds the permitted length.')
      setSaving(false)
      return
    }

    try {
      if (editing) {
        await apiClient.patch<Department>(
          `/api/departments/${editing.id}`,
          {
            name,
            description: description || null,
            headDoctorId: form.headDoctorId || null,
          },
        )

        setNotice('Department updated successfully.')
      } else {
        await apiClient.post<Department>('/api/departments', {
          name,
          ...(description ? { description } : {}),
          ...(form.headDoctorId ? { headDoctorId: form.headDoctorId } : {}),
        })

        setNotice('Department created successfully.')
      }

      setShowForm(false)
      setEditing(null)
      await refreshData()
    } catch (err) {
      setFormError(
        getErrorMessage(
          err,
          editing ? 'Failed to update department.' : 'Failed to create department.',
        ),
      )
    } finally {
      setSaving(false)
    }
  }

  async function toggleDepartmentStatus(department: Department) {
    const action = department.isActive ? 'deactivate' : 'reactivate'

    if (
      !window.confirm(
        `Are you sure you want to "${action}" "${department.name}"?`,
      )
    ) {
      return
    }

    setPendingActionId(department.id)
    setNotice(null)
    setError(null)

    try {
      if (department.isActive) {
        await apiClient.delete<Department>(
          `/api/departments/${department.id}`,
        )
      } else {
        await apiClient.patch<Department>(
          `/api/departments/${department.id}`,
          {
            isActive: true,
          },
        )
      }

      setNotice(`Department ${action}d successfully.`)
      await refreshData()
    } catch (err) {
      setError(
        getErrorMessage(err, `Failed to ${action} department.`),
      )
    } finally {
      setPendingActionId(null)
    }
  }

  if (loading) {
    return <LoadingState message="Loading departments..." />
  }

  if (error && departments.length === 0) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          void refreshData()
        }}
      />
    )
  }

  return (
    <main className="space-y-6 sm:space-y-8 lg:space-y-10">
      <PageHeader
        eyebrow="Organisation"
        title="Departments"
        description="Organise clinical departments, assign department heads, and monitor their associated doctors, operating rooms, equipment, and schedules."
        actions={
          isAdmin ? (
            <Button type="button" onClick={openCreateForm}>
              New department
            </Button>
          ) : null
        }
      />

      {!isAdmin && (
        <div className="border border-border-line bg-surface-muted px-4 py-3 text-sm text-foreground-secondary">
          Read-only department access. Only administrators can create, edit, or deactivate departments.
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="border-primary-soft bg-primary-soft/10 border border-primary-soft text-primary/80 px-4 py-3 text-sm"
        >
          {notice}
        </div>
      )}

      {error && (
        <div className="border-danger-soft bg-danger-soft border border-danger-soft text-danger border px-4 py-3 text-sm">
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

      {/* Department grid with surgical-teal headers */}
      <section className="space-y-4">
        <h2 className="text-foreground font-semibold text-lg tracking-tight">
          Department Overview
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Active departments */}
          <div>
            <div className="border-border rounded-0 bg-primary-soft/20 border-b-2 border-primary p-4 mb-3">
              <h3 className="text-primary font-medium text-sm font-mono tracking-[0.18em] uppercase mb-1">
                {departments.filter((d) => d.isActive).length} Active
              </h3>
              <p className="text-muted-foreground text-sm">
                Departments currently operating
              </p>
            </div>

            <div className="border-border rounded-0 bg-surface p-4 space-y-3">
              {departments
                .filter((d) => d.isActive)
                .map((department) => (
                  <article
                    key={department.id}
                    className="border border-border-line rounded-0 p-3 hover:bg-primary-soft/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-foreground font-medium truncate">
                          {department.name}
                        </h3>
                        <p className="text-foreground-secondary text-xs mt-1">
                          {department.description || 'No description provided.'}
                        </p>
                      </div>

                      <div className="w-8 h-8 rounded-0 flex items-center justify-center flex-shrink-0">
                        <Badge>{department.isActive ? 'Active' : 'Inactive'}</Badge>
                      </div>
                    </div>

                    <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <dt className="text-foreground-muted">Doctors</dt>
                        <dd className="font-mono">{department._count.doctors}</dd>
                      </div>
                      <div>
                        <dt className="text-foreground-muted">OT Rooms</dt>
                        <dd className="font-mono">{department._count.otRooms}</dd>
                      </div>
                      <div>
                        <dt className="text-foreground-muted">Equipment</dt>
                        <dd className="font-mono">{department._count.equipment}</dd>
                      </div>
                      <div>
                        <dt className="text-foreground-muted">Schedules</dt>
                        <dd className="font-mono">{department._count.schedules}</dd>
                      </div>
                    </dl>
                  </article>
                ))}
            </div>
          </div>

          {/* Inactive departments */}
          <div>
            <div className="border-border rounded-0 bg-surface-muted/50 border-b-2 border-danger p-4 mb-3">
              <h3 className="text-danger font-medium text-sm font-mono tracking-[0.18em] uppercase mb-1">
                {departments.filter((d) => !d.isActive).length} Inactive
              </h3>
              <p className="text-muted-foreground text-sm">
                Departments paused or closed
              </p>
            </div>

            <div className="border-border rounded-0 bg-surface p-4 space-y-3">
              {departments
                .filter((d) => !d.isActive)
                .map((department) => (
                  <article
                    key={department.id}
                    className="border border-border-line rounded-0 p-3 hover:bg-primary-soft/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-foreground font-medium truncate">
                          {department.name}
                        </h3>
                        <p className="text-foreground-secondary text-xs mt-1">
                          {department.description || 'No description provided.'}
                        </p>
                      </div>

                      <div className="w-8 h-8 rounded-0 flex items-center justify-center flex-shrink-0">
                        <Badge variant="danger">{department.isActive ? 'Active' : 'Inactive'}</Badge>
                      </div>
                    </div>

                    <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <dt className="text-foreground-muted">Doctors</dt>
                        <dd className="font-mono">{department._count.doctors}</dd>
                      </div>
                      <div>
                        <dt className="text-foreground-muted">OT Rooms</dt>
                        <dd className="font-mono">{department._count.otRooms}</dd>
                      </div>
                      <div>
                        <dt className="text-foreground-muted">Equipment</dt>
                        <dd className="font-mono">{department._count.equipment}</dd>
                      </div>
                      <div>
                        <dt className="text-foreground-muted">Schedules</dt>
                        <dd className="font-mono">{department._count.schedules}</dd>
                      </div>
                    </dl>
                  </article>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* Filter controls */}
      <section className="mt-6 pt-6 border-t border-border-line">
        <div className="grid gap-4 md:grid-cols-[1fr_220px]">
          <div>
            <label
              htmlFor="department-search"
              className="mb-2 block text-sm font-medium text-foreground"
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
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Status
            </label>

            <select
              id="department-status"
              value={status}
              onChange={(event) => setStatus(event.target.value as DepartmentStatus)}
              className={inputClass}
            >
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      </section>
    </main>
  )
}