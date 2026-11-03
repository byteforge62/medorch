import React from 'react';

/*======================================================================
  Department glyphs — original geometric identifiers
  ======================================================================
  Four abstract marks drawn from theatre-plan geometry. They are used as
  department identifiers in navigation, cards and empty states. Each is a
  single-weight line drawing so it sits with the architectural plates.
====================================================================== */

export type GlyphKind = 'theatre' | 'anaesthesia' | 'sterile' | 'imaging';

export function DeptGlyph({
  kind,
  className = 'h-10 w-10',
}: {
  kind: GlyphKind;
  className?: string;
}) {
  const common = {
    viewBox: '0 0 48 48',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.1,
    'aria-hidden': true as const,
    className,
  };

  switch (kind) {
    case 'theatre':
      /* Nested field with an off-centre table: the room inside the room. */
      return (
        <svg {...common}>
          <rect x="4" y="4" width="40" height="40" />
          <rect x="12" y="12" width="24" height="24" opacity="0.55" />
          <path d="M18 26h12" strokeWidth="2" />
          <path d="M24 20v6" opacity="0.6" />
        </svg>
      );

    case 'anaesthesia':
      /* A monitored waveform crossing a gas column. */
      return (
        <svg {...common}>
          <path d="M4 32h8l4-14 5 22 4-18 4 10h15" />
          <circle cx="38" cy="14" r="4" opacity="0.6" />
          <path d="M4 40h40" opacity="0.35" />
        </svg>
      );

    case 'sterile':
      /* A sterile field: hexagonal boundary, single instrument inside. */
      return (
        <svg {...common}>
          <path d="M24 4l17 10v20L24 44 7 34V14z" />
          <path d="M24 16v16M17 24h14" opacity="0.75" />
        </svg>
      );

    case 'imaging':
      /* Concentric arcs — a scan fan with a registration point. */
      return (
        <svg {...common}>
          <path d="M8 40a16 16 0 0 1 32 0" />
          <path d="M14 40a10 10 0 0 1 20 0" opacity="0.7" />
          <path d="M20 40a4 4 0 0 1 8 0" opacity="0.5" />
          <circle cx="24" cy="40" r="1.4" fill="currentColor" stroke="none" />
        </svg>
      );
  }
}
