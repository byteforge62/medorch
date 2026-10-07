'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { apiClient, ApiClientError } from '@/lib/api/client';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';

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

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSchedule = useCallback(async () => {
    const response = await apiClient.get<Schedule>(
      `/api/schedules/${scheduleId}`,
    );

    setSchedule(response);
  }, [scheduleId]);

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

      await loadSchedule();
      setSelectedUserId('');
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

      await loadSchedule();
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

      await loadSchedule();
      setSelectedEquipmentId('');
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

      await loadSchedule();
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

      await loadSchedule();
      setNoteContent('');
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

  if (loading) {
    return <LoadingState />;
  }

  if (error && !schedule) {
    return <ErrorState message={error} />;
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
      <section className="space-y-2">
        <p className="text-sm font-medium text-[var(--color-primary)]">
          Surgical Schedule
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {schedule.procedure}
            </h1>

            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {schedule.patient?.patientCode ?? 'Patient'} ·{' '}
              {schedule.otRoom?.name ?? 'OT room'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge>{formatLabel(schedule.status)}</Badge>
            <Badge>{formatLabel(schedule.priority)}</Badge>
          </div>
        </div>

        {error ? (
          <p className="text-sm text-[var(--color-danger)]">{error}</p>
        ) : null}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Schedule overview</h2>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--color-text-muted)]">Date</dt>
              <dd>{formatDate(schedule.scheduledDate)}</dd>
            </div>

            <div className="flex justify-between gap-4">
              <dt className="text-[var(--color-text-muted)]">Time</dt>
              <dd>
                {formatDateTime(schedule.startTime)} —{' '}
                {formatDateTime(schedule.endTime)}
              </dd>
            </div>

            <div className="flex justify-between gap-4">
              <dt className="text-[var(--color-text-muted)]">Patient</dt>
              <dd className="text-right">
                {schedule.patient?.name ??
                  schedule.patient?.patientCode ??
                  'Unassigned'}
              </dd>
            </div>

            <div className="flex justify-between gap-4">
              <dt className="text-[var(--color-text-muted)]">Department</dt>
              <dd>{schedule.department?.name ?? '—'}</dd>
            </div>

            <div className="flex justify-between gap-4">
              <dt className="text-[var(--color-text-muted)]">OT room</dt>
              <dd>
                {schedule.otRoom
                  ? `${schedule.otRoom.name} (${schedule.otRoom.code})`
                  : '—'}
              </dd>
            </div>

            <div className="flex justify-between gap-4">
              <dt className="text-[var(--color-text-muted)]">Surgeon</dt>
              <dd className="text-right">
                {schedule.surgeon?.name ?? schedule.surgeon?.email ?? '—'}
              </dd>
            </div>
          </dl>
        </Card>

        <Card>
          <h2 className="font-semibold">Clinical notes</h2>

          <p className="mt-4 text-sm whitespace-pre-wrap text-[var(--color-text-muted)]">
            {schedule.clinicalNotes || 'No clinical notes recorded.'}
          </p>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold">Assigned staff</h2>
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
                  className="flex items-center justify-between gap-4 rounded-lg border border-[var(--color-border)] p-3"
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
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm"
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
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm"
              >
                {STAFF_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {formatLabel(role)}
                  </option>
                ))}
              </select>

              <button
                type="button"
                disabled={!selectedUserId || actionLoading}
                onClick={() => void handleAssignStaff()}
                className="rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              >
                Assign
              </button>
            </div>
          ) : null}
        </Card>

        <Card>
          <div>
            <h2 className="font-semibold">Assigned equipment</h2>
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
                  className="flex items-center justify-between gap-4 rounded-lg border border-[var(--color-border)] p-3"
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
                className="min-w-0 flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm"
              >
                <option value="">Select available equipment</option>

                {availableEquipment.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} · {item.category}
                  </option>
                ))}
              </select>

              <button
                type="button"
                disabled={!selectedEquipmentId || actionLoading}
                onClick={() => void handleAssignEquipment()}
                className="rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              >
                Assign
              </button>
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
                className="rounded-lg border border-[var(--color-border)] p-4"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-medium">{note.author.name}</p>

                  <p className="text-xs text-[var(--color-text-muted)]">
                    {formatDateTime(note.createdAt)}
                  </p>
                </div>

                <p className="mt-3 text-sm whitespace-pre-wrap">
                  {note.content}
                </p>
              </article>
            ))
          )}
        </div>

        <div className="mt-5 space-y-3">
          <textarea
            value={noteContent}
            onChange={(event) => setNoteContent(event.target.value)}
            rows={4}
            placeholder="Add a clinical or operational note..."
            className="w-full resize-y rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
          />

          <div className="flex justify-end">
            <button
              type="button"
              disabled={!noteContent.trim() || actionLoading}
              onClick={() => void handleAddNote()}
              className="rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              Add note
            </button>
          </div>
        </div>
      </Card>
    </main>
  );
}
