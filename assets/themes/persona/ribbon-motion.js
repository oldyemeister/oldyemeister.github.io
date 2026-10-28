// Persona-only motion adapter. The shared menu retains navigation/accessibility
// and its original-route animation; this adapter owns the observed fan/gather.
window.createPersonaRibbonMotion = ({ nav, paths, bands, groupSize, links, hints,
  description, waveSvg, drawWaves, geometry }) => {
  // Website pacing: more visible samples on 20–30fps devices, while keeping
  // elapsed-time motion consistent across refresh rates.
  const OPEN_MS = 480;
  const CLOSE_MS = 360;
  const clamp = x => Math.max(0, Math.min(1, x));
  const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
  let current;
  let velocity = [];
  let frame = 0;
  let targetOpen = false;
  let previousTime;
  let wavesDirty = true;
  let waveBounds;
  const core = i => i === groupSize - 1 || i === groupSize;
  function settled() {
    return geometry().renderedBands.map(([x, width], i) => ({ x, width, bow: 0, alpha: bands[i][3] }));
  }
  function entrance() {
    const { viewportWidth: width, menuWidth } = geometry();
    const bend = Math.min(220, width * .2);
    const gap = Math.min(9, menuWidth * .022);
    return settled().map((p, i) => {
      const left = i < groupSize;
      return { x: left ? -bend - p.width - 30 - (groupSize - 1 - i) * gap
        : width + bend + 30 + (i - groupSize) * gap,
        width: p.width * .65, bow: (left ? 1 : -1) * bend,
        alpha: p.alpha * (core(i) ? .35 : 1) };
    });
  }
  function exit() {
    const { viewportWidth: width, menuWidth } = geometry();
    const bend = Math.min(220, width * .2);
    const gap = Math.min(10, menuWidth * .025);
    // Split at the core seam: each half clears its own screen edge.
    return settled().map((p, i) => ({
      x: i < groupSize ? -bend - p.width * .55 - 40 - (groupSize - 1 - i) * gap
        : width + bend + 40 + (i - groupSize) * gap,
      width: p.width * .55, bow: 0, alpha: p.alpha * (core(i) ? 0 : .7) }));
  }
  function paint() {
    document.body.style.setProperty('--menu-chrome-progress', current.chrome);
    current.bands.forEach(({ x, width, bow, alpha }, i) => {
      const right = x + width;
      // Continuous curved edges, with tangent continuity at the middle.
      // Overscan keeps ribbon ends beyond the viewport at every phase.
      paths[i].setAttribute('d', `M ${x} -100
        C ${x + bow * .8} -40 ${x + bow} 100 ${x + bow} 320
        C ${x + bow} 540 ${x + bow * .8} 680 ${x} 740
        L ${right} 740
        C ${right + bow * .8} 680 ${right + bow} 540 ${right + bow} 320
        C ${right + bow} 100 ${right + bow * .8} -40 ${right} -100 Z`);
      paths[i].style.opacity = clamp(alpha);
    });
    links.forEach((link, i) => {
      link.style.opacity = current.labels[i];
      link.style.translate = `0 ${(1 - current.labels[i]) * 6}px`;
    });
    hints.style.opacity = description.style.opacity = current.help;
    hints.style.translate = description.style.translate = `0 ${(1 - current.help) * 6}px`;
    // Lobe paths depend only on the settled geometry. Do not rebuild hundreds
    // of wave points on every animation frame; reveal their cached layer late.
    const resting = geometry().renderedBands;
    const bounds = [...resting[groupSize - 1], ...resting[groupSize]];
    // The first measure can happen while nav is display:none. Refresh once
    // its real core bounds are known on opening, not on every motion frame.
    if (wavesDirty || bounds.some((value, i) => value !== waveBounds?.[i])) {
      const edge = i => [resting[i][0], resting[i][0] + resting[i][1]];
      drawWaves(edge(groupSize - 1), edge(groupSize), 1);
      waveBounds = bounds;
      wavesDirty = false;
    }
    waveSvg.style.opacity = current.waves;
  }
  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    previousTime = undefined;
  }
  function snap(open) {
    stop();
    current = { bands: open ? settled() : entrance(), labels: links.map(() => Number(open)),
      help: Number(open), waves: Number(open), chrome: Number(open), amount: Number(open) };
    velocity = [];
    paint();
    nav.hidden = !open;
  }
  function setOpen(open, reduced) {
    const wasHidden = nav.hidden || !current || current.amount === 0;
    targetOpen = open;
    if (reduced || (!open && wasHidden)) { snap(open); return; }
    stop();
    if (open && wasHidden) {
      current = { bands: entrance(), labels: links.map(() => 0), help: 0, waves: 0, chrome: 0, amount: 0 };
      velocity = [];
    }
    const from = current;
    const to = open ? settled() : exit();
    const initialVelocity = velocity;
    const duration = (open ? OPEN_MS : CLOSE_MS) * Math.max(.45, open ? 1 - from.amount : from.amount);
    const bend = Math.min(220, geometry().viewportWidth * .2);
    const fanGap = Math.min(18, geometry().menuWidth * .045);
    let start;
    const tick = time => {
      if (start === undefined) start = time;
      const t = clamp((time - start) / duration);
      const dt = previousTime === undefined ? 0 : time - previousTime;
      previousTime = time;
      const before = current;
      // Cubic Hermite interpolation preserves velocity when interrupted and
      // lands with zero velocity. A fresh entrance decelerates from the edge.
      const mix = (a, b, v = 0) => (2*t**3 - 3*t*t + 1)*a
        + (t**3 - 2*t*t + t)*v*duration + (-2*t**3 + 3*t*t)*b;
      const nextBands = from.bands.map((p, i) => {
        const q = to[i], v = initialVelocity[i];
        const fresh = open && wasHidden;
        const value = key => mix(p[key], q[key], v?.[key] ?? (fresh ? 3*(q[key]-p[key])/duration : 0));
        // Fringe ribbons separate while the core gathers. The gap envelope
        // has zero velocity at both ends, so it never pops on or off.
        const distanceFromCore = i < groupSize ? i - groupSize + 1 : i - groupSize;
        const fan = distanceFromCore * fanGap * Math.sin(Math.PI*t)**2;
        return { x: value('x') + fan, width: Math.max(.1, value('width')),
          bow: value('bow') + (open ? 0 : (i < groupSize ? -1 : 1)*bend*Math.sin(Math.PI*t)**2),
          alpha: clamp(value('alpha')) };
      });
      const labelReveal = open ? smooth((t - .42) / .48) : smooth(t / .38);
      const helpReveal = open ? smooth((t - .65) / .35) : smooth(t / .28);
      const waveReveal = open ? smooth((t - .82) / .18) : smooth(t / .2);
      const toward = (a, b, f) => a + (b - a)*f;
      current = { bands: nextBands,
        labels: from.labels.map(a => toward(a, Number(open), labelReveal)),
        help: toward(from.help, Number(open), helpReveal),
        waves: toward(from.waves, Number(open), waveReveal),
        chrome: toward(from.chrome, Number(open), smooth(t)),
        amount: toward(from.amount, Number(open), t) };
      if (dt > 0) velocity = nextBands.map((p, i) => Object.fromEntries(
        ['x', 'width', 'bow', 'alpha'].map(key => [key, (p[key] - before.bands[i][key]) / dt])));
      paint();
      if (t < 1) frame = requestAnimationFrame(tick);
      else { frame = 0; previousTime = undefined; velocity = []; if (!open) nav.hidden = true; }
    };
    // Keep the exact painted frame on reversal; no geometry update here.
    frame = requestAnimationFrame(tick);
  }
  return { setOpen, redraw() { wavesDirty = true; snap(targetOpen); } };
};
