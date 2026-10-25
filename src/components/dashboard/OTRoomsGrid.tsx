'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
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

  const getStatusBadge = (status: OTRoom['status']) => {
    switch (status) {
      case 'AVAILABLE':
        return <Badge variant="success">Available</Badge>;
      case 'OCCUPIED':
        return <Badge variant="danger">Occupied</Badge>;
      case 'MAINTENANCE':
        return <Badge variant="warning">Maintenance</Badge>;
      case 'DISABLED':
      default:
        return <Badge variant="neutral">Disabled</Badge>;
    }
  };

  const availableCount = rooms.filter(
    (room) => room.isActive && room.status === 'AVAILABLE',
  ).length;

  const occupiedCount = rooms.filter(
    (room) => room.status === 'OCCUPIED',
  ).length;

  const maintenanceCount = rooms.filter(
    (room) => room.status === 'MAINTENANCE',
  ).length;
  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <CardTitle>Operating Rooms Status</CardTitle>
          <p className="text-foreground-subtle mt-0.5 text-xs">
            Latest room availability
          </p>
        </div>
        <button
          onClick={() => {
            setIsLoading(true);
            fetchRooms();
          }}
          className="text-primary text-xs font-medium hover:underline"
        >
          Refresh
        </button>
      </CardHeader>

      <div className="grid grid-cols-3 gap-2 pb-4">
        <div className="border-success-soft bg-success-soft rounded-lg border p-3">
          <p className="text-success text-xs">Available</p>
          <p className="text-success mt-1 text-xl font-semibold">
            {isLoading ? '—' : availableCount}
          </p>
        </div>

        <div className="border-warning-soft bg-warning-soft rounded-lg border p-3">
          <p className="text-warning text-xs">Occupied</p>
          <p className="text-warning mt-1 text-xl font-semibold">
            {isLoading ? '—' : occupiedCount}
          </p>
        </div>

        <div className="border-danger-soft bg-danger-soft rounded-lg border p-3">
          <p className="text-danger text-xs">Maintenance</p>
          <p className="text-danger mt-1 text-xl font-semibold">
            {isLoading ? '—' : maintenanceCount}
          </p>
        </div>
      </div>

      {isLoading ? (
        <LoadingState message="Loading OT rooms..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchRooms} />
      ) : rooms.length === 0 ? (
        <EmptyState
          title="No OT Rooms found"
          description="No operating rooms configured in system."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="border-border bg-surface-muted/50 hover:border-border rounded-lg border p-3.5 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-foreground text-xs font-bold">
                  {room.name} ({room.code})
                </span>
                {getStatusBadge(room.status)}
              </div>
              <div className="text-foreground-subtle mt-2 flex items-center justify-between text-xs">
                <span>Dept: {room.department?.name || 'General'}</span>
                {room.capacity ? <span>Capacity: {room.capacity}</span> : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
