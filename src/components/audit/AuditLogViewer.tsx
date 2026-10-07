'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';

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

interface AuditLog {
  id: string;
  userId: string | null;
  action: AuditAction;
  entity: string;
  entityId: string;
  description: string | null;
  metadata: unknown;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  } | null;
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

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [action, setAction] = useState('');
  const [entity, setEntity] = useState('');
  const [offset, setOffset] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
      offset: String(offset),
    });

    if (action) {
      params.set('action', action);
    }

    if (entity.trim()) {
      params.set('entity', entity.trim());
    }

    try {
      const response = await apiClient.get<AuditLog[]>(
        `/api/audit?${params.toString()}`,
      );

      setLogs(response ?? []);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load audit logs.',
      );
    } finally {
      setLoading(false);
    }
  }, [action, entity, offset]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  const handleActionChange = (value: string) => {
    setLoading(true);
    setError(null);
    setAction(value);
    setOffset(0);
  };

  const handleEntityChange = (value: string) => {
    setLoading(true);
    setError(null);
    setEntity(value);
    setOffset(0);
  };

  const formatDate = (value: string) => new Date(value).toLocaleString();

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6">
      <div>
        <p className="text-primary text-sm font-medium">Administration</p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
          Audit trail
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          Review recorded actions across users, schedules, resources, patients,
          and alerts.
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-4 md:grid-cols-[200px_1fr_auto]">
          <label className="space-y-2">
            <span className="text-xs font-medium tracking-wide text-slate-500 uppercase">
              Action
            </span>

            <select
              value={action}
              onChange={(event) => handleActionChange(event.target.value)}
              className="focus:border-primary focus:ring-primary/20 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              <option value="">All actions</option>

              {ACTIONS.map((item) => (
                <option key={item} value={item}>
                  {item.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-medium tracking-wide text-slate-500 uppercase">
              Entity
            </span>

            <input
              type="text"
              value={entity}
              onChange={(event) => handleEntityChange(event.target.value)}
              placeholder="Schedule, Patient, Equipment..."
              className="focus:border-primary focus:ring-primary/20 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </label>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setError(null);
                void loadLogs();
              }}
              disabled={loading}
              className="h-10 rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Refresh
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
        >
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left dark:border-slate-800 dark:bg-slate-950">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">
                  Time
                </th>

                <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">
                  Actor
                </th>

                <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">
                  Action
                </th>

                <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">
                  Entity
                </th>

                <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">
                  Description
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    Loading audit records...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    No audit records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {formatDate(log.createdAt)}
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {log.user?.name || 'System'}
                      </div>

                      {log.user?.email && (
                        <div className="mt-1 text-xs text-slate-500">
                          {log.user.email}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200">
                        {log.action.replaceAll('_', ' ')}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {log.entity}
                      </div>

                      <div className="mt-1 max-w-[220px] truncate font-mono text-xs text-slate-500">
                        {log.entityId}
                      </div>
                    </td>

                    <td className="max-w-[420px] px-4 py-4 text-slate-600 dark:text-slate-400">
                      {log.description || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-slate-800">
          <span className="text-sm text-slate-500">
            Showing {logs.length} record
            {logs.length === 1 ? '' : 's'}
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setError(null);
                setOffset((current) => Math.max(0, current - PAGE_SIZE));
              }}
              disabled={offset === 0 || loading}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-200"
            >
              Previous
            </button>

            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setError(null);
                setOffset((current) => current + PAGE_SIZE);
              }}
              disabled={loading || logs.length < PAGE_SIZE}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-200"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
