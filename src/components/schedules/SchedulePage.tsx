'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { ScheduleItem } from './ScheduleCard';
import { ScheduleStatus } from './ScheduleStatusBadge';
import { ScheduleFilters, FilterState } from './ScheduleFilters';
import { ScheduleList } from './ScheduleList';
import {
  ScheduleForm,
  PatientOption,
  DepartmentOption,
  OTRoomOption,
  DoctorOption,
} from './ScheduleForm';
import { ScheduleCalendar } from './ScheduleCalendar';
import { PageHeader } from '@/components/ui/PageHeader';

type StatusCount = { status: string; count: number };

const statusTone: Record<string, string> = {
  SCHEDULED: 'bg-border-strong',
  CONFIRMED: 'bg-primary',
  IN_PROGRESS: 'bg-danger',
  COMPLETED: 'bg-success',
  DELAYED: 'bg-warning',
  CANCELLED: 'bg-border',
};

/**
 * StatusDistribution — one stacked bar showing how the accessible cases are
 * distributed across their lifecycle, with a printed legend beneath. Built
 * from the same records the list shows; no invented metrics.
 */
function StatusDistribution({ counts, total }: { counts: StatusCount[]; total: number }) {
  if (total === 0) return null;

  return (
    <section
      aria-label="Case status distribution"
      className="border border-border bg-surface"
    >
      <div className="flex h-2.5 w-full" aria-hidden="true">
        {counts
          .filter((item) => item.count > 0)
          .map((item) => (
            <div
              key={item.status}
              className={`h-full ${statusTone[item.status] || 'bg-border-strong'}`}
              style={{ width: `${(item.count / total) * 100}%` }}
            />
          ))}
      </div>

      <ul className="flex flex-wrap items-center gap-x-5 gap-y-1.5 px-4 py-2.5">
        {counts.map((item) => (
          <li
            key={item.status}
            className="flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] uppercase"
          >
            <span
              className={`h-2 w-2 ${statusTone[item.status] || 'bg-border-strong'}`}
              aria-hidden="true"
            />
            <span className="text-foreground-muted">
              {item.status.replaceAll('_', ' ')}
            </span>
            <span className="text-foreground font-semibold tabular-nums">
              {item.count}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SchedulePage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';
  const canManageSchedules = isAdmin || session?.user?.role === 'DOCTOR';

  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [otRooms, setOtRooms] = useState<OTRoomOption[]>([]);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(
    null,
  );

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  const initialFilters: FilterState = {
    status: '',
    priority: '',
    date: '',
    departmentId: '',
    otRoomId: '',
    search: '',
  };

  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const fetchSchedules = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<ScheduleItem[]>('/api/schedules');
      setSchedules(data || []);
    } catch (err) {
      console.error('Failed to fetch schedules:', err);
      setError('Failed to load surgery schedules from server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadSchedules() {
      try {
        const data = await apiClient.get<ScheduleItem[]>('/api/schedules');

        if (isMounted) {
          setSchedules(data || []);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to fetch schedules:', err);
          setError('Failed to load surgery schedules from server.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    async function loadReferenceData() {
      const departmentRequest =
        apiClient.get<DepartmentOption[]>('/api/departments');
      const roomRequest = apiClient.get<OTRoomOption[]>('/api/ot-rooms');

      const patientRequest = canManageSchedules
        ? apiClient.get<PatientOption[]>('/api/patients')
        : Promise.resolve(null);

      const doctorRequest = canManageSchedules
        ? apiClient.get<DoctorOption[]>('/api/doctors')
        : Promise.resolve(null);

      const [deptRes, roomRes, patientRes, doctorRes] =
        await Promise.allSettled([
          departmentRequest,
          roomRequest,
          patientRequest,
          doctorRequest,
        ]);

      if (!isMounted) return;

      if (deptRes.status === 'fulfilled' && deptRes.value) {
        setDepartments(deptRes.value);
      }

      if (roomRes.status === 'fulfilled' && roomRes.value) {
        setOtRooms(roomRes.value);
      }

      if (patientRes.status === 'fulfilled' && patientRes.value) {
        setPatients(patientRes.value);
      }

      if (doctorRes.status === 'fulfilled' && doctorRes.value) {
        setDoctors(doctorRes.value);
      }
    }

    void loadSchedules();
    void loadReferenceData();

    return () => {
      isMounted = false;
    };
  }, [canManageSchedules]);

  // Client-side filtering logic
  const filteredSchedules = useMemo(() => {
    return schedules.filter((item) => {
      // Status filter
      if (filters.status && item.status !== filters.status) {
        return false;
      }
      // Priority filter
      if (filters.priority && item.priority !== filters.priority) {
        return false;
      }
      // Date filter
      if (filters.date) {
        try {
          const itemDate = new Date(item.scheduledDate)
            .toISOString()
            .split('T')[0];
          if (itemDate !== filters.date) {
            return false;
          }
        } catch {
          return false;
        }
      }
      // Department filter
      if (filters.departmentId && item.departmentId !== filters.departmentId) {
        return false;
      }
      // OT Room filter
      if (filters.otRoomId && item.otRoomId !== filters.otRoomId) {
        return false;
      }
      // Search filter (procedure, patient name, surgeon name)
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase().trim();
        const procMatch = item.procedure.toLowerCase().includes(query);
        const patientMatch = item.patient?.name?.toLowerCase().includes(query);
        const surgeonMatch = item.surgeon?.name?.toLowerCase().includes(query);
        if (!procMatch && !patientMatch && !surgeonMatch) {
          return false;
        }
      }

      return true;
    });
  }, [schedules, filters]);

  const statusCounts = useMemo<StatusCount[]>(
    () =>
      [
        'SCHEDULED',
        'CONFIRMED',
        'IN_PROGRESS',
        'DELAYED',
        'COMPLETED',
        'CANCELLED',
      ].map((status) => ({
        status,
        count: schedules.filter((item) => item.status === status).length,
      })),
    [schedules],
  );

  const hasActiveFilters = Object.values(filters).some(
    (value) => value.trim().length > 0,
  );

  const handleOpenCreate = () => {
    setEditingSchedule(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (schedule: ScheduleItem) => {
    setEditingSchedule(schedule);
    setIsFormOpen(true);
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  const handleStatusUpdated = useCallback(
    (scheduleId: string, newStatus: ScheduleStatus) => {
      setSchedules((prev) =>
        prev.map((s) =>
          s.id === scheduleId ? { ...s, status: newStatus } : s,
        ),
      );
      // Background refetch — no loading spinner, filters stay intact
      apiClient
        .get<ScheduleItem[]>('/api/schedules')
        .then((data) => {
          if (data) setSchedules(data);
        })
        .catch((err) => {
          console.error('Background schedule refresh failed:', err);
        });
    },
    [],
  );

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Operating theatre"
        title="Surgical schedules"
        meta={`${schedules.length} total`}
        description="Every procedure the role can access, with room allocation and status. Filter the board, then open a case to manage it."
        actions={
          <>
            <div
              role="group"
              aria-label="Schedule view"
              className="border-border bg-surface inline-flex border"
            >
              <button
                type="button"
                aria-pressed={viewMode === 'list'}
                onClick={() => setViewMode('list')}
                className={`border-border -ml-px border-l px-3.5 py-2 font-mono text-[10px] font-semibold tracking-[0.14em] uppercase transition-colors first:border-l-0 ${
                  viewMode === 'list'
                    ? 'bg-foreground text-foreground-inverse'
                    : 'text-foreground-muted hover:bg-surface-subtle hover:text-foreground'
                }`}
              >
                List
              </button>
              <button
                type="button"
                aria-pressed={viewMode === 'calendar'}
                onClick={() => setViewMode('calendar')}
                className={`border-border -ml-px border-l px-3.5 py-2 font-mono text-[10px] font-semibold tracking-[0.14em] uppercase transition-colors first:border-l-0 ${
                  viewMode === 'calendar'
                    ? 'bg-foreground text-foreground-inverse'
                    : 'text-foreground-muted hover:bg-surface-subtle hover:text-foreground'
                }`}
              >
                Calendar
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchSchedules}
              isLoading={isLoading}
            >
              Refresh
            </Button>

            {isAdmin && (
              <Button size="sm" onClick={handleOpenCreate}>
                New schedule
              </Button>
            )}
          </>
        }
      />

      <StatusDistribution counts={statusCounts} total={schedules.length} />
      {/* Filter Section */}
      <ScheduleFilters
        filters={filters}
        onFilterChange={setFilters}
        departments={departments}
        otRooms={otRooms}
        onReset={handleResetFilters}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p
          className="text-foreground-muted font-mono text-[11px] tracking-[0.08em] uppercase tabular-nums"
          aria-live="polite"
        >
          {filteredSchedules.length} of {schedules.length} procedures
        </p>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-primary focus-visible:outline-primary rounded-md px-3 py-2 text-sm font-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Schedules List */}
      <h2 className="sr-only">Schedules</h2>
      {viewMode === 'calendar' ? (
        <ScheduleCalendar
          schedules={filteredSchedules}
          isLoading={isLoading}
          error={error}
          onRetry={fetchSchedules}
        />
      ) : (
        <ScheduleList
          schedules={filteredSchedules}
          isLoading={isLoading}
          error={error}
          onRetry={fetchSchedules}
          canManageSchedules={canManageSchedules}
          onEdit={handleOpenEdit}
          onStatusUpdated={handleStatusUpdated}
        />
      )}

      {/* Schedule Form Modal */}
      <ScheduleForm
        key={editingSchedule?.id || (isFormOpen ? 'open' : 'closed')}
        initialSchedule={editingSchedule}
        patients={patients}
        departments={departments}
        otRooms={otRooms}
        doctors={doctors}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingSchedule(null);
        }}
        onSuccess={fetchSchedules}
      />
    </main>
  );
}
