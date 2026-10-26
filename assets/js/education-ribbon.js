import { SCROLL_ANIMATION as settings } from './scroll-animation-config.js';
import { createEducationMotion } from './education-motion.js';
// Education's top blue ribbon grows out of the left edge as the section scrolls
// in, and retracts on the way back up. The yellow mask SVGs keep their exact
// edges; this only clips the sky window to a growing slice of the same band.

// Band edges in each mask's own units. `upper` is the yellow corner's edge;
// right of its top point, `rise` carries the band above the section into
// About's lower edge. `top` is how far the mask extends above Education.
// `lower` is the main yellow field's top edge. Keep in sync with the mask SVGs.
export const EDUCATION_RIBBON_SHAPES = {
  desktop: {
    width: 1920, height: 1400, top: -160,
    upper: [[620, 0], [380, 95], [170, 225], [0, 350]],
    rise: [[620, 0], [800, -71], [1300, -150], [1920, -110]],
    lower: [[0, 610], [560, 230], [1290, 125], [1920, 175]],
    // Everything below this stays visible (the lower stripes are not animated).
    restY: 700,
  },
  mobile: {
    width: 750, height: 1700, top: -120,
    upper: [[320, 0], [320, 0], [0, 175], [0, 175]],
    rise: [[320, 0], [420, -55], [600, -110], [750, -95]],
    lower: [[0, 455], [227, 298], [477, 202], [750, 175]],
    restY: 760,
  },
};

const clamp = value => Math.max(0, Math.min(1, value));
const smoothstep = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const bezier = (p, t) => {
  const u = 1 - t;
  return [0, 1].map(i => u * u * u * p[0][i] + 3 * u * u * t * p[1][i] + 3 * u * t * t * p[2][i] + t * t * t * p[3][i]);
};
// Curves here are monotonic in x, so bisection finds y for a given x.
function yAtX(p, x) {
  let lo = 0, hi = 1;
  const rising = p[3][0] > p[0][0];
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if ((bezier(p, mid)[0] < x) === rising) lo = mid; else hi = mid;
  }
  return bezier(p, (lo + hi) / 2)[1];
}
function upperY(shape, x) {
  return x >= shape.rise[0][0] ? yAtX(shape.rise, x) : yAtX(shape.upper, x);
}

// 0 when Education's top meets the viewport bottom, 1 once it has climbed
// to `ribbonEndVh`. Eased so the ribbon starts promptly and settles gently.
export function educationRibbonProgress(top, viewport) {
  const { ribbonStartVh, ribbonEndVh } = settings.education;
  const start = viewport * ribbonStartVh / 100;
  const end = viewport * ribbonEndVh / 100;
  return clamp((start - top) / Math.max(1, start - end));
}

// SVG path (CSS pixels, sky-window box) for the visible part of the sky window,
// or null when the ribbon is complete and no clipping is needed.
export function educationRibbonPath(width, height, progress, shape = EDUCATION_RIBBON_SHAPES.desktop) {
  const p = clamp(progress);
  if (p >= 1 || width <= 0 || height <= 0) return null;
  const sx = width / shape.width;
  const sy = height / (shape.height - shape.top);
  // The tip runs the full width; thickness trails slightly behind it.
  const reach = p * (1.15 - .15 * p);
  const taper = shape.width * .3;
  const head = shape.width * .14 + (shape.width * .86 + taper) * reach;
  const thickness = .3 + .7 * smoothstep(0, 1, p);
  const steps = 64;
  const top = [];
  const bottom = [];
  for (let i = 0; i <= steps; i++) {
    const x = Math.min(head, shape.width) * i / steps;
    const lower = yAtX(shape.lower, x) + 2;
    const full = lower - upperY(shape, x) + 4;
    // Pointed tip, slightly rounded by smoothstep.
    const k = thickness * smoothstep(head, head - taper, x);
    top.push([x, lower - full * k]);
    bottom.push([x, lower]);
  }
  const fmt = ([x, y]) => `${(x * sx).toFixed(1)} ${((y - shape.top) * sy).toFixed(1)}`;
  const band = `M${top.map(fmt).join('L')}L${bottom.reverse().map(fmt).join('L')}Z`;
  const rest = `M0 ${((shape.restY - shape.top) * sy).toFixed(1)}H${width.toFixed(1)}V${height.toFixed(1)}H0Z`;
  return `${band}${rest}`;
}

// Browser wiring: damped so wheel steps glide instead of snapping.
if (typeof document !== 'undefined') (() => {
  const section = document.querySelector('body.persona-design.page-home #education');
  const sky = section?.querySelector('.education-sky-window');
  if (!sky || !CSS.supports?.('clip-path', 'path("M0 0H1V1Z")')) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const phone = matchMedia('(max-width: 899px)');
  const motion = createEducationMotion(section);
  // Only the card reads the progress, so writing it there keeps per-frame
  // style work out of the cloud artwork.
  const progressTarget = section.querySelector('.education-card') || section;
  let previousScrollY = null;
  let scrollingDown = null;
  // Until the user interacts or the page has shown, scroll movement may be
  // the browser restoring a position, which must not play an entrance.
  let restoring = document.readyState !== 'complete';
  const interacted = () => { restoring = false; };
  for (const type of ['wheel', 'touchstart', 'keydown', 'pointerdown']) addEventListener(type, interacted, { passive: true, once: true });
  let current = null;
  let frame = 0;
  let last = 0;
  let written = '';
  let writtenProgress = null;
  let writtenShape = null;
  const writeProgress = value => {
    if (value === writtenProgress) return;
    writtenProgress = value;
    progressTarget.style.setProperty('--education-ribbon-progress', value);
  };
  const write = value => {
    if (value === written) return;
    written = value;
    sky.style.clipPath = value;
  };
  function tick(now) {
    frame = 0;
    if (reducedMotion.matches) { current = null; previousScrollY = null; scrollingDown = null; last = 0; write(''); writeProgress(1); motion?.finish(); return; }
    const previousProgress = current;
    const scrollY = window.scrollY;
    const box = section.getBoundingClientRect();
    const target = educationRibbonProgress(box.top, window.innerHeight);
    const dt = last ? Math.min(64, now - last) : 16;
    last = now;
    // Large jumps (anchor links, reloads mid-page) settle immediately.
    if (current === null || Math.abs(target - current) > .45) current = target;
    else current += (target - current) * (1 - Math.exp(-dt / settings.education.ribbonSmoothingMs));
    if (Math.abs(target - current) < .0005) current = target;
    const shape = phone.matches ? EDUCATION_RIBBON_SHAPES.mobile : EDUCATION_RIBBON_SHAPES.desktop;
    const path = educationRibbonPath(sky.offsetWidth, sky.offsetHeight, current, shape);
    write(path ? `path("${path}")` : '');
    writeProgress(Math.round(current * 1000) / 1000);
    if (shape !== writtenShape) {
      writtenShape = shape;
      section.style.setProperty('--education-shine-height', `${100 * (shape.restY - shape.top) / (shape.height - shape.top)}%`);
    }
    if (previousScrollY !== null && scrollY !== previousScrollY) scrollingDown = scrollY > previousScrollY;
    motion?.update(current, previousProgress, scrollingDown, restoring || previousProgress === null);
    previousScrollY = scrollY;
    if (current !== target) schedule(); else last = 0;
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(tick);
  }
  addEventListener('scroll', schedule, { passive: true });
  // Resizes (including a phone's address bar hiding) keep the current
  // progress; the next frame recomputes the clip at the new size.
  addEventListener('resize', schedule, { passive: true });
  addEventListener('pageshow', () => { restoring = false; current = null; previousScrollY = null; scrollingDown = null; schedule(); });
  reducedMotion.addEventListener('change', schedule);
  phone.addEventListener('change', schedule);
  if (typeof ResizeObserver === 'function') new ResizeObserver(schedule).observe(section);
  schedule();
})();
