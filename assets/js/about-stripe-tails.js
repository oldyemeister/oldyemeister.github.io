// About's cover-scaled mask cuts its thin sky stripes flat at About's edges:
// at the bottom on narrow screens (the mask runs past About), and at the top
// on desktop (the artwork starts there). This reads the mask's edge rows at
// About's real scale and draws each stripe on past the edge, narrowing to a
// point: tails into Education, heads up into the hero (whose stage clips
// the 1px overlap; About itself clips anything drawn outside it).

// Open (sky) runs in one row of mask alpha: [start, end) pixel pairs.
function openRuns(alpha, width, row, threshold = 128) {
  const runs = [];
  let start = -1;
  for (let x = 0; x <= width; x++) {
    const open = x < width && alpha[row * width + x] < threshold;
    if (open && start < 0) start = x;
    else if (!open && start >= 0) { runs.push([start, x]); start = -1; }
  }
  return runs;
}

// Follow each run in the bottom row upward and fit both edges with a line.
// Slopes are dx per row going DOWN, so extrapolation continues the stripe.
export function traceStripes(alpha, width, height, threshold = 128) {
  const bottom = height - 1;
  // Scan each row once; every stripe then walks the same lists.
  const rows = Array.from({ length: height }, (_, row) => openRuns(alpha, width, row, threshold));
  return rows[bottom].map(run => {
    const edges = [[0, run[0], run[1]]];
    let current = run;
    for (let up = 1; up < height; up++) {
      let best = null;
      let overlap = 0;
      for (const candidate of rows[bottom - up]) {
        const shared = Math.min(candidate[1], current[1]) - Math.max(candidate[0], current[0]);
        if (shared > overlap) { best = candidate; overlap = shared; }
      }
      if (!best) break;
      edges.push([-up, best[0], best[1]]);
      current = best;
    }
    const fit = column => {
      // Least squares slope of x against y; flat when only one row is known.
      const n = edges.length;
      const my = edges.reduce((sum, edge) => sum + edge[0], 0) / n;
      const mx = edges.reduce((sum, edge) => sum + edge[column], 0) / n;
      const vy = edges.reduce((sum, edge) => sum + (edge[0] - my) ** 2, 0);
      return vy ? edges.reduce((sum, edge) => sum + (edge[0] - my) * (edge[column] - mx), 0) / vy : 0;
    };
    // Edges touching the image border are unreliable; mirror the other side.
    let leftSlope = fit(1);
    let rightSlope = fit(2);
    if (run[0] === 0) leftSlope = rightSlope;
    if (run[1] === width) rightSlope = leftSlope;
    return { left: run[0], right: run[1], leftSlope, rightSlope, rows: edges.length };
  });
}

// Tapered tails as one SVG path in CSS pixels. By default About's edge is at
// y = 1 and tails grow downward; `originY`/`direction: -1` mirror them upward.
// The 1px overlap keeps a seam from showing at the edge. With `exitLeft`,
// stripes heading left run straight on until they leave the screen instead.
export function stripeTailPath(stripes, scale = 1, {
  minLength = 28, maxLength = 150, lengthPerThickness = 6, maxDepth = Infinity, originY = 0, direction = 1, exitLeft = false,
} = {}) {
  const fmt = (x, y) => `${(x / scale).toFixed(2)} ${(originY + direction * (y / scale + 1)).toFixed(2)}`;
  return stripes.filter(stripe => stripe.right - stripe.left >= scale && stripe.rows > 1).map(({ left, right, leftSlope, rightSlope }) => {
    const slope = (leftSlope + rightSlope) / 2;
    if (exitLeft && slope < -.05) {
      // Constant width, so the stripe reads as the same ribbon off-screen.
      const exit = Math.min((right + 4 * scale) / -slope, maxDepth * scale);
      return `M${fmt(left, -1)}L${fmt(left + slope * exit, exit)}L${fmt(right + slope * exit, exit)}L${fmt(right, -1)}Z`;
    }
    const stretch = Math.hypot(slope, 1);
    // Perpendicular thickness sets the tail length, as with a real ribbon.
    const thickness = (right - left) / stretch;
    const length = Math.max(minLength * scale, Math.min(maxLength * scale, thickness * lengthPerThickness));
    const depth = Math.min(length / stretch, maxDepth * scale);
    const tipX = (left + right) / 2 + slope * depth;
    const bend = depth * .55;
    // Each edge leaves the boundary on its own line, then curves into the tip.
    return `M${fmt(left, -1)}L${fmt(left, 0)}Q${fmt(left + leftSlope * bend, bend)} ${fmt(tipX, depth)}`
      + `Q${fmt(right + rightSlope * bend, bend)} ${fmt(right, 0)}L${fmt(right, -1)}Z`;
  }).join('');
}

// Browser wiring.
if (typeof document !== 'undefined') (() => {
  const about = document.querySelector('body.persona-design.page-home #about');
  const tails = document.querySelector('body.persona-design.page-home #education > .about-stripe-tails');
  const heads = document.querySelector('body.persona-design.page-home #home .about-stripe-heads');
  if (!about || !tails || !CSS.supports?.('clip-path', 'path("M0 0H1V1Z")')) return;
  const images = new Map();
  const load = url => {
    if (!images.has(url)) {
      images.set(url, new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = url;
      }));
    }
    return images.get(url);
  };
  let pending = 0;
  async function update() {
    pending = 0;
    const match = getComputedStyle(about).getPropertyValue('--about-sky-mask-image').match(/url\(["']?([^"')]+)["']?\)/);
    const width = about.offsetWidth;
    const height = about.offsetHeight;
    if (!match || !width || !height) return;
    let image;
    try { image = await load(match[1]); } catch { return; }
    // Match `mask-size: cover; mask-position: center top` on About's mask.
    // Without an intrinsic size the cover geometry is unknown: draw nothing.
    const { naturalWidth, naturalHeight } = image;
    if (!naturalWidth || !naturalHeight) return;
    const cover = Math.max(width / naturalWidth, height / naturalHeight);
    const drawnWidth = naturalWidth * cover;
    const drawnHeight = naturalHeight * cover;
    const scale = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
    // Mask alpha for the rows next to one edge, ordered so the edge is last.
    const edgeRows = (atTop, sampleRows) => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(width * scale);
      canvas.height = sampleRows;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      context.setTransform(scale, 0, 0, scale, 0, 0);
      const offset = atTop ? 0 : -(height - sampleRows / scale);
      context.drawImage(image, (width - drawnWidth) / 2, offset, drawnWidth, drawnHeight);
      const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
      const alpha = new Uint8Array(canvas.width * canvas.height);
      for (let row = 0; row < sampleRows; row++) {
        const source = atTop ? sampleRows - 1 - row : row;
        for (let x = 0; x < canvas.width; x++) alpha[row * canvas.width + x] = data[(source * canvas.width + x) * 4 + 3];
      }
      return traceStripes(alpha, canvas.width, sampleRows);
    };
    // Each layer fails on its own: a problem with one never leaves the
    // other showing a clip computed for an older layout.
    const apply = (element, build) => {
      let path = '';
      try { path = build(); } catch { path = ''; }
      element.style.clipPath = path ? `path("${path}")` : '';
      element.toggleAttribute('data-ready', Boolean(path));
    };
    // Only when the mask really continues below About.
    apply(tails, () => drawnHeight > height + 1 ? stripeTailPath(edgeRows(false, 24), scale) : '');
    // Heads run up and off the left edge, passing behind the hero's buttons.
    // A taller sample steadies the angle over the longer continuation.
    if (heads) apply(heads, () => {
      const stage = heads.offsetParent;
      if (!stage) return '';
      heads.style.left = `${about.getBoundingClientRect().left - stage.getBoundingClientRect().left}px`;
      return stripeTailPath(edgeRows(true, 64), scale, { maxDepth: heads.offsetHeight, originY: heads.offsetHeight + 1, direction: -1, exitLeft: true });
    });
  }
  const schedule = () => { if (!pending) pending = requestAnimationFrame(update); };
  addEventListener('resize', schedule, { passive: true });
  if (typeof ResizeObserver === 'function') new ResizeObserver(schedule).observe(about);
  document.fonts?.ready.then(schedule);
  schedule();
})();
