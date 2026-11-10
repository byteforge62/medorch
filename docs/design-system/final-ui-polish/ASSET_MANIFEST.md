# Asset Manifest

## Final active visual assets

The recovered interface renders **no raster photography**. That is intentional: the
accepted Final Transformation UI is an operational record, not a photo-led site.

| Asset | Type | Where active | Notes |
| --- | --- | --- | --- |
| `src/components/visual/TheatrePlan.tsx` | Inline SVG | Auth / recovery sheet | Drawn theatre plan: corridor, theatre, scrub bay, anaesthesia bay and equipment store. Accessible description is present. No photograph and no claim that it is a specific room. |
| Phosphor icons | Existing dependency | Sidebar, header, buttons, alerts | Interface symbols only; no branding or clinical claims. |
| Typographic wordmark and aperture | Inline SVG / CSS | Header, auth, public shell | Accepted identity. No image file involved. |

No external image URL is requested at runtime. The browser audit recorded `images=0`
on every captured route.

## Retained but inactive clinical photography

These files remain in the working tree because they were uncommitted work from the
rejected visual pass and the brief prohibited deleting uncommitted work. **No recovered
page renders them.** They are not a claim about MedOrch’s rooms or devices.

| File | Source | Intended subject | Final use |
| --- | --- | --- | --- |
| `src/assets/clinical/theatre-suite.webp` | [pexels.com/photo/39824872](https://www.pexels.com/photo/39824872/) | Laminar-flow theatre set for a case | Inactive |
| `src/assets/clinical/theatre-plant.webp` | [pexels.com/photo/39299175](https://www.pexels.com/photo/39299175/) | Theatre floor in service | Inactive |
| `src/assets/clinical/treatment-room.webp` | [pexels.com/photo/7108114](https://www.pexels.com/photo/7108114/) | Treatment bay prepared for a procedure | Inactive |
| `src/assets/clinical/clinical-corridor.webp` | [pexels.com/photo/11660582](https://www.pexels.com/photo/11660582/) | Empty theatre transport corridor | Inactive |
| `src/assets/clinical/patient-monitor.webp` | [pexels.com/photo/5875565](https://www.pexels.com/photo/5875565/) | Patient monitor on a trolley | Inactive |
| `src/assets/clinical/vitals-monitor.webp` | [pexels.com/photo/11198232](https://www.pexels.com/photo/11198232/) | Vital-signs monitor | Inactive |
| `src/assets/clinical/anaesthesia-workstation.webp` | [pexels.com/photo/13697729](https://www.pexels.com/photo/13697729/) | Anaesthesia workstation | Inactive |
| `src/assets/clinical/clinical-corridor-team.webp` | [pexels.com/photo/127873](https://www.pexels.com/photo/127873/) | Clinical team at a distance | Inactive |

- Licence: [Pexels License](https://www.pexels.com/license/), downloaded 8 November
  2026. Free to use and modify; attribution not required. Source pages are retained as
  the authoritative credit.
- No image shows an identifiable patient, a patient record or a hospital brand.
- `src/assets/clinical/blur.json` holds the associated base64 placeholders.
- `src/lib/clinical-media.ts` retains the media register and source metadata.
- `src/components/visual/ClinicalPlate.tsx` retains the unused plate component and its
  fallback logic. Neither is imported by a rendered route.
- `src/components/visual/TheatreSchematic.tsx` and
  `src/app/(workspace)/equipment/EquipmentRegister.tsx` are likewise retained but
  unused.

## Rejected: equipment thumbnails

The interrupted run added 40×40 equipment thumbnails using this media register. They
were removed after review.

The register’s categories include emergency equipment, neurosurgical equipment and
orthopaedic instruments. The existing `equipmentPlate()` mapping falls back to a
generic theatre photograph for those categories. Placing that photograph beside a named
defibrillator or drill would imply the photo represented the specific registered asset.
That is not acceptable under the brief’s imagery rules. The final equipment page is the
accepted text register with readiness and status controls.

## Image checks

The final browser run found:

- rendered raster images: **0**;
- broken images: **0**;
- images missing an `alt` attribute: **0**.

Because no raster image is rendered, there is no runtime image fallback path in the
recovered UI. The inline SVG plan carries an accessible description. The retained
components are not evidence that a photograph is active.

## Explicitly absent

- No fabricated clinician or patient portraits.
- No stock face attached to a named person.
- No external logo or brand asset.
- No generated clinical image presented as a real record.
- No new image dependency.
