"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { apiClient, ApiClientError } from "@/lib/api/client";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { UserStatusBadge } from "./UserStatusBadge";
import { UserFilters } from "./UserFilters";

type UserRole =
    | "ADMIN"
    | "DOCTOR"
    | "OT_STAFF"
    | "PATIENT";

type UserStatus =
    | "PENDING"
    | "ACTIVE"
    | "SUSPENDED"
    | "REJECTED";

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
    role: UserRole | "";
    status: UserStatus | "";
}

const EMPTY_CREATE_FORM: CreateUserForm = {
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "",
    status: "",
};

const ROLE_OPTIONS: UserRole[] = ["ADMIN", "DOCTOR", "OT_STAFF", "PATIENT"];
const STATUS_OPTIONS: UserStatus[] = [
    "PENDING",
    "ACTIVE",
    "SUSPENDED",
    "REJECTED",
];

const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white";

function formatDate(value: string | null) {
    if (!value) {
        return "—";
    }

    return new Date(value).toLocaleDateString();
}

function formatRole(role: UserRole) {
    switch (role) {
        case "ADMIN":
            return "Admin";
        case "DOCTOR":
            return "Doctor";
        case "OT_STAFF":
            return "OT Staff";
        case "PATIENT":
            return "Patient";
    }
}

export function UserList() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [role, setRole] = useState<UserRole | "ALL">("ALL");
    const [status, setStatus] =
        useState<UserStatus | "ALL">("ALL");

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
            setLoading(true);
            setError(null);

            const data = await apiClient.get<User[]>(
                "/api/users",
            );

            setUsers(data);
        } catch (err) {
            if (err instanceof ApiClientError) {
                setError(err.message);
            } else {
                setError("Failed to load users.");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function loadUsers() {
            try {
                setLoading(true);
                setError(null);

                const data = await apiClient.get<User[]>("/api/users");

                if (!cancelled) {
                    setUsers(data);
                }
            } catch (err) {
                if (!cancelled) {
                    if (err instanceof ApiClientError) {
                        setError(err.message);
                    } else {
                        setError("Failed to load users.");
                    }
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadUsers();

        return () => {
            cancelled = true;
        };
    }, []);

    const filteredUsers = useMemo(() => {
        const normalizedSearch = search
            .trim()
            .toLowerCase();

        return users.filter((user) => {
            const matchesSearch =
                !normalizedSearch ||
                user.name
                    .toLowerCase()
                    .includes(normalizedSearch) ||
                user.email
                    .toLowerCase()
                    .includes(normalizedSearch);

            const matchesRole =
                role === "ALL" || user.role === role;

            const matchesStatus =
                status === "ALL" || user.status === status;

            return (
                matchesSearch &&
                matchesRole &&
                matchesStatus
            );
        });
    }, [users, search, role, status]);


    function updateCreateForm(field: keyof CreateUserForm, value: string) {
        setCreateForm((current) => ({ ...current, [field]: value }));
    }

    async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const name = createForm.name.trim();
        const email = createForm.email.trim().toLowerCase();
        const phone = createForm.phone.trim();

        if (name.length < 2 || name.length > 100) {
            setCreateError("Name must contain between 2 and 100 characters.");
            return;
        }

        if (createForm.password.length < 12 || createForm.password.length > 128) {
            setCreateError("Password must contain between 12 and 128 characters.");
            return;
        }

        if (!createForm.role) {
            setCreateError("Select a role for this account.");
            return;
        }

        if (phone && (phone.length < 7 || phone.length > 20)) {
            setCreateError("Phone must contain between 7 and 20 characters.");
            return;
        }

        setCreating(true);
        setCreateError(null);

        try {
            await apiClient.post<User>("/api/users", {
                name,
                email,
                password: createForm.password,
                ...(phone ? { phone } : {}),
                role: createForm.role,
                ...(createForm.status ? { status: createForm.status } : {}),
            });

            setActionSuccess(`${name} was created successfully.`);
            setCreateForm(EMPTY_CREATE_FORM);
            setCreateOpen(false);
            await fetchUsers();
        } catch (err) {
            if (err instanceof ApiClientError) {
                setCreateError(err.message);
            } else {
                setCreateError("Failed to create user.");
            }
        } finally {
            setCreating(false);
        }
    }

    const handleApprove = async (user: User) => {
        const confirmed = window.confirm(
            `Approve patient ${user.name}? They will be able to sign in once their account becomes active.`,
        );

        if (!confirmed) return;

        setApprovingUserId(user.id);
        setActionError(null);
        setActionSuccess(null);

        try {
            await apiClient.post(`/api/users/${user.id}/approve`, {});

            setActionSuccess(`${user.name} was approved successfully.`);
            await fetchUsers();
        } catch (err) {
            if (err instanceof ApiClientError) {
                setActionError(err.message);
            } else {
                setActionError('Failed to approve patient.');
            }
        } finally {
            setApprovingUserId(null);
        }
    };


    return (
        <Card>
            <CardHeader>
                <div>
                    <CardTitle>Users</CardTitle>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {filteredUsers.length} of {users.length} users
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setCreateOpen((current) => !current);
                        setCreateError(null);
                    }}
                    className="rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                    {createOpen ? "Close form" : "+ Create user"}
                </button>
            </CardHeader>

            {createOpen && (
                <form
                    onSubmit={handleCreateUser}
                    className="mb-6 space-y-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                >
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                            Create user account
                        </h3>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Provision an account directly. Patient accounts created here
                            should still be verified and approved through the normal
                            lifecycle where required.
                        </p>
                    </div>

                    {createError && (
                        <p
                            role="alert"
                            className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300"
                        >
                            {createError}
                        </p>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <label
                                htmlFor="create-user-name"
                                className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400"
                            >
                                Full name *
                            </label>
                            <input
                                id="create-user-name"
                                required
                                minLength={2}
                                maxLength={100}
                                value={createForm.name}
                                onChange={(event) =>
                                    updateCreateForm("name", event.target.value)
                                }
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="create-user-email"
                                className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400"
                            >
                                Email *
                            </label>
                            <input
                                id="create-user-email"
                                type="email"
                                required
                                maxLength={254}
                                value={createForm.email}
                                onChange={(event) =>
                                    updateCreateForm("email", event.target.value)
                                }
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="create-user-password"
                                className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400"
                            >
                                Temporary password *
                            </label>
                            <input
                                id="create-user-password"
                                type="password"
                                autoComplete="new-password"
                                required
                                minLength={12}
                                maxLength={128}
                                value={createForm.password}
                                onChange={(event) =>
                                    updateCreateForm("password", event.target.value)
                                }
                                className={inputClass}
                            />
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                12–128 characters.
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="create-user-phone"
                                className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400"
                            >
                                Phone
                            </label>
                            <input
                                id="create-user-phone"
                                type="tel"
                                minLength={7}
                                maxLength={20}
                                value={createForm.phone}
                                onChange={(event) =>
                                    updateCreateForm("phone", event.target.value)
                                }
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="create-user-role"
                                className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400"
                            >
                                Role *
                            </label>
                            <select
                                id="create-user-role"
                                required
                                value={createForm.role}
                                onChange={(event) =>
                                    updateCreateForm("role", event.target.value)
                                }
                                className={inputClass}
                            >
                                <option value="">Select a role</option>
                                {ROLE_OPTIONS.map((option) => (
                                    <option key={option} value={option}>
                                        {formatRole(option)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="create-user-status"
                                className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400"
                            >
                                Initial status
                            </label>
                            <select
                                id="create-user-status"
                                value={createForm.status}
                                onChange={(event) =>
                                    updateCreateForm("status", event.target.value)
                                }
                                className={inputClass}
                            >
                                <option value="">Default (server decides)</option>
                                {STATUS_OPTIONS.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            disabled={creating}
                            onClick={() => {
                                setCreateOpen(false);
                                setCreateForm(EMPTY_CREATE_FORM);
                                setCreateError(null);
                            }}
                            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={creating}
                            className="rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                        >
                            {creating ? "Creating..." : "Create user"}
                        </button>
                    </div>
                </form>
            )}

            <div className="mb-5">
                <UserFilters
                    search={search}
                    role={role}
                    status={status}
                    onSearchChange={setSearch}
                    onRoleChange={setRole}
                    onStatusChange={setStatus}
                />
            </div>

            {actionError && (
                <p role="alert" className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
                    {actionError}
                </p>
            )}

            {actionSuccess && (
                <p role="status" className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-300">
                    {actionSuccess}
                </p>
            )}

            {loading ? (
                <LoadingState message="Loading users..." />
            ) : error ? (
                <ErrorState
                    message={error}
                    onRetry={fetchUsers}
                />
            ) : filteredUsers.length === 0 ? (
                <EmptyState
                    title="No users found"
                    description={
                        users.length === 0
                            ? "There are no users to display."
                            : "No users match the selected filters."
                    }
                />
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800">
                                <th className="px-3 py-3 font-medium text-slate-500">
                                    User
                                </th>

                                <th className="px-3 py-3 font-medium text-slate-500">
                                    Phone
                                </th>

                                <th className="px-3 py-3 font-medium text-slate-500">
                                    Role
                                </th>

                                <th className="px-3 py-3 font-medium text-slate-500">
                                    Status
                                </th>

                                <th className="px-3 py-3 font-medium text-slate-500">
                                    Approved
                                </th>

                                <th className="px-3 py-3 font-medium text-slate-500">
                                    Created
                                </th>

                                <th className="px-3 py-3 font-medium text-slate-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr
                                    key={user.id}
                                    className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
                                >
                                    <td className="px-3 py-4">
                                        <div className="font-medium text-slate-900 dark:text-white">
                                            {user.name}
                                        </div>

                                        <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                            {user.email}
                                        </div>
                                    </td>

                                    <td className="px-3 py-4 text-slate-600 dark:text-slate-300">
                                        {user.phone || "—"}
                                    </td>

                                    <td className="px-3 py-4 text-slate-600 dark:text-slate-300">
                                        {formatRole(user.role)}
                                    </td>

                                    <td className="px-3 py-4">
                                        <UserStatusBadge
                                            status={user.status}
                                        />
                                    </td>

                                    <td className="px-3 py-4 text-slate-600 dark:text-slate-300">
                                        {formatDate(user.approvedAt)}
                                    </td>

                                    <td className="px-3 py-4 text-slate-600 dark:text-slate-300">
                                        {formatDate(user.createdAt)}
                                    </td>


                                    <td className="px-3 py-4">
                                        {user.role === "PATIENT" && user.status === "PENDING" && (
                                            <button
                                                type="button"
                                                onClick={() => handleApprove(user)}
                                                disabled={approvingUserId !== null}
                                                className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {approvingUserId === user.id ? "Approving..." : "Approve"}
                                            </button>
                                        )}
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
}