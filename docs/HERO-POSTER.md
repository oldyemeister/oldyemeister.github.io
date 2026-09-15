# Reference-inspired hero lettering

The active hero is in `index.html`, styled only under `#home` in `assets/css/hero-poster.css`.

## Exact curve/text alignment

The SVG defines two gold concentric circular bands: `hero-crescent` and `hero-ribbon`. The same shapes are reused inside `hero-gold-mask`. Name and role render as two identical direct SVG text groups: olive outlines, then solid olive clipped to that mask. Both read the same content fields. Explicit font sizes and natural glyph widths avoid stretching. Thus text is filled over gold and outlined over yellow, with no separately positioned text layers to drift out of alignment.

- Change the two paths' `d` attributes to reshape the background.
- Change both `rotate(-6 70 360)` transforms to adjust the words' tilt.
- Text `x`/`y` positions move the words across the curve.
- Font sizes control natural text width; do not add `textLength` or `spacingAndGlyphs`.
- Palette variables remain in `assets/css/palette.css`.

The SVG scales as one composition on mobile, keeping the complete name visible. The links remain HTML in a compact gold strip below it. The introduction is in About, and home-page key instructions are hidden. The semantic heading is visually hidden; SVG duplicates are decorative and hidden from assistive technology.

The `.hero-portrait-frame` in `index.html` restores the GitHub JY monogram design: a rounded square olive panel, gold border and yellow offset shadow. Its position and mobile arrangement are in the active hero stylesheet.

Run `npm run watch`, save, and refresh http://localhost:8000/.

## Concentric bands

Both gold paths now use exact circular SVG arcs centered at `(950, -180)`.
The inner band spans radii 700–840; the outer band spans 864–1600.
This makes the outer band 736 units thick versus 140 for the inner band,
with a 24-unit yellow gap. Both paths use even-odd fill and clip rules,
so the lettering mask follows the same rings. Keep the shared center when
editing the arc endpoints and radii in `index.html`.
