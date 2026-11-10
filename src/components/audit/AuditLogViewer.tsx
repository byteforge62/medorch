'use client';

import { useEffect, useState } from 'react';
import { Funnel } from '@phosphor-icons/react';
import { apiClient, ApiClientError } from '@/lib/api/client';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'APPROVE'
  | 'REJECT'
  | 'CANCEL'
  | 'COMPLETE';

interface AuditUser {
  id: string;
  name: string | null;
  email: string | null;
}

interface AuditLog {
  id: string;
  userId: string | null;
  action: AuditAction;
  entity: string;
  entityId: string;
  description: string | null;
  metadata: unknown;
  createdAt: string;
  user: AuditUser | null;
}

interface AuditPagination {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
}

interface AuditLogsResponse {
  items: AuditLog[];
  pagination: AuditPagination;
}

interface AuditFilters {
  action: AuditAction | '';
  entity: string;
  entityId: string;
  userId: string;
  fromDate: string;
  toDate: string;
}

const ACTIONS: AuditAction[] = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'LOGIN',
  'LOGOUT',
  'APPROVE',
  'REJECT',
  'CANCEL',
  'COMPLETE',
];

const PAGE_SIZE = 25;

const EMPTY_FILTERS: AuditFilters = {
  action: '',
  entity: '',
  entityId: '',
  userId: '',
  fromDate: '',
  toDate: '',
};

const INPUT =
  'control mt-1.5 h-9 w-full px-2.5 text-[12px] text-ink outline-none placeholder:text-ink-subtle';

const actionStyles: Record<AuditAction, string> = {
  CREATE: 'bg-success-soft text-success',
  UPDATE: 'bg-warning-soft text-warning',
  DELETE: 'bg-danger-soft text-danger',
  LOGIN: 'bg-info-soft text-info',
  LOGOUT: 'bg-surface-muted text-ink-secondary',
  APPROVE: 'bg-success-soft text-success',
  REJECT: 'bg-danger-soft text-danger',
  CANCEL: 'bg-warning-soft text-warning',
  COMPLETE: 'bg-pine-soft text-pine',
};

function formatAction(action: AuditAction) {
  return action.charAt(0) + action.slice(1).toLowerCase();
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Invalid date';

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function formatDay(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return { day: '—', month: '', time: '' };
  }

  return {
    day: new Intl.DateTimeFormat(undefined, { day: '2-digit' }).format(date),
    month: new Intl.DateTimeFormat(undefined, { month: 'short' }).format(date),
    time: new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date),
  };
}

function getActorName(log: AuditLog) {
  return log.user?.name || log.user?.email || 'Deleted or unavailable user';
}

function activeFilterCount(filters: AuditFilters) {
  return Object.values(filters).filter((value) => value.trim()).length;
}

export function AuditLogViewer() {
  const [filters, setFilters] = useState<AuditFilters>({ ...EMPTY_FILTERS });
  const [appliedFilters, setAppliedFilters] = useState<AuditFilters>({
    ...EMPTY_FILTERS,
  });
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<AuditPagination>({
    limit: PAGE_SIZE,
    offset: 0,
    total: 0,
    hasMore: false,
  });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadAuditLogs() {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(offset),
      });

      for (const [key, value] of Object.entries(appliedFilters)) {
        const normalized = value.trim();

        if (normalized) {
          params.set(key, normalized);
        }
      }

      try {
        setLoading(true);
        setError(null);

        const result = await apiClient.get<AuditLogsResponse>(
          `/api/audit?${params.toString()}`,
        );

        if (cancelled) return;

        setLogs(result.items);
        setPagination(result.pagination);
        setSelectedLog((current) =>
          current && result.items.some((item) => item.id === current.id)
            ? current
            : null,
        );
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof ApiClientError
            ? err.message
            : 'Failed to load audit logs.',
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadAuditLogs();

    return () => {
      cancelled = true;
    };
  }, [appliedFilters, offset, retryCount]);

  function updateFilter<K extends keyof AuditFilters>(
    key: K,
    value: AuditFilters[K],
  ) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOffset(0);
    setSelectedLog(null);
    setAppliedFilters({ ...filters });
  }

  function resetFilters() {
    setFilters({ ...EMPTY_FILTERS });
    setAppliedFilters({ ...EMPTY_FILTERS });
    setOffset(0);
    setSelectedLog(null);
  }

  const firstRecord = pagination.total === 0 ? 0 : offset + 1;
  const lastRecord = Math.min(offset + logs.length, pagination.total);
  const filterCount = activeFilterCount(appliedFilters);

  return (
    <main className="space-y-6">
      <header className="border-rule border-b pb-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-primary inline-flex items-center gap-2 text-[10.5px] font-semibold tracking-[0.08em] uppercase">
              <span className="bg-primary h-1.5 w-1.5 rounded-full" aria-hidden="true" />
              Security & compliance
            </p>
            <h1 className="display mt-3 text-[clamp(2rem,4vw,2.85rem)]">
              Audit ledger
            </h1>
            <p className="lede mt-3 text-[14px]">
              A chronological record of who acted, what changed and when.
              Entries are immutable and read in server-side order.
            </p>
          </div>

          <div className="flex shrink-0 items-end gap-6">
            <div>
              <p className="text-ink-muted text-[10.5px] font-medium">
                Matching events
              </p>
              <p className="text-ink mt-1 font-mono text-[26px] leading-none tabular-nums">
                {pagination.total.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-ink-muted text-[10.5px] font-medium">
                Current page
              </p>
              <p className="text-ink mt-1 font-mono text-[26px] leading-none tabular-nums">
                {Math.floor(offset / PAGE_SIZE) + 1}
              </p>
            </div>
          </div>
        </div>
      </header>

      <section
        aria-labelledby="audit-filter-title"
        className="border-rule bg-sheet rounded-[18px] border px-5 py-4 shadow-xs"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2
              id="audit-filter-title"
              className="text-ink text-[13px] font-semibold"
            >
              Filter the ledger
            </h2>
            <p className="text-ink-muted mt-0.5 text-[11px]">
              Applied on the server across the full retained history.
            </p>
          </div>
          {filterCount > 0 ? (
            <span className="text-pine text-[11px] font-medium">
              {filterCount} filter{filterCount === 1 ? '' : 's'} active
            </span>
          ) : null}
        </div>

        <form onSubmit={applyFilters} className="mt-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <label className="block">
              <span className="text-ink-secondary text-[11px] font-medium">
                Action
              </span>
              <select
                id="audit-action"
                className={INPUT}
                value={filters.action}
                onChange={(event) =>
                  updateFilter('action', event.target.value as AuditAction | '')
                }
              >
                <option value="">All actions</option>
                {ACTIONS.map((action) => (
                  <option key={action} value={action}>
                    {formatAction(action)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-ink-secondary text-[11px] font-medium">
                Entity type
              </span>
              <input
                id="audit-entity"
                className={INPUT}
                value={filters.entity}
                onChange={(event) => updateFilter('entity', event.target.value)}
                placeholder="Schedule, User…"
                maxLength={100}
              />
            </label>

            <label className="block">
              <span className="text-ink-secondary text-[11px] font-medium">
                Record ID
              </span>
              <input
                id="audit-entity-id"
                className={INPUT}
                value={filters.entityId}
                onChange={(event) =>
                  updateFilter('entityId', event.target.value)
                }
                placeholder="Exact record ID"
                maxLength={100}
              />
            </label>

            <label className="block">
              <span className="text-ink-secondary text-[11px] font-medium">
                Actor user ID
              </span>
              <input
                id="audit-user-id"
                className={INPUT}
                value={filters.userId}
                onChange={(event) => updateFilter('userId', event.target.value)}
                placeholder="User UUID"
                maxLength={100}
              />
            </label>

            <label className="block">
              <span className="text-ink-secondary text-[11px] font-medium">
                From date
              </span>
              <input
                id="audit-from-date"
                type="date"
                className={INPUT}
                value={filters.fromDate}
                onChange={(event) =>
                  updateFilter('fromDate', event.target.value)
                }
              />
            </label>

            <label className="block">
              <span className="text-ink-secondary text-[11px] font-medium">
                To date
              </span>
              <input
                id="audit-to-date"
                type="date"
                className={INPUT}
                value={filters.toDate}
                onChange={(event) => updateFilter('toDate', event.target.value)}
              />
            </label>
          </div>

          <div className="border-rule-soft mt-4 flex flex-wrap items-center gap-3 border-t pt-3">
            <Button type="submit" size="sm">
              <Funnel size={14} weight="bold" aria-hidden="true" />
              Apply filters
            </Button>
            <button
              type="button"
              onClick={resetFilters}
              className="text-ink-muted hover:text-ink text-[12px] font-semibold"
            >
              Reset
            </button>
            {filterCount > 0 ? (
              <span className="text-ink-subtle ml-auto text-[10.5px]">
                Showing a filtered subset
              </span>
            ) : null}
          </div>
        </form>
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <section
          className="panel-flush overflow-hidden"
          aria-labelledby="audit-record-title"
        >
          <div className="border-rule-soft flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
            <div>
              <h2
                id="audit-record-title"
                className="text-ink text-[13px] font-semibold"
              >
                Recorded activity
              </h2>
              <p className="text-ink-muted mt-0.5 text-[11px]">
                {loading
                  ? 'Reading the ledger…'
                  : `Events ${firstRecord}–${lastRecord} of ${pagination.total}`}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
              disabled={loading}
              className="text-ink-muted hover:text-ink text-[11.5px] font-semibold disabled:opacity-50"
            >
              Refresh ledger
            </button>
          </div>

          {loading ? (
            <div className="p-5">
              <LoadingState message="Loading audit events…" />
            </div>
          ) : error ? (
            <div className="p-5">
              <ErrorState
                message={error}
                onRetry={() => setRetryCount((count) => count + 1)}
              />
            </div>
          ) : logs.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="No audit events found"
                description="Try adjusting the filters or selecting a wider date range."
              />
            </div>
          ) : (
            <ol className="divide-rule-soft divide-y">
              {logs.map((log) => {
                const date = formatDay(log.createdAt);
                const isSelected = selectedLog?.id === log.id;

                return (
                  <li key={log.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedLog(isSelected ? null : log)}
                      aria-pressed={isSelected}
                      aria-label={`Inspect ${formatAction(log.action)} event for ${log.entity}`}
                      className={`relative grid w-full cursor-pointer grid-cols-[3.4rem_minmax(0,1fr)] gap-3 px-4 py-3 text-left transition-colors sm:grid-cols-[3.8rem_minmax(0,1fr)_auto] ${
                        isSelected ? 'bg-pine-soft' : 'hover:bg-surface-subtle'
                      }`}
                    >
                      <div className="border-rule-soft relative flex flex-col items-start border-r pr-3">
                        <span
                          className="timeline-node absolute top-0 -right-[5px] h-2 w-2 shadow-none"
                          data-tone={
                            log.action === 'DELETE' || log.action === 'REJECT'
                              ? 'critical'
                              : log.action === 'UPDATE' || log.action === 'CANCEL'
                                ? 'warning'
                                : log.action === 'CREATE' ||
                                    log.action === 'APPROVE' ||
                                    log.action === 'COMPLETE'
                                  ? 'success'
                                  : 'info'
                          }
                          aria-hidden="true"
                        />
                        <span className="text-ink font-mono text-[16px] leading-none">
                          {date.day}
                        </span>
                        <span className="text-ink-subtle mt-1 text-[9.5px] font-medium tracking-[0.06em] uppercase">
                          {date.month}
                        </span>
                        <span className="text-ink-muted mt-1 font-mono text-[9.5px]">
                          {date.time}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-[3px] px-1.5 py-0.5 text-[9.5px] font-semibold ${actionStyles[log.action]}`}
                          >
                            {formatAction(log.action)}
                          </span>
                          <span className="text-ink text-[12.5px] font-semibold">
                            {log.entity}
                          </span>
                          <span
                            className="text-ink-subtle max-w-[11rem] truncate font-mono text-[9.5px]"
                            title={log.entityId}
                          >
                            {log.entityId.slice(0, 10)}
                          </span>
                        </div>

                        <p className="text-ink-secondary mt-1 line-clamp-2 text-[11.5px] leading-relaxed">
                          {log.description || 'No description recorded.'}
                        </p>

                        <p className="text-ink-subtle mt-1 truncate text-[10.5px]">
                          {getActorName(log)}
                          {log.user?.email ? ` · ${log.user.email}` : ''}
                        </p>
                      </div>

                      <span className="text-ink-subtle hidden self-center font-mono text-[9.5px] whitespace-nowrap sm:block">
                        {isSelected ? 'Open' : 'Inspect'}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          )}

          {!loading && !error && logs.length > 0 ? (
            <div className="border-rule-soft flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
              <p className="text-ink-subtle text-[10.5px]">
                Page {Math.floor(offset / PAGE_SIZE) + 1} · {PAGE_SIZE} events
                per page
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setOffset((current) => Math.max(0, current - PAGE_SIZE))
                  }
                  disabled={offset === 0}
                  className="control text-ink-secondary hover:bg-surface-subtle h-8 px-3 text-[11px] font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  type="button"
                  onClick={() => setOffset((current) => current + PAGE_SIZE)}
                  disabled={!pagination.hasMore}
                  className="control text-ink-secondary hover:bg-surface-subtle h-8 px-3 text-[11px] font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <aside className="xl:sticky xl:top-20">
          {selectedLog ? (
            <section
              aria-labelledby="audit-event-details"
              className="panel overflow-hidden"
            >
              <div className="border-rule-soft border-b px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-ink-subtle text-[9.5px] font-medium tracking-[0.08em] uppercase">
                      Event inspection
                    </p>
                    <h2
                      id="audit-event-details"
                      className="text-ink mt-0.5 text-[15px] font-semibold"
                    >
                      {formatAction(selectedLog.action)} · {selectedLog.entity}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedLog(null)}
                    className="text-ink-muted hover:text-ink shrink-0 text-[11px] font-semibold"
                    aria-label="Close event details"
                  >
                    Close
                  </button>
                </div>
                <p className="text-ink-muted mt-1 text-[10.5px]">
                  {formatDateTime(selectedLog.createdAt)}
                </p>
              </div>

              <dl className="space-y-3 px-4 py-4">
                <div>
                  <dt className="text-ink-subtle text-[9.5px]">Actor</dt>
                  <dd className="text-ink mt-0.5 text-[12px] font-medium">
                    {getActorName(selectedLog)}
                  </dd>
                  <dd className="text-ink-muted mt-0.5 text-[10.5px] break-all">
                    {selectedLog.user?.email || 'No email available'}
                  </dd>
                </div>

                <div>
                  <dt className="text-ink-subtle text-[9.5px]">Description</dt>
                  <dd className="text-ink-secondary mt-0.5 text-[11.5px] whitespace-pre-wrap">
                    {selectedLog.description || 'No description was recorded.'}
                  </dd>
                </div>

                <div className="border-rule-soft grid grid-cols-1 gap-3 border-t pt-3">
                  <div>
                    <dt className="text-ink-subtle text-[9.5px]">Event ID</dt>
                    <dd className="text-ink-muted mt-0.5 font-mono text-[9.5px] break-all">
                      {selectedLog.id}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ink-subtle text-[9.5px]">
                      Entity record
                    </dt>
                    <dd className="text-ink-muted mt-0.5 font-mono text-[9.5px] break-all">
                      {selectedLog.entityId}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ink-subtle text-[9.5px]">
                      Actor user ID
                    </dt>
                    <dd className="text-ink-muted mt-0.5 font-mono text-[9.5px] break-all">
                      {selectedLog.userId || 'Not associated with a user'}
                    </dd>
                  </div>
                </div>
              </dl>

              <details className="border-rule-soft border-t">
                <summary className="text-ink-secondary hover:bg-surface-subtle cursor-pointer px-4 py-2.5 text-[10.5px] font-semibold">
                  Event metadata
                </summary>
                <pre className="border-rule-soft bg-surface-subtle text-ink-secondary max-h-72 overflow-auto border-t px-4 py-3 text-[10px] leading-[1.65] break-words whitespace-pre-wrap">
                  {selectedLog.metadata == null
                    ? 'No additional metadata was recorded.'
                    : JSON.stringify(selectedLog.metadata, null, 2)}
                </pre>
              </details>
            </section>
          ) : (
            <section className="panel px-5 py-8">
              <p className="text-ink-subtle font-mono text-[10px] tracking-[0.1em] uppercase">
                Event inspection
              </p>
              <p className="text-ink mt-2 text-[13px] font-semibold">
                Select an event from the ledger.
              </p>
              <p className="text-ink-muted mt-1 text-[11.5px] leading-relaxed">
                The record ID, actor identity and structured metadata will
                appear here without changing the ledger order.
              </p>
            </section>
          )}
        </aside>
      </div>
    </main>
  );
}
