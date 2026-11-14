/*======================================================================
  Operational status — one contract for the whole product
  ======================================================================
  A record's state must read the same in the register, the dashboard, the
  theatre board and the patient portal. These objects are the single source
  for label, colour and meaning; screens map them into their own markup
  rather than defining a second vocabulary.

  Semantics
  ---------
  success   complete or genuinely available
  primary   in normal operational use (confirmed, in a theatre, in use)
  warning   needs attention but is not harm (in progress, maintenance due)
  danger    harm or a broken commitment (critical alert, delayed case)
  info      informational
  neutral   absent, withdrawn or not applicable

  Colour alone never carries the state: every object ships a text label.
====================================================================== */

export type ScheduleStatusValue =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DELAYED';

export type RoomStatusValue = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'DISABLED';

export type EquipmentStatusValue =
  | 'AVAILABLE'
  | 'IN_USE'
  | 'MAINTENANCE'
  | 'RETIRED';

export type AlertSeverityValue = 'CRITICAL' | 'WARNING' | 'INFO';

export const SCHEDULE_STATUS: Record<
  ScheduleStatusValue,
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

export const ROOM_STATUS: Record<
  RoomStatusValue,
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
    dot: 'bg-primary',
    soft: 'bg-primary-soft',
    text: 'text-primary',
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

export const EQUIPMENT_STATUS: Record<
  EquipmentStatusValue,
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
    dot: 'bg-primary',
    text: 'text-primary',
    tone: 'bg-primary-soft',
  },
  MAINTENANCE: {
    label: 'Maintenance',
    dot: 'bg-warning',
    text: 'text-warning',
    tone: 'bg-warning-soft',
  },
  RETIRED: {
    label: 'Retired',
    dot: 'bg-ink-subtle',
    text: 'text-ink-muted',
    tone: 'bg-surface-muted',
  },
};

export const ALERT_SEVERITY: Record<
  AlertSeverityValue,
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

export const SCHEDULE_RAIL_TONE: Record<ScheduleStatusValue, string> = {
  SCHEDULED: SCHEDULE_STATUS.SCHEDULED.rail,
  CONFIRMED: SCHEDULE_STATUS.CONFIRMED.rail,
  IN_PROGRESS: SCHEDULE_STATUS.IN_PROGRESS.rail,
  COMPLETED: SCHEDULE_STATUS.COMPLETED.rail,
  CANCELLED: SCHEDULE_STATUS.CANCELLED.rail,
  DELAYED: SCHEDULE_STATUS.DELAYED.rail,
};
