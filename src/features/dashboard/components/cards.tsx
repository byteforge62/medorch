import React from 'react';
import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react';

/*======================================================================
  Clinical card family
  ======================================================================
  These are the designed objects the operations dashboards are built
  from. Each member has its own anatomy rather than being the same
  rounded rectangle with different contents:

    MetricCard          instrument tile — label, large figure, icon plate,
                        optional bar series drawn from real counts
    TheatreStatusCard   room plate — code, live state, day strip, load
    AlertCard           signal plate — severity plate, title, response
    EquipmentCard       register tile — category plate, state, assignment

  Every colour is a semantic token, so the family follows the product
  palette and every number rendered inside is supplied by the caller.
====================================================================== */

export type CardTone =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

const TONE: Record<
  CardTone,
  { icon: string; chip: string; text: string; bar: string; accent: string }
> = {
  primary: {
    icon: 'bg-primary-soft text-primary',
    chip: 'bg-primary-soft text-primary',
    text: 'text-primary',
    bar: 'bg-primary',
    accent: 'var(--primary)',
  },
  success: {
    icon: 'bg-success-soft text-success',
    chip: 'bg-success-soft text-success',
    text: 'text-success',
    bar: 'bg-success',
    accent: 'var(--success)',
  },
  warning: {
    icon: 'bg-warning-soft text-warning',
    chip: 'bg-warning-soft text-warning',
    text: 'text-warning',
    bar: 'bg-warning',
    accent: 'var(--warning)',
  },
  danger: {
    icon: 'bg-danger-soft text-danger',
    chip: 'bg-danger-soft text-danger',
    text: 'text-danger',
    bar: 'bg-danger',
    accent: 'var(--danger)',
  },
  info: {
    icon: 'bg-info-soft text-info',
    chip: 'bg-info-soft text-info',
    text: 'text-info',
    bar: 'bg-info',
    accent: 'var(--info)',
  },
  neutral: {
    icon: 'bg-surface-muted text-ink-secondary',
    chip: 'bg-surface-muted text-ink-secondary',
    text: 'text-ink-muted',
    bar: 'bg-ink-subtle',
    accent: 'var(--ink-subtle)',
  },
};

/*----------------------------------------------------------------------
  Series bars
  ----------------------------------------------------------------------
  A compact column chart for real per-day counts. The value of each bar
  is exposed to assistive technology, and the chart carries a text
  summary; it is never the only way to read the figures.
---------------------------------------------------------------------- */

export function SparkBars({
  values,
  labels,
  tone = 'primary',
  ariaLabel,
  height = 48,
  showLabels = true,
}: {
  values: number[];
  labels: string[];
  tone?: CardTone;
  ariaLabel: string;
  height?: number;
  showLabels?: boolean;
}) {
  const max = Math.max(1, ...values);
  const palette = TONE[tone];

  return (
    <figure className="min-w-0" role="img" aria-label={ariaLabel}>
      <div
        className="grid items-end gap-1.5"
        style={{ gridTemplateColumns: `repeat(${values.length}, minmax(0, 1fr))` }}
      >
        {values.map((value, index) => {
          const ratio = value / max;
          const isEmpty = value === 0;

          return (
            <div
              key={`${labels[index] ?? index}-${index}`}
              className="flex min-w-0 flex-col gap-1.5"
            >
              <div className="flex items-end" style={{ height }}>
                <span
                  className={`spark-bar w-full rounded-[3px] ${
                    isEmpty ? 'bg-rule-soft' : palette.bar
                  }`}
                  style={{
                    height: isEmpty ? 3 : `${Math.max(16, ratio * 100)}%`,
                    opacity: isEmpty ? 1 : 0.4 + ratio * 0.6,
                    animationDelay: `${index * 45}ms`,
                  }}
                  title={`${labels[index] ?? ''}: ${value}`}
                />
              </div>

              {showLabels ? (
                <span className="text-ink-subtle truncate text-center text-[10.5px]">
                  {labels[index] ?? ''}
                </span>
              ) : null}

              <span className="sr-only">
                {labels[index] ?? ''}: {value}
              </span>
            </div>
          );
        })}
      </div>
    </figure>
  );
}

/*----------------------------------------------------------------------
  Metric card
---------------------------------------------------------------------- */

export function MetricCard({
  label,
  value,
  unit,
  icon,
  support,
  tone = 'primary',
  feature = false,
  series,
  breakdown,
  className = '',
}: {
  label: string;
  value: React.ReactNode;
  unit?: string;
  icon: React.ReactNode;
  support?: React.ReactNode;
  tone?: CardTone;
  feature?: boolean;
  series?: {
    values: number[];
    labels: string[];
    ariaLabel: string;
  };
  breakdown?: { label: string; value: number; tone: CardTone }[];
  className?: string;
}) {
  const palette = TONE[tone];
  const breakdownTotal = breakdown
    ? breakdown.reduce((sum, slice) => sum + slice.value, 0)
    : 0;

  return (
    <article
      className={`metric-card group bg-sheet border-rule relative flex h-full min-w-0 flex-col overflow-hidden rounded-[16px] border ${className}`}
      style={{ '--metric-accent': palette.accent } as React.CSSProperties}
    >
      <div className="relative flex h-full flex-col justify-between gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-ink-secondary text-[12.5px] leading-tight font-medium">
              {label}
            </p>
            <p
              className={`text-ink mt-2 flex items-baseline gap-1.5 font-semibold tracking-[-0.05em] tabular-nums ${
                feature ? 'text-[2.5rem] leading-[0.88]' : 'text-[1.85rem] leading-none'
              }`}
            >
              {value}
              {unit ? (
                <span className="text-ink-subtle text-[12px] font-medium tracking-normal">
                  {unit}
                </span>
              ) : null}
            </p>
          </div>

          <span aria-hidden="true" className={`shrink-0 ${palette.text}`}>
            {icon}
          </span>
        </div>

        {series && series.values.length > 1 ? (
          <SparkBars
            values={series.values}
            labels={series.labels}
            tone={tone}
            ariaLabel={series.ariaLabel}
            height={feature ? 54 : 40}
          />
        ) : null}

        {breakdown && breakdownTotal > 0 ? (
          <div>
            <div className="flex h-2 gap-1 overflow-hidden rounded-full" aria-hidden="true">
              {breakdown
                .filter((slice) => slice.value > 0)
                .map((slice) => (
                  <span
                    key={slice.label}
                    className={`${TONE[slice.tone].bar} rounded-full`}
                    style={{ flex: slice.value }}
                  />
                ))}
            </div>

            <ul className="mt-2 flex flex-wrap gap-x-2.5 gap-y-1">
              {breakdown.map((slice) => (
                <li
                  key={slice.label}
                  className="text-ink-muted flex items-center gap-1 text-[11.5px]"
                >
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 rounded-full ${TONE[slice.tone].bar}`}
                  />
                  {slice.label}
                  <span className="text-ink font-semibold tabular-nums">{slice.value}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {support ? (
          <p className="text-ink-muted text-[11px] leading-snug">{support}</p>
        ) : null}
      </div>
    </article>
  );
}

/*----------------------------------------------------------------------
  Theatre / operational status card
---------------------------------------------------------------------- */

export type StatusSegment = {
  id: string;
  left: number;
  width: number;
  className: string;
  label: string;
};

export function TheatreStatusCard({
  code,
  name,
  descriptor,
  statusLabel,
  tone,
  live = false,
  primaryLine,
  primaryLabel = 'Now',
  secondaryLine,
  bookedLabel,
  segments = [],
  selected = false,
  onSelect,
  alert,
}: {
  code: string;
  name: string;
  descriptor?: React.ReactNode;
  statusLabel: string;
  tone: CardTone;
  live?: boolean;
  primaryLine: string;
  primaryLabel?: string;
  secondaryLine?: string;
  bookedLabel?: string;
  segments?: StatusSegment[];
  selected?: boolean;
  onSelect?: () => void;
  alert?: string;
}) {
  const palette = TONE[tone];

  const body = (
    <>
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 w-[3px] ${palette.bar}`}
      />

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-ink font-mono text-[14.5px] leading-none font-semibold tracking-[-0.02em]">
            {code}
          </p>
          <p className="text-ink-muted mt-1 truncate text-[11.5px]">{name}</p>
        </div>

        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${palette.chip}`}
        >
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 rounded-full ${palette.bar} ${live ? 'signal-dot' : ''}`}
          />
          {statusLabel}
        </span>
      </div>

      <div className="border-rule-soft mt-3 border-t pt-2.5">
        <p className="text-ink-subtle text-[9.5px] font-semibold tracking-[0.09em] uppercase">
          {primaryLabel}
        </p>
        <p className="text-ink mt-0.5 truncate text-[12px] leading-snug font-semibold">
          {primaryLine}
        </p>
        {secondaryLine ? (
          <p className="text-ink-muted mt-0.5 truncate text-[10.5px]">{secondaryLine}</p>
        ) : null}
      </div>

      <div className="mt-auto pt-3">
        <div
          className="bg-surface-muted relative h-2 w-full overflow-hidden rounded-full"
          aria-hidden="true"
        >
          {segments.map((segment) => (
            <span
              key={segment.id}
              className={`${segment.className} absolute top-0 bottom-0 rounded-full opacity-90`}
              style={{ left: `${segment.left}%`, width: `${segment.width}%` }}
              title={segment.label}
            />
          ))}
        </div>

        <div className="text-ink-subtle mt-1.5 flex items-center justify-between gap-2 text-[9.5px]">
          <span className="truncate">{descriptor}</span>
          {bookedLabel ? <span className="shrink-0 tabular-nums">{bookedLabel}</span> : null}
        </div>

        {alert ? (
          <p className="text-danger mt-1 text-[9.5px] font-semibold">{alert}</p>
        ) : null}
      </div>
    </>
  );

  const shell = `status-card relative flex h-full min-w-0 flex-col overflow-hidden rounded-[14px] border bg-sheet py-3 pr-3.5 pl-4 text-left transition-[transform,box-shadow,border-color] duration-200 ${
    selected
      ? 'border-primary/45 bg-primary-soft/40 shadow-[0_18px_38px_-30px_rgba(73,55,119,0.55)]'
      : 'border-rule hover:border-rule-strong hover:shadow-[0_18px_38px_-32px_rgba(73,55,119,0.5)]'
  }`;

  if (!onSelect) {
    return <article className={shell}>{body}</article>;
  }

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`${shell} group cursor-pointer`}
    >
      {body}
    </button>
  );
}

/*----------------------------------------------------------------------
  Alert card
---------------------------------------------------------------------- */

export function AlertCard({
  icon,
  severity,
  title,
  message,
  meta,
  href,
  hrefLabel = 'Open',
  action,
  compact = false,
}: {
  icon: React.ReactNode;
  severity: CardTone;
  title: string;
  message: React.ReactNode;
  meta?: React.ReactNode;
  href?: string;
  hrefLabel?: string;
  action?: React.ReactNode;
  compact?: boolean;
}) {
  const palette = TONE[severity];

  return (
    <article
      className={`alert-card relative overflow-hidden rounded-[12px] border border-rule bg-sheet ${
        compact ? 'pl-3.5' : 'pl-4'
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 w-[3px] ${palette.bar}`}
      />

      <div className={compact ? 'py-2.5 pr-3' : 'py-3.5 pr-4'}>
        <div className="flex items-start gap-2.5">
          <span
            aria-hidden="true"
            className={`grid shrink-0 place-items-center rounded-[9px] ${palette.icon} ${
              compact ? 'h-7 w-7' : 'h-8 w-8'
            }`}
          >
            {icon}
          </span>

          <div className="min-w-0 flex-1">
            {meta ? <div className="mb-1">{meta}</div> : null}
            <p
              className={`text-ink leading-snug font-semibold ${compact ? 'text-[11.5px]' : 'text-[12.5px]'}`}
            >
              {title}
            </p>
            <p
              className={`text-ink-muted mt-1 leading-relaxed ${
                compact ? 'line-clamp-1 text-[10.5px]' : 'line-clamp-2 text-[11.5px]'
              }`}
            >
              {message}
            </p>
          </div>

          {action ? <div className="shrink-0">{action}</div> : null}
        </div>

        {href ? (
          <Link
            href={href}
            className={`mt-2 inline-flex items-center gap-1 font-semibold ${palette.text} ${
              compact ? 'text-[10.5px]' : 'text-[11px]'
            }`}
          >
            {hrefLabel}
            <ArrowRight size={10} weight="bold" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    </article>
  );
}

/*----------------------------------------------------------------------
  Equipment card
---------------------------------------------------------------------- */

export function EquipmentCard({
  icon,
  name,
  category,
  department,
  statusLabel,
  tone,
  detail,
  note,
}: {
  icon: React.ReactNode;
  name: string;
  category: string;
  department?: string;
  statusLabel: string;
  tone: CardTone;
  detail?: React.ReactNode;
  note?: React.ReactNode;
}) {
  const palette = TONE[tone];

  return (
    <article className="equipment-card border-rule bg-sheet relative flex min-w-0 flex-col overflow-hidden rounded-[12px] border p-3">
      <div className="flex items-start gap-2.5">
        <span
          aria-hidden="true"
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-[9px] ${palette.icon}`}
        >
          {icon}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-ink truncate text-[12px] leading-tight font-semibold">{name}</p>
            <span
              className={`inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${palette.chip}`}
            >
              <span className={`h-1 w-1 rounded-full ${palette.bar}`} aria-hidden="true" />
              {statusLabel}
            </span>
          </div>

          <p className="text-ink-muted mt-0.5 truncate text-[10px]">
            {category}
            {department ? ` · ${department}` : ''}
          </p>
        </div>
      </div>

      {detail ? (
        <p className="border-rule-soft text-ink-secondary mt-2.5 truncate border-t pt-2 text-[10.5px]">
          {detail}
        </p>
      ) : null}

      {note ? <p className="text-ink-subtle mt-1 text-[9.5px] leading-snug">{note}</p> : null}
    </article>
  );
}

/*----------------------------------------------------------------------
  Section rail label
  ----------------------------------------------------------------------
  A quiet heading used above the card families inside a dashboard grid.
---------------------------------------------------------------------- */

export function CardSectionLabel({
  children,
  aside,
}: {
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3">
      <p className="text-ink-muted text-[10px] font-semibold tracking-[0.1em] uppercase">
        {children}
      </p>
      {aside ? <div className="text-ink-subtle text-[10px]">{aside}</div> : null}
    </div>
  );
}
