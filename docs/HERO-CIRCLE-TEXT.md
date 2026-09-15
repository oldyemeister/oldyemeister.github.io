# Hero layout and circular text boundary

All styling for this effect lives in `assets/css/hero-circle-type.css`, scoped to `#home`. The monogram/future portrait occupies the left column; the title, subtitle, description and links occupy the right. Below 760px the columns stack to keep the text readable.

The title uses two aligned HTML layers in `index.html`, both reading the name and role from `_data/content.yml`:

1. The base layer is transparent text with a black outline over mustard gold.
2. The overlay contains black-filled text AND the electric-yellow background.
3. `clip-path: circle(...)` clips that whole overlay, so the background boundary and the text-fill boundary coincide.

The circle center is at the top center of the title area, with a radius of half its width. Only the **lower semicircle** is visible. This creates a downward arc separating the yellow area above from gold below, with no separate rounded card around the title.

The real heading remains accessible; the duplicate overlay is hidden from assistive technology and inert. Both layers share typography, padding and line height.

## Adjust the design

In `assets/css/hero-circle-type.css`:

- `.hero-layout` grid columns: change `.8fr` / `1.4fr` to adjust portrait versus text width.
- `--hero-circle-x`: horizontal center (currently `50%`).
- `--hero-circle-y`: vertical center (currently `0px`). Negative values lift the arc.
- `--hero-circle-radius`: currently `50cqw`, half the title width; increasing it makes a larger circle.
- `--hero-name-size` and `--hero-role-size`: responsive text sizes.
- `--hero-outline-width`: black outline thickness.
- `.hero-title-layer` gap and padding: move the words relative to the arc. Keep these shared between both layers.

Colors reuse `--palette-yellow` and `--palette-gold` from `assets/css/palette.css`.

Run one `npm run watch` process, save changes, then refresh http://localhost:8000/ (Cmd+Shift+R if cached).
