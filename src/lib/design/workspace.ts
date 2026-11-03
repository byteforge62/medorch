import type { UserRole } from '@/generated/prisma/client';

/**
 * Two visual environments, chosen by workflow — never by taste and never as a
 * user preference.
 *
 *   clinical    light porcelain paper. Records that are read, written and
 *               discussed: patient index, clinical records, doctor directory,
 *               departments, administration, the patient's own portal.
 *
 *   operations  dark instrument panel. Screens that are watched while standing
 *               up: theatre boards, equipment readiness, the theatre day sheet
 *               and the admin control room.
 *
 * The rule is: if the screen's job is *reading a record*, it is clinical. If
 * its job is *watching a live state*, it is operations.
 */
export type Workspace = 'clinical' | 'operations';

/** Screens that monitor live operational state regardless of who is looking. */
const OPERATIONS_PREFIXES = ['/ot-rooms', '/equipment', '/schedules'];

export function workspaceForRoute(
  pathname: string,
  role?: UserRole | string | null,
): Workspace {
  const path = (pathname.replace(/\/+$/, '') || '/').toLowerCase();

  if (
    OPERATIONS_PREFIXES.some(
      (prefix) => path === prefix || path.startsWith(`${prefix}/`),
    )
  ) {
    return 'operations';
  }

  // The control room is an operations surface for the people who run the
  // hospital floor; clinicians and patients get the clinical reading of it.
  if (path === '/dashboard') {
    return role === 'ADMIN' || role === 'OT_STAFF' ? 'operations' : 'clinical';
  }

  return 'clinical';
}
