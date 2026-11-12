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
  formatDateShort,
  formatDayHeading,
} from './schedule-workspace-format';

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
  tone = 'text-ink',
}: {
  label: string;
  value: string;
  note?: string;
  tone?: string;
}) {
  return (
    <div className="border-rule-soft border-r px-3 py-3 last:border-r-0 sm:px-4">
      <dt className="text-ink-subtle text-[9px] font-medium">{label}</dt>
      <dd className={`font-display mt-1 text-[22px] leading-none tabular-nums ${tone}`}>
        {value}
        {note ? (
          <span className="text-ink-subtle ml-1.5 font-sans text-[8.5px] font-medium">
            {note}
          </span>
        ) : null}
      </dd>
    </div>
  );
}

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
          <p className="ui-kicker">Theatre scheduling / day desk</p>

          <h1 className="display text-ink mt-3 text-[clamp(2.5rem,1.6rem+2.8vw,4.1rem)]">
            {formatDayHeading(dateKey, todayKey)}
          </h1>

          <p className="text-ink-secondary mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
            <span>{formatDateLong(dateKey)}</span>
            <span className="text-ink-subtle" aria-hidden="true">·</span>
            <span className="text-ink-muted">Local theatre time</span>
            <span className="text-ink-subtle" aria-hidden="true">·</span>
            <span className="text-ink-muted">{formatDateShort(dateKey)}</span>
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            variant="outline"
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

      <div className="border-rule mt-5 border-y">
        <div className="flex flex-wrap items-center gap-2 py-2.5">
          <button
            type="button"
            onClick={onPreviousDay}
            className="border-rule text-ink-secondary hover:bg-sheet hover:border-rule-strong flex h-8 w-8 items-center justify-center rounded-[6px] border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-label="Previous day"
          >
            <CaretLeft size={13} weight="bold" aria-hidden="true" />
          </button>

          <label className="border-rule bg-sheet flex min-h-8 min-w-0 items-center gap-2 rounded-[6px] border px-2.5">
            <CalendarDots size={13} className="text-ink-subtle shrink-0" aria-hidden="true" />
            <span className="sr-only">Selected theatre date</span>
            <input
              type="date"
              value={dateKey}
              onChange={(event) => onDateChange(event.target.value || todayKey)}
              className="text-ink min-h-7 min-w-[8.5rem] bg-transparent text-[11px] font-semibold tabular-nums outline-none"
            />
          </label>

          <button
            type="button"
            onClick={onNextDay}
            className="border-rule text-ink-secondary hover:bg-sheet hover:border-rule-strong flex h-8 w-8 items-center justify-center rounded-[6px] border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-label="Next day"
          >
            <CaretRight size={13} weight="bold" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={onToday}
            aria-pressed={isToday}
            className={`min-h-8 rounded-[6px] border px-2.5 text-[10px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              isToday
                ? 'border-primary/25 bg-primary-soft text-primary'
                : 'border-rule text-ink-secondary hover:bg-sheet'
            }`}
          >
            Today
          </button>

          <span className="text-ink-subtle ml-auto hidden font-mono text-[8px] sm:inline">
            DAY SHIFT · 08:00–18:00
          </span>
        </div>

        <dl className="border-rule grid grid-cols-3 border-t sm:grid-cols-5">
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
            tone={brief.inUseTheatres > 0 && isToday ? 'text-primary' : 'text-ink'}
          />
          <BriefMetric
            label="Pending"
            value={`${brief.pending}`}
            note="unconfirmed"
            tone={brief.pending > 0 ? 'text-warning' : 'text-ink'}
          />
          <BriefMetric
            label="Flags"
            value={`${brief.conflicts}`}
            note="review"
            tone={brief.conflicts > 0 ? 'text-danger' : 'text-success'}
          />
        </dl>
      </div>
    </header>
  );
}
