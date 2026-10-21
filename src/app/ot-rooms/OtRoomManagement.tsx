"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSession } from "next-auth/react";

import { apiClient, ApiClientError } from "@/lib/api/client";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";

type OTRoomStatus =
  | "AVAILABLE"
  | "OCCUPIED"
  | "MAINTENANCE"
  | "DISABLED";

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
  name: "",
  code: "",
  departmentId: "",
  capacity: "",
};

const STATUS_OPTIONS: OTRoomStatus[] = [
  "AVAILABLE",
  "OCCUPIED",
  "MAINTENANCE",
  "DISABLED",
];

function statusLabel(status: OTRoomStatus) {
  return status.replace("_", " ");
}

export function OTRoomManagement() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const [rooms, setRooms] = useState<OTRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingRoomId, setUpdatingRoomId] = useState<string | null>(null);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [departmentError, setDepartmentError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<OTRoom | null>(null);
  const [form, setForm] = useState<OTRoomForm>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

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
    if (!isAdmin) return;
    let cancelled = false;

    apiClient
      .get<DepartmentOption[]>("/api/departments")
      .then((response) => {
        if (!cancelled) setDepartments(response);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setDepartmentError(
            error instanceof ApiClientError
              ? error.message
              : "Failed to load departments.",
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
    setFormError("");
    setShowForm(true);
  }

  function openEditForm(room: OTRoom) {
    setEditingRoom(room);
    setForm({
      name: room.name,
      code: room.code,
      departmentId: room.department?.id ?? "",
      capacity: room.capacity?.toString() ?? "",
    });
    setFormError("");
    setShowForm(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFormError("");

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
        : await apiClient.post<OTRoom>("/api/ot-rooms", payload);
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
          : `Failed to ${editingRoom ? "update" : "create"} operating theatre.`,
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(
    roomId: string,
    status: OTRoomStatus,
  ) {
    try {
      setUpdatingRoomId(roomId);
      setError("");

      const response = await apiClient.patch<OTRoom>(
        `/api/ot-rooms/${roomId}/status`,
        { status },
      );

      setRooms((currentRooms) =>
        currentRooms.map((room) =>
          room.id === roomId
            ? { ...room, ...response }
            : room,
        ),
      );
    } catch (error) {
      setError(
        error instanceof ApiClientError
          ? error.message
          : "Failed to update operating theatre status.",
      );
    } finally {
      setUpdatingRoomId(null);
    }
  }

  async function handleActiveChange(room: OTRoom) {
    const isActive = !room.isActive;
    const action = isActive ? "reactivate" : "deactivate";
    if (!window.confirm(`Are you sure you want to ${action} "${room.name}"?`)) {
      return;
    }

    setUpdatingRoomId(room.id);
    setError("");
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

  return (
    <main className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
        <p className="text-sm font-medium text-[var(--color-foreground-muted)]">
          Infrastructure
        </p>

        <h1 className="mt-1 text-2xl font-semibold text-[var(--color-foreground)]">
          Operating Theatres
        </h1>

        <p className="mt-2 text-sm text-[var(--color-foreground-secondary)]">
          Monitor theatre availability, operational status, and assigned
          departments.
        </p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white"
          >
            Add operating theatre
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-lg font-semibold">
              {editingRoom ? "Edit operating theatre" : "Add operating theatre"}
            </h2>
            {departmentError ? (
              <p role="alert" className="text-sm text-[var(--color-danger)]">
                {departmentError}
              </p>
            ) : departments.length === 0 ? (
              <p className="text-sm text-[var(--color-foreground-muted)]">
                Create a department before adding an operating theatre.
              </p>
            ) : null}
            {formError && (
              <p role="alert" className="text-sm text-[var(--color-danger)]">
                {formError}
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span>Name</span>
                <input
                  required
                  minLength={1}
                  maxLength={100}
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span>Code</span>
                <input
                  required
                  minLength={1}
                  maxLength={50}
                  disabled={Boolean(editingRoom)}
                  value={form.code}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, code: event.target.value }))
                  }
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 disabled:opacity-60"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span>Department</span>
                <select
                  required
                  value={form.departmentId}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      departmentId: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
                >
                  <option value="">Choose a department</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-sm">
                <span>Capacity</span>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={form.capacity}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      capacity: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || departments.length === 0}
                className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving ? "Saving…" : editingRoom ? "Save changes" : "Create"}
              </button>
            </div>
          </form>
        </Card>
      )}

      {error ? (
        <div className="rounded-[var(--radius-card)] border border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      ) : null}

      {rooms.length === 0 ? (
        <EmptyState
          title="No operating theatres found"
          description="There are currently no operating theatre rooms registered."
        />
      ) : (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rooms.map((room) => {
          const isUpdating = updatingRoomId === room.id;

          return (
            <Card key={room.id} className="space-y-5 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-foreground-muted)]">
                    {room.code}
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-[var(--color-foreground)]">
                    {room.name}
                  </h2>
                </div>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => openEditForm(room)}
                    className="text-sm font-medium text-[var(--color-primary)]"
                  >
                    Edit details
                  </button>
                )}

                <div className="flex flex-col items-end gap-2">
                  <Badge>{room.isActive ? "ACTIVE" : "INACTIVE"}</Badge>
                  {isAdmin && (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => void handleActiveChange(room)}
                      className="text-xs font-medium text-[var(--color-primary)] disabled:opacity-50"
                    >
                      {room.isActive ? "Deactivate" : "Reactivate"}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[var(--color-foreground-muted)]">
                    Department
                  </p>

                  <p className="mt-1 font-medium text-[var(--color-foreground)]">
                    {room.department?.name ?? "Unassigned"}
                  </p>
                </div>

                <div>
                  <p className="text-[var(--color-foreground-muted)]">
                    Capacity
                  </p>

                  <p className="mt-1 font-medium text-[var(--color-foreground)]">
                    {room.capacity ?? "—"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-[var(--color-foreground)]">
                  Operational status
                </p>
                {isAdmin ? (
                  <select
                    id={`status-${room.id}`}
                    aria-label={`Operational status for ${room.name}`}
                    value={room.status}
                    disabled={isUpdating}
                    onChange={(event) =>
                      void handleStatusChange(
                        room.id,
                        event.target.value as OTRoomStatus,
                      )
                    }
                    className="mt-2 h-10 w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-foreground)] outline-none focus:border-[var(--color-ring)]"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {statusLabel(status)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="mt-2 font-medium text-[var(--color-foreground)]">
                    {statusLabel(room.status)}
                  </p>
                )}
                {isUpdating ? (
                  <p className="mt-2 text-xs text-[var(--color-foreground-muted)]">
                    Updating…
                  </p>
                ) : null}
              </div>
            </Card>
          );
        })}
      </div>
      )}
    </main>
  );
}