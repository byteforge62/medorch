'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { apiClient, ApiClientError } from '@/lib/api/client';

import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Button } from '@/components/ui/Button';

type DoctorStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';

const STATUS_OPTIONS: DoctorStatus[] = [
  'PENDING',
  'ACTIVE',
  'SUSPENDED',
  'REJECTED',
];
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

const EMPTY_DOCTOR_FORM: CreateDoctorForm = {
  userId: '',
  departmentId: '',
  specialization: '',
  licenseNumber: '',
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
  }).format(date);
}

export function DoctorDirectory() {
  const { data: session } = useSession();

  const [updatingDoctorId, setUpdatingDoctorId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<DoctorStatus | 'ALL'>('ALL');
  const [specialty, setSpecialty] = useState<string>('ALL');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [savingDoctor, setSavingDoctor] = useState(false);
  const [createError, setCreateError] = useState('');

  const [doctorCandidates, setDoctorCandidates] = useState<DoctorCandidate[]>(
    [],
  );

  const [departments, setDepartments] = useState<DepartmentOption[]>([]);

  const [createForm, setCreateForm] =
    useState<CreateDoctorForm>(EMPTY_DOCTOR_FORM);

  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  const [editForm, setEditForm] = useState({
    departmentId: '',
    specialization: '',
    licenseNumber: '',
  });

  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  // Escape closes the mobile profile sheet, matching the backdrop affordance.
  useEffect(() => {
    if (!selectedDoctorId) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedDoctorId(null);
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedDoctorId]);

  useEffect(() => {
    let cancelled = false;

    async function fetchDoctors() {
      try {
        const response = await apiClient.get<Doctor[]>('/api/doctors');

        if (!cancelled) {
          setDoctors(response ?? []);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(
            fetchError instanceof ApiClientError
              ? fetchError.message
              : 'Failed to load doctors.',
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

  function startEditingDoctor(doctor: Doctor) {
    setEditingDoctor(doctor);
    setEditError('');

    setEditForm({
      departmentId: doctor.departmentId ?? '',
      specialization: doctor.specialization ?? '',
      licenseNumber: doctor.licenseNumber ?? '',
    });
  }

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

      const matchesStatus = status === 'ALL' || doctor.user.status === status;

      const matchesSpecialty =
        specialty === 'ALL' ||
        (doctor.specialization?.trim() || 'Unspecified') === specialty;

      return matchesSearch && matchesStatus && matchesSpecialty;
    });
  }, [doctors, search, status, specialty]);

  const eligibleDoctorUsers = useMemo(
    () =>
      doctorCandidates.filter(
        (candidate) =>
          candidate.role === 'DOCTOR' && candidate.doctorProfile === null,
      ),
    [doctorCandidates],
  );

  const counts = useMemo(
    () => ({
      total: doctors.length,
      active: doctors.filter((doctor) => doctor.user.status === 'ACTIVE')
        .length,
      pending: doctors.filter((doctor) => doctor.user.status === 'PENDING')
        .length,
      other: doctors.filter(
        (doctor) =>
          doctor.user.status === 'SUSPENDED' ||
          doctor.user.status === 'REJECTED',
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

  async function handleUpdateDoctor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (session?.user?.role !== 'ADMIN' || !editingDoctor) {
      return;
    }

    setSavingEdit(true);
    setEditError('');

    const departmentId = editForm.departmentId || null;
    const specialization = editForm.specialization.trim() || null;
    const licenseNumber = editForm.licenseNumber.trim() || null;

    try {
      await apiClient.patch<unknown>(`/api/doctors/${editingDoctor.id}`, {
        departmentId,
        specialization,
        licenseNumber,
      });

      const selectedDepartment =
        departments.find((department) => department.id === departmentId) ??
        null;

      setDoctors((current) =>
        current.map((doctor) =>
          doctor.id === editingDoctor.id
            ? {
                ...doctor,
                departmentId,
                specialization,
                licenseNumber,
                department: selectedDepartment,
              }
            : doctor,
        ),
      );

      setEditingDoctor(null);
      setEditError('');
    } catch (updateError) {
      setEditError(
        updateError instanceof ApiClientError
          ? updateError.message
          : 'Failed to update the doctor profile.',
      );
    } finally {
      setSavingEdit(false);
    }
  }

  const specialtyGroups = useMemo(() => {
    const groups = new Map<string, number>();

    doctors.forEach((doctor) => {
      const key = doctor.specialization?.trim() || 'Unspecified';
      groups.set(key, (groups.get(key) ?? 0) + 1);
    });

    return [...groups.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [doctors]);

  const departmentCount = useMemo(() => {
    const set = new Set<string>();

    doctors.forEach((doctor) => {
      if (doctor.department?.name) set.add(doctor.department.name);
    });

    return set.size;
  }, [doctors]);

  const filteredSpecialtyCount = useMemo(() => {
    const set = new Set<string>();

    filteredDoctors.forEach((doctor) => {
      set.add(doctor.specialization?.trim() || 'Unspecified');
    });

    return set.size;
  }, [filteredDoctors]);

  const activeDoctor =
    filteredDoctors.find((doctor) => doctor.id === selectedDoctorId) ??
    filteredDoctors[0] ??
    null;

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  const isAdmin = session?.user?.role === 'ADMIN';

  const BAND_TONES = [
    'bg-primary',
    'bg-primary/75',
    'bg-primary/55',
    'bg-primary/40',
    'bg-primary/28',
    'bg-primary/18',
  ];

  const statusMeta: Record<
    DoctorStatus,
    { label: string; short: string; dot: string; chip: string; action: string }
  > = {
    ACTIVE: {
      label: 'Active',
      short: 'Active',
      dot: 'bg-success',
      chip: 'bg-success-soft text-success',
      action: 'Approve',
    },
    PENDING: {
      label: 'Pending approval',
      short: 'Pending',
      dot: 'bg-warning',
      chip: 'bg-warning-soft text-warning',
      action: 'Return to pending',
    },
    SUSPENDED: {
      label: 'Suspended',
      short: 'Suspended',
      dot: 'bg-[#5b93b8]',
      chip: 'bg-primary-soft text-primary',
      action: 'Suspend',
    },
    REJECTED: {
      label: 'Rejected',
      short: 'Rejected',
      dot: 'bg-danger',
      chip: 'bg-danger-soft text-danger',
      action: 'Reject',
    },
  };

  const bandTotal = Math.max(1, doctors.length);
  const restricted = counts.other;

  const resetFilters = () => {
    setSearch('');
    setStatus('ALL');
    setSpecialty('ALL');
  };

  const renderProfile = (doctor: Doctor) => {
    const name = doctor.user.name?.trim() || 'Unnamed doctor';
    const initials =
      name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('') || '—';

    const meta = statusMeta[doctor.user.status];

    const checks = [
      { label: 'Department assigned', ok: Boolean(doctor.department) },
      { label: 'Specialty recorded', ok: Boolean(doctor.specialization?.trim()) },
      { label: 'Licence number on file', ok: Boolean(doctor.licenseNumber?.trim()) },
      { label: 'Contact email on record', ok: Boolean(doctor.user.email) },
    ];

    return (
      <div className="flex h-full flex-col">
        <div className="border-rule-soft border-b px-5 py-4">
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="bg-primary text-white flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] font-mono text-[13px] font-semibold"
            >
              {initials}
            </span>

            <div className="min-w-0">
              <p className="text-ink-subtle text-[9.5px] font-semibold tracking-[0.14em] uppercase">
                Clinician profile
              </p>
              <h2 className="text-ink mt-0.5 text-[17px] leading-tight font-semibold">
                {name}
              </h2>
              <p className="text-ink-muted mt-0.5 text-[12px]">
                {doctor.specialization?.trim() || 'Specialty not recorded'}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${meta.chip}`}
            >
              <span className={`${meta.dot} h-1.5 w-1.5 rounded-full`} aria-hidden="true" />
              {meta.label}
            </span>
            {doctor.department ? (
              <span className="text-ink-muted text-[11px]">{doctor.department.name}</span>
            ) : (
              <span className="text-ink-subtle text-[11px]">No department</span>
            )}
          </div>
        </div>

        <dl className="divide-rule-soft divide-y">
          {[
            { term: 'Department', detail: doctor.department?.name ?? 'Unassigned' },
            {
              term: 'Licence',
              detail: doctor.licenseNumber?.trim() || 'Not recorded',
              mono: true,
            },
            { term: 'Email', detail: doctor.user.email },
            { term: 'Profile since', detail: formatDate(doctor.createdAt) },
          ].map((row) => (
            <div key={row.term} className="flex items-baseline justify-between gap-4 px-5 py-2.5">
              <dt className="text-ink-muted shrink-0 text-[11.5px]">{row.term}</dt>
              <dd
                className={`text-ink min-w-0 truncate text-right text-[12px] font-medium ${
                  row.mono ? 'font-mono' : ''
                }`}
                title={row.detail}
              >
                {row.detail}
              </dd>
            </div>
          ))}
        </dl>

        <div className="border-rule-soft border-b px-5 py-4">
          <p className="text-ink-subtle text-[9.5px] font-semibold tracking-[0.14em] uppercase">
            Profile completeness
          </p>

          <ul className="mt-2 space-y-1.5">
            {checks.map((check) => (
              <li key={check.label} className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={`h-1.5 w-1.5 rounded-[1px] ${
                    check.ok ? 'bg-success' : 'bg-rule-strong'
                  }`}
                />
                <span
                  className={`text-[11.5px] ${check.ok ? 'text-ink-secondary' : 'text-ink-subtle'}`}
                >
                  {check.label}
                </span>
                {!check.ok ? (
                  <span className="text-ink-subtle ml-auto text-[10px]">Missing</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>

        {isAdmin ? (
          <div className="mt-auto px-5 py-4">
            <p className="text-ink-subtle text-[9.5px] font-semibold tracking-[0.14em] uppercase">
              Account governance
            </p>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map((option) => {
                const optionMeta = statusMeta[option];
                const current = doctor.user.status === option;

                return (
                  <button
                    key={option}
                    type="button"
                    disabled={current || updatingDoctorId === doctor.id}
                    aria-pressed={current}
                    onClick={() => void handleStatusChange(doctor.id, option)}
                    className={`rounded-[5px] border px-2 py-1 text-[11px] font-medium transition-colors duration-150 ${
                      current
                        ? 'border-rule bg-surface-subtle text-ink-muted'
                        : 'border-rule text-ink-secondary hover:border-rule-strong hover:text-ink cursor-pointer'
                    } disabled:cursor-not-allowed`}
                  >
                    {optionMeta.action}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={() => startEditingDoctor(doctor)}
                className="text-primary cursor-pointer text-[11.5px] font-semibold"
              >
                Edit clinical profile
              </button>

              <a
                href={`mailto:${doctor.user.email}`}
                className="text-ink-subtle hover:text-ink text-[11.5px]"
              >
                Contact
              </a>
            </div>

            {actionError ? (
              <p role="alert" className="text-danger mt-2 text-[11.5px]">
                {actionError}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-ink-subtle mt-auto px-5 py-4 text-[11.5px]">
            Read-only view. Account governance requires administrator access.
          </p>
        )}
      </div>
    );
  };

  return (
    <main className="space-y-6">
      {/* Masthead — editorial title paired with an approval ledger */}
      <header className="border-rule-soft grid gap-6 border-b pb-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <p className="text-ink-muted inline-flex items-center gap-2 text-[10.5px] font-semibold tracking-[0.16em] uppercase">
            <span className="bg-primary h-px w-6" aria-hidden="true" />
            Medical staff office
          </p>

          <h1 className="display text-ink mt-3 text-[clamp(2.1rem,4.2vw,3.1rem)] leading-[1.02]">
            Clinical Workforce
          </h1>

          <p className="text-ink-muted mt-3 max-w-[62ch] text-[14px] leading-relaxed">
            The hospital&apos;s medical staff, arranged by specialty. Select a clinician to
            review their credentials, department and account standing.
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4 lg:gap-x-7">
          {[
            { term: 'Profiles', value: counts.total },
            { term: 'Approved', value: counts.active },
            { term: 'Awaiting review', value: counts.pending },
            { term: 'Restricted', value: restricted },
          ].map((item) => (
            <div key={item.term} className="border-rule-soft border-l pl-3">
              <dt className="text-ink-subtle text-[9.5px] font-semibold tracking-[0.12em] uppercase">
                {item.term}
              </dt>
              <dd className="text-ink mt-1 font-mono text-[22px] leading-none tabular-nums">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </header>

      {/* Specialty composition — proportional, interactive legend */}
      <section aria-label="Specialty composition">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-ink text-[12px] font-semibold tracking-[0.06em] uppercase">
            Specialty composition
          </h2>
          <p className="text-ink-subtle text-[11.5px]">
            {specialtyGroups.length}{' '}
            {specialtyGroups.length === 1 ? 'specialty' : 'specialties'} across{' '}
            {departmentCount} {departmentCount === 1 ? 'department' : 'departments'}
          </p>
        </div>

        <div
          className="bg-surface-muted mt-2.5 flex h-2.5 w-full gap-[2px] overflow-hidden rounded-[2px]"
          role="img"
          aria-label="Proportional distribution of clinicians by specialty"
        >
          {specialtyGroups.map((group, index) => (
            <span
              key={group.name}
              className={`h-full transition-[width,opacity] duration-300 ease-out motion-reduce:transition-none ${BAND_TONES[index % BAND_TONES.length]}`}
              style={{
                width: `${(group.count / bandTotal) * 100}%`,
                opacity: specialty === 'ALL' || specialty === group.name ? 1 : 0.3,
              }}
              title={`${group.name}: ${group.count}`}
            />
          ))}
        </div>

        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
          <li>
            <button
              type="button"
              onClick={() => setSpecialty('ALL')}
              aria-pressed={specialty === 'ALL'}
              className={`cursor-pointer text-[11.5px] transition-colors duration-150 ${
                specialty === 'ALL'
                  ? 'text-ink font-semibold underline decoration-1 underline-offset-4'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              All specialties
              <span className="text-ink-subtle ml-1.5 font-mono text-[10.5px]">
                {doctors.length}
              </span>
            </button>
          </li>

          {specialtyGroups.map((group) => (
            <li key={group.name}>
              <button
                type="button"
                onClick={() =>
                  setSpecialty((current) => (current === group.name ? 'ALL' : group.name))
                }
                aria-pressed={specialty === group.name}
                className={`cursor-pointer text-[11.5px] transition-colors duration-150 ${
                  specialty === group.name
                    ? 'text-ink font-semibold underline decoration-1 underline-offset-4'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                {group.name}
                <span className="text-ink-subtle ml-1.5 font-mono text-[10.5px]">
                  {group.count}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {isAdmin ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              setCreateError('');
              setCreateOpen((current) => !current);
            }}
            className="control text-ink hover:bg-surface-subtle cursor-pointer px-3 py-1.5 text-[12px] font-semibold"
          >
            {createOpen ? 'Close new profile form' : 'Create doctor profile'}
          </button>
        </div>
      ) : null}

      {isAdmin && createOpen ? (
        <section className="panel px-5 py-5">
          <form onSubmit={handleCreateDoctor} className="space-y-5">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="text-ink text-[15px] font-semibold">Create doctor profile</h2>
              <p className="text-ink-subtle text-[11.5px]">
                Associates an existing doctor account with a clinical profile.
              </p>
            </div>

            {createError && (
              <div
                role="alert"
                className="border-danger-soft bg-danger-soft text-danger rounded-[var(--radius-control)] border px-4 py-2.5 text-[13px]"
              >
                {createError}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-ink-secondary mb-1.5 block text-[12px] font-medium">
                  Doctor account <span aria-hidden="true">*</span>
                </span>
                <select
                  required
                  value={createForm.userId}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      userId: event.target.value,
                    }))
                  }
                  className="control text-ink w-full px-3 py-2 text-[13px] outline-none"
                >
                  <option value="">Select a doctor account</option>
                  {eligibleDoctorUsers.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.name || 'Unnamed doctor'} — {candidate.email}
                    </option>
                  ))}
                </select>
                {eligibleDoctorUsers.length === 0 && (
                  <span className="text-ink-subtle mt-1.5 block text-[11px]">
                    No eligible doctor accounts are available.
                  </span>
                )}
              </label>

              <label className="block">
                <span className="text-ink-secondary mb-1.5 block text-[12px] font-medium">
                  Department
                </span>
                <select
                  value={createForm.departmentId}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      departmentId: event.target.value,
                    }))
                  }
                  className="control text-ink w-full px-3 py-2 text-[13px] outline-none"
                >
                  <option value="">No department assigned</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-ink-secondary mb-1.5 block text-[12px] font-medium">
                  Specialization
                </span>
                <input
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
                  className="control text-ink placeholder:text-ink-subtle w-full px-3 py-2 text-[13px] outline-none"
                />
              </label>

              <label className="block">
                <span className="text-ink-secondary mb-1.5 block text-[12px] font-medium">
                  License number
                </span>
                <input
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
                  className="control text-ink placeholder:text-ink-subtle w-full px-3 py-2 text-[13px] outline-none"
                />
              </label>
            </div>

            <div className="border-rule-soft flex justify-end border-t pt-4">
              <Button type="submit" disabled={savingDoctor || eligibleDoctorUsers.length === 0}>
                {savingDoctor ? 'Creating profile…' : 'Create profile'}
              </Button>
            </div>
          </form>
        </section>
      ) : null}

      {isAdmin && editingDoctor ? (
        <section className="panel px-5 py-5">
          <form onSubmit={handleUpdateDoctor} className="space-y-5">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="text-ink text-[15px] font-semibold">Edit profile</h2>
              <p className="text-ink-muted text-[12px]">
                {editingDoctor.user.name || editingDoctor.user.email}
              </p>
            </div>

            {editError && (
              <div
                role="alert"
                className="border-danger-soft bg-danger-soft text-danger rounded-[var(--radius-control)] border px-4 py-2.5 text-[13px]"
              >
                {editError}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-3">
              <label className="block">
                <span className="text-ink-secondary mb-1.5 block text-[12px] font-medium">
                  Department
                </span>
                <select
                  value={editForm.departmentId}
                  onChange={(event) =>
                    setEditForm((current) => ({ ...current, departmentId: event.target.value }))
                  }
                  className="control text-ink w-full px-3 py-2 text-[13px] outline-none"
                >
                  <option value="">No department assigned</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-ink-secondary mb-1.5 block text-[12px] font-medium">
                  Specialization
                </span>
                <input
                  type="text"
                  maxLength={150}
                  value={editForm.specialization}
                  onChange={(event) =>
                    setEditForm((current) => ({ ...current, specialization: event.target.value }))
                  }
                  className="control text-ink w-full px-3 py-2 text-[13px] outline-none"
                />
              </label>

              <label className="block">
                <span className="text-ink-secondary mb-1.5 block text-[12px] font-medium">
                  License number
                </span>
                <input
                  type="text"
                  maxLength={100}
                  value={editForm.licenseNumber}
                  onChange={(event) =>
                    setEditForm((current) => ({ ...current, licenseNumber: event.target.value }))
                  }
                  className="control text-ink w-full px-3 py-2 text-[13px] outline-none"
                />
              </label>
            </div>

            <div className="border-rule-soft flex justify-end gap-2 border-t pt-4">
              <button
                type="button"
                onClick={() => {
                  setEditingDoctor(null);
                  setEditError('');
                }}
                className="control text-ink-secondary hover:bg-surface-subtle cursor-pointer px-3.5 py-2 text-[13px] font-semibold"
              >
                Cancel
              </button>
              <Button type="submit" disabled={savingEdit}>
                {savingEdit ? 'Saving changes…' : 'Save changes'}
              </Button>
            </div>
          </form>
        </section>
      ) : null}

      {/* Discovery workspace: specialty rail · clinician index · profile */}
      <section
        aria-label="Clinician directory"
        className="border-rule overflow-hidden rounded-[12px] border bg-[var(--sheet)]"
      >
        <div className="grid lg:grid-cols-[10.5rem_minmax(0,1fr)_18rem]">
          <nav
            aria-label="Filter by specialty"
            className="border-rule-soft bg-surface-subtle min-w-0 border-b px-2 py-2 lg:border-r lg:border-b-0 lg:py-3"
          >
            <p className="text-ink-subtle hidden px-2 pb-2 text-[9.5px] font-semibold tracking-[0.14em] uppercase lg:block">
              Specialty
            </p>

            <ul className="flex w-full min-w-0 items-stretch gap-1 overflow-x-auto pb-0.5 lg:flex-col lg:overflow-visible lg:pb-0">
              <li className="shrink-0">
                <button
                  type="button"
                  onClick={() => setSpecialty('ALL')}
                  aria-pressed={specialty === 'ALL'}
                  className={`w-full cursor-pointer rounded-[5px] px-2 py-1.5 text-left text-[11.5px] whitespace-nowrap transition-colors duration-150 ${
                    specialty === 'ALL'
                      ? 'bg-[var(--sheet)] text-ink font-semibold shadow-[var(--shadow-sm)]'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  All clinicians
                </button>
              </li>

              {specialtyGroups.map((group) => (
                <li key={group.name} className="shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      setSpecialty((current) => (current === group.name ? 'ALL' : group.name))
                    }
                    aria-pressed={specialty === group.name}
                    className={`flex w-full cursor-pointer items-baseline justify-between gap-3 rounded-[5px] px-2 py-1.5 text-left text-[11.5px] whitespace-nowrap transition-colors duration-150 ${
                      specialty === group.name
                        ? 'bg-[var(--sheet)] text-ink font-semibold shadow-[var(--shadow-sm)]'
                        : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    <span className="truncate">{group.name}</span>
                    <span className="text-ink-subtle font-mono text-[10px]">{group.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="min-w-0 border-rule-soft border-b lg:border-r lg:border-b-0">
            <div className="border-rule-soft flex flex-wrap items-center gap-2 border-b px-3 py-2.5">
              <div className="well flex min-w-0 flex-1 items-center px-2.5 py-1.5">
                <label htmlFor="doctor-search" className="sr-only">
                  Search clinicians
                </label>
                <input
                  id="doctor-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, email, licence or department"
                  className="text-ink placeholder:text-ink-subtle w-full min-w-0 border-0 bg-transparent text-[12.5px] outline-none"
                />
              </div>

              <label htmlFor="doctor-status" className="sr-only">
                Account status
              </label>
              <select
                id="doctor-status"
                value={status}
                onChange={(event) => setStatus(event.target.value as DoctorStatus | 'ALL')}
                className="control text-ink px-2 py-1.5 text-[12px] outline-none"
              >
                <option value="ALL">All statuses</option>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {statusMeta[option].label}
                  </option>
                ))}
              </select>

              <span className="text-ink-subtle w-full font-mono text-[10.5px] sm:w-auto sm:pl-1">
                {filteredDoctors.length}/{doctors.length} shown
              </span>
            </div>

            {filteredDoctors.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <p className="text-ink text-[13.5px] font-semibold">
                  {doctors.length === 0 ? 'No clinician profiles' : 'No clinicians match'}
                </p>
                <p className="text-ink-muted mx-auto mt-1 max-w-[38ch] text-[12px]">
                  {doctors.length === 0
                    ? 'Profiles appear here once a doctor account is issued a clinical profile.'
                    : `No profile matches the current search, status and specialty filters (${filteredSpecialtyCount} specialties in scope).`}
                </p>
                {doctors.length > 0 ? (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-primary mt-3 cursor-pointer text-[12px] font-semibold"
                  >
                    Clear filters
                  </button>
                ) : null}
              </div>
            ) : (
              <ul aria-label="Clinician index" className="divide-rule-soft divide-y">
                {filteredDoctors.map((doctor, index) => {
                  const name = doctor.user.name?.trim() || 'Unnamed doctor';
                  const meta = statusMeta[doctor.user.status];
                  const active = selectedDoctorId === doctor.id;

                  return (
                    <li key={doctor.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedDoctorId(doctor.id)}
                        aria-pressed={active}
                        className={`group grid w-full cursor-pointer grid-cols-[1.75rem_minmax(0,1fr)_auto] items-center gap-3 border-l-2 px-3.5 py-3 text-left transition-colors duration-150 ${
                          active
                            ? 'border-primary bg-surface-subtle'
                            : 'hover:bg-surface-subtle/70 border-transparent'
                        }`}
                      >
                        <span className="text-ink-subtle self-start pt-0.5 font-mono text-[10.5px] tabular-nums">
                          {String(index + 1).padStart(2, '0')}
                        </span>

                        <span className="min-w-0">
                          <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                            <span className="text-ink truncate text-[13.5px] font-semibold">
                              {name}
                            </span>
                            {doctor.user.status === 'PENDING' ? (
                              <span className="text-warning text-[10px] font-medium">
                                awaiting approval
                              </span>
                            ) : null}
                          </span>

                          <span className="text-ink-muted mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11.5px]">
                            <span>{doctor.specialization?.trim() || 'Specialty not recorded'}</span>
                            <span className="text-rule-strong" aria-hidden="true">
                              /
                            </span>
                            <span>{doctor.department?.name ?? 'Unassigned'}</span>
                          </span>

                          <span className="text-ink-subtle mt-1 block font-mono text-[10px]">
                            {doctor.licenseNumber?.trim() || 'Licence not recorded'}
                          </span>
                        </span>

                        <span className="flex shrink-0 flex-col items-end gap-1">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${meta.chip}`}
                          >
                            <span
                              className={`${meta.dot} h-1.5 w-1.5 rounded-full`}
                              aria-hidden="true"
                            />
                            {meta.short}
                          </span>
                          <span
                            aria-hidden="true"
                            className="text-ink-subtle text-[11px] opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-aria-pressed:opacity-100"
                          >
                            →
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Desktop contextual profile */}
          <aside
            aria-label="Clinician profile"
            className="hidden bg-[var(--sheet)] lg:sticky lg:top-16 lg:block lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto"
          >
            {activeDoctor ? (
              <div key={activeDoctor.id} className="workforce-panel-enter">
                {renderProfile(activeDoctor)}
              </div>
            ) : (
              <div className="flex h-full min-h-[15rem] flex-col justify-center px-5 py-8">
                <p className="text-ink-subtle text-[9.5px] font-semibold tracking-[0.14em] uppercase">
                  Clinician profile
                </p>
                <p className="text-ink mt-2 text-[13px] font-semibold">No clinician selected</p>
                <p className="text-ink-muted mt-1 text-[12px] leading-relaxed">
                  Choose a name from the index to review credentials, department and account
                  standing.
                </p>
                <p className="text-ink-subtle mt-4 border-t border-rule-soft pt-3 font-mono text-[10.5px]">
                  {filteredSpecialtyCount} specialties · {filteredDoctors.length} profiles in view
                </p>
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* Mobile profile sheet */}
      {selectedDoctorId && activeDoctor ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close clinician profile"
            onClick={() => setSelectedDoctorId(null)}
            className="absolute inset-0 cursor-default bg-[rgb(12_28_40/0.38)]"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Profile for ${activeDoctor.user.name?.trim() || activeDoctor.user.email}`}
            className="workforce-sheet-enter absolute inset-x-0 bottom-0 max-h-[86vh] overflow-y-auto rounded-t-[14px] bg-[var(--sheet)] shadow-[var(--shadow-lg)]"
          >
            <div className="border-rule-soft flex items-center justify-between border-b px-4 py-2">
              <span className="text-ink-subtle font-mono text-[10px] tracking-[0.12em] uppercase">
                Clinician record
              </span>
              <button
                type="button"
                autoFocus
                onClick={() => setSelectedDoctorId(null)}
                className="text-ink-secondary hover:text-ink cursor-pointer px-2 py-1 text-[12px] font-semibold"
              >
                Close
              </button>
            </div>

            {renderProfile(activeDoctor)}
          </div>
        </div>
      ) : null}
    </main>
  );
}
