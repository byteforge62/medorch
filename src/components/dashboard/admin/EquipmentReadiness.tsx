'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';

import {
  CountTag,
  Panel,
  PanelEmpty,
  PanelError,
  PanelHeader,
} from './DashboardPrimitives';
import {
  EQUIPMENT_STATUS,
  formatDay,
  formatDuration,
  durationMinutes,
  formatTimeRange,
} from './format';
import type { Equipment, Schedule, ScheduleDetail } from './types';

type Filter = 'ALL' | 'AVAILABLE' | 'ATTENTION';

export function EquipmentReadiness({
  equipment,
  schedules,
  details,
  now,
  error,
  detailsError,
  onRetry,
}: {
  equipment: Equipment[];
  schedules: Schedule[];
  details: Record<string, ScheduleDetail>;
  now: Date;
  error?: string;
  detailsError?: string;
  onRetry: () => void;
}) {
  const [filter, setFilter] = useState<Filter>('ALL');

  const view = useMemo(() => {
    const nowMs = now.getTime();
    const dueSoon = nowMs + 7 * 24 * 60 * 60 * 1000;

    const assignments = new Map<string, Schedule>();
    for (const schedule of schedules) {
      const detail = details[schedule.id];
      if (!detail) continue;

      for (const assignment of detail.equipment) {
        if (!assignment.releasedAt) {
          assignments.set(assignment.equipmentId, schedule);
        }
      }
    }

    const rows = equipment.map((item) => {
      const due = item.maintenanceDueAt ? new Date(item.maintenanceDueAt).getTime() : null;
      const overdue = due !== null && due < nowMs;
      const dueSoonFlag = due !== null && due <= dueSoon;
      const attention = item.status === 'MAINTENANCE' || overdue;
      const assignment = assignments.get(item.id) ?? null;

      return {
        item,
        assignment,
        overdue,
        dueSoon: !overdue && dueSoonFlag,
        attention,
      };
    });

    const sorted = rows.slice().sort((first, second) => {
      const rank = (row: (typeof rows)[number]) => {
        if (row.overdue) return 0;
        if (row.item.status === 'MAINTENANCE') return 1;
        if (row.dueSoon) return 2;
        if (row.item.status === 'IN_USE') return 3;
        if (row.item.status === 'AVAILABLE') return 4;
        return 5;
      };
      return rank(first) - rank(second);
    });

    const filtered = sorted.filter((row) => {
      if (filter === 'AVAILABLE') return row.item.status === 'AVAILABLE';
      if (filter === 'ATTENTION') return row.attention || row.dueSoon;
      return true;
    });

    return {
      rows,
      filtered,
      assignments,
      available: equipment.filter((item) => item.status === 'AVAILABLE').length,
      inUse: equipment.filter((item) => item.status === 'IN_USE').length,
      maintenance: equipment.filter((item) => item.status === 'MAINTENANCE').length,
      retired: equipment.filter((item) => item.status === 'RETIRED').length,
      counts: {
        ALL: rows.length,
        AVAILABLE: rows.filter((row) => row.item.status === 'AVAILABLE').length,
        ATTENTION: rows.filter((row) => row.attention || row.dueSoon).length,
      },
    };
  }, [details, equipment, filter, now, schedules]);

  return (
    <Panel labelledBy="equipment-readiness">
      <PanelHeader
        id="equipment-readiness"
        title="Equipment readiness"
        caption="Recorded status, maintenance dates and current case assignment."
        aside={
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <CountTag tone="positive">{view.available} available</CountTag>
            <CountTag tone="warning">{view.inUse} in use</CountTag>
            <CountTag tone={view.maintenance ? 'critical' : 'neutral'}>
              {view.maintenance} maintenance
            </CountTag>
          </div>
        }
      />

      {error ? <PanelError message={error} onRetry={onRetry} /> : null}

      {!error && equipment.length === 0 ? (
        <PanelEmpty
          title="No equipment on file"
          description="The equipment register returned no records, so readiness cannot be assessed."
        />
      ) : null}

      {!error && equipment.length > 0 ? (
        <>
          <div className="border-rule-soft flex flex-wrap items-center justify-between gap-3 border-b px-4 py-2.5 sm:px-5">
            <div className="flex items-center gap-1.5" role="group" aria-label="Filter equipment">
              {(
                [
                  ['ALL', 'All'],
                  ['AVAILABLE', 'Available'],
                  ['ATTENTION', 'Attention'],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={filter === key}
                  onClick={() => setFilter(key)}
                  className={`rounded-full px-2.5 py-1 text-[10.5px] font-semibold transition-colors ${
                    filter === key
                      ? 'bg-primary text-primary-ink'
                      : 'bg-surface-muted text-ink-secondary hover:bg-surface-subtle'
                  }`}
                >
                  {label}
                  <span className={filter === key ? 'ml-1 text-primary-ink/70' : 'ml-1 text-ink-subtle'}>
                    {view.counts[key]}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-ink-subtle text-[10px]">
                {detailsError ? 'Assignment detail partial' : 'Assignment from open cases'}
              </span>
              <Link href="/equipment" className="text-primary text-[10.5px] font-semibold hover:underline">
                Manage →
              </Link>
            </div>
          </div>

          {view.filtered.length === 0 ? (
            <PanelEmpty
              title="No equipment in this filter"
              description="Change the readiness filter to see the rest of the register."
            />
          ) : (
            <ul className="divide-rule-soft divide-y">
              {view.filtered.map(({ item, assignment, overdue, dueSoon }) => {
                const status = EQUIPMENT_STATUS[item.status];

                return (
                  <li key={item.id} className="px-4 py-2.5 sm:px-5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-ink truncate text-[11.5px] font-semibold">
                            {item.name}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold ${status.text}`}>
                            <span className={`${status.dot} h-1.5 w-1.5 rounded-full`} aria-hidden="true" />
                            {status.label}
                          </span>
                        </div>
                        <p className="text-ink-muted mt-0.5 truncate text-[10.5px]">
                          {item.category} · {item.department?.name ?? 'No department'}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        {assignment ? (
                          <>
                            <p className="text-ink-secondary max-w-[13rem] truncate text-[10px]">
                              {assignment.procedure}
                            </p>
                            <p className="text-ink-subtle mt-0.5 text-[9.5px]">
                              {assignment.otRoom?.code ?? 'Theatre'} ·{' '}
                              {formatTimeRange(assignment.startTime, assignment.endTime)}
                            </p>
                          </>
                        ) : item.status === 'IN_USE' ? (
                          <p className="text-ink-subtle text-[9.5px]">
                            {detailsError ? 'Assignment unavailable' : 'No open-case assignment found'}
                          </p>
                        ) : (
                          <p className="text-ink-subtle text-[9.5px]">
                            {item.maintenanceDueAt
                              ? `${overdue ? 'Overdue' : 'Due'} ${formatDay(item.maintenanceDueAt)}`
                              : 'No maintenance date'}
                          </p>
                        )}
                      </div>
                    </div>

                    {assignment ? (
                      <p className="text-ink-subtle mt-1 text-[9.5px]">
                        Assigned for {formatDuration(durationMinutes(assignment.startTime, assignment.endTime))}
                        {dueSoon && item.maintenanceDueAt
                          ? ` · maintenance due ${formatDay(item.maintenanceDueAt)}`
                          : ''}
                      </p>
                    ) : dueSoon && item.maintenanceDueAt ? (
                      <p className="text-warning mt-1 text-[9.5px] font-semibold">
                        Maintenance due within seven days · {formatDay(item.maintenanceDueAt)}
                      </p>
                    ) : overdue && item.maintenanceDueAt ? (
                      <p className="text-danger mt-1 text-[9.5px] font-semibold">
                        Maintenance overdue · {formatDay(item.maintenanceDueAt)}
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}

          <p className="border-rule-soft text-ink-subtle border-t px-4 py-2 text-[10px] sm:px-5">
            {view.retired} retired item{view.retired === 1 ? ' remains' : 's remain'} in the
            register and {view.retired === 1 ? 'is' : 'are'} excluded from readiness.
          </p>
        </>
      ) : null}
    </Panel>
  );
}
