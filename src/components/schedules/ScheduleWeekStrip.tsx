'use client';

import React from 'react';

import {
  formatWeekday,
  weekDatesFor,
} from './schedule-workspace-format';

export function ScheduleWeekStrip({
  dateKey,
  todayKey,
  counts,
  onSelect,
}: {
  dateKey: string;
  todayKey: string;
  counts: Record<string, number>;
  onSelect: (dateKey: string) => void;
}) {
  const dates = weekDatesFor(dateKey);
  const first = dates[0];
  const last = dates[dates.length - 1];

  return (
    <section aria-label="Week at a glance" className="hidden pb-5 sm:block">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-ink-subtle text-[9px] font-medium">Week at a glance</p>
        <p className="text-ink-subtle font-mono text-[8.5px] tabular-nums">
          {first === last ? first : `${first} — ${last}`}
        </p>
      </div>

      <div className="border-rule grid grid-cols-7 overflow-hidden border">
        {dates.map((key) => {
          const selected = key === dateKey;
          const today = key === todayKey;
          const count = counts[key] ?? 0;
          const dayNumber = key.slice(8, 10);

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              aria-current={selected ? 'date' : undefined}
              aria-label={`${key}, ${count} procedure${count === 1 ? '' : 's'}${
                selected ? ', selected' : ''
              }`}
              className={`group border-rule relative min-w-0 border-r px-1.5 py-2.5 text-center transition-colors last:border-r-0 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary sm:px-2.5 ${
                selected ? 'bg-sheet' : 'bg-sheet/35 hover:bg-sheet/80'
              }`}
            >
              <span
                className={`block text-[8px] font-semibold ${
                  selected ? 'text-primary' : 'text-ink-subtle'
                }`}
              >
                {formatWeekday(key)}
              </span>
              <span
                className={`mt-1 block font-display text-[18px] leading-none font-medium tabular-nums ${
                  selected ? 'text-ink' : 'text-ink-secondary'
                }`}
              >
                {dayNumber}
              </span>
              <span
                className={`mt-1.5 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full px-1 font-mono text-[8px] font-semibold tabular-nums ${
                  count > 0
                    ? selected
                      ? 'bg-primary text-primary-ink'
                      : 'bg-surface-muted text-ink-secondary'
                    : 'text-ink-subtle'
                }`}
              >
                {count > 0 ? count : '–'}
              </span>
              {selected ? (
                <span className="bg-primary absolute inset-x-0 top-0 h-[2px]" aria-hidden="true" />
              ) : null}
              {today ? (
                <span
                  className={`absolute bottom-1 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full ${
                    selected ? 'bg-primary' : 'bg-brass'
                  }`}
                  title="Today"
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
