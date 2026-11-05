import React from 'react';
import { ArrowRight, Plus, Trash, DownloadSimple } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/Button';
import { Row, Specimen } from './specimen';

/*======================================================================
  Button specimens
====================================================================== */

const variants = [
  ['primary', 'Primary'],
  ['secondary', 'Secondary'],
  ['outline', 'Outline'],
  ['ghost', 'Ghost'],
  ['danger', 'Destructive'],
] as const;

export function ButtonSpecimens() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Specimen
        name="Variants"
        variant="variant='primary' | 'secondary' | 'outline' | 'ghost' | 'danger'"
        note="One filled action per surface. Outline for the alternative, ghost for tertiary, danger only for harm."
      >
        <Row label="md (default)">
          {variants.map(([value, label]) => (
            <Button key={value} variant={value}>
              {label}
            </Button>
          ))}
        </Row>
        <Row label="Pill shape">
          {variants.map(([value, label]) => (
            <Button key={value} variant={value} shape="pill">
              {label}
            </Button>
          ))}
        </Row>
      </Specimen>

      <Specimen
        name="Sizes"
        variant="size='xs' | 'sm' | 'md' | 'lg'"
        note="Default md. lg is reserved for a landing hero; xs for dense table actions."
      >
        <Row label="Primary">
          <Button size="xs">Extra small</Button>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </Row>
        <Row label="Outline">
          <Button size="xs" variant="outline">Extra small</Button>
          <Button size="sm" variant="outline">Small</Button>
          <Button size="md" variant="outline">Medium</Button>
          <Button size="lg" variant="outline">Large</Button>
        </Row>
      </Specimen>

      <Specimen
        name="Icon, text and loading"
        variant="variant='icon' | 'text' · isLoading"
        note="Icon buttons require aria-label, because the child is a glyph. Loading keeps the width and announces itself."
      >
        <Row label="Icon">
          <Button variant="icon" aria-label="Add record" size="sm">
            <Plus size={16} aria-hidden="true" />
          </Button>
          <Button variant="icon" aria-label="Download" size="md">
            <DownloadSimple size={16} aria-hidden="true" />
          </Button>
          <Button variant="icon" aria-label="Delete" size="md">
            <Trash size={16} aria-hidden="true" />
          </Button>
        </Row>
        <Row label="Text">
          <Button variant="text">View all records</Button>
          <Button variant="text" size="sm">
            Show audit trail
            <ArrowRight size={12} aria-hidden="true" />
          </Button>
        </Row>
        <Row label="Loading">
          <Button isLoading loadingLabel="Saving changes">
            Saving
          </Button>
          <Button variant="outline" isLoading loadingLabel="Loading">
            Loading
          </Button>
        </Row>
      </Specimen>

      <Specimen
        name="States"
        variant="disabled · onDark"
        note="Disabled is opacity plus cursor, never colour alone. The dark plate shows the same component over an inverted surface."
      >
        <Row label="Disabled">
          <Button disabled>Primary</Button>
          <Button variant="outline" disabled>
            Outline
          </Button>
          <Button variant="ghost" disabled>
            Ghost
          </Button>
        </Row>

        <div className="bg-ink mt-3 flex flex-wrap items-center gap-2 rounded-[var(--radius-control)] p-4">
          <Button className="bg-[#d8b98a] text-[#17130f] hover:bg-[#e5cba3]">
            On dark
          </Button>
          <Button
            variant="outline"
            className="border-white/25 text-white hover:bg-white/10"
          >
            Outline
          </Button>
          <Button variant="ghost" className="text-white/70 hover:bg-white/10 hover:text-white">
            Ghost
          </Button>
        </div>
      </Specimen>
    </div>
  );
}
