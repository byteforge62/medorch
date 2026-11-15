import React from 'react';

/*======================================================================
  MedicalOrbit — the drawn clinician used by the public and access
  surfaces. A local SVG, not photography: one clinician in lavender
  scrubs, a clipboard, and abstract theatre geometry. It is decorative,
  so it never carries information that is not printed in text nearby.
====================================================================== */

export function MedicalOrbit({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 560 500"
      fill="none"
      className={className}
      role="img"
      aria-labelledby="medical-orbit-title"
    >
      <title id="medical-orbit-title">
        Illustrated clinician holding a theatre case clipboard
      </title>

      <defs>
        <linearGradient id="orbit-blob" x1="94" y1="76" x2="466" y2="430">
          <stop stopColor="#E8E1F7" />
          <stop offset="1" stopColor="#D9CFF0" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="orbit-scrub" x1="238" y1="258" x2="334" y2="414">
          <stop stopColor="#8D7AD0" />
          <stop offset="1" stopColor="#6550B5" />
        </linearGradient>
        <linearGradient id="orbit-coat" x1="206" y1="236" x2="360" y2="400">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#F7F3FF" />
        </linearGradient>
        <linearGradient id="orbit-hair" x1="248" y1="133" x2="340" y2="232">
          <stop stopColor="#3A2E5F" />
          <stop offset="1" stopColor="#25213B" />
        </linearGradient>
      </defs>

      {/* Layered lavender environment */}
      <path
        d="M95 162C137 67 274 44 385 95c94 43 122 150 77 235-44 84-162 126-258 97C104 397 55 255 95 162Z"
        fill="url(#orbit-blob)"
      />
      <circle
        cx="424"
        cy="142"
        r="67"
        stroke="#6550B5"
        strokeOpacity="0.13"
        strokeWidth="1.5"
      />
      <circle
        cx="424"
        cy="142"
        r="91"
        stroke="#6550B5"
        strokeOpacity="0.07"
        strokeWidth="1.5"
      />
      <path
        d="M82 343c42-10 77 9 91 45"
        stroke="#8D7AD0"
        strokeOpacity="0.3"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="2 10"
      />
      <path
        d="M360 91c17 9 30 23 38 40"
        stroke="#8D7AD0"
        strokeOpacity="0.38"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Floating clinical marks */}
      <g opacity="0.86">
        <rect x="116" y="97" width="44" height="44" rx="14" fill="#FFFFFF" />
        <rect
          x="116.75"
          y="97.75"
          width="42.5"
          height="42.5"
          rx="13.25"
          stroke="#E8E2F2"
          strokeWidth="1.5"
        />
        <path
          d="M138 111.5v15M130.5 119h15"
          stroke="#7C67C7"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </g>
      <g opacity="0.8">
        <rect x="438" y="272" width="54" height="54" rx="18" fill="#FFFFFF" />
        <rect
          x="438.75"
          y="272.75"
          width="52.5"
          height="52.5"
          rx="17.25"
          stroke="#E8E2F2"
          strokeWidth="1.5"
        />
        <path
          d="M451 299h9l4-8 6 17 4-9h10"
          stroke="#6550B5"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <path
        d="M382 221v16M374 229h16"
        stroke="#8D7AD0"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M156 300v12M150 306h12"
        stroke="#8D7AD0"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.45"
      />
      <circle cx="397" cy="350" r="4" fill="#8D7AD0" opacity="0.38" />
      <circle cx="172" cy="208" r="3" fill="#6550B5" opacity="0.35" />

      {/* Floor */}
      <ellipse cx="286" cy="444" rx="137" ry="18" fill="#6550B5" opacity="0.08" />
      <ellipse
        cx="286"
        cy="444"
        rx="99"
        ry="10"
        stroke="#6550B5"
        strokeOpacity="0.12"
        strokeWidth="1.3"
      />

      {/* Clinician */}
      <g>
        {/* Hair behind shoulders */}
        <path
          d="M251 206c-15-53 2-93 42-100 39-7 68 26 65 70-2 27-11 44-24 57l-8-37-52-6-12 34-11-18Z"
          fill="url(#orbit-hair)"
        />
        <path
          d="M255 188c2-34 19-57 50-58 31-1 48 21 50 50"
          stroke="#4A3B75"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.45"
        />

        {/* Neck */}
        <path
          d="M294 225v25c0 9 16 9 16 0v-25"
          fill="#F0C2AE"
        />

        {/* Coat body */}
        <path
          d="M236 262c13-13 30-18 47-18 18 0 36 6 49 19 11 11 17 35 21 73l6 58c1 12-9 21-21 21H227c-12 0-21-9-20-21l5-58c4-39 10-62 24-74Z"
          fill="url(#orbit-coat)"
        />
        {/* Lapels */}
        <path
          d="M283 245c-9 29-9 72-3 108l15 40 8-4-8-43c-1-16 1-33 5-51l-17-50Z"
          fill="#FFFFFF"
          stroke="#E8E2F2"
          strokeWidth="1.2"
        />
        <path
          d="M285 245c9 29 10 68 4 101l-4 14"
          stroke="#D8CFE9"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        {/* Scrub shirt visible at neck */}
        <path
          d="M285 243c7 8 9 13 0 24-9-11-7-16 0-24Z"
          fill="#8D7AD0"
        />

        {/* Left arm and hand */}
        <path
          d="M224 280c-12 27-20 58-23 90-1 11 6 20 16 21 10 1 19-6 20-17 3-31 9-58 19-79l-32-15Z"
          fill="#FFFFFF"
          stroke="#E8E2F2"
          strokeWidth="1.4"
        />
        <path
          d="M216 384c-8 7-8 18 0 24 8 7 20 5 25-4l8-15-17-13-16 8Z"
          fill="#F0C2AE"
        />

        {/* Clipboard */}
        <g transform="rotate(-7 260 354)">
          <rect x="192" y="286" width="112" height="139" rx="12" fill="#4A3B75" />
          <rect x="199" y="297" width="98" height="121" rx="8" fill="#FFFDFF" />
          <rect x="226" y="282" width="47" height="20" rx="7" fill="#6550B5" />
          <circle cx="250" cy="292" r="3.2" fill="#D9CFF0" />
          <path
            d="M216 320h59M216 336h43M216 358h63M216 374h51M216 390h34"
            stroke="#D8CFE9"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M214 349h65"
            stroke="#E8E2F2"
            strokeWidth="1.2"
          />
          <circle cx="270" cy="399" r="7" fill="#E7E0F8" />
          <path
            d="m267 399 2.2 2.2 4-4.5"
            stroke="#6550B5"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Right arm wrapping clipboard */}
        <path
          d="M334 276c17 14 30 34 40 58 4 10 0 21-10 25-10 4-21-1-25-11-7-19-17-34-31-44l26-28Z"
          fill="#FFFFFF"
          stroke="#E8E2F2"
          strokeWidth="1.4"
        />
        <path
          d="M357 347c10-1 18 7 18 17 0 10-8 17-18 16-8-1-14-8-14-16 0-9 5-16 14-17Z"
          fill="#F0C2AE"
        />

        {/* Stethoscope */}
        <path
          d="M271 250c-6 30 2 48 21 53 16 4 29-6 32-22"
          stroke="#6550B5"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <circle cx="324" cy="279" r="8" fill="#E7E0F8" stroke="#6550B5" strokeWidth="2.4" />
        <circle cx="324" cy="279" r="3" fill="#7C67C7" />

        {/* Head */}
        <path
          d="M262 167c0-29 15-49 40-49 26 0 41 21 41 50v18c0 29-18 49-41 49-24 0-40-21-40-49v-19Z"
          fill="#F3C9B8"
        />
        <path
          d="M260 189c-3-33 6-60 26-71 10-6 22-6 33-2 22 7 32 31 27 61-8-8-14-22-15-35-13 9-36 12-55 9-1 17-6 29-16 38Z"
          fill="url(#orbit-hair)"
        />
        <path
          d="M274 210c10 8 23 12 36 4"
          stroke="#B56E62"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.55"
        />
        <path
          d="M278 177c4-4 9-4 12 0M314 177c4-4 9-4 12 0"
          stroke="#3A2E5F"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="284" cy="184" r="2.3" fill="#3A2E5F" />
        <circle cx="320" cy="184" r="2.3" fill="#3A2E5F" />
        <path
          d="M300 194c-1 4 0 7 3 8"
          stroke="#C98A78"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M292 210c5 4 11 4 16 0"
          stroke="#A65B53"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Hair front waves */}
        <path
          d="M265 175c-4-26 5-45 22-52M349 171c3-25-3-42-18-51"
          stroke="#4A3B75"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.35"
        />
      </g>

      {/* Scrub trousers, kept abstract at the lower edge */}
      <path
        d="M250 413c-2 15-5 26-10 37h31l9-34 8 34h32c-6-13-8-24-9-37H250Z"
        fill="url(#orbit-scrub)"
      />
      <path
        d="M286 415v34"
        stroke="#5541A1"
        strokeWidth="2"
        opacity="0.35"
      />
    </svg>
  );
}
