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
    <div className="min-w-0">
      <dt className="text-ink-subtle text-[9.5px] font-semibold tracking-[0.1em] uppercase">
        {label}
      </dt>
      <dd
        className={`mt-0.5 text-[13px] leading-tight font-semibold tabular-nums ${tone}`}
      >
        {value}
        {note ? (
          <span className="text-ink-muted ml-1.5 text-[10.5px] font-medium">
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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="bg-brass h-1.5 w-1.5 shrink-0 rounded-full"
              aria-hidden="true"
            />
            <p className="eyebrow">Theatre scheduling</p>
            <span className="text-ink-subtle hidden font-mono text-[10px] uppercase sm:inline">
              Day desk
            </span>
          </div>

          <h1 className="display text-ink mt-2 text-[clamp(1.8rem,3.1vw,2.5rem)] leading-none">
            Schedules
          </h1>

          <p className="text-ink-secondary mt-2 max-w-[66ch] text-[13px] leading-relaxed">
            One theatre day, every accessible resource and the case record in
            one working surface.
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
            <ArrowClockwise size={13} weight="bold" aria-hidden="true" />
            Refresh
          </Button>

          {canCreate ? (
            <Button size="sm" onClick={onNewSchedule}>
              <Plus size={13} weight="bold" aria-hidden="true" />
              New schedule
            </Button>
          ) : null}
        </div>
      </div>

      <div className="border-rule mt-5 flex flex-col gap-4 border-y py-3.5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onPreviousDay}
            className="border-rule text-ink-secondary hover:bg-surface-subtle focus-visible:outline-primary flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            aria-label="Previous day"
          >
            <CaretLeft size={14} weight="bold" aria-hidden="true" />
          </button>

          <label className="border-rule bg-surface flex min-h-9 min-w-0 items-center gap-2 rounded-[var(--radius-control)] border px-2.5">
            <CalendarDots
              size={14}
              className="text-ink-subtle shrink-0"
              aria-hidden="true"
            />
            <span className="sr-only">Selected theatre date</span>
            <input
              type="date"
              value={dateKey}
              onChange={(event) =>
                onDateChange(event.target.value || todayKey)
              }
              className="text-ink min-h-8 min-w-[8.8rem] bg-transparent text-[12px] font-semibold tabular-nums outline-none"
            />
          </label>

          <button
            type="button"
            onClick={onNextDay}
            className="border-rule text-ink-secondary hover:bg-surface-subtle focus-visible:outline-primary flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            aria-label="Next day"
          >
            <CaretRight size={14} weight="bold" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={onToday}
            aria-pressed={isToday}
            className={`min-h-9 rounded-[var(--radius-control)] border px-3 text-[11px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              isToday
                ? 'border-primary/25 bg-primary-soft text-primary'
                : 'border-rule text-ink-secondary hover:bg-surface-subtle'
            }`}
          >
            Today
          </button>

          <div className="border-rule hidden h-6 border-l sm:block" />

          <div className="min-w-0">
            <p className="text-ink text-[13px] leading-tight font-semibold">
              {formatDayHeading(dateKey, todayKey)}
            </p>
            <p className="text-ink-muted mt-0.5 truncate text-[10.5px]">
              {formatDateLong(dateKey)}
            </p>
          </div>
        </div>

        <dl className="border-rule grid grid-cols-3 gap-x-4 gap-y-3 pt-3 sm:gap-x-5 xl:grid-cols-5 xl:border-l xl:pt-0 xl:pl-6">
          <BriefMetric
            label="Procedures"
            value={`${brief.procedures}`}
            note={
              brief.cancelled > 0
                ? `${brief.cancelled} cancelled`
                : undefined
            }
          />
          <BriefMetric
            label="Theatres"
            value={`${brief.bookedTheatres} booked`}
            note={`${brief.freeTheatres} free`}
          />
          <BriefMetric
            label={isToday ? 'In use now' : 'In use'}
            value={isToday ? `${brief.inUseTheatres}` : '—'}
            note={isToday ? 'live' : 'not today'}
            tone={brief.inUseTheatres > 0 && isToday ? 'text-secondary' : 'text-ink'}
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

      <p className="text-ink-subtle mt-2 text-[10px]">
        Local theatre time · {formatDateShort(dateKey)} · resource flags are
        reviewed in the day coordination notes.
      </p>
    </header>
  );
}
