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
Its small knob controls CRT, not Pause (the sandbox has no pause action).

`--tv-knob-offset` moves the small knobs and Reset slightly down the right rail.
Pause and CRT sit beside each other; below a 650px cabinet width they stack with
44px targets so the canvas retains its width. Reset remains the bottom gear dial.
`assets/js/game-crt.js` adds an optional pointer-transparent screen overlay using
the shared CRT layers. The white CRT toggle stays available before Start, exposes
`aria-pressed`, and starts off. Edit `CRT_SETTINGS.game` in `assets/js/crt-settings.js`
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
