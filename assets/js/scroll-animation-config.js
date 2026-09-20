/* SCROLL ANIMATION CONTROLS — edit here, save, then refresh localhost.
 * Vh = percent of viewport height: 10 = 80px on an 800px-tall window.
 * Delay: larger = later. Travel: larger = more scrolling to finish.
 * Px offsets are optional additions: positive = later, negative = earlier.
 * These control scrolling distance, NOT milliseconds (except shockwave.durationMs).
 */
export const SCROLL_ANIMATION = {
  heroBackdrop: {
    scale: .85, // 90% of the original circular artwork size.
    liftPx: 150, // Move the circular artwork up by this many screen pixels.
    continueIntoAbout: true, // EXPERIMENT: false restores the original straight clipping edge.
  },
  about: {
    minHeightPx: 1100, // Minimum section height, including on phones.
    minHeightVh: 135, // Also allow at least 135% of the browser height.
    minimumRingGapPx: 48, // Keep this much vertical space between blue and full-size gold rings.
    circleCenterXPercent: 65, // 0 = left edge, 50 = middle, 100 = right edge of About.
    circleCenterYPercent: 100, // 0 = top, 100 = bottom; >100 puts the center below About.
    circleCenterOffsetXPx: -200, // Optional fine adjustment: positive moves right.
    circleCenterOffsetYPx: -80, // Optional fine adjustment: positive moves down.
    circlesStartFraction: 0.65, // Fraction of About visible before growth starts (capped at one viewport); smaller = earlier.
    circlesTravelVh: 40,
    textCompleteAt: .3, // Fraction of circle growth when text is fully visible.
    barsDelayVh: 12, // Delay from the established responsive About entrance.
    barsDelayPx: 0,
    barsTravelVh: 30,
  },
  pictures: {
    enterAtVh: 95, // Start when the photo row TOP reaches 85% down the screen; smaller = later.
    delayVh: 0, // Extra scroll delay; larger = later.
    travelVh: 70, // Scroll distance to complete the fade and rotation.
    staggerVh: 6, // Additional scroll delay for the second photo.
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
