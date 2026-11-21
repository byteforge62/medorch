import React from 'react';

type BadgeVariant =
  | 'active'
  | 'scheduled'
  | 'surgery'
  | 'urgent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'purple';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  /** Animated live dot. Only for genuinely current state. */
  pulse?: boolean;
  children: React.ReactNode;
}

/*
 * Status pills: soft background + dark ink pairs, every pair measured at
 * >= 4.5:1 (docs/design-system/medorch/MASTER.md). Status is never conveyed
 * by color alone — the label text is always present.
 * Note: "purple" is retained as the ADMIN role variant key (now cobalt).
 */
const variantStyles: Record<BadgeVariant, string> = {
  active: 'bg-[var(--color-status-active-soft)] text-[var(--color-status-active)]',
  scheduled:
    'bg-[var(--color-status-scheduled-soft)] text-[var(--color-status-scheduled)]',
  surgery:
    'bg-[var(--color-status-surgery-soft)] text-[var(--color-status-surgery)]',
  urgent: 'bg-[var(--color-status-urgent-soft)] text-[var(--color-status-urgent)]',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
  neutral: 'bg-surface-muted text-foreground-secondary',
  purple: 'bg-primary-soft text-primary',
};

const dotStyles: Record<BadgeVariant, string> = {
  active: 'bg-[var(--color-status-active)]',
  scheduled: 'bg-[var(--color-status-scheduled)]',
  surgery: 'bg-[var(--color-status-surgery)]',
  urgent: 'bg-[var(--color-status-urgent)]',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
  neutral: 'bg-ink-subtle',
  purple: 'bg-primary',
};

export function Badge({
  variant = 'neutral',
  pulse = false,
  className = '',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] leading-none font-semibold whitespace-nowrap ring-1 ring-black/5 ring-inset ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {pulse ? (
        <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${dotStyles[variant]}`}
          />
          <span
            className={`relative inline-flex h-1.5 w-1.5 rounded-full ${dotStyles[variant]}`}
          />
        </span>
      ) : null}
      {children}
    </span>
  );
}
