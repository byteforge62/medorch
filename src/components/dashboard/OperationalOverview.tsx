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

  useEffect(() => {
    async function loadStats() {
      try {
        setIsLoading(true);
        const [rooms, schedules, equipment, alerts] = await Promise.allSettled([
          apiClient.get<OTRoomSummary[]>("/api/ot-rooms"),
          apiClient.get<ScheduleSummary[]>("/api/schedules"),
          apiClient.get<EquipmentSummary[]>("/api/equipment"),
          apiClient.get<AlertSummary[]>("/api/alerts"),
        ]);

        const roomData = rooms.status === "fulfilled" ? rooms.value : [];
        const schedData = schedules.status === "fulfilled" ? schedules.value : [];
        const equipData = equipment.status === "fulfilled" ? equipment.value : [];
        const alertData = alerts.status === "fulfilled" ? alerts.value : [];

        setStats({
          totalRooms: roomData.length,
          availableRooms: roomData.filter((r) => r.status === "AVAILABLE" && r.isActive).length,
          occupiedRooms: roomData.filter((r) => r.status === "OCCUPIED").length,
          totalSchedules: schedData.length,
          inProgressSchedules: schedData.filter((s) => s.status === "IN_PROGRESS").length,
          availableEquipment: equipData.filter((e) => e.status === "AVAILABLE").length,
          totalEquipment: equipData.length,
          unreadAlerts: alertData.filter((a) => !a.isRead).length,
        });
      } catch (err) {
        console.error("Error loading operational overview:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">OT Operating Rooms</span>
          <Badge variant="success">Live</Badge>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            {isLoading ? "..." : `${stats.availableRooms} / ${stats.totalRooms}`}
          </span>
          <span className="text-xs text-slate-500">
            {stats.occupiedRooms} occupied
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-500">Available for immediate surgery</div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Schedules</span>
          <Badge variant="info">Today</Badge>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            {isLoading ? "..." : stats.totalSchedules}
          </span>
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
            {stats.inProgressSchedules} In Progress
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
            {isLoading ? "..." : `${stats.availableEquipment} / ${stats.totalEquipment}`}
          </span>
          <span className="text-xs text-slate-500">Available</span>
        </div>
        <div className="mt-2 text-xs text-slate-500">Tracked medical equipment</div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Alert Notifications</span>
          {stats.unreadAlerts > 0 ? (
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
  );
}
