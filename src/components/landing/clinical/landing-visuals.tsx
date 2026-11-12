
import Image from 'next/image';
import { useId } from 'react';
import {
  ArrowDown,
  CheckCircle,
  CircleNotch,
  DoorOpen,
  FirstAidKit,
  Lightning,
  ShieldCheck,
  Warning,
} from '@phosphor-icons/react/dist/ssr';

import {
  blurFor,
  clinicalMedia,
  type ClinicalMediaKey,
} from '@/lib/clinical-media';

/* -------------------------------------------------------------------------- */
/* Landing photography                                                        */
/* -------------------------------------------------------------------------- */

export function LandingPhoto({
  media,
  alt,
  sizes,
  priority = false,
  className = '',
  imageClassName = '',
  caption,
  children,
}: {
  media: ClinicalMediaKey;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  caption?: string;
  children?: React.ReactNode;
}) {
  const entry = clinicalMedia[media];
  const blurDataURL = blurFor(media);

  return (
    <figure
      className={`group relative isolate overflow-hidden bg-paper-deep ${className}`}
    >
      <Image
        src={entry.src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        quality={80}
        placeholder={blurDataURL ? 'blur' : 'empty'}
        blurDataURL={blurDataURL}
        className={`object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025] ${imageClassName}`}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-rail/35 via-transparent to-white/[0.04]"
      />

      {children}

      {caption ? (
        <figcaption className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-full border border-white/20 bg-rail/80 px-3.5 py-2 text-[10px] font-medium tracking-[0.025em] text-white/90 shadow-lg backdrop-blur-md sm:inset-x-4 sm:bottom-4">
          <span className="min-w-0 truncate">{caption}</span>

          <span className="hidden shrink-0 font-mono text-[9px] tracking-[0.15em] text-white/55 sm:inline">
            {entry.plate}
          </span>
        </figcaption>
      ) : null}
    </figure>
  );
}

/* -------------------------------------------------------------------------- */
/* Theatre plan                                                               */
/* -------------------------------------------------------------------------- */

export function TheatrePlan({ className = '' }: { className?: string }) {
  const instanceId = useId().replace(/:/g, '');
  const roomGradient = `${instanceId}-plan-room`;
  const fieldGradient = `${instanceId}-plan-field`;
  const gridPattern = `${instanceId}-plan-grid`;

  return (
    <svg
      viewBox="0 0 620 430"
      fill="none"
      className={className}
      role="img"
      aria-labelledby={`${instanceId}-title ${instanceId}-desc`}
    >
      <title id={`${instanceId}-title`}>
        Technical plan of an operating theatre
      </title>

      <desc id={`${instanceId}-desc`}>
        A top-down room plan showing the operating table beneath a laminar
        ceiling field, anaesthesia and monitoring positions, a sterile
        instrument table, scrub bay and theatre doors.
      </desc>

      <defs>
        <linearGradient
          id={roomGradient}
          x1="60"
          y1="44"
          x2="560"
          y2="390"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F7F3FF" />
          <stop offset="1" stopColor="#EDE6F8" />
        </linearGradient>

        <linearGradient
          id={fieldGradient}
          x1="238"
          y1="124"
          x2="382"
          y2="306"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D9CDF1" stopOpacity="0.85" />
          <stop offset="1" stopColor="#EEE7FA" stopOpacity="0.35" />
        </linearGradient>

        <pattern
          id={gridPattern}
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M20 0H0V20"
            stroke="#6550B5"
            strokeOpacity="0.055"
            strokeWidth="1"
          />
        </pattern>
      </defs>

      <rect
        width="620"
        height="430"
        rx="24"
        fill={`url(#${roomGradient})`}
      />

      <rect
        width="620"
        height="430"
        rx="24"
        fill={`url(#${gridPattern})`}
      />

      {/* Room envelope */}
      <rect
        x="54"
        y="48"
        width="512"
        height="334"
        rx="10"
        stroke="#6550B5"
        strokeOpacity="0.28"
        strokeWidth="1.5"
      />

      <path
        d="M54 275v107M566 80v90M460 48h106M54 48h150"
        stroke="#6550B5"
        strokeOpacity="0.5"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      <path
        d="M54 275a10 10 0 0 0 10 10h22M566 170a10 10 0 0 1-10 10h-18"
        stroke="#6550B5"
        strokeOpacity="0.15"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Laminar field */}
      <rect
        x="203"
        y="92"
        width="214"
        height="244"
        rx="42"
        fill={`url(#${fieldGradient})`}
        stroke="#8D7AD0"
        strokeOpacity="0.45"
        strokeWidth="1.2"
        strokeDasharray="3 7"
      />

      <path
        d="M228 112h164M228 316h164"
        stroke="#8D7AD0"
        strokeOpacity="0.35"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* Operating table */}
      <rect
        x="250"
        y="146"
        width="120"
        height="136"
        rx="28"
        fill="#FFFFFF"
        stroke="#6550B5"
        strokeOpacity="0.42"
        strokeWidth="1.5"
      />

      <rect x="266" y="163" width="88" height="102" rx="22" fill="#E9E2F8" />

      <path
        d="M283 163v102M337 163v102"
        stroke="#FFFFFF"
        strokeOpacity="0.9"
        strokeWidth="2.5"
      />

      <path
        d="M310 142v144"
        stroke="#6550B5"
        strokeOpacity="0.2"
        strokeWidth="1"
        strokeDasharray="3 5"
      />

      {/* Surgical lights */}
      <g stroke="#6550B5" strokeOpacity="0.5" strokeWidth="1.4">
        <circle cx="220" cy="120" r="24" fill="#FFFFFF" />
        <circle cx="400" cy="120" r="24" fill="#FFFFFF" />
        <circle cx="220" cy="120" r="10" fill="#E9E2F8" />
        <circle cx="400" cy="120" r="10" fill="#E9E2F8" />
        <path d="M196 120h-22M424 120h22M220 96V78M400 96V78" />
      </g>

      {/* Anaesthesia and monitoring */}
      <g>
        <rect
          x="116"
          y="164"
          width="62"
          height="92"
          rx="10"
          fill="#FFFFFF"
          stroke="#8D7AD0"
          strokeOpacity="0.55"
          strokeWidth="1.3"
        />

        <rect
          x="128"
          y="177"
          width="38"
          height="25"
          rx="4"
          fill="#6550B5"
          fillOpacity="0.16"
        />

        <path
          d="M136 215h22M136 225h16M136 235h20"
          stroke="#8D7AD0"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        <path
          d="M178 196h28"
          stroke="#6550B5"
          strokeOpacity="0.4"
          strokeWidth="1.3"
          strokeDasharray="3 4"
        />

        <circle cx="116" cy="196" r="3" fill="#8D7AD0" />
      </g>

      {/* Sterile table */}
      <g>
        <rect
          x="417"
          y="186"
          width="70"
          height="112"
          rx="10"
          fill="#FFFFFF"
          stroke="#8D7AD0"
          strokeOpacity="0.5"
          strokeWidth="1.3"
        />

        <path
          d="M430 205h44M430 219h44M430 233h32M430 247h38"
          stroke="#C9BBE4"
          strokeWidth="4"
          strokeLinecap="round"
        />

        <circle cx="449" cy="273" r="8" fill="#E9E2F8" />
      </g>

      {/* Scrub bay */}
      <g>
        <rect
          x="92"
          y="309"
          width="74"
          height="42"
          rx="8"
          fill="#FFFFFF"
          stroke="#8D7AD0"
          strokeOpacity="0.45"
          strokeWidth="1.2"
        />

        <path
          d="M106 322h46M106 331h30M106 340h38"
          stroke="#C9BBE4"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        <path
          d="M180 330h43"
          stroke="#8D7AD0"
          strokeOpacity="0.5"
          strokeWidth="1.3"
          strokeDasharray="3 4"
        />

        <circle
          cx="232"
          cy="330"
          r="5"
          fill="#FFFFFF"
          stroke="#8D7AD0"
          strokeOpacity="0.7"
        />
      </g>

      {/* Doors */}
      <g stroke="#6550B5" strokeOpacity="0.55" strokeWidth="1.5">
        <path d="M566 170v-34h-14" />
        <path
          d="M566 136a14 14 0 0 1 14 14v20"
          strokeOpacity="0.22"
        />
        <path d="M64 275h-10v38" />
      </g>

      {/* Labels */}
      <g
        fill="#5F5878"
        fontFamily="ui-monospace, monospace"
        fontSize="8.5"
        letterSpacing="1.4"
      >
        <text x="84" y="76">THEATRE 01</text>
        <text x="116" y="155">ANAESTHESIA</text>
        <text x="421" y="177">STERILE SET</text>
        <text x="96" y="300">SCRUB</text>
        <text x="259" y="345">LAMINAR FIELD</text>
        <text x="476" y="76">PLAN / 01</text>
      </g>

      {/* Dimension marks */}
      <g stroke="#6550B5" strokeOpacity="0.28" strokeWidth="1">
        <path d="M250 403h120M250 398v10M370 398v10" />
        <path d="M54 410h512" strokeOpacity="0.12" />
      </g>

      <text
        x="292"
        y="418"
        fill="#77718F"
        fontFamily="ui-monospace, monospace"
        fontSize="8"
      >
        CASE ZONE · 6.0 m
      </text>
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Case journey                                                               */
/* -------------------------------------------------------------------------- */

const journey = [
  {
    index: '01',
    title: 'Book',
    body: 'Procedure, patient, priority, department, theatre, surgeon, date and time are written as one schedule.',
    detail: 'Scheduled',
    icon: DoorOpen,
  },
  {
    index: '02',
    title: 'Prepare',
    body: 'Staff roles and equipment are attached. The server rejects room, surgeon and patient overlaps.',
    detail: 'Confirmed',
    icon: FirstAidKit,
  },
  {
    index: '03',
    title: 'Operate',
    body: 'The theatre board shows room state and the assigned team. Clinical notes stay inside the permitted role.',
    detail: 'In progress',
    icon: Lightning,
  },
  {
    index: '04',
    title: 'Close',
    body: 'The case completes, delays or cancels. The change and its actor remain in the audit trail.',
    detail: 'Completed',
    icon: CheckCircle,
  },
] as const;

export function CaseJourney() {
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute top-[27px] right-[8%] left-[8%] hidden h-px bg-[linear-gradient(90deg,transparent,var(--rule-strong)_12%,var(--primary)_52%,var(--rule-strong)_88%,transparent)] lg:block"
      />

      <ol className="grid gap-0 lg:grid-cols-4 lg:gap-6">
        {journey.map((step) => {
          const Icon = step.icon;

          return (
            <li
              key={step.index}
              className="relative grid grid-cols-[58px_minmax(0,1fr)] gap-4 pb-8 last:pb-0 lg:block lg:pb-0"
            >
              <span
                aria-hidden="true"
                className="absolute top-[58px] bottom-0 left-[28px] w-px bg-rule-strong lg:hidden"
              />

              <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-[18px] border border-rule bg-sheet text-primary shadow-md">
                <Icon size={21} weight="duotone" aria-hidden="true" />
              </div>

              <div className="lg:mt-6">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[9.5px] tracking-[0.16em] text-ink-subtle">
                    {step.index}
                  </span>

                  <span className="rounded-full bg-primary-soft px-2 py-0.5 font-mono text-[8.5px] tracking-[0.08em] text-primary">
                    {step.detail}
                  </span>
                </div>

                <h3 className="mt-2 font-display text-[20px] font-semibold tracking-[-0.025em] text-ink">
                  {step.title}
                </h3>

                <p className="mt-1.5 max-w-[32ch] text-[12.5px] leading-[1.7] text-ink-muted">
                  {step.body}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-rule pt-4 text-[10.5px] text-ink-muted lg:mt-10">
        <span className="flex items-center gap-1.5">
          <Warning size={13} weight="duotone" aria-hidden="true" />
          Delayed keeps its recorded reason.
        </span>

        <span className="flex items-center gap-1.5">
          <CircleNotch size={13} weight="duotone" aria-hidden="true" />
          Cancelled closes the case without deleting it.
        </span>

        <span className="flex items-center gap-1.5">
          <ShieldCheck size={13} weight="duotone" aria-hidden="true" />
          Every transition is permission-checked.
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Section marker                                                             */
/* -------------------------------------------------------------------------- */

export function SectionIndex({
  index,
  label,
  tone = 'light',
}: {
  index: string;
  label: string;
  tone?: 'light' | 'dark';
}) {
  return (
    <div
      className={`flex items-center gap-3 font-mono text-[9px] tracking-[0.18em] uppercase ${tone === 'dark' ? 'text-white/50' : 'text-ink-subtle'
        }`}
    >
      <span>{index}</span>

      <span
        className={`h-px w-8 ${tone === 'dark' ? 'bg-white/20' : 'bg-rule-strong'
          }`}
      />

      <span>{label}</span>

      <ArrowDown
        size={11}
        weight="bold"
        aria-hidden="true"
        className="opacity-60"
      />
    </div>
  );
}
