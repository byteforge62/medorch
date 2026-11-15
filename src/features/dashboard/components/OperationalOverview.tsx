'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';

type OTRoomSummary = {
  id: string;
  name: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'DISABLED';
  isActive: boolean;
};

type ScheduleSummary = {
  id: string;
  status:
    | 'SCHEDULED'
    | 'CONFIRMED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'DELAYED';
  scheduledDate: string;
};

type EquipmentSummary = { id: string; status: string };
type AlertSummary = { id: string; isRead: boolean };

/**
 * OperationalOverview — the readout band across the top of the control room.
 *
 * Four figures share one line (no stat cards), and theatre capacity is drawn
 * as a segmented gauge: one block per theatre, coloured by its live status, so
 * "how much of the department is usable" reads as a shape before it is a
 * number. All four figures come from the same live endpoints as before.
 */
export function OperationalOverview() {
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    maintenanceRooms: 0,
    totalSchedules: 0,
    todaySchedules: 0,
    inProgressSchedules: 0,
    availableEquipment: 0,
    totalEquipment: 0,
    unreadAlerts: 0,
  });
  const [roomStatuses, setRoomStatuses] = useState<OTRoomSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      try {
        setIsLoading(true);
        const results = await Promise.allSettled([
          apiClient.get<OTRoomSummary[]>('/api/ot-rooms'),
          apiClient.get<ScheduleSummary[]>('/api/schedules'),
          apiClient.get<EquipmentSummary[]>('/api/equipment'),
          apiClient.get<AlertSummary[]>('/api/alerts'),
        ]);

        if (cancelled) return;

        const [rooms, schedules, equipment, alerts] = results;

        const nextStats = {
          totalRooms: 0,
          availableRooms: 0,
          occupiedRooms: 0,
          maintenanceRooms: 0,
          totalSchedules: 0,
          todaySchedules: 0,
          inProgressSchedules: 0,
          availableEquipment: 0,
          totalEquipment: 0,
          unreadAlerts: 0,
        };

        const failedMetrics: string[] = [];

        if (rooms.status === 'fulfilled') {
          const roomData = rooms.value;
          setRoomStatuses(roomData.filter((room) => room.isActive));
          nextStats.totalRooms = roomData.filter((room) => room.isActive).length;
          nextStats.availableRooms = roomData.filter(
            (room) => room.status === 'AVAILABLE' && room.isActive,
          ).length;
          nextStats.occupiedRooms = roomData.filter(
            (room) => room.status === 'OCCUPIED',
          ).length;
          nextStats.maintenanceRooms = roomData.filter(
            (room) =>
              room.status === 'MAINTENANCE' || room.status === 'DISABLED',
          ).length;
        } else {
          failedMetrics.push('room');
        }

        if (schedules.status === 'fulfilled') {
          const scheduleData = schedules.value;
          const dayKey = new Date().toISOString().slice(0, 10);

          nextStats.totalSchedules = scheduleData.length;
          nextStats.todaySchedules = scheduleData.filter(
            (schedule) =>
              schedule.scheduledDate.slice(0, 10) === dayKey &&
              schedule.status !== 'CANCELLED',
          ).length;
          nextStats.inProgressSchedules = scheduleData.filter(
            (schedule) => schedule.status === 'IN_PROGRESS',
          ).length;
        } else {
          failedMetrics.push('schedule');
        }

        if (equipment.status === 'fulfilled') {
          const equipmentData = equipment.value;
          nextStats.totalEquipment = equipmentData.length;
          nextStats.availableEquipment = equipmentData.filter(
            (item) => item.status === 'AVAILABLE',
          ).length;
        } else {
          failedMetrics.push('equipment');
        }

        if (alerts.status === 'fulfilled') {
          nextStats.unreadAlerts = alerts.value.filter(
            (alert) => !alert.isRead,
          ).length;
        } else {
          failedMetrics.push('alert');
        }

        setStats(nextStats);
        setError(
          failedMetrics.length > 0
            ? `Unable to load ${failedMetrics.join(', ')} metrics.`
            : null,
        );
      } catch (err) {
        console.error('Error loading operational overview:', err);
        setError('Unable to load operational metrics.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadStats();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const readings = [
    {
      label: 'Cases today',
      value: error ? '—' : stats.todaySchedules,
      note: `${stats.inProgressSchedules} in theatre now`,
    },
    {
      label: 'Theatres ready',
      value: error ? '—' : `${stats.availableRooms}/${stats.totalRooms}`,
      note: `${stats.occupiedRooms} occupied · ${stats.maintenanceRooms} out of service`,
    },
    {
      label: 'Equipment ready',
      value: error ? '—' : `${stats.availableEquipment}/${stats.totalEquipment}`,
      note: 'Tracked plant inventory',
    },
    {
      label: 'Open alerts',
      value: error ? '—' : stats.unreadAlerts,
      note: stats.unreadAlerts > 0 ? 'Needs review' : 'Inbox clear',
    },
  ];

  const blockTone = (room: OTRoomSummary) => {
    switch (room.status) {
      case 'AVAILABLE':
        return 'bg-success';
      case 'OCCUPIED':
        return 'bg-danger';
      case 'MAINTENANCE':
        return 'bg-warning';
      default:
        return 'bg-border-strong';
    }
  };

  return (
    <section aria-label="Operational readout" className="border border-border">
      {error ? (
        <p
          role="alert"
          className="border-border bg-warning-soft text-warning border-b px-4 py-2.5 text-xs"
        >
          {error} Live figures are partial.
        </p>
      ) : null}

      <div className="bg-surface grid grid-cols-2 divide-x divide-y lg:grid-cols-[repeat(4,minmax(0,1fr))_1.5fr] lg:divide-y-0">
        {readings.map((reading) => (
          <div key={reading.label} className="px-4 py-4 sm:px-5">
            <p className="eyebrow">{reading.label}</p>
            <p className="text-foreground mt-1.5 font-mono text-3xl leading-none font-semibold tabular-nums">
              {isLoading ? '…' : reading.value}
            </p>
            <p className="text-foreground-muted mt-1.5 text-[11px] leading-snug">
              {reading.note}
            </p>
          </div>
        ))}

        {/* Segmented gauge: one block per active theatre. */}
        <div className="col-span-2 px-4 py-4 sm:px-5 lg:col-span-1">
          <p className="eyebrow">Theatre capacity</p>

          <div className="mt-3 flex h-8 gap-1" aria-hidden="true">
            {isLoading || roomStatuses.length === 0 ? (
              <div className="bg-surface-muted w-full" />
            ) : (
              roomStatuses.map((room) => (
                <div
                  key={room.id}
                  title={`${room.name} — ${room.status}`}
                  className={`h-full flex-1 ${blockTone(room)}`}
                />
              ))
            )}
          </div>

          <p className="text-foreground-muted mt-2.5 font-mono text-[10px] tracking-[0.12em] uppercase">
            {isLoading
              ? 'Reading theatre status…'
              : `${stats.availableRooms} ready · ${stats.occupiedRooms} live · ${stats.maintenanceRooms} out of service`}
          </p>
        </div>
      </div>

      <div className="border-border bg-surface-subtle flex items-center justify-between border-t px-4 py-2.5">
        <p className="text-foreground-muted font-mono text-[10px] tracking-[0.14em] uppercase">
          {stats.totalSchedules} schedule records · {stats.totalRooms} active
          theatres
        </p>

        <button
          type="button"
          onClick={refresh}
          className="text-primary hover:text-primary-hover font-mono text-[10px] font-semibold tracking-[0.14em] uppercase transition-colors"
        >
          Re-scan
        </button>
      </div>
    </section>
  );
}
