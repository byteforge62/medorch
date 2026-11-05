import React from 'react';
import { Wordmark } from '@/components/brand/Brand';
import { SiteNav } from '@/components/ui/SiteNav';
import { Row, Specimen } from './specimen';

/*======================================================================
  Navigation specimens — the same component, four treatments.
  Resize below 1024px to see every one collapse to the same
  disclosure + panel mobile navigation.
====================================================================== */

const items = [
  { label: 'Platform', href: '#platform' },
  { label: 'Interface', href: '#interface' },
  {
    label: 'Modules',
    children: [
      { label: 'Schedules', href: '#platform', description: 'States and transitions' },
      { label: 'Theatres', href: '#interface', description: 'Room state' },
      { label: 'Equipment', href: '#platform', description: 'Availability' },
    ],
  },
];

const cta = { label: 'Sign in', href: '/login' };

export function NavigationSpecimens() {
  return (
    <div className="grid gap-4">
      <Specimen
        name="Minimal"
        variant="variant='minimal'"
        note="A rule under the masthead and nothing else. Used when the page itself supplies the frame (Direction A)."
      >
        <div className="border-border overflow-hidden rounded-[var(--radius-panel)] border">
          <SiteNav
            variant="minimal"
            brand={<Wordmark size="sm" />}
            items={items}
            secondary={{ label: 'Playground', href: '/design-system' }}
            cta={cta}
          />
          <div className="bg-paper text-ink-subtle h-16 px-4 py-4 font-mono text-[10px]">
            page content
          </div>
        </div>
      </Specimen>

      <Specimen
        name="Floating"
        variant="variant='floating'"
        note="A detached capsule with pill controls. Reads as a layer above the page (Direction B)."
      >
        <div className="border-border bg-surface-subtle overflow-hidden rounded-[var(--radius-panel)] border pt-1 pb-6">
          <SiteNav
            variant="floating"
            brand={<Wordmark size="sm" />}
            items={items}
            secondary={{ label: 'Playground', href: '/design-system' }}
            cta={cta}
          />
        </div>
      </Specimen>

      <Specimen
        name="Solid"
        variant="variant='solid' (default)"
        note="Full-width bar with a hairline and a filled action. The default for product-adjacent pages."
      >
        <div className="border-border overflow-hidden rounded-[var(--radius-panel)] border">
          <SiteNav
            variant="solid"
            brand={<Wordmark size="sm" />}
            items={items}
            secondary={{ label: 'Playground', href: '/design-system' }}
            cta={cta}
          />
        </div>
      </Specimen>

      <Specimen
        name="Transparent"
        variant="variant='transparent'"
        note="No chrome of its own; sits on the dark hero and inherits the hero's ground (Direction C)."
      >
        <div className="overflow-hidden rounded-[var(--radius-panel)] bg-[#081216]">
          <SiteNav
            variant="transparent"
            brand={<Wordmark tone="chalk" size="sm" />}
            items={items}
            secondary={{ label: 'Playground', href: '/design-system' }}
            cta={cta}
          />
          <div className="h-14 px-4 py-3 font-mono text-[10px] text-white/40">
            hero ground
          </div>
        </div>
      </Specimen>

      <Specimen
        name="Dropdown and mobile"
        variant="items[].children · disclosure below 1024px"
        note="A dropdown is a disclosure button (aria-expanded), closed by Escape or an outside click. The same component renders a disclosure panel below lg."
      >
        <Row label="Try it">
          <p className="text-ink-muted text-[12px]">
            Open <strong className="text-foreground">Modules</strong> in any
            specimen above, then press Escape. Shrink the window below 1024px to
            get the mobile trigger.
          </p>
        </Row>
      </Specimen>
    </div>
  );
}
