# Design reference: Persona 4 Golden UI study

Source: 178 Persona 4 Golden (PC, Chinese locale) screenshots in
`screenshots/screenshots/` (untracked, local only). About 150 are story scenes that
repeat the dialogue box and the date HUD. The design signal comes from about 20
menu frames. The most useful ones:

| Screen | File | Resolution |
|---|---|---|
| Config menu (tabs, list rows, OK chip) | `20260915214217_1.jpg` | 2560×1440 |
| Save/load list (selected band, slot discs, tag capsules) | `20260915214506_1.jpg` | 2560×1440 |
| Battle result (stat stack, cropped title) | `20260917160052_1.jpg` | 2880×1659 |
| Dialogue box (name plate, text panel) | `20261008223633_1.jpg` | 2560×1440 |
| Date HUD (date pill, rings) | `20261011232503_1.jpg` | 2766×1729 |
| Status screen (party list) | `20261012142830_1.jpg`, `20261012144645_1.jpg` | 2880×1659 |

Hex values below were sampled from 6×6 px patches of those files and averaged
(JPEG noise is about ±4 per channel). Contrast ratios are WCAG 2.x relative-luminance ratios.

**Read this first.** The public site (`/`) is already a Persona-themed design
built from `templates/persona/render.mjs` and `assets/themes/persona/*.css`. See
`docs/DESIGN.md` and `docs/REDESIGN.md`. The original design lives at
`/original/` and uses `assets/css/site.css`. Everything in this document targets
the **Persona theme only** and must not change how `/original/` looks.

### Reference components already implemented (do not rebuild)

| Reference element | Already built as |
|---|---|
| Save/load list | Experience section: `assets/themes/persona/experience-save-menu.css` |
| Config/settings screen | Education section: `assets/themes/persona/education-settings.css` (`--config-*` tokens) |
| Date pill + concentric rings | Header calendar: `header-calendar.css`, `header-calendar.js` |
| Key-hint bar (`Space 确定` / `C 返回`) | `.persona-hud`, `key-instructions.css` |
| TV cabinet | `tv-frame.css`, `tv-frame.js` |
| Layered black status windows | Skills: `skills-section.css` |
| Wide display face | `Persona Slim Local` / `Persona Slim Wide` in `style.css` |

---

## 1. Style summary

### Mood

The UI is a Japanese TV variety-show overlay sitting on a muted 3D world. The
scenes are dull brown, olive and grey. The UI on top is one saturated hue family
(yellow to orange) plus near-black, so every UI element stands out. Shapes are flat:
no drop-shadow blur, no gradients on controls, and no rounded corners except true
circles (discs, rings) and full pills (date bar). Energy comes from a few
3–10° diagonals placed on an otherwise strictly horizontal band layout.

### Color palette (sampled)

| Role | Hex | Sampled from | Existing token with near-identical value |
|---|---|---|---|
| Field yellow, bright end | `#FFFF29` | Config background, right side | `--palette-yellow` `#FFF000` |
| Field yellow, deep end | `#FECA12` / `#FFB605` | Config / save background, top-left | (none; `--palette-amber` `#F4A006` is darker) |
| Active tab / highlight orange | `#F9A800` | Config selected tab | `--config-orange` `#FFAA00` |
| Pale list row | `#FEFF7F` | Config unselected row | `--hero-yellow-light` `#FCFF89` |
| Selected row / top bar | `#232323` / `#252525` | Config selected row, tab bar | (none) |
| Selected band (deepest) | `#161616` | Save screen selected slot | `--palette-black` `#080808` is close enough |
| Idle tab | `#464646` | Config unselected tab | (none) |
| Confirm chip lime | `#DEFF00` | Config "OK" chip | `--config-lime` `#DFFF00` |
| Name plate gradient | `#FFAE16` → `#FF7B02` | Dialogue name plate, left → right | (none) |
| Name plate top lip | `#FFF000`-ish yellow | Dialogue plate upper edge | `--palette-yellow` |
| Dialogue panel edge | `#5E4F30` | Dialogue box, left/right edges | (none; `--palette-olive` `#4B4A30` is darker and greener) |
| Dialogue panel center glow | `#947D51` | Dialogue box center | (none; **too light for text**, see below) |
| Warning orange text | `#FC7A00` | Config "apply changes" label | (none) |
| Pop magenta | `#FF25FF` | Save screen active disc | **Do not use**: the theme already chose blue for the selected disc |

Contrast checks for the pairings proposed below:

| Foreground on background | Ratio | Verdict |
|---|---|---|
| `#080808` on `#FFF000` | 16.9:1 | pass |
| `#080808` on `#FEFF7F` | 18.9:1 | pass |
| `#080808` on `#DFFF00` | 17.6:1 | pass |
| `#080808` on `#FFAE16` | 10.8:1 | pass |
| `#080808` on `#FF7B02` | 7.7:1 | pass |
| `#FFFDF3` on `#232323` | 15.4:1 | pass |
| `#DFFF00` on `#232323` | 13.8:1 | pass |
| `#FFF000` on `#232323` | 13.3:1 | pass |
| `#FFFDF3` on `#5E4F30` | 7.8:1 | pass |
| `#FFFDF3` on `#7A6641` | 5.4:1 | pass (use as the brightest glow behind text) |
| `#FFFDF3` on `#947D51` | 3.9:1 | **fail** for body text, so don't put text over the sampled glow |
| `#FC7A00` on `#FFF000` | 2.2:1 | **fail**, never use orange text on yellow |
| `#FFFDF3` on `#FFF000` | 1.2:1 | **fail**, never use white text on yellow |

### Typography (in the reference)

| Role | Look | Size relative to 1440px-tall screen | Notes |
|---|---|---|---|
| Hero screen title ("Result", "Config") | Very heavy grotesque, bottom-left, cropped by the screen edge | ~13–15% of height (≈190–210px) | Used as a graphic, not as readable text |
| Tab label ("Audio", "Graphics") | Condensed grotesque, regular weight | ~5% (≈70px) | |
| Dates, numerals, small labels ("12月 3日", "PLAY TIME", "08/01", "120 EXP") | Wide, oblique geometric sans | ~3–4% | The signature P4 voice; the theme's `Persona Slim Wide` is the local equivalent |
| Row label / value | Bold CJK gothic; value in heavy slab serif | ~3% | Slab serif is not adopted (see section 4) |
| Dialogue body | Bold gothic, white, soft dark shadow | ~2.5% | |
| Key hints | Bold gothic beside a dark key cap | ~2% | |

Hierarchy ratio: hero ≈ 5–6× body, label ≈ 2× body, metadata ≈ 1.2–1.5× body.
Letter case: Latin labels are mostly ALL CAPS (EXP, MONEY, ITEM, PLAY TIME, SAFETY).

### Spacing and layout rhythm

- **Bands.** Everything is horizontal: tab bar across the top, stacked list rows, a
  full-width selected band, a striped footer. The selected item is shown by a band
  that runs edge to edge, not by a box around the item.
- **Row geometry (Config).**

  | Measure | Reference (1440px-tall screen) | Web equivalent |
  |---|---|---|
  | Row height | ~95px (6.6%) | 44–48px |
  | Gap between rows | ~10px (0.7%) | 4–6px |
  | Ratio of gap to row | ~1:10 | ~1:10 |
  | Row padding | label right-aligned at ~50% of row width, value centered in the right ~40% | |
- **Asymmetric anchoring.** Title at bottom-left, content panel in the right ~65%,
  status HUD at top-right, dialogue at bottom with a ~2–3% side margin.
- **Diagonals.** Name plates and tag capsules lean -8° to -10°. "Rank up" cards are
  fanned at ±5–10°. Only containers lean; the text inside them stays upright, or
  is so short (one word) that skew is harmless.

### Component styles (reference)

1. **Tab bar**
   - Dark bar `#252525`.
   - Each tab is a flat rectangle, idle `#464646` with light text and no radius.
   - The selected tab is `#F9A800` with dark text.
   - Square key caps (`Q` / `E`) sit at each end.
2. **List row**
   - `#FEFF7F` fill with no border and no radius.
   - The selected row inverts to `#232323`, with its value moved into a lime `#DEFF00` chip with dark text.
3. **Selected band (save list)**
   - A full-width `#161616` band about 17% of screen height, behind the active item only.
   - Unselected items fade toward the field color (amber text `#F0DD12` on yellow).
4. **Tag capsule** (`SAFETY` / `EASY`)
   - A short parallelogram or rounded-end capsule, solid fill, ALL CAPS wide oblique text.
   - Sits directly in front of a label.
5. **Dialogue box**
   - Panel: a semi-opaque olive-brown panel (edges `#5E4F30`, center glow), with a thin orange `#F8980F` edge on the right.
   - Name plate: a parallelogram above the top-left corner, overlapping the panel by ~0. It has a horizontal gradient `#FFAE16` → `#FF7B02`, a 6–8px yellow lip along its top edge, and dark name text.
   - A pulsing orange ring "continue" indicator sits at the bottom-right.
6. **Result stat stack**
   - Each stat is a black square icon block (~140px, rounded 4px), with an ALL-CAPS label to its right (black, heavy).
   - The value goes on the line below in large wide-oblique numerals with a small unit suffix ("120 EXP", "7,000 YEN").
   - An empty value is a dark olive chip ("NONE").
7. **Date pill**
   - A `#222423` full pill with white wide numerals, nested in yellow, orange and red concentric rings.
   - Already built.

---

## 2. Design tokens

Paste into `assets/themes/persona/tokens.css`, **inside the existing
`:root, :root[data-theme]` block, at the end of "Tier 1 — raw palette colors"**
(after `--config-lime`). These are additions only. Do not change any existing
variable's value, and do not add anything to Tier 3 (page-level tokens).

```css
  /* Reference study (docs/design-reference.md) — sampled from P4G screenshots. */
  --ref-band: #232323;          /* Selected row / tab bar. */
  --ref-tab-idle: #464646;      /* Unselected tab fill. */
  --ref-row: #FEFF7F;           /* Unselected list row. */
  --ref-field-deep: #FECA12;    /* Deep end of the yellow field gradient. */
  --ref-plate-start: #FFAE16;   /* Dialogue name plate, left. */
  --ref-plate-end: #FF7B02;     /* Dialogue name plate, right. */
  --ref-dialog-edge: #5E4F30;   /* Dialogue panel edges. */
  --ref-dialog-glow: #7A6641;   /* Dialogue panel center; lightened from the
                                   sampled #947D51 only as far as keeps
                                   #FFFDF3 text at 5.4:1. */
  --ref-dialog-rim: #F8980F;    /* Dialogue panel right edge. */

  /* Reference geometry (non-color; allowed here because tokens.css is the
     theme's token file — keep them below the colors). */
  --ref-skew: -10deg;           /* Lean for capsules and name plates. */
  --ref-row-height: 46px;       /* List row min-height. */
  --ref-row-gap: 5px;           /* Gap between stacked rows. */
  --ref-marker-width: 6px;      /* Lime marker bar on a selected row. */
  --ref-radius: 0;              /* All non-circular chrome. */
```

Reuse these **existing** tokens instead of adding duplicates:

| Need | Use |
|---|---|
| Lime confirm | `--config-lime` |
| Active orange | `--config-orange` |
| Bright field yellow | `--palette-yellow` |
| Pale yellow | `--hero-yellow-light` |
| Near-black text | `--palette-black` |
| Off-white text | `--palette-white` |
| Wide display face | `var(--menu-font)` (defined in `style.css`) |

The header comment of `tokens.css` says Tier 1 is "the only hex values in
this file". The new colors are Tier 1 raw colors, so that rule holds. Put the
geometry tokens after them with the comment shown.

---

## 3. Suggestions (prioritized checklist)

**Status (2026-10-12 19:25):**

| Items | State |
|---|---|
| 1–3 | Done (Codex, `71938d1`, `6714c70`) |
| 4, 5, 9 | Done (Claude, uncommitted; see `HANDOFF.md`) |
| 6 | **Dropped.** The open menu is already a P4G vertical-stripe ribbon that shows selection by enlarging the item; a dark selection band would clash with it. |
| 7, 8 | Not started |

Items 2 and 3 below use stable selector references to their current implementation. Item 6 remains dropped; its deleted redesign rule is not a current target.

All CSS changes go in Persona theme files and must be scoped under
`body.persona-design` (the existing convention). After every item:

- `npm test` passes.
- `npm run build` succeeds.
- `/original/` pages are visually unchanged. Compare `_site/original/index.html` before and after in a browser at 1280px and 375px.

Serve the build with `python3 -m http.server 8000 --directory _site`.

### P1: do first

1. **Add the reference tokens.**
   - Change: add the block from section 2 to `assets/themes/persona/tokens.css`.
   - Done when:
     - `git diff assets/themes/persona/tokens.css` shows only added lines inside Tier 1.
     - No existing token value changed.
     - `npm test` passes.

2. **Remove rounded corners from non-circular Persona chrome.**
   - Implemented in `assets/themes/persona/redesign.css`, under the "Reference-study refinements" comment: the combined chip/badge/link selector and `.site-navigation a::after` use `border-radius: var(--ref-radius)`.
   - Leave real circles alone: the calendar disc, save spheres, TV knobs, and anything with `50%` or `999px`.
   - Done when:
     - Those four rules no longer contain `8px` or `12px` radii.
     - In the browser, chips, source links and contact links have square corners.
     - Focus outlines are still visible on keyboard Tab.

3. **Turn chips into slanted tag capsules** (reference: `SAFETY` / `EASY` on the save screen).
   - Implemented in `assets/themes/persona/redesign.css`: `body.persona-design #projects .technology-list li` and its `::before`. The unused generic selector list was removed; only homepage project chips receive capsules.
   - Do **not** edit the section-specific overrides, which are deliberate and must keep winning:
     - `project-cards.css` (`#projects .technology-list li`)
     - `project-pages.css` (`.case-study-tools li`)
     - `skills-section.css` (`#skills .skill-chips li`)
   - Implementation:
     - Give each `li` `position: relative; isolation: isolate`.
     - Paint the fill on `li::before` with `inset: 0; transform: skewX(var(--ref-skew)); background: var(--secondary); z-index: -1`.
     - Keep the text itself unskewed.
     - Text uses `font-family: var(--menu-font)` and `text-transform: uppercase`.
     - Padding is `.2em .8em` so the lean doesn't clip the first and last letters.
   - Done when:
     - Homepage project chips show a leaning fill with upright text; case-study tools retain their plain-list override.
     - At 375px wide, chips wrap with no horizontal page scroll.
     - Chip text keeps ≥ 4.5:1 contrast (`#FFFDF3` on `#0C75A1` = 5.05:1).

4. **Restyle the 404 page as a dialogue box** (reference: `20261008223633_1.jpg`).
   - Markup (`404.html`): wrap the existing `<p>` text and the link in `<div class="dialogue-box">`. Put the eyebrow `404` into `<p class="dialogue-name">`. Keep the `h1` for accessibility; it may be visually hidden in the Persona theme only.
     - Class additions must not change `/original/404.html` visually. Verify `/original/` has no rules for these classes (`grep -n "dialogue" assets/css/site.css` returns nothing).
   - CSS: new file `assets/themes/persona/dialogue-box.css`. Link it from `templates/persona/render.mjs` in the stylesheet block (lines ~52–73), after `content-typography.css`, only for the 404 route, using the same conditional pattern as its neighbors. The renderer already treats `path === '/404.html'` as a redesign page (line ~39). `tools/preview-build.mjs` bundles the linked sheets automatically, so no other build change is needed.
   - Panel:
     - `background: radial-gradient(ellipse at 50% 55%, var(--ref-dialog-glow), var(--ref-dialog-edge) 70%)`
     - `color: var(--palette-white)`
     - `border-right: 6px solid var(--ref-dialog-rim)`
     - no radius, padding `clamp(20px, 3vw, 40px)`
     - max-width `min(960px, 100% - 32px)`
   - Name plate:
     - Positioned above the panel's top-left.
     - `background: linear-gradient(90deg, var(--ref-plate-start), var(--ref-plate-end))`
     - `box-shadow: inset 0 6px 0 var(--palette-yellow)` (the top lip)
     - `transform: skewX(var(--ref-skew))`, with the inner text counter-skewed by `skewX(calc(var(--ref-skew) * -1))`
     - `color: var(--palette-black)`, `font-family: var(--menu-font)`
   - Continue indicator: a 28px orange ring at the panel's bottom-right that pulses with `opacity`. It is wrapped in `@media (prefers-reduced-motion: no-preference)` so it is static otherwise.
   - Done when:
     - `/404.html` in the production build shows the plate and panel.
     - Text contrast is ≥ 4.5:1 everywhere on the panel.
     - "Return home" is reachable by Tab with a visible focus ring.
     - Reduced motion shows no pulse.
     - `/original/404.html` is unchanged.

### P2: next

5. **Restyle project metrics as a Result-screen stat stack** (reference: `20260917160052_1.jpg`).
   - Target: `.project-metrics` (a `<dl>`) rendered by `_layouts/project_case_study.html` and `projects/imu-sandbox/index.html`. Styles go in `assets/themes/persona/project-pages.css` beside the existing `.laser-notes .project-metrics` rules (line ~139).
   - Each `div`:
     - `display: grid; grid-template-columns: 44px 1fr; column-gap: 12px`
     - `::before` is a 44×44 `var(--palette-black)` square with 4px radius (this one radius is intentional; the reference icon blocks are slightly rounded).
   - `dt`: `var(--menu-font)`, uppercase, `var(--palette-black)`, weight 600.
   - `dd`:
     - Next row in the second column, `var(--menu-font)`, `font-size: clamp(1.6rem, 3vw, 2.4rem)`, `font-style: italic` (or `transform: skewX(-8deg)` if the face has no italic), `color: var(--palette-black)`.
     - Never orange text on yellow (2.2:1 fails).
   - Done when:
     - On the IMU Sandbox page, every metric shows black block, label, then a large value.
     - Values never overflow at 375px (`overflow-wrap: anywhere`).
     - The existing `.laser-notes .project-metrics` look is unchanged unless both rules are deliberately merged.

6. **Selected-row band for the open navigation menu** (reference: Config selected row).
   - **Dropped; do not implement.** The active menu is styled by `assets/css/ribbon-menu.css` (loaded by `_layouts/default.html`). The old `redesign.css` hover/current rule was removed with the inactive scope. The spec below is retained only as historical context.
   - Change only the Persona-scoped rule that wins:
     - `background: var(--ref-band); color: var(--palette-white)`
     - a lime left marker: `box-shadow: inset var(--ref-marker-width) 0 0 var(--config-lime)`
   - Keep ribbon geometry, fonts, outline stroke and animation unchanged.
   - Done when:
     - Hover, keyboard focus (Up/Down inside the open menu) and `aria-current` all show the dark band with lime marker.
     - Text contrast is 15.4:1.
     - `node --test test/persona-navigation.test.mjs test/ribbon-menu.test.mjs` passes.

### P3: optional, ask the owner first

7. **Cropped giant title on case-study heroes** (reference: "Result" bleeding off the bottom edge).
   - Target: `.case-study-hero` in `project-pages.css`.
   - Add a decorative `::after` with the project's short name. It needs a `data-` attribute added in `_layouts/project_case_study.html`, which is a markup change, so confirm first.
   - Styling: `font-size: clamp(5rem, 14vw, 12rem)`, positioned so ~30% of its height is clipped by `overflow: hidden`, `aria-hidden` (pseudo-elements are not read by most screen readers, but keep the real `h1` intact).
   - Done when:
     - The title appears behind the hero media and never covers text or controls.
     - It is hidden below 600px wide.

8. **Project category tabs** (reference: Config tab bar).
   - This is a new feature (filter UI and category data in `_data/content.yml`), not a restyle. Only do it if the owner asks.
   - Visual spec if approved:
     - `var(--ref-band)` bar, `var(--ref-tab-idle)` tabs, active tab `var(--config-orange)` with `var(--palette-black)` text, no radius.
     - Square key-cap hints only if the tabs get real keyboard shortcuts.

### Owner-requested (2026-10-12)

9. **About: P4G status-screen stripes, animated with the existing ring and shockwave.**

   **Reference.**
   - The band of vertical rainbow stripes down the right edge of the Status screen (`20261012142830_1.jpg`, 1623×914, stripes at x 1333–1620) and the Social Link screen (`20260915214334_1.jpg`).
   - In-game they run the full screen height behind the menu. The band is ~18% of screen width, with 18 stripes of varied width and no gaps.

   **What already exists (keep it unchanged):**
   - **Gold ring growth.** `.about-growing-rings` / `.about-outer-ring` scale with `reveal.progress` (`about-scroll-progress.js`, `aboutScrollProgress` + `aboutOuterRing`).
   - **Shockwave.** `.about-shockwave` is a time-based Web Animations pulse fired once when `reveal.progress` reaches `SCROLL_ANIMATION.shockwave.triggerAt`, and re-armed after scrolling back `rearmGap`. It lives in `assets/js/scroll-presence.js`, `update()`, at the `shockwave.animate(...)` call.
   - **Diagonal corner stripe fan.** `.about-corner-ribbons`, at the bottom-right, scroll-linked through `--about-ribbon-progress`.
   - All tuning lives in `assets/js/scroll-animation-config.js`, and the math has unit tests in `test/about-scroll-progress.test.mjs`.

   **Stripe data** (sampled at y=600, left to right; `x` and `width` in a 288-unit-wide band):

   | # | x | width | fill | # | x | width | fill |
   |---|---|---|---|---|---|---|---|
   | 0 | 0 | 14 | `#FFF224` | 9 | 144 | 19 | `#976D01` |
   | 1 | 14 | 18 | `#EDE28D` | 10 | 163 | 25 | `#FFF46F` |
   | 2 | 32 | 12 | `#FFA50C` | 11 | 188 | 8 | `#726AFF` |
   | 3 | 44 | 24 | `#C0F527` | 12 | 196 | 8 | `#75B6F6` |
   | 4 | 68 | 14 | `#8F7309` | 13 | 204 | 10 | `#80012A` |
   | 5 | 82 | 18 | `#D6E9EC` | 14 | 214 | 6 | `#C0C5FF` |
   | 6 | 100 | 10 | `#F30000` | 15 | 220 | 11 | `#F4F2F3` |
   | 7 | 110 | 20 | `#51C633` | 16 | 231 | 27 | `#DF0B48` |
   | 8 | 130 | 14 | `#FFDE04` | 17 | 258 | 30 | `#F4FF6D` |

   In the game, each stripe darkens about 10% toward the bottom of the screen. That can be reproduced with one overlay rect on top of all the stripes: a `linearGradient` from `transparent` to `rgb(0 0 0 / .1)`. If `rgb()` violates the theme's "no color literals in CSS" rule, put it in the SVG as `stop-color="#000" stop-opacity=".1"`.

   **Markup.** Do **not** edit `index.html`: it is the source for both `/` and `/original/`. Inject the SVG from `templates/persona/redesign.mjs`, inside `redesignContent()`, the same way the Education and Contact bands are added there:
   - Keep the table above as an array of `[x, width, fill]` in that file.
   - Build the rects from that array.
   - Insert the SVG immediately **before** `<svg class="about-corner-ribbons"` using `replaceRequired(...)`, so the diagonal fan paints over the stripes where they meet at the bottom-right. That anchor also exists in the test fixtures in `test/persona-template.test.mjs` and `test/persona-upgrades.test.mjs`.
   - Hex fills inline in the SVG follow the existing precedent of the `.about-corner-ribbons` rects.

   ```html
   <svg class="about-status-stripes" viewBox="0 0 288 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
     <g class="about-status-stripe-bands">
       <rect style="--stripe: 0" x="0" y="0" width="14" height="100" fill="#FFF224"/>
       <!-- …one rect per row of the table above, --stripe: 0…17… -->
     </g>
   </svg>
   ```

   **Layout** goes in `assets/themes/persona/hero-poster.css`, next to the `.about-corner-ribbons` rules:
   - The SVG is `position: absolute; top: 0; right: 0; height: 100%; width: clamp(96px, 16vw, 240px); pointer-events: none`.
   - Its z-index sits between the arch art and `.content-shell` (which has `z-index: 2`), and below the fan.
   - Phones (`max-width: 760px`): `width: 16px`, so the strip stays inside the 20px side gutter and never sits behind the full-width copy.
   - Other right-edge elements:
     - About's decorative motifs (`.section-motif--ring` at `right: 2%; top: 52px` and the `--star` motif, both in `section-backgrounds.css`) must still render **on top of** the stripes. Raise their z-index if needed, and don't move them.
     - The blue hero-art continuation (`.hero-about-art`) keeps its current stacking. Check the top-right corner where it meets the stripes; it should cover them, not the reverse.
   - The band must not overlap the About copy at any width. At 761–1279px, check that `.section-body`, whose width is `min(58%, 600px)`, ends left of the band. If it doesn't, narrow the band; do not move the copy.

   **Animation 1: stripes drop in with the ring growth.** This is scroll-linked and reversible, the same as everything else in About.
   - Add a pure function to `assets/js/about-scroll-progress.js`:

     ```js
     export function aboutStripesProgress(progress) // returns 0..1
     ```

     - It returns `clamp((progress - startAt) / (completeAt - startAt))`, eased with the file's existing `1 - (1 - p) ** 3`.
     - `progress` is the existing `reveal.progress`.
   - Add a `stripes` block to `SCROLL_ANIMATION` in `assets/js/scroll-animation-config.js`, with a comment on each key in the file's existing style:

     | Key | Default | Meaning |
     |---|---|---|
     | `startAt` | `.1` | Ring progress at which the first stripe starts |
     | `completeAt` | `.85` | Must stay below `shockwave.triggerAt` so the band is complete when the pulse fires |
     | `stagger` | `.4` | How far behind the first stripe the last one finishes |
     | `kickPx` | `8` | Horizontal kick distance when the shockwave arrives |
     | `kickMs` | `280` | Duration of each kick |
   - In `update()`, write `--about-stripes-progress` on `#about` through the existing `write()` cache.
   - CSS: each rect drops from the top edge, with `transform-box: fill-box; transform-origin: top`.
     - It scales on Y: `scale: 1 clamp(0, (var(--about-stripes-progress) * (1 + S) - var(--stripe) / 17 * S) / 1, 1)`. Here `S` is the stagger, passed in as a custom property from JS. Equivalent math is fine; the result must be that stripe 0 leads and stripe 17 finishes last.
     - Scroll back and the stripes retract in reverse.

   **Animation 2: the shockwave reaches the stripes.** This is time-based, tied to the existing pulse.
   - At the same place `shockwave.animate(...)` is called, start one Web Animation per stripe rect:
     - keyframes: `translate: 0` → `translate: -${kickPx}px 0` (offset .35) → `0`
     - with `filter: brightness(1.25)` at the peak
     - `duration: kickMs`
   - Each stripe's `delay` is proportional to its on-screen distance from the shockwave center. That center is the gold-ring center, computed in `alignGoldCircles()`: `x = box.width * circleCenterXPercent/100 + offsetX`, `y = box.height * circleCenterYPercent/100 + offsetY`.
     - Use `delay = (distance / maxDistance) * shockwave.durationMs * .8`.
     - Read each rect's `getBoundingClientRect()` once per pulse, never per frame.
   - Cancel any running kick animations before starting new ones, the same way `shockAnimation?.cancel()` does. Also cancel them in `preferenceChanged()` when reduced motion turns on.

   **Reduced motion:** stripes fully drawn, with no drop-in and no kick. Add the rects to the existing `@media (prefers-reduced-motion: reduce)` block in `scroll-presence.css` (`scale: none`), and in JS skip the kick when `reducedMotion.matches`. Before JS runs, the stripes stay hidden under the existing `html.about-scroll-pending` rule; add `.about-status-stripes` to that rule's selector list.

   **Done when:**
   - On `/`, scrolling into About makes the stripes grow down from the top, left to right, while the gold ring grows. The band is complete before the shockwave fires.
   - When the shockwave fires, the stripes nearest the ring center kick first and the farthest last, all within about 0.8 × `shockwave.durationMs`.
   - Scrolling back up retracts the stripes, and the kick replays only after the existing re-arm condition.
   - At 1280px, 1024px, 800px and 375px, the band never covers About text or the photos, there is no horizontal page scroll, and the diagonal fan still sits on top at the bottom-right.
   - With reduced motion, the stripes are static and fully visible, and no kick runs.
   - `test/about-scroll-progress.test.mjs` gains tests for `aboutStripesProgress`, using the file's fixture pattern:
     - returns 0 below `startAt` and 1 at or after `completeAt`
     - increases steadily in between
     - reverses when progress decreases
   - `npm test` passes and `npm run build` succeeds.
   - `/original/` is unchanged: the CSS bundle is still `66fffa4f89.css`, `grep -c about-status-stripes _site/original/index.html` prints `0`, and the same grep on `_site/index.html` prints `1`.
   - `test/persona-template.test.mjs` asserts that the rendered homepage contains `svg.about-status-stripes` with 18 rects, placed before `svg.about-corner-ribbons`.
   - The page uses only `transform`, `scale`, `translate`, `filter` and `opacity` for motion, with no layout-affecting properties animated.

---

## 4. Do NOT copy

- **Day/night and page-level colors stay as they are.** Do not edit:
  - `:root` / `:root[data-theme="dark"]` in `assets/css/site.css`
  - `:root` / `:root[data-theme="dark"]` in `assets/themes/persona/style.css`
  - Tier 2 and Tier 3 tokens in `assets/themes/persona/tokens.css`
  - the `.persona-hud` token overrides (the unused `.persona-tv` block was removed during the approved cleanup)

  New colors enter only as `--ref-*` Tier 1 tokens used by specific components.
- **No full-yellow reading surfaces.** Case-study prose, figures and long text keep their current backgrounds. Yellow fields stay limited to sections that already use them.
- **No orange or white text on yellow.** They measure 2.2:1 and 1.2:1.
- **No magenta.** The save-screen pink disc (`#FF25FF`) is excluded; `experience-save-menu.css` already decided the selected disc uses the hero blue.
- **No slab-serif values, and no purple outlined "Config" title lettering.** The theme's type stays `Persona Slim Local` / `Persona Slim Wide` plus the existing body font. Do not add font files.
- **No skewed body text.** Only containers and pseudo-element fills lean. Text inside stays upright, except single short words in capsules.
- **No sparkles, star bursts, bubble patterns or "Rank up" card fans.** Exception: the existing save-menu stars.
- **No Atlus or Persona assets.** No character art, logos, screenshots, sound or exact screen recreations in the site. The `screenshots/` folder is reference material: do not commit it and do not reference it from any page.
- **Do not rebuild existing components** (see the table at the top): save menu, settings screen, header calendar, key-hint bar, TV frame, Play stickers.
- **Do not touch game logic, TV frame behavior, or page-transition timing** (`--wipe-*`, `interface.js`).
