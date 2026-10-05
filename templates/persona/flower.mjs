// Six water drops, each with a short, flat inward head centered at (160, 160).
// The drops taper all the way to that shared point; do not extend their tips
// past it, which fills the gaps and turns the silhouette into a rounded rosette.
// Scale each drop around its head: 20% thinner and 8% longer radially.
// Outer bulbs and flat inner heads are now 20% larger than the previous shape.
// The outer arc compensates for that scale (45.6 * .8 ≈ 33.778 * 1.08),
// keeping a circular bulb rather than stretching its end into an oval.
// Keep the shared center and presentation (fill, outline, shadow and motion).
export const flowerPetals = [0, 60, 120, 180, 240, 300].map(angle =>
  `<path transform="rotate(${angle} 160 160) translate(160 160) scale(.8 1.08) translate(-160 -160)" d="M156.4 160 H163.6 C169.6 137 188.8 106 203.74 69.94 A45.6 33.778 0 1 0 116.26 69.94 C131.2 106 150.4 137 156.4 160Z"/>`).join('');
