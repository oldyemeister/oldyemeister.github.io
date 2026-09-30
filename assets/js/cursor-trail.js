// Seven motion echoes, nearest to furthest. Edit colors/timing here.
export const CURSOR_TRAIL = {
  enabled: false, // Set true and rebuild to restore the rainbow trail.
  colors: ['#ef453b', '#f49336', '#ffdc37', '#75bd52', '#43bfd3', '#4f7ee8', '#aa71d6'],
  spacingMs: 24,
  fadeMs: 240,
};

export function positionAt(history, time) {
  if (time <= history[0].time) return history[0];
  for (let index = 1; index < history.length; index++) {
    const next = history[index];
    if (next.time < time) continue;
    const previous = history[index - 1];
    const progress = (time - previous.time) / (next.time - previous.time || 1);
    return { x: previous.x + (next.x - previous.x) * progress, y: previous.y + (next.y - previous.y) * progress };
  }
  return history[history.length - 1];
}

export function initCursorTrail(document, window, settings = CURSOR_TRAIL) {
  if (!settings.enabled) return;
  if (document.querySelector('.cursor-afterimages')) return;
  const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let layer;
  let echoes = [];
  let history = [];
  let frame = 0;
  let lastMove = 0;
  const allowed = () => pointer.matches && !reduced.matches && !document.hidden && !document.pointerLockElement;

  function clear() {
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    history = [];
    if (layer) layer.hidden = true;
  }

  function create() {
    layer = document.createElement('div');
    layer.className = 'cursor-afterimages';
    layer.setAttribute('aria-hidden', 'true');
    echoes = settings.colors.map((color, index) => {
      // A decorative div avoids the site's scoped text-color rules for spans.
      const echo = document.createElement('div');
      echo.className = 'cursor-afterimage';
      echo.style.color = color;
      echo.style.zIndex = String(settings.colors.length - index);
      echo.innerHTML = '<svg viewBox="0 0 24 30" focusable="false" aria-hidden="true"><path d="M2 2v22l6-6 5 10 5-3-5-9h9Z" fill="currentColor" stroke="#080808" stroke-width="1.2" stroke-linejoin="round"/></svg>';
      layer.append(echo);
      return echo;
    });
    document.body.append(layer);
  }

  function draw(now) {
    frame = 0;
    if (!allowed() || now - lastMove >= settings.fadeMs) { clear(); return; }
    const lead = history[history.length - 1];
    const fade = Math.max(0, 1 - (now - lastMove) / settings.fadeMs);
    echoes.forEach((echo, index) => {
      const point = positionAt(history, now - (index + 1) * settings.spacingMs);
      // Suppress overlapping copies beneath a stationary/slow pointer.
      const separation = Math.min(1, Math.hypot(lead.x - point.x, lead.y - point.y) / 12);
      echo.style.transform = `translate3d(${point.x - 2}px, ${point.y - 2}px, 0)`;
      echo.style.opacity = String((0.9 - index * 0.055) * fade * separation);
    });
    layer.hidden = false;
    frame = window.requestAnimationFrame(draw);
  }

  document.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || !allowed() || event.target?.closest('input, textarea, [contenteditable="true"], iframe')) {
      clear();
      return;
    }
    const now = window.performance.now();
    const previous = history[history.length - 1];
    if (previous && previous.x === event.clientX && previous.y === event.clientY) return;
    if (!layer) create();
    lastMove = now;
    history.push({ x: event.clientX, y: event.clientY, time: now });
    // Bound both elapsed history and unusually high-frequency pointer devices.
    while (history.length > 2 && history[1].time < now - settings.fadeMs) history.shift();
    if (history.length > 120) history.splice(0, history.length - 120);
    if (!frame) frame = window.requestAnimationFrame(draw);
  }, { passive: true });
  document.addEventListener('pointerout', event => { if (!event.relatedTarget) clear(); }, { passive: true });
  document.addEventListener('pointercancel', clear, { passive: true });
  document.addEventListener('visibilitychange', clear);
  document.addEventListener('pointerlockchange', clear);
  document.addEventListener('keydown', clear);
  window.addEventListener('blur', clear);
  window.addEventListener('pagehide', clear);
  window.addEventListener('scroll', clear, { passive: true });
  pointer.addEventListener('change', clear);
  reduced.addEventListener('change', clear);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => initCursorTrail(document, window), { once: true });
  else initCursorTrail(document, window);
}
