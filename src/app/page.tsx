import Link from 'next/link';
import { LandingMobileNav } from '@/components/landing/LandingMobileNav';


function IconCalendar({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

function IconBuilding({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4"
      />
    </svg>
  );
}

function IconCpu({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
      />
    </svg>
  );
}

function IconUsers({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  );
}

function IconPatient({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

function IconBell({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  );
}

function IconShield({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  );
}

function IconLock({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );
}

function IconEye({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

function IconClipboardCheck({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
      />
    </svg>
  );
}

function IconKey({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
      />
    </svg>
  );
}

function IconArrowRight({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M14 5l7 7m0 0l-7 7m7-7H3"
      />
    </svg>
  );
}

function IconCheck({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

function HeroDashboardMock() {
  return (
    <div className="border-border bg-surface rounded-xl border shadow-none">
      {/* Title bar */}

      <div className="border-border flex items-center gap-2 border-b px-4 py-3">
        <div className="flex gap-1.5">
          <span className="bg-danger h-2.5 w-2.5 rounded-full" />

          <span className="bg-warning h-2.5 w-2.5 rounded-full" />

          <span className="bg-success h-2.5 w-2.5 rounded-full" />
        </div>

        <span className="text-foreground-subtle ml-2 text-[11px] font-medium">
          MedOrch — Operations Dashboard
        </span>
      </div>

      {/* Content */}

      <div className="p-4">
        {/* Stats row */}

        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: 'OT Rooms',
              value: '12',
              sub: '3 Available',
              color: 'bg-success',
            },

            {
              label: 'Surgeries',
              value: '8',
              sub: '2 In Progress',
              color: 'bg-primary',
            },

            {
              label: 'Alerts',
              value: '3',
              sub: 'Action Needed',
              color: 'bg-warning',
            },
          ].map((stat) => (
            <div
              key={stat.label}

              className="border-border bg-surface-subtle/80 rounded-lg border p-3"
            >
              <div className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${stat.color}`} />

                <span className="text-foreground-muted text-[10px] font-medium">
                  {stat.label}
                </span>
              </div>

              <p className="text-foreground mt-1 text-lg font-bold">
                {stat.value}
              </p>

              <p className="text-foreground-subtle text-[10px]">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Schedule list mock */}

        <div className="border-border bg-surface-subtle/80 mt-3 rounded-lg border p-3">
          <p className="text-foreground-subtle mb-2 text-[10px] font-semibold tracking-wider uppercase">
            Upcoming Procedures
          </p>

          <div className="space-y-2">
            {[
              {
                time: '09:00',
                procedure: 'Appendectomy',
                room: 'OT-1',
                status: 'Confirmed',
              },

              {
                time: '11:30',
                procedure: 'Knee Replacement',
                room: 'OT-3',
                status: 'Preparing',
              },

              {
                time: '14:00',
                procedure: 'Cardiac Bypass',
                room: 'OT-2',
                status: 'Scheduled',
              },
            ].map((item) => (
              <div
                key={item.time}

                className="bg-surface flex items-center justify-between rounded-md px-2.5 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-foreground-muted font-mono text-[11px] font-medium">
                    {item.time}
                  </span>

                  <span className="text-foreground text-xs font-medium">
                    {item.procedure}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-foreground-subtle text-[10px]">
                    {item.room}
                  </span>

                  <span className="bg-primary-soft text-primary rounded-full px-2 py-0.5 text-[10px] font-medium">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */

export default function Home() {
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { label: 'Platform', href: '#capabilities' },

    { label: 'Capabilities', href: '#workflow' },

    { label: 'Security', href: '#security' },
  ];

  const trustItems = [
    {
      icon: <IconCalendar className="h-5 w-5" />,
      label: 'Surgical Scheduling',
    },

    { icon: <IconBuilding className="h-5 w-5" />, label: 'OT Room Management' },

    { icon: <IconCpu className="h-5 w-5" />, label: 'Equipment Readiness' },

    { icon: <IconUsers className="h-5 w-5" />, label: 'Staff Coordination' },
  ];

  const capabilities = [
    {
      icon: <IconCalendar />,

      title: 'OT Scheduling',

      description:
        'Centralized scheduling for surgical procedures across all operating theatres. Coordinate timing, resources, and staff in a single view.',
    },

    {
      icon: <IconBuilding />,

      title: 'Operating Rooms',

      description:
        'Monitor and manage operating room availability, status, and allocation. Track room readiness and maintenance cycles in real time.',
    },

    {
      icon: <IconCpu />,

      title: 'Equipment',

      description:
        'Track equipment readiness, availability, and allocation for each procedure. Ensure the right instruments are prepared and accounted for.',
    },

    {
      icon: <IconUsers />,

      title: 'Clinical Teams',

      description:
        'Coordinate surgeons, anaesthesiologists, and operating theatre staff. Manage assignments, availability, and team composition per procedure.',
    },

    {
      icon: <IconPatient />,

      title: 'Patients',

      description:
        'Organize patient information linked to surgical schedules. Maintain structured records of procedures, preparation status, and assignments.',
    },

    {
      icon: <IconBell />,

      title: 'Alerts',

      description:
        'Operational alerts for schedule conflicts, equipment issues, and events requiring immediate attention. Stay informed of critical changes.',
    },
  ];

  const workflowSteps = [
    {
      step: '01',

      title: 'Plan',

      description:
        'Define surgical schedules, assign operating rooms, and allocate equipment and staff.',
    },

    {
      step: '02',

      title: 'Coordinate',

      description:
        'Synchronize clinical teams, confirm resource availability, and resolve scheduling conflicts.',
    },

    {
      step: '03',

      title: 'Execute',

      description:
        'Track procedures in real time with live room status, staff assignments, and equipment readiness.',
    },

    {
      step: '04',

      title: 'Monitor',

      description:
        'Review operational alerts, audit completed procedures, and identify workflow improvements.',
    },
  ];

  const securityFeatures = [
    {
      icon: <IconShield className="h-5 w-5" />,

      title: 'Role-Based Access',

      description:
        'Granular permissions for administrators, doctors, OT staff, and patients. Each role sees only what they need.',
    },

    {
      icon: <IconLock />,

      title: 'Secure Authentication',

      description:
        'Credential-based authentication with session management. Access is controlled and verified at every interaction.',
    },

    {
      icon: <IconEye />,

      title: 'Controlled Operational Data',

      description:
        'Sensitive scheduling, patient, and equipment data is accessible only to authorized personnel within their scope.',
    },

    {
      icon: <IconClipboardCheck />,

      title: 'Auditability',

      description:
        'Actions within the system are traceable. Maintain operational accountability across all workflow stages.',
    },
  ];

  return (
    <div className="bg-surface text-foreground min-h-screen">
      {/* ─── NAVBAR ─── */}

      <header className="border-border bg-surface/95 sticky top-0 z-50 border-b backdrop-blur-sm">
        <nav
          className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
          aria-label="Main navigation"
        >
          {/* Brand */}

          <Link
            href="/"
            className="flex items-center gap-2"
            aria-label="MedOrch home"
          >
            <div className="bg-primary text-foreground-inverse flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold shadow-none">
              M
            </div>

            <span className="text-foreground text-base font-bold">MedOrch</span>
          </Link>

          {/* Desktop nav links */}

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}

                href={link.href}

                className="text-foreground-secondary hover:text-foreground text-sm font-medium transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop auth actions */}

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"

              className="text-foreground-secondary hover:text-foreground text-sm font-medium transition-colors"
            >
              Sign In
            </Link>

            <Link
              href="/login"

              className="bg-primary text-foreground-inverse hover:bg-primary-hover focus:ring-ring/20 active:bg-primary-active inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium shadow-none transition-colors focus:ring-2 focus:outline-none"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu toggle */}

          <LandingMobileNav navLinks={navLinks} />
        </nav>
      </header>

      <main>
        {/* ─── HERO ─── */}

        <section className="border-border bg-surface-subtle relative overflow-hidden border-b">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Left: Copy */}

              <div>
                <div className="border-border bg-surface text-foreground-secondary mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
                  <span className="bg-success h-1.5 w-1.5 rounded-full" />
                  Operating Theatre Orchestration
                </div>

                <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  Smarter Operating{' '}
                  <span className="text-primary">Theatre Management</span>
                </h1>

                <p className="text-foreground-secondary mt-4 max-w-xl text-base leading-relaxed sm:text-lg">
                  MedOrch centralizes surgical scheduling, operating room
                  management, equipment tracking, staff coordination, and
                  operational alerts into one unified platform — giving
                  healthcare teams the clarity to operate efficiently.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    href="/login"

                    className="bg-primary text-foreground-inverse hover:bg-primary-hover focus:ring-ring/20 active:bg-primary-active inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium shadow-none transition-colors focus:ring-2 focus:outline-none"
                  >
                    Get Started
                    <IconArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href="/login"

                    className="border-border-strong bg-surface text-foreground-secondary hover:bg-surface-subtle focus:ring-ring/20 inline-flex items-center rounded-lg border px-5 py-2.5 text-sm font-medium shadow-none transition-colors focus:ring-2 focus:outline-none"
                  >
                    Sign In
                  </Link>
                </div>
              </div>

              {/* Right: Dashboard mock */}

              <div className="hidden lg:block" aria-hidden="true">
                <HeroDashboardMock />
              </div>
            </div>
          </div>
        </section>

        {/* ─── TRUST / VALUE STRIP ─── */}

        <section className="border-border bg-surface border-b">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
              {trustItems.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="bg-primary-soft text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                    {item.icon}
                  </div>

                  <span className="text-foreground text-sm font-semibold">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CORE CAPABILITIES ─── */}

        <section
          id="capabilities"
          className="border-border scroll-mt-20 border-b"
        >
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                Core Capabilities
              </h2>

              <p className="text-foreground-secondary mt-3 text-sm leading-relaxed sm:text-base">
                Everything your operating theatre needs — scheduling, rooms,
                equipment, teams, patients, and alerts — managed in one place.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {capabilities.map((cap) => (
                <div
                  key={cap.title}

                  className="group border-border bg-surface hover:border-border-strong rounded-xl border p-6 transition-colors"
                >
                  <div className="bg-primary-soft text-primary group-hover:bg-primary-soft mb-4 flex h-10 w-10 items-center justify-center rounded-lg transition-colors">
                    {cap.icon}
                  </div>

                  <h3 className="text-foreground text-base font-semibold">
                    {cap.title}
                  </h3>

                  <p className="text-foreground-secondary mt-2 text-sm leading-relaxed">
                    {cap.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── OPERATIONAL WORKFLOW ─── */}

        <section
          id="workflow"
          className="border-border bg-surface-subtle scroll-mt-20 border-b"
        >
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                Operational Workflow
              </h2>

              <p className="text-foreground-secondary mt-3 text-sm leading-relaxed sm:text-base">
                MedOrch connects every stage of operating theatre operations —
                from initial planning through post-procedure monitoring.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {workflowSteps.map((step, index) => (
                <div key={step.title} className="relative">
                  <div className="border-border bg-surface rounded-xl border p-6">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="bg-primary text-foreground-inverse flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold">
                        {step.step}
                      </span>

                      <h3 className="text-foreground text-base font-semibold">
                        {step.title}
                      </h3>
                    </div>

                    <p className="text-foreground-secondary text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Connector arrow (not on the last item) */}

                  {index < workflowSteps.length - 1 && (
                    <div
                      className="text-foreground-subtle absolute top-1/2 -right-3 z-10 hidden -translate-y-1/2 lg:block"
                      aria-hidden="true"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── SECURITY / ACCESS ─── */}

        <section id="security" className="border-border scroll-mt-20 border-b">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Left: Copy */}

              <div>
                <div className="border-border bg-surface text-foreground-secondary mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
                  <IconKey className="h-3.5 w-3.5" />
                  Access & Security
                </div>

                <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                  Designed Around Controlled Access
                </h2>

                <p className="text-foreground-secondary mt-4 text-sm leading-relaxed sm:text-base">
                  MedOrch is built with role-based access at its core. Every
                  user — from administrators to clinical staff — sees only the
                  data and actions relevant to their role. Operational data is
                  structured, access is authenticated, and actions are
                  traceable.
                </p>
              </div>

              {/* Right: Feature cards */}

              <div className="grid gap-4 sm:grid-cols-2">
                {securityFeatures.map((feature) => (
                  <div
                    key={feature.title}

                    className="border-border bg-surface rounded-xl border p-5"
                  >
                    <div className="bg-surface-muted text-foreground-secondary mb-3 flex h-9 w-9 items-center justify-center rounded-lg">
                      {feature.icon}
                    </div>

                    <h3 className="text-foreground text-sm font-semibold">
                      {feature.title}
                    </h3>

                    <p className="text-foreground-muted mt-1.5 text-xs leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── FINAL CTA ─── */}

        <section className="border-border bg-surface-subtle border-b">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                Bring your operating theatre workflow into one system.
              </h2>

              <p className="text-foreground-secondary mt-4 text-sm leading-relaxed sm:text-base">
                Stop coordinating across disconnected tools. MedOrch gives your
                team a single, structured platform for every aspect of operating
                theatre operations.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/login"

                  className="bg-primary text-foreground-inverse hover:bg-primary-hover focus:ring-ring/20 active:bg-primary-active inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium shadow-none transition-colors focus:ring-2 focus:outline-none"
                >
                  Get Started
                  <IconArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ─── */}

      <footer className="border-border bg-surface border-t">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand column */}

            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2">
                <div className="bg-primary text-foreground-inverse flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold">
                  M
                </div>

                <span className="text-foreground text-sm font-bold">
                  MedOrch
                </span>
              </div>

              <p className="text-foreground-muted mt-3 max-w-xs text-xs leading-relaxed">
                Operating Theatre Management & Resource Orchestration Platform.
                Centralizing surgical operations for healthcare teams.
              </p>
            </div>

            {/* Platform links */}

            <div>
              <h4 className="text-foreground-subtle text-xs font-semibold tracking-wider uppercase">
                Platform
              </h4>

              <ul className="mt-3 space-y-2">
                {[
                  { label: 'Capabilities', href: '#capabilities' },

                  { label: 'Workflow', href: '#workflow' },

                  { label: 'Security', href: '#security' },
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}

                      className="text-foreground-secondary hover:text-foreground text-sm transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Access links */}

            <div>
              <h4 className="text-foreground-subtle text-xs font-semibold tracking-wider uppercase">
                Access
              </h4>

              <ul className="mt-3 space-y-2">
                <li>
                  <Link
                    href="/login"

                    className="text-foreground-secondary hover:text-foreground text-sm transition-colors"
                  >
                    Sign In
                  </Link>
                </li>

                <li>
                  <Link
                    href="/login"

                    className="text-foreground-secondary hover:text-foreground text-sm transition-colors"
                  >
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}

          <div className="border-border mt-10 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
            <p className="text-foreground-subtle text-xs">
              &copy; {currentYear} MedOrch. All rights reserved.
            </p>

            <div className="text-foreground-subtle flex items-center gap-1.5 text-xs">
              <IconCheck className="text-success h-3.5 w-3.5" />

              <span>System Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
