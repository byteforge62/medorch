import React from 'react';
import { Tray } from '@phosphor-icons/react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({
  title = 'No data found',
  description = 'There are no records to display at this time.',
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="border-border-strong bg-surface-subtle/35 flex flex-col items-center justify-center rounded-[18px] border border-dashed p-8 text-center">
      <div className="bg-primary-soft text-primary flex h-12 w-12 items-center justify-center rounded-[15px]">
        {icon || <Tray size={24} weight="duotone" aria-hidden="true" />}
      </div>
      <h4 className="text-foreground mt-3 text-sm font-semibold">{title}</h4>
      <p className="text-foreground-muted mt-1 max-w-[42ch] text-sm">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
