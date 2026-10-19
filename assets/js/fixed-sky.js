// Each scrolling SVG clips the same viewport-anchored cloud field; individual clouds drift horizontally.
// Cancel its parent's screen transform without moving the yellow/CRT artwork.
export function pinSkyToViewport(nodes) {
  const fields = [...nodes];
  let frame = 0;
  function paint() {
    frame = 0;
    const scale = Math.max(window.innerWidth / 1000, window.innerHeight / 700);
    const x = (window.innerWidth - 1000 * scale) / 2;
    const y = (window.innerHeight - 700 * scale) / 2;
    const projection = new DOMMatrix([scale, 0, 0, scale, x, y]);
    const transforms = fields.map(field => {
      const parent = field.parentElement.getScreenCTM();
      return parent ? new DOMMatrix([parent.a, parent.b, parent.c, parent.d, parent.e, parent.f])
        .inverse().multiply(projection) : null;
    });
    fields.forEach((field, index) => {
      const matrix = transforms[index];
      if (matrix) field.setAttribute('transform',
        `matrix(${matrix.a} ${matrix.b} ${matrix.c} ${matrix.d} ${matrix.e} ${matrix.f})`);
    });
  }
  const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
  // Also active under reduced motion: compensating scroll keeps the sky still.
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('pageshow', schedule);
  document.fonts?.ready.then(schedule);
  const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : null;
  fields.forEach(field => observer?.observe(field.ownerSVGElement));
  paint();
}
