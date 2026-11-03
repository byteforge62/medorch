import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

/*
 * Design system (docs/design-system/medorch/MASTER.md):
 * - every variant meets 4.5:1 for text-on-fill (or 3:1 control boundary)
 * - cursor-pointer, 150-250ms color transitions, visible focus (global outline)
 * - no layout-shifting transforms on hover
 */
const variantStyles = {
  primary:
    'bg-primary text-white shadow-sm hover:bg-primary-hover active:bg-primary-active',
  secondary:
    'bg-surface-muted text-foreground hover:bg-border active:bg-border-strong',
  outline:
    'border border-border bg-surface text-foreground-secondary shadow-xs hover:border-border-strong hover:text-foreground',
  ghost: 'text-foreground-muted hover:bg-surface-muted hover:text-foreground',
  danger:
    'bg-danger text-white shadow-sm hover:bg-danger-hover active:bg-danger-hover',
};

const sizeStyles = {
  sm: 'h-8 px-3 text-xs font-semibold rounded-[var(--radius-control)]',
  md: 'h-10 px-4 text-sm font-semibold rounded-[var(--radius-control)]',
  lg: 'h-11 px-5 text-[0.9375rem] font-semibold rounded-[var(--radius-control)]',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
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
        className={`inline-flex cursor-pointer items-center justify-center gap-2 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        ) : null}
        {children}
      </button>
    );
  },
);
