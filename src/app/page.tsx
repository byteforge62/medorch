import Link from "next/link";

/* ─── Inline SVG Icon Components ─── */

function IconCalendar({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function IconBuilding({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4" />
    </svg>
  );
}

function IconCpu({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
  );
}

function IconUsers({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function IconPatient({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function IconBell({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

function IconShield({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function IconLock({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function IconEye({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function IconClipboardCheck({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function IconKey({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  );
}

function IconArrowRight({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

function IconCheck({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

/* ─── Mobile Nav Toggle (client island) ─── */
import { LandingMobileNav } from "@/components/landing/LandingMobileNav";

/* ─── Hero Dashboard Mock ─── */
function HeroDashboardMock() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </div>
        <span className="ml-2 text-[11px] font-medium text-slate-400 dark:text-slate-500">
          MedOrch — Operations Dashboard
        </span>
      </div>
      {/* Content */}
      <div className="p-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "OT Rooms", value: "12", sub: "3 Available", color: "bg-emerald-500" },
            { label: "Surgeries", value: "8", sub: "2 In Progress", color: "bg-blue-500" },
            { label: "Alerts", value: "3", sub: "Action Needed", color: "bg-amber-500" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-800/60"
            >
              <div className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${stat.color}`} />
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  {stat.label}
                </span>
              </div>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">{stat.sub}</p>
            </div>
          ))}
        </div>
        {/* Schedule list mock */}
        <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-800/60">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Upcoming Procedures
          </p>
          <div className="space-y-2">
            {[
              { time: "09:00", procedure: "Appendectomy", room: "OT-1", status: "Confirmed" },
              { time: "11:30", procedure: "Knee Replacement", room: "OT-3", status: "Preparing" },
              { time: "14:00", procedure: "Cardiac Bypass", room: "OT-2", status: "Scheduled" },
            ].map((item) => (
              <div
                key={item.time}
                className="flex items-center justify-between rounded-md bg-white px-2.5 py-2 dark:bg-slate-900"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400">
                    {item.time}
                  </span>
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                    {item.procedure}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">{item.room}</span>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
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
    { label: "Platform", href: "#capabilities" },
    { label: "Capabilities", href: "#workflow" },
    { label: "Security", href: "#security" },
  ];

  const trustItems = [
    { icon: <IconCalendar className="h-5 w-5" />, label: "Surgical Scheduling" },
    { icon: <IconBuilding className="h-5 w-5" />, label: "OT Room Management" },
    { icon: <IconCpu className="h-5 w-5" />, label: "Equipment Readiness" },
    { icon: <IconUsers className="h-5 w-5" />, label: "Staff Coordination" },
  ];

  const capabilities = [
    {
      icon: <IconCalendar />,
      title: "OT Scheduling",
      description:
        "Centralized scheduling for surgical procedures across all operating theatres. Coordinate timing, resources, and staff in a single view.",
    },
    {
      icon: <IconBuilding />,
      title: "Operating Rooms",
      description:
        "Monitor and manage operating room availability, status, and allocation. Track room readiness and maintenance cycles in real time.",
    },
    {
      icon: <IconCpu />,
      title: "Equipment",
      description:
        "Track equipment readiness, availability, and allocation for each procedure. Ensure the right instruments are prepared and accounted for.",
    },
    {
      icon: <IconUsers />,
      title: "Clinical Teams",
      description:
        "Coordinate surgeons, anaesthesiologists, and operating theatre staff. Manage assignments, availability, and team composition per procedure.",
    },
    {
      icon: <IconPatient />,
      title: "Patients",
      description:
        "Organize patient information linked to surgical schedules. Maintain structured records of procedures, preparation status, and assignments.",
    },
    {
      icon: <IconBell />,
      title: "Alerts",
      description:
        "Operational alerts for schedule conflicts, equipment issues, and events requiring immediate attention. Stay informed of critical changes.",
    },
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "Plan",
      description: "Define surgical schedules, assign operating rooms, and allocate equipment and staff.",
    },
    {
      step: "02",
      title: "Coordinate",
      description: "Synchronize clinical teams, confirm resource availability, and resolve scheduling conflicts.",
    },
    {
      step: "03",
      title: "Execute",
      description: "Track procedures in real time with live room status, staff assignments, and equipment readiness.",
    },
    {
      step: "04",
      title: "Monitor",
      description: "Review operational alerts, audit completed procedures, and identify workflow improvements.",
    },
  ];

  const securityFeatures = [
    {
      icon: <IconShield className="h-5 w-5" />,
      title: "Role-Based Access",
      description: "Granular permissions for administrators, doctors, OT staff, and patients. Each role sees only what they need.",
    },
    {
      icon: <IconLock />,
      title: "Secure Authentication",
      description: "Credential-based authentication with session management. Access is controlled and verified at every interaction.",
    },
    {
      icon: <IconEye />,
      title: "Controlled Operational Data",
      description: "Sensitive scheduling, patient, and equipment data is accessible only to authorized personnel within their scope.",
    },
    {
      icon: <IconClipboardCheck />,
      title: "Auditability",
      description: "Actions within the system are traceable. Maintain operational accountability across all workflow stages.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* ─── NAVBAR ─── */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/95">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2" aria-label="MedOrch home">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white shadow-xs">
              M
            </div>
            <span className="text-base font-bold text-slate-900 dark:text-white">MedOrch</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop auth actions */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-xs transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:bg-blue-800"
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
        <section className="relative overflow-hidden border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Left: Copy */}
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Operating Theatre Orchestration
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white">
                  Smarter Operating{" "}
                  <span className="text-blue-600 dark:text-blue-400">Theatre Management</span>
                </h1>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-400">
                  MedOrch centralizes surgical scheduling, operating room management, equipment tracking,
                  staff coordination, and operational alerts into one unified platform — giving healthcare
                  teams the clarity to operate efficiently.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-xs transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:bg-blue-800"
                  >
                    Get Started
                    <IconArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-xs transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
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
        <section className="border-b border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
              {trustItems.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                    {item.icon}
                  </div>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CORE CAPABILITIES ─── */}
        <section id="capabilities" className="scroll-mt-20 border-b border-slate-100 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                Core Capabilities
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
                Everything your operating theatre needs — scheduling, rooms, equipment, teams, patients,
                and alerts — managed in one place.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {capabilities.map((cap) => (
                <div
                  key={cap.title}
                  className="group rounded-xl border border-slate-200 bg-white p-6 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:group-hover:bg-blue-950/60">
                    {cap.icon}
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">{cap.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {cap.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── OPERATIONAL WORKFLOW ─── */}
        <section id="workflow" className="scroll-mt-20 border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                Operational Workflow
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
                MedOrch connects every stage of operating theatre operations — from initial planning through
                post-procedure monitoring.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {workflowSteps.map((step, index) => (
                <div key={step.title} className="relative">
                  <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                        {step.step}
                      </span>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white">{step.title}</h3>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{step.description}</p>
                  </div>
                  {/* Connector arrow (not on the last item) */}
                  {index < workflowSteps.length - 1 && (
                    <div className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 text-slate-300 lg:block dark:text-slate-700" aria-hidden="true">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── SECURITY / ACCESS ─── */}
        <section id="security" className="scroll-mt-20 border-b border-slate-100 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Left: Copy */}
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <IconKey className="h-3.5 w-3.5" />
                  Access &amp; Security
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                  Designed Around Controlled Access
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
                  MedOrch is built with role-based access at its core. Every user — from administrators to
                  clinical staff — sees only the data and actions relevant to their role. Operational data is
                  structured, access is authenticated, and actions are traceable.
                </p>
              </div>
              {/* Right: Feature cards */}
              <div className="grid gap-4 sm:grid-cols-2">
                {securityFeatures.map((feature) => (
                  <div
                    key={feature.title}
                    className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {feature.icon}
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── FINAL CTA ─── */}
        <section className="border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                Bring your operating theatre workflow into one system.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
                Stop coordinating across disconnected tools. MedOrch gives your team a single, structured
                platform for every aspect of operating theatre operations.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-xs transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:bg-blue-800"
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
      <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand column */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                  M
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">MedOrch</span>
              </div>
              <p className="mt-3 max-w-xs text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Operating Theatre Management &amp; Resource Orchestration Platform. Centralizing surgical
                operations for healthcare teams.
              </p>
            </div>

            {/* Platform links */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Platform
              </h4>
              <ul className="mt-3 space-y-2">
                {[
                  { label: "Capabilities", href: "#capabilities" },
                  { label: "Workflow", href: "#workflow" },
                  { label: "Security", href: "#security" },
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Access links */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Access
              </h4>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link
                    href="/login"
                    className="text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  >
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  >
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 sm:flex-row dark:border-slate-800">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              &copy; {currentYear} MedOrch. All rights reserved.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
              <IconCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>System Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
