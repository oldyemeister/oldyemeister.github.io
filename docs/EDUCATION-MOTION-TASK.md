# Task: Education card motion and ribbon shine

**From:** Claude · **To:** Codex · **Created:** 2026-10-23
**Status:** implemented by Codex on 2026-10-23; awaiting Claude's review.
Changes remain uncommitted. Validation and local screenshots are recorded in
HANDOFF.md. Claude reviews the diff before anything is committed.

## What the owner approved

Three additions to the Persona Education section (`/` only, not
`/original/`):

1. **Frame trace (scroll-linked, reversible).** The card's amber border
   draws itself around the card as the blue ribbon finishes opening. The card
   details settle in just after. Scrolling back up undoes it, like the ribbon.
2. **Honour chip shine (one-time).** After the card is complete, a single
   quick light sweep crosses the orange "Dean's Honour List" chip. It never
   repeats.
3. **Ribbon shine (one-time, scrolling down only).** When the blue ribbon
   reaches full size *while the user is scrolling down*, a single sweep of
   light runs along the ribbon. Scrolling up through that point never
   triggers it.

The point is to give Education a clear finish: the ribbon opens, the ribbon
shines, the frame completes, then the honour catches the light. Nothing may
loop or keep moving after scrolling stops. The clouds stay the page's only
constant motion.

## Read first

- `AGENTS.md`, `docs/DESIGN.md` (Education notes, including the ribbon),
  `docs/REDESIGN.md`.
- `assets/js/education-ribbon.js`: the ribbon reveal. It already computes
  a damped progress `current` (0–1) each frame from the section position.
- `assets/js/scroll-animation-config.js`: `SCROLL_ANIMATION.education`
  holds the ribbon timing (`ribbonStartVh` 85, `ribbonEndVh` 18,
  `ribbonSmoothingMs` 110). Put new tunables here, with the same comment style.
- `assets/themes/persona/education-settings.css`: the card is
  `.education-card`, with a `clamp(8px, .9cqi, 14px)` `--config-orange` border
  and radii of 1.5rem (desktop) and 1rem (under 900px). The honour chip is
  `.education-honor-name`.
- `templates/persona/redesign.mjs`: the Education markup injection.

## Implementation

### Shared progress

Have `education-ribbon.js` write its damped progress to the section as a
CSS variable (e.g. `--education-ribbon-progress`) on every frame where it
changes, so CSS can derive the frame and details from one smoothed value.
Leave the existing clip-path behaviour unchanged. When there is no JS, under
reduced motion, or once the ribbon is complete, the variable must resolve to
1 (the finished state).

### 1. Frame trace

- Add an SVG overlay to the card in the Persona injection, decorative and
  `aria-hidden`. It's a rounded `rect` matching the card's border box,
  stroke `--config-orange`, stroke width equal to the border, and
  `pathLength="1"`. Drive `stroke-dashoffset` from the progress variable
  (`stroke-dasharray: 1`). Keep the radius in sync at both breakpoints.
  `vector-effect: non-scaling-stroke` or a JS-measured viewBox is fine; it
  must look right at 320, 390, 820, 1440 and 1920px.
- Hide the real CSS border only while the trace is active (e.g. via a
  `data-` attribute set by JS), so the no-JS and reduced-motion card keeps its
  normal solid border. Reserve the border's space in both states so the
  layout never shifts.
- Timing: the trace runs over the last part of the ribbon progress, e.g.
  0.55 → 1.0 (configurable as `frameStartAt`). It starts at the top-left
  corner and runs clockwise.
- Details settle: over the last ~30% of the trace, the card's contents
  (logo and text) go from about 0.4 opacity and an 8px offset to fully
  visible. Text must never be fully invisible, and must be fully visible
  whenever progress is 1.

### 2. Honour chip shine

- A single diagonal highlight sweeps left to right across
  `.education-honor-name`, about 600–700ms, using a pseudo-element gradient in
  existing palette tokens (white at partial opacity is fine). Text stays
  readable throughout.
- Trigger once per page load: when the frame trace is complete (progress
  1) and the chip is fully in view. If the ribbon shine (below) fires at the
  same moment, start the chip shine about 250ms after it.
- It doesn't fire if the page loads with Education already complete, e.g.
  a reload partway down the page.

### 3. Ribbon shine

- A single soft band of light runs along the ribbon from left to right,
  about 900ms. Put it inside `.education-sky-window`, so the existing mask
  keeps it inside the blue band automatically. Place it above the scanline
  texture and below `.education-title-echo`. Use a gradient with a light
  blend such as `screen` or `plus-lighter`, at modest opacity.
- Trigger: the damped progress crosses from below 1 to 1 **and** the page is
  scrolling down (`scrollY` increased since the previous frame). That
  includes a downward anchor jump to `#education`. Never trigger when
  progress reaches 1 while scrolling up, or on initial load.
- Once per page load. Scrolling up and back down does not replay it.

### Everywhere

- `prefers-reduced-motion: reduce`: no trace, no shines; show the finished
  card with its normal border. Respect changes to the setting while the page
  is open, as `education-ribbon.js` already does.
- No-JS: identical to today's finished card.
- Use time-based Web Animations or class toggles for the shines and clean up
  after them; don't leave `will-change` or running animations behind.
- Only existing colour tokens. Scope every rule under
  `body.persona-design`. `/original/` must be byte-identical apart from the
  build's asset hashes.

## Don't

- Change the ribbon's geometry, timing, mask SVGs, `about-stripe-tails.js`
  or the honours content.
- Add any looping or idle animation.
- Revert or reformat anything already in the working tree. There are
  uncommitted changes from other tasks; touch only what this task needs.
- Commit, push or deploy.

## Done means

- `npm test` passes, with new tests for:
  - the pure trigger logic. Factor it into a small exported function, e.g.
    `shouldShineRibbon(previousProgress, progress, previousScrollY, scrollY, alreadyShone)`:
    it fires only on a downward crossing, never on an upward crossing, never
    twice, and never on the first frame.
  - the progress mapping from ribbon progress to frame progress
    (`frameStartAt`).
  - the injection: the card overlay is present on `/` and absent on
    `/original/`.
- `npm run build` succeeds.
- Browser checks at 1440×900, 390×844 and 320px wide:
  - trace states at roughly 0, 50% and 100%;
  - the chip and ribbon shines captured mid-sweep;
  - scroll up through the full-size point and confirm the ribbon shine does
    not play;
  - reduced motion shows the plain finished card;
  - no horizontal overflow and no console errors.

  Save screenshots under `screenshots/education-motion/` (local only).
- Add a HANDOFF.md entry: what changed, files touched, test results,
  screenshot paths, and anything not verified (e.g. Safari). Then hand back
  to Claude for review.

## Review checklist (Claude will use this)

- The ribbon shine plays once, only on a downward crossing, and not on reload
  mid-page.
- The chip shine plays once, after the frame completes and the chip is fully
  in view.
- The trace is reversible and tied to the same damped progress as the
  ribbon, with no lag between them.
- The card is readable at every progress value, and fully normal at 1, under
  reduced motion and without JS.
- The border's space is reserved, so the layout never shifts.
- Nothing loops, and no stray `will-change` is left behind.
- `/original/` is unchanged, and there are no unrelated diffs.
