import React from 'react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tonal'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'icon'
  | 'text';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** `pill` is the house shape; `control` keeps a tighter radius for dense toolbars. */
  shape?: 'control' | 'pill';
  isLoading?: boolean;
  /** Loading label announced to assistive technology, e.g. "Saving". */
  loadingLabel?: string;
  /** Trailing arrow that slides on hover — marketing and primary CTAs. */
  trailingArrow?: boolean;
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
    'bg-primary text-primary-ink shadow-xs hover:bg-primary-hover active:bg-primary-active',
  secondary:
    'border border-border bg-sheet text-foreground hover:border-border-strong hover:bg-surface-subtle active:bg-surface-muted',
  tonal:
    'bg-[var(--color-teal-soft)] text-[var(--color-teal-ink)] hover:bg-[#b9f6e9] active:bg-[#a7f0e0]',
  outline:
    'border border-border bg-sheet text-foreground-secondary hover:border-border-strong hover:bg-surface-subtle hover:text-foreground',
  ghost: 'text-foreground-muted hover:bg-surface-subtle hover:text-foreground',
  danger:
    'bg-danger text-white shadow-sm hover:bg-danger-hover active:bg-danger-hover',
  icon: 'border border-border bg-sheet text-foreground-secondary shadow-xs hover:border-border-strong hover:bg-surface-subtle hover:text-primary',
  text: 'text-foreground-secondary hover:text-foreground underline decoration-border-strong decoration-1 underline-offset-[5px] hover:decoration-foreground',
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'h-7 px-3 text-[11px] font-semibold',
  sm: 'h-9 px-4 text-xs font-semibold',
  md: 'h-10 px-5 text-[0.8125rem] font-semibold',
  lg: 'h-12 px-6 text-[0.9375rem] font-semibold',
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

export function ArrowGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      className="h-3.5 w-3.5 transition-transform duration-200 ease-[var(--ease-out-quint)] group-hover:translate-x-0.5"
    >
      <path
        d="M3 8h9.5M9 4.5 12.5 8 9 11.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* Shared class builder: lets a <Link> render as a button without nesting an
   interactive element inside an anchor. */
export function buttonClasses({
  variant = 'primary',
  size = 'md',
  shape = 'pill',
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
    'group inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap transition-[background-color,border-color,color,box-shadow] duration-200',
    shape === 'pill'
      ? 'rounded-[var(--radius-pill)]'
      : 'rounded-[var(--radius-control)]',
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
      shape = 'pill',
      isLoading = false,
      loadingLabel,
      trailingArrow = false,
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
        {trailingArrow && !isLoading ? <ArrowGlyph /> : null}
      </button>
    );
  },
);
