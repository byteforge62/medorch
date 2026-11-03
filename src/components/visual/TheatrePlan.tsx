import React from 'react';

/*======================================================================
  TheatrePlan — an operating suite, drawn as an architectural plate.
  ======================================================================
  This is original line art, not stock illustration. It is a plan view of a
  theatre suite: corridor, theatre, scrub bay, anaesthesia bay, store, the
  table under two lamp heads, laminar-flow ceiling grid, door swings and
  dimension ticks. It is used at three scales — hero plate, auth panel and
  empty states — which is what ties the identity together.
====================================================================== */

export function TheatrePlan({
  className = '',
  animate = true,
  showLabels = true,
}: {
  className?: string;
  animate?: boolean;
  showLabels?: boolean;
}) {
  const line = animate ? 'plate-line' : '';

  return (
    <svg
      viewBox="0 0 560 648"
      fill="none"
      className={className}
      role="img"
      aria-label="Plan of an operating theatre suite: corridor, theatre, scrub bay, anaesthesia bay and equipment store."
    >
      {/* — Sheet frame and registration ticks — */}
      <g stroke="currentColor" strokeWidth="0.6" opacity="0.35">
        <path d="M8 8h16M8 8v16" />
        <path d="M552 8h-16M552 8v16" />
        <path d="M8 640h16M8 640v-16" />
        <path d="M552 640h-16M552 640v-16" />
      </g>

      {/* — Dimension line across the top — */}
      <g stroke="currentColor" strokeWidth="0.7" opacity="0.6">
        <path d="M24 20h512" />
        <path d="M24 16v8M536 16v8" />
        <path d="M96 16v8M512 16v8" />
      </g>
      {showLabels ? (
        <text
          x="24"
          y="12"
          className="fill-current font-mono"
          style={{
            fontSize: 7,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
          }}
          opacity="0.75"
        >
          Theatre suite · plan 01 · scale 1:100
        </text>
      ) : null}

      {/* — Envelope — */}
      <g stroke="currentColor" strokeWidth="1.4">
        <rect x="24" y="30" width="512" height="586" />
        <rect x="24" y="30" width="72" height="586" />
        <path d="M96 30v586" />
        <path d="M96 398h440" />
        <path d="M236 398v218M376 398v218" />
      </g>

      {/* — Corridor: circulation arrows — */}
      <g stroke="currentColor" strokeWidth="0.8" opacity="0.5">
        <path d="M60 90v470" strokeDasharray="2 6" />
        <path d="M52 112l8-10 8 10" />
        <path d="M52 528l8 10 8-10" />
      </g>
      {showLabels ? (
        <text
          x="76"
          y="360"
          className="fill-current font-mono"
          style={{ fontSize: 7, letterSpacing: '0.3em' }}
          opacity="0.7"
          transform="rotate(-90 76 360)"
        >
          CORRIDOR
        </text>
      ) : null}

      {/* — Theatre: laminar ceiling grid — */}
      <g stroke="currentColor" strokeWidth="0.5" opacity="0.3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={`v${i}`} d={`M${150 + i * 60} 74v250`} strokeDasharray="3 5" />
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={`h${i}`} d={`M132 ${94 + i * 48}h370`} strokeDasharray="3 5" />
        ))}
      </g>

      {/* — Lamp heads — */}
      <g stroke="currentColor" strokeWidth="1.2">
        <circle cx="196" cy="150" r="32" />
        <circle cx="196" cy="150" r="13" />
        <circle cx="412" cy="150" r="32" />
        <circle cx="412" cy="150" r="13" />
      </g>
      <g stroke="currentColor" strokeWidth="0.8" opacity="0.7">
        <path d="M196 112v-8M196 196v8M158 150h-8M242 150h8" />
        <path d="M412 112v-8M412 196v8M374 150h-8M458 150h8" />
        <path d="M196 150l22-22M412 150l-22-22" />
      </g>

      {/* — Surgical table, the focal object — */}
      <g stroke="var(--vermilion)" strokeWidth="1.6">
        <rect x="252" y="238" width="150" height="52" rx="4" />
        <path d="M252 254h150M252 274h150" opacity="0.55" />
      </g>
      <g stroke="currentColor" strokeWidth="0.9" opacity="0.75">
        <path d="M327 238v-18" />
        <circle cx="327" cy="212" r="9" />
        <path d="M327 290v26M300 290v14M354 290v14" />
      </g>

      {/* — Scrub bay: two sinks and a sterile run — */}
      <g stroke="currentColor" strokeWidth="1">
        <rect x="108" y="424" width="52" height="30" />
        <rect x="176" y="424" width="52" height="30" />
        <path d="M112 430h44M180 430h44" opacity="0.6" />
        <path d="M108 480h120M108 500h120M108 520h120M108 540h120" opacity="0.3" />
      </g>

      {/* — Anaesthesia bay: machine + gas columns — */}
      <g stroke="currentColor" strokeWidth="1">
        <rect x="252" y="430" width="44" height="66" />
        <circle cx="274" cy="448" r="7" />
        <path d="M274 462v18M262 486h24" opacity="0.6" />
        <rect x="316" y="430" width="22" height="22" />
        <rect x="316" y="462" width="22" height="22" opacity="0.6" />
      </g>

      {/* — Store: shelving hatch — */}
      <g stroke="currentColor" strokeWidth="0.9" opacity="0.6">
        <rect x="392" y="424" width="100" height="30" />
        <rect x="392" y="470" width="100" height="30" />
        <path d="M392 439h100M392 485h100" opacity="0.4" />
      </g>

      {/* — Door swings — */}
      <g stroke="currentColor" strokeWidth="0.9" opacity="0.7">
        <path d="M96 330h-26" />
        <path d="M70 330a26 26 0 0 1 26 26" strokeDasharray="3 3" />
        <path d="M236 470h-24" />
        <path d="M212 470a24 24 0 0 1 24 24" strokeDasharray="3 3" />
        <path d="M376 470h-24" />
        <path d="M352 470a24 24 0 0 1 24 24" strokeDasharray="3 3" />
      </g>

      {/* — Room labels — */}
      {showLabels ? (
        <g
          className="fill-current font-mono"
          style={{ fontSize: 8, letterSpacing: '0.26em' }}
          opacity="0.8"
        >
          <text x="110" y="52">THEATRE 01</text>
          <text x="110" y="416">SCRUB</text>
          <text x="250" y="416">ANAESTHESIA</text>
          <text x="392" y="416">EQUIPMENT</text>
        </g>
      ) : null}

      {/* — Survey crosshair on the table — */}
      <g stroke="currentColor" strokeWidth="0.6" opacity="0.5">
        <path d="M327 206v-14M327 316v14M238 264h-14M416 264h14" />
        <circle cx="327" cy="264" r="2" fill="currentColor" stroke="none" />
      </g>

      {/* — Bottom caption rule — */}
      <g stroke="currentColor" strokeWidth="0.7" opacity="0.45">
        <path d="M24 632h512" />
        <path d="M24 628v8M536 628v8" />
      </g>
      {showLabels ? (
        <text
          x="24"
          y="645"
          className="fill-current font-mono"
          style={{ fontSize: 7, letterSpacing: '0.22em' }}
          opacity="0.7"
        >
          LAMINAR FLOW · POSITIVE PRESSURE · NEGATIVE EXHAUST
        </text>
      ) : null}

      {/* Invisible helper so the draw animation applies to the envelope. */}
      <path d="" className={line} />
    </svg>
  );
}
