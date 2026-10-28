# Editing the Persona template

`npm run preview:build` also generates a Persona-inspired yellow/sky-blue design
at `/persona/` in the preview output. The original remains at `/`; its rendered
pages are unchanged. The alternate pages use the same content, images, documents,
and game scripts. `templates/persona/render.mjs` adds the alternate presentation and
rewrites internal page links, without duplicating the source content. The production build publishes Persona at `/` and the original at `/original/`;
see [publishing notes](PUBLISHING.md).

Edit `assets/themes/persona/style.css` to customize the new design. Its opening
variables control `--persona-yellow`, `--persona-sky`, `--persona-ink`, and
`--persona-paper`; `--wipe-first`, `--wipe-second`, and `--wipe-third` independently
control the transition panels. `--wipe-duration` is the duration of each movement
in milliseconds (default `550`); `--wipe-stagger` is the delay between panels
(default `80`). Use unitless numbers for both. `interface.js` implements letter hover and focus animations,
section wipes, and transitions between real pages. Reduced-motion preferences
bypass the effects. External links and résumé downloads retain native behavior.

Project-section links to internal games and articles use the P4G Skill-entry
diamond wipe instead. `diamond-wipe.js` grows a responsive grid of yellow diamonds
to full coverage over 620ms (including a short solid hold); the destination fades
in from that yellow cover over 340ms. `arrival.js` carries the selected effect
across real page loads before first paint. These are adapted timings; network
loading may extend the covered interval. The existing yellow token is reused.
The effect applies only to internal `/projects/` links inside `#projects`,
including Play stickers and the comparison routes. Reduced motion, modified
clicks, external links and downloads use native navigation. History restoration
clears the cover; the existing project CRT exit and other section wipes remain.

The alternate headings and links use a local WOFF containing the 95 printable
ASCII glyphs traced from the supplied Slim Font mod's `font0.fnt` (Tekka and
Pixelguin). Characters outside that set use fallback fonts; body copy keeps the
original readable system font. This is a raster-to-outline conversion, not an
original vector font. `tools/convert-persona-font.py` regenerates it from the
file under `references/fonts/`, using Python `fonttools`, `pillow`, and the `potrace` executable.
Ordinary preview builds use the generated WOFF and do not need these tools.
Section headings (`h2`) use `slim-latin-wide.woff`, a variant with outlines and
spacing widened to 150% while keeping the original height. Their black fill and
white outline are set in the `.persona-design h2` rule in the theme stylesheet.
The font converter regenerates both regular and wide variants.
Run it with `--bold` to generate heavier outlines with the same advance widths.
Set the topic heading rule to `font-weight: 700` to select that bold face,
or `400` for the lighter strokes. The white outline thickness
is controlled independently by `-webkit-text-stroke`.

The new theme includes a fixed keyboard instruction bar. Tab and the arrow keys
keep their normal browser behavior everywhere (the first Tab reaches the skip
link). Esc opens the navigation menu on every page and closes it again; it never
leaves a page, so a game in progress isn't lost. Inside the open menu, Up/Down
move between links and Enter opens one. On game pages the keys only drive a
game while its canvas has focus. The HUD's Esc/Menu button also works with
pointer and touch input.
The top navigation stays collapsed behind its menu button at every viewport
width. Opening it reveals a dropdown; selecting a link or pressing Esc closes it.


The three interactive demos use `assets/themes/persona/game-start.js` to wait
for the Start button before loading the shared game modules and focusing their
keyboard controls. Numeric section labels are removed by the Persona renderer.

### Flowers and hero CRT

Solid-color flowers use the joined six-petal silhouette traced from the supplied
Revival black-flower alpha in `templates/persona/flower.mjs`. All hero, About,
Contact and small motif copies inherit their existing fills/shadows. White hero
flowers instead use `images/revival/flower-white.svg`, preserving the supplied
embedded PNG and its baked uneven red/green registration fringe. Solid variants
have no colored fringe. Existing sizes, placements and rotation directions stay.
The hero sky uses an original dense seven-row CSS texture over our SVG clouds,
plus the slow CRT sweep. Hero-only noise, flicker and scanlines are disabled.
The tile is defined in `hero-poster.css` in shared SVG coordinates so the hero,
header and About copies have identical scale and phase. It appears before JS
and remains visible under reduced motion; clouds and sweep stop. Our character-page
adaptation uses a brighter crest/darker return-line profile at 46% opacity, with
clouds at 60% opacity to recreate the reference cyan veil using the existing sky
color. `sky-texture.js` snaps
its period, row boundaries and phase to device pixels after the configured SVG
scale: 7px at 1920px wide, about 5px at 1440px, with a 3.5px phone floor.
The rounded row allocation may merge narrow rows on 1× screens. Project media
and gameplay retain their own CRT layers and 2px lines with 2px gaps.

### Project Play stickers

The three playable previews use a vivid-red speech-bubble sticker based on the
supplied “New” reference, with white outlines and tilted vector “Play” lettering.
`templates/persona/play-badge.mjs` supplies the shared artwork; `project-cards.css`
sets its responsive size and focus/hover states. Each sticker links to its game,
has a project-specific accessible name, and sits above the CRT filter. Article
previews and the original-design badges are unchanged. Stickers sit in the
top-right edge, overlapping the preview without clipping its CRT layers. They
are 20% larger than the initial size (105.6–129.6px), with the original bold
vector lettering restored. A 36% rightward offset keeps the tail over the
preview on desktop. Below 900px, the sticker has no rightward offset so the
whole link and focus outline fit inside the page gutters, with a small black shadow below.
Their color is `--palette-play-red` in `tokens.css`.

### Shared game television

The approved P4-style cabinet lives in `assets/themes/persona/tv-frame.css` and
`tv-frame.js`. The Persona renderer loads it only on the three playable pages,
after their existing bootstrap; original-design pages and case studies are unaffected.
The flat black cabinet, hollow antennas, white grille, concentric knob faces,
gear-shaped Reset dial and splayed feet are SVG/CSS, based on the supplied reference.
White controls carry black symbols and stay white while natively disabled before Start.

The frame moves the original screen and buttons without cloning them or changing
game logic. Laser Puzzle and Donkey Kong remain 320×240 at 4:3; the IMU viewport
has a 260px minimum height for its interactive device. Compact readouts use the
existing Persona Slim Local face. Lower controls retain 44px targets. The IMU's
Reset moves to the dial; mode, gravity and axis controls remain outside the TV.
Its small white knobs control Pause and CRT, matching Donkey Kong. The sandbox
Pause freezes the viewport loop, disables pose/mode/gravity inputs, and shows
an on-screen Resume button. Resuming resets the frame clock, so there is no
catch-up simulation. Reset also resumes. `imu-pause.js` is shared by the WebGL
and compatibility renderers; the particle engine and existing shortcuts are unchanged.

At widths of 1000px and above, `.game-entry` places the unchanged intro beside
the TV. `--tv-stage-width` uses the small viewport height to keep the cabinet,
shortened antennas, feet and accessible controls within the initial desktop view.
Narrower layouts keep the intro first and stack naturally without clipping copy.
For IMU, a compact intro sits above a two-column workspace: TV on the left,
mode/gravity/rotation panel on the right. Below 1000px, the settings follow the
TV. The panel keeps an olive background and readable white/yellow text.

Game keyboard hints live in a native `? Controls` disclosure after the TV and
its inputs (after the IMU settings), not in the fixed HUD. This keeps live
controls stationary during focus changes. Hints are open by default on all
three games, wrap without rotation, and never overlay other content.
`game-controls-help.js` opens them while the game surface has focus and closes
automatic help when focus leaves; an explicit manual disclosure remains open.
Both WebGL and fallback IMU surfaces are supported. The fixed game HUD retains
only Esc/Menu; browser Tab/Enter behavior and all game input handlers are unchanged.

`--tv-knob-offset` moves the small knobs and Reset slightly down the right rail.
Pause and CRT sit beside each other; below a 650px cabinet width they stack with
44px targets so the canvas retains its width. Reset remains the bottom gear dial.
`assets/js/game-crt.js` adds an optional pointer-transparent screen overlay using
the shared CRT layers. The white CRT toggle stays available before Start, exposes
`aria-pressed`, and starts on. Shared scanline opacity remains 0.30 for hero artwork and project media. Game TVs
override scanline opacity to 0.18, noise to 0.08, flicker to 0.02, inner edge glow
size to 24px and curvature to 0.4; sweep settings are unchanged. Edit `CRT_SETTINGS.game` in `assets/js/crt-settings.js`
for game-only overrides or to change the default. Off removes all CRT decoration;
reduced motion, offscreen screens and hidden tabs stop its animated layers.
Game state and controls are independent of the filter.

All Persona pages reserve the fixed keyboard-hint clearance inside the olive
footer, never as yellow body padding below it. The shared measured HUD height
keeps the final content reachable, including when touch layouts hide the hints.

The former optional TV and Persona upgrade studies are archived locally; use
the three production game routes to preview the shared TV frame. See
`docs/CLEANUP.md` for archive and recovery details.

The menu font controls are `--menu-font`, `--menu-font-size`, and
`--menu-outline` in the theme stylesheet.

After editing, run `npm run preview:build` and refresh the browser. To start
a server, run `python3 -m http.server 8000 --directory /private/tmp/personal-website-preview`.
Open `/persona/` for Persona and `/` for the original.

See [attribution](ATTRIBUTION.md) for design and font sources.

### Pause-menu ribbon motion

`assets/themes/persona/ribbon-motion.js` supplies Persona's pause-menu animation.
The renderer loads it before the shared `assets/js/ribbon-menu.js` controller on
Persona home, project and game routes. The original route uses the shared
controller's existing animation; navigation controls and accessibility remain
shared rather than duplicated.

The local P4G recording analysis (entry 33.950–34.300s, exit 36.150–36.350s)
informs the motion sequence, with website pacing expanded to a 480ms entry and
360ms exit so it remains legible at lower frame rates. Bowed ribbons enter from both screen edges,
spread their outer strips, then gather into the existing column. Labels fade in
after the gathering starts; help and the existing core waves follow. On closing,
labels disappear first, the ribbons bow apart and exit through both screen edges, and the page
chrome returns. Existing palette, column placement, words and selection behavior
are retained. Curves/easing are an adaptation, not extracted engine constants.

Continuous cubic edges replace the extended straight-middle arches. Animation
uses elapsed time rather than capped frame increments; reversals capture position
and velocity to avoid snapping. Settled lobe geometry is cached rather than
regenerated every frame, and refreshes when measured core bounds change (including
hidden-to-visible opening). Both original sine waves keep their 40-second upward
drift. The animation loop stops at rest. Resizing settles to
the current target, and reduced motion applies the selected end state directly.
Tune `OPEN_MS`, `CLOSE_MS`, bend and `fanGap` in the Persona adapter.
Both this motion and the diamond wipe use elapsed milliseconds, not frame counts;
lower frame rates do not change their intended duration. The slower website
timings are deliberate adaptations rather than estimates of the game's timers.

## Adjusting transitions locally

### Education → Skills boundary

`education-skills-transition.js` and its Persona-only stylesheet adapt the
outgoing-stage motion documented in the local
`frontend_REA/analysis/persona-4-revival/{REPORT,RECONSTRUCTION-PLAN}.md` study.
The owner selected this boundary instead of Projects → About; section order
and menu behavior stay unchanged. No reference assets or dependencies are added.

Education's existing sky/mask/title and credential content translate together
while the opaque Skills field rises over them in ordinary document flow.
The section boxes and anchors stay stationary in layout, preserving Education's
entrance animation and its earlier seam with About. Progress runs from Skills'
top reaching the viewport bottom to reaching the viewport top, and reverses
exactly with scroll position. The amplitude starts at
`max(viewportHeight * .25, educationHeight * .20) * (.30 mobile / .80 desktop)`.
It is capped at a quarter viewport, the space below the credential minus 32px,
and the amount Education exceeds the viewport height. Short sections therefore
use less or no movement. The site's existing 899/900px breakpoint applies.

Measurements refresh for content/image/font changes and resize; the incoming
section's current position supplies the scroll progress without saved page
coordinates or smoothing. Only the two outgoing layers receive translation,
with `will-change` limited to the active interval. Reduced motion, including
live preference changes, shows the original static composition. Without JS the
original layout is the fallback. Desktop/mobile evidence is local and ignored
under `screenshots/education-skills/`; no screenshots are published.

### Rainbow cursor afterimages

Every Persona page loads `assets/js/cursor-trail.js` and `cursor-trail.css`.
The effect is currently disabled: set `CURSOR_TRAIL.enabled` to `true` and rebuild
to restore it. While disabled, no listeners, visual elements or animation loop are created.
Seven outlined arrow echoes follow recent mouse positions, red through violet,
24ms apart, fading out within 240ms of stopping. The native cursor is untouched.
Edit `CURSOR_TRAIL` for colors, spacing and persistence. Only seven small SVGs are
created, on first mouse movement; the animation loop stops when idle. The overlay
is pointer-transparent and absent for touch/coarse pointers and reduced motion.
Leaving the page, scrolling, typing, pointer lock and tab hiding clear the trail.
No game logic, click targets, cursor affordances or text selection are changed.

### Page transitions

Run `npm run watch` in a second terminal while your `_site/` server is running.
It rebuilds after source changes; wait for “Rebuilt”, then refresh the browser.
For a one-off rebuild, use `npm run build`.

The three `.page-wipe` panels are defined in `templates/persona/render.mjs` and
styled in `assets/themes/persona/style.css`. `interface.js` animates them with
the Web Animations API: cover the current page, navigate, then uncover the new
page. `arrival.js` reads a short-lived session-storage marker before first paint
so the new document starts covered. Same-page links cover, scroll, then uncover.
Browser Back/Forward uses native restoration without replaying that overlay.

Change `--wipe-duration` and `--wipe-stagger` near the top of the theme CSS to
adjust speed. For example, `800` and `100` make each sweep take about one second.
The easing curve and horizontal travel are in `sweep()` in `interface.js`.

## Proportional Persona desktop sizing

The homepage now adds `fullscreen-scaling.css` after its component styles.
On 2026-10-27 the owner selected the live Chrome window (933 × 908 outer,
933 × 821 content viewport) as the reference, choosing to preserve vertical
proportions while using the full width. At desktop aspect ratios wider than
933/821, `--composition-unit` caps the previous width-based dimensions by
viewport height. The root follows that height too, retaining its rem component
and reading-size floor. A 640px artwork floor keeps short desktop windows usable.
The reference viewport, narrower aspect ratios, and layouts below 900px keep
their existing rules.

Backgrounds, cards and horizontal anchors use the available width; display
type, hero art, flowers, padding and media heights follow the vertical scale.
The hero name and About biography retain their reference line lengths. Hero
circles stay round, with their center at the same horizontal percentage;
`scroll-presence.js` measures the actual artwork width for its continuation.
About's three masks share the reference cover crop fitted to the new section
height, and `about-stripe-tails.js` samples that same fitted geometry. Content
can expand beyond the section minimums. This overrides the earlier homepage
width-only policy below; project/detail pages continue to use that policy.

Owner-approved on 2026-10-13: desktop composition starts at 900px; body copy
may shrink to 14px; the root scale grows above 1440px to a maximum of 115%.
`render.mjs` adds `html.persona-root` only for the active redesign.
`desktop-scaling.css` supplies the fluid root and inherited shared-layout
sizes. Persona component dimensions use rem (16px at the 1440px reference).
Hairline borders, media-query thresholds and SVG user-space drawing coordinates
remain in px. The original stylesheet and day/night palette values are untouched.

Hero and About establish inline-size containers. Hero typography, buttons,
monogram and flowers use cqi as one 1440px poster composition; its width caps
at 90rem. About now spans the full viewport width so its sky curves do not stop
at the capped poster edge on large screens. Its JS geometry measures the actual stage width and scales its
art offsets, gaps and photo placement in physical browser coordinates. There is
no body zoom or transform scaling. Scroll progress, ring growth and shockwave
trigger logic are unchanged. Skills retains three columns and the featured
project retains its desktop arrangement down to 900px. Below that threshold,
the compact Persona layout takes over; the existing phone layout is retained.

The 14px reading floor and fluid root's rem contribution intentionally prevent
exact bitmap scaling of all text. At 1440px the reference dimensions are retained;
at narrow desktop sizes copy can wrap sooner than the decorative art. Browser
zoom remains able to enlarge text. Compare saved desktop contact sheets in
`docs/screenshots/2026-10-13-scaling-*.png` and review locally before publishing.

At 1280px and wider, the game layout uses available small-viewport height and
a 65vw ceiling. Cabinet-relative units scale the grille, knobs and readouts;
short antennas and feet reserve clearance for the fixed header/HUD and leg buttons.
IMU additionally reserves its measured intro height. Below 900px the existing
mobile layout remains unchanged. Pixel games keep intrinsic 320×240 coordinates:
3× (or larger) integer display sizes are used when they fit, and 2× when it uses
at least 90% of the available screen width. Intermediate sizes stay fluid rather
than shrinking gameplay back to 2×; pointer mapping uses the actual canvas bounds.

### About sky openings (I2)

Persona renders 36 small clouds and nine large background clouds per sky
field. Large clouds retain 1.4× the original source silhouette area. Clouds drift
horizontally with staggered 32–98s small-cloud and 180–252s large-cloud loops.
The sky field stays anchored against scrolling; only the clouds themselves
translate horizontally. Hidden/offscreen skies and reduced motion pause drift.
`fixed-sky.js` projects the identical field into viewport space through every
hero/header/About sky window, cancelling each scrolling SVG's parent transform.
The yellow interface, masks and CRT overlays stay in document space and scroll
normally. Projection updates are frame-batched on scroll/resize, including under
reduced motion; this compensation keeps the background stationary. Without JS,
clouds remain paused within their section. About flowers keep visibility pausing.

Persona adapts the extracted Revival desktop and mobile silhouettes in
`assets/themes/persona/images/revival/`, as requested by the owner. The viewBoxes
extend the upper curves leftward so all three enter from the left edge rather
than being cut off at the hero/About seam. Only the upper desktop artwork is
remapped; the lower curves retain their positions. The desktop
TV stack is replaced by an original tilted playing card drawn in thin circuit
linework: the card body opens sky, divided by narrow yellow double frames, a
solid chip pip with symmetric traces and vias, and code-bracket corner indices.
An affine turn-and-squash makes it read as a card lying on a table. The compact mobile composition has no TV stack. CSS alpha masks
preserve the remaining curve geometry while using
the existing yellow token. Cover sizing preserves aspect ratio. Openings expose existing
cloud SVGs over `--hero-sky`. The `.about-sky-texture` shares H2's CSS row
profile; `alignBackdrop` converts the hero texture grid to HTML pixel units and
anchors its phase to the same document origin. Static CSS remains before JS.
Copy pads retain yellow backgrounds. About's status stripes, corner fan, gold
rings/shockwave and small motifs are now hidden with visibility; their nodes
remain measurable for the existing scroll geometry and available for rollback.
The hero sky continuation and doubled section height stay. The source geometry
replaces the hand-drawn half-width ribbons. Copy
is centered in the clear yellow field below the upper sweep. Attribution and
source URLs are recorded in `docs/ATTRIBUTION.md`.

### Experience slot movement

Persona's `assets/themes/persona/experience-save-menu.js` replaces the shared
controller only in the Persona renderer. `/original/` retains
`assets/js/experience-save-menu.js` and its existing behavior.

The local recording study (`references/analysis/report.md`, slot selection at
15.850–16.200 seconds) shows rows moving through a stationary dark band.
The Persona adaptation moves whole rows (circle, number, employer mark and
metadata) together over 200ms, inside the study's estimated 150–250ms envelope.
The easing is an approximation; this does not claim exact game-engine timing.
The existing blue selected circle, gold neighbours and employer marks remain;
no pink badges or blossom artwork are added. Circles change size uniformly,
without the previous squash/stretch or separate numeral bounce.

A decorative band and its stars sit outside the animated list. Outgoing rows
stay rendered until they leave the clipped window, but are inert and hidden
from assistive technology. Repeated input captures currently painted positions
before cancelling old motion; completion callbacks cannot overwrite newer
selections. Arrow keys, Home/End, row clicks and navigation buttons retain the
same bounded selection behavior and `aria-activedescendant` updates.

Phone layouts reserve the tallest expanded role and compact neighbour at the
current width, so the band and following section stay still during selection.
Resizing and font loading remeasure; reduced motion settles directly, including
when the preference changes during a transition. Timing is the controller's
`timing` constant; layout and clipping live in `experience-save-menu.css`.

The selected disc's pale circular reflection drifts over a 4.8s alternating
path (9.6s round trip). Its 90%-diameter circle reaches approximately 34% of
its area outside the sphere at each soft reversal, clipped by the sphere.
This follows the owner's requested behavior; exact game reflection timing is
not established by the recording analysis. CSS animates only the reflection's
transform; the controller pauses it when the selected circle is offscreen or
the document is hidden. Reduced motion leaves a static reflection. Tune
`experience-save-reflection-drift` in the component stylesheet.

### Experience disc marks and project meta

Persona prints each employer's mark on its save-menu disc, as P4G prints sakura
on the selected save disc. Set `disc_mark` on an experience entry in
`content.yml`; entries without one keep a plain disc. The mark is a CSS alpha
mask: 50% `--save-disc-shadow` on gold discs, 62% white on the selected blue
disc. The shared `logo` thumbnail stays for `/original/` and is hidden in
Persona.

Project cards take optional `role` and `dates` fields, rendered under the title
as a yellow wide-face label, a skewed divider and the italic term. Phones stack
the two lines. Both additions are inserted by `redesign.mjs`, so `/original/`
markup is unchanged.

### About flower pair

Persona adds a large gold six-petal flower with a bright yellow offset shadow
and a smaller charcoal companion in the lower-left About field. Both reuse
`flowerPetals`, rotating counterclockwise in 28s and 22s respectively. The
pair scales down on phones, stays decorative/noninteractive, and pauses when
About is offscreen or the document is hidden. Reduced motion leaves it static.
The three reference colors are additive Tier 1 `--ref-flower-*` tokens.

About sky traces are widened approximately 40% at typical channel widths using
static SVG alpha erosion on the silhouette paths (4 units desktop, 3 mobile).
This preserves their curves and the separate circuit-card cutout. A small
horizontal viewBox inset excludes the eroded outer edges and antialias fringe.

CRT source analysis and future scroll/title ideas are recorded in
[p4r-character-effects.md](p4r-character-effects.md). The About title treatment
below is now implemented; the broader scroll ideas remain research only.

### About character-page title

`about-title.css` composes an oversized italic serif “About” across the upper CRT
openings and yellow mask. The readable black heading retains the original
italic Inter, stretched lettering and gold shadow from `content-typography.css`.
The decorative lettering is `aria-hidden`, pointer-transparent and drawn with
the platform Georgia/serif stack; no reference image or new font file is used.

Two aligned text layers reproduce the reference's color change: white in the
blue CRT openings, pale yellow on the yellow field (60% existing yellow,
40% existing white, increased for visibility). The yellow text layer uses the exact silhouette, full-section
bounds and cover positioning of the background mask. Both share
`--about-sky-mask-image` from `hero-poster.css`, including the phone breakpoint.
Palette tokens and the shared CRT grid are unchanged. The desktop upper sweep's
vertical scale increases from .65 to .975 (50% wider vertically), anchored at
source y=900 so it joins the preserved lower artwork continuously. The circuit
card and phone mask retain their geometry. Decorative lettering stays at 20cqi
from the section top on desktop and 32cqi below 900px. The readable heading
reserves 1.2 times the decorative font size plus 2rem of clearance, with the
existing 48cqi/88cqi and hero-continuation offsets as minimums. This keeps OS
font metrics from colliding with the black heading without moving the lettering
out of the sky. The black heading's stretched label is centered on its own
box; biography copy stays centered with a 42rem maximum, including tablets.

Responsive verification (2026-10-26): Chromium at 320–2560px, including the
899/900px breakpoint and 844×390 landscape; live window resizing, emulated
touch viewports, reduced motion and 200% root text size. Local screenshots and
geometry reports are under `screenshots/responsive-layout/`. These are emulated
viewports on macOS, not physical phone or Windows browser verification.
The desktop hero name uses a .95 line-height and 2cqi role-strip margin to keep
their rotated bounds separate. Contact's corner flower reduces to a 4–6rem
base size below 600px so it clears the heading on narrow phones.

An offset cyan lettering copy supplies the CRT shadow. Its horizontal phosphor
bands use the existing cyan/blue palette and share the sky's device-snapped period
and phase through `scroll-presence.js`. A full-section wrapper inverts the yellow
silhouette with `mask-composite: exclude`, clipping both the shadow and its soft
edge to blue openings. The yellow lettering has no cyan shadow. The effect is
static, including under reduced motion, with CSS-only scanline fallbacks.

`redesign.mjs` inserts only the decorative lettering. The earlier “Background &
interests” subtitle and its wipe script were removed on 2026-10-23. This treatment
requires no JavaScript; its stylesheet loads only on redesigned Persona homepages.
The biography, shared source and `/original/` remain unchanged.

### Education Special-page composition

`education-settings.css` now adapts the [Revival Special page](https://asia.sega.com/p4r/en/special/):
a broad curved sky opening, oversized serif background title, cyan underline,
pale heading accent and amber-framed centerpiece. The existing University of
Toronto logo, institution, program and dates form the centerpiece. Desktop puts
the logo beside the details; phones stack them. No new qualifications or copy
were introduced. The section's black topic retains italic Inter, without the
horizontal stretch so its underline aligns with the visible word.

`education-mask-desktop.svg` and `education-mask-mobile.svg` are original alpha
silhouettes, not downloaded reference artwork. `redesign.mjs` adds the sky and
decorative title only to Persona. The same local cloud group, CRT palette,
device-snapped texture geometry and viewport compensation used by About also
cover Education. Reduced motion pauses cloud drift and shows the finished
credential. Old ribbon nodes stay hidden for rollback.

The top blue ribbon is scroll-linked (`assets/js/education-ribbon.js`). It
starts as a short pointed sliver at the left edge and grows rightward and
thicker as Education rises, retracting on the way back up. It's a `clip-path`
on `.education-sky-window` layered on top of the yellow mask, so the
clouds and CRT rows never stretch. Timing lives in `scroll-animation-config.js`
(`education.ribbonStartVh`, `ribbonEndVh`, `ribbonSmoothingMs`). Movement is
damped so wheel steps glide, and anchor jumps snap. The clip is removed when
complete, under reduced motion, and without JS. The band edges in the
module must match the mask SVGs; a test enforces this. The band is thicker
than the first version (lower edge about 65 desktop / 45 phone mask units
lower), and About no longer draws its 2px divider at the seam.

The same damped value is published as `--education-ribbon-progress` on the
section. `education-motion.js` adds the card's finish sequence without another
animation loop. Over ribbon progress .55–1, an `aria-hidden` rounded SVG rect
traces the amber border clockwise from its top-left tangent. A ResizeObserver
measures the card's border box, border width and radius; the real border keeps
its space throughout and resumes painting at completion. The contents settle
from .4 opacity and an 8px offset over the final 30% of that trace. Scrolling
back reverses the frame and contents together.

A downward crossing to progress 1 starts one 900ms ribbon light sweep, clipped
by the existing sky mask above the CRT texture and below the decorative title.
Completion while moving upward or stationary does not trigger that sweep.
Once the frame is complete and the honour chip is fully visible, it receives
one 650ms diagonal sweep, starting at least 250ms after the ribbon's sweep.
These are CSS animations removed on completion/cancellation; neither repeats
on another pass. Initial anchors and restored/reloaded pages already past the
completion point suppress both shines. Turning on reduced motion cancels active
and pending shines and shows the solid frame immediately; no-JS uses the same
finished card. New timings live in `SCROLL_ANIMATION.education` alongside the
unchanged ribbon settings. Requirements: [EDUCATION-MOTION-TASK.md](EDUCATION-MOTION-TASK.md).

The band no longer stops flat at the section boundary. Both Education masks
extend above the section (160 of 1400 desktop units, 120 of 1700 phone units),
and `.education-sky-window` is offset upward to match (`--education-overhang`).
The band's upper edge (`rise` in the module) curves up into About's lower edge
and exits the right side. Education clips only horizontally
(`overflow-x: clip`) so the overhang can paint over About. Mask URLs carry
`?v=` so browsers drop the old artwork.

Below 900px, `about-title.css` now uses a compact About composition: a 28cqi
decorative title, a 42%-wide flower pair, smaller proportional spacing, and
16px-minimum body text. Flowers follow the biography in flow so enlarged or
longer text cannot collide with them. The section's minimum is
`max(64rem, 240vw)` rather than the old `max(87.5rem, 373.3334vw)`.

The sky, yellow mask and title-mask surfaces share a shorter artwork box,
leaving `clamp(16rem, 32cqi, 20rem)` of yellow clearance at the bottom. This is
a responsive crop of the existing cover-scaled mask, not stretched artwork.
`assets/js/about-stripe-tails.js` samples its actual last 24 painted rows and
continues each stripe into a 16–64px tapered tip inside About's clearance.
The tail element remains owned by Education but is offset up to the artwork's
bottom, keeping it separate from Education's growing ribbon. Desktop keeps
the existing mask and 28–150px tail rules. Tails share the sky/scanline grid,
hide when no stripe crosses the artwork edge, and stay hidden without JS.

On desktop, About's top-left stripes started flat at the hero boundary.
The same script reads About's top 64 mask rows and continues each stripe
straight up and off the left edge at constant width (`exitLeft`). The
`.about-stripe-heads` layer lives in `.hero-visual-stage`, not About,
because About clips its overflow (`clip-path: inset(0)`). Its z-index 1 puts
it above the hero art and below the hero's flowers, copy and buttons.

Both About masks use inset viewBoxes to crop the erosion fringe. Phone is
740 units inside a 750-wide image, desktop 1828 inside 1840. With the default
`preserveAspectRatio`, the browser centred that narrower area and left
transparent strips down both sides, so the sky showed as a thin blue line on
each edge of About. Both files now set `preserveAspectRatio="none"`. The
drawing widens by under 1.4%, and the CSS URLs carry `?v=2`.

The desktop minimum grows from 66.75rem to 76rem (about 14%); phones use a 52rem
floor. These are minimums, not fixed heights: longer descriptions expand the
section naturally. Reference observations and local evidence are documented in
[p4r-special-layout.md](p4r-special-layout.md).
