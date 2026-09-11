# Single-palette redesign

The active portfolio uses semantic colors from `assets/css/palette.css`: the
original olive/gold/yellow system plus the requested near-black, off-white, and
existing blue for readable copy and secondary accents.
There is one appearance, regardless of a saved or system light/dark preference.
The theme switch is hidden by the new visual layer; its original implementation
is retained for rollback.

`assets/css/redesign.css` applies the palette to existing section wrappers,
navigation, controls, TV cabinets, and sandbox settings. Section-heading fonts
and their installed wider variants are retained. Heading white strokes and letter animation are disabled;
link word-hover animations are preserved. Images and controls outside the protected
TV/HUD use hard offset shadows.

## Edit and preview

- Edit palette values only in `assets/css/palette.css`.
- Edit borders, corners, shadows, and component treatments in `assets/css/redesign.css`.
- Run `npm run watch`, save, wait for “Rebuilt”, and refresh your local site.
- Or run `npm run build` once, then refresh.
- Serve the output with `python3 -m http.server 8000 --directory _site`.

## Roll back

In `templates/persona/render.mjs`, change the `personaPreview` parameter default
from `redesign = true` to `redesign = false`, then rebuild. This disables both
redesign stylesheets and the added visual captions together, restoring the
previous presentation. Game logic is unchanged; `/original/` stays preserved.

## Step 3 treatment

Sections use one enclosing olive panel, including the sandbox and case-study
hero. Inner project entries share that panel; their images and controls carry
hard yellow shadows. Hero and case-study visuals appear above their headings;
project images have small centered captions before the project title/divider.
Heading letter effects are disabled, while link hover animations and the
original keyboard instruction bar remain. The section-heading font is retained
with a heavier weight. Black TV casing, bezel, and foot styling are unchanged.

## Color-scan exceptions

The general site palette has four colors. `palette.css` also restores the original
keyboard HUD variables and black TV casing colors as an explicit user-requested exception. `redesign.css` uses
`@scope` to exclude only `.persona-hud` and its descendants from redesign rules.
The TV casing and bezel retain their original black finish through targeted
overrides; the game buttons, controls, and overlays keep the new design. No hex/rgb/hsl
declarations are added to `redesign.css`. See `COLOR-REMAINING.md` for every
remaining source match outside the palette file.

The original styles retain their literals deliberately for rollback. The new
layer overrides their UI treatment; this is not a destructive replacement of
the old files. Photos, videos, SVG artwork and original game sprites retain
their image colors. Canvas/WebGL game rendering and artwork-generation code
also retain their original colors. The approved palette governs site UI, not
the pixels within the original projects. Bundled-library color parsing data
is retained. These exceptions mean a whole-repository grep is not zero.

See [the color-rebalance audit](COLOR-REBALANCE.md) for the text-color reduction
and the browser-console computed-style audit for light and dark settings.
