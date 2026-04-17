# Design System Strategy: The Digital Curator

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Digital Curator."** In the landscape of recruitment and SaaS, we move away from the cluttered "dashboard" look and toward an editorial, high-end experience. We treat job matching as a precision-engineered craft.

The aesthetic, "Bauhaus Digital Light," leverages the school's philosophy—*form follows function*—but reimagines it for the modern web through **intentional asymmetry**, **layered translucency**, and **high-contrast typography**. We break the "template" feel by using expansive whitespace and overlapping elements (e.g., a Match Score badge partially overlapping a card's edge) to create a sense of depth and bespoke engineering.

---

## 2. Colors & Tonal Depth
Our palette is rooted in a deep, authoritative Blue (`primary`) and a success-driven Green (`secondary`). However, the "premium" feel is achieved through how these colors interact with the background.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections. Layout boundaries must be created solely through background shifts. For example, a `surface-container-low` sidebar sitting against a `surface` main content area. This creates a "soft" interface that feels expensive and seamless.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of fine paper.
- **Base Layer:** `surface` (#f8f9fa)
- **Secondary Sections:** `surface-container-low` (#f3f4f5)
- **Primary Interaction Cards:** `surface-container-lowest` (#ffffff)
- **Elevated Modals/Popovers:** `surface-bright` (#f8f9fa)

### The "Glass & Gradient" Rule
To avoid a flat, generic look, use **Glassmorphism** for floating elements (like the Bilingual Toggle). Apply `surface_container_lowest` with 80% opacity and a `backdrop-filter: blur(12px)`. For Primary CTAs, use a subtle linear gradient from `primary` (#003874) to `primary_container` (#1a4f95) at a 135-degree angle to provide visual "soul."

---

## 3. Typography: Editorial Authority
We pair **Manrope** (Display/Headlines) with **Inter** (Body/UI) to balance modern geometry with high-utility readability.

*   **Display & Headlines (Manrope):** Large, bold, and unapologetic. Use `display-lg` (3.5rem) for hero moments. The wide tracking and geometric curves of Manrope convey a "High-Tech" soul.
*   **Body & Labels (Inter):** Tight, legible, and functional. Inter handles the heavy lifting of job descriptions and data. 
*   **Hierarchy Note:** Use `on_surface_variant` (#424751) for secondary text and `on_surface` (#191c1d) for primary headers to create a natural reading flow without needing bold weights for everything.

---

## 4. Elevation & Depth
We eschew traditional shadows in favor of **Tonal Layering**.

*   **The Layering Principle:** Depth is achieved by "stacking." A white card (`surface-container-lowest`) placed on a grey background (`surface-container-low`) creates a natural lift.
*   **Ambient Shadows:** If an element must "float" (e.g., a Match Detail Modal), use an extra-diffused shadow: `box-shadow: 0 12px 40px rgba(25, 28, 29, 0.06);`. The shadow color is a tinted version of `on-surface`, never pure black.
*   **The "Ghost Border" Fallback:** If accessibility requires a stroke, use `outline_variant` at 20% opacity. 100% opaque borders are forbidden.
*   **Glassmorphism:** Use for persistent headers and language toggles to allow the background content to "bleed" through, making the layout feel integrated.

---

## 5. Components & Functional Primitives

### Match Score Badges (The "Pulse" of Jobleo)
Badges use a circular "Bauhaus" geometry.
*   **High Match (>60%):** `secondary_container` background with `on_secondary_container` text.
*   **Medium Match (40-60%):** `tertiary_fixed` background with `on_tertiary_fixed_variant` text.
*   **Low Match (<40%):** `error_container` background with `on_error_container` text.

### Modern Form Elements
*   **Tag Inputs:** Soft rounded corners (`md`: 0.75rem). Use `primary_fixed` background with a small "x" icon in `on_primary_fixed_variant`.
*   **Toggle Switches:** A pill-shaped track using `surface_container_highest`. The "thumb" should be `primary` when active. Avoid harsh shadows; use a 2px inset "ghost" shadow for the track.
*   **Progress Bars:** Use a 4px height (`0.25rem`). The track is `outline_variant` (at 30% opacity), and the fill is a gradient from `secondary` to `secondary_fixed`.

### Cards & Lists
*   **Cards:** Use `surface-container-lowest` with a radius of `md` (0.75rem) or `lg` (1rem). 
*   **No Dividers:** Forbid the use of horizontal lines. Separate list items using `spacing-4` (1rem) of vertical whitespace or a alternating subtle background shift to `surface-container-low`.

### Bilingual Header Support
The Language Toggle (EN/ES) should be positioned in the top-right utility area. It should be styled as a "Segmented Control" using `surface_container_high` with a sliding `surface_container_lowest` pill to indicate the selection.

---

## 6. Do's and Don'ts

### Do
*   **DO** use whitespace as a structural element. If a section feels cramped, increase spacing to `spacing-12` (3rem).
*   **DO** align text to a strict baseline grid to maintain the Bauhaus sense of order.
*   **DO** use "Success Green" (`secondary`) sparingly to highlight matches—it should feel like a reward.

### Don't
*   **DON'T** use 1px borders to separate content. 
*   **DON'T** use pure black (#000) for text or shadows; use the `on_surface` (#191c1d) token.
*   **DON'T** use standard "system" rounded corners. Stick strictly to the Roundedness Scale, specifically `md` (12px) for cards to maintain the "approachable" feel.
*   **DON'T** crowd the Header. Ensure the language toggle has at least `spacing-6` (1.5rem) of breathing room from the main navigation.