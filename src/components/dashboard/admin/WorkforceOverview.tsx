'use client';

import React, { useMemo } from 'react';

import {
  CountTag,
  InlineMeter,
  Panel,
  PanelError,
  PanelHeader,
} from './DashboardPrimitives';
import { dateKey, isOpenSchedule } from './format';
import type {
  Doctor,
  Schedule,
  ScheduleDetail,
  StaffRole,
  User,
} from './types';

const roleLabels: Record<StaffRole, string> = {
  SURGEON: 'Surgeon',
  NURSE: 'Nurse',
  ANESTHETIST: 'Anaesthetist',
  TECHNICIAN: 'Technician',
  OTHER: 'Other',
};

export function WorkforceOverview({
  users,
  doctors,
  schedules,
  details,
  now,
  usersError,
  doctorsError,
  schedulesError,
  detailsError,
  onRetry,
}: {
  users: User[];
  doctors: Doctor[];
  schedules: Schedule[];
  details: Record<string, ScheduleDetail>;
  now: Date;
  usersError?: string;
  doctorsError?: string;
  schedulesError?: string;
  detailsError?: string;
  onRetry: () => void;
}) {
  const view = useMemo(() => {
    const activeUsers = users.filter(
      (user) => user.status === 'ACTIVE' && (user.role === 'DOCTOR' || user.role === 'OT_STAFF'),
    );
    const activeDoctors = doctors.filter((doctor) => doctor.user.status === 'ACTIVE');
    const activeTheatreStaff = activeUsers.filter((user) => user.role === 'OT_STAFF');
    const pending = users.filter(
      (user) =>
        user.status === 'PENDING' &&
        (user.role === 'DOCTOR' || user.role === 'OT_STAFF' || user.role === 'ADMIN'),
    );

    const byDepartment = new Map<string, number>();
    for (const doctor of activeDoctors) {
      const name = doctor.department?.name ?? 'Unassigned department';
      byDepartment.set(name, (byDepartment.get(name) ?? 0) + 1);
    }

    const nearTerm = schedules.filter(
      (schedule) =>
        isOpenSchedule(schedule.status) &&
        dateKey(schedule.startTime) >= dateKey(now),
    );

    const roleCounts = new Map<StaffRole, number>();
    let staffedCases = 0;
    let unstaffedCases = 0;
    let detailCount = 0;

    for (const schedule of nearTerm) {
      const detail = details[schedule.id];
      if (!detail) continue;
      detailCount += 1;

      if (detail.staff.length > 0) {
        staffedCases += 1;
      } else {
        unstaffedCases += 1;
      }

      for (const assignment of detail.staff) {
        roleCounts.set(assignment.role, (roleCounts.get(assignment.role) ?? 0) + 1);
      }
    }

    const surgeonLoad = new Map<string, number>();
    for (const schedule of nearTerm) {
      surgeonLoad.set(schedule.surgeonId, (surgeonLoad.get(schedule.surgeonId) ?? 0) + 1);
    }

    const doctorLoads = activeDoctors
      .map((doctor) => ({
        id: doctor.id,
        name: doctor.user.name,
        cases: surgeonLoad.get(doctor.userId) ?? 0,
      }))
      .filter((doctor) => doctor.cases > 0)
      .sort((first, second) => second.cases - first.cases)
      .slice(0, 4);

    return {
      activeDoctors,
      activeTheatreStaff,
      activeTotal: activeDoctors.length + activeTheatreStaff.length,
      pending,
      byDepartment: [...byDepartment.entries()].sort((first, second) => second[1] - first[1]),
      nearTerm,
      roleCounts: [...roleCounts.entries()].sort((first, second) => second[1] - first[1]),
      staffedCases,
      unstaffedCases,
      detailCount,
      doctorLoads,
    };
  }, [details, doctors, now, schedules, users]);

  const hasBaseError = Boolean(usersError && doctorsError);

  return (
    <Panel labelledBy="clinical-workforce" tone="success">
      <PanelHeader
        id="clinical-workforce"
        title="Clinical workforce"
        caption="Active clinical accounts and assignment to open cases. Availability is not tracked."
        aside={
          <div className="flex items-center gap-1.5">
            <CountTag tone="positive">{view.activeTotal} active</CountTag>
            {view.pending.length ? (
              <CountTag tone="warning">{view.pending.length} pending</CountTag>
            ) : null}
          </div>
        }
      />

      {hasBaseError ? (
        <PanelError message="Doctor and account registers could not be loaded." onRetry={onRetry} />
      ) : null}

      {!hasBaseError && usersError ? (
        <p className="border-warning/25 bg-warning-soft/45 text-ink-secondary border-b px-4 py-2 text-[10.5px] sm:px-5">
          Account feed unavailable; active workforce counts are partial.
        </p>
      ) : null}

      {!hasBaseError && doctorsError ? (
        <p className="border-warning/25 bg-warning-soft/45 text-ink-secondary border-b px-4 py-2 text-[10.5px] sm:px-5">
          Doctor profiles unavailable; department distribution is incomplete.
        </p>
      ) : null}

      {!hasBaseError ? (
        <>
          <dl className="divide-rule-soft grid grid-cols-3 divide-x border-b">
            <div className="px-3 py-3 sm:px-4">
              <dt className="text-ink-subtle text-[10px]">Doctors</dt>
              <dd className="text-ink mt-1 text-[1.35rem] leading-none font-semibold tabular-nums">
                {view.activeDoctors.length}
              </dd>
            </div>
            <div className="px-3 py-3 sm:px-4">
              <dt className="text-ink-subtle text-[10px]">Theatre staff</dt>
              <dd className="text-ink mt-1 text-[1.35rem] leading-none font-semibold tabular-nums">
                {view.activeTheatreStaff.length}
              </dd>
            </div>
            <div className="px-3 py-3 sm:px-4">
              <dt className="text-ink-subtle text-[10px]">Open cases</dt>
              <dd className="text-ink mt-1 text-[1.35rem] leading-none font-semibold tabular-nums">
                {schedulesError ? '—' : view.nearTerm.length}
              </dd>
            </div>
          </dl>

          <div className="px-4 py-3.5 sm:px-5">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-ink text-[11.5px] font-semibold">Doctors by department</p>
              <span className="text-ink-subtle text-[10px]">
                {view.activeDoctors.length} active
              </span>
            </div>

            {view.byDepartment.length > 0 ? (
              <ul className="mt-2.5 space-y-2">
                {view.byDepartment.map(([department, count]) => (
                  <li key={department}>
                    <div className="mb-1 flex items-baseline justify-between gap-3">
                      <span className="text-ink-secondary truncate text-[10.5px]">
                        {department}
                      </span>
                      <span className="text-ink-muted text-[10px] tabular-nums">{count}</span>
                    </div>
                    <InlineMeter
                      value={(count / Math.max(1, view.activeDoctors.length)) * 100}
                      label={`${department}: ${count} active doctor${count === 1 ? '' : 's'}`}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ink-muted mt-2 text-[10.5px]">No active doctor profiles.</p>
            )}
          </div>

          <div className="border-rule-soft border-t px-4 py-3.5 sm:px-5">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-ink text-[11.5px] font-semibold">Near-term staffing</p>
              <span className="text-ink-subtle text-[10px]">
                {schedulesError ? 'unavailable' : `${view.nearTerm.length} open cases`}
              </span>
            </div>

            {schedulesError ? (
              <p className="text-ink-muted mt-2 text-[10.5px]">
                Schedule feed unavailable, so assignment coverage cannot be assessed.
              </p>
            ) : detailsError ? (
              <p className="text-warning mt-2 text-[10.5px]">
                Schedule detail unavailable; staffing assignment counts are incomplete.
              </p>
            ) : (
              <>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <CountTag tone={view.unstaffedCases ? 'warning' : 'positive'}>
                    {view.staffedCases}/{view.detailCount} staffed
                  </CountTag>
                  {view.unstaffedCases ? (
                    <span className="text-warning text-[10px] font-semibold">
                      {view.unstaffedCases} case{view.unstaffedCases === 1 ? '' : 's'} with no
                      assigned staff
                    </span>
                  ) : (
                    <span className="text-ink-subtle text-[10px]">No unstaffed cases loaded</span>
                  )}
                </div>

                {view.roleCounts.length > 0 ? (
                  <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                    {view.roleCounts.map(([role, count]) => (
                      <div key={role} className="flex items-baseline justify-between gap-2">
                        <span className="text-ink-muted text-[10px]">{roleLabels[role]}</span>
                        <span className="text-ink text-[10.5px] font-semibold tabular-nums">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-ink-muted mt-2 text-[10.5px]">
                    No staff assignments are recorded on the loaded open cases.
                  </p>
                )}

                {view.doctorLoads.length > 0 ? (
                  <div className="mt-3 border-t border-rule-soft pt-2.5">
                    <p className="text-ink-subtle text-[10px] font-semibold">Surgeon case load</p>
                    <ul className="mt-1.5 space-y-1">
                      {view.doctorLoads.map((doctor) => (
                        <li
                          key={doctor.id}
                          className="text-ink-secondary flex items-center justify-between gap-3 text-[10.5px]"
                        >
                          <span className="truncate">{doctor.name}</span>
                          <span className="text-ink-muted shrink-0 tabular-nums">
                            {doctor.cases} case{doctor.cases === 1 ? '' : 's'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </>
            )}
          </div>

          {view.pending.length > 0 ? (
            <p className="border-rule-soft text-ink-muted border-t px-4 py-2.5 text-[10.5px] sm:px-5">
              {view.pending.length} clinical account
              {view.pending.length === 1 ? '' : 's'} awaiting approval in Accounts.
            </p>
          ) : null}
        </>
      ) : null}
    </Panel>
  );
}
