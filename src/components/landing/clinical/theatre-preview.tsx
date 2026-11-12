
import {
  ArrowUpRight,
  CheckCircle,
  Clock,
  DoorOpen,
  WarningCircle,
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

const statusOrder: CaseStatus[] = [
  'In progress',
  'Confirmed',
  'Delayed',
  'Scheduled',
  'Completed',
];

export function TheatrePreview() {
  const day = theatreDays[0];
  const selectedRoom = day.rooms[0];
  const activeCase = selectedRoom.cases[0];

  const totalCases = day.rooms.reduce(
    (total, room) => total + room.cases.length,
    0,
  );

  const completedCases = day.rooms.reduce(
    (total, room) =>
      total + room.cases.filter((entry) => entry.status === 'Completed').length,
    0,
  );

  const roomCount = day.rooms.length;

  return (
    <section
      aria-label="Illustrative MedOrch theatre schedule"
      className="overflow-hidden rounded-[18px] border border-rule bg-sheet shadow-[0_20px_55px_rgba(38,32,54,0.09)]"
    >
      {/* Product window heading */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-rule bg-sheet px-5 py-5 sm:px-7">
        <div className="flex items-center gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-primary-soft text-primary">
            <DoorOpen size={21} weight="duotone" aria-hidden="true" />
          </span>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[16px] font-semibold tracking-[-0.025em] text-ink">
                Theatre schedule
              </h3>
              <span className="rounded-full border border-rule px-2 py-0.5 font-mono text-[8px] tracking-[0.08em] text-ink-muted">
                DEMO
              </span>
            </div>

            <p className="mt-1 text-[11px] text-ink-muted">
              {day.label} <span className="mx-1 text-rule-strong">/</span>
              Daily operating plan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-ink-muted">
          <span className="h-2 w-2 rounded-full bg-success" />
          Sample workspace
        </div>
      </header>

      {/* Operational summary */}
      <div className="grid grid-cols-3 divide-x divide-rule border-b border-rule bg-surface-subtle/35">
        <SummaryItem
          label="Operating rooms"
          value={String(roomCount).padStart(2, '0')}
          detail="Listed today"
        />
        <SummaryItem
          label="Scheduled cases"
          value={String(totalCases).padStart(2, '0')}
          detail="Across all rooms"
        />
        <SummaryItem
          label="Completed"
          value={String(completedCases).padStart(2, '0')}
          detail="Recorded cases"
        />
      </div>

      {/* Timeline heading and legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-6 sm:px-7">
        <div>
          <p className="font-mono text-[9px] font-medium tracking-[0.13em] text-primary">
            THE OPERATING FLOOR
          </p>
          <h4 className="mt-1 text-[14px] font-semibold tracking-[-0.02em] text-ink">
            Room allocation
          </h4>
        </div>

        <span className="font-mono text-[9px] text-ink-subtle">
          08:00 — 16:00
        </span>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2 px-5 pb-4 pt-4 sm:px-7">
        {statusOrder.map((status) => (
          <span
            key={status}
            className="inline-flex items-center gap-1.5 text-[9px] text-ink-muted"
          >
            <span
              className={`h-2 w-2 rounded-[2px] ${statusStyle[status].dot}`}
              aria-hidden="true"
            />
            {status}
          </span>
        ))}
      </div>

      {/* Desktop timeline */}
      <div className="hidden px-7 pb-5 sm:block">
        <div className="overflow-hidden rounded-xl border border-rule">
          <div className="flex bg-surface-subtle/55">
            <div className="w-[126px] shrink-0 border-r border-rule px-4 py-3">
              <span className="font-mono text-[8px] tracking-[0.1em] text-ink-subtle">
                ROOM
              </span>
            </div>

            <div className="relative flex h-[42px] flex-1 items-center">
              {hourMarks.map((mark, index) => (
                <span
                  key={mark}
                  className={`absolute font-mono text-[9px] text-ink-muted ${index === 0
                      ? ''
                      : index === hourMarks.length - 1
                        ? '-translate-x-full'
                        : '-translate-x-1/2'
                    }`}
                  style={{ left: `${(mark / dayMinutes) * 100}%` }}
                >
                  {clock(mark)}
                </span>
              ))}
            </div>
          </div>

          {day.rooms.map((room, roomIndex) => {
            const state = roomStateStyle[room.state];
            const selected = room.code === selectedRoom.code;

            return (
              <div
                key={room.code}
                className={`flex border-t border-rule ${selected ? 'bg-primary-soft/20' : 'bg-sheet'
                  }`}
              >
                <div className="flex w-[126px] shrink-0 flex-col justify-center border-r border-rule px-4 py-3">
                  <span className="font-mono text-[11px] font-semibold text-ink">
                    {room.code}
                  </span>

                  <span className="mt-1 truncate text-[9px] text-ink-muted">
                    {room.name}
                  </span>

                  <span className={`mt-2 flex items-center gap-1.5 text-[9px] font-medium ${state.text}`}>
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${state.dot}`}
                      aria-hidden="true"
                    />
                    {room.state}
                  </span>
                </div>

                <div className="relative min-w-0 flex-1">
                  {hourMarks.map((mark) => (
                    <span
                      key={mark}
                      className="pointer-events-none absolute inset-y-0 w-px bg-rule/70"
                      style={{ left: `${(mark / dayMinutes) * 100}%` }}
                      aria-hidden="true"
                    />
                  ))}

                  <div className="relative h-[92px]">
                    {room.cases.map((entry) => {
                      const style = statusStyle[entry.status];
                      const isActive = entry.id === activeCase.id;

                      const left = (entry.start / dayMinutes) * 100;
                      const width = (entry.duration / dayMinutes) * 100;

                      return (
                        <div
                          key={entry.id}
                          title={`${entry.procedure} · ${clock(entry.start)}–${clock(entry.start + entry.duration)}`}
                          className={`absolute flex h-[46px] min-w-0 flex-col justify-center overflow-hidden rounded-r-[7px] border-l-[3px] px-2.5 transition-all duration-200 hover:brightness-[0.97] ${style.bar} ${isActive
                              ? 'top-[12px] z-10 shadow-[0_3px_12px_rgba(50,40,75,0.10)] ring-1 ring-primary/25'
                              : 'top-[12px]'
                            }`}
                          style={{
                            left: `calc(${left}% + 2px)`,
                            width: `calc(${width}% - 4px)`,
                          }}
                        >
                          <span className="truncate text-[9px] font-semibold">
                            {entry.short}
                          </span>

                          {width > 13 ? (
                            <span className="mt-0.5 truncate font-mono text-[8px] opacity-75">
                              {clock(entry.start)} · {durationLabel(entry.duration)}
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>

                  <span className="absolute bottom-2 left-3 font-mono text-[7px] text-ink-subtle">
                    FLOOR {String(roomIndex + 1).padStart(2, '0')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile schedule */}
      <div className="space-y-3 px-5 pb-5 sm:hidden">
        {day.rooms.map((room) => {
          const state = roomStateStyle[room.state];

          return (
            <article
              key={room.code}
              className="overflow-hidden rounded-xl border border-rule bg-sheet"
            >
              <div className="flex items-center justify-between gap-3 border-b border-rule px-3.5 py-3">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] font-semibold text-ink">
                    {room.code}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] text-ink-muted">
                    {room.name}
                  </p>
                </div>

                <span className={`flex shrink-0 items-center gap-1.5 text-[9px] font-medium ${state.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${state.dot}`} />
                  {room.state}
                </span>
              </div>

              <div className="space-y-3 px-3.5 py-3">
                {room.cases.map((entry) => {
                  const style = statusStyle[entry.status];
                  const isActive = entry.id === activeCase.id;

                  return (
                    <div
                      key={entry.id}
                      className={`flex items-start justify-between gap-3 rounded-lg p-2 ${isActive ? 'bg-primary-soft/40' : ''
                        }`}
                    >
                      <div className="flex min-w-0 items-start gap-2.5">
                        <span
                          className={`mt-1 h-2 w-2 shrink-0 rounded-[2px] ${style.dot}`}
                        />

                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-medium text-ink">
                            {entry.short}
                          </p>
                          <p className="mt-1 text-[9px] text-ink-muted">
                            {entry.status}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 pt-0.5 font-mono text-[9px] text-ink-muted">
                        {clock(entry.start)}–{clock(entry.start + entry.duration)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>

      {/* Selected case details */}
      <div className="border-t border-rule bg-[#f7f5fc] px-5 py-6 sm:px-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${statusStyle[activeCase.status].dot}`}
              />

              <span className={`text-[10px] font-semibold ${statusStyle[activeCase.status].text}`}>
                {activeCase.status}
              </span>

              <span className="text-ink-subtle">/</span>

              <span className="text-[10px] text-ink-muted">
                {activeCase.priority} priority
              </span>
            </div>

            <p className="mt-3 font-mono text-[8px] tracking-[0.12em] text-primary">
              SELECTED CASE · {activeCase.id}
            </p>

            <h4 className="mt-1.5 max-w-[520px] text-[clamp(1.3rem,2.2vw,1.8rem)] font-semibold leading-tight tracking-[-0.045em] text-ink">
              {activeCase.procedure}
            </h4>

            <p className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-ink-muted">
              <Clock size={13} aria-hidden="true" />
              {clock(activeCase.start)}–{clock(activeCase.start + activeCase.duration)}
              <span className="text-rule-strong">·</span>
              {durationLabel(activeCase.duration)}
              <span className="text-rule-strong">·</span>
              {selectedRoom.code}
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-rule bg-sheet px-3 py-2 text-[9px] font-medium text-ink-muted">
            <CheckCircle size={13} weight="fill" className="text-success" />
            Sample allocation
          </span>
        </div>

        <div className="mt-6 grid gap-4 border-t border-[#ded8e8] pt-5 sm:grid-cols-3">
          <DetailItem
            label="Surgical team"
            value={activeCase.surgeon}
            detail={activeCase.team}
          />

          <DetailItem
            label="Anaesthesia"
            value={activeCase.anaesthetist}
            detail="Assigned team"
          />

          <DetailItem
            label="Equipment set"
            value={activeCase.set}
            detail={selectedRoom.department}
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#ded8e8] pt-4">
          <p className="flex items-center gap-2 text-[9px] leading-relaxed text-ink-muted">
            <WarningCircle size={13} aria-hidden="true" />
            All displayed cases and allocations are synthetic.
          </p>

          <span className="inline-flex items-center gap-1 font-mono text-[8px] tracking-[0.1em] text-primary">
            MEDORCH PREVIEW
            <ArrowUpRight size={11} aria-hidden="true" />
          </span>
        </div>
      </div>
    </section>
  );
}

function SummaryItem({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="min-w-0 px-3 py-4 sm:px-7 sm:py-5">
      <p className="truncate text-[9px] font-medium text-ink-muted sm:text-[10px]">
        {label}
      </p>
      <p className="mt-1.5 font-mono text-[22px] font-medium leading-none tracking-[-0.06em] text-ink sm:text-[26px]">
        {value}
      </p>
      <p className="mt-1.5 truncate text-[8px] text-ink-subtle sm:text-[9px]">
        {detail}
      </p>
    </div>
  );
}

function DetailItem({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="min-w-0">
      <p className="font-mono text-[8px] font-medium tracking-[0.1em] text-ink-subtle">
        {label.toUpperCase()}
      </p>
      <p className="mt-1.5 text-[11px] font-semibold text-ink">
        {value}
      </p>
      <p className="mt-1 text-[9px] text-ink-muted">
        {detail}
      </p>
    </div>
  );
}
