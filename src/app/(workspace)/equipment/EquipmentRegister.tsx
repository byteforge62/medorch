'use client';

type EquipmentStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'RETIRED';

interface RegisterItem {
  id: string;
  name: string;
  category: string;
  serialNumber?: string | null;
  status: EquipmentStatus;
  maintenanceDueAt?: string | null;
  department?: { id: string; name: string } | null;
}

const STATUS_OPTIONS: EquipmentStatus[] = [
  'AVAILABLE',
  'IN_USE',
  'MAINTENANCE',
  'RETIRED',
];

const STATUS_TONE: Record<EquipmentStatus, string> = {
  AVAILABLE: 'text-success',
  IN_USE: 'text-brass',
  MAINTENANCE: 'text-warning',
  RETIRED: 'text-ink-subtle',
};

function formatStatus(status: EquipmentStatus) {
  return status.replace('_', ' ');
}

function formatDate(value?: string | null) {
  if (!value) return '—';

  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(
    new Date(value),
  );
}

function readinessFor(value?: string | null) {
  if (!value) {
    return { label: 'no date', className: 'text-ink-subtle', fill: 0 };
  }

  const due = new Date(value);

  if (Number.isNaN(due.getTime())) {
    return { label: 'no date', className: 'text-ink-subtle', fill: 0 };
  }

  const days = Math.ceil((due.getTime() - Date.now()) / 86_400_000);

  if (days < 0) {
    return {
      label: `overdue ${Math.abs(days)}d`,
      className: 'text-danger',
      fill: 100,
    };
  }

  if (days <= 30) {
    return {
      label: `due in ${days}d`,
      className: 'text-warning',
      fill: Math.max(12, 100 - days * 3),
    };
  }

  return {
    label: `service ${formatDate(value)}`,
    className: 'text-ink-muted',
    fill: Math.min(90, Math.max(18, 100 - days / 4)),
  };
}

function CategoryGlyph({ category }: { category: string }) {
  const value = category.toLowerCase();
  const kind = value.includes('monitor')
    ? 'monitor'
    : value.includes('anaes') || value.includes('vent')
      ? 'gas'
      : value.includes('light')
        ? 'light'
        : value.includes('table')
          ? 'table'
          : 'plant';

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      className="text-brass h-7 w-7 shrink-0"
      aria-hidden="true"
    >
      {kind === 'monitor' && (
        <>
          <rect x="3" y="4.5" width="18" height="12.5" rx="0.5" />
          <path d="M6 11h2.5l1.5-3 2 6 1.5-3H18" />
          <path d="M9 20h6" />
        </>
      )}
      {kind === 'gas' && (
        <>
          <rect x="5" y="8" width="14" height="12" rx="0.5" />
          <path d="M8 8V5h8v3M8 12h8M8 16h8" />
        </>
      )}
      {kind === 'light' && (
        <>
          <circle cx="12" cy="8" r="5" />
          <path d="M12 13v8M8 18h8" />
        </>
      )}
      {kind === 'table' && (
        <>
          <path d="M3 10h18M5 10v9M19 10v9M9 10V7h6v3" />
        </>
      )}
      {kind === 'plant' && (
        <>
          <rect x="4" y="6" width="16" height="13" rx="0.5" />
          <path d="M4 11h16M9 6v5M15 19v-8" />
        </>
      )}
    </svg>
  );
}

/**
 * An open register, not a data table. Each item is a ruled entry with its
 * category printed as a line glyph; nothing is boxed, thumbnailed or lifted.
 */
export function EquipmentRegister({
  items,
  isAdmin,
  updatingEquipmentId,
  onStatusChange,
  onEdit,
}: {
  items: RegisterItem[];
  isAdmin: boolean;
  updatingEquipmentId: string | null;
  onStatusChange: (id: string, status: EquipmentStatus) => void;
  onEdit: (item: RegisterItem) => void;
}) {
  return (
    <section className="border-t-2 border-ink/20">
      <div className="text-ink-muted hidden grid-cols-[minmax(0,1.5fr)_minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,1fr)_130px] gap-4 border-b border-rule px-1 py-2.5 text-[11px] md:grid">
        <span>Item</span>
        <span>Department</span>
        <span>Serial</span>
        <span>Readiness</span>
        <span className="text-right">State</span>
      </div>

      <ul>
        {items.map((item) => {
          const readiness = readinessFor(item.maintenanceDueAt);

          return (
            <li
              key={item.id}
              className="group grid gap-3 border-b border-rule py-4 transition-colors hover:bg-sheet/60 md:grid-cols-[minmax(0,1.5fr)_minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,1fr)_130px] md:items-center md:gap-4 md:px-1"
            >
              <div className="flex min-w-0 items-start gap-3">
                <CategoryGlyph category={item.category} />
                <div className="min-w-0">
                  <p className="font-display text-ink text-[1.15rem] leading-tight">
                    {item.name}
                  </p>
                  <p className="text-ink-muted mt-0.5 text-[11px]">
                    {item.category}
                  </p>
                </div>
              </div>

              <p className="text-ink-secondary text-[12px] md:text-[12.5px]">
                {item.department?.name ?? 'Unassigned'}
              </p>

              <p className="text-ink-muted font-mono text-[11px] tabular-nums">
                {item.serialNumber ?? '—'}
              </p>

              <div>
                <p className={`font-mono text-[10.5px] tabular-nums ${readiness.className}`}>
                  {readiness.label}
                </p>
                <span className="bg-rule mt-1.5 block h-px w-24 overflow-hidden">
                  <span
                    className="bg-brass block h-px"
                    style={{ width: `${readiness.fill}%` }}
                  />
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 md:justify-end">
                {isAdmin ? (
                  <label className="sr-only" htmlFor={`status-${item.id}`}>
                    Status for {item.name}
                  </label>
                ) : null}

                {isAdmin ? (
                  <select
                    id={`status-${item.id}`}
                    value={item.status}
                    disabled={updatingEquipmentId === item.id}
                    onChange={(event) =>
                      onStatusChange(item.id, event.target.value as EquipmentStatus)
                    }
                    className={`border-0 border-b border-rule bg-transparent py-1 pr-1 text-[11px] outline-none disabled:opacity-50 ${STATUS_TONE[item.status]}`}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option} disabled={option === 'IN_USE'}>
                        {formatStatus(option)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className={`text-[11px] ${STATUS_TONE[item.status]}`}>
                    {formatStatus(item.status)}
                  </span>
                )}

                {isAdmin ? (
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    className="text-ink-muted hover:text-ink text-[12px] underline decoration-rule underline-offset-4 hover:decoration-current"
                  >
                    Edit
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
