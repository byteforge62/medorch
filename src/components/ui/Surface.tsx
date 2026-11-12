import React from 'react';

export type SurfaceVariant =
  | 'plain'
  | 'feature'
  | 'interactive'
  | 'metric'
  | 'preview'
  | 'inset';

export type SurfaceTone = 'default' | 'raised' | 'inverse' | 'tinted';

interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SurfaceVariant;
  tone?: SurfaceTone;
  /** `none` keeps padding to the caller (product previews, flush tables). */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

/*
 * Surfaces read the semantic tokens only, so a palette scope restyles them
 * with no per-component variant. Elevation is a material decision, not a
 * decoration: `feature` sits above the page, `inset` below it.
 */
const variantStyles: Record<SurfaceVariant, string> = {
  plain: 'border border-border',
  feature: 'border border-border shadow-sm',
  interactive:
    'border border-border transition-[box-shadow,border-color,transform] duration-[var(--dur-base)] ease-[var(--ease-standard)] hover:-translate-y-0.5 hover:border-border-strong hover:shadow-sm focus-within:border-primary motion-reduce:hover:translate-y-0',
  metric: 'border border-border',
  preview:
    'overflow-hidden border border-border shadow-md',
  inset: 'border border-rule-soft',
};

const toneStyles: Record<SurfaceTone, string> = {
  default: 'bg-sheet',
  raised: 'bg-sheet-raised',
  inverse: 'bg-surface-inverse text-chalk inverse-surface',
  tinted: 'bg-surface-subtle',
};

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-9',
} as const;

export function Surface({
  variant = 'plain',
  tone = 'default',
  padding = 'md',
  className = '',
  children,
  ...props
}: SurfaceProps) {
  return (
    <div
      className={`rounded-[var(--radius-panel)] ${toneStyles[tone]} ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
