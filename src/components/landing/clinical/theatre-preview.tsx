'use client';

import { useState } from 'react';
import {
  clock,
  dayMinutes,
  durationLabel,
  roomStateStyle,
  statusStyle,
  theatreDays,
} from './clinical-data';

const hourMarks = [0, 120, 240, 360, 480];

export function TheatrePreview() {
  const [dayKey, setDayKey] = useState(theatreDays[0].key);
  const [roomCode, setRoomCode] = useState(theatreDays[0].rooms[0].code);
  const day = theatreDays.find((item) => item.key === dayKey) ?? theatreDays[0];
  const room = day.rooms.find((item) => item.code === roomCode) ?? day.rooms[0];
  const [caseId, setCaseId] = useState<string>(theatreDays[0].rooms[0].cases[0].id);
  const activeCase =
    room.cases.find((item) => item.id === caseId) ?? room.cases[0];

  const nowOffset = dayKey === 'tue' ? 144 : null;

  function selectDay(key: string) {
    const nextDay = theatreDays.find((item) => item.key === key) ?? theatreDays[0];
    setDayKey(nextDay.key);
    setRoomCode(nextDay.rooms[0].code);
    setCaseId(nextDay.rooms[0].cases[0].id);
  }

  function selectRoom(code: string) {
    const nextRoom = day.rooms.find((item) => item.code === code);
    if (!nextRoom) return;
    setRoomCode(code);
    setCaseId(nextRoom.cases[0].id);
  }

  return (
    <section
      aria-label="MedOrch product preview, theatre day"
      className="border-rule bg-sheet overflow-hidden rounded-[20px] border shadow-[0_8px_28px_rgba(66,48,112,0.05)]"
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--rule)] px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-[14px] font-semibold text-[var(--ink)]">Theatre day</h2>
          <span className="rounded-sm bg-[var(--surface-subtle)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--ink-secondary)]">
            Preview · synthetic schedule
          </span>
        </div>
        <p className="text-[11.5px] text-[var(--ink-muted)]">
          Updated <span className="font-mono text-[11px]">{day.updated}</span>
        </p>
      </header>

      <div className="flex items-center justify-between gap-3 border-b border-[var(--rule)] px-4 py-2">
        <div className="flex items-center gap-1" role="group" aria-label="Preview day">
          {theatreDays.map((item) => {
            const selected = item.key === day.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => selectDay(item.key)}
                aria-pressed={selected}
                className={`inline-flex min-h-9 items-center rounded-[9px] px-2.5 text-[11.5px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)] ${
                  selected
                    ? 'bg-[var(--primary)] text-white shadow-[0_4px_12px_rgba(101,80,181,0.18)]'
                    : 'text-[var(--ink-secondary)] hover:bg-[var(--surface-subtle)]'
                }`}
              >
                <span className="sm:hidden">{item.short}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>
        <p className="hidden text-[11.5px] text-[var(--ink-muted)] sm:block">
          {room.cases.length} {room.cases.length === 1 ? 'entry' : 'entries'} · {room.name}
        </p>
      </div>

      <div className="c-scroll overflow-x-auto">
        <div className="min-w-[540px]">
          <div className="flex border-b border-[var(--rule)] bg-[var(--surface-subtle)]">
            <div className="w-[84px] shrink-0 border-r border-[var(--rule)] px-3 py-1.5 text-[10.5px] font-medium text-[var(--ink-muted)]">
              Room
            </div>
            <div className="relative flex-1">
              {hourMarks.map((mark) =>
                mark === dayMinutes ? (
                  <span
                    key={mark}
                    className="absolute right-0 top-1.5 font-mono text-[10.5px] text-[var(--ink-muted)]"
                  >
                    {clock(mark)}
                  </span>
                ) : (
                  <span
                    key={mark}
                    className="absolute top-1.5 -translate-x-1/2 font-mono text-[10.5px] text-[var(--ink-muted)] first:translate-x-0"
                    style={{ left: `${(mark / dayMinutes) * 100}%` }}
                  >
                    {clock(mark)}
                  </span>
                ),
              )}
            </div>
          </div>

          {day.rooms.map((item) => {
            const selectedRoom = item.code === room.code;
            const state = roomStateStyle[item.state];
            return (
              <div
                key={item.code}
                className={`flex border-b border-[var(--surface-subtle)] last:border-b-0 ${
                  selectedRoom ? 'bg-[var(--surface-subtle)]' : 'bg-[var(--sheet)]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => selectRoom(item.code)}
                  aria-pressed={selectedRoom}
                  className={`flex w-[84px] shrink-0 flex-col justify-center border-r px-3 py-2 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--primary)] ${
                    selectedRoom ? 'border-[var(--rule-strong)]' : 'border-[var(--rule)]'
                  }`}
                >
                  <span className="font-mono text-[11.5px] font-medium text-[var(--ink)]">
                    {item.code}
                  </span>
                  <span className={`mt-0.5 flex min-w-0 items-center gap-1 text-[10.5px] ${state.text}`}>
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${state.dot}`} aria-hidden="true" />
                    <span className="truncate">{item.state}</span>
                  </span>
                </button>

                <div className="relative h-14 flex-1">
                  {hourMarks.map((mark) => (
                    <span
                      key={mark}
                      className="absolute inset-y-0 border-l border-[var(--surface-subtle)]"
                      style={{ left: `${(mark / dayMinutes) * 100}%` }}
                      aria-hidden="true"
                    />
                  ))}

                  {nowOffset !== null ? (
                    <span
                      className="pointer-events-none absolute inset-y-0 z-10 border-l border-[var(--vermilion)]/70"
                      style={{ left: `${(nowOffset / dayMinutes) * 100}%` }}
                      aria-hidden="true"
                    />
                  ) : null}

                  {item.cases.map((entry) => {
                    const style = statusStyle[entry.status];
                    const selected = entry.id === activeCase.id;
                    const width = (entry.duration / dayMinutes) * 100;
                    return (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => {
                          setRoomCode(item.code);
                          setCaseId(entry.id);
                        }}
                        aria-pressed={selected}
                        aria-label={`${item.code}, ${entry.procedure}, ${clock(entry.start)} to ${clock(entry.start + entry.duration)}, ${entry.status}`}
                        title={`${entry.procedure} · ${clock(entry.start)}–${clock(entry.start + entry.duration)}`}
                        className={`absolute top-[7px] z-20 flex h-[42px] items-center overflow-hidden rounded-[6px] border px-1.5 text-left transition-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] ${style.bar} ${
                          selected
                            ? 'ring-2 ring-[var(--primary)] ring-offset-1 ring-offset-white'
                            : 'hover:shadow-sm'
                        }`}
                        style={{
                          left: `calc(${(entry.start / dayMinutes) * 100}% + 2px)`,
                          width: `calc(${width}% - 4px)`,
                        }}
                      >
                        <span className="truncate text-[10.5px] font-medium">
                          {entry.short}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="border-t border-[var(--surface-subtle)] px-4 pt-2 text-[11px] text-[var(--ink-muted)] sm:hidden">
        Scroll the day horizontally to see every theatre.
      </p>

      <div aria-live="polite" className="border-t border-[var(--rule)] bg-[var(--surface-subtle)] p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${statusStyle[activeCase.status].dot}`} aria-hidden="true" />
              <span className={`text-[12px] font-medium ${statusStyle[activeCase.status].text}`}>
                {activeCase.status}
              </span>
              <span className="text-[12px] text-[var(--ink-muted)]">·</span>
              <span className="text-[12px] text-[var(--ink-secondary)]">{activeCase.priority}</span>
              <span className="font-mono text-[11px] text-[var(--ink-muted)]">{activeCase.id}</span>
            </div>
            <h3 className="mt-1 truncate text-[15px] font-semibold text-[var(--ink)]">
              {activeCase.procedure}
            </h3>
            <p className="mt-0.5 font-mono text-[11.5px] text-[var(--ink-secondary)]">
              {clock(activeCase.start)}–{clock(activeCase.start + activeCase.duration)} ·{' '}
              {durationLabel(activeCase.duration)} · {room.code}
            </p>
          </div>
          <a
            href="#modules"
            className="text-[12px] font-medium text-[var(--primary)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
          >
            How schedules are managed
          </a>
        </div>

        <dl className="mt-3 grid gap-x-6 gap-y-2 border-t border-[var(--rule)] pt-3 sm:grid-cols-3">
          <div>
            <dt className="text-[11px] font-medium text-[var(--ink-muted)]">Team</dt>
            <dd className="mt-0.5 text-[12px] text-[var(--ink)]">
              {activeCase.surgeon} · {activeCase.anaesthetist}
              <span className="block text-[11.5px] text-[var(--ink-muted)]">{activeCase.team}</span>
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium text-[var(--ink-muted)]">Set</dt>
            <dd className="mt-0.5 text-[12px] text-[var(--ink)]">{activeCase.set}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium text-[var(--ink-muted)]">Department</dt>
            <dd className="mt-0.5 text-[12px] text-[var(--ink)]">{room.department}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
