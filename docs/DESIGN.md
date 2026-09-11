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

The new theme includes a fixed keyboard instruction bar. On the homepage,
Up/Down or Tab selects links and Enter activates them. On project pages, arrow
keys retain their game behavior; Tab selects controls. Esc returns home using
the page wipe, or closes an open navigation menu first. The HUD's Home
link also works with pointer and touch input.
The top navigation stays collapsed behind its menu button at every viewport
width. Opening it reveals a dropdown; selecting a link or pressing Esc closes it.


The three interactive demos use `assets/themes/persona/game-start.js` to wait
for the Start button before loading the shared game modules and focusing their
keyboard controls. Numeric section labels are removed by the Persona renderer.

The menu font controls are `--menu-font`, `--menu-font-size`, and
`--menu-outline` in the theme stylesheet.

After editing, run `npm run preview:build` and refresh the browser. To start
a server, run `python3 -m http.server 8000 --directory /private/tmp/personal-website-preview`.
Open `/persona/` for Persona and `/` for the original.

See [attribution](ATTRIBUTION.md) for design and font sources.

## Adjusting transitions locally

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
