"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useSession } from "next-auth/react";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { apiClient, ApiClientError } from "@/lib/api/client";

type DoctorStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED";

interface DoctorCandidate {
    id: string;
    name: string | null;
    email: string;
    role: string;
    doctorProfile: { id: string } | null;
}

interface DepartmentOption {
    id: string;
    name: string;
}

interface CreateDoctorForm {
    userId: string;
    departmentId: string;
    specialization: string;
    licenseNumber: string;
}

const EMPTY_DOCTOR_FORM: CreateDoctorForm = {
    userId: '',
    departmentId: '',
    specialization: '',
    licenseNumber: '',
};
interface Doctor {
    id: string;
    userId: string;
    departmentId: string | null;
    specialization: string | null;
    licenseNumber: string | null;
    createdAt: string;
    user: {
        id: string;
        name: string | null;
        email: string;
        phone: string | null;
        status: DoctorStatus;
    };
    department: {
        id: string;
        name: string;
    } | null;
}

const STATUS_OPTIONS: DoctorStatus[] = [
    "PENDING",
    "ACTIVE",
    "SUSPENDED",
    "REJECTED",
];

function formatStatus(status: DoctorStatus) {
    return status.replaceAll("_", " ");
}

function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
    }).format(date);
}

export function DoctorDirectory() {
    const { data: session } = useSession();

    const [updatingDoctorId, setUpdatingDoctorId] = useState<string | null>(
        null,
    );
    const [actionError, setActionError] = useState('');
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<DoctorStatus | "ALL">("ALL");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [createOpen, setCreateOpen] = useState(false);
    const [savingDoctor, setSavingDoctor] = useState(false);
    const [createError, setCreateError] = useState('');

    const [doctorCandidates, setDoctorCandidates] = useState<DoctorCandidate[]>(
        [],
    );

    const [departments, setDepartments] = useState<DepartmentOption[]>([]);

    const [createForm, setCreateForm] =
        useState<CreateDoctorForm>(EMPTY_DOCTOR_FORM);

    useEffect(() => {
        let cancelled = false;

        async function fetchDoctors() {
            try {
                const response = await apiClient.get<Doctor[]>("/api/doctors");

                if (!cancelled) {
                    setDoctors(response ?? []);
                }
            } catch (fetchError) {
                if (!cancelled) {
                    setError(
                        fetchError instanceof ApiClientError
                            ? fetchError.message
                            : "Failed to load doctors.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void fetchDoctors();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (session?.user?.role !== 'ADMIN') {
            return;
        }

        let cancelled = false;

        async function loadCreateOptions() {
            try {
                const [usersResponse, departmentsResponse] = await Promise.all([
                    apiClient.get<DoctorCandidate[]>('/api/users'),
                    apiClient.get<DepartmentOption[]>('/api/departments'),
                ]);

                if (!cancelled) {
                    setDoctorCandidates(usersResponse ?? []);
                    setDepartments(departmentsResponse ?? []);
                }
            } catch (optionsError) {
                if (!cancelled) {
                    setCreateError(
                        optionsError instanceof ApiClientError
                            ? optionsError.message
                            : 'Failed to load users and departments.',
                    );
                }
            }
        }

        void loadCreateOptions();

        return () => {
            cancelled = true;
        };
    }, [session?.user?.role]);

    const filteredDoctors = useMemo(() => {
        const query = search.trim().toLowerCase();

        return doctors.filter((doctor) => {
            const matchesSearch =
                !query ||
                [
                    doctor.user.name,
                    doctor.user.email,
                    doctor.user.phone,
                    doctor.specialization,
                    doctor.licenseNumber,
                    doctor.department?.name,
                ].some((value) => value?.toLowerCase().includes(query));

            const matchesStatus =
                status === "ALL" || doctor.user.status === status;

            return matchesSearch && matchesStatus;
        });
    }, [doctors, search, status]);

    const eligibleDoctorUsers = useMemo(
        () =>
            doctorCandidates.filter(
                (candidate) =>
                    candidate.role === "DOCTOR" && candidate.doctorProfile === null,
            ),
        [doctorCandidates],
    );

    const counts = useMemo(
        () => ({
            total: doctors.length,
            active: doctors.filter(
                (doctor) => doctor.user.status === "ACTIVE",
            ).length,
            pending: doctors.filter(
                (doctor) => doctor.user.status === "PENDING",
            ).length,
            other: doctors.filter(
                (doctor) =>
                    doctor.user.status === "SUSPENDED" ||
                    doctor.user.status === "REJECTED",
            ).length,
        }),
        [doctors],
    );

    async function handleStatusChange(
        doctorId: string,
        nextStatus: DoctorStatus,
    ) {
        setUpdatingDoctorId(doctorId);
        setActionError('');

        try {
            const updatedUser = await apiClient.patch<{
                status: DoctorStatus;
            }>(`/api/doctors/${doctorId}/status`, {
                status: nextStatus,
            });

            setDoctors((current) =>
                current.map((doctor) =>
                    doctor.id === doctorId
                        ? {
                            ...doctor,
                            user: {
                                ...doctor.user,
                                status: updatedUser.status,
                            },
                        }
                        : doctor,
                ),
            );
        } catch (updateError) {
            setActionError(
                updateError instanceof ApiClientError
                    ? updateError.message
                    : 'Failed to update doctor status.',
            );
        } finally {
            setUpdatingDoctorId(null);
        }
    }

    async function handleCreateDoctor(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (session?.user?.role !== 'ADMIN') {
            return;
        }

        const selectedUser = eligibleDoctorUsers.find(
            (candidate) => candidate.id === createForm.userId,
        );

        if (!selectedUser) {
            setCreateError(
                'Select a valid doctor user who does not already have a profile.',
            );
            return;
        }

        setSavingDoctor(true);
        setCreateError('');

        try {
            const payload: {
                userId: string;
                departmentId?: string;
                specialization?: string;
                licenseNumber?: string;
            } = {
                userId: createForm.userId,
            };

            if (createForm.departmentId) {
                payload.departmentId = createForm.departmentId;
            }

            if (createForm.specialization.trim()) {
                payload.specialization = createForm.specialization.trim();
            }

            if (createForm.licenseNumber.trim()) {
                payload.licenseNumber = createForm.licenseNumber.trim();
            }

            const createdDoctor = await apiClient.post<Doctor>(
                '/api/doctors',
                payload,
            );

            setDoctors((current) => [
                createdDoctor,
                ...current.filter((doctor) => doctor.id !== createdDoctor.id),
            ]);

            setDoctorCandidates((current) =>
                current.map((candidate) =>
                    candidate.id === createForm.userId
                        ? { ...candidate, doctorProfile: { id: createdDoctor.id } }
                        : candidate,
                ),
            );

            setCreateForm(EMPTY_DOCTOR_FORM);
            setCreateOpen(false);
            setSearch('');
            setStatus('ALL');
        } catch (submissionError) {
            setCreateError(
                submissionError instanceof ApiClientError
                    ? submissionError.message
                    : 'Failed to create the doctor profile.',
            );
        } finally {
            setSavingDoctor(false);
        }
    }

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
                    Clinical Operations
                </p>

                <h1 className="text-2xl font-semibold tracking-tight">
                    Doctor Directory
                </h1>

                <p className="max-w-2xl text-sm text-[var(--color-text-muted)]">
                    Review doctor profiles, departments, specializations, and account
                    approval status.
                </p>
            </section>

            {session?.user?.role === "ADMIN" && (
                <section className="space-y-3">
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => {
                                setCreateError("");
                                setCreateOpen((current) => !current);
                            }}
                            className="rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                        >
                            {createOpen ? "Cancel" : "Create doctor profile"}
                        </button>
                    </div>

                    {createOpen && (
                        <Card>
                            <form onSubmit={handleCreateDoctor} className="space-y-5">
                                <div>
                                    <h2 className="font-semibold">Create doctor profile</h2>
                                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                                        Associate an existing doctor account with a clinical profile.
                                    </p>
                                </div>

                                {createError && (
                                    <div
                                        role="alert"
                                        className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                                    >
                                        {createError}
                                    </div>
                                )}

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="doctor-user"
                                            className="mb-2 block text-sm font-medium"
                                        >
                                            Doctor account <span aria-hidden="true">*</span>
                                        </label>

                                        <select
                                            id="doctor-user"
                                            required
                                            value={createForm.userId}
                                            onChange={(event) =>
                                                setCreateForm((current) => ({
                                                    ...current,
                                                    userId: event.target.value,
                                                }))
                                            }
                                            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                                        >
                                            <option value="">Select a doctor account</option>

                                            {eligibleDoctorUsers.map((candidate) => (
                                                <option key={candidate.id} value={candidate.id}>
                                                    {candidate.name || "Unnamed doctor"} — {candidate.email}
                                                </option>
                                            ))}
                                        </select>

                                        {eligibleDoctorUsers.length === 0 && (
                                            <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                                                No eligible doctor accounts are available.
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="doctor-department"
                                            className="mb-2 block text-sm font-medium"
                                        >
                                            Department
                                        </label>

                                        <select
                                            id="doctor-department"
                                            value={createForm.departmentId}
                                            onChange={(event) =>
                                                setCreateForm((current) => ({
                                                    ...current,
                                                    departmentId: event.target.value,
                                                }))
                                            }
                                            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                                        >
                                            <option value="">No department assigned</option>

                                            {departments.map((department) => (
                                                <option key={department.id} value={department.id}>
                                                    {department.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="doctor-specialization"
                                            className="mb-2 block text-sm font-medium"
                                        >
                                            Specialization
                                        </label>

                                        <input
                                            id="doctor-specialization"
                                            type="text"
                                            maxLength={150}
                                            value={createForm.specialization}
                                            onChange={(event) =>
                                                setCreateForm((current) => ({
                                                    ...current,
                                                    specialization: event.target.value,
                                                }))
                                            }
                                            placeholder="e.g. General Surgery"
                                            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="doctor-license"
                                            className="mb-2 block text-sm font-medium"
                                        >
                                            License number
                                        </label>

                                        <input
                                            id="doctor-license"
                                            type="text"
                                            maxLength={100}
                                            value={createForm.licenseNumber}
                                            onChange={(event) =>
                                                setCreateForm((current) => ({
                                                    ...current,
                                                    licenseNumber: event.target.value,
                                                }))
                                            }
                                            placeholder="Enter license number"
                                            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={savingDoctor || eligibleDoctorUsers.length === 0}
                                        className="rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {savingDoctor ? "Creating profile..." : "Create profile"}
                                    </button>
                                </div>
                            </form>
                        </Card>
                    )}
                </section>
            )}

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Card>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Total doctors
                    </p>
                    <p className="mt-2 text-2xl font-semibold">{counts.total}</p>
                </Card>

                <Card>
                    <p className="text-sm text-[var(--color-text-muted)]">Active</p>
                    <p className="mt-2 text-2xl font-semibold">{counts.active}</p>
                </Card>

                <Card>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Pending approval
                    </p>
                    <p className="mt-2 text-2xl font-semibold">{counts.pending}</p>
                </Card>

                <Card>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Suspended or rejected
                    </p>
                    <p className="mt-2 text-2xl font-semibold">{counts.other}</p>
                </Card>
            </section>

            {actionError && (
                <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {actionError}
                </div>
            )}

            <Card>
                <div className="grid gap-4 md:grid-cols-[1fr_220px]">
                    <div>
                        <label
                            htmlFor="doctor-search"
                            className="mb-2 block text-sm font-medium"
                        >
                            Search doctors
                        </label>

                        <input
                            id="doctor-search"
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Name, email, specialization, license..."
                            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm transition outline-none focus:border-[var(--color-primary)]"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="doctor-status"
                            className="mb-2 block text-sm font-medium"
                        >
                            Account status
                        </label>

                        <select
                            id="doctor-status"
                            value={status}
                            onChange={(event) =>
                                setStatus(event.target.value as DoctorStatus | 'ALL')
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

            {filteredDoctors.length === 0 ? (
                <EmptyState
                    title={
                        doctors.length === 0
                            ? 'No doctor profiles'
                            : 'No matching doctors'
                    }
                    description={
                        doctors.length === 0
                            ? 'Doctor profiles will appear here when they are created.'
                            : 'Try adjusting your search or status filter.'
                    }
                />
            ) : (
                <Card>
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <h2 className="font-semibold">Doctor profiles</h2>

                        <span className="text-sm text-[var(--color-text-muted)]">
                            {filteredDoctors.length}{' '}
                            {filteredDoctors.length === 1 ? 'record' : 'records'}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[820px] text-left text-sm">
                            <thead className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                                <tr>
                                    <th className="px-3 py-3 font-medium">Doctor</th>
                                    <th className="px-3 py-3 font-medium">Specialization</th>
                                    <th className="px-3 py-3 font-medium">Department</th>
                                    <th className="px-3 py-3 font-medium">License number</th>
                                    <th className="px-3 py-3 font-medium">Status</th>
                                    <th className="px-3 py-3 font-medium">Profile created</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredDoctors.map((doctor) => (
                                    <tr
                                        key={doctor.id}
                                        className="border-b border-[var(--color-border)] last:border-0"
                                    >
                                        <td className="px-3 py-4">
                                            <p className="font-medium">
                                                {doctor.user.name || 'Unnamed doctor'}
                                            </p>
                                            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                                                {doctor.user.email}
                                            </p>
                                        </td>

                                        <td className="px-3 py-4">
                                            {doctor.specialization || 'Not specified'}
                                        </td>

                                        <td className="px-3 py-4">
                                            {doctor.department?.name || 'Unassigned'}
                                        </td>

                                        <td className="px-3 py-4 font-mono text-xs">
                                            {doctor.licenseNumber || '—'}
                                        </td>

                                        <td className="px-3 py-4">
                                            {session?.user?.role === 'ADMIN' ? (
                                                <select
                                                    aria-label={`Status for ${doctor.user.name || doctor.user.email}`}
                                                    value={doctor.user.status}
                                                    disabled={updatingDoctorId === doctor.id}
                                                    onChange={(event) =>
                                                        void handleStatusChange(
                                                            doctor.id,
                                                            event.target.value as DoctorStatus,
                                                        )
                                                    }
                                                    className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-2 text-sm outline-none focus:border-[var(--color-primary)] disabled:opacity-50"
                                                >
                                                    {STATUS_OPTIONS.map((option) => (
                                                        <option key={option} value={option}>
                                                            {formatStatus(option)}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <Badge>{formatStatus(doctor.user.status)}</Badge>
                                            )}
                                        </td>

                                        <td className="px-3 py-4 whitespace-nowrap">
                                            {formatDate(doctor.createdAt)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </main>
    );
}