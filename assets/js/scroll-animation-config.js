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
    minHeightPx: 560, // Desktop floor; compact and phone layouts use smaller floors.
    minHeightVh: 68, // Leave room for the ring without a full viewport of empty space.
    goldArtworkScale: .65, // Slightly enlarged corner arch, independent of the copy.
    minimumRingGapPx: 48, // Keep this much vertical space between blue and full-size gold rings.
    circleCenterXPercent: 0, // Anchor the cropped arch to About's lower-left corner.
    circleCenterYPercent: 100, // 0 = top, 100 = bottom; >100 puts the center below About.
    circleCenterOffsetXPx: 0, // Optional fine adjustment: positive moves right.
    circleCenterOffsetYPx: 130, // Crop the lower arc at the Education seam.
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
    ribbonStartVh: 85, // Blue ribbon starts growing when Education's TOP reaches this % from screen top.
    ribbonEndVh: 18, // ...and is fully open when the TOP reaches this %; smaller = more scrolling.
    ribbonSmoothingMs: 110, // Glide toward the scroll position; 0 = follow scroll exactly.
    frameStartAt: .55, // Ribbon progress (0–1) when the amber frame begins tracing.
    detailsStartAt: .7, // Frame progress when the contents begin settling into place.
    detailsMinimumOpacity: .4, // Keep the university and honours readable during the trace.
    detailsOffsetPx: 8, // Initial downward offset of the card's contents.
    ribbonShineMs: 900, // One light sweep when a downward scroll completes the ribbon.
    honorShineMs: 650, // One light sweep across the honour, after its chip is fully visible.
    honorShineDelayMs: 250, // Minimum separation between ribbon and honour shine starts.
  },
  stripes: {
    startAt: .1, // Ring growth (0–1) at which the first right-edge stripe starts dropping in.
    completeAt: .85, // Ring growth at which the last stripe is complete; keep below shockwave.triggerAt.
    stagger: .4, // How far the last stripe lags the first; 0 = all together.
    kickPx: 8, // Sideways kick when the shockwave reaches a stripe.
    kickMs: 280, // Duration of each stripe's kick (time-based, like the shockwave).
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
