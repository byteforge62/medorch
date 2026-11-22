'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X } from '@phosphor-icons/react';
import { apiClient, ApiClientError } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { SchedulePriority } from '@/features/schedules/components/ScheduleStatusBadge';
import { formatClock, localDateKey } from '@/features/schedules/components/schedule-workspace-format';

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

/* One control surface for the whole form: same height, border, radius and
   focus ring as the shared Input primitives, so a select never looks like a
   different kind of control from a text field. */
const fieldLabel =
  'mb-2 block text-[12.5px] font-semibold text-ink-secondary';

const fieldControl =
  'block min-h-10 w-full min-w-0 rounded-[var(--radius-control)] border border-ice-border bg-sheet px-3 py-2 text-[13px] text-ink shadow-xs outline-none transition-[border-color,box-shadow] placeholder:text-ink-subtle focus-visible:border-cobalt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-ink-muted';

function FieldLabel({
  htmlFor,
  required,
  children,
}: {
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className={fieldLabel}>
      {children}
      {required ? (
        <span className="text-danger ml-1" aria-hidden="true">
          *
        </span>
      ) : null}
    </label>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-rule-soft border-b px-5 py-4 last:border-b-0 sm:px-6">
      <div className="mb-3">
        <h3 className="text-ink text-[13px] font-semibold">{title}</h3>
        {description ? (
          <p className="text-ink-muted mt-0.5 text-[11.5px] leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
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
      className="bg-foreground/45 fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
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
        className="border-ice-border bg-sheet modal-panel-enter flex max-h-[100dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[var(--radius-panel)] border shadow-xl sm:max-h-[calc(100dvh-2rem)] sm:rounded-[var(--radius-panel)]"
      >
        <div className="border-rule flex shrink-0 items-start justify-between gap-4 border-b px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2
              id="schedule-form-title"
              className="font-display text-midnight text-[19px] leading-tight font-bold tracking-[-0.02em]"
            >
              {isEditing ? 'Edit schedule' : 'Create schedule'}
            </h2>
            <p
              id="schedule-form-description"
              className="text-ink-muted mt-1 text-[12.5px] leading-relaxed"
            >
              {isEditing
                ? 'Update the procedure, theatre time and assignments for this case.'
                : 'Book a surgical procedure into an available theatre.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close schedule form"
            className="border-ice-border text-ink-subtle hover:border-cobalt/30 hover:text-cobalt focus-visible:outline-cobalt flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <X size={16} weight="bold" aria-hidden="true" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="thin-scroll min-h-0 flex-1 overflow-y-auto">
            {error && (
              <div
                className="border-danger-border bg-danger-soft text-danger mx-5 mt-4 rounded-[var(--radius-control)] border px-3.5 py-2.5 text-[12.5px] font-medium sm:mx-6"
                role="alert"
              >
                {error}
              </div>
            )}

            <FormSection
              title="Procedure"
              description="What is being performed, and how soon it must run."
            >
              <div className="grid gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <div>
                  <FieldLabel htmlFor="schedule-procedure" required>
                    Procedure name
                  </FieldLabel>
                  <input
                    id="schedule-procedure"
                    type="text"
                    name="procedure"
                    required
                    maxLength={200}
                    placeholder="e.g. Laparoscopic cholecystectomy"
                    value={procedure}
                    onChange={(e) => setProcedure(e.target.value)}
                    className={fieldControl}
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="schedule-priority" required>
                    Priority
                  </FieldLabel>
                  <select
                    id="schedule-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as SchedulePriority)}
                    className={fieldControl}
                  >
                    <option value="ELECTIVE">Elective</option>
                    <option value="URGENT">Urgent</option>
                    <option value="EMERGENCY">Emergency</option>
                  </select>
                </div>
              </div>
            </FormSection>

            <FormSection
              title="Patient and surgical team"
              description="The patient on the list and the surgeon responsible for the case."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="schedule-patient" required>
                    Patient
                  </FieldLabel>
                  <select
                    id="schedule-patient"
                    required
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className={fieldControl}
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
                  <FieldLabel htmlFor="schedule-surgeon" required>
                    Surgeon
                  </FieldLabel>
                  <select
                    id="schedule-surgeon"
                    required
                    value={surgeonId}
                    onChange={(e) => setSurgeonId(e.target.value)}
                    className={fieldControl}
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
            </FormSection>

            <FormSection
              title="Theatre and time"
              description="The department owns the theatre list. Only theatres in the selected department can be booked."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="schedule-department" required>
                    Department
                  </FieldLabel>
                  <select
                    id="schedule-department"
                    required
                    value={departmentId}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    className={fieldControl}
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
                  <FieldLabel htmlFor="schedule-room" required>
                    Operating theatre
                  </FieldLabel>
                  <select
                    id="schedule-room"
                    required
                    value={otRoomId}
                    onChange={(e) => setOtRoomId(e.target.value)}
                    className={fieldControl}
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
                  {departmentId && availableOtRooms.length === 0 ? (
                    <p className="text-danger mt-1.5 text-[11.5px]">
                      No theatre is configured for this department.
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div>
                  <FieldLabel htmlFor="schedule-date" required>
                    Theatre date
                  </FieldLabel>
                  <input
                    id="schedule-date"
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className={fieldControl}
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="schedule-start" required>
                    Start time
                  </FieldLabel>
                  <input
                    id="schedule-start"
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className={fieldControl}
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="schedule-end" required>
                    End time
                  </FieldLabel>
                  <input
                    id="schedule-end"
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className={fieldControl}
                  />
                </div>
              </div>

              <p className="text-ink-muted mt-2.5 text-[11.5px] leading-relaxed">
                Dates and times are interpreted in local theatre time. Theatre,
                surgeon and patient overlaps are rejected by the schedule API.
              </p>
            </FormSection>

            <FormSection
              title="Clinical notes"
              description="Optional context stored with the case record."
            >
              <label htmlFor="schedule-notes" className="sr-only">
                Clinical notes
              </label>
              <textarea
                id="schedule-notes"
                rows={3}
                maxLength={5000}
                placeholder="Precautions, equipment needs or instructions for the theatre team."
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                className={`${fieldControl} min-h-24 resize-y py-2.5`}
              />
            </FormSection>
          </div>

          <div className="border-rule bg-surface-subtle/60 flex shrink-0 flex-col-reverse items-stretch justify-end gap-2 border-t px-5 py-3.5 sm:flex-row sm:items-center sm:px-6">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {isEditing ? 'Cancel changes' : 'Cancel'}
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              {isEditing ? 'Save changes' : 'Create schedule'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
