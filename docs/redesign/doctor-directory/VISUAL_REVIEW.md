# Doctor Directory — Visual Review

Captured with Playwright (Chromium, device scale factor 1) against
`http://localhost:3100`, from the final source tree. Full-page captures unless noted; the recorded
width is the viewport width, so column behaviour is exactly what a visitor at that size sees.

Two artifacts appear in some captures and are **not** part of the design:

1. the round black **"N"** badge — the Next.js dev-mode indicator overlay;
2. the thin **pink/amber banner** — the preview/harness notice, deliberately kept so a screenshot
   can never be mistaken for a real clinical record.

---

## 1. Inventory

| File | Viewport | Route | State | Authenticity |
| --- | --- | --- | --- | --- |
| `00-before-1440.png` | 1440×900 (1347 tall) | `/preview/doctors-before` (temporary route) | HEAD component, unfiltered, no selection | Real HEAD source (`git show HEAD:…`) rendered against preview fixtures. Temporary route deleted after capture. |
| `01-desktop-default-1440.png` | 1440×900 (1097 tall) | `/preview/doctors` | Default: 6 clinicians, contextual profile on Anaya Sharma, no explicit selection | Real component, real fixture data, no session → read-only |
| `02-desktop-overview-1440.png` | 1300×266 region crop of the 1440 viewport | `/preview/doctors` | Masthead + ledger + composition band only | Same page as 01, cropped region |
| `03-desktop-search-1440.png` | 1440×900 (1027 tall) | `/preview/doctors` | Search `Vaz` → 1 result, profile follows | Real interaction (`fill`) |
| `04-desktop-specialty-filter-1440.png` | 1440×900 (1027 tall) | `/preview/doctors` | Specialty **Adult cardiac surgery** selected via rail; `aria-pressed` set | Real interaction (click) |
| `05-desktop-selected-1440.png` | 1440×900 (1121 tall) | `/preview/doctors` | Kabir Nair explicitly selected: 2 px rule, tinted row, profile replaced | Real interaction (click) |
| `06-desktop-admin-approve-1440.png` | 1440×900 (1184 tall) | `/preview/doctors-admin` | Ivan Petrov approved: chip Active, ledger Approved 3 / Awaiting 0, Approve disabled | **Harness**: synthetic ADMIN session, stubbed transport |
| `07-desktop-admin-edit-panel-1440.png` | 1440×900 (1429 tall) | `/preview/doctors-admin` | Edit panel open, prefilled, values changed but not yet saved; Cancel / Save changes | **Harness** (as above) |
| `08-laptop-default-1024.png` | 1024×768 (1188 tall) | `/preview/doctors` | Default three-column workspace at the `lg` breakpoint | Real component, fixtures |
| `09-mobile-default-390.png` | 390×844 (1422 tall) | `/preview/doctors` | Default: 2×2 ledger, wrapped legend, chip rail, stacked rows, no sheet | Real component, fixtures |
| `10-mobile-sheet-390.png` | 390×844 (viewport only) | `/preview/doctors` | Bottom sheet for Ivan Petrov open over dimmed index, focus on **Close** | Real interaction (click) |
| `11-desktop-readonly-1440.png` | 1440×900 (1097 tall) | `/preview/doctors` | Same as 01, kept as the authorization evidence state ("Read-only view. Account governance requires administrator access.") | Real component, no session |
| `12-desktop-admin-after-actions-1440.png` | 1440×900 (1184 tall) | `/preview/doctors-admin` | After approve + suspend + edit + create: 5 profiles, edited specialty, new pending clinician | **Harness** (as above) |
| `13-desktop-admin-suspend-1440.png` | 1440×900 (1184 tall) | `/preview/doctors-admin` | Ivan Petrov suspended: chip Suspended, Restricted 2, Suspend disabled | **Harness** (as above) |

Visual checks that could not be produced: any state requiring a database (`profiles from the real
hospital`), signed-in non-admin behaviour, and hover/focus visuals beyond what a static capture can
show.

## 2. Before → after

**Before (00).** Four white stat cards, a search card, then a six-column table inside a card, with
"View details" links. The page answers "how many" and "which row", and nothing else. Every column
is text at the same weight; status is a small chip in the fifth column; the only visual hierarchy is
the card boundaries. At 1440 px the table is comfortable; below 820 px it must scroll horizontally.

**After (01).** Reading order is now deliberate:

1. an eyebrow (`MEDICAL STAFF OFFICE`) and a large editorial title (`Clinical Workforce`) that
   establishes the domain, balanced against the ledger on the right;
2. four figures on hairlines — the same numbers as before, no longer boxed, aligned to the
   description's baseline so the eye reads title → sentence → numbers;
3. a single proportional band that answers "what is this workforce made of" in one glance, with a
   legend that is also the filter;
4. one bounded surface, rules dividing rail / index / profile, where each row is an editorial
   ledger entry (ordinal, name, specialty/department, licence, status) instead of a table row.

The same data now supports comparison without navigation: selecting a row updates the profile pane,
and the ledger updates immediately after a governance action (06, 13).

## 3. Composition review by viewport

**1440×900 (01, 05).** The three columns land at 10.5 rem / fluid / 18 rem, leaving the index
~800 px — enough for the name, `specialty / department`, licence and status chip on two lines
without truncation. The masthead and band span the full width, so the workspace reads as a
follow-on to the overview rather than a separate screen. The selected row's 2 px rule plus its
tinted background make selection legible at a glance (05).

**1024×768 (08).** The layout stays three-column instead of collapsing into cards; the ledger
moves under the description and the band legend wraps to two lines. The index still shows name,
specialty/department, licence and status without clipping. Nothing overflows horizontally.

**390×844 (09, 10).** The hierarchy survives the collapse: title, description, a 2×2 ledger, the
band with a two-line legend, then the rail as a horizontally scrolling chip strip. Rows keep their
ordinal and status chip; the desktop aside is absent, and the sheet appears only after a tap (10),
with the record scrolled internally instead of stretching the page.

**Legibility details.** Mono is used only where numerals must align (ordinals, ledger figures,
licence numbers, dates). Status is never colour-only — chip text, row chip and completeness labels
all carry words. The composition band is a single flat bar of token opacities; no gradients, no
glass, no blobs, no decorative badges anywhere.

## 4. Defects found visually and fixed

| Finding | Evidence before fix | Fix |
| --- | --- | --- |
| Blank white monogram on the profile avatar | first 1440 capture | `text-primary-foreground` → `text-white` |
| Desktop aside appeared under the index at 390 px | first mobile capture | aside `hidden … lg:block`, sheet as the sole mobile profile |
| 1024 px collapsed into a single stacked column | first laptop capture | `xl:` → `lg:` |
| Composition band rendered as one flat colour | first 1440 capture | removed invalid `color-mix(var(--primary))`, added `BAND_TONES` |
| Horizontal page scroll at 390 px | measured 390 px overflow | `min-w-0` on grid children, rail `w-full` |
| "5 specialties across 1 departments" | 1440 harness capture after editing | conditional singular/plural for both nouns |

## 5. Honest limitations of this review

- Screenshots cannot show persistence. The admin states were produced with a stubbed transport on
  a synthetic ADMIN session; the banner in those captures says so.
- The dev overlay ("N") and the preview banner are environment chrome, not design.
- Hover and focus rings were exercised only functionally (keyboard test), not captured frame by
  frame; reduced-motion behaviour is enforced by the global `prefers-reduced-motion` block, not by
  a screenshot.
- No screenshot was retouched, cropped to hide a defect, or composed from separate images.
