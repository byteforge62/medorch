'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowSquareOut,
  CalendarBlank,
  CheckCircle,
  Clock,
  LockKey,
  PencilSimple,
  Stethoscope,
  Users,
  Wrench,
  X,
  Warning,
  WarningCircle,
} from '@phosphor-icons/react';

import { ScheduleStatusActions } from '@/features/schedules/components/ScheduleStatusActions';
import type { ScheduleConflict } from '@/features/schedules/lib/schedule-conflicts';
import type {
  ScheduleWorkspaceCapabilities,
  WorkspaceSchedule,
} from '@/types/schedule-workspace.types';
import {
  PRIORITY_LABEL,
  PRIORITY_TONE,
  SCHEDULE_RAIL_TONE,
  SCHEDULE_STATUS_LABEL,
  STAFF_ROLE_LABEL,
  durationMinutes,
  formatDateLong,
  formatDuration,
  formatTimeRange,
  localDateKey,
} from '@/features/schedules/components/schedule-workspace-format';

function Fact({
  term,
  children,
}: {
  term: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-ink-secondary text-[11.5px] font-medium">
        {term}
      </dt>
      <dd className="text-ink mt-1 min-w-0 text-[12.5px] leading-snug font-medium">
        {children}
      </dd>
    </div>
  );
}

function SectionLabel({
  icon,
  children,
  count,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h3 className="text-ink-secondary flex items-center gap-1.5 text-[11.5px] font-semibold tracking-[0.04em] uppercase">
        {icon}
        {children}
      </h3>
      {typeof count === 'number' ? (
        <span className="text-ink-subtle text-[11px] tabular-nums">
          {count}
        </span>
      ) : null}
    </div>
  );
}

function CaseConflictNotice({ conflicts }: { conflicts: ScheduleConflict[] }) {
  if (conflicts.length === 0) {
    return (
      <p className="text-success flex items-start gap-1.5 text-[12px] leading-relaxed">
        <CheckCircle
          size={13}
          weight="bold"
          className="mt-0.5 shrink-0"
          aria-hidden="true"
        />
        No resource conflict is flagged for this case.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {conflicts.map((conflict) => {
        const confirmed = conflict.severity === 'CONFIRMED';
        return (
          <div
            key={conflict.id}
            className={`rounded-[var(--radius-control)] border px-2.5 py-2 ${
              confirmed
                ? 'border-danger/20 bg-danger-soft/55'
                : 'border-warning/20 bg-warning-soft/55'
            }`}
          >
            <p
              className={`flex items-start gap-1.5 text-[12px] font-semibold ${
                confirmed ? 'text-danger' : 'text-warning'
              }`}
            >
              {confirmed ? (
                <WarningCircle
                  size={13}
                  weight="bold"
                  className="mt-0.5 shrink-0"
                  aria-hidden="true"
                />
              ) : (
                <Warning
                  size={13}
                  weight="bold"
                  className="mt-0.5 shrink-0"
                  aria-hidden="true"
                />
              )}
              {conflict.title}
            </p>
            <p className="text-ink-secondary mt-1 text-[11.5px] leading-relaxed">
              {conflict.detail}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export function ScheduleInspector({
  schedule,
  conflicts,
  role,
  capabilities,
  onClose,
  onEdit,
  onStatusUpdated,
}: {
  schedule: WorkspaceSchedule;
  conflicts: ScheduleConflict[];
  role: 'ADMIN' | 'DOCTOR' | 'OT_STAFF';
  capabilities: ScheduleWorkspaceCapabilities;
  onClose: () => void;
  onEdit: (schedule: WorkspaceSchedule) => void;
  onStatusUpdated: (
    scheduleId: string,
    status: WorkspaceSchedule['status'],
  ) => void;
}) {
  const duration = durationMinutes(schedule.startTime, schedule.endTime);
  const staff = [...schedule.staff].sort(
    (left, right) =>
      left.role.localeCompare(right.role) ||
      left.user.name.localeCompare(right.user.name),
  );
  const equipment = [...schedule.equipment].sort((left, right) => {
    if (Boolean(left.releasedAt) !== Boolean(right.releasedAt)) {
      return left.releasedAt ? 1 : -1;
    }
    return left.equipment.name.localeCompare(right.equipment.name);
  });
  const terminal =
    schedule.status === 'COMPLETED' || schedule.status === 'CANCELLED';

  return (
    <aside
      id="schedule-inspector"
      tabIndex={-1}
      aria-labelledby="schedule-inspector-heading"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          onClose();
        }
      }}
      className="border-ice-border bg-sheet shadow-xs overflow-hidden rounded-[var(--radius-panel)] border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt"
    >
      <header className="border-rule-soft bg-porcelain/50 relative border-b px-4 pt-4 pb-3.5">
        <div className="flex items-start justify-between gap-3">
          <p className="ui-kicker">Case brief</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close case brief"
            className="border-ice-border bg-sheet text-ink-subtle hover:border-cobalt/30 hover:text-cobalt -mt-1 -mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt"
          >
            <X size={14} weight="bold" aria-hidden="true" />
          </button>
        </div>

        <h2
          id="schedule-inspector-heading"
          className="font-display text-midnight mt-2 text-[17px] leading-snug font-bold tracking-[-0.02em]"
        >
          {schedule.procedure}
        </h2>

        <p className="text-ink-secondary mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] tabular-nums">
          <span>{formatTimeRange(schedule.startTime, schedule.endTime)}</span>
          <span className="text-ink-subtle">·</span>
          <span>{formatDuration(duration)}</span>
          <span className="text-ink-subtle">·</span>
          <span>{schedule.otRoom?.code ?? 'No theatre'}</span>
        </p>

        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <span className="border-ice-border bg-sheet text-ink-secondary shadow-xs inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-medium">
            <span
              className={`${SCHEDULE_RAIL_TONE[schedule.status]} h-1.5 w-1.5 rounded-full`}
              aria-hidden="true"
            />
            {SCHEDULE_STATUS_LABEL[schedule.status]}
          </span>
          <span
            className={`text-[11.5px] font-semibold ${PRIORITY_TONE[schedule.priority]}`}
          >
            {PRIORITY_LABEL[schedule.priority]} priority
          </span>
        </div>
      </header>

      <div className="divide-rule-soft divide-y">
        <section className="px-4 py-3.5">
          <SectionLabel icon={<CalendarBlank size={11} aria-hidden="true" />}>
            Case facts
          </SectionLabel>

          <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3">
            <Fact term="Patient">
              {schedule.patient ? (
                <>
                  <span className="block truncate">{schedule.patient.name}</span>
                  <span className="text-ink-subtle mt-0.5 block text-[11px] font-normal">
                    {schedule.patient.patientCode}
                  </span>
                </>
              ) : (
                'Not recorded'
              )}
            </Fact>
            <Fact term="Surgeon">
              <span className="flex items-start gap-1">
                <Stethoscope
                  size={11}
                  className="text-ink-subtle mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <span className="min-w-0 truncate">
                  {schedule.surgeon?.name ?? 'Not recorded'}
                </span>
              </span>
            </Fact>
            <Fact term="Theatre">
              {schedule.otRoom ? (
                <>
                  <span className="block truncate">
                    {schedule.otRoom.name}
                  </span>
                  <span className="text-ink-subtle mt-0.5 block text-[11px] font-normal">
                    {schedule.otRoom.code}
                  </span>
                </>
              ) : (
                'Not assigned'
              )}
            </Fact>
            <Fact term="Day">
              <span className="flex items-start gap-1">
                <Clock
                  size={11}
                  className="text-ink-subtle mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <span className="min-w-0">
                  {formatDateLong(localDateKey(schedule.startTime))}
                </span>
              </span>
            </Fact>
          </dl>

          <div className="mt-3.5 border-t border-rule pt-3">
            <CaseConflictNotice conflicts={conflicts} />
          </div>
        </section>

        <section className="px-4 py-3.5">
          <SectionLabel
            icon={<Users size={11} aria-hidden="true" />}
            count={staff.length}
          >
            Theatre team
          </SectionLabel>

          {staff.length === 0 ? (
            <p className="text-ink-muted mt-2.5 text-[12px] leading-relaxed">
              No additional staff assigned.
              {capabilities.canManageStaff
                ? ' Open the case file to assign the team.'
                : ''}
            </p>
          ) : (
            <ul className="mt-2.5 space-y-1.5">
              {staff.map((assignment) => (
                <li
                  key={assignment.id}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="bg-teal-soft text-teal-ink flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
                      aria-hidden="true"
                    >
                      {assignment.user.name.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="text-ink min-w-0 truncate text-[12px] font-medium">
                      {assignment.user.name}
                    </span>
                  </span>
                  <span className="text-ink-subtle shrink-0 text-[11px]">
                    {STAFF_ROLE_LABEL[assignment.role]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="px-4 py-3.5">
          <SectionLabel
            icon={<Wrench size={11} aria-hidden="true" />}
            count={equipment.filter((item) => !item.releasedAt).length}
          >
            Equipment
          </SectionLabel>

          {equipment.length === 0 ? (
            <p className="text-ink-muted mt-2.5 text-[12px] leading-relaxed">
              No equipment allocated.
              {capabilities.canManageEquipment
                ? ' Open the case file to allocate equipment.'
                : ''}
            </p>
          ) : (
            <ul className="mt-2.5 space-y-1.5">
              {equipment.map((assignment) => (
                <li
                  key={assignment.id}
                  className="flex items-start justify-between gap-3"
                >
                  <span className="min-w-0">
                    <span className="text-ink block truncate text-[12px] font-medium">
                      {assignment.equipment.name}
                    </span>
                    <span className="text-ink-subtle block truncate text-[11px]">
                      {assignment.equipment.category}
                      {assignment.equipment.serialNumber
                        ? ` · ${assignment.equipment.serialNumber}`
                        : ''}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 text-[10.5px] font-semibold ${
                      assignment.releasedAt
                        ? 'text-ink-subtle'
                        : 'text-success'
                    }`}
                  >
                    {assignment.releasedAt ? 'Released' : 'Allocated'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="px-4 py-3.5">
          <SectionLabel icon={<LockKey size={11} aria-hidden="true" />}>
            Clinical notes
          </SectionLabel>
          {role === 'OT_STAFF' ? (
            <p className="text-ink-muted mt-2.5 flex items-start gap-1.5 text-[12px] leading-relaxed">
              <LockKey
                size={12}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              />
              Clinical notes are not shown to the OT staff role.
            </p>
          ) : (
            <p className="text-ink-secondary mt-2.5 text-[12.5px] leading-relaxed whitespace-pre-wrap">
              {schedule.clinicalNotes || 'No clinical notes recorded.'}
            </p>
          )}
        </section>

        <section className="bg-porcelain/60 px-4 py-3.5">
          <p className="text-ink-secondary text-[11.5px] font-semibold tracking-[0.04em] uppercase">
            {capabilities.canManageStatus
              ? 'Case status'
              : 'Status & record'}
          </p>

          {capabilities.canManageStatus && !terminal ? (
            <div className="mt-2.5">
              <ScheduleStatusActions
                scheduleId={schedule.id}
                scheduleLabel={schedule.procedure}
                currentStatus={schedule.status}
                onStatusUpdated={onStatusUpdated}
              />
            </div>
          ) : (
            <p className="text-ink-muted mt-2 text-[11.5px] leading-relaxed">
              {terminal
                ? 'This case is closed. Status changes and edits are not available.'
                : 'Status changes are restricted to authorised clinical schedulers.'}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={`/schedules/${schedule.id}`}
              className="border-ice-border bg-sheet text-ink-secondary hover:border-cobalt/35 hover:text-cobalt focus-visible:outline-cobalt inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 text-[12px] font-semibold shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <ArrowSquareOut size={13} aria-hidden="true" />
              Open case file
            </Link>

            {capabilities.canEdit && !terminal ? (
              <button
                type="button"
                onClick={() => onEdit(schedule)}
                className="bg-cobalt hover:bg-cobalt-hover focus-visible:outline-cobalt inline-flex min-h-9 items-center gap-1.5 rounded-full px-3.5 text-[12px] font-semibold text-white shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <PencilSimple size={13} aria-hidden="true" />
                Edit schedule
              </button>
            ) : null}
          </div>

          {role === 'OT_STAFF' ? (
            <p className="text-ink-subtle mt-2 text-[11px] leading-relaxed">
              You are viewing the cases assigned to you. Schedule editing and
              status changes require an ADMIN or DOCTOR role.
            </p>
          ) : null}
        </section>
      </div>
    </aside>
  );
}
