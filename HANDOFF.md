# Handoff log

Newest entries first. Each entry: date, from → to, task, status, where to start.

## 2026-10-13 · Codex — E1
- Changed: desktop About and Education minimum heights; bottom-art animation uses a viewport-sized window while copy entrance stays at the top.
- Files touched: desktop-scaling.css, about-scroll-progress.js, scroll-presence.js, animation tests, review screenshots.
- Verified: 143 tests and build pass; original CSS 66fffa4f89.css. At 1440px About is 1486px and Education 1068px; mobile remains 520/367px. No overflow at 375/900/1440/1920. Screenshots: docs/screenshots/e-{before,e1}-about-*.png.
- Unfinished / concerns: E2 follows; optional content hooks omitted. Nothing pushed.
- Please review: new desktop space and bottom-art timing.
- Review of previous entry: implemented E1 from Claude’s 16:45 request.

## 2026-10-13 16:45 · Claude → Codex: taller About and Education; restyle the About stripes (task E)

**Status:** ready to start; the owner requested all of this. Two commits: E1 heights, E2 stripes.

### E1: About and Education twice as tall, to leave room for content the owner will add

The owner plans to add images to About and a relevant-courses list to Education.

**Measured on desktop** (1440px, after `6948b1a`): `#about` is 743px tall and `#education` is 534px.

**Target:**
- Desktop (≥900px): about 2× those heights.
- Express them in the same rem/`cqi` system as `aa4e6b0`, e.g. `min-height` on the sections, so they scale with the window.
- Use `min-height`, not a fixed `height`: real content must be able to grow the section further.
- Below 900px: don't add empty space; let content set the height.

**Keep working:**
- **About's scroll animation.** Ring growth, the shockwave trigger, stripe progress and the corner fan are driven by `reveal.progress` across About. After the height change they must still play over the same visible scroll window, not stretch out or finish off-screen. Re-check `SCROLL_ANIMATION` trigger points and `about-scroll-progress.js` against the new height.
- **Art anchoring.** The gold arch art (bottom-left), the corner fan (bottom-right) and the Education settings bands stay anchored where they read now, relative to their section edges.
- **Copy placement.** The copy stays where it is (top of section). The new space is below it, ready for the images and course list.

**Optional, ask the owner first:** empty data hooks in `_data/content.yml` (`about.images: []`, `education.courses: []`) rendered by the Persona template only, so they can drop content in without touching markup.

### E2: restyle the About status stripes

**Owner feedback:** the band doesn't fit the current design style.

1. **Make some stripes narrower.**
   - Today the widths in `statusStripes` (`templates/persona/redesign.mjs` ~70) are fairly even, 6–30 units out of 288.
   - Mix in clearly thin stripes, roughly 2–4 units, between the wider ones, as in the P4G Status/Social Link reference. A few hairlines set the rhythm.
   - Keep the overall band width and the 18-color palette. Rebalance the x positions so there are still no gaps. Adding a few thin stripes is fine: count and stagger already come from `--stripe-count`.
2. **Grow upward instead of dropping down.**
   - Each stripe rises from the bottom of About to its full height, driven by the same progress, still left to right and still complete before the shockwave.
   - Reversing the scroll retracts them downward.
   - Swap the scale origin/clip direction in `scroll-presence.css` (~41) and update `aboutStripesProgress` tests if the shape changes.
3. **Tuck the tops under the hero's blue circle.**
   - The stripes' top ends should never be visible as a flat cut. They should run up behind the hero's sky circle and its continuation into About, so the circle covers them, as the menu covers the stripes in the reference.
   - Extend the band upward far enough that, at full growth, every stripe's top is hidden under the blue circle (or the top-right ring/sun art) at 900, 1440 and 1920px.
   - Stacking: the stripes stay below the blue continuation, the hero circle art and About's copy and fan, and above the gold legacy art (as in `6948b1a`).
   - Phones: the band is 1rem wide at the right edge. Apply the same rule if the circle reaches it; otherwise end it cleanly under the header-continuation art.
4. **Keep the task D behavior:**
   - shockwave-driven kicks, real CSS-px kick distance and gapless coverage
   - reduced motion: static, fully grown, no kicks
   - text never overlapped

**Done when:**
- Stripes:
  - At 900, 1440 and 1920px, no stripe top is visible outside the blue circle at full growth.
  - Mid-scroll screenshots show the stripes rising from the bottom, at 1440px and 375px.
  - Thin stripes are visible next to wide ones.
- Sections:
  - About and Education are about 2× taller on desktop.
  - The About animation still completes within its visible scroll window.
- Checks:
  - `npm test` and `npm run build` pass.
  - `/original/` CSS is still `66fffa4f89.css`.
  - No horizontal overflow.
  - Before/after screenshots in `docs/screenshots/`.

## 2026-10-13 16:23 · Codex — task D
- Changed:
  - Removed the legacy metrics padding/underline rule. Restored shared `404.html` to its committed markup and inject the dialogue wrapper, name plate and continuation indicator only through the Persona transform. Its stylesheet now loads only on the active Persona 404; removed the redundant dialogue scope exception.
  - Stripes now paint above the gold art, below the copy/fan and blue continuation. Kicks expand left from a fixed right edge by the configured CSS-pixel distance; the final stripe overscans right. Geometry and distances are cached during resize before writes, and the drop stagger uses the emitted stripe count. The reverse-progress test now checks a strictly descending sequence.
  - The old fixed wave radius could not reach the desktop band. Its radius now fits the measured band distance, and kick delays invert the existing scale keyframes/easing so contact occurs while the wave is visible. Wave color, duration, easing, fade, ring growth and re-arm trigger stay unchanged. Added tests for physical kick distance, gapless staggered coverage, arrival order and Persona-only 404 markup.
- Files touched: `404.html` (restored), `templates/persona/{redesign,render}.mjs`, `assets/themes/persona/{project-pages,hero-poster,scroll-presence,redesign,dialogue-box}.css`, `assets/js/{about-scroll-progress,about-stripe-kick,scroll-presence,scroll-animation-config}.js`, `test/{about-scroll-progress,persona-template,persona-review-fixes}.test.mjs`, `docs/design-reference.md`, `HANDOFF.md`, and the review screenshots.
- Verified: 142/142 tests; production build; original CSS `66fffa4f89.css`; no dialogue class in `/original/404.html`. At 1280/375px every IMU metric has zero padding and border, and the 404 paragraph computes to off-white `rgb(255, 253, 243)`. Real scrolling triggered all 18 kicks at 1440/375px; measured peak left-edge expansion is 8 CSS px (within .00004px), staggered coverage remains gapless, and the right edge stays covered. No browser errors; reduced motion cancels every kick and leaves the band static.
- Screenshots: `docs/screenshots/2026-10-13-review-{404,metrics}-{1280,375}.png`, `2026-10-13-review-stripe-kick-{1440,375}.png`, `2026-10-13-review-wave-approach-{1440,375}.png`, and `2026-10-13-review-stripes-reduced-{1440,375}.png` in the same directory. Animation captures freeze a common timeline time; peak-distance checks sample each stripe's peak separately.
- Unfinished / concerns: owner visual review remains pending, especially the subtle wave/stripe response in motion. Task D's commit includes Claude's reviewed dialogue, metrics and stripe features plus their fixes, including the previously reviewed inactive-scope removal. The unrelated project-card comment, local agent guide and root reference screenshots remain outside this commit. No push.
- Please review: mobile header continuity from task C, then the IMU metrics, 404 panel and live About wave at `http://127.0.0.1:8000/`.
- Review of previous entry: addressed all ten findings in Claude's 16:20 handoff. The 404 source restoration is intentional to prevent Persona markup leaking into the original route. Task C is separate in `18fc150`.

## 2026-10-13 16:13 · Codex — task C
- Changed: Shared `--hero-art-top`, `--hero-art-left` and `--hero-art-width` between the hero SVG and header continuation. The mobile offset now applies to both copies; the header's top includes its own height.
- Files touched: `assets/themes/persona/hero-poster.css`, `HANDOFF.md`, `docs/screenshots/2026-10-13-circle-{before,after}-{375,430,600,800,899,900,1440,1920}.png`.
- Verified: main/header SVG and circle bounds match at all eight widths, using mobile viewport emulation below 900px. Controlled same-page screenshots with animations frozen are pixel-identical at 900/1440/1920px. 137/137 tests and production build pass; original CSS remains `66fffa4f89.css`.
- Unfinished / concerns: task D follows in a separate commit. Nothing pushed.
- Please review: the continuous sky circle behind the header at 375px and 800px.
- Review of previous entry: confirmed the 16:20 diagnosis: the header copy retained desktop geometry while the main SVG switched to mobile offsets. Shared custom properties remove that divergence.

## 2026-10-13 16:20 · Claude → Codex: hero duplicate circle on phones (task C); code-review fixes for Claude's uncommitted work (task D)

**Status:** ready to start; the owner approved both. Do C first, because it is visible on phones.

### Task C: two blue circles at the top of the hero below 900px

**Symptom** (owner report, reproduced with a real 375×812 mobile emulation over DevTools, not `--window-size`, which can't go that narrow):
- The top 76px of the homepage, behind the sticky header, shows a second, smaller copy of the sky circle and rings.
- It is scaled and positioned differently from the main hero circle, so there is a hard seam at y≈76px and the viewer sees two blue circles.

**Cause:**
- `.hero-top-extension` holds a copy of the hero SVG (`.hero-header-art`, built in `templates/persona/redesign.mjs` around line 46). It is drawn at `top: 100%; left: 0; width: 100%` (`hero-poster.css` ~17) so it continues the hero art upward behind the header.
- Inside `@media (max-width: 899px)` (`hero-poster.css` ~231), only the main art is moved: `#home .hero-reference-art { inset: 8.75rem auto auto -44%; width: 150% }`. The header copy keeps 100% width at x=0.
- Measured at 375px: the header composition is 397px wide at x=55, the main one 595px at x=−82.
- The bug predates `aa4e6b0`, but that commit moved this rule from 760px to 899px, so it now shows on every window narrower than 900px.

**Fix:**
- The header copy must use exactly the main art's geometry, shifted up by the header height, at every breakpoint:
  - same width
  - same left offset
  - the same top offset, plus `--hero-header-height`
- Alternatively, drop the copy below 900px and let the main hero art extend under the header, if that is simpler and keeps the desktop result identical.
- Either way, have one source of truth for the art geometry (shared custom properties), so the two cannot drift again.

**Done when:**
- At 375, 430, 600, 800 and 899px, the header band continues the hero circle seamlessly: one circle, no seam.
- At 900, 1440 and 1920px it is pixel-identical to now.
- Before/after screenshots at 375px and 800px saved in `docs/screenshots/`.

### Task D: fix the `/code-review` findings in Claude's uncommitted work (404 dialogue, result metrics, About stripes)

These changes are still uncommitted in the working tree, and your `aa4e6b0` unit conversions sit on top of them. Build on the current tree. Do not revert it.

**Bugs:**
1. **Metrics specificity** (confirmed).
   - `project-pages.css:139`, `body.persona-design .laser-notes .project-metrics > div`, beats the new stat-stack rule at :151, `body.persona-design .project-metrics > div`.
   - On `/projects/imu-sandbox/`, the only page with metrics, each stat keeps the old padding and gold underline under the new black icon block.
   - Fix: make the new rule win, or delete the old `.laser-notes` padding/border.
2. **404 markup leaks into `/original/`** (confirmed: `_site/original/404.html` contains `dialogue-box`).
   - It looks the same, but it breaks the AGENTS.md rule.
   - Fix: restore `404.html` to its committed markup, then inject the dialogue wrapper, name plate class and `.dialogue-continue` span from `templates/persona/redesign.mjs` with `replaceRequired`, as the About stripes do.
3. **Stripes paint under the gold ring and shockwave.**
   - `.about-status-stripes` is at `z-index: -1` in `hero-poster.css` (~323) inside isolated `#about`, so the positioned `.about-legacy-art` (outer ring, shockwave) draws over the band and hides the kick.
   - Fix: put the stripes above the legacy art and below `.content-shell` and the corner fan, keeping text clear of them.
4. **Kick distance is in SVG user units.**
   - `scroll-presence.js` (~210) translates `<rect>`s by `kickPx` inside `viewBox="0 0 288 100"` with `preserveAspectRatio="none"`, so the visible kick scales with the band width: ~6px on desktop, below 1px on phones.
   - Fix: convert with `kickPx * 288 / svgWidth`, or kick an HTML wrapper per stripe, so `SCROLL_ANIMATION.stripes.kickPx` means real CSS px.
5. **Kicks open gaps.**
   - Each stripe shifts left on its own delay, so yellow shows between stripes and at the right edge.
   - Fix: overscan the band to the right by at least the kick distance, and kick each stripe's left edge outward rather than translating it, for example `scaleX` from the right edge or width growth. The band must look gapless throughout.

**Cleanups:**
6. **`dialogue-box.css` loads on every Persona page.** Link it only on the 404 page (`render.mjs` ~69), like the `home`/`game` conditionals.
7. **Hardcoded stripe count.** `scroll-presence.css` (~44) divides by `17`. Emit `--stripe-count` with `--stripe` from `redesign.mjs` and use `calc(var(--stripe) / (var(--stripe-count) - 1))`.
8. **Layout thrash in `kickStripes`** (`scroll-presence.js` ~260). It reads 18 `getBoundingClientRect`s after `update()` writes ring attributes in the same frame. Cache stripe centres in `alignGoldCircles` (already runs on resize) or read before writing.
9. **Redundant scope limit.** Remove `.dialogue-panel` from the `@scope` limit list in `redesign.css` (~203). Its container is already excluded by `.page-section:not(#experience) > .content-shell`. Confirm the panel text stays off-white afterwards.
10. **Weak test.** The "and reverse" test in `test/about-scroll-progress.test.mjs` (~69) only calls the pure function twice with the same input. Assert that progress decreases monotonically across a descending input sequence.

**Done when:**
- Each fix is checked visually:
  - IMU metrics at 1280px and 375px
  - 404 at 1280px and 375px, plus `/original/404.html` containing no `dialogue` class
  - About scroll at 1440px and 375px, mid-kick, with the shockwave visibly reaching the stripes, the kick visibly about `kickPx` CSS px at both widths, and no gaps
- Reduced motion is still static.
- `npm test` and `npm run build` pass, and `/original/` CSS is still `66fffa4f89.css`.
- Committed separately from task C.

## 2026-10-13 15:46 · Codex — task B, ready for owner review
- Changed:
  - Implemented the owner's selected 900px desktop minimum, 14px body-copy floor and 115% growth cap. Added the Persona-only root class and desktop scaling sheet; converted component dimensions from px to rem while retaining media-query pixels, hairlines and SVG drawing coordinates.
  - Hero elements now share a container-based stage; Hero/About cap at the same 90rem canvas. About geometry scales its existing offsets/gaps from the measured stage width without body zoom. Skills stays three columns and the featured project retains its desktop arrangement from 900px. Compact layouts take over below 900px; existing phone layouts remain.
  - Documented the sizing model and updated the cropped-title specification to its measured container fit. No palette changes or push.
- Files touched: Persona theme CSS files, new `assets/themes/persona/desktop-scaling.css`, `templates/persona/render.mjs`, `assets/js/scroll-presence.js`, `test/persona-scaling.test.mjs`, two existing CRT CSS assertions, `docs/DESIGN.md`, `docs/design-reference.md`, `HANDOFF.md`, and dated screenshots.
- Verified: 137/137 tests, production build, `/original/` bundle `66fffa4f89.css`; no page overflow at 1920/1600/1440/1280/1100/1000/900/800/375px. Measured root sizes: 18.4px at 1920, 16px at 1440 and 12px at 900; project body copy bottoms out at 14px. Hero, About, Skills, Projects and RF case-study screenshot grids saved as `docs/screenshots/2026-10-13-scaling-{home,about,skills,projects,case}.png`.
- Regression evidence: `/original/` before/after screenshots at 1440/375px are pixel-identical; saved as `docs/screenshots/2026-10-13-scaling-{before,after}-original-{1440,375}.png`. At 375px the checked Persona Hero/Skills/RF hero captures are pixel-identical. At 1440px Skills and RF hero are pixel-identical; Hero retains reference geometry with minor control/rendering differences. A native-coordinate scroll smoke check at 1920/1440/1000/900/800 found no browser errors, with the rings, all 18 stripes and the fan present. Existing scroll unit tests pass.
- Zoom check: emulated a 200% zoom-equivalent CSS viewport/device-scale pair; case-study copy grew from 17.28px to an effective 32px without horizontal overflow. This checks zoom-equivalent layout, not the browser's actual zoom menu; please include actual browser zoom in owner review.
- Unfinished / concerns: owner visual review is pending. The 14px reading floor intentionally allows text wrapping to differ from exact bitmap scaling. Claude's prior uncommitted work remains separate; its existing component additions received equivalent unit conversions in the working tree, without bundling those additions into this commit. Local preview is running at `http://127.0.0.1:8000/`.
- Please review: resize from 1920px down through 900px; check the transition below 900px, date/header/HUD size, hero buttons, case-study reading comfort, actual 200% browser zoom, and ring/shockwave/stripe alignment while scrolling. Also review task A's RF/ACC title and caption placement.
- Review of previous entry: the owner answered task B's three choices in this chat, removing the 15:40 handoff's waiting condition. Task A is committed separately as `739b870`.

## 2026-10-13 15:33 · Codex — task A
- Changed: Fixed horizontal title clipping using measured per-character font advances and container sizing. Removed the separate padded strip, overlapped the image by 20% of title height, retained 30% bottom crop, and reduced decorative opacity to .85. Caption moves above the image at 600px and wider to stay readable.
- Files touched: `templates/persona/redesign.mjs`, `assets/themes/persona/project-pages.css`, `test/persona-cropped-title.test.mjs`, `HANDOFF.md`, `docs/screenshots/2026-10-13-title-fix-{before,after}-{rf-receiver,aps380}-{1440,800}.png`.
- Verified: 136/136 tests, production build, original CSS `66fffa4f89.css`; both titles at 600/800/1024/1280/1440/1920px and hidden at 375px. No horizontal page overflow; headings and controls unchanged. No palette changes or push.
- Unfinished / concerns: Task B follows separately with owner-selected 900px desktop minimum, 14px copy floor and 115% maximum growth. Claude's existing work remains separate.
- Please review: title placement and caption-above-image treatment on RF Receiver and ACC.
- Review of previous entry: confirmed the 15:40 findings: RF title exceeded its width, and padding placed both titles in a separate strip. Replaced that layout as requested.

## 2026-10-13 15:40 · Claude → Codex: fix the cropped title (task A); proportional desktop scaling (task B, waiting on owner)

### Task A: cropped case-study title. Ready to start.

**What I saw.** Headless Chrome against `_site`, `/projects/rf-receiver/` at 1440, 1280, 1024, 800 and 640px:
1. **Cut off on the right at every width.**
   - "RF RECEIVER" in `Persona Slim Wide` at `clamp(5rem, 14vw, 12rem)` is far wider than the hero. The page shows "RF RECEI" at 1440px and "RF RECEIV" at 640px.
   - The crop is supposed to be at the bottom edge only. Being cut at the side as well makes it look like a rendering bug, not a graphic.
2. **Not behind the media.**
   - `padding-block-end` reserves a separate band below the photo caption, so the title sits on its own strip between the caption and the meta/"The result" block. The empty band above the meta column adds a large gap.
   - Item 7's done-criterion is "appears behind the hero media", so this misses it.
3. **Reads as a heading, not a graphic.** Solid `--palette-olive` at full size directly under the real `h1` competes with the `h1`. In the reference, "Result" is anchored bottom-left and cropped by the screen edge.

(ACC on `/projects/aps380/` is short enough to fit, but has the same band and gap.)

**Fix.**
- **Fit the whole word horizontally.**
  - Make `.case-study-hero` a container (`container-type: inline-size`).
  - Derive the size from the character count: `--case-title-size: min(12rem, calc(100cqi / (var(--case-title-chars) * R)))`, where R is the measured average uppercase advance of `Persona Slim Wide` per 1em.
  - Inject `--case-title-chars` from `redesign.mjs` as an inline style alongside `data-title`.
- **Crop at the bottom only.** Keep about 30% of the height clipped by the hero's bottom edge, starting at the left edge (`inset-inline-start: 0`).
- **Tuck it behind the media.** Have the media's bottom overlap the top ~15–20% of the title (z-index below media; reduce the reserved padding to match). The caption must stay readable: if it would land on the letters, give the caption the page background, or move the overlap so only the image covers the title.
- **Tone it down a step.** Options: a lighter weight of the same olive, or about 0.85 opacity. Pick whichever keeps the real `h1` clearly dominant. No new palette colors.

**Done when:**
- The full short name is visible at 600, 800, 1024, 1280, 1440 and 1920px.
- Only the bottom is cropped.
- No text or control is covered.
- There is no empty band between the hero and the meta/result block.
- Still hidden below 600px.
- `npm test` and `npm run build` pass, and `/original/` CSS is still `66fffa4f89.css`.

**Screenshots:** before/after at 1440 and 800px in `docs/screenshots/`.

### Task B: proportional scaling on desktop windows. **Do not start until the owner picks the options at the end.**

**Owner's goal.** When a desktop browser window is narrower than full screen, the design should look the same, just smaller. Fonts, buttons, HUD chrome and art should all shrink by a similar factor.

**What happens now** (homepage at 1600, 1200 and 900px):
- **Type and controls are fixed size.**
  - Body text is 16px, and the HUD is 16px with `min-height: 62px`.
  - The header pill, date HUD, menu button and hero buttons stay the same pixel size while the art shrinks with `vw`.
  - Result at 900px: the hero buttons crowd into the JY mark, and the chrome looks oversized.
- **Units are mixed.** Persona CSS has about 715 `px` literals against far fewer `rem`/`vw`. The worst files are `style.css` (246 px), `tv-frame.css` (148), `hero-poster.css` (112), `experience-save-menu.css` (95) and `project-pages.css` (80).
- **Layout jumps at 1080px.** Skills go from 3 to 2 columns (`skills-section.css:140`), the nav font changes (`style.css:205`) and the hero gap changes (`style.css:729`). With proportional scaling these jumps are what makes the design "vary".

**Proposed approach** (recommended order):
1. **One fluid root scale, Persona only.**
   - Set a fluid root font size only on Persona pages, e.g. `html.persona-root { font-size: clamp(75%, 0.4rem + 0.6vw, 115%); }`. Add the class in `render.mjs` so `/original/` is untouched.
   - Design canvas: 1440px means 100%.
   - Keep part of the size in `rem`, as above, so browser zoom still enlarges text (WCAG 1.4.4). A pure `vw` root would break zoom.
2. **Convert sizes from `px` to `rem`** across `assets/themes/persona/*.css`, file by file:
   - type, padding, gaps, radii, control heights, HUD/header sizes
   - Keep `px` for hairlines (1–3px borders and outlines) and inside `@media` queries.
   - Each converted file should look identical at 1440px.
3. **Hero and About as a scaled stage.** Size the poster compositions (name, title tag, buttons, JY mark, rings, flowers, stripes) in container units (`cqi`) of the hero/About box, so each scales as one picture and nothing collides.
4. **Remove the intermediate layout jumps.** Keep the 3-column skills grid and the desktop nav/hero layout down to the mobile switch (760px). Leave the mobile layout at 760px and below as it is.
5. **Readability floor.** Body copy uses `max(14px, …)` so long-form text on case-study pages never gets too small. Display type and chrome scale freely.

**Rejected:**
- **JS-driven `zoom` on `body`.** It is the quickest to fake, but it skews `getBoundingClientRect` in the scroll animations (`scroll-presence.js`, `about-scroll-progress.js`), double-scales `vw` units and fights fixed-position chrome.
- **More breakpoints.** That makes the design vary more, the opposite of the goal.

**Verify:**
- Screenshots at 1920, 1600, 1440, 1280, 1100, 1000, 900 and 800px, each scaled to the same width. Hero, About, Skills, Projects and one case study should overlay closely.
- Browser zoom at 200% still enlarges text.
- Scroll animations (ring, shockwave, stripes, fan) still line up.
- `/original/` is unchanged.
- No horizontal overflow.

**Owner decisions needed:**
- (a) Smallest "desktop" width that keeps the full layout: 900px or 1000px?
- (b) Can body text shrink below 16px (floor 14px), or should only headings and UI scale?
- (c) Above 1440px, grow up to ~115%, or cap at 100%?

## 2026-10-13 11:00 · Codex
- Changed:
  - Task 1 (`57cbbab`): corrected stale redesign ownership descriptions and checklist references, removed unused TV/shadow/on-interactive tokens, and replaced the three live `--inactive` references with their identical `--palette-muted` value before removing that alias. Updated Tier 2 comments.
  - Task 2 (`7dcb216`): added decorative cropped RF Receiver/ACC hero titles through the Persona transform, behind content, clipped by about 30%, and hidden below 600px. Real headings and shared layouts are unchanged.
  - Task 3: added P4G Config-style All/Hardware/Software/Media project filters, editable category data, keyboard-operable buttons, announced result counts and progressive enhancement. Updated checklist completion notes.
- Files touched: `assets/themes/persona/{tokens,redesign,project-pages,project-categories}.css`, `assets/js/project-categories.js`, `templates/persona/{redesign,render}.mjs`, `tools/preview-build.mjs`, `_data/content.yml`, `test/{persona-cropped-title,project-categories}.test.mjs`, `docs/{REDESIGN,design-reference}.md`, `HANDOFF.md`, and the dated screenshots below.
- Verified: `npm test` and `npm run build` after each task: 129/129, 132/132 and 136/136 tests respectively. `/original/` CSS remained `66fffa4f89.css` each time. No day/night color changes, no `index.html` edits, no root `screenshots/` files committed, and no push.
- Visual verification: cleanup before/after at 1280px and 375px for `/` and `/original/`, with clock/media/animations controlled, showed no visible change. Home mobile and original desktop were pixel-identical; other comparisons had only low-level antialiasing differences, so this is not a claim of universal pixel identity. Evidence: `docs/screenshots/2026-10-13-cleanup-{before,after}-{home,original}-{1280,375}.png`.
- Feature verification: case-study titles checked at 1280/600/375px for clipping, layering, intact headings and no horizontal overflow; screenshots `docs/screenshots/2026-10-13-title-{rf-receiver,aps380}-{1280,375}.png`. Filters checked at 1280/375px: All 6, Hardware 5, Software 3, Media 1; exactly one pressed button; Space activation and visible keyboard focus; no overflow or browser errors. With JavaScript disabled all six projects remain visible; original output has no category controls or attributes. Screenshots: `docs/screenshots/2026-10-13-category-tabs-{1280,375}.png`.
- Unfinished / concerns: no requested implementation remains open. Claude's pre-existing uncommitted work (including items 4, 5 and 9) remains in the working tree, separate from these commits; item 6 remains dropped. Category assignments are editorial and can be adjusted in the content file.
- Please review: category assignments and filter wrapping on mobile; cropped RF Receiver/ACC title placement. Do not redo checklist items 1–5 or 9.
- Review of previous entry: read the full handoff, latest 19:25 entry and recent commit history/diff. Respected completed items and the dropped nav change. The 17:37 cleanup premise was partly stale: `--inactive` had three active uses, handled without changing their computed color. Claude's prior dead-scope review remains documented in the 17:44 entry.

## 2026-10-12 19:25 · Claude: P4G elements implemented (items 4, 5, 9)

**Status:** done, uncommitted. The owner asked Claude to implement these directly, so **the 19:09 entry below is superseded; do not start item 9.**

**Changed:**
1. **404 dialogue box** (item 4).
   - `404.html`: wrapper classes only. `/original/404.html` was checked visually and is unchanged.
   - New file `assets/themes/persona/dialogue-box.css`, linked in `templates/persona/render.mjs` on every Persona page. It only targets `.dialogue-box`.
   - `.dialogue-panel` was added to the stop list of the black-text `@scope` in `redesign.css` (around line 203), so the panel text stays off-white.
   - "Return home" is a yellow chip, because the site forces `.text-link-primary` text black.
2. **Result-screen metrics** (item 5).
   - `project-pages.css`, after the `.laser-notes` metric rules.
   - Each stat gets a black icon block with a yellow four-point sparkle (an SVG mask), a large slanted wide-font value and an ALL-CAPS label.
   - DOM order is unchanged. The grid is one column at 480px and below.
   - Only the IMU Sandbox page renders `.project-metrics`.
3. **About status stripes** (item 9).
   - **Markup:** 18 stripes injected by `templates/persona/redesign.mjs` before the corner fan. The colors are in the `statusStripes` array.
   - **Layout:** `hero-poster.css`, at `z-index: -1` inside About's isolated stacking context, so everything else paints over them. They are 16px wide at 760px and below.
   - **Drop-in:** follows ring progress through `aboutStripesProgress()` (`about-scroll-progress.js`) and the `SCROLL_ANIMATION.stripes` config.
   - **Kick:** on the shockwave, each stripe kicks sideways, delayed by its distance from the ring center (`kickStripes()` in `scroll-presence.js`). Kicks are cancelled when reduced motion turns on.
   - **Reduced motion and pre-JS hiding:** rules in `scroll-presence.css`.
4. **Item 6 dropped.** The reason is in the status note at the top of section 3 of `docs/design-reference.md`.

**Tests:**
- Added: `aboutStripesProgress` unit tests, and a template test checking for 18 stripes placed before the fan and not copied into Projects.

**Verified** (headless Chrome via the DevTools protocol, against `_site`):
- `npm test` 129/129; build OK; `/original/` CSS bundle still `66fffa4f89.css`.
- 404 at 1280px and 375px.
- Metrics at 1280px and 375px.
- About at 1280, 1024, 800 and 375px: no horizontal scroll, and text is clear of the stripes.
- Scroll trace:
  - the stripes complete one step before the shockwave
  - 18 kicks with delays of 443–520ms, nearest first
  - reverse scrolling retracts the stripes
  - reduced motion leaves them static and fully visible with no kicks

**Not done:**
- Item 7 (cropped title) and item 8 (category tabs).
- The stale `docs/REDESIGN.md` notes and unused tokens from the 17:37 review.
- No commit.

## 2026-10-12 19:09 · Claude → Codex: About section, P4G status-screen stripes

**Status:** superseded by the 19:25 entry above. Claude implemented this.

**Task:** implement checklist item 9 in `docs/design-reference.md`, under "Owner-requested (2026-10-12)". It is fully specified there, including the stripe colors and widths, markup, layout, both animations, reduced-motion behavior and the done-criteria.

**In short:**
- Add the vertical rainbow stripe band from P4G's Status and Social Link screens to the right edge of About.
- **Animation 1:** the stripes drop in from the top, left to right, driven by the same scroll progress as the existing gold-ring growth. They are complete before the existing shockwave fires.
- **Animation 2:** when the shockwave fires, each stripe gives a short horizontal kick, delayed by its distance from the ring center, so the wave visibly travels across the band.

**Do not change:**
- the existing ring growth, the shockwave itself, or the diagonal corner fan
- `index.html`: inject the markup from `templates/persona/redesign.mjs`, because `index.html` is also the `/original/` source

**Files you'll likely touch:**
- `templates/persona/redesign.mjs`
- `assets/themes/persona/hero-poster.css`
- `assets/themes/persona/scroll-presence.css`
- `assets/js/scroll-presence.js`
- `assets/js/about-scroll-progress.js`
- `assets/js/scroll-animation-config.js`
- `test/about-scroll-progress.test.mjs`
- `test/persona-template.test.mjs`

**Verify:**
- Every done-criterion in item 9.
- `npm test` and `npm run build`.
- Scroll through About at 1280, 1024, 800 and 375px, both forwards and backwards.
- With reduced motion enabled.
- `/original/` unchanged.
- Please save screenshots or a short recording of the stripes mid-drop and during the kick to `docs/screenshots/`, as in your earlier entries.

**Reference images** (local only, do not commit): `screenshots/screenshots/20261012142830_1.jpg` (Status) and `20260915214334_1.jpg` (Social Link).

**Still open, separate from this task:** the second `/code-review` found stale docs and unused tokens left by the dead-block deletion:
- `docs/REDESIGN.md` lines ~14, 39 and 49 still describe TV/HUD overrides that never applied.
- The `.persona-tv` tokens and `--small-shadow`, `--on-interactive` and `--inactive` in `tokens.css` have no users.
- Line references in items 2, 3 and 6 of `docs/design-reference.md` are out of date.

The owner hasn't decided who fixes these, so leave them unless asked.

## 2026-10-12 17:44 · Codex
- Changed: Verified suggestions 1–3 are present; removed the straight underline under the slanted project chips, collapsed the selector to the actual rendered project chips, and documented that their content has no links. Tokens, corner rules and protected section styles are unchanged.
- Files touched: `assets/themes/persona/redesign.css`, `HANDOFF.md`, `docs/screenshots/2026-10-12-chip-followup-1280.png`, `docs/screenshots/2026-10-12-chip-followup-375.png`.
- Unfinished / concerns: Suggestions 4–8 remain untouched. Claude's uncommitted cleanup and documentation remain separate from this follow-up. No push. Tests: 127/127 pass; production build succeeds; original CSS bundle remains `66fffa4f89.css`. Final chips checked at 1280px/375px: no horizontal overflow, upright menu-font text, visible keyboard focus and preserved plain case-study tools.
- Please review: Chip edge alignment and narrow-screen wrapping after the small follow-up.
- Review of previous entry: Read Claude's full 17:37 handoff and inspected its diff against `71938d1`. The deleted scope is inactive by selector construction; no other functional CSS change is present in its diff. Confirmed `index.html` renders technology chips as plain text and `_data/content.yml` has no anchor markup. Existing section-specific styles remain protected. Compared the removed block against `71938d1` in Chromium at 1280px/375px with scripts/media blocked equally and animations disabled to isolate CSS: project page, 404, original and mobile homepage were pixel-identical; desktop home differed by five antialiasing pixels in decorative hero artwork, with identical geometry. Full-media comparison had asset-loading failures, so this is not a claim of full-media pixel identity. No reason found to restore the inactive block.

## 2026-10-12 17:37 · Claude → Codex: dead `@scope` block removed; review follow-ups

**Status:** done, uncommitted. The working tree has these changes on top of `71938d1`.

**Changed:**
- **Deleted the inactive block** in `assets/themes/persona/redesign.css`: old lines 1–386, the `@scope (body.persona-design) to (.persona-hud) { … }` wrapper and all 110 rules inside it. The file went from 654 to 272 lines.
- **Why it was dead:**
  - Every selector inside started with `body.persona-design`, `:root body.persona-design` or `html`.
  - Inside `@scope`, a selector without `:scope`/`&` is implicitly a descendant of the scope root (`body`), and none of those can be.
  - So it matched nothing in any engine, and browsers without `@scope` support drop the block entirely.
  - I checked every selector programmatically; none were live.
- **Kept the second `@scope`** (the black-text-on-yellow rule, now around line 196). It uses an explicit `:scope`, so it is live.
- **Updated stale comments:**
  - the header comment of `redesign.css`
  - the comment above the reference-study rules (around line 237)
  - `project-cards.css` around line 106 (the "FILE 0X" note)
- **`docs/REDESIGN.md`**, "Color-scan exceptions": replaced the claim that `redesign.css` uses `@scope` to exclude the HUD with what is actually true.

**Verified:**
- `npm test`: 127/127 pass.
- `npm run build` succeeds.
- The `/original/` CSS bundle is still `66fffa4f89.css` (byte-identical).
- **Not verified:** a visual before/after. Headless Chrome against a local server didn't work in my sandbox (the server returned 503).

**For Codex: please check visually:**
1. `npm run build`, serve `_site`, and compare `/`, one project page and `/404.html` at 1280px and 375px against `71938d1`. Expected result: pixel-identical.
2. If anything differs, the conclusion that the block was dead is wrong. Restore it with `git checkout 71938d1 -- assets/themes/persona/redesign.css` and report back.

**Open follow-ups from the `/code-review` of `71938d1`** (not done; do them in this order):
1. **Underline misaligned under slanted chips.**
   - Problem: on homepage project cards the straight `border-bottom` (from `style.css:417` and `project-cards.css:142`) draws under the slanted `::before` fill and doesn't line up with its bottom edge.
   - Fix: either remove the border for these chips, or draw the underline on the skewed `::before` (e.g. `box-shadow: inset 0 -2px 0 var(--palette-gold)`).
   - Done when: the chip reads as one clean parallelogram at 1280px and 375px.
2. **Collapse the generic chip rule.**
   - Problem: `:is(.tag-list li, .technology-list li, .case-study-tools li):not(:where(.case-study-meta li, #skills li))` only ever matches `#projects .technology-list li`. `.tag-list` appears in no template, and case-study tools and Skills are excluded.
   - Fix: merge it and its `::before` with the `#projects .technology-list li` font rule into one `body.persona-design #projects .technology-list li` rule plus its `::before`.
   - Done when: no rendered pixel changes, and the dead selector list is gone.
3. **Links inside chips.**
   - Problem: the deleted block held `:is(.tag-list li, …) a { color: inherit; }`. It never applied, but chips with links would now take the generic link color on the blue fill.
   - Done when: chip links inherit the chip text color, or you confirm (by grep of templates and content) that no chip contains a link and leave a one-line comment.
4. **HUD exclusion.** The reference-study radius rule has no `.persona-hud` exclusion. It is harmless today because the HUD (`render.mjs` around line 86) contains none of those classes. Add `:not(.persona-hud *)` only if that changes.

**Docs:** in `docs/design-reference.md`, checklist items 2–3 cite `redesign.css` lines 108/111/290/300/328. Those lines were in the deleted block and no longer exist. Items 1–3 are done, so ignore those references. Items 4–8 are unchanged and still need the owner's go-ahead per the previous entry.

## 2026-10-12 16:08 · Codex
- Changed:
  - Implemented design-reference suggestions 1–3 only: added the supplied reference tokens plus two chip-padding tokens, squared the four specified chrome rules, and added skewed pseudo-element chip fills with upright uppercase menu-font text.
  - Preserved the case-study plain tool list, Skills markers, project-specific chip colors/underlines, all existing palette values and the original design. Confirmed `website_portifolio` now points to `/Users/jacky/Documents/DIY/website`.
  - Validated 127 passing tests, a successful production build, browser layouts at 1280px/375px, visible keyboard focus, no horizontal page overflow, and chip contrast (project pale yellow/blue 4.86:1; specified off-white/blue 5.05:1).
- Files touched: `assets/themes/persona/tokens.css`, `assets/themes/persona/redesign.css`, `HANDOFF.md`, `docs/screenshots/2026-10-12-reference-chips-1280.png`, `docs/screenshots/2026-10-12-reference-chips-375.png`, `docs/screenshots/2026-10-12-reference-case-tools-1280.png`, `docs/screenshots/2026-10-12-reference-case-tools-375.png`.
- Unfinished / concerns: Suggestions 4–8 intentionally not implemented. The legacy `@scope` block's body-prefixed selectors did not match in Chromium 154; only the requested effective corner/chip rules were placed outside it, still scoped to `body.persona-design`. The reference's generic case-study chip check conflicts with the existing plain-tool-list override, which is preserved; the production homepage project chips demonstrate the new treatment. Browser-only sample chips inserted into reading surfaces inherit their existing black-text overrides and are not a shipped usage. Original-design stylesheet bundle remained `66fffa4f89.css`; 375px before/after screenshots were pixel-identical, with desktop differences confined to the animated project-preview region. No original-design source changed.
- Please review: Check capsule wrapping and menu typography in the two chip screenshots; confirm case-study tools remain plain. Review the narrowly scoped workaround without enabling the rest of the legacy overlay. The destination's pre-existing untracked `AGENTS.md`, `docs/design-reference.md` and local `screenshots/` were left uncommitted.
- Review of previous entry: Read Claude's entire design study and handoff. Its broad checklist is narrowed to items 1–3 by the owner. No `[claude]` commit was identifiable; inspected `f7f1e4c` and its clean initial tracked diff. Found the legacy scope mismatch and case-study override caveat before finalizing this implementation.

## 2026-10-12: Claude → Codex: implement the P4G design-reference checklist

**Status:** ready to start. No site code has been changed yet.

**Task:** implement section 3 of `docs/design-reference.md`, in priority order:

1. P1, items 1–4:
   - add `--ref-*` tokens
   - square off rounded chrome
   - slanted tag capsules
   - 404 dialogue box
2. P2, items 5–6:
   - Result-style project metrics
   - selected-row band in the open nav menu
3. P3, items 7–8: **ask the owner before starting.** These need markup or data changes, or add a new feature.

**Constraints** (details in section 4 of the reference):
- Do not change the existing day/night colors (`data-theme` tokens in `site.css` and `persona/style.css`, Tier 2/3 in `persona/tokens.css`).
- `/original/` must not change visually.
- No Atlus assets.
- Do not commit `screenshots/`.

**Verify each item:** check its done-criterion in the reference, then:
- run `npm test`
- run `npm run build`
- view `_site` at 1280px and 375px

**Context:**
- The site already implements the save menu, settings screen, header calendar, key-hint bar and TV frame from the same game. Do not rebuild them.
- Line numbers in the checklist were accurate at commit `f7f1e4c`. Re-check them if files have moved.
