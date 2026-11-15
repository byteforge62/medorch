/*======================================================================
  TheatreSchematic — the room drawn, not photographed.
  ======================================================================
  A plan diagram of a generic operating theatre: table at centre, pendant,
  anaesthesia stack, instrument trolley and the scrub door. It is labelled
  as schematic because it does not claim to be the surveyed plan of this
  hospital. The drawing carries the selected room's code so the panel still
  identifies what it describes.
====================================================================== */

export function TheatreSchematic({
  code,
  status = 'AVAILABLE',
}: {
  code: string;
  status?: string;
}) {
  const tone =
    status === 'OCCUPIED'
      ? '#c98a63'
      : status === 'MAINTENANCE'
        ? '#d8b877'
        : '#a8c9b4';

  return (
    <div className="bg-surface-inverse relative overflow-hidden border-b border-rail-line">
      <svg
        viewBox="0 0 360 170"
        role="img"
        aria-label={`Schematic plan of theatre ${code}: operating table, pendant, anaesthesia stack and scrub door`}
        className="block h-auto w-full"
      >
        <g stroke="rgba(247,243,232,0.16)" strokeWidth="1">
          <path d="M0 34h360M0 68h360M0 102h360M0 136h360" />
          <path d="M45 0v170M90 0v170M135 0v170M180 0v170M225 0v170M270 0v170M315 0v170" />
        </g>

        <rect
          x="12"
          y="14"
          width="336"
          height="142"
          fill="none"
          stroke="rgba(247,243,232,0.4)"
          strokeWidth="1.4"
        />

        {/* operating table */}
        <rect
          x="138"
          y="64"
          width="86"
          height="34"
          fill="none"
          stroke="#f7f3e8"
          strokeWidth="1.3"
        />
        <line x1="150" y1="64" x2="150" y2="52" stroke="#f7f3e8" strokeWidth="1" />
        <line x1="212" y1="64" x2="212" y2="52" stroke="#f7f3e8" strokeWidth="1" />
        <line x1="150" y1="52" x2="212" y2="52" stroke="#f7f3e8" strokeWidth="1" />
        <circle cx="181" cy="81" r="5" fill="none" stroke={tone} strokeWidth="1.4" />

        {/* pendant */}
        <circle cx="181" cy="30" r="11" fill="none" stroke="rgba(247,243,232,0.45)" />
        <path d="M181 41v11M170 30h22" stroke="rgba(247,243,232,0.35)" />

        {/* anaesthesia stack */}
        <rect x="252" y="58" width="24" height="46" fill="none" stroke="rgba(247,243,232,0.55)" />
        <path d="M258 66h12M258 74h12M258 82h8" stroke="rgba(247,243,232,0.4)" />

        {/* instrument trolley */}
        <rect x="82" y="90" width="34" height="20" fill="none" stroke="rgba(247,243,232,0.5)" />
        <path d="M86 110v9M112 110v9" stroke="rgba(247,243,232,0.35)" />

        {/* scrub door */}
        <path d="M12 116h0v0" />
        <path d="M12 104h18v30H12" fill="none" stroke={tone} strokeWidth="1.4" />

        {/* labels */}
        <g fill="rgba(247,243,232,0.55)" fontSize="6.2" fontFamily="var(--font-plex), monospace" letterSpacing="1">
          <text x="138" y="110">TABLE</text>
          <text x="252" y="116">ANAESTHESIA</text>
          <text x="82" y="124">TROLLEY</text>
          <text x="36" y="120">SCRUB</text>
          <text x="288" y="30">{code}</text>
        </g>

        <g fill="rgba(247,243,232,0.3)" fontSize="5.6" fontFamily="var(--font-plex), monospace">
          <text x="20" y="150">SCHEMATIC · NOT A SURVEYED PLAN</text>
          <text x="280" y="150">1:100</text>
        </g>
      </svg>

      <span
        className="absolute top-3 right-3 font-mono text-[9px] tracking-[0.12em]"
        style={{ color: tone }}
      >
        {code}
      </span>
    </div>
  );
}
