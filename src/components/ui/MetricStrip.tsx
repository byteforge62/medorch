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
  columns?: 3 | 4;
  label?: string;
}

/**
 * MetricStrip — one open ledger band divided by hairlines. The cells share a
 * surface, so the metrics read as one instrument rather than four cards.
 */
export function MetricStrip({ metrics, columns = 4, label }: MetricStripProps) {
  const gridColumns =
    columns === 3
      ? 'grid-cols-1 min-[420px]:grid-cols-3'
      : 'grid-cols-2 lg:grid-cols-4';

  return (
    <section
      aria-label={label}
      className={`border-rule bg-rule grid gap-px border-y ${gridColumns}`}
    >
      {metrics.map((metric) => (
        <div key={metric.label} className="bg-sheet px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-ink-muted text-[9px] font-semibold">{metric.label}</p>
            {metric.meta ? (
              <p className="text-ink-subtle shrink-0 font-mono text-[8.5px]">{metric.meta}</p>
            ) : null}
          </div>

          <p className="font-display text-ink mt-2 text-[2rem] leading-none font-medium tabular-nums">
            {metric.value}
          </p>

          <p className="text-ink-subtle mt-1.5 text-[9.5px] leading-snug">
            {metric.description}
          </p>
        </div>
      ))}
    </section>
  );
}
