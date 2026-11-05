import React from 'react';
import type { StatusTone } from './StatusPill';

/*======================================================================
  Data presentation
  ======================================================================
  These components report state; none of them is decorative. A value always
  has a label, a bar always exposes its number, and a status always carries
  words beside its colour.
====================================================================== */

/* — Metric indicator -------------------------------------------------- */

export function MetricIndicator({
  label,
  value,
  unit,
  detail,
  tone = 'accent',
  className = '',
}: {
  label: string;
  value: React.ReactNode;
  unit?: string;
  detail?: React.ReactNode;
  tone?: 'accent' | 'neutral' | 'positive' | 'attention' | 'critical';
  className?: string;
}) {
  const valueTone = {
    accent: 'text-primary',
    neutral: 'text-foreground',
    positive: 'text-success',
    attention: 'text-warning',
    critical: 'text-danger',
  } as const;

  return (
    <div className={className}>
      <p className="text-ink-muted text-[11px] font-semibold tracking-[0.1em] uppercase">
        {label}
      </p>
      <p
        className={`font-display tnum mt-2 flex items-baseline gap-1.5 text-[2rem] leading-none font-semibold tracking-[-0.03em] ${valueTone[tone]}`}
      >
        {value}
        {unit ? (
          <span className="text-ink-muted text-sm font-medium tracking-normal">
            {unit}
          </span>
        ) : null}
      </p>
      {detail ? (
        <p className="text-ink-muted mt-2 text-[0.75rem] leading-snug">
          {detail}
        </p>
      ) : null}
    </div>
  );
}

/* — Progress ---------------------------------------------------------- */

export function ProgressBar({
  value,
  label,
  valueLabel,
  tone = 'accent',
  size = 'md',
  className = '',
}: {
  /** 0–100. Values outside the range are clamped, never rendered broken. */
  value: number;
  label?: string;
  valueLabel?: string;
  tone?: 'accent' | 'positive' | 'attention' | 'critical';
  size?: 'sm' | 'md';
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const barTone = {
    accent: 'bg-primary',
    positive: 'bg-success',
    attention: 'bg-warning',
    critical: 'bg-danger',
  } as const;

  return (
    <div className={className}>
      {label || valueLabel ? (
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <span className="text-ink-secondary text-[0.8125rem] font-medium">
            {label}
          </span>
          <span className="text-ink-muted tnum font-mono text-[11px]">
            {valueLabel ?? `${clamped}%`}
          </span>
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        aria-label={label ?? 'Progress'}
        className={`bg-surface-muted w-full overflow-hidden rounded-[var(--radius-pill)] ${
          size === 'sm' ? 'h-1' : 'h-1.5'
        }`}
      >
        <div
          className={`h-full rounded-[var(--radius-pill)] transition-[width] duration-[var(--dur-slow)] ease-[var(--ease-emphasis)] ${barTone[tone]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

/* — Timeline ---------------------------------------------------------- */

export function Timeline({
  children,
  label,
  className = '',
}: {
  children: React.ReactNode;
  label?: string;
  className?: string;
}) {
  return (
    <ol aria-label={label} className={`relative ${className}`}>
      {children}
    </ol>
  );
}

export function TimelineItem({
  time,
  title,
  description,
  tone = 'neutral',
  last = false,
}: {
  time: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  tone?: StatusTone;
  last?: boolean;
}) {
  const dotTone: Record<StatusTone, string> = {
    positive: 'border-success bg-success',
    attention: 'border-warning bg-warning',
    critical: 'border-danger bg-danger',
    neutral: 'border-rule-strong bg-sheet',
    info: 'border-info bg-info',
    accent: 'border-primary bg-primary',
  };

  return (
    <li className="relative flex gap-4 pb-5 last:pb-0">
      {!last ? (
        <span
          className="bg-rule absolute top-3 bottom-0 left-[5px] w-px"
          aria-hidden="true"
        />
      ) : null}
      <span
        className={`relative z-10 mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full border-2 ${dotTone[tone]}`}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="text-foreground text-[0.8125rem] font-semibold">
            {title}
          </p>
          <p className="tech tnum">{time}</p>
        </div>
        {description ? (
          <p className="text-ink-muted mt-1 text-[0.75rem] leading-snug">
            {description}
          </p>
        ) : null}
      </div>
    </li>
  );
}

/* — Chart frame -------------------------------------------------------- */

export function ChartFrame({
  title,
  caption,
  meta,
  footer,
  children,
  className = '',
}: {
  title: string;
  caption?: string;
  meta?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <figure
      className={`border-border bg-sheet rounded-[var(--radius-panel)] border shadow-sm ${className}`}
    >
      <figcaption className="border-rule-soft flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3">
        <div>
          <p className="text-foreground text-[0.8125rem] font-semibold">
            {title}
          </p>
          {caption ? (
            <p className="text-ink-muted mt-0.5 text-[11px]">{caption}</p>
          ) : null}
        </div>
        {meta}
      </figcaption>
      <div className="p-4">{children}</div>
      {footer ? (
        <div className="border-rule-soft text-ink-muted border-t px-4 py-2.5 text-[11px]">
          {footer}
        </div>
      ) : null}
    </figure>
  );
}

/* — Availability ------------------------------------------------------- */

export type AvailabilityState =
  | 'available'
  | 'in-use'
  | 'maintenance'
  | 'offline';

const availabilityMap: Record<
  AvailabilityState,
  { label: string; tone: StatusTone }
> = {
  available: { label: 'Available', tone: 'positive' },
  'in-use': { label: 'In use', tone: 'attention' },
  maintenance: { label: 'Maintenance', tone: 'info' },
  offline: { label: 'Offline', tone: 'neutral' },
};

export function AvailabilityIndicator({
  state,
  label,
  detail,
}: {
  state: AvailabilityState;
  label?: string;
  detail?: string;
}) {
  const { label: defaultLabel, tone } = availabilityMap[state];
  const dotTone: Record<StatusTone, string> = {
    positive: 'bg-success',
    attention: 'bg-warning',
    critical: 'bg-danger',
    neutral: 'bg-ink-subtle',
    info: 'bg-info',
    accent: 'bg-primary',
  };

  return (
    <div className="flex items-start gap-3">
      <span
        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotTone[tone]}`}
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p className="text-foreground text-[0.8125rem] font-medium">
          {label ?? defaultLabel}
        </p>
        {detail ? (
          <p className="text-ink-muted mt-0.5 text-[11px]">{detail}</p>
        ) : null}
      </div>
    </div>
  );
}

/* — Operational status -------------------------------------------------- */

export type OperationalLevel = 'nominal' | 'watch' | 'critical';

const levelMap: Record<
  OperationalLevel,
  { label: string; tone: StatusTone; dot: string }
> = {
  nominal: { label: 'Nominal', tone: 'positive', dot: 'bg-success' },
  watch: { label: 'Watch', tone: 'attention', dot: 'bg-warning' },
  critical: { label: 'Critical', tone: 'critical', dot: 'bg-danger' },
};

export function OperationalStatus({
  level,
  label,
  detail,
  live = false,
}: {
  level: OperationalLevel;
  label?: string;
  detail?: string;
  /** A live dot for genuinely streaming state, not for decoration. */
  live?: boolean;
}) {
  const meta = levelMap[level];

  return (
    <div className="border-border bg-sheet flex items-start justify-between gap-4 rounded-[var(--radius-panel)] border px-4 py-3 shadow-xs">
      <div className="min-w-0">
        <p className="text-ink-muted text-[10px] font-semibold tracking-[0.12em] uppercase">
          {label ?? meta.label}
        </p>
        {detail ? (
          <p className="text-foreground mt-1 text-[0.8125rem]">{detail}</p>
        ) : null}
      </div>
      <span className="flex shrink-0 items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${meta.dot} ${live ? 'signal-dot' : ''}`}
          aria-hidden="true"
        />
        <span className="text-ink-secondary text-[11px] font-semibold">
          {meta.label}
        </span>
      </span>
    </div>
  );
}
