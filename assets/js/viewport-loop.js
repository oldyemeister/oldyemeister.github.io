export function createViewportLoop(element, onFrame, onResume = () => {}) {
  let frameId = 0;
  let inViewport = false;
  let running = false;
  element.dataset.rendering = 'paused';

  function frame(time) {
    if (!running) return;
    onFrame(time);
    frameId = requestAnimationFrame(frame);
  }

  function sync() {
    const shouldRun = inViewport && !document.hidden;
    if (shouldRun === running) return;
    running = shouldRun;
    element.dataset.rendering = running ? 'active' : 'paused';
    if (running) {
      onResume(performance.now());
      frameId = requestAnimationFrame(frame);
    } else cancelAnimationFrame(frameId);
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      inViewport = entry.isIntersecting;
      sync();
    }, { threshold: 0.01 });
    observer.observe(element);
  } else inViewport = true;

  document.addEventListener('visibilitychange', sync);
  sync();
}
