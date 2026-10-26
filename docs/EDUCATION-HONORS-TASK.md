# Task: Dean's Honour List on the Education card

**From:** Claude · **To:** Codex · **Created:** 2026-10-23
**Status:** implemented by Codex on 2026-10-23; awaiting Claude's review.
Changes remain uncommitted. Validation and screenshots are recorded in
HANDOFF.md. Claude reviews the diff before anything is committed.

## What the owner approved

Jacky made the Dean's Honour List in U of T sessions **20241** and **20251**.

U of T session codes are the year plus a term digit: `1` = Winter (January),
`5` = Summer, `9` = Fall. So these are **Winter 2024** and **Winter 2025**.
Show the readable terms on the site, not the codes. At U of T Engineering the
award is officially called the **Dean's Honour List**, so use that wording.

Not in scope: courses. The owner hasn't sent the course list yet, so don't
add a placeholder or an empty courses section.

## Read first

- `AGENTS.md` (rules), `docs/DESIGN.md` (the Education section notes),
  `docs/REDESIGN.md` (token tiers).
- Current markup: `index.html`, the `#education` section (around line 127).
  It still has the comment `Optional GPA/honors line: intentionally omitted
  until supplied and approved`. The honour is now supplied and approved.
- Data: `_data/content.yml`, `education_section`. Its comment says to add
  honours only once Jacky provides and approves them.
- Persona styles: `assets/themes/persona/education-settings.css`.

## Implementation

1. **Data.** In `education_section` in `_data/content.yml`, add a list so
   that more honours can be added later without template changes, e.g.:

   ```yaml
   honors:
     - name: "Dean's Honour List"
       terms: "Winter 2024 · Winter 2025"
   ```

   Replace the "add only if Jacky provides" comment with a short note that
   these are owner-approved.

2. **Markup** (`index.html`, shared by `/` and `/original/`). Replace the
   omitted-honours comment with a `{% if %}`-guarded block placed after
   `.education-dates`, inside `.education-details`. Use a list, so screen
   readers announce how many honours there are:

   ```html
   <ul class="education-honors">
     <li><span class="education-honor-name">Dean's Honour List</span>
         <span class="education-honor-terms">Winter 2024 · Winter 2025</span></li>
   </ul>
   ```

   It must render nothing at all when `honors` is empty or missing. Escape the
   apostrophe properly; don't hand-write `&#39;` into the YAML.

3. **Persona styling** (`education-settings.css`, scoped under
   `body.persona-design #education`):
   - Treat it like the existing `.education-dates` chip, but give it an honour
     accent. The name is bold on a gold or amber chip, using existing tokens
     only (`--palette-gold`, `--config-orange`, `--ref-row`,
     `--palette-olive`, `--palette-black`). Terms follow in regular weight.
     No new colour tokens, and don't touch the day/night `data-theme` tokens.
   - Desktop: grid column 2, under the dates. The logo's `grid-row: 1 / 4` may
     need to become `1 / 5` so the logo stays vertically centred against the
     taller text column.
   - Phones (under 900px): centred like the other details, and wrapping
     cleanly at 320px.
   - No icons, emoji or images. A small CSS-only mark is fine if it matches
     the Persona style, but plain text is acceptable.

4. **`/original/`.** The new text will also appear on `/original/`, which is
   expected for shared content (see `docs/PUBLISHING.md`). Its design must not
   change otherwise. If the original styles leave the list with bullets or odd
   spacing, add a minimal rule in the original stylesheet that strips the
   bullets and matches `.education-dates`. Don't add Persona styles there.

## Don't

- Revert or reformat anything already in the working tree. There are
  uncommitted changes from other tasks (Education ribbon, stripe tails/heads,
  masks, About border). Only touch what this task needs.
- Change `education-ribbon.js`, `about-stripe-tails.js`, any mask SVGs or
  `scroll-presence.js`.
- Commit, push or deploy.

## Done means

- `npm test` passes. Add a test: the honours list renders with both terms
  when `honors` is set, and renders nothing when it's empty. Follow the
  existing patterns in `test/persona-template.test.mjs`.
- `npm run build` succeeds, and the page served from `_site` shows the line
  on `/` and `/original/`.
- Visual check of the Education card at 1440×900, 390×844 and 320px wide.
  Text must not overflow, and the logo must stay aligned. Save screenshots
  under `screenshots/education-honors/` (local only; never committed).
- Add a HANDOFF.md entry: what changed, files touched, test results and
  screenshot paths. Then hand back to Claude for review.

## Review checklist (Claude will use this)

- Wording is exactly "Dean's Honour List" and "Winter 2024 · Winter 2025".
- The block disappears completely when `honors` is removed.
- Only existing tokens are used, and every Persona rule is scoped under
  `body.persona-design`.
- `/original/` gains the text and nothing else.
- Desktop grid alignment and phone wrapping look right in the screenshots.
- No unrelated diffs.
