# Hero ambient effects

`assets/css/hero-ambient.css` contains the isolated glow layer. Remove its stylesheet link and `.hero-ambient-surface` markup in `index.html` to roll back.

- Three orbs, opacity .20 for each orb, blur 50px.
- Transform-only animation: 26 / 30 / 23 seconds, staggered negative delays.
- The existing `html[data-theme="dark"]` state selects cool blue/white; default/light uses warm white/gold. The theme toggle remains hidden as previously requested.
- All selectors are scoped to `#home`. Orbs are absolute, noninteractive, clipped, above the gold circle fills and below text. The hero's height is unchanged.
- Reduced motion freezes every orb. No circuit pattern was added because the circular artwork already provides texture.

Verified in the in-app Browser at 1280px and 390px: day/night computed gradients, the initial low opacity and 60px blur, no horizontal overflow, and unobstructed mobile button hit targets. A temporary test page activated the existing reduced-motion rule and confirmed animation/transform become none; the operating system motion setting was not changed. Temporary testing controls were removed.

The orbs now sit in an SVG foreignObject between the shape group and the lettering groups. This prevents opaque gold bands from concealing them while preserving the shared text clipping geometry. Browser verification confirmed this paint order, visible glow on the gold bands, and no horizontal overflow.

Visibility adjustment: opacity is now .42 with a broader white center and 50px blur. This deliberately exceeds the initial subtle setting after feedback that it was not visible. Travel is 60px horizontally and 40px vertically; loop durations and reduced-motion behavior are unchanged.

Final tuning: all three orbs use 20% opacity; brightness profile, blur, and motion remain unchanged.

The glow layer fades out across its bottom 30% using a CSS mask, preventing a rectangular cutoff at the SVG boundary. The CTAs now sit inside the circle composition rather than in a separate strip.
