// Animate only visible screens; the CSS texture also works without JavaScript.
(() => {
  // SVG pattern height is an attribute, not a CSS geometry property.
  // Read the same spacing token used by the project-media gradient.
  const spacing = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--crt-line-spacing'));
  if (Number.isFinite(spacing) && spacing > 0) {
    document.querySelectorAll('.hero-crt-pattern').forEach(pattern => {
      pattern.setAttribute('height', String(spacing));
    });
  }
  const screens = [...document.querySelectorAll(
    '#projects .project-media picture, .hero-reference-art, .hero-header-art'
  )];
  const visible = new Set();
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  function sync() {
    screens.forEach(screen => {
      screen.dataset.crtActive = String(visible.has(screen) && !document.hidden && !motion.matches);
    });
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) visible.add(target);
        else visible.delete(target);
      });
      sync();
    });
    screens.forEach(screen => observer.observe(screen));
  }
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', sync);
  sync();
})();
