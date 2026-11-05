import React from 'react';

export type StatusTone =
  | 'positive'
  | 'attention'
  | 'critical'
  | 'neutral'
  | 'info'
  | 'accent';

interface StatusPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: StatusTone;
  size?: 'sm' | 'md';
  /** Leading dot; status is still carried by the label text. */
  dot?: boolean;
  children: React.ReactNode;
}

/*
 * Status is never conveyed by colour alone: the label is always present, and
 * the dot is aria-hidden. Tones map to the semantic tokens (success, warning,
 * danger, info) so a palette scope keeps the meaning and changes the light.
 */
const toneStyles: Record<StatusTone, string> = {
  positive: 'bg-success-soft text-success',
  attention: 'bg-warning-soft text-warning',
  critical: 'bg-danger-soft text-danger',
  neutral: 'bg-surface-muted text-foreground-secondary',
  info: 'bg-info-soft text-info',
  accent: 'bg-primary-soft text-primary',
};

const dotStyles: Record<StatusTone, string> = {
  positive: 'bg-success',
  attention: 'bg-warning',
  critical: 'bg-danger',
  neutral: 'bg-ink-subtle',
  info: 'bg-info',
  accent: 'bg-primary',
};

export function StatusPill({
  tone = 'neutral',
  size = 'sm',
  dot = false,
  className = '',
  children,
  ...props
}: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] font-semibold whitespace-nowrap ${
        size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
      } ${toneStyles[tone]} ${className}`}
      {...props}
    >
      {dot ? (
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotStyles[tone]}`}
          aria-hidden="true"
        />
      ) : null}
      {children}
    </span>
  );
}
