// SVG widths are user units; convert the configured CSS-pixel expansion once
// during layout. A right-anchored expansion only adds coverage, never gaps.
export function stripeKickGeometry(widths, svgWidth, kickPx, viewBoxWidth = 288) {
  if (!(svgWidth > 0)) return [];
  const extra = Math.max(0, kickPx) * viewBoxWidth / svgWidth;
  return widths.map((baseWidth, index) => {
    const width = baseWidth + (index === widths.length - 1 ? extra : 0);
    return { width, scaleX: 1 + extra / width };
  });
}

// Invert the existing shockwave's scale keyframes and cubic-bezier easing.
// The band is reached before the fade-out, at or before the .65 scale keyframe.
export function shockwaveArrivalDelay(distance, radius, duration) {
  const scale = Math.max(0, Math.min(.65, distance / radius));
  const progress = scale <= .24 ? scale / .24 * .2 : .2 + (scale - .24) / .41 * .35;
  const bezier = (t, a, b) => 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t ** 2 * b + t ** 3;
  let low = 0, high = 1;
  for (let i = 0; i < 32; i++) {
    const mid = (low + high) / 2;
    if (bezier(mid, .7, 1) < progress) low = mid;
    else high = mid;
  }
  return bezier((low + high) / 2, .22, .36) * duration;
}
