import {
  CheckCircle,
  Clock,
  DoorOpen,
  Warning,
} from '@phosphor-icons/react/dist/ssr';

import {
  clock,
  dayMinutes,
  durationLabel,
  roomStateStyle,
  statusStyle,
  theatreDays,
  type CaseStatus,
} from './clinical-data';

const hourMarks = [0, 120, 240, 360, 480];
const statusOrder: CaseStatus[] = ['In progress', 'Confirmed', 'Scheduled', 'Completed'];

export function TheatrePreview() {
  const day = theatreDays[0];
  const selectedRoom = day.rooms[0];
  const activeCase = selectedRoom.cases[0];

  return (
    <section
      aria-label="MedOrch theatre day preview"
      className="border-rule bg-sheet overflow-hidden border"
    >
      <header className="border-rule flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <span className="bg-primary-soft text-primary flex h-8 w-8 items-center justify-center rounded-[6px]">
            <DoorOpen size={16} weight="duotone" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-ink text-[15px] font-semibold">Theatre day</h3>
            <p className="text-ink-subtle mt-0.5 text-[10.5px]">
              {day.label} · illustrative schedule
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="border-rule text-ink-muted hidden border px-2.5 py-1 font-mono text-[9px] sm:inline">
            4 THEATRES · 08:00–16:00
          </span>
          <span className="text-ink-subtle font-mono text-[9px]">UPDATED {day.updated}</span>
        </div>
      </header>

      <div className="border-rule-soft flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2 sm:px-5">
        <p className="text-ink-secondary text-[10px] font-medium">
          {selectedRoom.name} · selected case
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {statusOrder.map((status) => (
            <span key={status} className="text-ink-muted flex items-center gap-1 text-[8.5px]">
              <span
                className={`${statusStyle[status].dot} h-1 w-1 rounded-full`}
                aria-hidden="true"
              />
              {status}
            </span>
          ))}
        </div>
      </div>

      {/* Desktop timeline */}
      <div className="hidden px-4 pt-3 sm:block sm:px-5">
        <div className="border-rule-soft flex border-b pb-1.5">
          <div className="text-ink-subtle w-[112px] shrink-0 text-[9px] font-medium">Room</div>
          <div className="relative flex-1">
            {hourMarks.map((mark, index) =>
              index === hourMarks.length - 1 ? (
                <span key={mark} className="text-ink-subtle absolute right-0 font-mono text-[9.5px]">
                  {clock(mark)}
                </span>
              ) : (
                <span
                  key={mark}
                  className="text-ink-subtle absolute -translate-x-1/2 font-mono text-[9.5px] first:translate-x-0"
                  style={{ left: `${(mark / dayMinutes) * 100}%` }}
                >
                  {clock(mark)}
                </span>
              ),
            )}
          </div>
        </div>

        {day.rooms.map((room) => {
          const state = roomStateStyle[room.state];
          const isSelectedRoom = room.code === selectedRoom.code;

          return (
            <div
              key={room.code}
              className={`border-rule-soft flex border-b last:border-b-0 ${isSelectedRoom ? 'bg-surface-subtle/50' : 'bg-sheet'
                }`}
            >
              <div className="border-rule-soft flex w-[112px] shrink-0 flex-col justify-center border-r px-3 py-3">
                <span className="text-ink font-mono text-[11px] font-semibold">{room.code}</span>
                <span className={`mt-1 flex items-center gap-1 text-[9px] ${state.text}`}>
                  <span className={`h-1 w-1 rounded-full ${state.dot}`} aria-hidden="true" />
                  {room.state}
                </span>
              </div>

              <div className="relative h-[62px] flex-1">
                {hourMarks.map((mark) => (
                  <span
                    key={mark}
                    className="bg-rule-soft absolute inset-y-0 w-px"
                    style={{ left: `${(mark / dayMinutes) * 100}%` }}
                    aria-hidden="true"
                  />
                ))}

                {room.cases.map((entry) => {
                  const style = statusStyle[entry.status];
                  const selected = entry.id === activeCase.id;
                  return (
                    <div
                      key={entry.id}
                      title={`${entry.procedure} · ${clock(entry.start)}–${clock(entry.start + entry.duration)}`}
                      className={`absolute top-[12px] flex h-[38px] items-center overflow-hidden border-l-2 px-2 ${style.bar} ${selected ? 'outline-primary outline-1 outline-offset-1' : ''
                        }`}
                      style={{
                        left: `calc(${(entry.start / dayMinutes) * 100}% + 2px)`,
                        width: `calc(${(entry.duration / dayMinutes) * 100}% - 4px)`,
                      }}
                    >
                      <span className="truncate text-[10px] font-semibold">{entry.short}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile stacked day */}
      <div className="sm:hidden">
        {day.rooms.map((room) => {
          const state = roomStateStyle[room.state];
          return (
            <div key={room.code} className="border-rule-soft border-b px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-ink font-mono text-[11px] font-semibold">{room.code}</span>
                  <span className="text-ink-muted text-[11px]">{room.name}</span>
                </div>
                <span className={`flex items-center gap-1 text-[8.5px] ${state.text}`}>
                  <span className={`h-1 w-1 rounded-full ${state.dot}`} aria-hidden="true" />
                  {room.state}
                </span>
              </div>
              <div className="mt-2 space-y-1.5">
                {room.cases.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusStyle[entry.status].dot}`}
                        aria-hidden="true"
                      />
                      <span className="text-ink-secondary truncate text-[11px]">{entry.short}</span>
                    </span>
                    <span className="text-ink-subtle shrink-0 font-mono text-[9.5px]">
                      {clock(entry.start)}–{clock(entry.start + entry.duration)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-surface-subtle/45 border-rule border-t p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${statusStyle[activeCase.status].dot}`} aria-hidden="true" />
              <span className={`text-[10px] font-semibold ${statusStyle[activeCase.status].text}`}>
                {activeCase.status}
              </span>
              <span className="text-ink-subtle text-[9px]">·</span>
              <span className="text-ink-muted text-[9.5px]">{activeCase.priority}</span>
              <span className="text-ink-subtle font-mono text-[8px]">{activeCase.id}</span>
            </div>
            <h4 className="font-display text-ink mt-2 text-[24px] leading-tight font-medium">
              {activeCase.procedure}
            </h4>
            <p className="text-ink-muted mt-1.5 font-mono text-[10px]">
              {clock(activeCase.start)}–{clock(activeCase.start + activeCase.duration)} ·{' '}
              {durationLabel(activeCase.duration)} · {selectedRoom.code}
            </p>
          </div>

          <div className="border-rule bg-sheet flex items-center gap-2 border px-2.5 py-2">
            <CheckCircle size={14} weight="fill" className="text-success" aria-hidden="true" />
            <div>
              <p className="text-ink text-[10px] font-semibold">No resource conflict</p>
              <p className="text-ink-subtle mt-0.5 font-mono text-[7.5px]">ROOM · SURGEON · PATIENT</p>
            </div>
          </div>
        </div>

        <dl className="border-rule mt-3 grid gap-x-6 gap-y-2 border-t pt-3 sm:grid-cols-3">
          <div>
            <dt className="text-ink-subtle text-[8.5px] font-medium">Theatre team</dt>
            <dd className="text-ink-secondary mt-1 text-[9.5px] leading-relaxed">
              {activeCase.surgeon} · {activeCase.anaesthetist}
              <span className="text-ink-subtle mt-0.5 block text-[8.5px]">{activeCase.team}</span>
            </dd>
          </div>
          <div>
            <dt className="text-ink-subtle text-[8.5px] font-medium">Assigned set</dt>
            <dd className="text-ink-secondary mt-1 text-[9.5px]">{activeCase.set}</dd>
          </div>
          <div>
            <dt className="text-ink-subtle text-[8.5px] font-medium">Department</dt>
            <dd className="text-ink-secondary mt-1 text-[9.5px]">{selectedRoom.department}</dd>
          </div>
        </dl>

        <div className="border-rule mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-2.5">
          <span className="text-ink-subtle flex items-center gap-1 text-[9px]">
            <Clock size={11} aria-hidden="true" />
            Positioned by recorded times
          </span>
          <span className="text-ink-subtle flex items-center gap-1 text-[9px]">
            <Warning size={11} aria-hidden="true" />
            Delayed and cancelled stay visible
          </span>
          <span className="text-ink-subtle ml-auto font-mono text-[8.5px]">
            ILLUSTRATIVE · NO PATIENT DATA
          </span>
        </div>
      </div>
    </section>
  );
}
