# MedOrch Design System (`DESIGN.md`)
**Version:** 1.0  
**Aesthetic Direction:** Clinical Cobalt & Bio-Teal Precision ("Live Clinical Choreography")  
**Tech Stack Guardrail:** React (Standard JavaScript `.jsx` / `.js` ONLY — **NO TypeScript**), Tailwind CSS, Framer Motion, and Lucide React.

---

## 1. Visual Philosophy & Surface Architecture
- **Calm Clinical Precision:** High-contrast scannability on an airy porcelain canvas, eliminating dark cluttered SaaS boxes or generic stock hospital imagery[cite: 5].
- **Blueprint Canvas Background:** Cool Porcelain (`#F4F7FA`) base paired with a subtle radial mesh (`#EBF1F8` → `#F4F7FA`) and a crisp geometric blueprint dot-grid overlay (`radial-gradient(#CBD5E1 1px, transparent 1px)` at `20px 20px`) inside orchestration stages[cite: 5].
- **Glassmorphism & Elevation:**
  - **Floating Pill Navbar:** `rounded-full`, frosted translucent white (`rgba(255, 255, 255, 0.85)` + `backdrop-blur-md`), `1px solid rgba(29, 78, 216, 0.12)` border, subtle ambient shadow[cite: 5].
  - **Bento & Operational Cards:** Soft-rounded containers (`rounded-3xl` for primary bento blocks, `rounded-2xl` for operational cards) on Pure White (`#FFFFFF`) with `1px solid #E2E8F0` border[cite: 5].
  - **Dark Telemetry Block:** Midnight Navy (`#0F172A`) reserved strictly for high-focus live telemetry/conflict-lock modules (e.g., *Zero-conflict OT allocation* with animated Bio-Teal ECG waveform)[cite: 5].

---

## 2. Color Tokens (`tailwind.config.js`)

| Token Name | Hex Code | Role & Usage |
| :--- | :--- | :--- |
| `cobalt` | `#1D4ED8` | Primary brand accent, primary CTAs, active filter pills, hero highlight text, brand cross emblem[cite: 5] |
| `cobalt-hover` | `#1E40AF` | Hover & active press state for primary cobalt buttons |
| `cobalt-soft` | `#DBEAFE` | Secondary tonal pills, scheduled/pre-op badges, blueprint border highlights[cite: 5] |
| `teal` | `#0D9488` | Secondary vitality accent, live synchronization connectors, ECG waveforms, readiness rings[cite: 5] |
| `teal-soft` | `#CCFBF1` | Sterilization & equipment card tint, available/ready status pills, tonal secondary buttons[cite: 5] |
| `midnight` | `#0F172A` | Bold display typography, primary card titles, dark telemetry card surface[cite: 5] |
| `slate` | `#475569` | Body copy, department subtitles, secondary metadata[cite: 5] |
| `ice-border` | `#E2E8F0` | Structural card borders, timeline dividers, skeleton shimmer blocks[cite: 5] |
| `porcelain` | `#F4F7FA` | Main viewport canvas background[cite: 5] |
| `white` | `#FFFFFF` | Elevated cards, floating navbar, inputs, modals[cite: 5] |

### Clinical Semantic Status Tokens
- **`ACTIVE` / `READY` / `AVAILABLE`:** Background `#CCFBF1`, Text & Pulse Dot `#0F766E`[cite: 5]
- **`SCHEDULED` / `PRE-OP`:** Background `#DBEAFE`, Text `#1D4ED8`[cite: 5]
- **`IN SURGERY` / `OCCUPIED`:** Background `#FEF3C7`, Text `#B45309`
- **`URGENT` / `CONFLICT` / `MAINTENANCE`:** Background `#FEE2E2`, Text `#B91C1C`[cite: 5]

---

## 3. Typography & Tabular Precision
- **Display Font (`font-display`):** `Plus Jakarta Sans`, ExtraBold (`800`), `3rem`–`3.5rem` (`48px`–`56px`), tight tracking (`-0.03em`), line-height `1.08`[cite: 5].
  - *Hero Two-Tone Pattern:* Line 1 in `midnight` (`#0F172A`), Line 2 accent phrase in `cobalt` (`#1D4ED8`)[cite: 5].
- **Section Heading (`h2`):** `Plus Jakarta Sans`, Bold (`700`), `1.5rem`–`1.875rem` (`24px`–`30px`), tracking `-0.02em`[cite: 5].
- **Card Title (`h3`):** `Plus Jakarta Sans`, SemiBold/Bold (`600`/`700`), `1rem`–`1.125rem` (`16px`–`18px`)[cite: 5].
- **Body & Table Copy (`font-sans`):** `Inter`, Regular (`400`), `0.875rem`–`0.9375rem` (`14px`–`15px`), line-height `1.6`[cite: 5].
- **Eyebrow / Section Kicker:** `Inter`, SemiBold (`600`), `11px`, uppercase, `0.08em` tracking, colored in `cobalt` or `slate`[cite: 5].
- **Mandatory Tabular Numerals (`tabular-nums`):** Apply `tabular-nums` (`font-variant-numeric: tabular-nums`) to all OT timers (`01h 42m`), shift time ranges (`08:00–16:00`), room codes (`OT-02`), queue counts (`28`, `06`, `34`), and appointment slots[cite: 5].

---

## 4. Reusable UI Primitives (`src/components/ui/`)
Every page must import from `src/components/ui/`—zero raw duplicated button/input/card markup:

1. **`Button.jsx`**
   - **Shape:** Always `rounded-full`[cite: 5].
   - **Variants:**
     - `primary`: `#1D4ED8` fill, white text, hover `#1E40AF`, optional trailing arrow slide[cite: 5].
     - `secondary`: `#FFFFFF` fill, `#E2E8F0` border, `#0F172A` text[cite: 5].
     - `tonal`: `#CCFBF1` (teal-soft) or `#DBEAFE` (cobalt-soft) fill with matching dark text[cite: 5].
     - `ghost`: Transparent fill, `#475569` text, hover `#F1F5F9`[cite: 5].
     - `icon`: Circular `w-9 h-9` button for quick actions[cite: 5].
   - **States & Sizes:** `sm`, `md`, `lg`; built-in `disabled` (`opacity-50 pointer-events-none`) and `loading` (animated spinner + disabled interaction)[cite: 5].

2. **`Badge.jsx`**
   - **Shape:** `rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase`[cite: 5].
   - **Variants:** `active`, `scheduled`, `surgery`, `urgent`, `neutral`, plus `pulse` boolean prop for an animated live dot[cite: 5].

3. **`Input.jsx` & `Select.jsx`**
   - **Shape:** `rounded-xl` (or `rounded-full` for search bars), `#FFFFFF` background, `1px solid #E2E8F0`, focus ring `ring-2 ring-cobalt/20 border-cobalt`[cite: 5].
   - **Features:** Supports leading icon (`Search`), trailing `⌘K` keyboard shortcut badge, label, and inline `error` state (`border-red-500` + helper text)[cite: 5].

4. **`Tabs.jsx`**
   - **Shape:** Horizontal pill switcher (`All Modules`, `Doctor Shifts`, `OT Rooms`, `Equipment`, `Appointments`)[cite: 5].
   - **Behavior:** Active tab renders `#1D4ED8` pill background with white text using Framer Motion `layoutId` for smooth sliding transitions[cite: 5].

5. **`Card.jsx` & `SkeletonCard.jsx`**
   - **`Card.jsx`:** `bg-white border border-ice-border rounded-2xl p-5` (or `rounded-3xl` for bento blocks) with optional subtle hover elevation (`-2px` translateY + `border-cobalt/30`)[cite: 5].
   - **`SkeletonCard.jsx`:** Exact structural mirror of `Card.jsx` using `bg-slate-200/70 animate-pulse` rounded bars so layout shift (CLS) is zero during API fetches[cite: 5].

6. **`Drawer.jsx` & `Modal.jsx`**
   - Slide-over drawer (`max-w-md bg-white border-l border-ice-border`) for quick appointment booking, OT room assignment, and equipment checkout without leaving the active schedule view.

---

## 5. Custom SVG & Visual Asset Standards
- **Brand Mark:** Rounded `#1D4ED8` square badge containing a crisp white medical cross intersected by an ECG pulse line[cite: 5].
- **Orchestration Diagrams & Icons:** Use clean `1.75px` stroke-width vector line icons (`lucide-react`) paired with custom SVG ECG waveforms (`stroke="#0D9488"`), circular readiness rings, and dashed SVG connector lines (`stroke-dasharray="4 4"`) linking schedule nodes[cite: 5].
- **Doctor Avatars:** Circular `36px`–`40px` avatars with `2px solid #FFFFFF` rings (supports overlapping avatar stacks for surgical teams)[cite: 5].

---

## 6. Motion & Micro-Interaction Rules (Framer Motion)
- **Staggered Entrance:** Cards and list rows enter with `initial={{ opacity: 0, y: 12 }}` → `animate={{ opacity: 1, y: 0 }}` (`transition={{ type: 'spring', stiffness: 260, damping: 24 }}`).
- **Live Telemetry Pulse:** Active OT nodes (`OT-02`) and live status badges use a smooth `2s` infinite opacity/scale pulse on their Bio-Teal indicator dot[cite: 5].
- **Zero Layout Shift:** Always render `SkeletonCard` placeholders matching the target grid dimensions while data is loading[cite: 5].