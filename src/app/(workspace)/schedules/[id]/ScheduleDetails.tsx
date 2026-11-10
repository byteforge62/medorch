'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { PencilSimple } from '@phosphor-icons/react';
import { apiClient, ApiClientError } from '@/lib/api/client';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Button } from '@/components/ui/Button';
import { ScheduleStatusBadge, SchedulePriorityBadge } from '@/components/schedules/ScheduleStatusBadge';
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
  const canManageSchedules =
    isAdmin || session?.user?.role === 'DOCTOR';
  const canManageNotes = isAdmin || session?.user?.role === "DOCTOR";

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
  const [departments, setDepartments] = useState<ScheduleDepartmentOption[]>([]);
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
      const updatedNote = await apiClient.patch<Pick<ScheduleNote, 'id' | 'content' | 'updatedAt'>>(
        `/api/schedules/${scheduleId}/notes/${editingNote.id}`,
        { content },
      );

      setSchedule((current) =>
        current
          ? {
              ...current,
              notes: current.notes.map((note) =>
                note.id === updatedNote.id
                  ? { ...note, content: updatedNote.content, updatedAt: updatedNote.updatedAt }
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
    if (!window.confirm('Delete this schedule note? This action cannot be undone.')) {
      return;
    }

    setActionLoading(true);
    setError('');
    try {
      await apiClient.delete(
        `/api/schedules/${scheduleId}/notes/${note.id}`,
      );
      setSchedule((current) =>
        current
          ? { ...current, notes: current.notes.filter((item) => item.id !== note.id) }
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
          className="text-sm font-medium text-[var(--color-primary)] underline"
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
    <main className="space-y-6">
      <section className="border-t-2 border-foreground pt-4 pb-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="bg-primary h-2 w-2" aria-hidden="true" />
              <p className="eyebrow">Case record</p>
              <span className="border-border-strong text-foreground-muted border px-1.5 py-0.5 font-mono text-[10px] tracking-[0.14em] uppercase">
                {schedule.otRoom?.code ?? 'OT'} · {formatDate(schedule.scheduledDate)}
              </span>
            </div>

            <h1 className="text-foreground mt-3 text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.05] font-semibold tracking-[-0.03em]">
              {schedule.procedure}
            </h1>

            <p className="text-foreground-secondary mt-3 max-w-[58ch] text-sm leading-relaxed">
              {schedule.patient?.name ??
                schedule.patient?.patientCode ??
                'Patient'}{' '}
              · {schedule.otRoom?.name ?? 'OT room'} ·{' '}
              {formatDateTime(schedule.startTime)} —{' '}
              {formatDateTime(schedule.endTime)}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <ScheduleStatusBadge status={schedule.status} />
              <SchedulePriorityBadge priority={schedule.priority} />
            </div>

            {error ? (
              <p role="alert" className="text-danger mt-3 text-sm">
                {error}
              </p>
            ) : null}
          </div>

          {canManageSchedules ? (
            <div className="shrink-0 space-y-2 lg:max-w-md">
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
                <p role="alert" className="text-danger text-[12px]">
                  {editOptionsError}
                </p>
              ) : null}

              <ScheduleStatusActions
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
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <p className="eyebrow">Case facts</p>
          <h2 className="text-foreground mt-1.5 text-base font-semibold tracking-tight">Schedule overview</h2>

            <dl className="border-border divide-y divide-border border-t text-sm">
              {[
                { term: 'Date', value: formatDate(schedule.scheduledDate) },
                {
                  term: 'Time',
                  value: `${formatDateTime(schedule.startTime)} — ${formatDateTime(schedule.endTime)}`,
                },
                {
                  term: 'Patient',
                  value:
                    schedule.patient?.name ??
                    schedule.patient?.patientCode ??
                    'Unassigned',
                },
                {
                  term: 'Department',
                  value: schedule.department?.name ?? '—',
                },
                {
                  term: 'OT room',
                  value: schedule.otRoom
                    ? `${schedule.otRoom.name} (${schedule.otRoom.code})`
                    : '—',
                },
                {
                  term: 'Surgeon',
                  value:
                    schedule.surgeon?.name ?? schedule.surgeon?.email ?? '—',
                },
              ].map((row) => (
                <div
                  key={row.term}
                  className="flex items-baseline justify-between gap-4 py-2.5"
                >
                  <dt className="eyebrow">{row.term}</dt>
                  <dd className="text-foreground text-right font-medium">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
        </Card>

        {(isAdmin || session?.user?.role === 'DOCTOR') && (
          <Card>
            <p className="eyebrow">Record</p>
            <h2 className="text-foreground mt-1.5 text-base font-semibold tracking-tight">Clinical notes</h2>

            <p className="mt-4 text-sm whitespace-pre-wrap text-[var(--color-text-muted)]">
              {schedule.clinicalNotes || 'No clinical notes recorded.'}
            </p>
          </Card>
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="min-w-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Theatre team</p>
              <h2 className="text-foreground mt-1.5 text-base font-semibold tracking-tight">Assigned staff</h2>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                {schedule.staff.length} assigned
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {schedule.staff.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)]">
                No staff assigned.
              </p>
            ) : (
              schedule.staff.map((staff) => (
                <div
                  key={staff.id}
                  className="flex items-center justify-between gap-4 border border-[var(--color-border)] p-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{staff.user.name}</p>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {formatLabel(staff.role)} · {staff.user.email}
                    </p>
                  </div>

                  {isAdmin ? (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => void handleRemoveStaff(staff.id)}
                      className="shrink-0 text-sm font-medium text-[var(--color-danger)] disabled:opacity-50"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              ))
            )}
          </div>

          {isAdmin ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_180px_auto]">
              <select
                value={selectedUserId}
                onChange={(event) => setSelectedUserId(event.target.value)}
                className="min-w-0 w-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm"
              >
                <option value="">Select staff</option>

                {availableStaff.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedStaffRole}
                onChange={(event) =>
                  setSelectedStaffRole(event.target.value as StaffRole)
                }
                className="min-w-0 w-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm"
              >
                {STAFF_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {formatLabel(role)}
                  </option>
                ))}
              </select>

              <Button type="button" disabled={!selectedUserId || actionLoading} onClick={() => void handleAssignStaff()}>
                Assign
              </Button>
            </div>
          ) : null}
        </Card>

        <Card className="min-w-0">
          <div>
            <p className="eyebrow">Equipment</p>
            <h2 className="text-foreground mt-1.5 text-base font-semibold tracking-tight">Assigned equipment</h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {schedule.equipment.filter((item) => !item.releasedAt).length}{' '}
              active assignments
            </p>
          </div>

          <div className="mt-4 space-y-3">
            {schedule.equipment.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)]">
                No equipment assigned.
              </p>
            ) : (
              schedule.equipment.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between gap-4 border border-[var(--color-border)] p-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{assignment.equipment.name}</p>

                    <p className="text-sm text-[var(--color-text-muted)]">
                      {assignment.equipment.category}
                      {assignment.equipment.serialNumber
                        ? ` · ${assignment.equipment.serialNumber}`
                        : ''}
                    </p>

                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
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
                      className="shrink-0 text-sm font-medium text-[var(--color-danger)] disabled:opacity-50"
                    >
                      Release
                    </button>
                  ) : null}
                </div>
              ))
            )}
          </div>

          {isAdmin ? (
            <div className="mt-5 flex gap-3">
              <select
                value={selectedEquipmentId}
                onChange={(event) => setSelectedEquipmentId(event.target.value)}
                className="min-w-0 flex-1 border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm"
              >
                <option value="">Select available equipment</option>

                {availableEquipment.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} · {item.category}
                  </option>
                ))}
              </select>

              <Button type="button" disabled={!selectedEquipmentId || actionLoading} onClick={() => void handleAssignEquipment()}>
                Assign
              </Button>
            </div>
          ) : null}
        </Card>
      </section>

      <Card>
        <div>
          <h2 className="font-semibold">Schedule notes</h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Operational notes attached to this schedule.
          </p>
        </div>

        <div className="mt-5 space-y-4">
          {schedule.notes.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">
              No notes added yet.
            </p>
          ) : (
            schedule.notes.map((note) => (
              <article
                key={note.id}
                className="border border-[var(--color-border)] p-4"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-medium">{note.author.name}</p>

                  <p className="text-xs text-[var(--color-text-muted)]">
                    {formatDateTime(note.createdAt)}
                  </p>
                </div>

                {editingNote?.id === note.id ? (
                  <div className="mt-3 space-y-2">
                    <textarea
                      value={editingNoteContent}
                      onChange={(event) => setEditingNoteContent(event.target.value)}
                      rows={3}
                      maxLength={5000}
                      disabled={actionLoading}
                      aria-label="Edit schedule note"
                      className="w-full resize-y border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => {
                          setEditingNote(null);
                          setEditingNoteContent('');
                        }}
                        className="border border-[var(--color-border)] px-3 py-2 text-xs font-medium disabled:opacity-50"
                      >
                        Keep note
                      </button>
                      <Button type="button" disabled={!editingNoteContent.trim() || actionLoading} onClick={() => void handleUpdateNote()}>
                        Save note
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm whitespace-pre-wrap">
                    {note.content}
                  </p>
                )}
                {canManageNotes && note.author.id === session?.user?.id && (
                  <div className="mt-3 flex justify-end gap-3">
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => {
                        setEditingNote(note);
                        setEditingNoteContent(note.content);
                      }}
                      className="text-xs font-medium text-[var(--color-primary)] disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => void handleDeleteNote(note)}
                      className="text-xs font-medium text-[var(--color-danger)] disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </article>
            ))
          )}
        </div>

        {canManageNotes && (
          <div className="mt-5 space-y-3">
            <textarea
              value={noteContent}
              onChange={(event) => setNoteContent(event.target.value)}
              rows={4}
              maxLength={5000}
              placeholder="Add a clinical or operational note..."
              className="w-full resize-y border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
            />

            <div className="flex justify-end">
              <Button type="button" disabled={!noteContent.trim() || actionLoading} onClick={() => void handleAddNote()}>
                Add note
              </Button>
            </div>
          </div>
        )}
      </Card>

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
    </main>
  );
}
