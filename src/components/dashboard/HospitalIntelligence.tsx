'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';

/*======================================================================
  Hospital operations floor — the ADMIN workspace
  ======================================================================
  One composition, two bands, no dead canvas:

    ┌ command bar ────────────────────────────────────────────────────┐
    │ identity · date · the four numbers that decide the morning      │
    │ priority ribbon (only when a critical alert is open)            │
    ├──────────────────────────────────┬──────────────────────────────┤
    │ THEATRE SCHEDULE                 │ NEEDS A DECISION             │
    │ lane per theatre, blocks sized   │ unread alerts, severity rail │
    │ by real start/end, hour axis     │ + the emergency at the top   │
    ├───────────────┬──────────┬───────┴──────┬───────────────────────┤
    │ DEPARTMENT    │ NEXT TO  │ RESOURCES    │ EXCEPTIONS            │
    │ LOAD          │ START    │ readiness    │ what is broken        │
    └───────────────┴──────────┴──────────────┴───────────────────────┘

  Data comes from the same four endpoints the module always used
  (/api/ot-rooms, /api/schedules, /api/equipment, /api/alerts). No API,
  query, permission or Prisma model changed.
====================================================================== */

type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'DISABLED';

type Room = {
  id: string;
  name: string;
  code: string;
  status: RoomStatus;
  isActive: boolean;
  department?: { name: string } | null;
};

type Schedule = {
  id: string;
  procedure: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status: string;
  priority: string;
  department?: { name: string } | null;
  otRoom?: { name: string; code?: string } | null;
  patient?: { name?: string; patientCode?: string } | null;
};

type Equipment = { id: string; name: string; category: string; status: string };

type Alert = {
  id: string;
  title: string;
  message: string;
  severity: string;
  category: string;
  isRead: boolean;
  createdAt: string;
};

const DEPT_TONES = ['bg-primary', 'bg-[#087e8b]', 'bg-[#5b93b8]', 'bg-[#a7c4d8]'];

const ROOM_STATE: Record<RoomStatus, { label: string; dot: string; soft: string }> = {
  AVAILABLE: { label: 'Ready', dot: 'bg-success', soft: 'bg-primary-soft text-primary' },
  OCCUPIED: { label: 'In use', dot: 'bg-danger', soft: 'bg-danger-soft text-danger' },
  MAINTENANCE: { label: 'Service', dot: 'bg-warning', soft: 'bg-warning-soft text-warning' },
  DISABLED: { label: 'Offline', dot: 'bg-border-strong', soft: 'bg-surface-muted text-ink-muted' },
};

const SEVERITY = {
  CRITICAL: { rail: 'bg-danger', chip: 'bg-danger-soft text-danger', label: 'Critical' },
  WARNING: { rail: 'bg-warning', chip: 'bg-warning-soft text-warning', label: 'Warning' },
  INFO: { rail: 'bg-primary', chip: 'bg-primary-soft text-primary', label: 'Info' },
} as const;

function severityOf(value: string) {
  return value === 'CRITICAL' || value === 'WARNING' ? SEVERITY[value] : SEVERITY.INFO;
}

const pad = (n: number) => String(n).padStart(2, '0');

function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function minutesOf(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.getHours() * 60 + date.getMinutes();
}

function clock(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--:--';
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/* The axis follows the day's real work, not a fixed 08:00–18:00 guess. */
function axisFor(daySchedules: Schedule[]) {
  const starts = daySchedules.map((s) => minutesOf(s.startTime)).filter((m): m is number => m !== null);
  const ends = daySchedules.map((s) => minutesOf(s.endTime)).filter((m): m is number => m !== null);

  const from = starts.length ? Math.min(...starts) : 8 * 60;
  const to = ends.length ? Math.max(...ends) : 18 * 60;

  const startHour = Math.max(0, Math.floor(from / 60) - 1);
  const endHour = Math.min(24, Math.ceil(to / 60) + 1);
  const span = (endHour - startHour) * 60 || 60;

  return { startHour, endHour, span, pct: (minutes: number) => ((minutes - startHour * 60) / span) * 100 };
}

function PanelHeader({
  id,
  title,
  aside,
}: {
  id: string;
  title: string;
  aside?: React.ReactNode;
}) {
  return (
    <header className="border-rule-soft flex items-baseline justify-between gap-2 border-b px-4 py-2.5">
      <h2 id={id} className="text-ink text-[12.5px] font-semibold">
        {title}
      </h2>
      {aside}
    </header>
  );
}

export function HospitalIntelligence() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const results = await Promise.allSettled([
          apiClient.get<Room[]>('/api/ot-rooms'),
          apiClient.get<Schedule[]>('/api/schedules'),
          apiClient.get<Equipment[]>('/api/equipment'),
          apiClient.get<Alert[]>('/api/alerts'),
        ]);

        if (cancelled) return;

        setRooms(results[0].status === 'fulfilled' ? (results[0].value ?? []) : []);
        setSchedules(results[1].status === 'fulfilled' ? (results[1].value ?? []) : []);
        setEquipment(results[2].status === 'fulfilled' ? (results[2].value ?? []) : []);
        setAlerts(results[3].status === 'fulfilled' ? (results[3].value ?? []) : []);
        setError('');
      } catch {
        if (!cancelled) setError('Unable to assemble the operations floor.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const key = todayKey();

  const view = useMemo(() => {
    const activeRooms = rooms.filter((r) => r.isActive);
    const today = schedules.filter((s) => s.scheduledDate.slice(0, 10) === key);
    const axis = axisFor(today);

    const lanes = activeRooms.map((room) => ({
      room,
      cases: today.filter((s) => s.otRoom?.code === room.code),
    }));

    const running = today.filter((s) => s.status === 'IN_PROGRESS');
    const queued = today
      .filter((s) => s.status === 'CONFIRMED' || s.status === 'SCHEDULED')
      .slice()
      .sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime));
    const finished = today.filter((s) => s.status === 'COMPLETED');

    const byDepartment = new Map<string, number>();
    for (const s of today) {
      const name = s.department?.name ?? 'Unassigned';
      byDepartment.set(name, (byDepartment.get(name) ?? 0) + 1);
    }
    const departments = [...byDepartment.entries()].sort((a, b) => b[1] - a[1]);
    const maxDepartment = Math.max(1, ...departments.map(([, n]) => n));

    const unread = alerts.filter((a) => !a.isRead);
    const critical = unread.filter((a) => a.severity === 'CRITICAL');
    const orderedAlerts = alerts
      .slice()
      .sort((a, b) => {
        if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
        return Date.parse(b.createdAt) - Date.parse(a.createdAt);
      })
      .slice(0, 4);

    const available = equipment.filter((e) => String(e.status).toUpperCase().includes('AVAIL')).length;

    const exceptions = [
      ...activeRooms
        .filter((r) => r.status !== 'AVAILABLE' && r.status !== 'OCCUPIED')
        .map((r) => ({
          id: r.id,
          tone: ROOM_STATE[r.status].soft,
          label: `${r.code} ${ROOM_STATE[r.status].label.toLowerCase()}`,
          detail: r.department?.name ?? 'No department',
        })),
      ...queued
        .filter((s) => s.priority === 'EMERGENCY')
        .map((s) => ({
          id: s.id,
          tone: 'bg-danger-soft text-danger',
          label: 'Emergency case queued',
          detail: s.procedure,
        })),
    ];

    // Utilisation counts only theatres that could run a case; a room under
    // maintenance with work booked against it is an exception, not capacity.
    const usableRooms = activeRooms.filter((r) => r.status === 'AVAILABLE' || r.status === 'OCCUPIED');
    const bookedRooms = new Set(
      today.map((s) => s.otRoom?.code).filter((code): code is string => Boolean(code)),
    );
    const busyRooms = usableRooms.filter((r) => bookedRooms.has(r.code));

    return {
      activeRooms,
      lanes,
      axis,
      today,
      running,
      queued,
      finished,
      departments,
      maxDepartment,
      unread,
      critical,
      orderedAlerts,
      available,
      exceptions,
      busy: busyRooms.length,
      usable: usableRooms.length,
      nextCase: queued[0],
    };
  }, [rooms, schedules, equipment, alerts, key]);

  if (loading) return <LoadingState message="Assembling the operations floor…" />;
  if (error) return <ErrorState message={error} />;

  const nowPct = view.axis.pct(now.getHours() * 60 + now.getMinutes());
  const nowVisible = nowPct >= 0 && nowPct <= 100;

  const hourTicks: number[] = [];
  for (let h = view.axis.startHour; h <= view.axis.endHour; h += 1) hourTicks.push(h);

  const dateLabel = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).format(now);

  return (
    <main className="space-y-4">
      {/* ── Command bar ─────────────────────────────────────────────── */}
      <section className="bg-ink overflow-hidden rounded-[var(--radius-panel)] text-white shadow-[0_18px_44px_-28px_rgba(17,25,22,0.7)]">
        <div className="flex flex-wrap items-end justify-between gap-6 px-6 py-5">
          <div>
            <p className="text-brass inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.16em] uppercase">
              <span className="bg-brass h-1.5 w-1.5 animate-pulse rounded-full" aria-hidden="true" />
              Live · Department control
            </p>
            <h1 className="display mt-2 text-[clamp(1.9rem,2.4vw,2.4rem)] leading-[1.02]">
              Hospital <em className="italic">operations</em>
            </h1>
            <p className="mt-1.5 text-[13px] text-white/55">
              {dateLabel} · {view.today.length} cases across {view.activeRooms.length} theatres
            </p>
          </div>

          <dl className="flex flex-wrap items-end gap-x-8 gap-y-4">
            <div className="min-w-[5.5rem]">
              <dt className="text-[10px] font-semibold tracking-[0.12em] text-white/45 uppercase">Ready</dt>
              <dd className="display mt-1 text-[1.8rem] leading-none tabular-nums">
                {view.activeRooms.filter((r) => r.status === 'AVAILABLE').length}
                <span className="ml-1 font-sans text-[11px] tracking-normal text-white/40">
                  /{view.activeRooms.length}
                </span>
              </dd>
            </div>
            <div className="min-w-[5.5rem]">
              <dt className="text-[10px] font-semibold tracking-[0.12em] text-white/45 uppercase">Running</dt>
              <dd className="display mt-1 text-[1.8rem] leading-none tabular-nums">
                {view.running.length}
                <span className="ml-1 font-sans text-[11px] tracking-normal text-white/40">now</span>
              </dd>
            </div>
            <div className="min-w-[5.5rem]">
              <dt className="text-[10px] font-semibold tracking-[0.12em] text-white/45 uppercase">Open alerts</dt>
              <dd className="display mt-1 text-[1.8rem] leading-none tabular-nums">
                {view.unread.length}
                <span className="ml-1 font-sans text-[11px] tracking-normal text-white/40">
                  {view.critical.length ? `${view.critical.length} critical` : 'none critical'}
                </span>
              </dd>
            </div>
            <div className="min-w-[5.5rem]">
              <dt className="text-[10px] font-semibold tracking-[0.12em] text-white/45 uppercase">Theatres busy</dt>
              <dd className="display mt-1 text-[1.8rem] leading-none tabular-nums">
                {view.busy}
                <span className="ml-1 font-sans text-[11px] tracking-normal text-white/40">
                  /{view.usable} usable
                </span>
              </dd>
            </div>
          </dl>
        </div>

        {view.critical.length > 0 ? (
          <div className="bg-danger/20 border-danger/40 flex flex-wrap items-center gap-x-4 gap-y-1 border-t px-6 py-2.5">
            <span className="bg-danger rounded-full px-2 py-0.5 text-[10px] font-bold tracking-[0.1em] text-white uppercase">
              Priority
            </span>
            <p className="min-w-0 flex-1 truncate text-[13px] text-white/90">
              <span className="font-semibold">{view.critical[0].title}</span>
              <span className="text-white/50"> — {view.critical[0].message}</span>
            </p>
            <Link
              href="/alerts"
              className="text-[12px] font-semibold text-white underline decoration-white/30 underline-offset-4 hover:decoration-white"
            >
              Respond
            </Link>
          </div>
        ) : null}
      </section>

      {/* ── Band one: the board and the decision rail ───────────────── */}
      <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)]">
        <section aria-labelledby="theatre-board" className="panel-flush flex flex-col">
          <header className="border-rule-soft flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3">
            <div>
              <h2 id="theatre-board" className="text-ink text-[13px] font-semibold">
                Theatre schedule
              </h2>
              <p className="text-ink-subtle mt-0.5 text-[11px]">
                {view.running.length} in progress · {view.queued.length} to start ·{' '}
                {view.finished.length} complete
              </p>
            </div>

            <div className="text-ink-muted flex flex-wrap items-center gap-3 text-[10.5px]">
              <span className="inline-flex items-center gap-1.5">
                <span className="bg-primary h-2 w-2 rounded-full" aria-hidden="true" /> scheduled
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="bg-danger h-2 w-2 rounded-full" aria-hidden="true" /> emergency
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="bg-border-strong h-2 w-2 rounded-full" aria-hidden="true" /> complete
              </span>
            </div>
          </header>

          {view.activeRooms.length === 0 ? (
            <p className="text-ink-muted px-5 py-10 text-center text-[13px]">
              No active theatres configured.
            </p>
          ) : (
            <>
            <ul className="divide-rule-soft divide-y md:hidden">
              {view.lanes.map(({ room, cases }) => {
                const state = ROOM_STATE[room.status];

                return (
                  <li key={room.id} className="px-4 py-2.5">
                    <p className="text-ink flex items-center gap-1.5 text-[12px] font-semibold">
                      <span className={`${state.dot} h-1.5 w-1.5 rounded-full`} aria-hidden="true" />
                      {room.code}
                      <span className="text-ink-subtle font-normal">· {state.label}</span>
                    </p>
                    {cases.length === 0 ? (
                      <p className="text-ink-subtle mt-1 text-[11px]">No cases booked</p>
                    ) : (
                      <>
                        {cases.map((item) => (
                        <p
                          key={item.id}
                          className="text-ink-secondary mt-1 flex items-baseline gap-2 text-[11.5px]"
                        >
                          <span className="font-mono text-[10.5px] tabular-nums">
                            {clock(item.startTime)}–{clock(item.endTime)}
                          </span>
                          <span className="min-w-0 flex-1 truncate">{item.procedure}</span>
                        </p>
                        ))}
                      </>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="hidden flex-1 overflow-x-auto md:block">
              <div className="min-w-[680px] px-5 pt-4 pb-4">
                <div className="relative ml-[8.5rem] h-5">
                  {hourTicks.map((hour) => (
                    <span
                      key={hour}
                      className="text-ink-subtle absolute -translate-x-1/2 font-mono text-[10px] tabular-nums"
                      style={{ left: `${view.axis.pct(hour * 60)}%` }}
                    >
                      {pad(hour)}:00
                    </span>
                  ))}
                </div>

                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-0 left-[8.5rem]">
                    {hourTicks.map((hour) => (
                      <span
                        key={hour}
                        className="bg-rule-soft absolute top-0 bottom-0 w-px"
                        style={{ left: `${view.axis.pct(hour * 60)}%` }}
                        aria-hidden="true"
                      />
                    ))}

                    {nowVisible ? (
                      <span
                        className="bg-brass absolute top-0 bottom-0 w-px"
                        style={{ left: `${nowPct}%` }}
                        aria-hidden="true"
                      />
                    ) : null}
                  </div>

                  {view.lanes.map(({ room, cases }) => {
                    const state = ROOM_STATE[room.status];

                    return (
                      <div
                        key={room.id}
                        className="border-rule-soft flex items-center gap-3 border-t py-2 first:border-t-0"
                      >
                        <div className="w-[8.5rem] shrink-0 pr-2">
                          <p className="text-ink flex items-center gap-1.5 text-[12px] font-semibold">
                            <span className={`${state.dot} h-1.5 w-1.5 rounded-full`} aria-hidden="true" />
                            {room.code}
                          </p>
                          <p className="text-ink-subtle mt-0.5 truncate text-[10.5px]">
                            {state.label} · {room.department?.name ?? 'Unassigned'}
                          </p>
                        </div>

                        <div className="bg-surface-subtle relative h-14 flex-1 rounded-[6px]">
                          {cases.length === 0 ? (
                            <span className="text-ink-subtle absolute inset-0 flex items-center pl-3 text-[11px]">
                              No cases booked
                            </span>
                          ) : (
                            cases.map((item) => {
                              const start = minutesOf(item.startTime);
                              const end = minutesOf(item.endTime);
                              if (start === null || end === null) return null;

                              const left = view.axis.pct(start);
                              const width = Math.max(7, view.axis.pct(end) - left);
                              const emergency = item.priority === 'EMERGENCY';
                              const done = item.status === 'COMPLETED';
                              const tone = done
                                ? 'bg-border-strong/80 text-white'
                                : emergency
                                  ? 'bg-danger text-white'
                                  : 'bg-primary text-white';

                              return (
                                <div
                                  key={item.id}
                                  title={`${item.procedure} · ${clock(item.startTime)}–${clock(item.endTime)}`}
                                  className={`${tone} absolute top-1.5 bottom-1.5 overflow-hidden rounded-[5px] px-2 py-1 shadow-sm`}
                                  style={{ left: `${left}%`, width: `${width}%` }}
                                >
                                  <p className="truncate text-[10.5px] leading-tight font-semibold">
                                    {item.procedure}
                                  </p>
                                  <p className="truncate font-mono text-[9.5px] text-white/70 tabular-nums">
                                    {clock(item.startTime)}–{clock(item.endTime)}
                                  </p>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="text-ink-subtle mt-3 pl-[8.5rem] text-[10.5px]">
                  Axis {pad(view.axis.startHour)}:00–{pad(view.axis.endHour)}:00 · blocks sized by real
                  case duration
                </p>
              </div>
            </div>
            </>
          )}
        </section>

        <section aria-labelledby="priority" className="panel-flush flex flex-col">
          <PanelHeader
            id="priority"
            title="Needs a decision"
            aside={
              <Link href="/alerts" className="text-primary text-[11px] font-semibold">
                All alerts →
              </Link>
            }
          />

          <ul className="divide-rule-soft flex-1 divide-y">
            {view.orderedAlerts.length === 0 ? (
              <li className="text-ink-muted px-4 py-8 text-center text-[12px]">
                Nothing outstanding.
              </li>
            ) : (
              view.orderedAlerts.map((alert) => {
                const tone = severityOf(alert.severity);

                return (
                  <li key={alert.id} className="hover:bg-surface-subtle flex gap-3 px-4 py-3 transition-colors">
                    <span className={`${tone.rail} mt-0.5 w-[3px] shrink-0 rounded-full`} aria-hidden="true" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`${tone.chip} rounded-full px-1.5 py-0.5 text-[9.5px] font-bold tracking-[0.06em] uppercase`}
                        >
                          {tone.label}
                        </span>
                        <span className="text-ink-subtle font-mono text-[10px]">{clock(alert.createdAt)}</span>
                        {alert.isRead ? <span className="text-ink-subtle text-[10px]">read</span> : null}
                      </div>
                      <p className="text-ink mt-1 text-[12.5px] leading-snug font-semibold">{alert.title}</p>
                      <p className="text-ink-muted mt-0.5 text-[11px]">{alert.message}</p>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </section>
      </div>

      {/* ── Band two: four operational registers across the full width ─ */}
      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <section aria-labelledby="departments" className="panel overflow-hidden">
          <PanelHeader
            id="departments"
            title="Load by department"
            aside={
              <span className="text-ink-subtle font-mono text-[10.5px]">
                {view.departments.length} departments
              </span>
            }
          />

          {view.departments.length === 0 ? (
            <p className="text-ink-muted mt-3 text-[13px]">No cases booked today.</p>
          ) : (
            <div className="mt-4 px-4 pb-4">
              <div
                className="bg-surface-muted flex h-3.5 w-full gap-[2px] overflow-hidden rounded-[4px]"
                role="img"
                aria-label="Share of today's cases by department"
              >
                {view.departments.map(([name, count], index) => (
                  <span
                    key={name}
                    className={DEPT_TONES[index % DEPT_TONES.length]}
                    style={{ width: `${(count / view.today.length) * 100}%` }}
                    title={`${name}: ${count}`}
                  />
                ))}
              </div>

              <ul className="mt-3 space-y-2">
                {view.departments.map(([name, count], index) => (
                  <li key={name} className="flex min-w-0 items-center gap-2.5">
                    <span
                      className={`${DEPT_TONES[index % DEPT_TONES.length]} h-2 w-2 shrink-0 rounded-[2px]`}
                      aria-hidden="true"
                    />
                    <span className="text-ink-secondary min-w-0 flex-1 truncate text-[12.5px]">
                      {name}
                    </span>
                    <span className="text-ink shrink-0 font-mono text-[11.5px] tabular-nums">
                      {count}
                    </span>
                  </li>
                ))}
              </ul>

              <p className="text-ink-subtle mt-3 text-[10.5px]">
                {view.today.length} booked cases · largest list {view.maxDepartment}
              </p>
            </div>
          )}
        </section>

        <section aria-labelledby="queue" className="panel">
          <PanelHeader
            id="queue"
            title="Next to start"
            aside={<span className="text-ink-subtle font-mono text-[10.5px]">{view.queued.length} queued</span>}
          />

          {view.queued.length === 0 ? (
            <p className="text-ink-muted mt-3 text-[13px]">Nothing queued.</p>
          ) : (
            <ol className="mt-2 space-y-2">
              {view.queued.slice(0, 3).map((item, index) => (
                <li key={item.id} className="border-rule-soft flex items-baseline gap-2.5 border-b pb-2 last:border-0 last:pb-0">
                  <span className="text-ink-subtle font-mono text-[10px]">{pad(index + 1)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-ink truncate text-[12px] font-semibold">{item.procedure}</p>
                    <p className="text-ink-muted truncate text-[10.5px]">
                      {item.otRoom?.code ?? 'Unassigned'} · {item.department?.name ?? 'Unassigned'}
                    </p>
                  </div>
                  <span className="text-ink font-mono text-[11px] tabular-nums">{clock(item.startTime)}</span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section aria-labelledby="resources" className="panel">
          <PanelHeader
            id="resources"
            title="Resource readiness"
            aside={
              <span className="text-ink-subtle font-mono text-[10.5px]">
                {view.available}/{equipment.length}
              </span>
            }
          />

          <ul className="divide-rule-soft mt-1 divide-y">
            {equipment.map((item) => {
              const ready = String(item.status).toUpperCase().includes('AVAIL');
              const busy = String(item.status).toUpperCase().includes('USE');

              return (
                <li key={item.id} className="flex items-center gap-2 px-1 py-[6px]">
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                      ready ? 'bg-success' : busy ? 'bg-warning' : 'bg-danger'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="text-ink-secondary min-w-0 flex-1 truncate text-[11.5px]">{item.name}</span>
                  <span className="text-ink-subtle font-mono text-[10px]">
                    {String(item.status).replace('_', ' ').toLowerCase()}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="exceptions" className="panel">
          <PanelHeader
            id="exceptions"
            title="Exceptions"
            aside={<span className="text-ink-subtle font-mono text-[10.5px]">{view.exceptions.length}</span>}
          />

          {view.exceptions.length === 0 ? (
            <p className="text-ink-muted mt-3 text-[12px]">No operational exceptions.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {view.exceptions.map((item) => (
                <li key={item.id} className="flex items-start gap-2">
                  <span
                    className={`${item.tone} mt-px shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase`}
                  >
                    !
                  </span>
                  <div className="min-w-0">
                    <p className="text-ink text-[11.5px] leading-tight font-semibold">{item.label}</p>
                    <p className="text-ink-muted mt-0.5 truncate text-[10.5px]">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
