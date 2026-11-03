'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { apiClient, ApiClientError } from '@/lib/api/client'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { ScheduleStatusBadge } from '@/components/schedules/ScheduleStatusBadge'

type AppointmentStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DELAYED'

interface Appointment {
  id: string
  procedure: string
  scheduledDate: string
  startTime: string
  endTime: string
  status: AppointmentStatus
  priority: 'ELECTIVE' | 'URGENT' | 'EMERGENCY'
  department: {
    name: string
  }
  otRoom: {
    name: string
    code: string
  }
}

interface PatientAppointmentsResponse {
  id: string
  patientCode: string
  name: string
  schedules: Appointment[]
  currentTime: number
}

type AppointmentFilter = 'ALL' | 'UPCOMING' | 'PAST'

function formatDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'full',
  }).format(date)
}

function formatTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function formatLabel(value: string) {
  return value.replaceAll('_', ' ')
}

export function MyAppointments() {
  const [patient, setPatient] = useState<PatientAppointmentsResponse | null>(null)

  const [filter, setFilter] = useState<AppointmentFilter>('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadAppointments() {
      try {
        const response = await apiClient.get<PatientAppointmentsResponse>(
          '/api/me/appointments',
        )

        if (!cancelled) {
          setPatient(response)
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(
            fetchError instanceof ApiClientError
              ? fetchError.message
              : 'Failed to load your appointments.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadAppointments()

    return () => {
      cancelled = true
    }
  }, [])

  const appointments = useMemo(() => {
    if (!patient) return []

    const schedules = patient.schedules
    const now = patient.currentTime
    return schedules.filter((appointment) => {
      const isPast =
        new Date(appointment.endTime).getTime() < now ||
        appointment.status === 'COMPLETED' ||
        appointment.status === 'CANCELLED'

      if (filter === 'UPCOMING') {
        return !isPast
      }

      if (filter === 'PAST') {
        return isPast
      }

      return true
    })
  }, [patient, filter])

  if (loading) {
    return <LoadingState message="Loading your appointments..." />
  }

  if (error) {
    return <ErrorState message={error} />
  }

  if (!patient) {
    return (
      <EmptyState
        title="Patient record unavailable"
        description="Your account does not have a linked patient record."
      />
    )
  }

  const filterOptions = [
    { label: 'All', value: 'ALL' },
    { label: 'Upcoming', value: 'UPCOMING' },
    { label: 'Past', value: 'PAST' },
  ]

  return (
    <main className="space-y-6 space-y-4 md:space-y-8">
      <PageHeader
        eyebrow="Patient portal"
        title="My Appointments"
        description={
          <>
            Welcome,{' '}
            <span className="text-primary font-semibold">
              {patient.name}
            </span>. Here is your upcoming operating-theatre appointment.
          </>
        }
      />

      {/* Patient-specific appointment summary - cool clinical composition */}
      <div className="border-border bg-surface px-4 py-3 sm:px-6">
        <p className="text-foreground-muted text-sm">Upcoming appointment</p>
        <p className="text-primary font-medium mt-1">
          {appointments.length > 0
            ? formatLabel(appointments[0].procedure)
            : 'No upcoming appointments'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" style={{ gap: '1rem' }}>
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="border border-border-line bg-surface/50 rounded-0 p-4 sm:p-6 hover:bg-primary-soft/30 transition-colors"
          >
            <div className="flex flex-col gap-2">
              <p className="text-primary font-medium">{formatLabel(appointment.procedure)}</p>
              <div className="text-muted-foreground text-xs font-mono tracking-[0.1em] uppercase">
                {formatDate(appointment.scheduledDate)}
              </div>
              <p className="text-muted-foreground text-sm">
                {formatTime(appointment.startTime)} – {formatTime(appointment.endTime)}
              </p>
              <p className="text-muted-foreground text-xs">
                {appointment.department.name} · {appointment.otRoom.name}
              </p>
            </div>
            <ScheduleStatusBadge status={appointment.status} />
            <Link
              href={`/patients/appointments/${appointment.id}`}
              className="mt-2 text-primary text-sm font-semibold underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              View details →
            </Link>
          </div>
        ))}

        {appointments.length === 0 ? (
          <EmptyState
            title="No appointments found"
            description="Appointments associated with your patient record will appear here."
          />
        ) : null}
      </div>

      <div className="mt-6">
        <Button className="text-primary flex-1">
          <Link href="/patients/appointments">
            ← Back to all appointments
          </Link>
        </Button>
      </div>
    </main>
  )
}