'use client';

type UserRole = 'ADMIN' | 'DOCTOR' | 'OT_STAFF' | 'PATIENT';

type UserStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';

interface UserFiltersProps {
  search: string;
  role: UserRole | 'ALL';
  status: UserStatus | 'ALL';
  onSearchChange: (value: string) => void;
  onRoleChange: (value: UserRole | 'ALL') => void;
  onStatusChange: (value: UserStatus | 'ALL') => void;
}

export function UserFilters({
  search,
  role,
  status,
  onSearchChange,
  onRoleChange,
  onStatusChange,
}: UserFiltersProps) {
  return (
    <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
      <div>
        <label
          htmlFor="user-search"
          className="text-foreground-muted mb-1.5 block text-xs font-medium"
        >
          Search
        </label>

        <input
          id="user-search"
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by name or email..."
          className="border-border-strong bg-surface text-foreground focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-3 py-2 text-sm transition outline-none focus:ring-2"
        />
      </div>

      <div>
        <label
          htmlFor="user-role"
          className="text-foreground-muted mb-1.5 block text-xs font-medium"
        >
          Role
        </label>

        <select
          id="user-role"
          value={role}
          onChange={(event) =>
            onRoleChange(event.target.value as UserRole | 'ALL')
          }
          className="border-border-strong bg-surface text-foreground focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-3 py-2 text-sm transition outline-none focus:ring-2"
        >
          <option value="ALL">All roles</option>
          <option value="ADMIN">Admin</option>
          <option value="DOCTOR">Doctor</option>
          <option value="OT_STAFF">OT Staff</option>
          <option value="PATIENT">Patient</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="user-status"
          className="text-foreground-muted mb-1.5 block text-xs font-medium"
        >
          Status
        </label>

        <select
          id="user-status"
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value as UserStatus | 'ALL')
          }
          className="border-border-strong bg-surface text-foreground focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-3 py-2 text-sm transition outline-none focus:ring-2"
        >
          <option value="ALL">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>
    </div>
  );
}
