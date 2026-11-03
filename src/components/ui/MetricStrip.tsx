import React from 'react';

export interface MetricItem {
  label: string;
  value: React.ReactNode;
  description: string;
  /** Optional right-aligned status note beside the label (e.g. "3 Unread"). */
  meta?: string;
}

interface MetricStripProps {
  metrics: MetricItem[];
  /**
   * `4` renders two cells per row on small screens and four from `lg` up;
   * `3` keeps three across (patient appointment summary).
   */
  columns?: 3 | 4;
  /** Accessible name for the band, e.g. "Appointment summary". */
  label?: string;
}

/**
 * MetricStrip — one panel divided by hairlines instead of a row of separate
 * cards. Cells share a single surface, so the metrics read as one instrument.
 * The hairlines come from `gap-px` over a border-coloured backdrop, which
 * stays correct at any column count.
 */
export function MetricStrip({ metrics, columns = 4, label }: MetricStripProps) {
  const gridColumns =
    columns === 3
      ? 'grid-cols-1 min-[420px]:grid-cols-3'
      : 'grid-cols-2 lg:grid-cols-4';

  return (
    <section
      aria-label={label}
      className={`border-border bg-border grid gap-px overflow-hidden rounded-[var(--radius-panel)] border shadow-sm ${gridColumns}`}
    >
      {metrics.map((metric) => (
        <div key={metric.label} className="bg-surface px-5 py-5">
          <p className="text-foreground-muted text-[11px] font-semibold tracking-[0.1em] uppercase">
            {metric.label}
          </p>

          <div className="mt-2.5 flex items-baseline justify-between gap-3">
            <p className="text-foreground font-display text-[2.15rem] leading-none tracking-tight tabular-nums">
              {metric.value}
            </p>

            {metric.meta ? (
              <p className="text-foreground-secondary shrink-0 text-[11px] font-semibold">
                {metric.meta}
              </p>
            ) : null}
          </div>

          <p className="text-foreground-subtle mt-1.5 text-xs leading-snug">
            {metric.description}
          </p>
        </div>
      ))}
    </section>
  );
}
