'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X } from '@phosphor-icons/react';
import { apiClient, ApiClientError } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { SchedulePriority } from './ScheduleStatusBadge';
import { formatClock, localDateKey } from './schedule-workspace-format';

export interface PatientOption {
  id: string;
  name: string;
  patientCode: string;
}

export interface DepartmentOption {
  id: string;
  name: string;
}

export interface OTRoomOption {
  id: string;
  name: string;
  code?: string;
  departmentId: string;
  status?: string;
  isActive?: boolean;
}

export interface DoctorOption {
  id: string;
  userId: string;
  name?: string;
  user?: {
    id: string;
    name: string;
    email?: string;
  };
}

export interface ScheduleFormInitial {
  id: string;
  patientId: string;
  departmentId: string;
  otRoomId: string;
  surgeonId: string;
  procedure: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  priority: SchedulePriority;
  clinicalNotes?: string | null;
}

interface ScheduleFormProps {
  initialSchedule?: ScheduleFormInitial | null;
  /** Local theatre day used when creating a new schedule. */
  defaultDate?: string;
  patients: PatientOption[];
  departments: DepartmentOption[];
  otRooms: OTRoomOption[];
  doctors: DoctorOption[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ScheduleForm({
  initialSchedule,
  defaultDate,
  patients,
  departments,
  otRooms,
  doctors,
  isOpen,
  onClose,
  onSuccess,
}: ScheduleFormProps) {
  const isEditing = Boolean(initialSchedule?.id);
  const panelRef = useRef<HTMLDivElement>(null);

  const [patientId, setPatientId] = useState(() => initialSchedule?.patientId ?? '');
  const [departmentId, setDepartmentId] = useState(() => initialSchedule?.departmentId ?? '');
  const [otRoomId, setOtRoomId] = useState(() => initialSchedule?.otRoomId ?? '');
  const [surgeonId, setSurgeonId] = useState(() => initialSchedule?.surgeonId ?? '');
  const [procedure, setProcedure] = useState(() => initialSchedule?.procedure ?? '');
  const [priority, setPriority] = useState<SchedulePriority>(() => initialSchedule?.priority ?? 'ELECTIVE');
  const [clinicalNotes, setClinicalNotes] = useState(() => initialSchedule?.clinicalNotes ?? '');

  const [scheduledDate, setScheduledDate] = useState(() => {
    if (initialSchedule?.scheduledDate) {
      return localDateKey(initialSchedule.scheduledDate);
    }

    return defaultDate ?? localDateKey(new Date());
  });

  const [startTime, setStartTime] = useState(() =>
    initialSchedule?.startTime
      ? formatClock(initialSchedule.startTime)
      : '09:00',
  );

  const [endTime, setEndTime] = useState(() =>
    initialSchedule?.endTime
      ? formatClock(initialSchedule.endTime)
      : '10:00',
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const timer = window.setTimeout(() => {
      panelRef.current
        ?.querySelector<HTMLInputElement>('input[name="procedure"]')
        ?.focus();
    }, 0);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDialogKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.key === 'Escape' && !isSubmitting) {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key !== 'Tab' || !panelRef.current) return;

    const focusable = Array.from(
      panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]',
      ),
    ).filter((element) => element.offsetParent !== null);

    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  // Filter OT rooms by department if selected
  const availableOtRooms = departmentId
    ? otRooms.filter((room) => room.departmentId === departmentId)
    : otRooms;

  const handleDepartmentChange = (newDeptId: string) => {
    setDepartmentId(newDeptId);
    if (newDeptId && otRoomId) {
      const room = otRooms.find((r) => r.id === otRoomId);
      if (room && room.departmentId !== newDeptId) {
        setOtRoomId('');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!patientId) {
      setError('Please select a patient.');
      return;
    }
    if (!departmentId) {
      setError('Please select a department.');
      return;
    }
    if (!otRoomId) {
      setError('Please select an OT room.');
      return;
    }
    if (!surgeonId) {
      setError('Please select a surgeon.');
      return;
    }
    if (!procedure.trim()) {
      setError('Please enter procedure name.');
      return;
    }
    if (!scheduledDate || !startTime || !endTime) {
      setError('Please specify scheduled date, start time, and end time.');
      return;
    }

    const startDateTime = new Date(`${scheduledDate}T${startTime}:00`);
    const endDateTime = new Date(`${scheduledDate}T${endTime}:00`);

    if (
      Number.isNaN(startDateTime.getTime()) ||
      Number.isNaN(endDateTime.getTime())
    ) {
      setError('Enter a valid theatre date and time.');
      return;
    }

    if (endDateTime <= startDateTime) {
      setError('End time must be after start time.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        patientId,
        departmentId,
        otRoomId,
        surgeonId,
        procedure: procedure.trim(),
        // The API validates scheduledDate as a plain ISO calendar date
        // (YYYY-MM-DD), so send the raw date string rather than a full
        // datetime. This also avoids a timezone shift moving the date.
        scheduledDate,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        priority,
        clinicalNotes: isEditing
          ? clinicalNotes.trim() || null
          : clinicalNotes.trim() || undefined,
      };

      if (isEditing && initialSchedule) {
        await apiClient.patch(`/api/schedules/${initialSchedule.id}`, payload);
      } else {
        await apiClient.post('/api/schedules', payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to save schedule:', err);
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while saving the schedule.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="bg-foreground/45 fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-form-title"
        aria-describedby="schedule-form-description"
        onKeyDown={handleDialogKeyDown}
        className="border-border-strong bg-surface max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-[var(--radius-panel)] border p-5 shadow-xl sm:p-6"
      >
        <div className="border-border flex items-start justify-between gap-4 border-b pb-4">
          <div className="min-w-0">
            <p className="eyebrow">
              {isEditing ? 'Case record' : 'Theatre day'}
            </p>
            <h2
              id="schedule-form-title"
              className="text-foreground mt-1 text-lg font-semibold"
            >
              {isEditing ? 'Edit schedule' : 'Create schedule'}
            </h2>
            <p
              id="schedule-form-description"
              className="text-foreground-muted mt-1 text-sm"
            >
              {isEditing
                ? 'Update the procedure, date, time, and assignments.'
                : 'Schedule a new surgical procedure in an available theatre.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close schedule form"
            className="border-border-strong text-foreground-muted hover:bg-surface-muted hover:text-foreground focus-visible:outline-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-control)] border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <X size={15} weight="bold" aria-hidden="true" />
          </button>
        </div>

        {error && (
          <div
            className="border-danger-border bg-danger-soft text-danger mt-4 rounded-[var(--radius-control)] border p-3 text-sm font-medium"
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground">
              Procedure {isEditing ? 'update' : 'details'}
            </label>
            <input
              type="text"
              name="procedure"
              required
              maxLength={200}
              placeholder="e.g. Laparoscopic cholecystectomy"
              value={procedure}
              onChange={(e) => setProcedure(e.target.value)}
              className="border-border-strong bg-surface text-foreground placeholder-foreground-muted focus-visible:border-primary focus-visible:outline-primary block min-h-10 w-full min-w-0 rounded-[var(--radius-control)] border px-3 py-2.5 text-sm outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-foreground">
                Patient {isEditing ? 'update' : 'details'}
              </label>
              <select
                required
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="block min-h-10 w-full min-w-0 rounded-md border border-border-strong bg-surface text-foreground px-3 py-2.5 text-sm outline-none transition-colors focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <option value="">Select patient</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}{' '}
                    {p.patientCode ? `(${p.patientCode})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground">
                Surgeon {isEditing ? 'update' : 'details'}
              </label>
              <select
                required
                value={surgeonId}
                onChange={(e) => setSurgeonId(e.target.value)}
                className="block min-h-10 w-full min-w-0 rounded-md border border-border-strong bg-surface text-foreground px-3 py-2.5 text-sm outline-none transition-colors focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <option value="">Select surgeon</option>
                {doctors.map((doc) => {
                  const targetUserId = doc.user?.id ?? doc.userId;
                  return (
                    <option key={doc.id} value={targetUserId}>
                      {doc.user?.name ?? doc.name ?? 'Doctor'}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-foreground">
                Department {isEditing ? 'update' : 'details'}
              </label>
              <select
                required
                value={departmentId}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                className="block min-h-10 w-full min-w-0 rounded-md border border-border-strong bg-surface text-foreground px-3 py-2.5 text-sm outline-none transition-colors focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground">
                OT room {isEditing ? 'update' : 'details'}
              </label>
              <select
                required
                value={otRoomId}
                onChange={(e) => setOtRoomId(e.target.value)}
                className="block min-h-10 w-full min-w-0 rounded-md border border-border-strong bg-surface text-foreground px-3 py-2.5 text-sm outline-none transition-colors focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                disabled={isSubmitting || availableOtRooms.length === 0}
              >
                <option value="">Select OT room</option>
                {availableOtRooms.map((r) => {
                  const unavailable =
                    r.isActive === false ||
                    r.status === 'MAINTENANCE' ||
                    r.status === 'DISABLED';

                  return (
                    <option
                      key={r.id}
                      value={r.id}
                      disabled={unavailable}
                    >
                      {r.name} {r.code ? `[${r.code}]` : ''}
                      {unavailable ? ` — ${r.status?.toLowerCase() ?? 'offline'}` : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-foreground">
                Theatre date {isEditing ? 'update' : 'details'}
              </label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="block min-h-10 w-full min-w-0 rounded-md border border-border-strong bg-surface text-foreground px-3 py-2.5 text-sm outline-none transition-colors focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground">
                Start time {isEditing ? 'update' : 'details'}
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="block min-h-10 w-full min-w-0 rounded-md border border-border-strong bg-surface text-foreground px-3 py-2.5 text-sm outline-none transition-colors focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground">
                End time {isEditing ? 'update' : 'details'}
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="block min-h-10 w-full min-w-0 rounded-md border border-border-strong bg-surface text-foreground px-3 py-2.5 text-sm outline-none transition-colors focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as SchedulePriority)}
              className="block min-h-10 w-full min-w-0 rounded-md border border-border-strong bg-surface text-foreground px-3 py-2.5 text-sm outline-none transition-colors focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <option value="ELECTIVE">Elective</option>
              <option value="URGENT">Urgent</option>
              <option value="EMERGENCY">Emergency</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground">
              Clinical notes
            </label>
            <textarea
              rows={3}
              maxLength={5000}
              placeholder="Additional medical instructions, precautions, or procedure notes..."
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              className="border-border-strong bg-surface text-foreground placeholder-foreground-muted focus-visible:border-primary focus-visible:outline-primary block min-h-10 w-full min-w-0 rounded-[var(--radius-control)] border px-3 py-2.5 text-sm outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            />
          </div>

          <p className="text-ink-subtle text-[10px] leading-relaxed">
            Dates and times are interpreted in local theatre time. Theatre,
            surgeon and patient overlaps are rejected by the schedule API.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {isEditing ? 'Cancel changes' : 'Cancel'}
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {isEditing ? 'Save changes' : 'Create schedule'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
