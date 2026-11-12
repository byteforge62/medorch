import React from 'react';
import { Warning } from '@phosphor-icons/react';

const panelTones = {
  primary: { accent: 'var(--primary)', tint: 'color-mix(in srgb, var(--primary) 7%, transparent)' },
  success: { accent: 'var(--success)', tint: 'color-mix(in srgb, var(--success) 6%, transparent)' },
  warning: { accent: 'var(--warning)', tint: 'color-mix(in srgb, var(--warning) 7%, transparent)' },
  danger: { accent: 'var(--danger)', tint: 'color-mix(in srgb, var(--danger) 6%, transparent)' },
  neutral: { accent: 'var(--ink-subtle)', tint: 'color-mix(in srgb, var(--ink-subtle) 5%, transparent)' },
} as const;

export type PanelTone = keyof typeof panelTones;

export function Panel({
  children,
  className = '',
  labelledBy,
  tone = 'primary',
}: {
  children: React.ReactNode;
  className?: string;
  labelledBy?: string;
  tone?: PanelTone;
}) {
  const colors = panelTones[tone];

  return (
    <section
      aria-labelledby={labelledBy}
      style={
        {
          '--panel-accent': colors.accent,
          '--panel-tint': colors.tint,
        } as React.CSSProperties
      }
      className={`dashboard-panel bg-sheet border-rule overflow-hidden rounded-[18px] border ${className}`}
    >
      {children}
    </section>
  );
}

export function PanelHeader({
  id,
  title,
  caption,
  aside,
}: {
  id: string;
  title: string;
  caption?: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <header className="border-rule-soft dashboard-panel-header flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3.5 sm:px-5">
      <div className="flex min-w-0 items-start gap-2.5">
        <span
          aria-hidden="true"
          className="bg-[var(--panel-accent)] mt-0.5 h-5 w-[3px] shrink-0 rounded-full"
        />
        <div className="min-w-0">
          <h2 id={id} className="text-ink text-[14.5px] leading-tight font-semibold tracking-[-0.01em]">
            {title}
          </h2>
          {caption ? (
            <p className="text-ink-muted mt-1 text-[11.5px] leading-snug">{caption}</p>
          ) : null}
        </div>
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </header>
  );
}

export function PanelError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="px-4 py-6 sm:px-5">
      <div className="flex items-start gap-2.5">
        <Warning
          size={16}
          weight="bold"
          className="text-danger mt-0.5 shrink-0"
          aria-hidden="true"
        />
        <div>
          <p className="text-ink text-[12.5px] font-semibold">This view could not load</p>
          <p className="text-ink-muted mt-1 text-[11.5px] leading-relaxed">{message}</p>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="text-primary mt-2 text-[11.5px] font-semibold underline decoration-current/30 underline-offset-4 hover:decoration-current"
            >
              Retry
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function PanelEmpty({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="px-4 py-8 text-center sm:px-5">
      <p className="text-ink text-[12.5px] font-semibold">{title}</p>
      {description ? (
        <p className="text-ink-muted mx-auto mt-1 max-w-[46ch] text-[11.5px] leading-relaxed">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function CountTag({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'critical' | 'warning' | 'positive' | 'primary';
}) {
  const tones = {
    neutral: 'bg-surface-muted text-ink-secondary',
    critical: 'bg-danger-soft text-danger',
    warning: 'bg-warning-soft text-warning',
    positive: 'bg-success-soft text-success',
    primary: 'bg-primary-soft text-primary',
  } as const;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-semibold tabular-nums ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function InlineMeter({
  value,
  tone = 'bg-primary',
  label,
}: {
  value: number;
  tone?: string;
  label: string;
}) {
  const width = Math.max(0, Math.min(100, value));

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(width)}
      className="bg-surface-muted h-1.5 w-full overflow-hidden rounded-full"
    >
      <span
        className={`block h-full rounded-full ${tone}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <main className="space-y-4" aria-busy="true" aria-label="Loading operations control">
      <div className="border-rule flex flex-col gap-5 border-b pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="bg-surface-muted h-2.5 w-28 animate-pulse rounded-full" />
          <div className="bg-surface-muted h-8 w-64 animate-pulse rounded-[6px]" />
          <div className="bg-surface-muted h-3 w-80 max-w-full animate-pulse rounded-full" />
        </div>
        <div className="bg-surface-muted h-9 w-72 animate-pulse rounded-[var(--radius-control)]" />
      </div>

      {[0, 1, 2, 3].map((index) => (
        <div
          key={index}
          className="bg-sheet border-rule overflow-hidden rounded-[var(--radius-panel)] border shadow-sm"
        >
          <div className="border-rule-soft flex items-center justify-between border-b px-5 py-4">
            <div className="bg-surface-muted h-3 w-40 animate-pulse rounded-full" />
            <div className="bg-surface-muted h-3 w-20 animate-pulse rounded-full" />
          </div>
          <div className="space-y-3 p-5">
            <div className="bg-surface-muted h-3 w-full animate-pulse rounded-full" />
            <div className="bg-surface-muted h-3 w-4/5 animate-pulse rounded-full" />
            <div className="bg-surface-muted h-3 w-2/3 animate-pulse rounded-full" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading operational data</span>
    </main>
  );
}
