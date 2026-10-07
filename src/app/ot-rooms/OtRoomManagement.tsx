"use client";

import { useEffect, useState } from "react";

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
  const [rooms, setRooms] = useState<OTRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingRoomId, setUpdatingRoomId] = useState<string | null>(null);

useEffect(() => {
  let cancelled = false;

  const fetchRooms = async () => {
    try {
      const response = await apiClient.get<OTRoom[]>("/api/ot-rooms");

      if (!cancelled) {
        setRooms(response ?? []);
      }
    } catch (error) {
      if (!cancelled) {
        setError(
          error instanceof ApiClientError
            ? error.message
            : "Failed to load operating theatre rooms.",
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
            ? response
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

  if (loading) {
    return <LoadingState />;
  }

  if (error && rooms.length === 0) {
    return <ErrorState message={error} />;
  }

  if (rooms.length === 0) {
    return (
      <EmptyState
        title="No operating theatres found"
        description="There are currently no operating theatre rooms registered."
      />
    );
  }

  return (
    <main className="space-y-6">
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

      {error ? (
        <div className="rounded-[var(--radius-card)] border border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      ) : null}

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

                <Badge>
                  {room.isActive ? "ACTIVE" : "INACTIVE"}
                </Badge>
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
                <label
                  htmlFor={`status-${room.id}`}
                  className="text-sm font-medium text-[var(--color-foreground)]"
                >
                  Operational status
                </label>

                <select
                  id={`status-${room.id}`}
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
    </main>
  );
}