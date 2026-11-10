'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { MagnifyingGlass, UserPlus } from '@phosphor-icons/react';
import { apiClient, ApiClientError } from '@/lib/api/client';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { UserStatusBadge } from './UserStatusBadge';

type UserRole = 'ADMIN' | 'DOCTOR' | 'OT_STAFF' | 'PATIENT';
type UserStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CreateUserForm {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole | '';
  status: UserStatus | '';
}

const EMPTY_CREATE_FORM: CreateUserForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  role: '',
  status: '',
};

const ROLE_OPTIONS: UserRole[] = ['ADMIN', 'DOCTOR', 'OT_STAFF', 'PATIENT'];
const STATUS_OPTIONS: UserStatus[] = [
  'PENDING',
  'ACTIVE',
  'SUSPENDED',
  'REJECTED',
];

const ROLE_META: Record<
  UserRole,
  { label: string; scope: string; tone: string; dot: string }
> = {
  ADMIN: {
    label: 'Administrator',
    scope:
      'Full operational record: accounts, schedules, theatres, equipment, departments, audit history and approvals.',
    tone: 'bg-pine-soft text-pine',
    dot: 'bg-pine',
  },
  DOCTOR: {
    label: 'Doctor',
    scope:
      'Clinical schedules, the doctor directory, patient records, theatres and equipment. No account administration.',
    tone: 'bg-info-soft text-info',
    dot: 'bg-info',
  },
  OT_STAFF: {
    label: 'Theatre staff',
    scope:
      'Assigned cases, theatre status and operating resources. No patient registry, schedule editing or account administration.',
    tone: 'bg-warning-soft text-warning',
    dot: 'bg-warning',
  },
  PATIENT: {
    label: 'Patient',
    scope:
      'Own appointment record only. Operational schedules, patient directories and audit history are out of scope.',
    tone: 'bg-vermilion-soft text-vermilion',
    dot: 'bg-vermilion',
  },
};

const INPUT =
  'control mt-1.5 h-10 w-full px-3 text-[13px] text-ink outline-none placeholder:text-ink-subtle';

function formatDate(value: string | null) {
  if (!value) return 'Not recorded';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Not recorded';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatRole(role: UserRole) {
  return ROLE_META[role].label;
}

function initials(name: string) {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || '—'
  );
}

export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [role, setRole] = useState<UserRole | 'ALL'>('ALL');
  const [status, setStatus] = useState<UserStatus | 'ALL'>('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [approvingUserId, setApprovingUserId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createForm, setCreateForm] =
    useState<CreateUserForm>(EMPTY_CREATE_FORM);

  const fetchUsers = useCallback(async () => {
    try {
      setError(null);
      const data = await apiClient.get<User[]>('/api/users');
      setUsers(data);
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : 'Failed to load users.',
      );
      throw err;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.get<User[]>('/api/users');
        if (!cancelled) setUsers(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiClientError
              ? err.message
              : 'Failed to load users.',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users
      .filter((user) => {
        const matchesSearch =
          !query ||
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          (user.phone ?? '').toLowerCase().includes(query);
        const matchesRole = role === 'ALL' || user.role === role;
        const matchesStatus = status === 'ALL' || user.status === status;

        return matchesSearch && matchesRole && matchesStatus;
      })
      .sort((a, b) => {
        const pendingDelta =
          Number(b.status === 'PENDING') - Number(a.status === 'PENDING');
        if (pendingDelta !== 0) return pendingDelta;
        return a.name.localeCompare(b.name);
      });
  }, [users, search, role, status]);

  const selected =
    filteredUsers.find((user) => user.id === selectedId) ??
    filteredUsers[0] ??
    null;

  const counts = useMemo(
    () => ({
      total: users.length,
      active: users.filter((user) => user.status === 'ACTIVE').length,
      pending: users.filter((user) => user.status === 'PENDING').length,
      restricted: users.filter(
        (user) => user.status === 'SUSPENDED' || user.status === 'REJECTED',
      ).length,
    }),
    [users],
  );

  const roleCounts = useMemo(
    () =>
      ROLE_OPTIONS.map((item) => ({
        role: item,
        count: users.filter((user) => user.role === item).length,
      })),
    [users],
  );

  function updateCreateForm(field: keyof CreateUserForm, value: string) {
    setCreateForm((current) => ({ ...current, [field]: value }));
  }

  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = createForm.name.trim();
    const email = createForm.email.trim().toLowerCase();
    const phone = createForm.phone.trim();

    if (name.length < 2 || name.length > 100) {
      setCreateError('Name must contain between 2 and 100 characters.');
      return;
    }

    if (createForm.password.length < 12 || createForm.password.length > 128) {
      setCreateError('Password must contain between 12 and 128 characters.');
      return;
    }

    if (!createForm.role) {
      setCreateError('Select a role for this account.');
      return;
    }

    if (phone && (phone.length < 7 || phone.length > 20)) {
      setCreateError('Phone must contain between 7 and 20 characters.');
      return;
    }

    setCreating(true);
    setCreateError(null);
    setActionSuccess(null);

    try {
      const created = await apiClient.post<User>('/api/users', {
        name,
        email,
        password: createForm.password,
        ...(phone ? { phone } : {}),
        role: createForm.role,
        ...(createForm.status ? { status: createForm.status } : {}),
      });

      setActionSuccess(`${name} was created.`);
      setSelectedId(created.id);
      setCreateForm(EMPTY_CREATE_FORM);
      setCreateOpen(false);
      await fetchUsers();
    } catch (err) {
      setCreateError(
        err instanceof ApiClientError ? err.message : 'Failed to create user.',
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleApprove(user: User) {
    if (
      !window.confirm(
        `Approve ${user.name}? They will be able to sign in once the account becomes active.`,
      )
    ) {
      return;
    }

    setApprovingUserId(user.id);
    setActionError(null);
    setActionSuccess(null);

    try {
      await apiClient.post(`/api/users/${user.id}/approve`, {});
      setActionSuccess(`${user.name} was approved.`);
      await fetchUsers();
    } catch (err) {
      setActionError(
        err instanceof ApiClientError
          ? err.message
          : 'Failed to approve patient.',
      );
    } finally {
      setApprovingUserId(null);
    }
  }

  if (loading) {
    return <LoadingState message="Loading the access register…" />;
  }

  if (error && users.length === 0) {
    return (
      <ErrorState
        title="The access register could not be loaded"
        message={error}
        onRetry={() => {
          setLoading(true);
          void fetchUsers().finally(() => setLoading(false));
        }}
      />
    );
  }

  return (
    <main className="space-y-6">
      <header className="border-rule border-b pb-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-primary inline-flex items-center gap-2 text-[10.5px] font-semibold tracking-[0.08em] uppercase">
              <span className="bg-primary h-1.5 w-1.5 rounded-full" aria-hidden="true" />
              Access & identity
            </p>
            <h1 className="display mt-3 text-[clamp(2rem,4vw,2.85rem)]">
              Who can enter MedOrch
            </h1>
            <p className="lede mt-3 text-[14px]">
              Every account, its role and its approval state. Access is granted
              by role on the server; this register is the administrative record.
            </p>
          </div>

          <Button
            type="button"
            onClick={() => {
              setCreateOpen((current) => !current);
              setCreateError(null);
            }}
          >
            <UserPlus size={15} weight="bold" aria-hidden="true" />
            {createOpen ? 'Close new account' : 'Create account'}
          </Button>
        </div>

        <div className="border-rule-soft mt-6 grid gap-5 border-t pt-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-center">
          <dl className="grid grid-cols-2 gap-x-7 gap-y-3 sm:grid-cols-4">
            {[
              { term: 'Accounts', value: counts.total },
              { term: 'Active', value: counts.active },
              { term: 'Awaiting approval', value: counts.pending },
              { term: 'Restricted', value: counts.restricted },
            ].map((item) => (
              <div key={item.term}>
                <dt className="text-ink-muted text-[10.5px] font-medium">
                  {item.term}
                </dt>
                <dd className="text-ink mt-1 font-mono text-[21px] leading-none tabular-nums">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>

          <div>
            <div className="bg-surface-muted flex h-2 overflow-hidden rounded-[2px]">
              {roleCounts.map((entry) => (
                <span
                  key={entry.role}
                  className={ROLE_META[entry.role].dot}
                  style={{
                    width: `${(entry.count / Math.max(1, users.length)) * 100}%`,
                  }}
                  title={`${formatRole(entry.role)}: ${entry.count}`}
                />
              ))}
            </div>
            <div className="text-ink-subtle mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px]">
              {roleCounts.map((entry) => (
                <span
                  key={entry.role}
                  className="inline-flex items-center gap-1"
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${ROLE_META[entry.role].dot}`}
                    aria-hidden="true"
                  />
                  {entry.role} {entry.count}
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      {actionSuccess ? (
        <p
          role="status"
          className="border-success/25 bg-success-soft text-success rounded-[var(--radius-control)] border px-4 py-2.5 text-[12.5px]"
        >
          {actionSuccess}
        </p>
      ) : null}

      {actionError ? (
        <p
          role="alert"
          className="border-danger-border bg-danger-soft text-danger rounded-[var(--radius-control)] border px-4 py-2.5 text-[12.5px]"
        >
          {actionError}
        </p>
      ) : null}

      {createOpen ? (
        <section
          className="panel overflow-hidden"
          aria-labelledby="create-account-title"
        >
          <div className="border-rule-soft bg-surface-subtle flex items-start justify-between gap-3 border-b px-5 py-3">
            <div>
              <p className="text-ink-subtle text-[10px] font-medium tracking-[0.08em] uppercase">
                Provision account
              </p>
              <h2
                id="create-account-title"
                className="text-ink mt-0.5 text-[15px] font-semibold"
              >
                Create a MedOrch identity
              </h2>
            </div>
            <p className="text-ink-muted max-w-[42ch] text-[11.5px] leading-relaxed">
              Patient accounts still follow verification and approval. Staff
              accounts are granted by role at creation.
            </p>
          </div>

          <form onSubmit={handleCreateUser} className="space-y-4 p-5">
            {createError ? (
              <p
                role="alert"
                className="border-danger-border bg-danger-soft text-danger rounded-[var(--radius-control)] border px-3 py-2 text-[12.5px]"
              >
                {createError}
              </p>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="block">
                <span className="text-ink-secondary text-[12px] font-medium">
                  Full name <span className="text-danger">*</span>
                </span>
                <input
                  required
                  minLength={2}
                  maxLength={100}
                  value={createForm.name}
                  onChange={(event) =>
                    updateCreateForm('name', event.target.value)
                  }
                  className={INPUT}
                />
              </label>

              <label className="block">
                <span className="text-ink-secondary text-[12px] font-medium">
                  Email <span className="text-danger">*</span>
                </span>
                <input
                  type="email"
                  required
                  maxLength={254}
                  value={createForm.email}
                  onChange={(event) =>
                    updateCreateForm('email', event.target.value)
                  }
                  className={INPUT}
                />
              </label>

              <label className="block">
                <span className="text-ink-secondary text-[12px] font-medium">
                  Temporary password <span className="text-danger">*</span>
                </span>
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={12}
                  maxLength={128}
                  value={createForm.password}
                  onChange={(event) =>
                    updateCreateForm('password', event.target.value)
                  }
                  className={INPUT}
                />
                <span className="text-ink-subtle mt-1 block text-[10.5px]">
                  12–128 characters.
                </span>
              </label>

              <label className="block">
                <span className="text-ink-secondary text-[12px] font-medium">
                  Phone
                </span>
                <input
                  type="tel"
                  minLength={7}
                  maxLength={20}
                  value={createForm.phone}
                  onChange={(event) =>
                    updateCreateForm('phone', event.target.value)
                  }
                  className={INPUT}
                />
              </label>

              <label className="block">
                <span className="text-ink-secondary text-[12px] font-medium">
                  Role <span className="text-danger">*</span>
                </span>
                <select
                  required
                  value={createForm.role}
                  onChange={(event) =>
                    updateCreateForm('role', event.target.value)
                  }
                  className={INPUT}
                >
                  <option value="">Select a role</option>
                  {ROLE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {formatRole(option)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-ink-secondary text-[12px] font-medium">
                  Initial status
                </span>
                <select
                  value={createForm.status}
                  onChange={(event) =>
                    updateCreateForm('status', event.target.value)
                  }
                  className={INPUT}
                >
                  <option value="">Server default</option>
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="border-rule-soft flex justify-end gap-2 border-t pt-4">
              <button
                type="button"
                disabled={creating}
                onClick={() => {
                  setCreateOpen(false);
                  setCreateForm(EMPTY_CREATE_FORM);
                  setCreateError(null);
                }}
                className="control text-ink-secondary hover:bg-surface-subtle h-9 px-3.5 text-[12.5px] font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <Button type="submit" size="sm" isLoading={creating}>
                Create account
              </Button>
            </div>
          </form>
        </section>
      ) : null}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(18rem,0.88fr)_minmax(0,1.25fr)]">
        <section aria-label="Account roster" className="panel-flush">
          <div className="border-rule-soft space-y-2.5 border-b p-4">
            <label htmlFor="user-search" className="sr-only">
              Search accounts
            </label>
            <div className="control flex h-10 items-center gap-2 px-3">
              <MagnifyingGlass
                size={14}
                className="text-ink-subtle shrink-0"
                aria-hidden="true"
              />
              <input
                id="user-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name, email or phone"
                className="text-ink placeholder:text-ink-subtle w-full min-w-0 border-0 bg-transparent text-[13px] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="sr-only">Role</span>
                <select
                  value={role}
                  onChange={(event) =>
                    setRole(event.target.value as UserRole | 'ALL')
                  }
                  className="control text-ink-secondary h-9 w-full px-2 text-[11.5px] outline-none"
                >
                  <option value="ALL">All roles</option>
                  {ROLE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {formatRole(option)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="sr-only">Status</span>
                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as UserStatus | 'ALL')
                  }
                  className="control text-ink-secondary h-9 w-full px-2 text-[11.5px] outline-none"
                >
                  <option value="ALL">All statuses</option>
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="No matching accounts"
                description="Change the search, role or status filter."
              />
            </div>
          ) : (
            <ul className="divide-rule-soft max-h-[40rem] divide-y overflow-y-auto">
              {filteredUsers.map((user) => {
                const active = selected?.id === user.id;
                const meta = ROLE_META[user.role];

                return (
                  <li key={user.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(user.id)}
                      aria-pressed={active}
                      className={`flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors ${
                        active ? 'bg-pine-soft' : 'hover:bg-surface-subtle'
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                          active
                            ? 'bg-pine text-white'
                            : 'bg-surface-muted text-ink-secondary'
                        }`}
                        aria-hidden="true"
                      >
                        {initials(user.name)}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="text-ink truncate text-[13px] font-semibold">
                            {user.name}
                          </span>
                          <span
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${meta.dot}`}
                            aria-hidden="true"
                          />
                        </span>
                        <span className="text-ink-muted mt-0.5 block truncate text-[11.5px]">
                          {user.email}
                        </span>
                        <span className="mt-1 flex items-center gap-2">
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold ${meta.tone}`}
                          >
                            {formatRole(user.role)}
                          </span>
                          <UserStatusBadge status={user.status} />
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="border-rule-soft text-ink-subtle flex items-center justify-between border-t px-4 py-2.5 text-[10.5px]">
            <span>
              {filteredUsers.length} of {users.length} accounts
            </span>
            <span>Pending first</span>
          </div>
        </section>

        {selected ? (
          <article
            className="panel overflow-hidden"
            aria-labelledby="account-title"
          >
            <div className="border-rule-soft border-b px-5 py-4 sm:px-6">
              <div className="flex items-start gap-4">
                <span
                  className="bg-pine flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[14px] font-semibold text-white"
                  aria-hidden="true"
                >
                  {initials(selected.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-ink-subtle text-[10px] font-medium tracking-[0.08em] uppercase">
                        Account identity
                      </p>
                      <h2
                        id="account-title"
                        className="text-ink mt-0.5 truncate text-[19px] leading-tight font-semibold"
                      >
                        {selected.name}
                      </h2>
                    </div>
                    <UserStatusBadge status={selected.status} />
                  </div>
                  <p className="text-ink-muted mt-1 text-[12.5px] break-all">
                    {selected.email}
                  </p>
                  <p className="text-ink-subtle mt-1.5 font-mono text-[10.5px]">
                    ID {selected.id.slice(0, 8)} · joined{' '}
                    {formatDate(selected.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-rule-soft bg-rule grid gap-px border-b sm:grid-cols-2">
              <div className="bg-sheet px-5 py-4">
                <p className="text-ink-subtle text-[10.5px] font-medium">
                  Role and access
                </p>
                <span
                  className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${ROLE_META[selected.role].tone}`}
                >
                  {formatRole(selected.role)}
                </span>
                <p className="text-ink-secondary mt-2 text-[12px] leading-relaxed">
                  {ROLE_META[selected.role].scope}
                </p>
              </div>

              <div className="bg-sheet px-5 py-4">
                <p className="text-ink-subtle text-[10.5px] font-medium">
                  Contact
                </p>
                <dl className="mt-2 space-y-2">
                  <div>
                    <dt className="text-ink-subtle text-[10.5px]">Phone</dt>
                    <dd className="text-ink mt-0.5 text-[12.5px]">
                      {selected.phone || 'Not recorded'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ink-subtle text-[10.5px]">
                      Email verification / approval
                    </dt>
                    <dd className="text-ink mt-0.5 text-[12.5px]">
                      {selected.approvedAt
                        ? `Approved ${formatDate(selected.approvedAt)}`
                        : 'Not yet approved'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="px-5 py-4 sm:px-6">
              <h3 className="text-ink text-[13px] font-semibold">
                Approval and record state
              </h3>

              {selected.role === 'PATIENT' && selected.status === 'PENDING' ? (
                <div className="border-warning/25 bg-warning-soft mt-3 rounded-[var(--radius-control)] border px-4 py-3">
                  <p className="text-ink text-[12.5px] font-semibold">
                    Approval required
                  </p>
                  <p className="text-ink-secondary mt-1 text-[11.5px] leading-relaxed">
                    This patient has registered but cannot reach their
                    appointment record until an administrator approves the
                    account.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    className="mt-3"
                    disabled={approvingUserId !== null}
                    isLoading={approvingUserId === selected.id}
                    onClick={() => void handleApprove(selected)}
                  >
                    Approve patient account
                  </Button>
                </div>
              ) : (
                <div className="border-rule-soft mt-3 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
                  <p className="text-ink-muted text-[12px]">
                    {selected.status === 'ACTIVE'
                      ? 'Account is active and can sign in.'
                      : selected.status === 'PENDING'
                        ? 'Account is waiting on a lifecycle step.'
                        : selected.status === 'SUSPENDED'
                          ? 'Account is suspended and outside the active access set.'
                          : 'Account was rejected and has no active access.'}
                  </p>
                  <span className="text-ink-subtle font-mono text-[10.5px]">
                    Updated {formatDate(selected.updatedAt)}
                  </span>
                </div>
              )}
            </div>
          </article>
        ) : (
          <section className="panel p-6">
            <EmptyState
              title="No account selected"
              description="Choose an identity from the roster to inspect its access grant."
            />
          </section>
        )}
      </div>
    </main>
  );
}
