import React from 'react';
import { Tray } from '@phosphor-icons/react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

/**
 * EmptyState — a plain notice on the surface, not a decorated placeholder.
 * The glyph marks the absence of records; it is not boxed, so it does not
 * repeat the same coloured square on every page.
 */
export function EmptyState({
  title = 'No data found',
  description = 'There are no records to display at this time.',
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="border-border bg-surface-subtle/40 flex flex-col gap-3 rounded-[var(--radius-control)] border border-dashed px-5 py-6 sm:flex-row sm:items-start">
      <span className="text-ink-subtle shrink-0" aria-hidden="true">
        {icon || <Tray size={22} />}
      </span>

      <div className="min-w-0 flex-1">
        <h4 className="text-foreground text-[13.5px] font-semibold">{title}</h4>
        <p className="text-ink-muted mt-1 max-w-[62ch] text-[12.5px] leading-relaxed">
          {description}
        </p>
        {action ? <div className="mt-3">{action}</div> : null}
      </div>
    </div>
  );
}
