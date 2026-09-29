# Adjusting the CRT effect

Edit **`assets/js/crt-settings.js`**, run `npm run build`, and refresh
[localhost](http://localhost:8000/). For repeated experiments, run `npm run watch`
and refresh after “Rebuilt”. Do not edit `_site/`: it is generated output.

The file stores your original Vault66 URL plus the effective Fallout settings,
including the preset's defaults. Every exposed switch is connected to the local
renderer. No dependency installation is needed.

- `enabled: false` removes the entire filter.
- `tintSaturation: 0.1` keeps only 10% of the tint in scanlines, sweep, inner
  glow and grain. Use `0` for neutral texture or `1` for the original Fallout
  tint. This never desaturates the underlying artwork, photos or videos.
- `scanlineOpacity`, `scanlineThickness`, `scanlineGap` control the raster lines.
- `theme` selects green, amber, blue, or custom; custom uses `scanlineColor`.
- `sweepThickness` is pixels; `sweepDuration` is seconds (higher is slower).
- `sweepColor` includes its own opacity. Set it to `null` for a dark band;
  `sweepStyle: 'soft'` then makes that dark band softer.
- `enableGlow` is the outer glow; `enableEdgeGlow` is the inside-edge glow.
- `enableNoise`, `enableCurvature`, `enableVignette`, and `enableFlicker`
  independently toggle the inherited Fallout effects.
- `staggerPreviews` keeps the three moving preview sweeps evenly separated.

## Hero-only color treatment

The `hero` block at the bottom of `crt-settings.js` overrides only the sky artwork
and its Header/About continuations. It takes the original `--hero-sky` light blue
from `hero-poster.css`, removes dark-glass curvature/vignette/edge shading, and
blends the texture with the sky using `screen` so it cannot add a dark gray film.
Neutral grain, flicker and sweep timing still inherit your shared controls.
The Selected projects settings are unaffected by the hero overrides.

The same treatment covers the hero's blue sky ring (including its Header/About
continuations) and project media. Hero pixels scale with the SVG artwork.
Static project pictures keep a still texture; only video previews and hero art
animate. All animation stops when hidden/offscreen; reduced motion hides sweep
and flicker and keeps a still texture. Missing JavaScript leaves the content visible.

This is an adaptation for the portfolio, not the complete Vault66 component:
the SVG sky uses the same HTML layers within its existing clip, flicker gently
dims the image rather than fading the whole frame, and grain uses small
transform offsets. Text tint and gameplay distortion are intentionally excluded.
