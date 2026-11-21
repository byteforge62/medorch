'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Plus } from '@phosphor-icons/react';
import { ROOM_STATUS } from '@/lib/operational-status';

import { apiClient, ApiClientError } from '@/lib/api/client';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';

type OTRoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'DISABLED';

interface OTRoom {
  id: string;
  name: string;
  code: string;
  capacity?: number | null;
  status: OTRoomStatus;
  isActive: boolean;
  department?: {
    id: string;
    name: string;
  } | null;
}

interface RoomSchedule {
  id: string;
  roomId?: string | null;
  otRoom?: { name?: string | null; code?: string | null } | null;
  procedure?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  status?: string | null;
  priority?: string | null;
}

interface DepartmentOption {
  id: string;
  name: string;
}

interface OTRoomForm {
  name: string;
  code: string;
  departmentId: string;
  capacity: string;
}

const EMPTY_FORM: OTRoomForm = {
  name: '',
  code: '',
  departmentId: '',
  capacity: '',
};

const STATUS_OPTIONS: OTRoomStatus[] = [
  'AVAILABLE',
  'OCCUPIED',
  'MAINTENANCE',
  'DISABLED',
];

function statusLabel(status: OTRoomStatus) {
  return ROOM_STATUS[status].label;
}


export function OTRoomManagement() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';
  const [rooms, setRooms] = useState<OTRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingRoomId, setUpdatingRoomId] = useState<string | null>(null);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [departmentError, setDepartmentError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<OTRoom | null>(null);
  const [form, setForm] = useState<OTRoomForm>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [schedules, setSchedules] = useState<RoomSchedule[]>([]);
  const [nowTs, setNowTs] = useState(0);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setNowTs(Date.now());
    const first = window.setTimeout(tick, 0);
    const timer = window.setInterval(tick, 60_000);

    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchRooms = async () => {
      try {
        const response = await apiClient.get<OTRoom[]>('/api/ot-rooms');

        if (!cancelled) {
          setRooms(response ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof ApiClientError
              ? error.message
              : 'Failed to load operating theatre rooms.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchRooms();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    // Occupancy is read from the schedule record, never invented: if the
    // endpoint is unavailable the floor simply shows no current procedure.
    apiClient
      .get<RoomSchedule[]>('/api/schedules')
      .then((response) => {
        if (!cancelled) setSchedules(response ?? []);
      })
      .catch(() => {
        if (!cancelled) setSchedules([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;

    apiClient
      .get<DepartmentOption[]>('/api/departments')
      .then((response) => {
        if (!cancelled) setDepartments(response);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setDepartmentError(
            error instanceof ApiClientError
              ? error.message
              : 'Failed to load departments.',
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  function openCreateForm() {
    setEditingRoom(null);
    setForm({ ...EMPTY_FORM });
    setFormError('');
    setShowForm(true);
  }

  function openEditForm(room: OTRoom) {
    setEditingRoom(room);
    setForm({
      name: room.name,
      code: room.code,
      departmentId: room.department?.id ?? '',
      capacity: room.capacity?.toString() ?? '',
    });
    setFormError('');
    setShowForm(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFormError('');

    const capacity = form.capacity ? Number(form.capacity) : undefined;
    const payload = editingRoom
      ? {
          name: form.name.trim(),
          departmentId: form.departmentId,
          capacity: capacity ?? null,
        }
      : {
          name: form.name.trim(),
          code: form.code.trim(),
          departmentId: form.departmentId,
          ...(capacity !== undefined ? { capacity } : {}),
        };

    try {
      const room = editingRoom
        ? await apiClient.patch<OTRoom>(
            `/api/ot-rooms/${editingRoom.id}`,
            payload,
          )
        : await apiClient.post<OTRoom>('/api/ot-rooms', payload);
      setRooms((current) =>
        editingRoom
          ? current.map((item) =>
              item.id === room.id ? { ...item, ...room } : item,
            )
          : [room, ...current],
      );
      setShowForm(false);
      setEditingRoom(null);
      setForm({ ...EMPTY_FORM });
    } catch (submitError) {
      setFormError(
        submitError instanceof ApiClientError
          ? submitError.message
          : `Failed to ${editingRoom ? 'update' : 'create'} operating theatre.`,
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(roomId: string, status: OTRoomStatus) {
    try {
      setUpdatingRoomId(roomId);
      setError('');

      const response = await apiClient.patch<OTRoom>(
        `/api/ot-rooms/${roomId}/status`,
        { status },
      );

      setRooms((currentRooms) =>
        currentRooms.map((room) =>
          room.id === roomId ? { ...room, ...response } : room,
        ),
      );
    } catch (error) {
      setError(
        error instanceof ApiClientError
          ? error.message
          : 'Failed to update operating theatre status.',
      );
    } finally {
      setUpdatingRoomId(null);
    }
  }

  async function handleActiveChange(room: OTRoom) {
    const isActive = !room.isActive;
    const action = isActive ? 'reactivate' : 'deactivate';
    if (!window.confirm(`Are you sure you want to ${action} "${room.name}"?`)) {
      return;
    }

    setUpdatingRoomId(room.id);
    setError('');
    try {
      const response = await apiClient.patch<OTRoom>(
        `/api/ot-rooms/${room.id}/active`,
        { isActive },
      );
      setRooms((currentRooms) =>
        currentRooms.map((current) =>
          current.id === room.id ? { ...current, ...response } : current,
        ),
      );
    } catch (error) {
      setError(
        error instanceof ApiClientError
          ? error.message
          : `Failed to ${action} operating theatre.`,
      );
    } finally {
      setUpdatingRoomId(null);
    }
  }

  if (loading) {
    return <LoadingState />;
  }

  if (error && rooms.length === 0) {
    return <ErrorState message={error} />;
  }

  const statusToneClass: Record<OTRoomStatus, string> = {
    AVAILABLE: ROOM_STATUS.AVAILABLE.dot,
    OCCUPIED: ROOM_STATUS.OCCUPIED.dot,
    MAINTENANCE: ROOM_STATUS.MAINTENANCE.dot,
    DISABLED: ROOM_STATUS.DISABLED.dot,
  };

  const statusSoft: Record<OTRoomStatus, string> = {
    AVAILABLE: `${ROOM_STATUS.AVAILABLE.soft} ${ROOM_STATUS.AVAILABLE.text}`,
    OCCUPIED: `${ROOM_STATUS.OCCUPIED.soft} ${ROOM_STATUS.OCCUPIED.text}`,
    MAINTENANCE: `${ROOM_STATUS.MAINTENANCE.soft} ${ROOM_STATUS.MAINTENANCE.text}`,
    DISABLED: `${ROOM_STATUS.DISABLED.soft} ${ROOM_STATUS.DISABLED.text}`,
  };

  const readiness = (['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'DISABLED'] as OTRoomStatus[]).map(
    (key) => ({
      key,
      count: rooms.filter((room) => room.status === key).length,
      tone: statusToneClass[key],
    }),
  );

  const selected = rooms.find((room) => room.id === selectedRoomId) ?? rooms[0] ?? null;

  // The schedule record identifies its theatre by code, so match on that
  // rather than assuming an id the payload does not carry.
  const casesFor = (room: OTRoom) =>
    schedules.filter(
      (item) =>
        item.status !== 'CANCELLED' &&
        (item.otRoom?.code === room.code || item.roomId === room.id),
    );

  const currentFor = (room: OTRoom) => {
    const now = nowTs;
    if (!now) return null;

    return (
      casesFor(room).find((item) => {
        if (!item.startTime || !item.endTime) return false;
        const start = new Date(item.startTime).getTime();
        const end = new Date(item.endTime).getTime();
        return start <= now && now <= end;
      }) ?? null
    );
  };

  const minutesOf = (value?: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.getHours() * 60 + date.getMinutes();
  };

  // The plan strip runs 07:00–19:00, the clinical theatre day.
  const DAY_START = 7 * 60;
  const DAY_END = 19 * 60;

  const clockOf = (value?: string | null) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  };

  return (
    <main className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="ui-kicker">Infrastructure</p>

          <h1 className="display text-midnight mt-3 text-[clamp(1.9rem,1.3rem+2.2vw,3rem)]">
            Theatre floor
          </h1>

          <p className="text-ink-muted mt-2.5 max-w-[58ch] text-[13px] leading-[1.7]">
            Select a theatre to inspect its state, capacity and the cases booked into it
            today.
          </p>
        </div>

        {isAdmin ? (
          <Button type="button" onClick={openCreateForm}>
            <Plus size={15} weight="bold" aria-hidden="true" />
            Add operating theatre
          </Button>
        ) : null}
      </header>

      <Drawer
        open={showForm && isAdmin}
        onClose={() => {
          setShowForm(false);
          setEditingRoom(null);
        }}
        title={editingRoom ? 'Edit operating theatre' : 'Add operating theatre'}
        description="Room identity, ownership and capacity belong to the theatre."
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowForm(false);
                setEditingRoom(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="ot-room-form"
              isLoading={saving}
              disabled={departments.length === 0}
            >
              {editingRoom ? 'Save changes' : 'Create theatre'}
            </Button>
          </div>
        }
      >
          <form id="ot-room-form" onSubmit={handleSubmit} className="space-y-4">

            {departmentError ? (
              <p role="alert" className="text-danger text-[13px]">
                {departmentError}
              </p>
            ) : departments.length === 0 ? (
              <p className="text-ink-muted text-[13px]">
                Create a department before adding an operating theatre.
              </p>
            ) : null}

            {formError ? (
              <p role="alert" className="text-danger text-[13px]">
                {formError}
              </p>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-ink-secondary mb-1.5 block text-[12px] font-medium">Name</span>
                <input
                  required
                  minLength={1}
                  maxLength={100}
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  className="control text-ink w-full px-3 py-2 text-[13px] outline-none"
                />
              </label>

              <label className="block">
                <span className="text-ink-secondary mb-1.5 block text-[12px] font-medium">Code</span>
                <input
                  required
                  minLength={1}
                  maxLength={50}
                  disabled={Boolean(editingRoom)}
                  value={form.code}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, code: event.target.value }))
                  }
                  className="control text-ink w-full px-3 py-2 font-mono text-[13px] outline-none disabled:opacity-60"
                />
              </label>

              <label className="block">
                <span className="text-ink-secondary mb-1.5 block text-[12px] font-medium">
                  Department
                </span>
                <select
                  required
                  value={form.departmentId}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, departmentId: event.target.value }))
                  }
                  className="control text-ink w-full px-3 py-2 text-[13px] outline-none"
                >
                  <option value="">Choose a department</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-ink-secondary mb-1.5 block text-[12px] font-medium">
                  Capacity
                </span>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={form.capacity}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, capacity: event.target.value }))
                  }
                  className="control text-ink w-full px-3 py-2 text-[13px] outline-none"
                />
              </label>
            </div>

          </form>
      </Drawer>

      {error ? (
        <div
          role="alert"
          className="border-danger-soft bg-danger-soft text-danger rounded-[var(--radius-control)] border px-4 py-2.5 text-[13px]"
        >
          {error}
        </div>
      ) : null}

      {rooms.length === 0 ? (
        <EmptyState
          title="No operating theatres found"
          description="There are currently no operating theatre rooms registered."
        />
      ) : (
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
          {/* Spatial theatre plan — an illustrative arrangement, labelled as such */}
          <section aria-label="Theatre plan" className="panel overflow-hidden">
            <div className="border-rule-soft bg-porcelain/60 flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
              <h2 className="ui-kicker">Theatre plan</h2>

              <div className="flex flex-wrap items-center gap-3">
                {readiness.map((entry) => (
                  <span key={entry.key} className="flex items-center gap-1.5">
                    <span
                      className={`${entry.tone} h-2 w-2 rounded-full`}
                      aria-hidden="true"
                    />
                    <span className="text-ink-subtle text-[10.5px]">
                      {statusLabel(entry.key)}
                      <span className="text-ink-secondary ml-1 font-mono tabular-nums">
                        {entry.count}
                      </span>
                    </span>
                  </span>
                ))}
              </div>
            </div>

            <div className="cobalt-dots bg-[#F8FBFF] p-4 sm:p-5">
              <div className="grid grid-cols-1 gap-3 sm:auto-rows-fr sm:grid-cols-3">
                {rooms.map((room, index) => {
                  const active = selected?.id === room.id;
                  const current = currentFor(room);
                  const dayCases = casesFor(room);
                  const featured = index === 0;

                  return (
                    <button
                      key={room.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setSelectedRoomId(room.id)}
                      className={`group relative flex flex-col overflow-hidden rounded-[var(--radius-lg)] border bg-white p-4 text-left shadow-xs transition-[box-shadow,border-color,transform] duration-200 ease-out motion-reduce:transition-none ${
                        active
                          ? 'border-cobalt shadow-[var(--shadow-md)]'
                          : 'border-ice-border hover:-translate-y-0.5 hover:border-cobalt/35 hover:shadow-[var(--shadow-sm)]'
                      } ${room.isActive ? '' : 'opacity-65'}`}
                    >
                      <span
                        aria-hidden="true"
                        className={`absolute inset-x-0 top-0 h-[3px] ${statusToneClass[room.status]}`}
                      />

                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-cobalt font-mono text-[10px] tracking-[0.1em]">
                            {room.code}
                          </p>
                          <p className="font-display text-midnight mt-1 text-[15px] leading-snug font-bold tracking-[-0.02em]">
                            {room.name}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[9.5px] font-semibold tracking-[0.04em] ${statusSoft[room.status]}`}
                        >
                          {statusLabel(room.status)}
                        </span>
                      </div>

                      <p className={`text-ink-secondary mt-2.5 min-h-[2.1rem] text-[11.5px] leading-snug ${featured ? '' : 'flex-1'}`}>
                        {current ? (
                          <>
                            <span className="text-ink font-medium">{current.procedure}</span>
                            <span className="text-ink-subtle ml-1.5 font-mono text-[10px]">
                              {clockOf(current.startTime)}–{clockOf(current.endTime)}
                            </span>
                          </>
                        ) : (
                          <span className="text-ink-subtle">
                            {room.status === 'MAINTENANCE'
                              ? 'Withdrawn from the schedule'
                              : 'No procedure in progress'}
                          </span>
                        )}
                      </p>

                      {featured && dayCases.length > 0 ? (
                        <ul className="mt-1 flex-1 space-y-1">
                          {dayCases.slice(0, 2).map((item) => (
                            <li
                              key={item.id}
                              className="text-ink-secondary flex items-baseline gap-2 text-[11px]"
                            >
                              <span className="text-ink-subtle shrink-0 font-mono text-[10px]">
                                {clockOf(item.startTime)}
                              </span>
                              <span className="min-w-0 flex-1 truncate">{item.procedure}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}

                      <div className="mt-2" aria-hidden="true">
                        <div className="bg-surface-muted relative h-1.5 overflow-hidden rounded-full">
                          {dayCases.map((item) => {
                            const start = minutesOf(item.startTime);
                            const end = minutesOf(item.endTime);
                            if (start === null || end === null) return null;

                            const from = Math.max(0, ((start - DAY_START) / (DAY_END - DAY_START)) * 100);
                            const to = Math.min(100, ((end - DAY_START) / (DAY_END - DAY_START)) * 100);

                            return (
                              <span
                                key={item.id}
                                className={`absolute inset-y-0 rounded-full ${
                                  item.priority === 'EMERGENCY'
                                    ? 'bg-danger'
                                    : 'bg-gradient-to-r from-cobalt to-teal'
                                }`}
                                style={{ left: `${from}%`, width: `${Math.max(2, to - from)}%` }}
                              />
                            );
                          })}
                        </div>
                        <p className="text-ink-subtle mt-1 flex justify-between font-mono text-[9px]">
                          <span>07:00</span>
                          <span>{dayCases.length} booked</span>
                          <span>19:00</span>
                        </p>
                      </div>

                      <div className="border-rule-soft text-ink-muted mt-2 flex items-center justify-between gap-2 border-t pt-2 text-[10.5px]">
                        <span className="truncate">{room.department?.name ?? 'Unassigned'}</span>
                        <span className="shrink-0 font-mono">cap {room.capacity ?? '—'}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <p className="text-ink-subtle mt-3 text-center text-[10px]">
                Illustrative spatial arrangement — not a site floor plan
              </p>
            </div>
          </section>

          {/* Contextual detail for the selected theatre */}
          {selected ? (
            <aside aria-label={`Details for ${selected.name}`} className="panel xl:sticky xl:top-20">
              <div className="border-rule-soft border-b px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-ink-subtle font-mono text-[10.5px] tracking-[0.12em]">
                      {selected.code}
                    </p>
                    <h2 className="text-ink mt-0.5 truncate text-[15px] font-semibold">
                      {selected.name}
                    </h2>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusSoft[selected.status]}`}
                  >
                    {statusLabel(selected.status)}
                  </span>
                </div>
              </div>

              <dl className="divide-rule-soft divide-y">
                {[
                  { term: 'Department', detail: selected.department?.name ?? 'Unassigned' },
                  {
                    term: 'Capacity',
                    detail: selected.capacity ? `${selected.capacity} spaces` : 'Not set',
                    mono: Boolean(selected.capacity),
                  },
                  { term: 'Availability', detail: selected.isActive ? 'Online' : 'Offline' },
                ].map((row) => (
                  <div key={row.term} className="flex items-baseline justify-between gap-3 px-4 py-2.5">
                    <dt className="text-ink-muted text-[11.5px]">{row.term}</dt>
                    <dd
                      className={`text-ink text-right text-[12px] font-medium ${
                        row.mono ? 'font-mono' : ''
                      }`}
                    >
                      {row.detail}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="border-rule-soft border-t px-4 py-3">
                <p className="text-ink-subtle text-[10px] font-semibold tracking-[0.09em] uppercase">
                  Today in this theatre
                </p>

                {casesFor(selected).length === 0 ? (
                  <p className="text-ink-muted mt-1.5 text-[12px]">Nothing booked today.</p>
                ) : (
                  <ul className="mt-2 space-y-1">
                    {casesFor(selected).map((item) => (
                      <li key={item.id}>
                        <Link
                          href={`/schedules/${item.id}`}
                          className="hover:bg-cobalt-soft/30 -mx-1 flex items-baseline gap-2 rounded-[9px] px-2 py-1.5 transition-colors"
                        >
                          <span className="text-ink-subtle shrink-0 font-mono text-[10.5px] tabular-nums">
                            {clockOf(item.startTime)}
                          </span>
                          <span className="text-ink-secondary min-w-0 flex-1 truncate text-[11.5px]">
                            {item.procedure}
                          </span>
                          {item.priority === 'EMERGENCY' ? (
                            <span className="bg-danger-soft text-danger shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold">
                              EMERG
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

                <Link
                  href="/schedules"
                  className="text-cobalt hover:text-cobalt-hover mt-3 inline-flex items-center gap-1 text-[11.5px] font-semibold"
                >
                  Open schedule register →
                </Link>
              </div>

              {isAdmin ? (
                <div className="border-rule-soft space-y-2 border-t px-4 py-3">
                  <label className="block">
                    <span className="text-ink-subtle text-[10px] font-semibold tracking-[0.09em] uppercase">
                      Set operational state
                    </span>
                    <select
                      aria-label={`Operational status for ${selected.name}`}
                      value={selected.status}
                      disabled={updatingRoomId === selected.id}
                      onChange={(event) =>
                        void handleStatusChange(
                          selected.id,
                          event.target.value as OTRoomStatus,
                        )
                      }
                      className="control text-ink mt-1.5 w-full rounded-full px-3 py-2 text-[12px] outline-none disabled:opacity-50"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {statusLabel(status)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="flex items-center gap-3 pt-0.5">
                    <button
                      type="button"
                      onClick={() => openEditForm(selected)}
                      className="border-ice-border bg-sheet text-ink-secondary shadow-xs hover:border-cobalt/35 hover:text-cobalt cursor-pointer rounded-full border px-3 py-1.5 text-[11.5px] font-semibold transition-colors"
                    >
                      Edit theatre
                    </button>
                    <button
                      type="button"
                      disabled={updatingRoomId === selected.id}
                      onClick={() => void handleActiveChange(selected)}
                      className="text-ink-subtle hover:text-ink cursor-pointer rounded-full px-2 py-1.5 text-[11.5px] disabled:opacity-50"
                    >
                      {selected.isActive ? 'Take offline' : 'Bring online'}
                    </button>
                  </div>
                </div>
              ) : null}
            </aside>
          ) : null}
        </div>
      )}
    </main>
  );
}
