'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiClient, ApiClientError } from '@/lib/api/client';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';

type EquipmentStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'RETIRED';

interface Equipment {
  id: string;
  name: string;
  category: string;
  serialNumber?: string | null;
  status: EquipmentStatus;
  maintenanceDueAt?: string | null;
  department?: {
    id: string;
    name: string;
  } | null;
}

const STATUS_OPTIONS: EquipmentStatus[] = [
  'AVAILABLE',
  'IN_USE',
  'MAINTENANCE',
  'RETIRED',
];

function formatStatus(status: EquipmentStatus) {
  return status.replace('_', ' ');
}

function formatDate(value?: string | null) {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

export function EquipmentManagement() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<EquipmentStatus | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const fetchEquipment = async () => {
      try {
        const response = await apiClient.get<Equipment[]>('/api/equipment');

        if (!cancelled) {
          setEquipment(response ?? []);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(
            fetchError instanceof ApiClientError
              ? fetchError.message
              : 'Failed to load equipment.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchEquipment();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredEquipment = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return equipment.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        item.name.toLowerCase().includes(normalizedSearch) ||
        item.category.toLowerCase().includes(normalizedSearch) ||
        item.serialNumber?.toLowerCase().includes(normalizedSearch) ||
        item.department?.name.toLowerCase().includes(normalizedSearch);

      const matchesStatus = status === 'ALL' || item.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [equipment, search, status]);

  const counts = useMemo(
    () => ({
      total: equipment.length,
      available: equipment.filter((item) => item.status === 'AVAILABLE').length,
      inUse: equipment.filter((item) => item.status === 'IN_USE').length,
      maintenance: equipment.filter((item) => item.status === 'MAINTENANCE')
        .length,
    }),
    [equipment],
  );

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <main className="space-y-6">
      <section className="space-y-2">
        <p className="text-sm font-medium text-[var(--color-primary)]">
          Resource Registry
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Equipment</h1>
        <p className="max-w-2xl text-sm text-[var(--color-text-muted)]">
          View equipment availability, category, assignment state, and
          maintenance information.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-sm text-[var(--color-text-muted)]">Total</p>
          <p className="mt-2 text-2xl font-semibold">{counts.total}</p>
        </Card>

        <Card>
          <p className="text-sm text-[var(--color-text-muted)]">Available</p>
          <p className="mt-2 text-2xl font-semibold">{counts.available}</p>
        </Card>

        <Card>
          <p className="text-sm text-[var(--color-text-muted)]">In Use</p>
          <p className="mt-2 text-2xl font-semibold">{counts.inUse}</p>
        </Card>

        <Card>
          <p className="text-sm text-[var(--color-text-muted)]">Maintenance</p>
          <p className="mt-2 text-2xl font-semibold">{counts.maintenance}</p>
        </Card>
      </section>

      <Card>
        <div className="grid gap-4 md:grid-cols-[1fr_220px]">
          <div>
            <label
              htmlFor="equipment-search"
              className="mb-2 block text-sm font-medium"
            >
              Search equipment
            </label>
            <input
              id="equipment-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name, category, serial number, department"
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm transition outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div>
            <label
              htmlFor="equipment-status"
              className="mb-2 block text-sm font-medium"
            >
              Status
            </label>
            <select
              id="equipment-status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as EquipmentStatus | 'ALL')
              }
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm transition outline-none focus:border-[var(--color-primary)]"
            >
              <option value="ALL">All statuses</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {formatStatus(option)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {filteredEquipment.length === 0 ? (
        <EmptyState
          title="No equipment found"
          description="Try changing the search or status filter."
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredEquipment.map((item) => (
            <Card key={item.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate font-semibold">{item.name}</h2>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    {item.category}
                  </p>
                </div>

                <Badge>{formatStatus(item.status)}</Badge>
              </div>

              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--color-text-muted)]">
                    Serial number
                  </dt>
                  <dd className="text-right">{item.serialNumber ?? '—'}</dd>
                </div>

                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--color-text-muted)]">Department</dt>
                  <dd className="text-right">
                    {item.department?.name ?? 'Unassigned'}
                  </dd>
                </div>

                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--color-text-muted)]">
                    Maintenance due
                  </dt>
                  <dd className="text-right">
                    {formatDate(item.maintenanceDueAt)}
                  </dd>
                </div>
              </dl>
            </Card>
          ))}
        </section>
      )}
    </main>
  );
}
