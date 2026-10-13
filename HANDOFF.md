# Handoff log

Newest entries first. Each entry: date, from → to, task, status, where to start.

## 2026-10-13 16:13 · Codex — task C
- Changed: Shared `--hero-art-top`, `--hero-art-left` and `--hero-art-width` between the hero SVG and header continuation. The mobile offset now applies to both copies; the header's top includes its own height.
- Files touched: `assets/themes/persona/hero-poster.css`, `HANDOFF.md`, `docs/screenshots/2026-10-13-circle-{before,after}-{375,430,600,800,899,900,1440,1920}.png`.
- Verified: main/header SVG and circle bounds match at all eight widths, using mobile viewport emulation below 900px. Controlled same-page screenshots with animations frozen are pixel-identical at 900/1440/1920px. 137/137 tests and production build pass; original CSS remains `66fffa4f89.css`.
- Unfinished / concerns: task D follows in a separate commit. Nothing pushed.
- Please review: the continuous sky circle behind the header at 375px and 800px.
- Review of previous entry: confirmed the 16:20 diagnosis: the header copy retained desktop geometry while the main SVG switched to mobile offsets. Shared custom properties remove that divergence.

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

## 2026-10-12 17:44 · Codex
- Changed: Verified suggestions 1–3 are present; removed the straight underline under the slanted project chips, collapsed the selector to the actual rendered project chips, and documented that their content has no links. Tokens, corner rules and protected section styles are unchanged.
- Files touched: `assets/themes/persona/redesign.css`, `HANDOFF.md`, `docs/screenshots/2026-10-12-chip-followup-1280.png`, `docs/screenshots/2026-10-12-chip-followup-375.png`.
- Unfinished / concerns: Suggestions 4–8 remain untouched. Claude's uncommitted cleanup and documentation remain separate from this follow-up. No push. Tests: 127/127 pass; production build succeeds; original CSS bundle remains `66fffa4f89.css`. Final chips checked at 1280px/375px: no horizontal overflow, upright menu-font text, visible keyboard focus and preserved plain case-study tools.
- Please review: Chip edge alignment and narrow-screen wrapping after the small follow-up.
- Review of previous entry: Read Claude's full 17:37 handoff and inspected its diff against `71938d1`. The deleted scope is inactive by selector construction; no other functional CSS change is present in its diff. Confirmed `index.html` renders technology chips as plain text and `_data/content.yml` has no anchor markup. Existing section-specific styles remain protected. Compared the removed block against `71938d1` in Chromium at 1280px/375px with scripts/media blocked equally and animations disabled to isolate CSS: project page, 404, original and mobile homepage were pixel-identical; desktop home differed by five antialiasing pixels in decorative hero artwork, with identical geometry. Full-media comparison had asset-loading failures, so this is not a claim of full-media pixel identity. No reason found to restore the inactive block.

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
