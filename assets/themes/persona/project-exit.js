// Leaving a game or article page. The screen collapses to a line, then a dot,
// like a CRT switching off; entering these pages keeps interface.js's wipe.
// Returning to the homepage goes back in history when the visitor came from
// it, so the browser restores their exact scroll position instead of loading
// at the hero and scrolling down to #projects.
(() => {
  const basePath = document.body.dataset.personaBase || '/persona/';
  if (!location.pathname.startsWith(`${basePath}projects/`)) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');

  function cameFromHome() {
    const entries = window.navigation?.entries?.();
    const index = window.navigation?.currentEntry?.index;
    if (entries && index > 0) {
      const previous = new URL(entries[index - 1].url);
      return previous.origin === location.origin && previous.pathname === basePath;
    }
    try {
      const referrer = new URL(document.referrer);
      return referrer.origin === location.origin && referrer.pathname === basePath && history.length > 1;
    } catch { return false; }
  }

  function switchOff() {
    const screen = document.createElement('div');
    screen.className = 'page-switch-off';
    screen.setAttribute('aria-hidden', 'true');
    const beam = document.createElement('i');
    screen.append(beam);
    document.body.append(screen);
    screen.animate([{ background: 'rgb(8 8 8 / 0)' }, { background: 'rgb(8 8 8 / 1)' }], { duration: 160, fill: 'forwards' });
    const collapse = beam.animate([
      { transform: 'scale(1, 1)', opacity: 0 },
      { transform: 'scale(1, 1)', opacity: .85, offset: .15 },
      { transform: 'scale(1, .004)', opacity: 1, offset: .55 },
      { transform: 'scale(0, .004)', opacity: 1 }
    ], { duration: 480, easing: 'cubic-bezier(.6, 0, .4, 1)', fill: 'forwards' });
    // Hidden tabs may hold the animation; never strand the visitor.
    return Promise.race([collapse.finished, new Promise(resolve => setTimeout(resolve, 650))]);
  }

  // Capture phase, so this runs before interface.js; it skips handled clicks.
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
        link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || url.pathname === location.pathname ||
        !url.pathname.startsWith(basePath) || url.pathname.startsWith('/original/')) return;
    const back = url.pathname === basePath && cameFromHome();
    if (motion.matches && !back) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    (motion.matches ? Promise.resolve() : switchOff())
      .then(() => {
        // The screen is now black; the next page fades in from black too
        // (arrival.js) instead of appearing at once.
        if (!motion.matches) {
          try { sessionStorage.setItem('persona-screen-return', String(Date.now())); }
          catch { /* Without storage the next page simply appears. */ }
        }
        if (back) history.back(); else location.assign(url.href);
      });
  }, true);

  // Restored from the back/forward cache: clear the switched-off screen.
  addEventListener('pageshow', event => {
    if (event.persisted) document.querySelectorAll('.page-switch-off').forEach(screen => screen.remove());
  });
})();
