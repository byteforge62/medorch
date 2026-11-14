import assert from 'node:assert/strict';
import test from 'node:test';

import {
  addDays,
  dateKey,
  durationMinutes,
  formatClock,
  formatDayHeading,
  formatDuration,
  formatRelative,
  formatTimeRange,
  hasOverlap,
  isOpenSchedule,
  isUpcomingStatus,
  minutesOfDay,
  startOfDay,
} from '@/components/dashboard/admin/format';

const at = (iso: string) => new Date(iso);

test('dateKey returns a local calendar key and rejects invalid dates', () => {
  assert.equal(dateKey(at('2026-11-14T09:30:00')), '2026-11-14');
  assert.equal(dateKey('2026-01-05T23:00:00'), '2026-01-05');
  assert.equal(dateKey('not-a-date'), '');
});

test('startOfDay and addDays do not mutate their input', () => {
  const source = at('2026-11-14T18:45:00');
  const start = startOfDay(source);

  assert.equal(source.getHours(), 18);
  assert.equal(start.getHours(), 0);
  assert.equal(addDays(source, 1).getDate(), 15);
  assert.equal(source.getDate(), 14);
});

test('clock and range formatting pad minutes and survive invalid input', () => {
  assert.equal(formatClock(at('2026-11-14T09:05:00')), '09:05');
  assert.equal(
    formatTimeRange('2026-11-14T09:05:00', '2026-11-14T10:30:00'),
    '09:05–10:30',
  );
  assert.equal(formatClock('nonsense'), '--:--');
  assert.equal(minutesOfDay('nonsense'), null);
  assert.equal(minutesOfDay(at('2026-11-14T10:15:00')), 615);
});

test('duration helpers clamp negatives and round to whole minutes', () => {
  assert.equal(
    durationMinutes('2026-11-14T10:00:00', '2026-11-14T11:30:00'),
    90,
  );
  assert.equal(
    durationMinutes('2026-11-14T11:30:00', '2026-11-14T10:00:00'),
    0,
  );
  assert.equal(durationMinutes('nonsense', '2026-11-14T10:00:00'), 0);
  assert.equal(formatDuration(0), '0m');
  assert.equal(formatDuration(45), '45m');
  assert.equal(formatDuration(120), '2h');
  assert.equal(formatDuration(135), '2h 15m');
});

test('formatRelative describes past and future consistently', () => {
  const now = at('2026-11-14T12:00:00');

  assert.equal(formatRelative('2026-11-14T12:00:00', now), 'Just now');
  assert.equal(formatRelative('2026-11-14T11:40:00', now), '20 min ago');
  assert.equal(formatRelative('2026-11-14T13:00:00', now), 'in 1 h');
  assert.equal(formatRelative('2026-11-13T12:00:00', now), '1 d ago');
  assert.equal(formatRelative('nonsense', now), 'Unknown time');
});

test('day headings say Today and Tomorrow only for the matching days', () => {
  const today = new Date();
  const tomorrow = addDays(today, 1);

  assert.match(formatDayHeading(today), /^Today · /);
  assert.match(formatDayHeading(tomorrow), /^Tomorrow · /);
});

test('overlap detection handles partial, contained, adjacent and invalid ranges', () => {
  const base = {
    startTime: '2026-11-14T10:00:00',
    endTime: '2026-11-14T11:00:00',
  };

  assert.equal(
    hasOverlap(base, {
      startTime: '2026-11-14T10:30:00',
      endTime: '2026-11-14T11:30:00',
    }),
    true,
  );
  assert.equal(
    hasOverlap(base, {
      startTime: '2026-11-14T10:15:00',
      endTime: '2026-11-14T10:45:00',
    }),
    true,
  );
  assert.equal(
    hasOverlap(base, {
      startTime: '2026-11-14T11:00:00',
      endTime: '2026-11-14T12:00:00',
    }),
    false,
  );
  assert.equal(
    hasOverlap(base, { startTime: 'nonsense', endTime: 'nonsense' }),
    false,
  );
});

test('schedule predicates treat terminal states as closed', () => {
  assert.equal(isOpenSchedule('SCHEDULED'), true);
  assert.equal(isOpenSchedule('CONFIRMED'), true);
  assert.equal(isOpenSchedule('IN_PROGRESS'), true);
  assert.equal(isOpenSchedule('DELAYED'), true);
  assert.equal(isOpenSchedule('COMPLETED'), false);
  assert.equal(isOpenSchedule('CANCELLED'), false);

  assert.equal(isUpcomingStatus('SCHEDULED'), true);
  assert.equal(isUpcomingStatus('CONFIRMED'), true);
  assert.equal(isUpcomingStatus('DELAYED'), true);
  assert.equal(isUpcomingStatus('IN_PROGRESS'), false);
  assert.equal(isUpcomingStatus('COMPLETED'), false);
});
