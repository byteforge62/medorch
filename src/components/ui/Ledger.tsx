import React from 'react';

/**
 * Ledger — a dense, ruled list for operational records (theatre schedules,
 * staff assignments, appointment history). Rows share one surface and are
 * separated by hairlines instead of stacking individual cards, so a long list
 * scans like a printed theatre day sheet.
 */
export function Ledger({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      className={`border-border bg-surface divide-y border ${className}`}
      {...props}
    >
      {children}
    </ul>
  );
}

export function LedgerRow({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLLIElement>) {
  return (
    <li
      className={`hover:bg-surface-muted transition-colors ${className}`}
      {...props}
    >
      {children}
    </li>
  );
}

/**
 * Left rail of a ledger row: date and time in tabular mono so a day's list
 * lines up vertically at a glance.
 */
export function LedgerTime({
  date,
  time,
  className = '',
}: {
  date: string;
  time: string;
  className?: string;
}) {
  return (
    <div className={`shrink-0 sm:w-44 ${className}`}>
      <p className="text-foreground font-mono text-xs font-semibold tabular-nums">
        {date}
      </p>

      <p className="text-foreground-muted font-mono text-[11px] tabular-nums">
        {time}
      </p>
    </div>
  );
}
