'use client';

import React from 'react';
import {
  CheckCircle,
  Warning,
  WarningCircle,
} from '@phosphor-icons/react';

import type { ScheduleConflict } from '@/modules/schedules/schedule-conflicts';
import type { WorkspaceSchedule } from '@/modules/schedules/schedule-workspace.types';

function conflictGroup(
  conflicts: ScheduleConflict[],
  severity: ScheduleConflict['severity'],
) {
  return conflicts.filter((conflict) => conflict.severity === severity);
}

function ConflictRow({
  conflict,
  schedules,
  onSelect,
}: {
  conflict: ScheduleConflict;
  schedules: WorkspaceSchedule[];
  onSelect: (scheduleId: string) => void;
}) {
  const first = schedules.find(
    (schedule) => schedule.id === conflict.scheduleIds[0],
  );
  const confirmed = conflict.severity === 'CONFIRMED';

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(conflict.scheduleIds[0])}
        className={`group flex w-full items-start gap-3 border-t px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary sm:px-5 ${
          confirmed
            ? 'border-danger/15 hover:bg-danger-soft/35'
            : 'border-warning/15 hover:bg-warning-soft/35'
        }`}
      >
        <span
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
            confirmed
              ? 'bg-danger-soft text-danger'
              : 'bg-warning-soft text-warning'
          }`}
          aria-hidden="true"
        >
          {confirmed ? (
            <WarningCircle size={14} weight="bold" />
          ) : (
            <Warning size={14} weight="bold" />
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span
              className={`text-[11.5px] font-semibold ${
                confirmed ? 'text-danger' : 'text-warning'
              }`}
            >
              {conflict.title}
            </span>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[8.5px] font-bold tracking-[0.06em] uppercase ${
                confirmed
                  ? 'bg-danger-soft text-danger'
                  : 'bg-warning-soft text-warning'
              }`}
            >
              {confirmed ? 'Confirmed' : 'Warning'}
            </span>
          </span>
          <span className="text-ink-secondary mt-1 block text-[11px] leading-relaxed">
            {conflict.detail}
          </span>
          <span className="text-primary mt-1.5 block text-[10px] font-semibold opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            {first ? `Open ${first.procedure}` : 'Open affected case'}
          </span>
        </span>
      </button>
    </li>
  );
}

export function ScheduleConflictPanel({
  conflicts,
  schedules,
  onSelect,
}: {
  conflicts: ScheduleConflict[];
  schedules: WorkspaceSchedule[];
  onSelect: (scheduleId: string) => void;
}) {
  const confirmed = conflictGroup(conflicts, 'CONFIRMED');
  const warnings = conflictGroup(conflicts, 'WARNING');

  return (
    <section
      aria-labelledby="schedule-conflicts-heading"
      className="border-rule bg-surface overflow-hidden border"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <h2
            id="schedule-conflicts-heading"
            className="text-ink text-[12px] font-semibold"
          >
            Coordination notes
          </h2>
          <span className="text-ink-subtle font-mono text-[9.5px] uppercase">
            selected day
          </span>
        </div>

        <div className="flex items-center gap-3 text-[10px] font-semibold">
          <span
            className={
              confirmed.length > 0 ? 'text-danger' : 'text-success'
            }
          >
            {confirmed.length > 0
              ? `${confirmed.length} confirmed`
              : 'No confirmed conflicts'}
          </span>
          <span
            className={
              warnings.length > 0 ? 'text-warning' : 'text-ink-subtle'
            }
          >
            {warnings.length} warning{warnings.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {conflicts.length === 0 ? (
        <div className="border-rule flex items-start gap-3 border-t px-4 py-3.5 sm:px-5">
          <CheckCircle
            size={16}
            weight="bold"
            className="text-success mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <div>
            <p className="text-ink text-[11.5px] font-medium">
              No resource conflicts found for this day.
            </p>
            <p className="text-ink-muted mt-0.5 text-[10.5px] leading-relaxed">
              Theatre, surgeon and patient ranges are database-constrained.
              Staff and equipment checks here are advisory, not a server
              reservation rule.
            </p>
          </div>
        </div>
      ) : (
        <ul className="border-rule border-t">
          {[...confirmed, ...warnings].map((conflict) => (
            <ConflictRow
              key={conflict.id}
              conflict={conflict}
              schedules={schedules}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}

      <p className="border-rule text-ink-subtle border-t px-4 py-2 text-[9.5px] leading-relaxed sm:px-5">
        Confirmed = overlapping active allocations or invalid recorded time.
        Warning = operational risk in the loaded record. Staff/equipment
        overlaps are not blocked by the current API.
      </p>
    </section>
  );
}
