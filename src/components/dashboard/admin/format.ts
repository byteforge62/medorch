import type {
  AlertSeverity,
  EquipmentStatus,
  RoomStatus,
  SchedulePriority,
  ScheduleStatus,
} from './types';

const pad = (value: number) => String(value).padStart(2, '0');

export function dateKey(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function startOfDay(value: Date | string) {
  const date = value instanceof Date ? new Date(value) : new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function addDays(value: Date, days: number) {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date;
}

export function minutesOfDay(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.getHours() * 60 + date.getMinutes();
}

export function formatClock(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '--:--';

  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatTimeRange(start: string, end: string) {
  return `${formatClock(start)}–${formatClock(end)}`;
}

export function formatDay(value: Date | string, style: 'short' | 'long' = 'short') {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';

  return new Intl.DateTimeFormat('en-GB', {
    weekday: style === 'long' ? 'long' : 'short',
    day: '2-digit',
    month: 'short',
  }).format(date);
}

export function formatDayHeading(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';

  const today = dateKey(new Date());
  const key = dateKey(date);

  if (key === today) return `Today · ${formatDay(date)}`;
  if (key === dateKey(addDays(new Date(), 1))) return `Tomorrow · ${formatDay(date)}`;

  return formatDay(date, 'long');
}

export function formatDateTime(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Time unavailable';

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatRelative(value: Date | string, now = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown time';

  const diffMinutes = Math.round((date.getTime() - now.getTime()) / 60_000);
  const abs = Math.abs(diffMinutes);

  if (abs < 1) return 'Just now';
  if (abs < 60) return diffMinutes > 0 ? `in ${abs} min` : `${abs} min ago`;

  const hours = Math.round(abs / 60);
  if (hours < 24) return diffMinutes > 0 ? `in ${hours} h` : `${hours} h ago`;

  const days = Math.round(hours / 24);
  return diffMinutes > 0 ? `in ${days} d` : `${days} d ago`;
}

export function durationMinutes(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return 0;
  }

  return Math.max(0, Math.round((endDate.getTime() - startDate.getTime()) / 60_000));
}

export function formatDuration(minutes: number) {
  if (minutes <= 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (!hours) return `${remainder}m`;
  if (!remainder) return `${hours}h`;
  return `${hours}h ${remainder}m`;
}

export function isOpenSchedule(status: ScheduleStatus) {
  return status !== 'COMPLETED' && status !== 'CANCELLED';
}

export function isUpcomingStatus(status: ScheduleStatus) {
  return status === 'SCHEDULED' || status === 'CONFIRMED' || status === 'DELAYED';
}

export function hasOverlap(
  first: { startTime: string; endTime: string },
  second: { startTime: string; endTime: string },
) {
  const firstStart = new Date(first.startTime).getTime();
  const firstEnd = new Date(first.endTime).getTime();
  const secondStart = new Date(second.startTime).getTime();
  const secondEnd = new Date(second.endTime).getTime();

  if ([firstStart, firstEnd, secondStart, secondEnd].some(Number.isNaN)) {
    return false;
  }

  return firstStart < secondEnd && secondStart < firstEnd;
}

export const ROOM_STATUS: Record<
  RoomStatus,
  { label: string; dot: string; soft: string; text: string }
> = {
  AVAILABLE: {
    label: 'Ready',
    dot: 'bg-success',
    soft: 'bg-success-soft',
    text: 'text-success',
  },
  OCCUPIED: {
    label: 'In use',
    dot: 'bg-warning',
    soft: 'bg-warning-soft',
    text: 'text-warning',
  },
  MAINTENANCE: {
    label: 'Maintenance',
    dot: 'bg-warning',
    soft: 'bg-warning-soft',
    text: 'text-warning',
  },
  DISABLED: {
    label: 'Offline',
    dot: 'bg-ink-subtle',
    soft: 'bg-surface-muted',
    text: 'text-ink-muted',
  },
};

export const SCHEDULE_STATUS: Record<
  ScheduleStatus,
  { label: string; tone: string; rail: string }
> = {
  SCHEDULED: {
    label: 'Scheduled',
    tone: 'bg-surface-muted text-ink-secondary',
    rail: 'bg-border-strong',
  },
  CONFIRMED: {
    label: 'Confirmed',
    tone: 'bg-primary-soft text-primary',
    rail: 'bg-primary',
  },
  IN_PROGRESS: {
    label: 'In progress',
    tone: 'bg-warning-soft text-warning',
    rail: 'bg-warning',
  },
  COMPLETED: {
    label: 'Completed',
    tone: 'bg-success-soft text-success',
    rail: 'bg-success',
  },
  CANCELLED: {
    label: 'Cancelled',
    tone: 'bg-surface-muted text-ink-muted',
    rail: 'bg-border-strong',
  },
  DELAYED: {
    label: 'Delayed',
    tone: 'bg-danger-soft text-danger',
    rail: 'bg-danger',
  },
};

export const PRIORITY: Record<SchedulePriority, { label: string; tone: string }> = {
  ELECTIVE: { label: 'Elective', tone: 'text-ink-muted' },
  URGENT: { label: 'Urgent', tone: 'text-warning' },
  EMERGENCY: { label: 'Emergency', tone: 'text-danger' },
};

export const EQUIPMENT_STATUS: Record<
  EquipmentStatus,
  { label: string; dot: string; text: string; tone: string }
> = {
  AVAILABLE: {
    label: 'Available',
    dot: 'bg-success',
    text: 'text-success',
    tone: 'bg-success-soft',
  },
  IN_USE: {
    label: 'In use',
    dot: 'bg-warning',
    text: 'text-warning',
    tone: 'bg-warning-soft',
  },
  MAINTENANCE: {
    label: 'Maintenance',
    dot: 'bg-danger',
    text: 'text-danger',
    tone: 'bg-danger-soft',
  },
  RETIRED: {
    label: 'Retired',
    dot: 'bg-ink-subtle',
    text: 'text-ink-muted',
    tone: 'bg-surface-muted',
  },
};

export const SEVERITY: Record<
  AlertSeverity,
  { label: string; rail: string; chip: string; rank: number }
> = {
  CRITICAL: {
    label: 'Critical',
    rail: 'bg-danger',
    chip: 'bg-danger-soft text-danger',
    rank: 0,
  },
  WARNING: {
    label: 'Warning',
    rail: 'bg-warning',
    chip: 'bg-warning-soft text-warning',
    rank: 1,
  },
  INFO: {
    label: 'Info',
    rail: 'bg-info',
    chip: 'bg-info-soft text-info',
    rank: 2,
  },
};
