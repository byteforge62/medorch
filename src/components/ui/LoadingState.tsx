import React from 'react';

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center p-8 text-center"
    >
      <span
        className="border-primary h-8 w-8 animate-spin rounded-full border-[3px] border-t-transparent"
        aria-hidden="true"
      />
      <p className="text-foreground-muted mt-3 text-sm font-medium">
        {message}
      </p>
    </div>
  );
}
