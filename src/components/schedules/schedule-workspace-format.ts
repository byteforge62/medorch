import type {
  WorkspaceSchedulePriority,
  WorkspaceScheduleStatus,
  WorkspaceStaffRole,
  WorkspaceRoomStatus,
} from '@/modules/schedules/schedule-workspace.types';

const pad = (value: number) => String(value).padStart(2, '0');

export function parseDateValue(value: Date | string): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function localDateKey(value: Date | string): string {
  const date = parseDateValue(value);

  if (!date) return '';

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseLocalDateKey(key: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);

  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function addDaysLocal(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function startOfLocalDay(value: Date | string): Date | null {
  const date = parseDateValue(value);

  if (!date) return null;

  date.setHours(0, 0, 0, 0);
  return date;
}

export function endOfLocalDay(value: Date | string): Date | null {
  const start = startOfLocalDay(value);

  if (!start) return null;

  return addDaysLocal(start, 1);
}

export function minutesOfLocalDay(value: Date | string): number | null {
  const date = parseDateValue(value);

  if (!date) return null;

  return date.getHours() * 60 + date.getMinutes();
}

export function formatClock(value: Date | string): string {
  const date = parseDateValue(value);

  if (!date) return '--:--';

  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return '0m';

  const hours = Math.floor(minutes / 60);
  const remainder = Math.round(minutes % 60);

  if (!hours) return `${remainder}m`;
  if (!remainder) return `${hours}h`;
  return `${hours}h ${remainder}m`;
}

export function durationMinutes(
  start: Date | string,
  end: Date | string,
): number {
  const startDate = parseDateValue(start);
  const endDate = parseDateValue(end);

  if (!startDate || !endDate) return 0;

  return Math.max(0, Math.round((endDate.getTime() - startDate.getTime()) / 60_000));
}

export function formatTimeRange(start: Date | string, end: Date | string) {
  return `${formatClock(start)}–${formatClock(end)}`;
}

export function formatDateLong(key: string): string {
  const date = parseLocalDateKey(key);

  if (!date) return 'Date unavailable';

  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatDateShort(key: string): string {
  const date = parseLocalDateKey(key);

  if (!date) return 'Date unavailable';

  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(date);
}

export function formatDayHeading(key: string, todayKey: string): string {
  const date = parseLocalDateKey(key);

  if (!date) return 'Date unavailable';

  if (key === todayKey) return `Today · ${formatDateShort(key)}`;

  const tomorrow = localDateKey(addDaysLocal(parseLocalDateKey(todayKey) ?? new Date(), 1));
  if (key === tomorrow) return `Tomorrow · ${formatDateShort(key)}`;

  return formatDateShort(key);
}

export function formatWeekday(key: string): string {
  const date = parseLocalDateKey(key);

  if (!date) return '—';

  return new Intl.DateTimeFormat('en-GB', { weekday: 'short' })
    .format(date)
    .toUpperCase();
}

export function weekDatesFor(key: string): string[] {
  const selected = parseLocalDateKey(key) ?? new Date();
  const day = selected.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = addDaysLocal(selected, mondayOffset);

  return Array.from({ length: 7 }, (_, index) =>
    localDateKey(addDaysLocal(monday, index)),
  );
}

export function scheduleDayBounds(
  start: Date | string,
  end: Date | string,
  dateKey: string,
) {
  const dayStart = parseLocalDateKey(dateKey);
  const startDate = parseDateValue(start);
  const endDate = parseDateValue(end);

  if (!dayStart || !startDate || !endDate) {
    return null;
  }

  const dayStartMs = dayStart.getTime();
  const dayEndMs = addDaysLocal(dayStart, 1).getTime();
  const clippedStartMs = Math.max(dayStartMs, startDate.getTime());
  const clippedEndMs = Math.min(dayEndMs, endDate.getTime());

  if (clippedEndMs <= clippedStartMs) {
    return null;
  }

  return {
    startMinute: (clippedStartMs - dayStartMs) / 60_000,
    endMinute: (clippedEndMs - dayStartMs) / 60_000,
  };
}

export function scheduleIntersectsDate(
  start: Date | string,
  end: Date | string,
  dateKey: string,
) {
  return scheduleDayBounds(start, end, dateKey) !== null;
}

export function buildTimeAxis(
  schedules: Array<{ startTime: string; endTime: string }>,
  dateKey: string,
) {
  const bounds = schedules
    .map((schedule) => scheduleDayBounds(schedule.startTime, schedule.endTime, dateKey))
    .filter((value): value is { startMinute: number; endMinute: number } => Boolean(value));

  const earliest = bounds.length
    ? Math.min(...bounds.map((value) => value.startMinute))
    : 7 * 60;
  const latest = bounds.length
    ? Math.max(...bounds.map((value) => value.endMinute))
    : 20 * 60;

  const startHour = Math.max(0, Math.min(7, Math.floor(earliest / 60)));
  const endHour = Math.min(24, Math.max(20, Math.ceil(latest / 60)));
  const safeEndHour = Math.max(startHour + 1, endHour);
  const span = (safeEndHour - startHour) * 60;

  return {
    startHour,
    endHour: safeEndHour,
    span,
    pct(minutes: number) {
      return ((minutes - startHour * 60) / span) * 100;
    },
  };
}

export const SCHEDULE_STATUS_LABEL: Record<WorkspaceScheduleStatus, string> = {
  SCHEDULED: 'Scheduled',
  CONFIRMED: 'Confirmed',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  DELAYED: 'Delayed',
};

export const SCHEDULE_BLOCK_TONE: Record<WorkspaceScheduleStatus, string> = {
  SCHEDULED: 'border-border-strong bg-surface text-ink',
  CONFIRMED: 'border-primary/30 bg-primary-soft text-primary',
  IN_PROGRESS: 'border-brass/35 bg-brass-soft text-secondary',
  COMPLETED: 'border-success/25 bg-success-soft text-success',
  CANCELLED: 'border-border bg-surface-muted text-ink-muted',
  DELAYED: 'border-warning/35 bg-warning-soft text-warning',
};

export const SCHEDULE_RAIL_TONE: Record<WorkspaceScheduleStatus, string> = {
  SCHEDULED: 'bg-border-strong',
  CONFIRMED: 'bg-primary',
  IN_PROGRESS: 'bg-brass',
  COMPLETED: 'bg-success',
  CANCELLED: 'bg-border-strong',
  DELAYED: 'bg-warning',
};

export const PRIORITY_LABEL: Record<WorkspaceSchedulePriority, string> = {
  ELECTIVE: 'Elective',
  URGENT: 'Urgent',
  EMERGENCY: 'Emergency',
};

export const PRIORITY_TONE: Record<WorkspaceSchedulePriority, string> = {
  ELECTIVE: 'text-ink-muted',
  URGENT: 'text-warning',
  EMERGENCY: 'text-danger',
};

export const STAFF_ROLE_LABEL: Record<WorkspaceStaffRole, string> = {
  SURGEON: 'Surgeon',
  NURSE: 'Nurse',
  ANESTHETIST: 'Anaesthetist',
  TECHNICIAN: 'Technician',
  OTHER: 'Other',
};

export const ROOM_STATUS_LABEL: Record<WorkspaceRoomStatus, string> = {
  AVAILABLE: 'Available',
  OCCUPIED: 'Register: in use',
  MAINTENANCE: 'Maintenance',
  DISABLED: 'Disabled',
};

export const ROOM_STATUS_TONE: Record<WorkspaceRoomStatus, string> = {
  AVAILABLE: 'text-success',
  OCCUPIED: 'text-warning',
  MAINTENANCE: 'text-warning',
  DISABLED: 'text-ink-muted',
};

export const ROOM_STATUS_DOT: Record<WorkspaceRoomStatus, string> = {
  AVAILABLE: 'bg-success',
  OCCUPIED: 'bg-warning',
  MAINTENANCE: 'bg-warning',
  DISABLED: 'bg-ink-subtle',
};

export function formatMonthDay(key: string): string {
  const date = parseLocalDateKey(key);

  if (!date) return '—';

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
  }).format(date);
}

export function getDateKeyFromInput(value: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : localDateKey(new Date());
}
