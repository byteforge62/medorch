import Link from 'next/link';
import {
  ArrowRight,
  BellRinging,
  CalendarBlank,
  ClockCounterClockwise,
  DoorOpen,
  FirstAidKit,
} from '@phosphor-icons/react/dist/ssr';
import type { IconProps } from '@phosphor-icons/react';

/*======================================================================
  Modules
  ======================================================================
  The six registers the workspace is actually built from. Each card links
  to the route that owns the work and states what the screen does.
====================================================================== */

type Module = {
  name: string;
  purpose: string;
  detail: string;
  href: string;
  icon: React.ComponentType<IconProps>;
};

const modules: Module[] = [
  {
    name: 'Theatre day',
    purpose: 'The surgical list, by room',
    detail:
      'Filter the day by theatre, department, status or priority, then open a case to confirm, start, delay, complete or cancel it.',
    href: '/schedules',
    icon: CalendarBlank,
  },
  {
    name: 'Appointments',
    purpose: 'The clinic queue',
    detail:
      'Every visit carries its patient, doctor, department and state. Patients see only their own; staff see the queue they plan around.',
    href: '/patients/appointments',
    icon: DoorOpen,
  },
  {
    name: 'Theatres',
    purpose: 'Room register',
    detail:
      'Room identity, capacity and current state in one list — so a free theatre is a checked fact, not a phone call.',
    href: '/ot-rooms',
    icon: DoorOpen,
  },
  {
    name: 'Equipment',
    purpose: 'Sets and devices',
    detail:
      'Claimed by a case and released when it closes, with maintenance state visible before the set is needed.',
    href: '/equipment',
    icon: FirstAidKit,
  },
  {
    name: 'Alerts',
    purpose: 'Decisions with an owner',
    detail:
      'Schedule, resource and maintenance flags, each carrying a severity and the case or room it belongs to.',
    href: '/alerts',
    icon: BellRinging,
  },
  {
    name: 'Audit trail',
    purpose: 'The record of changes',
    detail:
      'Who created, approved, delayed, completed or cancelled a case — read-only history for administrators.',
    href: '/audit',
    icon: ClockCounterClockwise,
  },
];

export function ModuleGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {modules.map((module) => {
        const Icon = module.icon;

        return (
          <article
            key={module.name}
            className="group flex flex-col rounded-[var(--radius-panel)] border border-ice-border bg-white p-5 shadow-xs transition-[transform,border-color,box-shadow] duration-250 hover:-translate-y-0.5 hover:border-cobalt/30 hover:shadow-md motion-reduce:hover:translate-y-0"
          >
            <span className="grid h-10 w-10 place-items-center rounded-[12px] bg-cobalt-soft text-cobalt">
              <Icon size={19} weight="duotone" aria-hidden="true" />
            </span>

            <h3 className="mt-4 font-display text-[17px] leading-tight font-bold tracking-[-0.02em] text-midnight">
              {module.name}
            </h3>
            <p className="mt-1 text-[10.5px] font-semibold tracking-[0.06em] text-teal-ink uppercase">
              {module.purpose}
            </p>
            <p className="mt-2.5 flex-1 text-[12.5px] leading-relaxed text-ink-muted">
              {module.detail}
            </p>

            <Link
              href={module.href}
              className="mt-4 inline-flex items-center gap-1.5 border-t border-rule-soft pt-3 text-[11.5px] font-semibold text-cobalt transition-colors hover:text-cobalt-hover"
            >
              Open the module
              <ArrowRight
                size={12}
                weight="bold"
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </article>
        );
      })}
    </div>
  );
}
