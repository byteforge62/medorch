import React from 'react';
import { Warning } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';

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
      className="border-danger-border bg-danger-soft/70 rounded-[var(--radius-control)] border px-4 py-4 sm:px-5"
    >
      <div className="flex items-start gap-3">
        <Warning
          size={18}
          weight="bold"
          className="text-danger mt-0.5 shrink-0"
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <h4 className="text-danger text-[13.5px] font-semibold">{title}</h4>
          <p className="text-ink-secondary mt-1 text-[12.5px] leading-relaxed">
            {message}
          </p>
          {onRetry || action ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {onRetry ? (
                <Button variant="outline" size="sm" onClick={onRetry}>
                  Try again
                </Button>
              ) : null}
              {action}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
