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
})();
