"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type OTRoomSummary = {
  id: string;
  name: string;
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE" | "DISABLED";
  isActive: boolean;
};

type ScheduleSummary = {
  id: string;
  status: "SCHEDULED" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "DELAYED";
  scheduledDate: string;
};

type EquipmentSummary = {
  id: string;
  status: "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "RETIRED";
};

type AlertSummary = {
  id: string;
  isRead: boolean;
};

export function OperationalOverview() {
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    totalSchedules: 0,
    inProgressSchedules: 0,
    availableEquipment: 0,
    totalEquipment: 0,
    unreadAlerts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setIsLoading(true);
        const results = await Promise.allSettled([
          apiClient.get<OTRoomSummary[]>("/api/ot-rooms"),
          apiClient.get<ScheduleSummary[]>("/api/schedules"),
          apiClient.get<EquipmentSummary[]>("/api/equipment"),
          apiClient.get<AlertSummary[]>("/api/alerts"),
        ]);


        const [rooms, schedules, equipment, alerts] = results;

        const nextStats = {
          totalRooms: 0,
          availableRooms: 0,
          occupiedRooms: 0,
          totalSchedules: 0,
          inProgressSchedules: 0,
          availableEquipment: 0,
          totalEquipment: 0,
          unreadAlerts: 0,
        };

        const failedMetrics: string[] = [];

        if (rooms.status === "fulfilled") {
          const roomData = rooms.value;
          nextStats.totalRooms = roomData.length;
          nextStats.availableRooms = roomData.filter(
            (room) => room.status === "AVAILABLE" && room.isActive
          ).length;
          nextStats.occupiedRooms = roomData.filter(
            (room) => room.status === "OCCUPIED"
          ).length;
        } else {
          failedMetrics.push("room");
        }

        if (schedules.status === "fulfilled") {
          const scheduleData = schedules.value;
          nextStats.totalSchedules = scheduleData.length;
          nextStats.inProgressSchedules = scheduleData.filter(
            (schedule) => schedule.status === "IN_PROGRESS"
          ).length;
        } else {
          failedMetrics.push("schedule");
        }

        if (equipment.status === "fulfilled") {
          const equipmentData = equipment.value;
          nextStats.totalEquipment = equipmentData.length;
          nextStats.availableEquipment = equipmentData.filter(
            (item) => item.status === "AVAILABLE"
          ).length;
        } else {
          failedMetrics.push("equipment");
        }

        if (alerts.status === "fulfilled") {
          nextStats.unreadAlerts = alerts.value.filter(
            (alert) => !alert.isRead
          ).length;
        } else {
          failedMetrics.push("alert");
        }

        setStats(nextStats);
        setError(
          failedMetrics.length > 0
            ? `Unable to load ${failedMetrics.join(", ")} metrics.`
            : null
        );

      } catch (err) {
        console.error("Error loading operational overview:", err);
        setError("Unable to load operational metrics.");
      } finally {
        setIsLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <div className="space-y-4">
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300"
        >
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">OT Operating Rooms</span>
            <Badge variant="neutral">Current snapshot</Badge>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {isLoading ? "..." : error ? "-" : `${stats.availableRooms} / ${stats.totalRooms}`}
            </span>
            <span className="text-xs text-slate-500">
              {error ? "Unavailable" : `${stats.occupiedRooms} occupied`}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">Available for immediate surgery</div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Schedules
            </span>
            <Badge variant="neutral">All records</Badge>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {isLoading ? "..." : error ? "-" : stats.totalSchedules}
            </span>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              {error ? "Unavailable" : `${stats.inProgressSchedules} In Progress`}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">Surgeries scheduled & active</div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Equipment Readiness</span>
            <Badge variant="purple">Ready</Badge>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {isLoading
                ? "..."
                : error
                  ? "—"
                  : `${stats.availableEquipment} / ${stats.totalEquipment}`}
            </span>
            <span className="text-xs text-slate-500">Available</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">Tracked medical equipment</div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Alert Notifications</span>
            {error ? (
              <Badge variant="neutral">Unavailable</Badge>
            ) : stats.unreadAlerts > 0 ? (
              <Badge variant="danger">{stats.unreadAlerts} Unread</Badge>
            ) : (
              <Badge variant="neutral">Clear</Badge>
            )}
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {isLoading ? "..." : stats.unreadAlerts}
            </span>
            <span className="text-xs text-slate-500">Requires attention</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">System & schedule notifications</div>
        </Card>
      </div>
    </div>
  );
}
