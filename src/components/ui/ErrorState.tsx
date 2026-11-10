import React from 'react';
import { Warning } from '@phosphor-icons/react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  action?: React.ReactNode;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'Failed to load data. Please try again.',
  onRetry,
  action,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="border-danger-border bg-danger-soft rounded-[18px] border p-6 text-center"
    >
      <div className="bg-danger mx-auto flex h-11 w-11 items-center justify-center rounded-[14px] text-white">
        <Warning size={20} weight="bold" aria-hidden="true" />
      </div>
      <h4 className="text-danger mt-3 text-sm font-semibold">{title}</h4>
      <p className="text-foreground-secondary mt-1 text-sm">{message}</p>
      {onRetry || action ? (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          {action}
          {onRetry ? (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Try Again
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
