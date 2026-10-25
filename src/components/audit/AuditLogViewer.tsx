'use client';

import { useEffect, useState } from 'react';
import { apiClient, ApiClientError } from '@/lib/api/client';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';

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

const PAGE_SIZE = 25;

const EMPTY_FILTERS: AuditFilters = {
  action: '',
  entity: '',
  entityId: '',
  userId: '',
  fromDate: '',
  toDate: '',
};

const inputClass =
  'w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-foreground-subtle focus:border-primary focus:ring-2 focus:ring-primary/20';

const actionStyles: Record<AuditAction, string> = {
  CREATE: 'bg-success/10 text-success ',
  UPDATE: 'bg-warning/10 text-warning ',
  DELETE: 'bg-danger/10 text-danger ',
  LOGIN: 'bg-info/10 text-info ',
  LOGOUT: 'bg-surface-muted/10 text-foreground-secondary ',
  APPROVE: 'bg-success/10 text-success ',
  REJECT: 'bg-danger/10 text-danger ',
  CANCEL: 'bg-warning/10 text-warning ',
  COMPLETE: 'bg-primary/10 text-primary ',
};

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Invalid date';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function formatAction(action: AuditAction) {
  return action.charAt(0) + action.slice(1).toLowerCase();
}

function getActorName(log: AuditLog) {
  return log.user?.name || log.user?.email || 'Deleted or unavailable user';
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
        if (!cancelled) {
          setLoading(false);
        }
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
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
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

  return (
    <main className="space-y-6 p-6 lg:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-[var(--color-primary)] uppercase">
            Security &amp; Compliance
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-foreground)]">
            Audit Trails
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-[var(--color-foreground-muted)]">
            Review recorded system activity, identify the actor, and inspect
            changes across MedOrch.
          </p>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
          <p className="text-xs text-[var(--color-foreground-muted)]">
            Matching events
          </p>
          <p className="mt-1 text-xl font-semibold text-[var(--color-foreground)] tabular-nums">
            {pagination.total.toLocaleString()}
          </p>
        </div>
      </header>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="mb-5">
          <h2 className="font-semibold text-[var(--color-foreground)]">
            Filter events
          </h2>
          <p className="mt-1 text-xs text-[var(--color-foreground-muted)]">
            Filters are applied on the server across the audit history.
          </p>
        </div>

        <form onSubmit={applyFilters}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div>
              <label
                htmlFor="audit-action"
                className="mb-1.5 block text-xs font-medium text-[var(--color-foreground-secondary)]"
              >
                Action
              </label>

              <select
                id="audit-action"
                className={inputClass}
                value={filters.action}
                onChange={(event) =>
                  updateFilter('action', event.target.value as AuditAction | '')
                }
              >
                <option value="">All actions</option>
                {(
                  [
                    'CREATE',
                    'UPDATE',
                    'DELETE',
                    'LOGIN',
                    'LOGOUT',
                    'APPROVE',
                    'REJECT',
                    'CANCEL',
                    'COMPLETE',
                  ] as const
                ).map((action) => (
                  <option key={action} value={action}>
                    {formatAction(action)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="audit-entity"
                className="mb-1.5 block text-xs font-medium text-[var(--color-foreground-secondary)]"
              >
                Entity type
              </label>

              <input
                id="audit-entity"
                className={inputClass}
                value={filters.entity}
                onChange={(event) => updateFilter('entity', event.target.value)}
                placeholder="e.g. Schedule, User"
                maxLength={100}
              />
            </div>

            <div>
              <label
                htmlFor="audit-entity-id"
                className="mb-1.5 block text-xs font-medium text-[var(--color-foreground-secondary)]"
              >
                Record ID
              </label>

              <input
                id="audit-entity-id"
                className={inputClass}
                value={filters.entityId}
                onChange={(event) =>
                  updateFilter('entityId', event.target.value)
                }
                placeholder="Exact entity record ID"
                maxLength={100}
              />
            </div>

            <div>
              <label
                htmlFor="audit-user-id"
                className="mb-1.5 block text-xs font-medium text-[var(--color-foreground-secondary)]"
              >
                Actor user ID
              </label>

              <input
                id="audit-user-id"
                className={inputClass}
                value={filters.userId}
                onChange={(event) => updateFilter('userId', event.target.value)}
                placeholder="User UUID"
                maxLength={100}
              />
            </div>

            <div>
              <label
                htmlFor="audit-from-date"
                className="mb-1.5 block text-xs font-medium text-[var(--color-foreground-secondary)]"
              >
                From date
              </label>

              <input
                id="audit-from-date"
                type="date"
                className={inputClass}
                value={filters.fromDate}
                onChange={(event) =>
                  updateFilter('fromDate', event.target.value)
                }
              />
            </div>

            <div>
              <label
                htmlFor="audit-to-date"
                className="mb-1.5 block text-xs font-medium text-[var(--color-foreground-secondary)]"
              >
                To date
              </label>

              <input
                id="audit-to-date"
                type="date"
                className={inputClass}
                value={filters.toDate}
                onChange={(event) => updateFilter('toDate', event.target.value)}
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="text-foreground-inverse rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
            >
              Apply filters
            </button>

            <button
              type="button"
              onClick={resetFilters}
              className="border-border-strong rounded-lg border px-4 py-2.5 text-sm font-medium text-[var(--color-foreground-secondary)] transition-colors hover:bg-[var(--color-surface-muted)]"
            >
              Reset
            </button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex flex-col gap-2 border-b border-[var(--color-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-[var(--color-foreground)]">
              Recorded activity
            </h2>
            <p className="mt-1 text-xs text-[var(--color-foreground-muted)]">
              {loading
                ? 'Loading audit events...'
                : `Showing ${firstRecord}–${lastRecord} of ${pagination.total} events`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
            disabled={loading}
            className="border-border-strong self-start rounded-lg border px-3 py-2 text-xs font-semibold text-[var(--color-foreground-secondary)] hover:bg-[var(--color-surface-muted)] disabled:opacity-50 sm:self-auto"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-6">
            <LoadingState message="Loading audit events..." />
          </div>
        ) : error ? (
          <div className="p-6">
            <ErrorState
              message={error}
              onRetry={() => setRetryCount((count) => count + 1)}
            />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No audit events found"
              description="Try adjusting your filters or selecting a wider date range."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-[var(--color-surface-muted)]">
                <tr>
                  <th className="px-5 py-3 text-xs font-semibold text-[var(--color-foreground-muted)]">
                    Event
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-[var(--color-foreground-muted)]">
                    Actor
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-[var(--color-foreground-muted)]">
                    Entity
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-[var(--color-foreground-muted)]">
                    Recorded at
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-[var(--color-foreground-muted)]">
                    Details
                  </th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className={`border-t border-[var(--color-border)] transition-colors ${
                      selectedLog?.id === log.id
                        ? 'bg-[var(--color-primary-soft)]'
                        : 'hover:bg-[var(--color-surface-muted)]'
                    }`}
                  >
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${actionStyles[log.action]}`}
                      >
                        {formatAction(log.action)}
                      </span>

                      <p className="mt-2 max-w-xs text-xs text-[var(--color-foreground-secondary)]">
                        {log.description || 'No description'}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-[var(--color-foreground)]">
                        {getActorName(log)}
                      </p>
                      <p className="mt-1 text-xs text-[var(--color-foreground-muted)]">
                        {log.user?.email || 'No email available'}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-[var(--color-foreground)]">
                        {log.entity}
                      </p>
                      <p
                        className="mt-1 max-w-40 truncate font-mono text-[11px] text-[var(--color-foreground-muted)]"
                        title={log.entityId}
                      >
                        {log.entityId}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-xs text-[var(--color-foreground-secondary)]">
                      {formatDateTime(log.createdAt)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedLog(
                            selectedLog?.id === log.id ? null : log,
                          )
                        }
                        aria-label={`View details for ${log.action} ${log.entity}`}
                        className="border-border-strong rounded-lg border px-3 py-2 text-xs font-semibold text-[var(--color-foreground-secondary)] hover:bg-[var(--color-surface-muted)]"
                      >
                        {selectedLog?.id === log.id ? 'Close' : 'Inspect'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && logs.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-[var(--color-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[var(--color-foreground-muted)]">
              Page {Math.floor(offset / PAGE_SIZE) + 1}
              {' · '}
              {PAGE_SIZE} events per page
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setOffset((current) => Math.max(0, current - PAGE_SIZE))
                }
                disabled={offset === 0}
                className="border-border-strong rounded-lg border px-4 py-2 text-xs font-semibold text-[var(--color-foreground-secondary)] hover:bg-[var(--color-surface-muted)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                onClick={() => setOffset((current) => current + PAGE_SIZE)}
                disabled={!pagination.hasMore}
                className="border-border-strong rounded-lg border px-4 py-2 text-xs font-semibold text-[var(--color-foreground-secondary)] hover:bg-[var(--color-surface-muted)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      {selectedLog && (
        <section
          aria-labelledby="audit-event-details"
          className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-wider text-[var(--color-primary)] uppercase">
                Event inspection
              </p>
              <h2
                id="audit-event-details"
                className="mt-1 text-lg font-semibold text-[var(--color-foreground)]"
              >
                {formatAction(selectedLog.action)} · {selectedLog.entity}
              </h2>
              <p className="mt-1 text-xs text-[var(--color-foreground-muted)]">
                {formatDateTime(selectedLog.createdAt)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedLog(null)}
              className="border-border-strong rounded-lg border px-3 py-2 text-xs font-semibold text-[var(--color-foreground-secondary)] hover:bg-[var(--color-surface-muted)]"
            >
              Close details
            </button>
          </div>

          <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-[var(--color-foreground-muted)]">
                Actor
              </dt>
              <dd className="mt-1 text-sm font-medium text-[var(--color-foreground)]">
                {getActorName(selectedLog)}
              </dd>
              <dd className="mt-1 text-xs text-[var(--color-foreground-muted)]">
                {selectedLog.user?.email || 'No email available'}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-[var(--color-foreground-muted)]">
                Actor user ID
              </dt>
              <dd className="mt-1 font-mono text-xs break-all text-[var(--color-foreground-secondary)]">
                {selectedLog.userId || 'Not associated with a user'}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-[var(--color-foreground-muted)]">
                Audit event ID
              </dt>
              <dd className="mt-1 font-mono text-xs break-all text-[var(--color-foreground-secondary)]">
                {selectedLog.id}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-[var(--color-foreground-muted)]">
                Entity record ID
              </dt>
              <dd className="mt-1 font-mono text-xs break-all text-[var(--color-foreground-secondary)]">
                {selectedLog.entityId}
              </dd>
            </div>

            <div className="sm:col-span-2">
              <dt className="text-xs text-[var(--color-foreground-muted)]">
                Description
              </dt>
              <dd className="mt-1 text-sm whitespace-pre-wrap text-[var(--color-foreground)]">
                {selectedLog.description || 'No description was recorded.'}
              </dd>
            </div>
          </dl>

          <div className="mt-5">
            <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
              Event metadata
            </h3>

            <pre className="mt-2 max-h-96 overflow-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 text-xs leading-5 break-words whitespace-pre-wrap text-[var(--color-foreground-secondary)]">
              {selectedLog.metadata == null
                ? 'No additional metadata was recorded.'
                : JSON.stringify(selectedLog.metadata, null, 2)}
            </pre>
          </div>
        </section>
      )}
    </main>
  );
}
