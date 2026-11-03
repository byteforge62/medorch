'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';

type OTRoom = {
  id: string;
  name: string;
  code: string;
  capacity?: number | null;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'DISABLED';
  isActive: boolean;
  department?: {
    name: string;
  };
};

const tone = {
  AVAILABLE: { bar: 'bg-success', label: 'Ready', text: 'text-success' },
  OCCUPIED: { bar: 'bg-danger', label: 'In use', text: 'text-danger' },
  MAINTENANCE: { bar: 'bg-warning', label: 'Servicing', text: 'text-warning' },
  DISABLED: { bar: 'bg-border-strong', label: 'Offline', text: 'text-foreground-muted' },
} as const;

/**
 * OTRoomsGrid — the theatre floor plan.
 *
 * Every active theatre is a cell in one hairline-divided board, keyed by room
 * code and carrying a status rail along its base. Scanning the board left to
 * right reads like walking the theatre corridor: which rooms can take a case,
 * which are running, which are out of service.
 */
export function OTRoomsGrid() {
  const [rooms, setRooms] = useState<OTRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  const fetchRooms = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadRooms() {
      try {
        setError(null);
        const data = await apiClient.get<OTRoom[]>('/api/ot-rooms');

        if (!cancelled) {
          setRooms(data || []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch OT rooms:', err);
          setError('Failed to load OT rooms');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadRooms();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const activeRooms = rooms.filter((room) => room.isActive);
  const availableCount = activeRooms.filter(
    (room) => room.status === 'AVAILABLE',
  ).length;
  const occupiedCount = activeRooms.filter(
    (room) => room.status === 'OCCUPIED',
  ).length;
  const maintenanceCount = rooms.filter(
    (room) => room.status === 'MAINTENANCE' || room.status === 'DISABLED',
  ).length;

  return (
    <section aria-labelledby="theatre-floor-title" className="border border-border">
      <div className="border-border flex flex-wrap items-end justify-between gap-3 border-b px-4 py-3.5 sm:px-5">
        <div>
          <p className="eyebrow">Floor status</p>
          <h2
            id="theatre-floor-title"
            className="text-foreground mt-1.5 text-base font-semibold tracking-tight"
          >
            Theatre floor
          </h2>
        </div>

        <div className="flex items-center gap-4 font-mono text-[10px] tracking-[0.14em] uppercase">
          <span className="text-success">{availableCount} ready</span>
          <span className="text-danger">{occupiedCount} live</span>
          <span className="text-warning">{maintenanceCount} out</span>

          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              fetchRooms();
            }}
            className="text-primary hover:text-primary-hover font-mono text-[10px] font-semibold tracking-[0.14em] uppercase transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-surface">
          <LoadingState message="Loading OT rooms..." />
        </div>
      ) : error ? (
        <div className="bg-surface">
          <ErrorState message={error} onRetry={fetchRooms} />
        </div>
      ) : activeRooms.length === 0 ? (
        <div className="bg-surface">
          <EmptyState
            title="No OT rooms found"
            description="No operating rooms are configured in the system."
          />
        </div>
      ) : (
        <div className="bg-border grid gap-px sm:grid-cols-2 xl:grid-cols-3">
          {activeRooms.map((room) => {
            const roomTone = tone[room.status];

            return (
              <div key={room.id} className="bg-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-foreground font-mono text-lg leading-none font-semibold tracking-tight">
                      {room.code}
                    </p>
                    <p className="text-foreground-secondary mt-1.5 truncate text-sm font-medium">
                      {room.name}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 font-mono text-[10px] font-semibold tracking-[0.14em] uppercase ${roomTone.text}`}
                  >
                    {roomTone.label}
                  </span>
                </div>

                <div className="border-border-surface mt-3 flex items-center justify-between border-t pt-2.5">
                  <span className="text-foreground-muted truncate text-[11px]">
                    {room.department?.name || 'General surgery'}
                    {room.capacity ? ` · capacity ${room.capacity}` : ''}
                  </span>
                </div>

                <div
                  className={`mt-2 h-1 w-full ${roomTone.bar}`}
                  aria-hidden="true"
                />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
