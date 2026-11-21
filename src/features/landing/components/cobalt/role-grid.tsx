import {
  FirstAidKit,
  IdentificationBadge,
  Stethoscope,
  UserCircle,
} from '@phosphor-icons/react/dist/ssr';
import type { IconProps } from '@phosphor-icons/react';

/*======================================================================
  Who signs in
  ======================================================================
  The four roles the workspace actually issues. Each card states what that
  role can reach once approved — the boundary is applied in the query, not
  in the interface.
====================================================================== */

type Role = {
  name: string;
  reach: string;
  detail: string;
  icon: React.ComponentType<IconProps>;
};

const roles: Role[] = [
  {
    name: 'Administrator',
    reach: 'The whole suite',
    detail:
      'Approves accounts, owns departments, theatres and equipment, and reads the audit trail.',
    icon: IdentificationBadge,
  },
  {
    name: 'Doctor',
    reach: 'Their lists',
    detail:
      'Sees the theatre day they are part of, manages their cases and the team assigned to them.',
    icon: Stethoscope,
  },
  {
    name: 'OT staff',
    reach: 'The running day',
    detail:
      'Works the board — room state, set readiness and the status of each case as it moves.',
    icon: FirstAidKit,
  },
  {
    name: 'Patient',
    reach: 'Their own record',
    detail:
      'Sees only their own appointments and case details. Nothing else is reachable from the session.',
    icon: UserCircle,
  },
];

export function RoleGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {roles.map((role) => {
        const Icon = role.icon;

        return (
          <article
            key={role.name}
            className="rounded-[var(--radius-panel)] border border-ice-border bg-white p-5 shadow-xs"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-teal-soft text-teal-ink">
              <Icon size={17} weight="duotone" aria-hidden="true" />
            </span>
            <h3 className="mt-3.5 font-display text-[16px] leading-tight font-bold tracking-[-0.02em] text-midnight">
              {role.name}
            </h3>
            <p className="mt-1 text-[10px] font-semibold tracking-[0.08em] text-cobalt uppercase">
              {role.reach}
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-ink-muted">
              {role.detail}
            </p>
          </article>
        );
      })}
    </div>
  );
}
