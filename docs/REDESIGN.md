# Single-palette redesign

The active portfolio uses semantic colors from `assets/themes/persona/tokens.css`: the
original olive/gold/yellow system plus the requested near-black, off-white, and
existing blue for readable copy and secondary accents.
There is one appearance, regardless of a saved or system light/dark preference.
The theme switch is hidden by the new visual layer; its original implementation
is retained for rollback.

`assets/themes/persona/redesign.css` supplies the remaining section and control
refinements, including the project chips. Component sheets own the current
appearance: `tv-frame.css` styles the TV cabinet and controls, `key-instructions.css`
styles the HUD, and `content-typography.css` defines the supporting type roles.
There are no TV/HUD override rules in `redesign.css`.

## Edit and preview

- Edit palette values only in `assets/themes/persona/tokens.css`.
- Edit borders, corners, shadows, and component treatments in `assets/themes/persona/redesign.css`.
- Run `npm run watch`, save, wait for “Rebuilt”, and refresh your local site.
- Or run `npm run build` once, then refresh.
- Serve the output with `python3 -m http.server 8000 --directory _site`.

## Roll back

In `templates/persona/render.mjs`, change the `personaPreview` parameter default
from `redesign = true` to `redesign = false`, then rebuild. This disables both
redesign stylesheets and the added visual captions together, restoring the
previous presentation. Game logic is unchanged; `/original/` stays preserved.

## Step 3 treatment

The current section treatments live in their component stylesheets: project
cards in `project-cards.css`, reading surfaces in `project-pages.css`, and the
save-menu rows in `experience-save-menu.css`. Their backgrounds and shadows
are not governed by the former all-section olive-panel rules. TV casing,
bezel, feet and controls are styled by `tv-frame.css`; the HUD retains its
scoped palette in `tokens.css` and layout in `key-instructions.css`.

## Color-scan exceptions

`tokens.css` contains the shared P4G/P4 Revival palette and semantic aliases,
plus the scoped original keyboard-HUD palette. TV styling uses the live tokens
in `tv-frame.css`; the unused `.persona-tv` token block has been removed.
A former `@scope (body.persona-design) to (.persona-hud)` block was removed
because its body-prefixed descendant selectors never matched. It did not
protect or restyle the TV/HUD, their buttons or their overlays. The separate
black-text scope using `:scope` remains active. `redesign.css` adds no color literals.

The original styles retain their literals deliberately for rollback. The new
layer overrides their UI treatment; this is not a destructive replacement of
the old files. Photos, videos, SVG artwork and original game sprites retain
their image colors. Canvas/WebGL game rendering and artwork-generation code
also retain their original colors. The approved palette governs site UI, not
the pixels within the original projects. Bundled-library color parsing data
is retained. These exceptions mean a whole-repository grep is not zero.
