# Handoff log

Newest entries first. Each entry: date, from → to, task, status, where to start.

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
