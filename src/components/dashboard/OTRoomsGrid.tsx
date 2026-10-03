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

  const fetchRooms = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.get<OTRoom[]>("/api/ot-rooms");
      setRooms(data || []);
    } catch (err) {
      console.error("Failed to fetch OT rooms:", err);
      setError("Failed to load OT rooms");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    apiClient
      .get<OTRoom[]>("/api/ot-rooms")
      .then((data) => {
        if (isMounted) {
          setRooms(data || []);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to fetch OT rooms:", err);
          setError("Failed to load OT rooms");
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

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

  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <CardTitle>Operating Rooms Status</CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">Real-time availability of surgical suites</p>
        </div>
        <button
          onClick={fetchRooms}
          className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          Refresh
        </button>
      </CardHeader>

      {isLoading ? (
        <LoadingState message="Loading OT rooms..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchRooms} />
      ) : rooms.length === 0 ? (
        <EmptyState title="No OT Rooms found" description="No operating rooms configured in system." />
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
                <span>Dept: {room.department?.name || "General"}</span>
                {room.capacity ? <span>Capacity: {room.capacity}</span> : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
