import React from 'react';

type BadgeVariant =
  'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

/*
 * Status pills: soft background + dark ink pairs, every pair measured at
 * >= 4.5:1 (docs/design-system/medorch/MASTER.md). Status is never conveyed
 * by color alone — the label text is always present.
 * Note: "purple" is retained as the ADMIN role variant key (now brand blue).
 */
const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
  neutral: 'bg-surface-muted text-foreground-secondary',
  purple: 'bg-primary-soft text-primary',
};

export function Badge({
  variant = 'neutral',
  className = '',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
