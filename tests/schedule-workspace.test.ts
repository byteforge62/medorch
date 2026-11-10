import assert from "node:assert/strict";
import test from "node:test";

import {
  detectScheduleConflicts,
  schedulesOverlap,
} from "../src/modules/schedules/schedule-conflicts";
import type { WorkspaceSchedule } from "../src/modules/schedules/schedule-workspace.types";
import { buildTimeAxis } from "../src/components/schedules/schedule-workspace-format";

function makeSchedule(
  overrides: Partial<WorkspaceSchedule> = {},
): WorkspaceSchedule {
  return {
    id: "schedule-a",
    patientId: "patient-a",
    departmentId: "department-a",
    otRoomId: "room-a",
    surgeonId: "surgeon-a",
    procedure: "Appendectomy",
    scheduledDate: "2026-11-06T00:00:00.000Z",
    startTime: "2026-11-06T09:00:00.000Z",
    endTime: "2026-11-06T10:00:00.000Z",
    status: "CONFIRMED",
    priority: "ELECTIVE",
    clinicalNotes: null,
    patient: {
      id: "patient-a",
      name: "Example Patient",
      patientCode: "PT-0001",
    },
    department: {
      id: "department-a",
      name: "General Surgery",
      isActive: true,
    },
    otRoom: {
      id: "room-a",
      name: "General Theatre",
      code: "OT-01",
      departmentId: "department-a",
      status: "AVAILABLE",
      isActive: true,
    },
    surgeon: {
      id: "surgeon-a",
      name: "Dr Example",
      status: "ACTIVE",
    },
    staff: [],
    equipment: [],
    ...overrides,
  };
}

test("half-open schedule ranges touch without overlapping", () => {
  assert.equal(
    schedulesOverlap(
      {
        startTime: "2026-11-06T09:00:00.000Z",
        endTime: "2026-11-06T10:00:00.000Z",
      },
      {
        startTime: "2026-11-06T10:00:00.000Z",
        endTime: "2026-11-06T11:00:00.000Z",
      },
    ),
    false,
  );

  assert.equal(
    schedulesOverlap(
      {
        startTime: "2026-11-06T09:00:00.000Z",
        endTime: "2026-11-06T10:01:00.000Z",
      },
      {
        startTime: "2026-11-06T10:00:00.000Z",
        endTime: "2026-11-06T11:00:00.000Z",
      },
    ),
    true,
  );
});

test("theatre, surgeon and patient double-bookings are confirmed conflicts", () => {
  const first = makeSchedule();
  const second = makeSchedule({
    id: "schedule-b",
    procedure: "Fracture Fixation",
    startTime: "2026-11-06T09:30:00.000Z",
    endTime: "2026-11-06T10:30:00.000Z",
  });

  const conflicts = detectScheduleConflicts([first, second]);
  const titles = conflicts.map((conflict) => conflict.title);

  assert.ok(titles.includes("Theatre double-booked"));
  assert.ok(titles.includes("Surgeon double-booked"));
  assert.ok(titles.includes("Patient double-booked"));

  for (const conflict of conflicts.filter((item) =>
    ["ROOM", "SURGEON", "PATIENT"].includes(item.kind),
  )) {
    assert.equal(conflict.severity, "CONFIRMED");
    assert.deepEqual(conflict.scheduleIds.sort(), [
      "schedule-a",
      "schedule-b",
    ]);
  }
});

test("staff and unreleased equipment double-allocations are reported", () => {
  const staff = [
    {
      id: "staff-assignment-a",
      userId: "user-nurse",
      role: "NURSE" as const,
      assignedAt: "2026-11-01T08:00:00.000Z",
      user: { id: "user-nurse", name: "Nurse Example" },
    },
  ];
  const equipment = [
    {
      id: "equipment-assignment-a",
      equipmentId: "equipment-laser",
      assignedAt: "2026-11-01T08:00:00.000Z",
      releasedAt: null,
      equipment: {
        id: "equipment-laser",
        name: "Surgical Laser",
        category: "Surgical",
        serialNumber: "LASER-01",
        status: "AVAILABLE",
      },
    },
  ];

  const first = makeSchedule({ staff, equipment });
  const second = makeSchedule({
    id: "schedule-b",
    otRoomId: "room-b",
    surgeonId: "surgeon-b",
    patientId: "patient-b",
    procedure: "Fracture Fixation",
    startTime: "2026-11-06T09:30:00.000Z",
    endTime: "2026-11-06T10:30:00.000Z",
    otRoom: {
      id: "room-b",
      name: "Orthopaedic Theatre",
      code: "OT-02",
      departmentId: "department-a",
      status: "AVAILABLE",
      isActive: true,
    },
    staff: [{ ...staff[0], id: "staff-assignment-b" }],
    equipment: [{ ...equipment[0], id: "equipment-assignment-b" }],
  });

  const conflicts = detectScheduleConflicts([first, second]);
  const staffConflict = conflicts.find((item) => item.kind === "STAFF");
  const equipmentConflict = conflicts.find(
    (item) => item.kind === "EQUIPMENT",
  );

  assert.ok(staffConflict);
  assert.match(staffConflict.detail, /Nurse Example/);
  assert.ok(equipmentConflict);
  assert.match(equipmentConflict.detail, /Surgical Laser/);
});

test("released equipment is excluded from allocation conflicts", () => {
  const equipment = [
    {
      id: "equipment-assignment-a",
      equipmentId: "equipment-laser",
      assignedAt: "2026-11-01T08:00:00.000Z",
      releasedAt: "2026-11-06T08:00:00.000Z",
      equipment: {
        id: "equipment-laser",
        name: "Surgical Laser",
        category: "Surgical",
        serialNumber: "LASER-01",
        status: "AVAILABLE",
      },
    },
  ];

  const first = makeSchedule({ equipment });
  const second = makeSchedule({
    id: "schedule-b",
    otRoomId: "room-b",
    surgeonId: "surgeon-b",
    patientId: "patient-b",
    startTime: "2026-11-06T09:30:00.000Z",
    endTime: "2026-11-06T10:30:00.000Z",
    otRoom: {
      id: "room-b",
      name: "Orthopaedic Theatre",
      code: "OT-02",
      departmentId: "department-a",
      status: "AVAILABLE",
      isActive: true,
    },
    equipment: [
      { ...equipment[0], id: "equipment-assignment-b", releasedAt: null },
    ],
  });

  const conflicts = detectScheduleConflicts([first, second]);

  assert.equal(conflicts.some((item) => item.kind === "EQUIPMENT"), false);
});

test("cancelled and completed cases do not raise active allocation conflicts", () => {
  const first = makeSchedule({ status: "CANCELLED" });
  const second = makeSchedule({
    id: "schedule-b",
    status: "COMPLETED",
    startTime: "2026-11-06T09:30:00.000Z",
    endTime: "2026-11-06T10:30:00.000Z",
  });

  assert.deepEqual(detectScheduleConflicts([first, second]), []);
});

test("unavailable theatres, inactive surgeons and unassigned staff are warnings", () => {
  const schedule = makeSchedule({
    otRoom: {
      id: "room-a",
      name: "General Theatre",
      code: "OT-01",
      departmentId: "department-a",
      status: "MAINTENANCE",
      isActive: true,
    },
    surgeon: {
      id: "surgeon-a",
      name: "Dr Example",
      status: "INACTIVE",
    },
  });

  const conflicts = detectScheduleConflicts([schedule]);
  const byKind = new Map(conflicts.map((item) => [item.kind, item]));

  assert.equal(byKind.get("ROOM_UNAVAILABLE")?.severity, "WARNING");
  assert.equal(byKind.get("MISSING_RESOURCE")?.severity, "WARNING");
  assert.equal(byKind.get("UNASSIGNED_STAFF")?.severity, "WARNING");
  assert.equal(conflicts.some((item) => item.severity === "CONFIRMED"), false);
});

test("the time axis fits the booked day and keeps an empty day full", () => {
  const empty = buildTimeAxis([], "2026-11-06");
  assert.equal(empty.startHour, 7);
  assert.equal(empty.endHour, 20);

  const booked = buildTimeAxis(
    [
      {
        startTime: "2026-11-06T09:00:00",
        endTime: "2026-11-06T10:30:00",
      },
      {
        startTime: "2026-11-06T13:00:00",
        endTime: "2026-11-06T15:00:00",
      },
    ],
    "2026-11-06",
  );

  assert.equal(booked.startHour, 8);
  assert.equal(booked.endHour, 16);
  assert.equal(booked.pct(9 * 60), 12.5);

  const withNow = buildTimeAxis(
    [
      {
        startTime: "2026-11-07T15:30:00",
        endTime: "2026-11-07T17:00:00",
      },
    ],
    "2026-11-07",
    new Date("2026-11-07T19:30:00"),
  );

  assert.equal(withNow.startHour, 14);
  assert.equal(withNow.endHour, 21);
  assert.equal(Math.round(withNow.pct(19 * 60 + 30)), 79);
});

test("invalid time ranges are confirmed data errors", () => {
  const schedule = makeSchedule({
    endTime: "2026-11-06T08:00:00.000Z",
  });

  const conflicts = detectScheduleConflicts([schedule]);
  const invalid = conflicts.find((item) => item.kind === "INVALID_TIME");

  assert.ok(invalid);
  assert.equal(invalid.severity, "CONFIRMED");
});
