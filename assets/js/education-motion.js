import { SCROLL_ANIMATION as settings } from './scroll-animation-config.js';

const clamp = value => Math.max(0, Math.min(1, value));
export function educationFrameProgress(progress, startAt = settings.education.frameStartAt) {
  return clamp((progress - startAt) / Math.max(.0001, 1 - startAt));
}

// `scrollingDown` is the direction of the most recent real scroll movement,
// not of this frame: the damped progress often lands on 1 a few frames after
// the page itself has stopped moving.
export function shouldShineRibbon(previousProgress, progress, scrollingDown, alreadyShone) {
  return !alreadyShone && Number.isFinite(previousProgress)
    && previousProgress < 1 && progress >= 1 && scrollingDown === true;
}

// Shares the ribbon's frame loop. ResizeObserver alone measures the border;
// scrolling changes paint, never the card's dimensions or document position.
export function createEducationMotion(section) {
  const card = section.querySelector('.education-card');
  const overlay = card?.querySelector('.education-frame-trace');
  const rect = overlay?.querySelector('rect');
  if (!rect) return null;
  const ribbon = section.querySelector('.education-ribbon-shine');
  const chip = card.querySelector('.education-honor-name');
  const config = settings.education;
  // Trace timing is read inside the card; the ribbon shine lives outside it.
  for (const [name, value] of Object.entries({
    '--education-frame-start': config.frameStartAt,
    '--education-details-start': config.detailsStartAt,
    '--education-details-opacity': config.detailsMinimumOpacity,
    '--education-details-offset': `${config.detailsOffsetPx}px`,
    '--education-honor-shine-ms': `${config.honorShineMs}ms`
  })) card.style.setProperty(name, value);
  section.style.setProperty('--education-ribbon-shine-ms', `${config.ribbonShineMs}ms`);

  let ribbonShone = false;
  let chipShone = false;
  let chipPending = false;
  let chipTimer = 0;
  let ribbonStarted = -Infinity;
  let progress = 1;
  let measured = false;
  let traceActive = false;
  const active = new Set();
  const clearShine = element => { element.removeAttribute('data-shining'); active.delete(element); };
  for (const element of [ribbon, chip].filter(Boolean)) {
    const finish = event => { if (event.target === element) clearShine(element); };
    element.addEventListener('animationend', finish);
    element.addEventListener('animationcancel', finish);
  }
  // Reports whether the shine actually started, so a hidden tab never
  // consumes the one-time effect.
  function shine(element) {
    if (!element || document.hidden) return false;
    active.add(element);
    element.setAttribute('data-shining', '');
    return true;
  }
  function cancel() {
    clearTimeout(chipTimer);
    chipTimer = 0;
    for (const element of active) clearShine(element);
  }
  function syncTrace() {
    const next = measured && progress < 1;
    if (next !== traceActive) section.toggleAttribute('data-frame-tracing', next);
    traceActive = next;
  }
  function measure() {
    const style = getComputedStyle(card);
    const width = parseFloat(style.width);
    const height = parseFloat(style.height);
    const border = parseFloat(style.borderTopWidth);
    const radius = Math.max(0, parseFloat(style.borderTopLeftRadius) - border / 2);
    if (!(width > border && height > border)) return;
    overlay.setAttribute('viewBox', `0 0 ${width} ${height}`);
    // A rounded rect's native path starts at its top-left tangent, clockwise.
    for (const [name, value] of Object.entries({ x: border / 2, y: border / 2, width: width - border, height: height - border, rx: radius })) {
      rect.setAttribute(name, value);
    }
    card.style.setProperty('--education-frame-border', `${border}px`);
    measured = true;
    syncTrace();
  }
  const fullyVisible = () => {
    if (!chip || document.hidden) return false;
    const box = chip.getBoundingClientRect();
    return box.width > 0 && box.height > 0 && box.top >= 0 && box.left >= 0
      && box.bottom <= window.innerHeight && box.right <= window.innerWidth;
  };
  function tryChip() {
    if (!chipPending || chipShone || chipTimer || progress < 1 || !fullyVisible()) return;
    const delay = Math.max(0, config.honorShineDelayMs - (performance.now() - ribbonStarted));
    if (delay > 0) {
      chipTimer = setTimeout(() => { chipTimer = 0; tryChip(); }, delay);
      return;
    }
    if (!shine(chip)) return;
    chipShone = true;
    chipPending = false;
  }
  function update(value, previousProgress, scrollingDown, initial = false) {
    progress = value;
    syncTrace();
    if (initial) {
      // Initial anchors, restored scroll positions and preference changes do
      // not create an entrance, even after a later trip up and back down.
      if (value >= 1) { ribbonShone = true; chipShone = true; chipPending = false; }
      return;
    }
    if (shouldShineRibbon(previousProgress, value, scrollingDown, ribbonShone) && shine(ribbon)) {
      ribbonShone = true;
      ribbonStarted = performance.now();
    }
    if (Number.isFinite(previousProgress) && previousProgress < 1 && educationFrameProgress(value) === 1) chipPending = true;
    // A started shine always finishes its short sweep; only a pending honour
    // shine waits for the card to be complete again.
    if (value < 1) { clearTimeout(chipTimer); chipTimer = 0; }
    tryChip();
  }
  function finish() {
    cancel();
    progress = 1;
    ribbonShone = chipShone = true;
    chipPending = false;
    syncTrace();
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancel(); });
  addEventListener('pagehide', cancel);
  if (typeof ResizeObserver === 'function') new ResizeObserver(measure).observe(card);
  document.fonts?.ready.then(measure);
  measure();
  return { update, finish };
}
