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

Flower artwork uses six water drops with short, flat inward heads aligned at
one shared center in `templates/persona/flower.mjs`, including the small Contact motif.
Petals taper to that center without extending past it into a rounded rosette.
Each drop is scaled around its inward head to be 20% thinner and 8% longer radially.
The outer end uses a scale-compensated circular arc for the reference's rounded bulb.
The bulb radius and flat inner-head width are both enlarged by 20% from that baseline.
Existing fills, rainbow outlines, shadows, placements, sizes and rotation styles are preserved.
The hero sky uses an original dense seven-row CSS texture over our SVG clouds,
plus the slow CRT sweep. Hero-only noise, flicker and scanlines are disabled.
The tile is defined in `hero-poster.css` in shared SVG coordinates so the hero,
header and About copies have identical scale and phase. It appears before JS
and remains visible under reduced motion; clouds and sweep stop. H2 uses a
30%-opacity near-white/pale-cyan/soft-edge/cyan profile. `sky-texture.js` snaps
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
preview, reduced to 22% on phones to avoid overflow, with a small black shadow below.
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

`node tools/tv-demo-build.mjs` restores the optional `/tv-demo/` alias after a
production build, using the same shared frame rather than a separate design copy.

The menu font controls are `--menu-font`, `--menu-font-size`, and
`--menu-outline` in the theme stylesheet.

After editing, run `npm run preview:build` and refresh the browser. To start
a server, run `python3 -m http.server 8000 --directory /private/tmp/personal-website-preview`.
Open `/persona/` for Persona and `/` for the original.

See [attribution](ATTRIBUTION.md) for design and font sources.

## Adjusting transitions locally

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

Owner-approved on 2026-10-13: desktop composition starts at 900px; body copy
may shrink to 14px; the root scale grows above 1440px to a maximum of 115%.
`render.mjs` adds `html.persona-root` only for the active redesign.
`desktop-scaling.css` supplies the fluid root and inherited shared-layout
sizes. Persona component dimensions use rem (16px at the 1440px reference).
Hairline borders, media-query thresholds and SVG user-space drawing coordinates
remain in px. The original stylesheet and day/night palette values are untouched.

Hero and About establish inline-size containers. Hero typography, buttons,
monogram and flowers use cqi as one 1440px poster composition; its width caps
at 90rem. About's JS geometry measures the actual stage width and scales its
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
