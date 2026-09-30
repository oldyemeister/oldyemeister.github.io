/* CRT CONTROLS — edit this file, run `npm run build`, then refresh localhost.
 * Or leave `npm run watch` running and refresh after it reports “Rebuilt”.
 * Shared by the hero, Selected projects, and optional in-game CRT controls.
 * Names match Vault66. The Fallout preset is expanded below so no values are hidden.
 * Thickness/gap/size = px; duration/speed = seconds; opacity/intensity = 0–1.
 * Hero dimensions scale with its SVG artwork. Video dimensions are CSS pixels.
 */
export const CRT_SOURCE_URL = 'https://vault66.dev/?preset=fallout&theme=green&scanlineOpacity=0.19&scanlineThickness=2&scanlineGap=2&sweepThickness=3&sweepColor=rgba%2891%2C+179%2C+135%2C+0.5%29&sweepStyle=classic&enableGlow=false&flickerIntensity=0.07&flickerSpeed=1.7&vignetteIntensity=0.15';

export const CRT_SETTINGS = {
  enabled: true, // Master switch. false removes every CRT layer.
  // Only the scanlines, sweep, inner glow and grain lose color—not the media.
  // 0 = neutral CRT texture, 1 = original Fallout tint. 0.1 keeps just a hint.
  tintSaturation: 0.1,

  // Your scanlines: 2px green lines with a 2px clear gap.
  theme: 'green', // 'green', 'amber', 'blue', or 'custom'.
  enableScanlines: true,
  scanlineOpacity: 0.19,
  scanlineThickness: 2,
  scanlineGap: 2,
  scanlineColor: '#5bb387', // Used only with theme: 'custom'; opacity is separate.
  scanlineOrientation: 'horizontal', // 'horizontal' or 'vertical'.

  enableSweep: true,
  sweepDuration: 12, // Fallout default. Higher = slower.
  sweepThickness: 3,
  sweepColor: 'rgba(91, 179, 135, 0.5)', // Set to null for a dark refresh bar.
  sweepStyle: 'classic', // 'classic' or 'soft'; colored sweeps are always blurred.

  enableGlow: false, // Outer glow, separate from the moving sweep.
  glowColor: 'rgba(0, 255, 128, 0.3)',
  enableEdgeGlow: true, // Fallout's inner edge glow.
  edgeGlowColor: 'rgba(91, 179, 135, 0.5)',
  edgeGlowSize: 40,

  enableFlicker: true,
  flickerIntensity: 0.05,
  flickerSpeed: 1.7, // Higher = slower; 0 intensity removes brightness variation.
  enableVignette: true,
  vignetteIntensity: 0,

  // Other Fallout defaults. Switch these off individually for a cleaner image.
  enableCurvature: true,
  curvatureIntensity: 0.6,
  enableNoise: true,
  noiseOpacity: 0.2,
  enableGlare: false,
  glareIntensity: 0.1,

  // Portfolio-specific: keep each looping preview at a different sweep phase.
  staggerPreviews: true,

  // GAME TVs — the white CRT knob toggles this presentation-only overlay.
  // Start with the clean screen; set defaultEnabled to true to start with CRT.
  // Other parameters inherit the shared values above; add overrides here.
  game: {
    defaultEnabled: false,
  },

  // HERO ONLY — the blue sky is artwork, not a dark glass TV screen.
  // Everything omitted here (grain, flicker, sweep timing) inherits the values above.
  // Uses the actual sky color from hero-poster.css instead of painting gray over it.
  hero: {
    theme: 'custom',
    scanlineColor: 'var(--hero-sky)',
    tintSaturation: 1,
    sweepColor: 'color-mix(in srgb, var(--hero-sky) 50%, transparent)',
    enableCurvature: false,
    enableVignette: false,
    enableEdgeGlow: false,
  },
};

// Text tint and glitch are deliberately not applied: only media is filtered,
// and the site's typography, composition, TV frames and gameplay stay unchanged.
