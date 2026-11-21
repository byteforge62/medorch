import { Clock, Warning } from '@phosphor-icons/react/dist/ssr';

import { Badge } from '@/components/ui/Badge';

/*======================================================================
  Theatre day — product panel
  ======================================================================
  What an administrator or OT coordinator opens first: the day's list by
  theatre lane, with the six case states the product actually records.
  Sample names and times; the conflict line is the guard the service and
  the database both enforce.
====================================================================== */

type Case = {
  window: string;
  procedure: string;
  surgeon: string;
  team: string;
  variant: 'success' | 'surgery' | 'scheduled' | 'warning' | 'neutral';
  label: string;
};

const lanes: { room: string; department: string; state: 'In use' | 'Available'; cases: Case[] }[] = [
  {
    room: 'OT-01',
    department: 'General surgery',
    state: 'In use',
    cases: [
      {
        window: '08:00–09:30',
        procedure: 'Inguinal hernia repair',
        surgeon: 'Dr. A. Rao',
        team: '4 staff',
        variant: 'success',
        label: 'Completed',
      },
      {
        window: '09:45–11:20',
        procedure: 'Laparoscopic cholecystectomy',
        surgeon: 'Dr. A. Rao',
        team: '4 staff',
        variant: 'surgery',
        label: 'In progress',
      },
      {
        window: '11:40–13:00',
        procedure: 'Sigmoid colectomy',
        surgeon: 'Dr. S. Lin',
        team: '5 staff',
        variant: 'scheduled',
        label: 'Confirmed',
      },
    ],
  },
  {
    room: 'OT-02',
    department: 'Orthopaedics',
    state: 'In use',
    cases: [
      {
        window: '08:15–10:05',
        procedure: 'Total knee replacement',
        surgeon: 'Dr. M. Khan',
        team: '6 staff',
        variant: 'warning',
        label: 'Delayed',
      },
      {
        window: '10:30–12:15',
        procedure: 'Shoulder arthroscopy',
        surgeon: 'Dr. M. Khan',
        team: '4 staff',
        variant: 'scheduled',
        label: 'Confirmed',
      },
    ],
  },
  {
    room: 'OT-03',
    department: 'Day surgery',
    state: 'Available',
    cases: [
      {
        window: '09:00–10:10',
        procedure: 'Carpal tunnel release',
        surgeon: 'Dr. J. Patel',
        team: '3 staff',
        variant: 'scheduled',
        label: 'Confirmed',
      },
      {
        window: '10:30–12:00',
        procedure: 'Open slot',
        surgeon: 'No surgeon assigned',
        team: '—',
        variant: 'neutral',
        label: 'Free',
      },
    ],
  },
];

export function TheatreDayPreview() {
  return (
    <div className="relative overflow-hidden rounded-[26px] border border-[#D7E3F4] bg-white/70 p-2.5 shadow-[0_36px_90px_-48px_rgba(15,23,42,0.45)] backdrop-blur sm:p-3.5">
      <div className="cobalt-dots relative overflow-hidden rounded-[20px] border border-ice-border/80 bg-[#F8FBFF] px-3 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ice-border/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="signal-dot h-1.5 w-1.5 rounded-full bg-teal" aria-hidden="true" />
            <p className="text-[10px] font-semibold tracking-[0.12em] text-ink-muted uppercase">
              Theatre day · Fri 21 Nov
            </p>
          </div>
          <p className="font-mono text-[9.5px] tracking-[0.06em] text-ink-subtle tabular-nums">
            3 THEATRES · 7 CASES
          </p>
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-3">
          {lanes.map((lane) => (
            <section
              key={lane.room}
              aria-label={`${lane.room} ${lane.department}`}
              className="rounded-[var(--radius-xl)] border border-ice-border bg-white p-3.5 shadow-[0_10px_26px_-22px_rgba(15,23,42,0.5)]"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-display text-[15px] leading-none font-extrabold tracking-[-0.03em] text-midnight tabular-nums">
                    {lane.room}
                  </p>
                  <p className="mt-1 text-[10px] text-ink-muted">{lane.department}</p>
                </div>
                <Badge variant={lane.state === 'Available' ? 'active' : 'surgery'}>
                  {lane.state}
                </Badge>
              </div>

              <ul className="mt-3 space-y-2">
                {lane.cases.map((item) => (
                  <li
                    key={item.window}
                    className="rounded-[var(--radius-md)] border border-rule-soft bg-porcelain/70 px-2.5 py-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 font-mono text-[9.5px] text-ink-muted tabular-nums">
                        <Clock size={10} aria-hidden="true" />
                        {item.window}
                      </span>
                      <Badge variant={item.variant}>{item.label}</Badge>
                    </div>
                    <p className="mt-1.5 text-[11.5px] leading-snug font-semibold text-midnight">
                      {item.procedure}
                    </p>
                    <p className="mt-0.5 text-[9.5px] text-ink-subtle">
                      {item.surgeon} · {item.team}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-3 flex items-start gap-2.5 rounded-[var(--radius-md)] border border-[var(--color-status-urgent-soft)] bg-[var(--color-status-urgent-soft)]/60 px-3 py-2.5">
          <Warning
            size={14}
            weight="duotone"
            className="mt-px shrink-0 text-[var(--color-status-urgent)]"
            aria-hidden="true"
          />
          <p className="text-[10.5px] leading-relaxed text-[var(--color-status-urgent)]">
            <span className="font-semibold">Booking refused.</span> OT-02 already
            holds 08:15–10:05 for Dr. M. Khan. The room, the surgeon and the
            patient are checked together, so the overlap is never accepted.
          </p>
        </div>

        <p className="mt-3 border-t border-ice-border/80 pt-3 text-[9.5px] text-ink-subtle">
          Sample board · names and times are illustrative, no patient record is shown
        </p>
      </div>
    </div>
  );
}
