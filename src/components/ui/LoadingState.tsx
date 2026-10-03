import React from "react";

export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent dark:border-blue-400 dark:border-t-transparent" />
      <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
}
