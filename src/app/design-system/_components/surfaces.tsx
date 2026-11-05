import React from 'react';
import { Surface } from '@/components/ui/Surface';
import { MetricIndicator } from '@/components/ui/Indicators';
import { StatusPill } from '@/components/ui/StatusPill';
import { ProductPreview } from '@/components/landing/system/preview';
import { Specimen } from './specimen';

/*======================================================================
  Surface specimens
====================================================================== */

export function SurfaceSpecimens() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Specimen
        name="Standard, feature and inset"
        variant="variant='plain' | 'feature' | 'inset'"
        note="Elevation is a material decision: feature sits above the page, inset below it."
      >
        <div className="grid gap-3">
          <Surface variant="plain">
            <p className="text-foreground text-[13px] font-semibold">
              Standard surface
            </p>
            <p className="text-ink-muted mt-1 text-[12px]">
              Default panel: hairline, soft shadow, panel radius.
            </p>
          </Surface>
          <Surface variant="feature">
            <p className="text-foreground text-[13px] font-semibold">
              Feature surface
            </p>
            <p className="text-ink-muted mt-1 text-[12px]">
              One step higher, for the single thing the section is about.
            </p>
          </Surface>
          <Surface variant="inset" padding="sm">
            <p className="text-ink-secondary text-[12px]">
              Inset well — groups supporting content without another card border.
            </p>
          </Surface>
        </div>
      </Specimen>

      <Specimen
        name="Interactive and metric"
        variant="variant='interactive' | 'metric' · tone='default' | 'inverted'"
        note="Interactive lifts 2px on hover and holds focus inside. Metric is the smallest card that still carries a label, a value and a detail line."
      >
        <Surface variant="interactive" className="mb-3">
          <p className="text-foreground text-[13px] font-semibold">
            Interactive card
          </p>
          <p className="text-ink-muted mt-1 text-[12px]">
            Hover to lift. Motion is disabled when reduced motion is requested.
          </p>
        </Surface>

        <div className="grid gap-3 sm:grid-cols-2">
          <Surface variant="metric" padding="sm">
            <MetricIndicator
              label="Theatres reporting"
              value="4"
              detail="One suite delayed"
              tone="accent"
            />
          </Surface>
          <Surface variant="metric" padding="sm" tone="inverse">
            <MetricIndicator
              label="Schedule states"
              value="6"
              detail="Fixed transition set"
              tone="accent"
            />
          </Surface>
        </div>
      </Specimen>

      <Specimen
        name="Product preview surface"
        variant="variant='preview' · ProductFrame"
        note="A framed slice of the interface. Always labelled Preview: sample rows are never presented as live data."
        className="lg:col-span-2"
      >
        <ProductPreview variant="equipment" />
      </Specimen>

      <Specimen
        name="Tones"
        variant="tone='default' | 'raised' | 'tinted' | 'inverse'"
        className="lg:col-span-2"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Surface tone="default" padding="sm">
            <p className="text-ink-muted text-[10px] uppercase">default</p>
            <p className="text-foreground mt-2 text-[12px]">Sheet</p>
          </Surface>
          <Surface tone="raised" padding="sm">
            <p className="text-ink-muted text-[10px] uppercase">raised</p>
            <p className="text-foreground mt-2 text-[12px]">Raised sheet</p>
          </Surface>
          <Surface tone="tinted" padding="sm">
            <p className="text-ink-muted text-[10px] uppercase">tinted</p>
            <p className="text-foreground mt-2 text-[12px]">Recessed</p>
          </Surface>
          <Surface tone="inverse" padding="sm">
            <p className="text-white/50 text-[10px] uppercase">inverse</p>
            <p className="text-white mt-2 text-[12px]">Ink plate</p>
          </Surface>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <StatusPill tone="positive" dot>
            Available
          </StatusPill>
          <StatusPill tone="attention" dot>
            In use
          </StatusPill>
          <StatusPill tone="critical" dot>
            Delayed
          </StatusPill>
        </div>
      </Specimen>
    </div>
  );
}
