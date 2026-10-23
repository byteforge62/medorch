"use client";

import React, { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api/client";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";

type OTRoom = {
  id: string;
  name: string;
  code: string;
  capacity?: number | null;
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE" | "DISABLED";
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
        const data = await apiClient.get<OTRoom[]>("/api/ot-rooms");

        if (!cancelled) {
          setRooms(data || []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to fetch OT rooms:", err);
          setError("Failed to load OT rooms");
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




  const getStatusBadge = (status: OTRoom["status"]) => {
    switch (status) {
      case "AVAILABLE":
        return <Badge variant="success">Available</Badge>;
      case "OCCUPIED":
        return <Badge variant="danger">Occupied</Badge>;
      case "MAINTENANCE":
        return <Badge variant="warning">Maintenance</Badge>;
      case "DISABLED":
      default:
        return <Badge variant="neutral">Disabled</Badge>;
    }
  };

  const availableCount = rooms.filter(
    (room) => room.isActive && room.status === "AVAILABLE"
  ).length;

  const occupiedCount = rooms.filter(
    (room) => room.status === "OCCUPIED"
  ).length;

  const maintenanceCount = rooms.filter(
    (room) => room.status === "MAINTENANCE"
  ).length;
  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <CardTitle>Operating Rooms Status</CardTitle>
          <p className="mt-0.5 text-xs text-slate-500">
            Latest room availability
          </p>
        </div>
        <button
          onClick={() => {
            setIsLoading(true);
            fetchRooms();
          }}
          className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          Refresh
        </button>
      </CardHeader>

      <div className="grid grid-cols-3 gap-2 pb-4">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
          <p className="text-xs text-emerald-700 dark:text-emerald-400">Available</p>
          <p className="mt-1 text-xl font-semibold text-emerald-800 dark:text-emerald-300">
            {isLoading ? "—" : availableCount}
          </p>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
          <p className="text-xs text-amber-700 dark:text-amber-400">Occupied</p>
          <p className="mt-1 text-xl font-semibold text-amber-800 dark:text-amber-300">
            {isLoading ? "—" : occupiedCount}
          </p>
        </div>

        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 dark:border-rose-900 dark:bg-rose-950/30">
          <p className="text-xs text-rose-700 dark:text-rose-400">Maintenance</p>
          <p className="mt-1 text-xl font-semibold text-rose-800 dark:text-rose-300">
            {isLoading ? "—" : maintenanceCount}
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
              className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/40"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {room.name} ({room.code})
                </span>
                {getStatusBadge(room.status)}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
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
