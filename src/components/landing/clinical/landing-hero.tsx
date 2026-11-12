
import Link from 'next/link';
import {
    ArrowDown,
    ArrowUpRight,
    CalendarCheck,
    ShieldCheck,
    UsersThree,
} from '@phosphor-icons/react/dist/ssr';

import { HeroStage } from './landing-art';

const trustItems = [
    {
        icon: ShieldCheck,
        label: 'Role-based access',
    },
    {
        icon: CalendarCheck,
        label: 'Structured scheduling',
    },
    {
        icon: UsersThree,
        label: 'Connected clinical teams',
    },
];

export function LandingHero() {
    return (
        <section
            aria-labelledby="landing-hero-title"
            className="landing-hero relative isolate overflow-hidden bg-[#f7f5fc] text-ink"
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
            >
                <div className="absolute inset-y-0 right-0 hidden w-[43%] border-l border-[#ded5ef] bg-[#eee9f7] xl:block" />

                <div className="absolute -top-48 left-[38%] h-[480px] w-[480px] rounded-full border border-[#ded5ef]/70" />
                <div className="absolute -top-32 left-[40%] h-[400px] w-[400px] rounded-full border border-[#ded5ef]/60" />

                <div className="absolute right-[7%] bottom-[-230px] h-[440px] w-[440px] rounded-full border border-[#d9d0e9]/70" />

                <div className="landing-stage-grid absolute inset-x-0 top-0 h-[620px] opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent)] xl:hidden" />
            </div>

            <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ded8e8] py-4">
                    <div className="flex items-center gap-2.5">
                        <span className="h-[7px] w-[7px] rounded-full bg-[#6e55b4]" />
                        <span className="font-mono text-[9px] font-medium tracking-[0.16em] text-[#665d77] sm:text-[10px]">
                            OPERATING THEATRE OPERATIONS
                        </span>
                    </div>

                    <span className="hidden font-mono text-[9px] tracking-[0.1em] text-[#81788f] sm:block">
                        A CONNECTED VIEW OF THE OPERATING DAY
                    </span>
                </div>

                <div className="grid items-center gap-12 py-14 sm:py-16 lg:py-20 xl:grid-cols-[0.88fr_1.12fr] xl:gap-10">
                    <div className="relative z-10 max-w-[620px]">
                        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#d9d0e9] bg-white/65 px-3.5 py-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#eee8f8] text-[#7055be]">
                                <CalendarCheck size={12} weight="bold" />
                            </span>
                            <span className="text-[10px] font-semibold tracking-[0.035em] text-[#625a70]">
                                Built around the theatre day
                            </span>
                        </div>

                        <h1
                            id="landing-hero-title"
                            className="max-w-[11ch] font-display text-[clamp(3.25rem,6.3vw,6.25rem)] font-medium leading-[0.94] tracking-[-0.065em] text-[#24212b]"
                        >
                            Better
                            <br />
                            coordination.
                            <br />
                            <span className="relative inline-block text-[#7055be]">
                                Better care.
                                <svg
                                    aria-hidden="true"
                                    viewBox="0 0 340 15"
                                    fill="none"
                                    className="absolute -bottom-2 left-0 w-full"
                                >
                                    <path
                                        d="M3 10.5C86 2.5 237 1.5 337 8"
                                        stroke="#a994d8"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </span>
                        </h1>

                        <p className="mt-8 max-w-[440px] text-[15px] leading-[1.9] text-[#686271] sm:text-[16px]">
                            Bring theatre schedules, operating rooms, clinical teams and
                            equipment into one coordinated workspace. Give every role a
                            clearer view of the day.
                        </p>

                        <div className="mt-9 flex flex-wrap items-center gap-3">
                            <Link
                                href="/register"
                                prefetch={false}
                                className="group inline-flex h-[50px] items-center justify-center gap-3 rounded-xl bg-[#7055be] px-6 text-[12px] font-semibold text-white shadow-[0_10px_25px_rgba(112,85,190,0.2)] transition-all duration-200 hover:-translate-y-1 hover:bg-[#5e45a8] hover:shadow-[0_15px_30px_rgba(112,85,190,0.27)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7055be]"
                            >
                                Request access
                                <ArrowUpRight
                                    size={15}
                                    weight="bold"
                                    className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                    aria-hidden="true"
                                />
                            </Link>

                            <a
                                href="#platform"
                                className="inline-flex h-[50px] items-center justify-center gap-2 rounded-xl border border-[#d9d3e2] bg-white/55 px-5 text-[12px] font-semibold text-[#514b5d] transition-colors hover:border-[#a994d8] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7055be]"
                            >
                                Explore the platform
                                <ArrowDown size={13} weight="bold" aria-hidden="true" />
                            </a>
                        </div>

                        <p className="mt-4 text-[11px] leading-relaxed text-[#898291]">
                            Access is subject to account verification and role approval.
                        </p>

                        <div className="mt-11 flex flex-wrap gap-x-6 gap-y-3 border-t border-[#ded8e8] pt-5">
                            {trustItems.map(({ icon: Icon, label }) => (
                                <div
                                    key={label}
                                    className="flex items-center gap-2 text-[10px] font-medium text-[#716a7c]"
                                >
                                    <Icon
                                        size={14}
                                        weight="regular"
                                        className="text-[#7055be]"
                                        aria-hidden="true"
                                    />
                                    {label}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative min-w-0 xl:pl-3">
                        <div
                            aria-hidden="true"
                            className="absolute -inset-5 rounded-[30px] bg-[#e8e1f3]/60 blur-2xl"
                        />

                        <div className="relative">
                            <div className="mb-3 flex items-center justify-between gap-3 px-1">
                                <span className="font-mono text-[9px] tracking-[0.13em] text-[#756c83]">
                                    MEDORCH / WORKSPACE
                                </span>
                                <span className="flex items-center gap-2 font-mono text-[9px] tracking-[0.08em] text-[#756c83]">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#4a9477]" />
                                    PRODUCT PREVIEW
                                </span>
                            </div>

                            <HeroStage />
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#ded8e8] py-4">
                    <span className="font-mono text-[9px] tracking-[0.1em] text-[#756c83]">
                        SCHEDULES / ROOMS / TEAMS / EQUIPMENT
                    </span>
                    <span className="font-mono text-[9px] tracking-[0.1em] text-[#756c83]">
                        ONE CONNECTED WORKSPACE
                    </span>
                </div>
            </div>
        </section>
    );
}
