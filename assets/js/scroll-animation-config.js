/* SCROLL ANIMATION CONTROLS — edit here, save, then refresh localhost.
 * Vh = percent of viewport height: 10 = 80px on an 800px-tall window.
 * Delay: larger = later. Travel: larger = more scrolling to finish.
 * Px offsets are optional additions: positive = later, negative = earlier.
 * These control scrolling distance, NOT milliseconds (except shockwave.durationMs).
 */
export const SCROLL_ANIMATION = {
  about: {
    circlesStartFraction: .5, // Fraction of About visible before growth starts (capped at one viewport).
    circlesTravelVh: 40,
    textCompleteAt: .3, // Fraction of circle growth when text is fully visible.
    barsDelayVh: 6, // Delay from the established responsive About entrance.
    barsDelayPx: 0,
    barsTravelVh: 30,
  },
  education: {
    enterAtVh: 95, // Education TOP reaches this % from screen top; larger = earlier.
    afterAboutBarsStartVh: 0, // Minimum scrolling after About bars START; 0 allows simultaneous starts.
    barsDelayVh: 0, // Extra delay after BOTH conditions above are met.
    barsDelayPx: 0,
    barsTravelVh: 30,
    pillsDelayVh: 8, // Pills follow Education bars by this much scrolling.
    pillsTravelVh: 30,
  },
  shockwave: {
    triggerAt: 1, // Circle expansion: 0 = starting, 1 = fully expanded.
    rearmGap: .05, // Scroll back this far before the pulse can replay.
    durationMs: 650, // This pulse is time-based once triggered.
    peakOpacity: .25,
  },
  content: {
    travelVh: 24, // General section/card fade+scale at viewport edges.
    travelElementFraction: .6,
    minimumOpacity: .5,
    minimumScale: .95,
  },
};
