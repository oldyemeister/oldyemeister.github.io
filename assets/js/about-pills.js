(() => {
  function initializePills(field) {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const columns = Array.from({ length: 22 }, () => {
    const column = document.createElement('div');
    column.className = 'about-pill-column';
    const pills = Array.from({ length: 6 }, () => {
      const pill = document.createElement('span');
      pill.className = 'about-pill';
      column.append(pill);
      return pill;
    });
    field.append(column);
    return pills;
  });
  function randomize() {
    const counts = columns.map(() => 2 + Math.floor(Math.random() * 5));
    // Write all columns together, with no geometry reads or node rebuilding.
    columns.forEach((pills, column) => pills.forEach((pill, row) => {
      pill.style.visibility = row < counts[column] ? 'visible' : 'hidden';
    }));
  }
  randomize();
  let visible = !('IntersectionObserver' in window);
  let timer;
  function sync() {
    clearInterval(timer);
    timer = undefined;
    if (visible && !document.hidden && !motion.matches) timer = setInterval(randomize, 300);
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    }).observe(field);
  }
  motion.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pagehide', () => clearInterval(timer));
  window.addEventListener('pageshow', sync);
  sync();
  }
  document.querySelectorAll('#education .education-pill-field, #skills .skills-pill-field').forEach(initializePills);
})();
