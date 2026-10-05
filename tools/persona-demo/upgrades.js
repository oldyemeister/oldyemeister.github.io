// Persona upgrade study from the design review. Local preview only.
// Adds the few elements upgrades.css needs; html.p4-demo gates every change.
(() => {
  const root = document.documentElement;
  const path = location.pathname;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const on = () => root.classList.contains('p4-demo');

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'p4-demo-toggle';
  const labelToggle = () => {
    toggle.textContent = `P4 upgrades: ${on() ? 'ON' : 'OFF'}`;
    toggle.setAttribute('aria-pressed', String(on()));
  };
  toggle.addEventListener('click', () => {
    root.classList.toggle('p4-demo');
    try { localStorage.setItem('p4-demo', on() ? 'on' : 'off'); } catch {}
    labelToggle();
  });
  document.body.append(toggle);
  labelToggle();

  // Header calendar, from the visitor's clock. Weather would need a network
  // service, so the icon follows the time of day instead.
  const now = new Date();
  const hour = now.getHours();
  const night = hour < 6 || hour >= 19;
  const time = hour < 5 ? 'Midnight' : hour < 12 ? 'Morning' : hour < 17 ? 'Daytime' : hour < 21 ? 'Evening' : 'Late night';
  const icon = night
    ? '<path d="M15 3a9 9 0 1 0 6 15A8 8 0 0 1 15 3Z" fill="currentColor"/>'
    : '<circle cx="12" cy="12" r="5" fill="currentColor"/><g stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1"/></g>';
  document.querySelector('.nav-shell .nav-menu-button')?.insertAdjacentHTML('beforebegin', `
    <div class="p4-calendar" aria-hidden="true">
      <span class="p4-calendar-date">${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}</span>
      <span class="p4-calendar-day">${now.toLocaleDateString('en-US', { weekday: 'short' })}</span>
      <svg class="p4-calendar-icon" viewBox="0 0 24 24">${icon}</svg>
      <span class="p4-calendar-time">${time}</span>
    </div>`);

  // Leaving a game or article: the screen collapses to a line, then a dot,
  // like a CRT switching off. Entering them, and same-page anchors, keep the
  // site's own wipe.
  const projectPage = path.startsWith('/projects/');
  function switchOff() {
    const screen = document.createElement('div');
    screen.className = 'p4-transition';
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
  // True when the previous history entry is the homepage, so going back
  // restores the exact scroll position instead of reloading at the hero.
  function cameFromHome() {
    const entries = window.navigation?.entries?.();
    const index = window.navigation?.currentEntry?.index;
    if (entries && index > 0) {
      const previous = new URL(entries[index - 1].url);
      return previous.origin === location.origin && previous.pathname === '/';
    }
    try {
      const referrer = new URL(document.referrer);
      return referrer.origin === location.origin && referrer.pathname === '/' && history.length > 1;
    } catch { return false; }
  }
  document.addEventListener('click', event => {
    if (!on() || !projectPage) return;
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
        link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || url.pathname === path) return;
    const back = url.pathname === '/' && cameFromHome();
    if (reduced.matches && !back) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    (reduced.matches ? Promise.resolve() : switchOff())
      .then(() => { if (back) history.back(); else location.href = url.href; });
  }, true);
  // Returning with the back button restores the page from cache; clear the black.
  addEventListener('pageshow', event => {
    if (event.persisted) document.querySelectorAll('.p4-transition').forEach(element => element.remove());
  });
})();
