// Run before first paint to bridge two real pages without exposing the new page
// underneath an unfinished transition. Never leave a page covered on failure.
(() => {
  const root = document.documentElement;
  let linkedArrival = false;
  try {
    const arrival = JSON.parse(sessionStorage.getItem('persona-arrival') || 'null');
    sessionStorage.removeItem('persona-arrival');
    linkedArrival = arrival?.url === location.href && Date.now() - arrival.time < 15000;
  } catch { /* Storage can be unavailable; navigation still works. */ }
  if (linkedArrival && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.classList.add('persona-arriving');
    window.personaArrivalTimeout = setTimeout(() => root.classList.remove('persona-arriving'), 2000);
  }
  // After a project page's CRT switch-off (project-exit.js) the screen is
  // black, so the page fades in from black rather than appearing at once.
  // A freshly loaded page reads the note left by the switch-off; a page
  // restored from the back/forward cache put the black on as it was left
  // (hidden behind the outgoing wipe), so it never flashes before the fade.
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const SCREEN_RETURN = 'persona-screen-return';
  const SCREEN_FADING = 'persona-screen-fading';
  try {
    const leftAt = Number(sessionStorage.getItem(SCREEN_RETURN));
    sessionStorage.removeItem(SCREEN_RETURN);
    if (Date.now() - leftAt < 15000 && !reduced.matches) root.classList.add(SCREEN_RETURN);
  } catch { /* Without storage the page simply appears. */ }
  addEventListener('pagehide', () => {
    if (!reduced.matches) root.classList.add(SCREEN_RETURN);
  });
  addEventListener('pageshow', event => {
    try { sessionStorage.removeItem(SCREEN_RETURN); } catch { /* Nothing to clear. */ }
    if (!root.classList.contains(SCREEN_RETURN)) return;
    // Restored without a switch-off (e.g. the browser's Back button): the
    // same short fade still applies, from the black it was cached with.
    root.classList.remove(SCREEN_FADING);
    // Let the black paint once, then fade it; timers also run in hidden tabs.
    setTimeout(() => root.classList.add(SCREEN_FADING), 30);
    setTimeout(() => root.classList.remove(SCREEN_RETURN, SCREEN_FADING), 30 + 750);
  });
  // Land on a #section instantly: smooth scrolling would otherwise show the
  // top of the page first, then scroll down to the section.
  if (location.hash) {
    root.style.scrollBehavior = 'auto';
    addEventListener('load', () => setTimeout(() => root.style.removeProperty('scroll-behavior'), 0), { once: true });
  }
})();
