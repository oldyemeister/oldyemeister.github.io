(() => {
  const menu = document.querySelector('body.persona-design [data-experience-save-menu]');
  if (!menu) return;
  const list = menu.querySelector('[role="listbox"]');
  const options = [...list.querySelectorAll('[role="option"]')];
  if (!options.length) return;
  const fillers = [...list.querySelectorAll('[data-experience-filler]')];
  const padded = fillers.length === 2;
  const rows = padded ? [fillers[0], ...options, fillers[1]] : options;
  const up = menu.querySelector('[data-experience-up]');
  const down = menu.querySelector('[data-experience-down]');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  // Recording: 15.850–16.200s, estimated 150–250ms active motion.
  // Easing is an adaptation, not an extracted engine constant.
  const timing = { duration: 200, easing: 'cubic-bezier(0.22, 0.8, 0.25, 1)' };
  const band = document.createElement('div');
  band.className = 'experience-save-band';
  band.setAttribute('aria-hidden', 'true');
  const stars = options[0].querySelector('.experience-save-stars');
  if (stars) band.append(stars.cloneNode(true));
  menu.insertBefore(band, list);
  let selected = 0;
  let first = 0;
  let shifts = [];
  let measuredWidth;
  const visibleReflections = new Set();
  function syncReflection() {
    menu.dataset.reflectionActive = String(!motion.matches && !document.hidden && visibleReflections.has(selected));
  }
  // Observe the circles themselves: a long menu can be partly visible while
  // its selected circle is offscreen. Unsupported observers keep it static.
  if ('IntersectionObserver' in window) {
    const spheres = options.map(option => option.querySelector('.experience-save-sphere'));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const index = spheres.indexOf(entry.target);
        if (entry.isIntersecting) visibleReflections.add(index);
        else visibleReflections.delete(index);
      });
      syncReflection();
    });
    spheres.forEach(sphere => observer.observe(sphere));
  }
  document.addEventListener('visibilitychange', syncReflection);
  const inWindow = row => {
    const index = rows.indexOf(row);
    return index >= first && index < first + 3;
  };
  function settle() {
    rows.forEach(row => {
      delete row.dataset.leaving;
      row.hidden = !inWindow(row);
      row.inert = row.hidden;
      if (options.includes(row)) row.removeAttribute('aria-hidden');
    });
    delete menu.dataset.moving;
  }
  function cancelShifts() {
    shifts.forEach(animation => animation.cancel());
    shifts = [];
    settle();
  }
  function positionBand() {
    const row = options[selected];
    menu.style.setProperty('--selected-row-top', `${list.offsetTop + row.offsetTop}px`);
    menu.style.setProperty('--selected-row-height', `${row.offsetHeight}px`);
  }
  function fitRows() {
    cancelShifts();
    menu.dataset.measuring = 'true';
    options.forEach(row => row.setAttribute('aria-selected', 'false'));
    const compact = Math.ceil(Math.max(...rows.map(row => row.offsetHeight)));
    // The phone layout expands only the selected role. Measure that state for
    // every role so changing to a longer title cannot move the fixed band.
    const height = Math.ceil(Math.max(...options.map(row => {
      row.setAttribute('aria-selected', 'true');
      const height = row.offsetHeight;
      row.setAttribute('aria-selected', 'false');
      return height;
    })));
    options[selected].setAttribute('aria-selected', 'true');
    menu.style.setProperty('--experience-row-height', `${height}px`);
    menu.style.setProperty('--experience-compact-height', `${compact}px`);
    menu.style.setProperty('--experience-visible-count', 3);
    delete menu.dataset.measuring;
    measuredWidth = list.getBoundingClientRect().width;
    positionBand();
  }
  function snapshot(row, listTop) {
    const rect = row.getBoundingClientRect();
    const sphere = row.querySelector('.experience-save-sphere');
    const disc = sphere.getBoundingClientRect();
    return { top: rect.top - listTop, height: rect.height,
      discX: disc.left + disc.width / 2 - rect.left,
      discY: disc.top + disc.height / 2 - rect.top,
      scale: disc.width / sphere.offsetWidth };
  }
  function select(index, focus = false, reveal = true) {
    const next = Math.max(0, Math.min(options.length - 1, index));
    if (menu.dataset.ready && next === selected) return;
    const previous = selected;
    const animate = menu.dataset.ready && !motion.matches;
    const listTop = list.getBoundingClientRect().top;
    // Capture the currently painted positions BEFORE cancellation. Reversals
    // and key repeat continue from the in-flight picture without jumping.
    const before = new Map(animate ? rows.filter(row => !row.hidden)
      .map(row => [row, snapshot(row, listTop)]) : []);
    cancelShifts();
    selected = next;
    first = padded ? selected : Math.max(0, Math.min(options.length - 3, selected - 1));
    rows.forEach((row, i) => {
      row.hidden = !inWindow(row);
      row.inert = row.hidden;
      row.dataset.position = ['first', 'middle', 'last'][i - first] || 'last';
    });
    options.forEach((option, i) => option.setAttribute('aria-selected', String(i === selected)));
    list.setAttribute('aria-activedescendant', options[selected].id);
    up.disabled = selected === 0;
    down.disabled = selected === options.length - 1;
    syncReflection();
    positionBand();
    if (focus) list.focus({ preventScroll: true });
    if (reveal) {
      const bounds = options[selected].getBoundingClientRect();
      if (bounds.top < 96 || bounds.bottom > window.innerHeight)
        options[selected].scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }
    if (!animate) return;
    const direction = Math.sign(selected - previous);
    const newTop = list.getBoundingClientRect().top;
    const listHeight = list.offsetHeight;
    const pitch = options[selected].offsetHeight;
    // Keep outgoing rows alive until they pass the clipping edge. They are
    // excluded from pointer and accessibility navigation during their exit.
    before.forEach((old, row) => {
      if (inWindow(row)) return;
      row.hidden = false;
      row.inert = true;
      row.setAttribute('aria-hidden', 'true');
      row.dataset.leaving = 'true';
      row.style.setProperty('--experience-exit-top', `${rows.indexOf(row) < first ? -old.height : listHeight}px`);
      row.style.setProperty('--experience-exit-height', `${old.height}px`);
    });
    menu.dataset.moving = 'true';
    rows.filter(row => !row.hidden).forEach(row => {
      const after = snapshot(row, newTop);
      const old = before.get(row);
      // Whole rows move: numeral, company mark, title, dates and bullets share
      // one transform. Unseen rows enter from beyond the window edge.
      const from = old ? old.top - after.top : direction * pitch;
      shifts.push(row.animate([
        { transform: `translateY(${from}px)` }, { transform: 'translateY(0px)' }
      ], timing));
      if (old) {
        const sphere = row.querySelector('.experience-save-sphere');
        shifts.push(sphere.animate([
          { transform: `translate(${old.discX - after.discX}px, calc(-50% + ${old.discY - after.discY}px)) scale(${old.scale})` },
          { transform: `translate(0px, -50%) scale(${after.scale})` }
        ], timing));
      }
    });
    const batch = shifts;
    Promise.all(batch.map(animation => animation.finished)).then(() => {
      if (shifts !== batch) return;
      shifts = [];
      settle();
    }).catch(() => {}); // Cancellation already settles or starts a newer batch.
  }
  options.forEach((option, index) => {
    option.id = `experience-option-${index + 1}`;
    option.setAttribute('aria-posinset', index + 1);
    option.setAttribute('aria-setsize', options.length);
    option.querySelector('.experience-save-number').textContent = String(index + 1);
    option.addEventListener('click', () => select(index, true));
  });
  if (padded) {
    fillers[0].querySelector('.experience-save-number').textContent = '0';
    fillers[1].querySelector('.experience-save-number').textContent = String(options.length + 1);
  }
  list.addEventListener('keydown', event => {
    const destinations = { ArrowUp: selected - 1, ArrowDown: selected + 1, Home: 0, End: options.length - 1 };
    if (!(event.key in destinations)) return;
    event.preventDefault();
    select(destinations[event.key]);
  });
  up.addEventListener('click', () => select(selected - 1, true));
  down.addEventListener('click', () => select(selected + 1, true));
  select(selected, false, false);
  menu.dataset.ready = 'true';
  fitRows();
  motion.addEventListener('change', () => {
    if (motion.matches) cancelShifts();
    syncReflection();
  });
  if ('ResizeObserver' in window) new ResizeObserver(() => {
    if (list.getBoundingClientRect().width !== measuredWidth) fitRows();
  }).observe(list);
  // Height-based desktop scaling also changes geometry without a width change.
  window.addEventListener('resize', fitRows);
  document.fonts?.ready.then(fitRows);
  window.addEventListener('pagehide', cancelShifts);
})();
