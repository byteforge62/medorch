import { requireRole } from '@/lib/auth/authorization';
import { getScheduleWorkspace } from '@/modules/schedules/schedule-workspace.service';
import { SchedulesWorkspace } from '@/components/schedules/SchedulesWorkspace';

interface SchedulesPageProps {
  searchParams: Promise<{
    date?: string | string[];
  }>;
}

function parseDateKey(value: string | string[] | undefined) {
  const key = Array.isArray(value) ? value[0] : value;

  if (!key) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);

  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function dateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function weekRange(selected: Date) {
  const monday = new Date(selected);
  const weekday = monday.getDay();
  monday.setDate(monday.getDate() - (weekday === 0 ? 6 : weekday - 1));
  monday.setHours(0, 0, 0, 0);

  const nextMonday = new Date(monday);
  nextMonday.setDate(nextMonday.getDate() + 7);

  /*
   * The browser decides the local calendar day. The server query is padded by
   * a day on each side so a timezone offset can never clip a Sunday-night or
   * Monday-morning case out of the visible week.
   */
  const from = new Date(monday);
  from.setDate(from.getDate() - 1);

  const to = new Date(nextMonday);
  to.setDate(to.getDate() + 1);

  return { from, to };
}

export default async function SchedulesPage({
  searchParams,
}: SchedulesPageProps) {
  const session = await requireRole(['ADMIN', 'DOCTOR', 'OT_STAFF']);
  const params = await searchParams;
  const requestedDate = parseDateKey(params.date);
  const selected = requestedDate ?? new Date();
  const range = weekRange(selected);

  const data = await getScheduleWorkspace(
    {
      id: session.user.id,
      role: session.user.role,
    },
    range,
  );

  return (
    <SchedulesWorkspace
      data={data}
      initialDateKey={dateKey(selected)}
      initialDateWasExplicit={Boolean(requestedDate)}
    />
  );
}
