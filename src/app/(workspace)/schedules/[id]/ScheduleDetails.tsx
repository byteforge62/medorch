'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { PencilSimple } from '@phosphor-icons/react';
import { apiClient, ApiClientError } from '@/lib/api/client';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Button } from '@/components/ui/Button';
import {
  ScheduleStatusBadge,
  SchedulePriorityBadge,
} from '@/components/schedules/ScheduleStatusBadge';
import { ScheduleStatusActions } from '@/components/schedules/ScheduleStatusActions';
import {
  ScheduleForm,
  type DepartmentOption as ScheduleDepartmentOption,
  type DoctorOption as ScheduleDoctorOption,
  type OTRoomOption as ScheduleRoomOption,
  type PatientOption as SchedulePatientOption,
} from '@/components/schedules/ScheduleForm';

type ScheduleStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'DELAYED'
  | 'COMPLETED'
  | 'CANCELLED';

type SchedulePriority = 'ELECTIVE' | 'URGENT' | 'EMERGENCY';

type StaffRole = 'SURGEON' | 'NURSE' | 'ANESTHETIST' | 'TECHNICIAN' | 'OTHER';

interface ScheduleStaff {
  id: string;
  role: StaffRole;
  assignedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface ScheduleEquipment {
  id: string;
  equipmentId: string;
  assignedAt: string;
  releasedAt?: string | null;
  equipment: {
    id: string;
    name: string;
    category: string;
    serialNumber?: string | null;
    status: string;
  };
}

interface ScheduleNote {
  id: string;
  authorId?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
}

interface Schedule {
  id: string;
  patientId: string;
  departmentId: string;
  otRoomId: string;
  surgeonId: string;
  procedure: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status: ScheduleStatus;
  priority: SchedulePriority;
  clinicalNotes?: string | null;
  patient?: {
    id: string;
    patientCode: string;
    name?: string | null;
  } | null;
  department?: {
    id: string;
    name: string;
  } | null;
  otRoom?: {
    id: string;
    name: string;
    code: string;
  } | null;
  surgeon?: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
  staff: ScheduleStaff[];
  equipment: ScheduleEquipment[];
  notes: ScheduleNote[];
}

interface UserOption {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface EquipmentOption {
  id: string;
  name: string;
  category: string;
  serialNumber?: string | null;
  status: string;
}

const STAFF_ROLES: StaffRole[] = [
  'SURGEON',
  'NURSE',
  'ANESTHETIST',
  'TECHNICIAN',
  'OTHER',
];

function formatLabel(value: string) {
  return value.replaceAll('_', ' ');
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function ScheduleDetail({ scheduleId }: { scheduleId: string }) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';
  const canManageSchedules = isAdmin || session?.user?.role === 'DOCTOR';
  const canManageNotes = isAdmin || session?.user?.role === 'DOCTOR';

  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [equipmentOptions, setEquipmentOptions] = useState<EquipmentOption[]>(
    [],
  );

  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedStaffRole, setSelectedStaffRole] =
    useState<StaffRole>('NURSE');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState('');

  const [noteContent, setNoteContent] = useState('');
  const [editingNote, setEditingNote] = useState<ScheduleNote | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');

  const [editOpen, setEditOpen] = useState(false);
  const [editOptionsLoaded, setEditOptionsLoaded] = useState(false);
  const [editOptionsLoading, setEditOptionsLoading] = useState(false);
  const [editOptionsError, setEditOptionsError] = useState('');
  const [patients, setPatients] = useState<SchedulePatientOption[]>([]);
  const [departments, setDepartments] = useState<ScheduleDepartmentOption[]>(
    [],
  );
  const [otRooms, setOtRooms] = useState<ScheduleRoomOption[]>([]);
  const [doctors, setDoctors] = useState<ScheduleDoctorOption[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSchedule = useCallback(async () => {
    const response = await apiClient.get<Schedule>(
      `/api/schedules/${scheduleId}`,
    );

    setSchedule(response);
  }, [scheduleId]);

  const refreshAfterMutation = async () => {
    try {
      await loadSchedule();
    } catch (refreshError) {
      setError(
        `The change was saved, but the schedule could not be refreshed: ${
          refreshError instanceof ApiClientError
            ? refreshError.message
            : 'Please reload this page.'
        }`,
      );
    }
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const requests: Promise<unknown>[] = [loadSchedule()];

        if (isAdmin) {
          requests.push(
            apiClient.get<UserOption[]>('/api/users'),
            apiClient.get<EquipmentOption[]>('/api/equipment'),
          );
        }

        const results = await Promise.all(requests);

        if (cancelled || !isAdmin) {
          return;
        }

        setUsers((results[1] as UserOption[]) ?? []);
        setEquipmentOptions((results[2] as EquipmentOption[]) ?? []);
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof ApiClientError
              ? loadError.message
              : 'Failed to load schedule details.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [isAdmin, loadSchedule]);

  const availableStaff = useMemo(
    () =>
      users.filter(
        (user) =>
          user.status === 'ACTIVE' &&
          !schedule?.staff.some((staff) => staff.user.id === user.id),
      ),
    [schedule?.staff, users],
  );

  const availableEquipment = useMemo(
    () =>
      equipmentOptions.filter(
        (item) =>
          item.status === 'AVAILABLE' &&
          !schedule?.equipment.some(
            (assignment) =>
              assignment.equipmentId === item.id && !assignment.releasedAt,
          ),
      ),
    [equipmentOptions, schedule?.equipment],
  );

  const openEditSchedule = async () => {
    if (editOptionsLoaded) {
      setEditOpen(true);
      return;
    }

    setEditOptionsLoading(true);
    setEditOptionsError('');

    try {
      const [patientData, departmentData, roomData, doctorData] =
        await Promise.all([
          apiClient.get<SchedulePatientOption[]>('/api/patients'),
          apiClient.get<ScheduleDepartmentOption[]>('/api/departments'),
          apiClient.get<ScheduleRoomOption[]>('/api/ot-rooms'),
          apiClient.get<ScheduleDoctorOption[]>('/api/doctors'),
        ]);

      setPatients(patientData ?? []);
      setDepartments(departmentData ?? []);
      setOtRooms(roomData ?? []);
      setDoctors(doctorData ?? []);
      setEditOptionsLoaded(true);
      setEditOpen(true);
    } catch (optionsError) {
      setEditOptionsError(
        optionsError instanceof ApiClientError
          ? optionsError.message
          : 'Could not load the schedule options.',
      );
    } finally {
      setEditOptionsLoading(false);
    }
  };

  const handleAssignStaff = async () => {
    if (!selectedUserId) {
      return;
    }

    setActionLoading(true);
    setError('');

    try {
      await apiClient.post(`/api/schedules/${scheduleId}/staff`, {
        userId: selectedUserId,
        role: selectedStaffRole,
      });

      setSelectedUserId('');
      await refreshAfterMutation();
    } catch (actionError) {
      setError(
        actionError instanceof ApiClientError
          ? actionError.message
          : 'Failed to assign staff.',
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveStaff = async (staffId: string) => {
    setActionLoading(true);
    setError('');

    try {
      await apiClient.delete(`/api/schedules/${scheduleId}/staff/${staffId}`);

      await refreshAfterMutation();
    } catch (actionError) {
      setError(
        actionError instanceof ApiClientError
          ? actionError.message
          : 'Failed to remove staff.',
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignEquipment = async () => {
    if (!selectedEquipmentId) {
      return;
    }

    setActionLoading(true);
    setError('');

    try {
      await apiClient.post(`/api/schedules/${scheduleId}/equipment`, {
        equipmentId: selectedEquipmentId,
      });

      setSelectedEquipmentId('');
      await refreshAfterMutation();
    } catch (actionError) {
      setError(
        actionError instanceof ApiClientError
          ? actionError.message
          : 'Failed to assign equipment.',
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReleaseEquipment = async (equipmentId: string) => {
    setActionLoading(true);
    setError('');

    try {
      await apiClient.patch(
        `/api/schedules/${scheduleId}/equipment/${equipmentId}`,
        {},
      );

      await refreshAfterMutation();
    } catch (actionError) {
      setError(
        actionError instanceof ApiClientError
          ? actionError.message
          : 'Failed to release equipment.',
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async () => {
    const content = noteContent.trim();

    if (!content) {
      return;
    }

    setActionLoading(true);
    setError('');

    try {
      await apiClient.post(`/api/schedules/${scheduleId}/notes`, {
        content,
      });

      setNoteContent('');
      await refreshAfterMutation();
    } catch (actionError) {
      setError(
        actionError instanceof ApiClientError
          ? actionError.message
          : 'Failed to add note.',
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateNote = async () => {
    const content = editingNoteContent.trim();
    if (!editingNote || !content) return;

    setActionLoading(true);
    setError('');
    try {
      const updatedNote = await apiClient.patch<
        Pick<ScheduleNote, 'id' | 'content' | 'updatedAt'>
      >(`/api/schedules/${scheduleId}/notes/${editingNote.id}`, { content });

      setSchedule((current) =>
        current
          ? {
              ...current,
              notes: current.notes.map((note) =>
                note.id === updatedNote.id
                  ? {
                      ...note,
                      content: updatedNote.content,
                      updatedAt: updatedNote.updatedAt,
                    }
                  : note,
              ),
            }
          : current,
      );
      setEditingNote(null);
      setEditingNoteContent('');
    } catch (actionError) {
      setError(
        actionError instanceof ApiClientError
          ? actionError.message
          : 'Failed to update note.',
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteNote = async (note: ScheduleNote) => {
    if (
      !window.confirm(
        'Delete this schedule note? This action cannot be undone.',
      )
    ) {
      return;
    }

    setActionLoading(true);
    setError('');
    try {
      await apiClient.delete(`/api/schedules/${scheduleId}/notes/${note.id}`);
      setSchedule((current) =>
        current
          ? {
              ...current,
              notes: current.notes.filter((item) => item.id !== note.id),
            }
          : current,
      );
      if (editingNote?.id === note.id) {
        setEditingNote(null);
        setEditingNoteContent('');
      }
    } catch (actionError) {
      setError(
        actionError instanceof ApiClientError
          ? actionError.message
          : 'Failed to delete note.',
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error && !schedule) {
    return (
      <div className="space-y-3">
        <ErrorState message={error} />
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="text-primary text-sm font-medium underline underline-offset-4"
        >
          Reload schedule
        </button>
      </div>
    );
  }

  if (!schedule) {
    return (
      <EmptyState
        title="Schedule not found"
        description="The requested schedule could not be loaded."
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/schedules"
          className="text-ink-muted hover:text-ink inline-flex items-center gap-1.5 text-[12px] font-medium"
        >
          <span aria-hidden="true">←</span>
          Theatre schedule
        </Link>
        <span className="text-ink-subtle font-mono text-[9.5px] tracking-[0.08em]">
          CASE {schedule.id.slice(0, 8).toUpperCase()}
        </span>
      </div>

      <header className="dashboard-command bg-rail relative overflow-hidden rounded-[18px] px-5 pt-5 pb-5 text-white sm:px-6">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:64px_100%]"
        />
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-20 h-64 w-64 rounded-full border border-white/10"
        />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="font-mono text-[9px] tracking-[0.1em] text-white/45">
              THEATRE CASE
            </p>
            <span className="h-px w-5 bg-white/25" aria-hidden="true" />
            <span className="font-mono text-[9px] text-white/45">
              {schedule.otRoom?.code ?? 'OT'} ·{' '}
              {formatDate(schedule.scheduledDate)}
            </span>
          </div>

          <h1 className="mt-3 max-w-[24ch] text-[clamp(1.8rem,3vw,2.45rem)] leading-[1.03] font-semibold tracking-[-0.03em] text-white">
            {schedule.procedure}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <ScheduleStatusBadge status={schedule.status} />
            <SchedulePriorityBadge priority={schedule.priority} />
            <span className="font-mono text-[10px] text-white/45">
              {schedule.patient?.name ??
                schedule.patient?.patientCode ??
                'Patient'}
            </span>
          </div>

          <div className="mt-5 grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-2 xl:grid-cols-3">
            {[
              {
                term: 'Date',
                value: formatDate(schedule.scheduledDate),
              },
              {
                term: 'Theatre time',
                value: `${formatDateTime(schedule.startTime)} — ${formatDateTime(schedule.endTime)}`,
              },
              {
                term: 'Location',
                value: schedule.otRoom
                  ? `${schedule.otRoom.name} · ${schedule.otRoom.code}`
                  : 'Theatre not assigned',
              },
            ].map((item) => (
              <div key={item.term}>
                <p className="text-[9px] font-semibold tracking-[0.08em] text-white/40 uppercase">
                  {item.term}
                </p>
                <p className="mt-1.5 text-[12.5px] leading-snug font-medium text-white/85">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {error ? (
        <p
          role="alert"
          className="border-danger-border bg-danger-soft text-danger rounded-[var(--radius-control)] border px-4 py-2.5 text-[12.5px]"
        >
          {error}
        </p>
      ) : null}

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-4">
          <section
            className="panel overflow-hidden"
            aria-labelledby="case-facts-title"
          >
            <div className="border-rule-soft flex flex-wrap items-baseline justify-between gap-2 border-b px-4 py-3 sm:px-5">
              <div>
                <h2
                  id="case-facts-title"
                  className="text-ink text-[13px] font-semibold"
                >
                  Case facts
                </h2>
                <p className="text-ink-muted mt-0.5 text-[11px]">
                  The recorded identity, assignment and timing of this case.
                </p>
              </div>
              <span className="text-ink-subtle font-mono text-[9.5px]">
                {schedule.otRoom?.code ?? 'OT'}
              </span>
            </div>

            <dl className="divide-rule-soft grid divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              {[
                {
                  term: 'Patient',
                  value:
                    schedule.patient?.name ??
                    schedule.patient?.patientCode ??
                    'Unassigned',
                  meta: schedule.patient?.patientCode,
                },
                {
                  term: 'Surgeon',
                  value:
                    schedule.surgeon?.name ?? schedule.surgeon?.email ?? '—',
                  meta: schedule.surgeon?.email,
                },
                {
                  term: 'Department',
                  value: schedule.department?.name ?? '—',
                },
                {
                  term: 'Theatre',
                  value: schedule.otRoom
                    ? `${schedule.otRoom.name} (${schedule.otRoom.code})`
                    : '—',
                  href: schedule.otRoom ? '/ot-rooms' : undefined,
                },
                {
                  term: 'Scheduled start',
                  value: formatDateTime(schedule.startTime),
                },
                {
                  term: 'Scheduled end',
                  value: formatDateTime(schedule.endTime),
                },
              ].map((row) => (
                <div key={row.term} className="min-w-0 px-4 py-3 sm:px-5">
                  <dt className="text-ink-subtle text-[9.5px] font-semibold tracking-[0.06em] uppercase">
                    {row.term}
                  </dt>
                  <dd className="text-ink mt-1 text-[13px] font-medium break-words">
                    {row.href ? (
                      <Link
                        href={row.href}
                        className="text-primary hover:underline"
                      >
                        {row.value}
                      </Link>
                    ) : (
                      row.value
                    )}
                  </dd>
                  {row.meta && row.meta !== row.value ? (
                    <dd className="text-ink-subtle mt-0.5 truncate font-mono text-[9.5px]">
                      {row.meta}
                    </dd>
                  ) : null}
                </div>
              ))}
            </dl>
          </section>

          {isAdmin || session?.user?.role === 'DOCTOR' ? (
            <section
              className="panel overflow-hidden"
              aria-labelledby="clinical-notes-title"
            >
              <div className="border-rule-soft flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
                <div>
                  <h2
                    id="clinical-notes-title"
                    className="text-ink text-[13px] font-semibold"
                  >
                    Clinical notes
                  </h2>
                  <p className="text-ink-muted mt-0.5 text-[11px]">
                    The recorded clinical context for this procedure.
                  </p>
                </div>
                <span className="bg-danger-soft text-danger rounded-full px-2 py-0.5 text-[9px] font-semibold">
                  Restricted
                </span>
              </div>
              <p className="text-ink-secondary px-4 py-4 text-[13px] leading-[1.8] whitespace-pre-wrap sm:px-5">
                {schedule.clinicalNotes || 'No clinical notes recorded.'}
              </p>
            </section>
          ) : null}

          <section
            className="panel overflow-hidden"
            aria-labelledby="schedule-notes-title"
          >
            <div className="border-rule-soft flex flex-wrap items-baseline justify-between gap-2 border-b px-4 py-3 sm:px-5">
              <div>
                <h2
                  id="schedule-notes-title"
                  className="text-ink text-[13px] font-semibold"
                >
                  Case notes
                </h2>
                <p className="text-ink-muted mt-0.5 text-[11px]">
                  Operational notes attached to this schedule.
                </p>
              </div>
              <span className="text-ink-subtle font-mono text-[9.5px]">
                {schedule.notes.length} on file
              </span>
            </div>

            {schedule.notes.length === 0 ? (
              <p className="text-ink-muted px-4 py-5 text-[12px] sm:px-5">
                No notes added yet.
              </p>
            ) : (
              <ol className="divide-rule-soft divide-y">
                {schedule.notes.map((note) => (
                  <li key={note.id} className="px-4 py-4 sm:px-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-ink text-[12px] font-semibold">
                        {note.author.name}
                      </p>
                      <p className="text-ink-subtle font-mono text-[9.5px]">
                        {formatDateTime(note.createdAt)}
                      </p>
                    </div>

                    {editingNote?.id === note.id ? (
                      <div className="mt-3 space-y-2">
                        <textarea
                          value={editingNoteContent}
                          onChange={(event) =>
                            setEditingNoteContent(event.target.value)
                          }
                          rows={3}
                          maxLength={5000}
                          disabled={actionLoading}
                          aria-label="Edit case note"
                          className="control text-ink h-auto min-h-24 w-full resize-y px-3 py-2 text-[12.5px] outline-none disabled:opacity-50"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={actionLoading}
                            onClick={() => {
                              setEditingNote(null);
                              setEditingNoteContent('');
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            disabled={
                              !editingNoteContent.trim() || actionLoading
                            }
                            onClick={() => void handleUpdateNote()}
                          >
                            Save note
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-ink-secondary mt-2 text-[12.5px] leading-relaxed whitespace-pre-wrap">
                        {note.content}
                      </p>
                    )}

                    {canManageNotes &&
                    note.author.id === session?.user?.id &&
                    editingNote?.id !== note.id ? (
                      <div className="mt-2 flex gap-3">
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => {
                            setEditingNote(note);
                            setEditingNoteContent(note.content);
                          }}
                          className="text-primary text-[11px] font-semibold disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => void handleDeleteNote(note)}
                          className="text-danger text-[11px] font-semibold disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ol>
            )}

            {canManageNotes ? (
              <div className="border-rule-soft space-y-2 border-t px-4 py-4 sm:px-5">
                <label
                  htmlFor="case-note"
                  className="text-ink-secondary block text-[11px] font-semibold"
                >
                  Add a note
                </label>
                <textarea
                  id="case-note"
                  value={noteContent}
                  onChange={(event) => setNoteContent(event.target.value)}
                  rows={3}
                  maxLength={5000}
                  placeholder="Clinical or operational context for this case."
                  className="control text-ink placeholder:text-ink-subtle h-auto min-h-20 w-full resize-y px-3 py-2 text-[12.5px] outline-none"
                />
                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    disabled={!noteContent.trim() || actionLoading}
                    onClick={() => void handleAddNote()}
                  >
                    Add note
                  </Button>
                </div>
              </div>
            ) : null}
          </section>
        </div>

        <aside className="min-w-0 space-y-4">
          {canManageSchedules ? (
            <section
              className="panel overflow-hidden"
              aria-labelledby="case-controls-title"
            >
              <div className="border-rule-soft border-b px-4 py-3">
                <h2
                  id="case-controls-title"
                  className="text-ink text-[13px] font-semibold"
                >
                  Case controls
                </h2>
                <p className="text-ink-muted mt-0.5 text-[11px]">
                  Change the record or move the case through its lifecycle.
                </p>
              </div>
              <div className="space-y-3 px-4 py-4">
                {schedule.status !== 'COMPLETED' &&
                schedule.status !== 'CANCELLED' ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    isLoading={editOptionsLoading}
                    loadingLabel="Loading schedule options"
                    onClick={() => void openEditSchedule()}
                    className="w-full"
                  >
                    <PencilSimple size={13} aria-hidden="true" />
                    Edit schedule
                  </Button>
                ) : null}

                {editOptionsError ? (
                  <p role="alert" className="text-danger text-[11.5px]">
                    {editOptionsError}
                  </p>
                ) : null}

                <ScheduleStatusActions
                  bare
                  scheduleId={schedule.id}
                  scheduleLabel={schedule.procedure}
                  currentStatus={schedule.status}
                  onStatusUpdated={(_scheduleId, status) => {
                    setSchedule((current) =>
                      current ? { ...current, status } : current,
                    );
                    void refreshAfterMutation();
                  }}
                />
              </div>
            </section>
          ) : null}

          <section
            className="panel overflow-hidden"
            aria-labelledby="theatre-team-title"
          >
            <div className="border-rule-soft flex items-baseline justify-between gap-2 border-b px-4 py-3">
              <div>
                <h2
                  id="theatre-team-title"
                  className="text-ink text-[13px] font-semibold"
                >
                  Theatre team
                </h2>
                <p className="text-ink-muted mt-0.5 text-[10.5px]">
                  {schedule.staff.length} assigned
                </p>
              </div>
            </div>

            {schedule.staff.length === 0 ? (
              <p className="text-ink-muted px-4 py-4 text-[11.5px]">
                No staff assigned.
              </p>
            ) : (
              <ul className="divide-rule-soft divide-y">
                {schedule.staff.map((staff) => (
                  <li
                    key={staff.id}
                    className="flex items-start justify-between gap-3 px-4 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="text-ink truncate text-[12px] font-medium">
                        {staff.user.name}
                      </p>
                      <p className="text-ink-subtle mt-0.5 truncate text-[10.5px]">
                        {formatLabel(staff.role)} · {staff.user.email}
                      </p>
                    </div>

                    {isAdmin ? (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => void handleRemoveStaff(staff.id)}
                        className="text-danger shrink-0 text-[10.5px] font-semibold disabled:opacity-50"
                      >
                        Remove
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}

            {isAdmin ? (
              <div className="border-rule-soft space-y-2 border-t px-4 py-3">
                <label className="block">
                  <span className="sr-only">Staff member</span>
                  <select
                    value={selectedUserId}
                    onChange={(event) => setSelectedUserId(event.target.value)}
                    className="control text-ink h-9 w-full px-2.5 text-[11.5px] outline-none"
                  >
                    <option value="">Select staff</option>
                    {availableStaff.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex gap-2">
                  <label className="min-w-0 flex-1">
                    <span className="sr-only">Staff role</span>
                    <select
                      value={selectedStaffRole}
                      onChange={(event) =>
                        setSelectedStaffRole(event.target.value as StaffRole)
                      }
                      className="control text-ink h-9 w-full px-2.5 text-[11.5px] outline-none"
                    >
                      {STAFF_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {formatLabel(role)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Button
                    type="button"
                    size="sm"
                    disabled={!selectedUserId || actionLoading}
                    onClick={() => void handleAssignStaff()}
                  >
                    Assign
                  </Button>
                </div>
              </div>
            ) : null}
          </section>

          <section
            className="panel overflow-hidden"
            aria-labelledby="case-equipment-title"
          >
            <div className="border-rule-soft flex items-start justify-between gap-3 border-b px-4 py-3">
              <div>
                <h2
                  id="case-equipment-title"
                  className="text-ink text-[13px] font-semibold"
                >
                  Equipment
                </h2>
                <p className="text-ink-muted mt-0.5 text-[10.5px]">
                  {schedule.equipment.filter((item) => !item.releasedAt).length}{' '}
                  active assignments
                </p>
              </div>
              <Link
                href="/equipment"
                className="text-primary shrink-0 text-[10.5px] font-semibold hover:underline"
              >
                Register →
              </Link>
            </div>

            {schedule.equipment.length === 0 ? (
              <p className="text-ink-muted px-4 py-4 text-[11.5px]">
                No equipment assigned.
              </p>
            ) : (
              <ul className="divide-rule-soft divide-y">
                {schedule.equipment.map((assignment) => (
                  <li
                    key={assignment.id}
                    className="flex items-start justify-between gap-3 px-4 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="text-ink truncate text-[12px] font-medium">
                        {assignment.equipment.name}
                      </p>
                      <p className="text-ink-subtle mt-0.5 text-[10.5px]">
                        {assignment.equipment.category}
                        {assignment.equipment.serialNumber
                          ? ` · ${assignment.equipment.serialNumber}`
                          : ''}
                      </p>
                      <p className="text-ink-subtle mt-0.5 text-[9.5px]">
                        {assignment.releasedAt
                          ? `Released ${formatDateTime(assignment.releasedAt)}`
                          : `Assigned ${formatDateTime(assignment.assignedAt)}`}
                      </p>
                    </div>

                    {isAdmin && !assignment.releasedAt ? (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() =>
                          void handleReleaseEquipment(assignment.equipmentId)
                        }
                        className="text-danger shrink-0 text-[10.5px] font-semibold disabled:opacity-50"
                      >
                        Release
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}

            {isAdmin ? (
              <div className="border-rule-soft flex gap-2 border-t px-4 py-3">
                <label className="min-w-0 flex-1">
                  <span className="sr-only">Available equipment</span>
                  <select
                    value={selectedEquipmentId}
                    onChange={(event) =>
                      setSelectedEquipmentId(event.target.value)
                    }
                    className="control text-ink h-9 w-full px-2.5 text-[11.5px] outline-none"
                  >
                    <option value="">Select equipment</option>
                    {availableEquipment.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} · {item.category}
                      </option>
                    ))}
                  </select>
                </label>
                <Button
                  type="button"
                  size="sm"
                  disabled={!selectedEquipmentId || actionLoading}
                  onClick={() => void handleAssignEquipment()}
                >
                  Assign
                </Button>
              </div>
            ) : null}
          </section>
        </aside>
      </div>

      <ScheduleForm
        initialSchedule={schedule}
        defaultDate={schedule.scheduledDate.slice(0, 10)}
        patients={patients}
        departments={departments}
        otRooms={otRooms}
        doctors={doctors}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSuccess={() => {
          setEditOpen(false);
          void refreshAfterMutation();
        }}
      />
    </div>
  );
}
