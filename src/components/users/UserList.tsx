"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

    return (
        <Card>
            <CardHeader>
                <div>
                    <CardTitle>Users</CardTitle>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {filteredUsers.length} of {users.length} users
                    </p>
                </div>
            </CardHeader>

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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
}