(() => {
  const menu = document.querySelector('[data-experience-save-menu]');
  if (!menu) return;
  const list = menu.querySelector('[role="listbox"]');
  const options = [...list.querySelectorAll('[role="option"]')];
  const up = menu.querySelector('[data-experience-up]');
  const down = menu.querySelector('[data-experience-down]');
  if (!options.length) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const SHIFT_DURATION = 440;
  const SHIFT_EASING = 'cubic-bezier(0.25, 0.8, 0.25, 1)';
  const SLIDE_DURATION = 520;
  const SLIDE_EASING = 'cubic-bezier(0.22, 0.8, 0.25, 1)';
  const SLIDE_DISTANCE = 160;
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
    menu.style.setProperty('--experience-visible-count', 3);
    delete menu.dataset.measuring;
    measuredWidth = list.getBoundingClientRect().width;
    positionControls();
  }
  function select(index, focus = false, reveal = true) {
    const next = Math.max(0, Math.min(options.length - 1, index));
    if (menu.dataset.ready === 'true' && next === selected) return;
    const previousSelection = selected;
    const animate = menu.dataset.ready === 'true' && !motion.matches;
    const listTop = animate ? list.getBoundingClientRect().top : 0;
    const previousCopies = new Map(animate ? options.filter(row => !row.hidden).map(row =>
      [row, row.querySelector('.experience-save-copy').getBoundingClientRect().top - listTop]) : []);
    cancelShifts();
    selected = next;
    first = selected - 1;
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
      const direction = Math.sign(selected - previousSelection);
      const rowHeight = options[selected].offsetHeight;
      const newListTop = list.getBoundingClientRect().top;
      shifts.push(...options.filter(row => !row.hidden).map(row => {
        const copy = row.querySelector('.experience-save-copy');
        const oldTop = previousCopies.get(row);
        const distance = oldTop === undefined
          ? direction * rowHeight
          : oldTop - (copy.getBoundingClientRect().top - newListTop);
        const from = Math.max(-SLIDE_DISTANCE, Math.min(SLIDE_DISTANCE, distance));
        return copy.animate([
          { top: `${from}px`, opacity: 1 },
          { top: '0px', opacity: 1 }
        ], { duration: SLIDE_DURATION, easing: SLIDE_EASING });
      }));
      // Squash and stretch around fixed centers, preserving the selected size.
      shifts.push(...options.filter(row => !row.hidden).flatMap(row => {
        const scale = row === options[selected] ? 1.3 : 1;
        const shape = (x, y) => `translateY(-50%) scale(${scale * x}, ${scale * y})`;
        const number = row.querySelector('.experience-save-number').animate([
          { transform: 'rotate(20deg) scale(0.88)' },
          { transform: 'rotate(15deg) scale(1.09)', offset: .35 },
          { transform: 'rotate(23deg) scale(0.98)', offset: .65 },
          { transform: 'rotate(20deg) scale(1)' }
        ], { duration: SHIFT_DURATION, easing: SHIFT_EASING });
        const sphere = row.querySelector('.experience-save-sphere').animate([
          { transform: shape(1, 1) },
          { transform: shape(1.12, .86), offset: .18 },
          { transform: shape(.92, 1.10), offset: .40 },
          { transform: shape(1.045, .96), offset: .64 },
          { transform: shape(.985, 1.02), offset: .82 },
          { transform: shape(1, 1) }
        ], { duration: SHIFT_DURATION, easing: SHIFT_EASING });
        return [number, sphere];
      }));
    }
  }
  list.addEventListener('keydown', event => {
    const destinations = { ArrowUp: selected - 1, ArrowDown: selected + 1, Home: 0, End: options.length - 1 };
    if (!(event.key in destinations)) return;
    event.preventDefault();
    select(destinations[event.key]);
  });
  function vibrate(button) {
    if (motion.matches) return;
    button.getAnimations?.().forEach(animation => animation.cancel());
    button.animate([
      { transform: 'translateX(0) rotate(0)' },
      { transform: 'translateX(-3px) rotate(-6deg)', offset: .22 },
      { transform: 'translateX(3px) rotate(5deg)', offset: .48 },
      { transform: 'translateX(-2px) rotate(-3deg)', offset: .72 },
      { transform: 'translateX(0) rotate(0)' }
    ], { duration: 260, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
  }
  up.addEventListener('click', () => { select(selected - 1, true); vibrate(up); });
  down.addEventListener('click', () => { select(selected + 1, true); vibrate(down); });
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
