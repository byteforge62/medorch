import { CheckCircle, Clock } from '@phosphor-icons/react/dist/ssr';

import {
  clock,
  dayMinutes,
  durationLabel,
  roomStateStyle,
  statusStyle,
  theatreDays,
} from './clinical-data';

/*======================================================================
  Hero day sheet
  ======================================================================
  The compact reading of the same synthetic theatre day used by the full
  scheduling surface below. Rendering from the shared data keeps the hero
  honest: the selected case is actually in its lane, at its recorded time.
====================================================================== */

const hourMarks = [0, 120, 240, 360, 480];

export function DayBoard() {
  const day = theatreDays[0];
  const selectedRoom = day.rooms[0];
  const selectedCase = selectedRoom.cases[0];

  return (
    <section
      aria-label="Illustrative theatre day"
      className="border-rule bg-sheet relative w-full overflow-hidden rounded-[18px] border shadow-[0_28px_70px_rgba(41,36,61,0.14)]"
    >
      <header className="border-rule flex items-center justify-between gap-3 border-b px-4 py-3.5 sm:px-5">
        <div className="flex items-baseline gap-2.5">
          <p className="font-display text-ink text-[18px] leading-none font-medium">Theatre day</p>
          <span className="text-ink-subtle text-[10.5px]">{day.label}</span>
        </div>
        <span className="border-rule text-ink-muted rounded-full border px-2.5 py-1 font-mono text-[8.5px] tracking-[0.08em]">
          ILLUSTRATIVE
        </span>
      </header>

      <div className="border-rule-soft flex border-b px-4 py-2.5 sm:px-5">
        <span className="text-ink-subtle w-[86px] shrink-0 text-[9.5px] font-semibold">Room</span>
        <div className="relative flex-1">
          {hourMarks.map((mark, index) => (
            <span
              key={mark}
              className="text-ink-subtle absolute -translate-x-1/2 font-mono text-[9px] first:translate-x-0 last:-translate-x-full"
              style={{ left: `${index * 25}%` }}
            >
              {clock(mark)}
            </span>
          ))}
        </div>
      </div>

      <div>
        {day.rooms.map((room) => {
          const state = roomStateStyle[room.state];

          return (
            <div
              key={room.code}
              className="border-rule-soft grid min-h-[58px] grid-cols-[86px_minmax(0,1fr)] border-b last:border-b-0"
            >
              <div className="border-rule-soft flex flex-col justify-center border-r px-3 py-2">
                <span className="text-ink font-mono text-[10px] font-semibold">{room.code}</span>
                <span className={`mt-0.5 flex items-center gap-1 text-[9px] ${state.text}`}>
                  <span className={`h-1 w-1 rounded-full ${state.dot}`} aria-hidden="true" />
                  {room.state}
                </span>
              </div>

              <div className="bg-[linear-gradient(to_right,var(--rule-soft)_1px,transparent_1px)] bg-[size:25%_100%] relative min-h-[58px]">
                {room.cases.map((entry) => (
                  <div
                    key={entry.id}
                    title={`${entry.procedure} · ${clock(entry.start)}–${clock(entry.start + entry.duration)}`}
                    className={`absolute top-[10px] h-[37px] overflow-hidden rounded-[5px] border-l-2 px-1.5 py-1 ${statusStyle[entry.status].bar}`}
                    style={{
                      left: `${(entry.start / dayMinutes) * 100}%`,
                      width: `${(entry.duration / dayMinutes) * 100}%`,
                    }}
                  >
                    <p className="truncate text-[9px] leading-tight font-semibold">{entry.short}</p>
                    <p className="mt-0.5 truncate font-mono text-[8.5px]">
                      {clock(entry.start)}–{clock(entry.start + entry.duration)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-surface-subtle px-4 py-4 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${statusStyle[selectedCase.status].dot}`} aria-hidden="true" />
              <span className={`text-[10px] font-semibold ${statusStyle[selectedCase.status].text}`}>
                {selectedCase.status}
              </span>
              <span className="text-ink-subtle text-[9px]">·</span>
              <span className="text-ink-muted text-[10px]">{selectedCase.priority}</span>
            </div>
            <p className="font-display text-ink mt-1.5 truncate text-[18px] leading-tight font-medium">
              {selectedCase.procedure}
            </p>
            <p className="text-ink-muted mt-1 font-mono text-[9.5px]">
              {clock(selectedCase.start)}–{clock(selectedCase.start + selectedCase.duration)} ·{' '}
              {durationLabel(selectedCase.duration)} · {selectedRoom.code}
            </p>
          </div>
          <span className="bg-primary-soft text-primary shrink-0 rounded-full px-2.5 py-1 text-[9px] font-semibold">
            Confirmed
          </span>
        </div>

        <dl className="border-rule mt-3 grid grid-cols-3 gap-2 border-t pt-3">
          {[
            ['Theatre', selectedRoom.name],
            ['Anaesthesia', selectedCase.anaesthetist],
            ['Set', selectedCase.set],
          ].map(([term, value]) => (
            <div key={term} className="min-w-0">
              <dt className="text-ink-subtle text-[8.5px]">{term}</dt>
              <dd className="text-ink-secondary mt-0.5 truncate text-[9.5px] font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="border-rule text-ink-subtle flex flex-wrap items-center justify-between gap-2 border-t px-4 py-2.5 text-[8.5px] sm:px-5">
        <span className="flex items-center gap-1.5">
          <Clock size={10} aria-hidden="true" />
          Positioned by recorded start and end times
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle size={10} weight="fill" className="text-success" aria-hidden="true" />
          No patient record shown
        </span>
      </div>
    </section>
  );
}
