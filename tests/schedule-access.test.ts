import assert from "node:assert/strict";
import test from "node:test";

import {
  canReadIndividualSchedule,
  isScheduleStatusTransitionAllowed,
  redactScheduleDetailsForOT,
  redactScheduleClinicalNotes,
} from "../src/modules/schedules/schedule-access";

test("schedule status transitions allow valid next states and reject skipped states", () => {
  assert.equal(
    isScheduleStatusTransitionAllowed("SCHEDULED", "CONFIRMED"),
    true,
  );
  assert.equal(
    isScheduleStatusTransitionAllowed("IN_PROGRESS", "COMPLETED"),
    true,
  );
  assert.equal(
    isScheduleStatusTransitionAllowed("SCHEDULED", "COMPLETED"),
    false,
  );
  assert.equal(
    isScheduleStatusTransitionAllowed("COMPLETED", "CANCELLED"),
    false,
  );
});

test("only assigned OT staff can read an individual schedule", () => {
  assert.equal(canReadIndividualSchedule("OT_STAFF", false), false);
  assert.equal(canReadIndividualSchedule("OT_STAFF", true), true);
  assert.equal(canReadIndividualSchedule("DOCTOR", false), true);
});

test("schedule list redaction preserves its response shape", () => {
  const result = redactScheduleClinicalNotes({
    id: "schedule-id",
    clinicalNotes: "Sensitive clinical data",
  });

  assert.deepEqual(result, {
    id: "schedule-id",
    clinicalNotes: null,
  });
});

test("schedule detail redaction removes clinical and patient-specific fields", () => {
  const result = redactScheduleDetailsForOT({
    id: "schedule-id",
    clinicalNotes: "Sensitive clinical data",
    notes: [{ content: "Sensitive note" }],
    patient: {
      name: "Example Patient",
      email: "patient@example.test",
      dateOfBirth: new Date("1980-01-01"),
      gender: "Example",
    },
  });

  assert.deepEqual(result, {
    id: "schedule-id",
    clinicalNotes: null,
    notes: [],
    patient: {
      name: "Example Patient",
      email: null,
      dateOfBirth: null,
      gender: null,
    },
  });
});
