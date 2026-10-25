'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

export function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-white px-6 pb-24 pt-10 sm:px-10 lg:px-16 xl:px-24">
      <svg
        aria-hidden="true"
        className="pointer-events-none -ml-24 -mt-32 h-[56rem] w-[56rem] text-primary-soft"
        viewBox="0 0 384 384"
        preserveAspectRatio="xMidYMid slice"
      >
        <circle cx="184" cy="172" r="96" fill="currentColor" fillOpacity="0.25" />
        <circle cx="252" cy="128" r="56" fill="currentColor" fillOpacity="0.18" />
        <circle cx="300" cy="280" r="120" fill="currentColor" fillOpacity="0.12" />
        <circle cx="60" cy="300" r="140" fill="currentColor" fillOpacity="0.08" />
      </svg>

      <div className="relative mx-auto max-w-3xl">
        <p className="inline-flex items-center gap-2 rounded-full border border-primary-soft bg-primary-soft/40 px-3 py-1 text-xs font-medium text-primary">
          Hospital operations, centralised
        </p>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Run the operating theatre,
          <br />
          <span className="text-primary">not the paperwork.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-foreground-muted sm:text-xl">
          MedOrch gives surgical teams one place for schedules, OT rooms,
          equipment, staff and patient records — with role-aware access
          baked in from the start.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-foreground-inverse shadow-sm transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Sign in to MedOrch
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-lg border border-border-strong bg-transparent px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Request an account
          </Link>
        </div>
      </div>
    </section>
  );
}
