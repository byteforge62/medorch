import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ALERT_SEVERITY,
  EQUIPMENT_STATUS,
  ROOM_STATUS,
  SCHEDULE_RAIL_TONE,
  SCHEDULE_STATUS,
} from '@/lib/operational-status';
import {
  SEVERITY as DASHBOARD_SEVERITY,
  EQUIPMENT_STATUS as DASHBOARD_EQUIPMENT_STATUS,
  ROOM_STATUS as DASHBOARD_ROOM_STATUS,
  SCHEDULE_STATUS as DASHBOARD_SCHEDULE_STATUS,
} from '@/features/dashboard/components/admin/format';
import {
  ROOM_STATUS_DOT,
  ROOM_STATUS_LABEL,
  SCHEDULE_RAIL_TONE as WORKSPACE_RAIL_TONE,
  SCHEDULE_STATUS_LABEL as WORKSPACE_STATUS_LABEL,
} from '@/features/schedules/components/schedule-workspace-format';

const SCHEDULE_STATES = [
  'SCHEDULED',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'DELAYED',
] as const;

const ROOM_STATES = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'DISABLED'] as const;
const EQUIPMENT_STATES = ['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RETIRED'] as const;
const SEVERITIES = ['CRITICAL', 'WARNING', 'INFO'] as const;

test('every schedule state has a readable label and a colour', () => {
  for (const status of SCHEDULE_STATES) {
    const meta = SCHEDULE_STATUS[status];

    assert.ok(meta, `missing schedule status metadata for ${status}`);
    assert.ok(meta.label.trim().length > 0, `${status} needs a label`);
    assert.notEqual(meta.label, status, `${status} must not render as its enum`);
    assert.match(meta.tone, /bg-/, `${status} needs a soft background`);
    assert.match(meta.rail, /bg-/, `${status} needs a rail colour`);
  }
});

test('schedule semantics are stable across the product', () => {
  // Withdrawn work is neutral, a delay is harm, in-progress is expected work.
  assert.equal(SCHEDULE_STATUS.CANCELLED.label, 'Cancelled');
  assert.match(SCHEDULE_STATUS.CANCELLED.tone, /surface-muted/);
  assert.match(SCHEDULE_STATUS.DELAYED.tone, /danger/);
  assert.match(SCHEDULE_STATUS.IN_PROGRESS.tone, /warning/);
  assert.match(SCHEDULE_STATUS.COMPLETED.tone, /success/);
  assert.equal(SCHEDULE_STATUS.CONFIRMED.label, 'Confirmed');
});

test('no two schedule states share a rail colour that would merge states', () => {
  const rails = new Map<string, string>();

  for (const status of SCHEDULE_STATES) {
    const rail = SCHEDULE_STATUS[status].rail;
    const existing = rails.get(rail);

    // SCHEDULED and CANCELLED are intentionally both neutral; every other
    // state must remain visually distinct.
    if (existing) {
      assert.deepEqual(
        [existing, status].sort(),
        ['CANCELLED', 'SCHEDULED'],
        `unexpected shared rail colour between ${existing} and ${status}`,
      );
    }

    rails.set(rail, status);
  }
});

test('room states distinguish available, occupied, maintenance and offline', () => {
  for (const status of ROOM_STATES) {
    const meta = ROOM_STATUS[status];
    assert.ok(meta.label.trim(), `${status} needs a label`);
    assert.match(meta.dot, /bg-/, `${status} needs a dot colour`);
  }

  assert.equal(ROOM_STATUS.OCCUPIED.label, 'In use');
  assert.equal(ROOM_STATUS.DISABLED.label, 'Offline');
  assert.match(ROOM_STATUS.AVAILABLE.dot, /success/);
  assert.match(ROOM_STATUS.OCCUPIED.dot, /primary/);
  assert.match(ROOM_STATUS.MAINTENANCE.dot, /warning/);
});

test('equipment states never present maintenance or retirement as available', () => {
  for (const status of EQUIPMENT_STATES) {
    const meta = EQUIPMENT_STATUS[status];
    assert.ok(meta.label.trim(), `${status} needs a label`);
    assert.match(meta.tone, /bg-/, `${status} needs a tone`);
  }

  assert.match(EQUIPMENT_STATUS.AVAILABLE.tone, /success/);
  assert.match(EQUIPMENT_STATUS.IN_USE.tone, /primary/);
  assert.match(EQUIPMENT_STATUS.MAINTENANCE.tone, /warning/);
  assert.notEqual(EQUIPMENT_STATUS.MAINTENANCE.label, EQUIPMENT_STATUS.AVAILABLE.label);
  assert.notEqual(EQUIPMENT_STATUS.RETIRED.label, EQUIPMENT_STATUS.AVAILABLE.label);
});

test('alert severity drives a single ordered visual language', () => {
  const ranks = SEVERITIES.map((severity) => ALERT_SEVERITY[severity].rank);

  assert.deepEqual(ranks, [...ranks].sort((a, b) => a - b));
  assert.equal(new Set(ranks).size, SEVERITIES.length);
  assert.match(ALERT_SEVERITY.CRITICAL.chip, /danger/);
  assert.match(ALERT_SEVERITY.WARNING.chip, /warning/);
  assert.match(ALERT_SEVERITY.INFO.chip, /info/);
  assert.equal(ALERT_SEVERITY.CRITICAL.label, 'Critical');
});

test('the dashboard format module re-exports the same status contract', () => {
  assert.equal(DASHBOARD_SCHEDULE_STATUS, SCHEDULE_STATUS);
  assert.equal(DASHBOARD_ROOM_STATUS, ROOM_STATUS);
  assert.equal(DASHBOARD_EQUIPMENT_STATUS, EQUIPMENT_STATUS);
  assert.equal(DASHBOARD_SEVERITY, ALERT_SEVERITY);
});

test('the schedule workspace derives labels and rails from the shared contract', () => {
  for (const status of SCHEDULE_STATES) {
    assert.equal(WORKSPACE_STATUS_LABEL[status], SCHEDULE_STATUS[status].label);
    assert.equal(WORKSPACE_RAIL_TONE[status], SCHEDULE_STATUS[status].rail);
    assert.equal(SCHEDULE_RAIL_TONE[status], SCHEDULE_STATUS[status].rail);
  }

  for (const status of ROOM_STATES) {
    assert.equal(ROOM_STATUS_LABEL[status], ROOM_STATUS[status].label);
    assert.equal(ROOM_STATUS_DOT[status], ROOM_STATUS[status].dot);
  }
});

test('a delayed case is never rendered with the same colour as a completed one', () => {
  assert.notEqual(SCHEDULE_STATUS.DELAYED.rail, SCHEDULE_STATUS.COMPLETED.rail);
  assert.notEqual(SCHEDULE_STATUS.DELAYED.tone, SCHEDULE_STATUS.COMPLETED.tone);
});
