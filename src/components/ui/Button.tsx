import React from 'react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'icon'
  | 'text';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** `pill` for marketing surfaces, `control` for product surfaces. */
  shape?: 'control' | 'pill';
  isLoading?: boolean;
  /** Loading label announced to assistive technology, e.g. "Saving". */
  loadingLabel?: string;
  children: React.ReactNode;
}

/*
 * Design system: every variant meets 4.5:1 for text-on-fill (or 3:1 for a
 * control boundary). Icon and text variants carry their own padding so they
 * are never a shrunken primary button; icon buttons require an aria-label,
 * because the child is a glyph.
 */
const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-ink shadow-[0_6px_16px_rgba(101,80,181,0.18)] hover:bg-primary-hover active:bg-primary-active',
  secondary:
    'bg-primary-soft text-primary hover:bg-[#DED3F4] active:bg-[#D5C8EF]',
  outline:
    'border border-border bg-sheet text-foreground-secondary shadow-xs hover:border-border-strong hover:bg-surface-subtle hover:text-foreground',
  ghost: 'text-foreground-muted hover:bg-primary-soft hover:text-primary',
  danger:
    'bg-danger text-white shadow-sm hover:bg-danger-hover active:bg-danger-hover',
  icon: 'border border-border bg-sheet text-foreground-secondary shadow-xs hover:border-border-strong hover:bg-surface-subtle hover:text-primary',
  text: 'text-foreground-secondary hover:text-foreground underline decoration-border-strong decoration-1 underline-offset-[5px] hover:decoration-foreground',
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'h-7 px-2.5 text-[11px] font-semibold',
  sm: 'h-8 px-3 text-xs font-semibold',
  md: 'h-10 px-4 text-sm font-semibold',
  lg: 'h-11 px-5 text-[0.9375rem] font-semibold',
};

/* Icon and text variants read as controls, not as filled buttons: their
   type size follows the size prop but their box is set by the glyph. */
const iconSizes: Record<ButtonSize, string> = {
  xs: 'h-7 w-7',
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-11 w-11',
};

const textSizes: Record<ButtonSize, string> = {
  xs: 'h-6 text-[11px]',
  sm: 'h-7 text-xs',
  md: 'h-8 text-sm',
  lg: 'h-9 text-[0.9375rem]',
};

/* Shared class builder: lets a <Link> render as a button without nesting an
   interactive element inside an anchor. */
export function buttonClasses({
  variant = 'primary',
  size = 'md',
  shape = 'control',
  className = '',
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: 'control' | 'pill';
  className?: string;
}) {
  const isIcon = variant === 'icon';
  const isText = variant === 'text';
  const box = isIcon
    ? iconSizes[size]
    : isText
      ? `px-0 ${textSizes[size]}`
      : sizeStyles[size];

  return [
    'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap transition-colors duration-200',
    shape === 'pill' ? 'rounded-[var(--radius-pill)]' : 'rounded-[var(--radius-control)]',
    variantStyles[variant],
    box,
    className,
  ].join(' ');
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'primary',
      size = 'md',
      shape = 'control',
      isLoading = false,
      loadingLabel,
      disabled,
      className = '',
      children,
      ...props
    },
    ref,
  ) {

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        className={`${buttonClasses({ variant, size, shape, className })} disabled:cursor-not-allowed disabled:opacity-50`}
        {...props}
      >
        {isLoading ? (
          <span
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        ) : null}
        {isLoading && loadingLabel ? (
          <span className="sr-only">{loadingLabel}</span>
        ) : null}
        {children}
      </button>
    );
  },
);
