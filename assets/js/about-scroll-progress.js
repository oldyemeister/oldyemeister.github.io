import { SCROLL_ANIMATION as settings } from './scroll-animation-config.js';
const vh = (value, viewport) => value * viewport / 100;
export function aboutScrollProgress(top, height, viewport) {
  const start = viewport - Math.min(height, viewport) * settings.about.circlesStartFraction;
  const progress = Math.max(0, Math.min(1, (start - top) / Math.max(1, vh(settings.about.circlesTravelVh, viewport))));
  return { progress, text: Math.min(1, progress / settings.about.textCompleteAt) };
}

// Inner ring is 840 - 700 = 140 units thick; outer thickness is 1.2 × 140 = 168.
// Keep its inner edge at 864 SVG units and grow thickness with the reveal.
export function aboutOuterRing(progress) {
  const p = Math.max(0, Math.min(1, progress));
  const width = 16 + (168 - 16) * p ** 1.8;
  return { width, radius: 864 + width / 2 };
}

// The settings file controls entrance offsets and scroll travel.
export function aboutRibbonProgress(bottom, viewport, height) {
  const start = aboutRibbonStart(viewport, height);
  const p = Math.max(0, Math.min(1, (start - bottom) / Math.max(1, vh(settings.about.barsTravelVh, viewport))));
  return 1 - (1 - p) ** 3;
}

function aboutRibbonStart(viewport, height) {
  const originalStart = height + viewport * .94 - Math.min(height, viewport) * .5;
  return (originalStart + viewport * .95) / 2 - vh(settings.about.barsDelayVh, viewport) - settings.about.barsDelayPx;
}

// Education overlaps the settling About fan; pills trail its horizontal bars.
export function educationDecorProgress(top, aboutBottom, aboutHeight, viewport) {
  const afterAbout = aboutRibbonStart(viewport, aboutHeight) - vh(settings.education.afterAboutBarsStartVh, viewport) - aboutBottom;
  const distance = Math.min(vh(settings.education.enterAtVh, viewport) - top, afterAbout)
    - vh(settings.education.barsDelayVh, viewport) - settings.education.barsDelayPx;
  const ease = (distance, travelVh) => {
    const p = Math.max(0, Math.min(1, distance / Math.max(1, vh(travelVh, viewport))));
    return 1 - (1 - p) ** 3;
  };
  return {
    bars: ease(distance, settings.education.barsTravelVh),
    pills: ease(distance - vh(settings.education.pillsDelayVh, viewport), settings.education.pillsTravelVh),
  };
}
