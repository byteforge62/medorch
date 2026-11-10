'use client';

import { useState } from 'react';
import Image from 'next/image';
import { blurFor, clinicalMedia, type ClinicalMediaKey } from '@/lib/clinical-media';

const ASPECTS = {
  cinema: 'aspect-[16/9]',
  wide: 'aspect-[21/9]',
  plate: 'aspect-[4/3]',
  portrait: 'aspect-[3/4]',
  square: 'aspect-square',
  tall: 'aspect-[4/5]',
} as const;

export type ClinicalPlateAspect = keyof typeof ASPECTS;

/*======================================================================
  ClinicalPlate — a captioned clinical photograph.
  ======================================================================
  Photography in MedOrch is evidence, not decoration, so every image is
  printed as a plate: a fixed aspect, a registration code, a factual
  caption and the source. The image fades in over its own blur so there
  is never a layout shift or a white hole, and if the file cannot load
  the plate degrades to a labelled blueprint field rather than breaking
  the composition.
====================================================================== */

export function ClinicalPlate({
  media,
  aspect = 'cinema',
  caption,
  detail,
  className = '',
  sizes = '(min-width: 1024px) 42vw, 100vw',
  priority = false,
  showCaption = true,
  showSource = true,
  framed = true,
}: {
  media: ClinicalMediaKey;
  aspect?: ClinicalPlateAspect;
  caption?: string;
  detail?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  showCaption?: boolean;
  showSource?: boolean;
  framed?: boolean;
}) {
  const entry = clinicalMedia[media];
  // Store which plate failed rather than a boolean, so a new media prop
  // automatically gets a fresh load attempt without a state-reset effect.
  const [failedMedia, setFailedMedia] = useState<ClinicalMediaKey | null>(null);
  const failed = failedMedia === media;

  return (
    <figure
      className={`photo-reveal ${framed ? 'panel overflow-hidden' : 'overflow-hidden'} ${className}`}
    >
      <div className={`relative w-full ${ASPECTS[aspect]} bg-surface-muted`}>
        {failed ? (
          <div className="blueprint text-ink-subtle absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
            <span className="font-mono text-[10px] tracking-[0.16em]">
              {entry.plate}
            </span>
            <span className="text-ink-secondary max-w-[28ch] text-[12px] leading-snug">
              {entry.caption}
            </span>
            <span className="text-ink-subtle font-mono text-[9px] tracking-[0.12em] uppercase">
              Image unavailable
            </span>
          </div>
        ) : (
          <Image
            src={entry.src}
            alt={caption ?? entry.caption}
            fill
            sizes={sizes}
            priority={priority}
            placeholder="blur"
            blurDataURL={blurFor(media)}
            className="object-cover"
            onError={() => setFailedMedia(media)}
          />
        )}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/10"
        />
      </div>

      {showCaption ? (
        <figcaption className="border-rule flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t px-3.5 py-2.5">
          <span className="text-brass shrink-0 font-mono text-[9.5px] tracking-[0.14em]">
            {entry.plate}
          </span>
          <span className="text-ink min-w-0 flex-1 text-[11.5px] leading-snug font-medium">
            {caption ?? entry.caption}
          </span>
          {showSource ? (
            <a
              href={entry.source}
              target="_blank"
              rel="noreferrer noopener"
              className="text-ink-subtle hover:text-ink shrink-0 font-mono text-[9px] tracking-[0.1em] uppercase underline-offset-2 hover:underline"
            >
              Pexels
            </a>
          ) : null}
          {detail ? (
            <span className="text-ink-muted w-full text-[10.5px] leading-snug">
              {detail}
            </span>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}

/*======================================================================
  AmbientField — a photograph dissolved into the paper.
  ======================================================================
  The image is printed far out of focus behind a wash of the working
  colour, so a screen can carry environmental depth without presenting a
  picture. It is always decorative: hidden from assistive technology and
  never the only source of information.
====================================================================== */

export function AmbientField({
  media,
  className = '',
  tone = 'pine',
}: {
  media: ClinicalMediaKey;
  className?: string;
  tone?: 'pine' | 'ink' | 'rust';
}) {
  const entry = clinicalMedia[media];
  const wash =
    tone === 'ink'
      ? 'from-[#18261f]/70 via-[#18261f]/35 to-transparent'
      : tone === 'rust'
        ? 'from-[#a45d3f]/25 via-[#f1efe8]/10 to-transparent'
        : 'from-[#24594a]/30 via-[#24594a]/10 to-transparent';

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <Image
        src={entry.src}
        alt=""
        fill
        sizes="100vw"
        placeholder="blur"
        blurDataURL={blurFor(media)}
        className="scale-110 object-cover opacity-45 blur-[54px] saturate-[0.7]"
      />
      <div className={`absolute inset-0 bg-gradient-to-br ${wash}`} />
    </div>
  );
}

/*======================================================================
  ClinicalBackdrop — the same registered photographs, used as the ground
  for a masthead or access plate. It carries no caption of its own; the
  containing composition prints the plate line. A scrim keeps type at
  AA contrast, and the image is hidden from assistive technology because
  the surrounding text already states what the photograph shows.
====================================================================== */

export function ClinicalBackdrop({
  media,
  className = '',
  sizes = '100vw',
  priority = false,
  scrim = 'ink',
  position = 'center',
  imageClassName = '',
}: {
  media: ClinicalMediaKey;
  className?: string;
  sizes?: string;
  priority?: boolean;
  scrim?: 'ink' | 'clinical' | 'none';
  position?: 'center' | 'top' | 'bottom';
  imageClassName?: string;
}) {
  const entry = clinicalMedia[media];

  const scrimClass =
    scrim === 'ink'
      ? 'bg-[linear-gradient(105deg,rgba(20,38,56,0.92)_0%,rgba(20,38,56,0.74)_38%,rgba(20,38,56,0.42)_68%,rgba(20,38,56,0.62)_100%)]'
      : scrim === 'clinical'
        ? 'bg-[linear-gradient(180deg,rgba(20,38,56,0.18)_0%,rgba(20,38,56,0.52)_62%,rgba(20,38,56,0.82)_100%)]'
        : '';

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <Image
        src={entry.src}
        alt=""
        aria-hidden="true"
        fill
        sizes={sizes}
        priority={priority}
        placeholder="blur"
        blurDataURL={blurFor(media)}
        className={`object-cover ${
          position === 'top'
            ? 'object-top'
            : position === 'bottom'
              ? 'object-bottom'
              : 'object-center'
        } ${imageClassName}`}
      />
      {scrim !== 'none' ? (
        <div className={`absolute inset-0 ${scrimClass}`} aria-hidden="true" />
      ) : null}
    </div>
  );
}
