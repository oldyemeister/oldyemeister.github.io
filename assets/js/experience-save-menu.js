(() => {
  const menu = document.querySelector('[data-experience-save-menu]');
  if (!menu) return;
  const list = menu.querySelector('[role="listbox"]');
  const options = [...list.querySelectorAll('[role="option"]')];
  const up = menu.querySelector('[data-experience-up]');
  const down = menu.querySelector('[data-experience-down]');
  if (!options.length) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const SHIFT_DURATION = 240;
  const SHIFT_EASING = 'cubic-bezier(0.25, 0.8, 0.25, 1)';
  const SHIFT_DISTANCE = 24;
  let shifts = [];
  function cancelShifts() {
    shifts.forEach(animation => animation.cancel());
    shifts = [];
  }
  motion.addEventListener('change', () => { if (motion.matches) cancelShifts(); });
  let selected = Math.min(1, options.length - 1);
  let first = 0;
  options.forEach((option, index) => {
    option.id = `experience-option-${index + 1}`;
    option.setAttribute('aria-posinset', index + 1);
    option.setAttribute('aria-setsize', options.length);
    option.querySelector('.experience-save-number').textContent = String(index + 1);
    option.addEventListener('click', () => select(index, true));
  });
  function positionControls() {
    const row = options[selected];
    menu.style.setProperty('--selected-row-top', `${row.offsetTop}px`);
    menu.style.setProperty('--selected-row-height', `${row.offsetHeight}px`);
  }
  let measuredWidth;
  function fitRows() {
    cancelShifts();
    // Measure every entry invisibly at the same width, including paged-out rows.
    // Reserve the tallest height once per resize/font load, never per selection.
    menu.dataset.measuring = 'true';
    const height = Math.ceil(Math.max(...options.map(row => row.offsetHeight)));
    menu.style.setProperty('--experience-row-height', `${height}px`);
    menu.style.setProperty('--experience-visible-count', Math.min(3, options.length));
    delete menu.dataset.measuring;
    measuredWidth = list.getBoundingClientRect().width;
    positionControls();
  }
  function select(index, focus = false, reveal = true) {
    const next = Math.max(0, Math.min(options.length - 1, index));
    if (menu.dataset.ready === 'true' && next === selected) return;
    const previousSelection = selected;
    const animate = menu.dataset.ready === 'true' && !motion.matches;
    // Capture the current visual positions before cancelling an interrupted shift.
    const listTop = animate ? list.getBoundingClientRect().top : 0;
    const previousPositions = new Map(animate ? options.filter(row => !row.hidden)
      .map(row => [row, row.getBoundingClientRect().top - listTop]) : []);
    cancelShifts();
    selected = next;
    first = Math.max(0, Math.min(selected - 1, options.length - 3));
    options.forEach((option, i) => {
      option.hidden = i < first || i >= first + 3;
      option.setAttribute('aria-selected', String(i === selected));
      option.dataset.position = i < selected ? 'above' : i > selected ? 'below' : 'selected';
    });
    list.setAttribute('aria-activedescendant', options[selected].id);
    up.disabled = selected === 0;
    down.disabled = selected === options.length - 1;
    positionControls();
    if (focus) list.focus({ preventScroll: true });
    if (reveal) {
      const bounds = options[selected].getBoundingClientRect();
      if (bounds.top < 96 || bounds.bottom > window.innerHeight)
        options[selected].scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }
    if (animate && selected !== previousSelection) {
      const top = list.getBoundingClientRect().top;
      const direction = Math.sign(selected - previousSelection);
      // Batch layout reads before starting transform-only animations.
      const moves = options.filter(row => !row.hidden).map(row => {
        const rect = row.getBoundingClientRect();
        const from = previousPositions.has(row)
          ? previousPositions.get(row) - (rect.top - top)
          : direction * rect.height;
        return { row, from: Math.max(-SHIFT_DISTANCE, Math.min(SHIFT_DISTANCE, from)) };
      });
      shifts = moves.filter(({ from }) => Math.abs(from) > .5).map(({ row, from }) =>
        row.animate([{ transform: `translateY(${from}px)` }, { transform: 'translateY(0)' }],
          { duration: SHIFT_DURATION, easing: SHIFT_EASING }));
    }
  }
  list.addEventListener('keydown', event => {
    const destinations = { ArrowUp: selected - 1, ArrowDown: selected + 1, Home: 0, End: options.length - 1 };
    if (!(event.key in destinations)) return;
    event.preventDefault();
    select(destinations[event.key]);
  });
  up.addEventListener('click', () => select(selected - 1, true));
  down.addEventListener('click', () => select(selected + 1, true));
  fitRows();
  select(selected, false, false);
  menu.dataset.ready = 'true';
  if ('ResizeObserver' in window) new ResizeObserver(() => {
    if (list.getBoundingClientRect().width !== measuredWidth) fitRows();
  }).observe(list);
  else window.addEventListener('resize', fitRows);
  document.fonts?.ready.then(fitRows);
  window.addEventListener('pagehide', cancelShifts);
})();
