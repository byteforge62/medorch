# Asset Manifest

## Licence

All photographs are from **Pexels** and used under the [Pexels License](https://www.pexels.com/license/): free to use, modification permitted, attribution not required. Files were downloaded on **8 November 2026**, reviewed, resized and stored locally as WebP. No external image URL is loaded at runtime. No image shows an identifiable patient, a patient record or a hospital brand.

Photographer names were not present in downloaded metadata; the source page is the authoritative credit link.

## Active images

Only three surfaces still render a photograph, and none presents it plainly.

| Asset | Source | Used on | Treatment |
|---|---|---|---|
| `theatre-suite.webp` | [pexels.com/photo/39824872](https://www.pexels.com/photo/39824872/) | Admin dashboard theatre window; landing schedule preview | Dashboard: 1.5px blur, `saturate 0.32`, sepia 0.16, brightness 0.82, pine mix-blend wash, ink scrim, ambient blurred duplicate behind. Landing: 1.5px blur, `saturate 0.5`, clinical scrim. |
| `treatment-room.webp` | [pexels.com/photo/7108114](https://www.pexels.com/photo/7108114/) | Sign-in / auth boundary | Blurred 3px, desaturated, under an ink wash; used as atmosphere, not content. |

The assets `theatre-plant.webp`, `clinical-corridor.webp`, `patient-monitor.webp`, `vitals-monitor.webp`, `anaesthesia-workstation.webp` and `clinical-corridor-team.webp` remain in the local asset folder and media register, but **no product surface renders them** after this pass. They are retained rather than deleted so the register and fallback manifest stay stable; they can be removed in a later cleanup.

## Derived assets

| File | Purpose |
|---|---|
| `src/assets/clinical/blur.json` | Base64 blur placeholders for the eight files, used with `placeholder="blur"`. |

## Technical handling

- Static imports through `src/lib/clinical-media.ts`; hashed, cacheable URLs and intrinsic dimensions.
- `next/image` with `fill`, explicit `sizes` and fixed containers; no layout shift from image load.
- `ClinicalBackdrop` images are `alt=""` + `aria-hidden`; surrounding copy states what they show.
- `AmbientField` images are decorative and blurred; they never carry information.
- If a file fails, `ClinicalPlate` replaces it with a blueprint field carrying the plate code and caption. `ClinicalBackdrop` and `AmbientField` have no visible fallback because they are non-informational.
- Fixed aspect ratios: theatre window ~16:6 on desktop, auth stack fills the panel.

## Selection rules

- Environment only: rooms and equipment. No patient body or face.
- No stock face is attached to a named clinician.
- No photograph is used as a substitute for missing data.
- No photograph is asserted to be a specific MedOrch room; the theatre detail now uses a drawing, not a claimed site photo.
