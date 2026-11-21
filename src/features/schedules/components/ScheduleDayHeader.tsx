'use client';

import React from 'react';
import {
  ArrowClockwise,
  CalendarDots,
  CaretLeft,
  CaretRight,
  Plus,
} from '@phosphor-icons/react';

import { Button } from '@/components/ui/Button';
import {
  formatDateLong,
  formatDayHeading,
} from '@/features/schedules/components/schedule-workspace-format';

export interface DayBrief {
  procedures: number;
  cancelled: number;
  bookedTheatres: number;
  freeTheatres: number;
  inUseTheatres: number;
  pending: number;
  conflicts: number;
}

function BriefMetric({
  label,
  value,
  note,
  tone = 'text-midnight',
}: {
  label: string;
  value: string;
  note?: string;
  tone?: string;
}) {
  return (
    <div className="border-rule-soft border-r px-3 py-3.5 last:border-r-0 sm:px-4">
      <dt className="text-ink-subtle text-[10px] font-medium">{label}</dt>
      <dd className={`font-display mt-1.5 text-[22px] leading-none tabular-nums ${tone}`}>
        {value}
        {note ? (
          <span className="text-ink-subtle ml-1.5 font-sans text-[9px] font-medium">
            {note}
          </span>
        ) : null}
      </dd>
    </div>
  );
}

const dayControlClass =
  'flex h-9 items-center justify-center gap-1.5 rounded-full border border-ice-border bg-white px-3 text-[11.5px] font-semibold text-ink-secondary shadow-xs transition-colors hover:border-cobalt/30 hover:text-cobalt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt';

export function ScheduleDayHeader({
  dateKey,
  todayKey,
  brief,
  canCreate,
  refreshing,
  onDateChange,
  onPreviousDay,
  onNextDay,
  onToday,
  onNewSchedule,
  onRefresh,
}: {
  dateKey: string;
  todayKey: string;
  brief: DayBrief;
  canCreate: boolean;
  refreshing: boolean;
  onDateChange: (dateKey: string) => void;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  onNewSchedule: () => void;
  onRefresh: () => void;
}) {
  const isToday = dateKey === todayKey;

  return (
    <header className="pb-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="ui-kicker">Theatre scheduling · day desk</p>

          {/* "Today · 21 Nov" becomes two lines on a phone, so the separator
              never dangles at the end of the first line. */}
          <h1 className="display text-midnight mt-3 text-[clamp(1.9rem,1.3rem+2.2vw,3rem)]">
            {formatDayHeading(dateKey, todayKey)
              .split(' · ')
              .map((part, index) => (
                <span key={`${part}-${index}`} className="block sm:inline">
                  {index > 0 ? (
                    <span className="text-ink-subtle hidden sm:inline" aria-hidden="true">
                      ·{' '}
                    </span>
                  ) : null}
                  {part}
                </span>
              ))}
          </h1>

          <p className="text-ink-secondary mt-2.5 max-w-[62ch] text-[13px] leading-[1.7]">
            {formatDateLong(dateKey)} · local theatre time. Blocks are
            positioned by the recorded start and end of every case.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onRefresh}
            isLoading={refreshing}
            loadingLabel="Refreshing schedule"
          >
            <ArrowClockwise size={12} weight="bold" aria-hidden="true" />
            Refresh
          </Button>

          {canCreate ? (
            <Button size="sm" onClick={onNewSchedule}>
              <Plus size={12} weight="bold" aria-hidden="true" />
              New schedule
            </Button>
          ) : null}
        </div>
      </div>

      <section
        aria-label="Selected theatre day"
        className="border-ice-border bg-sheet shadow-xs mt-5 overflow-hidden rounded-[var(--radius-panel)] border"
      >
        <div className="border-rule-soft bg-porcelain/60 flex flex-wrap items-center gap-2 border-b px-3 py-2.5 sm:px-4">
          <button
            type="button"
            onClick={onPreviousDay}
            className={`${dayControlClass} w-9 px-0`}
            aria-label="Previous day"
          >
            <CaretLeft size={13} weight="bold" aria-hidden="true" />
          </button>

          <label className="border-ice-border bg-sheet shadow-xs flex h-9 min-w-0 items-center gap-2 rounded-full border px-3 focus-within:border-cobalt">
            <CalendarDots size={13} className="text-cobalt shrink-0" aria-hidden="true" />
            <span className="sr-only">Selected theatre date</span>
            <input
              type="date"
              value={dateKey}
              onChange={(event) => onDateChange(event.target.value || todayKey)}
              className="text-midnight min-h-7 min-w-[8.5rem] bg-transparent text-[11.5px] font-semibold tabular-nums outline-none"
            />
          </label>

          <button
            type="button"
            onClick={onNextDay}
            className={`${dayControlClass} w-9 px-0`}
            aria-label="Next day"
          >
            <CaretRight size={13} weight="bold" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={onToday}
            aria-pressed={isToday}
            className={`${dayControlClass} ${
              isToday
                ? 'border-cobalt/25 bg-cobalt-soft text-cobalt'
                : ''
            }`}
          >
            Today
          </button>

          <span className="text-ink-subtle ml-auto hidden font-mono text-[9px] tracking-[0.08em] sm:inline">
            DAY SHIFT · 08:00–18:00
          </span>
        </div>

        <dl className="grid grid-cols-3 sm:grid-cols-5">
          <BriefMetric
            label="Procedures"
            value={`${brief.procedures}`}
            note={brief.cancelled > 0 ? `${brief.cancelled} cancelled` : undefined}
          />
          <BriefMetric
            label="Theatres"
            value={`${brief.bookedTheatres}`}
            note={`${brief.freeTheatres} free`}
          />
          <BriefMetric
            label={isToday ? 'In use now' : 'In use'}
            value={isToday ? `${brief.inUseTheatres}` : '—'}
            note={isToday ? 'live' : 'not today'}
            tone={brief.inUseTheatres > 0 && isToday ? 'text-cobalt' : 'text-midnight'}
          />
          <BriefMetric
            label="Pending"
            value={`${brief.pending}`}
            note="unconfirmed"
            tone={brief.pending > 0 ? 'text-warning' : 'text-midnight'}
          />
          <BriefMetric
            label="Flags"
            value={`${brief.conflicts}`}
            note="review"
            tone={brief.conflicts > 0 ? 'text-danger' : 'text-success'}
          />
        </dl>
      </section>
    </header>
  );
}
