import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  SchedulePriorityBadge,
  ScheduleStatusBadge,
  type SchedulePriority,
  type ScheduleStatus,
} from '@/components/schedules/ScheduleStatusBadge';
import { SCHEDULE_STATUS } from '@/lib/operational-status';

const STATUSES: ScheduleStatus[] = [
  'SCHEDULED',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'DELAYED',
];

const PRIORITIES: SchedulePriority[] = ['ELECTIVE', 'URGENT', 'EMERGENCY'];

test('every schedule status badge renders the shared label, not the enum', () => {
  for (const status of STATUSES) {
    const html = renderToStaticMarkup(<ScheduleStatusBadge status={status} />);
    const label = SCHEDULE_STATUS[status].label;

    assert.ok(html.includes(`>${label}<`), `${status} should render "${label}"`);
    assert.equal(
      html.includes(`>${status}<`),
      false,
      `${status} must not leak the raw enum into the UI`,
    );
  }
});

test('cancelled and delayed badges carry the corrected severity classes', () => {
  const cancelled = renderToStaticMarkup(
    <ScheduleStatusBadge status="CANCELLED" />,
  );
  const delayed = renderToStaticMarkup(<ScheduleStatusBadge status="DELAYED" />);
  const inProgress = renderToStaticMarkup(
    <ScheduleStatusBadge status="IN_PROGRESS" />,
  );
  const completed = renderToStaticMarkup(
    <ScheduleStatusBadge status="COMPLETED" />,
  );

  // Regression: cancelled was rendered as danger and delayed as warning.
  assert.match(cancelled, /surface-muted/);
  assert.doesNotMatch(cancelled, /danger/);
  assert.match(delayed, /danger/);
  assert.match(inProgress, /warning/);
  assert.match(completed, /success/);
});

test('priority badges use one vocabulary and keep emergency distinct', () => {
  const labels = PRIORITIES.map((priority) =>
    renderToStaticMarkup(<SchedulePriorityBadge priority={priority} />),
  );

  assert.ok(labels[0].includes('Elective'));
  assert.ok(labels[1].includes('Urgent'));
  assert.ok(labels[2].includes('Emergency'));
  assert.match(labels[1], /warning/);
  assert.match(labels[2], /danger/);
});
