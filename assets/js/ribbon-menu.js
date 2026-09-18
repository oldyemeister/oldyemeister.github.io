(() => {
  const trigger = document.querySelector('[data-ribbon-trigger]');
  const nav = document.querySelector('[data-navigation]');
  if (!trigger || !nav) return;
  const hudTriggers = [...document.querySelectorAll('[data-hud-menu-toggle]')];
  // Animation speed: 1.25 is 25% faster. Durations below are milliseconds.
  const MENU_SPEED = 1.0;
  // Entry curvature and temporary space between neighboring bands.
  const RIBBON_BEND = 1.6;
  const RIBBON_GAP = 180; // Maximum moving gap in pixels; scales down on narrow screens.
  const OPEN_DURATION = 600 / MENU_SPEED;
  const CLOSE_DURATION = 420 / MENU_SPEED;
  const links = [...nav.querySelectorAll('a')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.classList.add('menu-ribbons');
  svg.setAttribute('viewBox', '0 0 520 640');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  // [relative width, reference color, opacity], ordered left to right.
  // The settled reference has a broad yellow/orange core framed by fine
  // olive, lime, ivory, green and cyan lines. Widths are normalized below.
  // Split the two moving bundles between the yellow and orange core bands.
  const stripes = [
    [2, '#f9ad5d', .50],
    [2, '#000000', .00],
    [5, '#f9ad5d', .50],
    [2, '#000000', .00],
    [2, '#827B24', .35],
    [3, '#F6EBA0', .65],
    [3, '#A31C08', .85],
    [4, '#FFFDE0', 1],
    [6, '#D5F318', .95],
    [5, '#687D18', .80],
    [8, '#C6EE10', .95],
    [4, '#FFFFB0', 1],
    [12, '#F4D51C', .95],
    [53, '#FFF52B', .97],
    [36, '#FFAD08', 1],
    [14, '#FF6500', 1],
    [3, '#FFFAC1', 1],
    [5, '#E1FF00', 1],
    [4, '#009B3A', 1],
    [5, '#FFD229', 1],
    [3, '#FFFCE0', 1],
    [8, '#20C9D3', 1],
    [6, '#BEE617', .95],
    [3, '#FFFFEB', 1],
    [2, '#f7e55b', .00],
    [5, '#f9ad5d', .50],
    [2, '#f7e55b', .00],
    [2, '#f9ad5d', .50],
  ];
  const groupSize = stripes.length / 2;
  const totalWidth = stripes.reduce((sum, [width]) => sum + width, 0);
  let edge = 22;
  const bands = stripes.map(([units, color, opacity]) => {
    const width = units * 480 / totalWidth;
    const band = [edge, width, color, opacity];
    edge += width;
    return band;
  });
  const paths = bands.map(([, , color, opacity]) => {
    const path = document.createElementNS(ns, 'path');
    path.style.fill = color;
    path.style.opacity = opacity;
    svg.append(path);
    return path;
  });
  nav.prepend(svg);
  // A body-level fixed layer escapes the sticky header's stacking context.
  document.body.append(nav);
  nav.classList.add('ribbon-navigation');
  const closeButton = document.createElement('button');
  closeButton.className = 'ribbon-menu-close';
  closeButton.type = 'button';
  closeButton.textContent = '×';
  closeButton.setAttribute('aria-label', 'Close navigation');
  nav.append(closeButton);
  links.forEach(link => {
    const word = document.createElement('span');
    word.className = 'menu-word';
    word.textContent = link.textContent;
    link.replaceChildren(word);
  });
  const hints = document.createElement('div');
  hints.className = 'menu-input-hints';
  hints.setAttribute('role', 'group');
  hints.setAttribute('aria-label', 'Menu keyboard instructions');
  for (const [keys, action] of [[['↑', '↓'], 'Navigate'], [['Enter'], 'Open'], [['Esc'], 'Close']]) {
    const group = document.createElement('span');
    group.className = 'menu-input-hint';
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', `${action}: ${action === 'Navigate' ? 'Up or Down arrow' : keys[0]}`);
    for (const key of keys) {
      const symbol = document.createElement('kbd');
      symbol.className = action === 'Navigate' ? 'menu-hint-arrow' : 'menu-hint-key';
      symbol.textContent = key;
      symbol.setAttribute('aria-hidden', 'true');
      group.append(symbol);
    }
    const label = document.createElement('span');
    label.textContent = action;
    label.setAttribute('aria-hidden', 'true');
    group.append(label);
    hints.append(group);
  }
  nav.append(hints);
  const description = document.createElement('p');
  description.className = 'menu-selection-description';
  description.setAttribute('role', 'status');
  description.setAttribute('aria-live', 'polite');
  description.setAttribute('aria-atomic', 'true');
  nav.append(description);
  function describe(link) {
    description.textContent = link?.dataset?.menuDescription || link?.textContent || '';
  }
  let selectedLink;
  function select(link) {
    if (!link) return;
    if (selectedLink !== link) selectedLink?.removeAttribute('data-menu-selected');
    selectedLink = link;
    link.setAttribute('data-menu-selected', 'true');
    describe(link);
  }
  select(links[0]);
  links.forEach(link => {
    // Pointer selection shares focus with arrow navigation and Enter activation.
    link.addEventListener('pointerenter', () => link.focus({ preventScroll: true }));
    link.addEventListener('focus', () => select(link));
    link.addEventListener('pointerleave', () => select(links.includes(document.activeElement) ? document.activeElement : selectedLink));
  });
  let progress = 0;
  let open = false;
  let frame = 0;
  let previousTime;
  let bendPolarity = 1;
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };

  let viewportWidth = window.innerWidth;
  let menuLeft = 0;
  let menuWidth = 480;
  let renderedBands = [];
  let renderedSeam = 0;
  function measure() {
    const rect = nav.getBoundingClientRect();
    viewportWidth = window.innerWidth;
    menuLeft = rect.left;
    menuWidth = rect.width;
    const scale = menuWidth / 520;
    // Original menu thickness, with a minimum of two rendered pixels.
    const widths = bands.map(([, width]) => Math.max(2, width * scale));
    let edge = menuLeft + 262 * scale - widths.reduce((sum, width) => sum + width, 0) / 2;
    renderedBands = widths.map(width => {
      const band = [edge, width];
      edge += width;
      return band;
    });
    renderedSeam = renderedBands[groupSize][0];
    svg.setAttribute('viewBox', `0 0 ${viewportWidth} 640`);
    svg.style.left = `${-menuLeft}px`;
  }

  function draw() {
    // Chrome uses the same reversible timeline as the ribbons.
    document.body.style.setProperty('--menu-chrome-progress', 1 - (1 - progress) ** 3);
    bands.forEach((band, index) => {
      const direction = index < groupSize ? -1 : 1;
      // Both groups enter already curved. Their parallel bands have small
      // gaps that close as the curves straighten, rather than bending mid-flight.
      const delay = direction < 0 ? 0 : .025;
      const t = clamp((progress - delay) / (1 - delay));
      // Cubic ease-in-out: accelerate into the sweep, then settle smoothly.
      const arrival = t < .5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
      const curved = 1 - smooth((t - .2) / .8);
      const [destination, stripeWidth] = renderedBands[index];
      const seam = renderedSeam;
      const maxBow = Math.min(240, viewportWidth * .26) * RIBBON_BEND;
      const gap = RIBBON_GAP * Math.min(1, menuWidth / 400) * curved;
      const separation = (index % groupSize - (groupSize - 1) / 2) * gap;
      const clearance = maxBow + groupSize * RIBBON_GAP + 60;
      const travel = direction < 0 ? -seam - clearance : viewportWidth - seam + clearance;
      const left = destination + travel * (1 - arrival) + separation;
      const right = left + stripeWidth;
      // Closing reverses the arches: left bands become ( and right bands ).
      // Interpolate polarity so reversing mid-flight does not snap the paths.
      const bow = -direction * maxBow * curved * bendPolarity;
      const top = -20;
      const bottom = 660;
      paths[index].setAttribute('d', `M ${left} ${top}
        C ${left + bow} 20, ${left + bow} 80, ${left + bow} 160
        C ${left + bow} 210, ${left + bow} 230, ${left + bow} 320
        C ${left + bow} 410, ${left + bow} 430, ${left + bow} 480
        C ${left + bow} 560, ${left + bow} 620, ${left} ${bottom}
        L ${right} ${bottom}
        C ${right + bow} 620, ${right + bow} 560, ${right + bow} 480
        C ${right + bow} 430, ${right + bow} 410, ${right + bow} 320
        C ${right + bow} 230, ${right + bow} 210, ${right + bow} 160
        C ${right + bow} 80, ${right + bow} 20, ${right} ${top} Z`);

    });
    // Fit all labels into the same timeline, even when navigation grows.
    const labelStagger = Math.min(.045, .135 / Math.max(1, links.length - 1));
    links.forEach((link, index) => {
      const reveal = motion.matches ? progress : smooth((progress - .68 - index * labelStagger) / .18);
      link.style.opacity = reveal;
      link.style.translate = `0 ${(1 - reveal) * 12}px`;
    });
    const hintReveal = motion.matches ? progress : smooth((progress - .82) / .18);
    hints.style.opacity = hintReveal;
    hints.style.translate = `0 ${(1 - hintReveal) * 8}px`;
    description.style.opacity = hintReveal;
    description.style.translate = `0 ${(1 - hintReveal) * 8}px`;
  }
  function tick(time) {
    const delta = previousTime === undefined ? 0 : Math.min(time - previousTime, 40);
    previousTime = time;
    progress = clamp(progress + (open ? 1 : -1) * delta / (open ? OPEN_DURATION : CLOSE_DURATION));
    bendPolarity += ((open ? 1 : -1) - bendPolarity) * (1 - Math.exp(-delta / 45));
    draw();
    if (progress !== (open ? 1 : 0)) frame = requestAnimationFrame(tick);
    else {
      frame = 0;
      previousTime = undefined;
      if (!open) { nav.hidden = true; bendPolarity = 1; }
    }
  }
  function setOpen(value, restoreFocus = false) {
    open = value;
    trigger.setAttribute('aria-expanded', String(open));
    hudTriggers.forEach(button => button.setAttribute('aria-expanded', String(open)));
    trigger.title = open ? 'Close navigation' : 'Open navigation';
    trigger.querySelector('.sr-only').textContent = trigger.title;
    document.body.classList.toggle('navigation-open', open);
    nav.inert = !open;
    nav.setAttribute('aria-hidden', String(!open));
    if (open) { nav.hidden = false; select(links[0]); measure(); }
    if (open && document.activeElement === trigger) links[0]?.focus({ preventScroll: true });
    if (restoreFocus) trigger.focus({ preventScroll: true });
    if (motion.matches) {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = undefined;
      progress = open ? 1 : 0;
      bendPolarity = open ? 1 : -1;
      draw();
      nav.hidden = !open;
    } else if (!frame) frame = requestAnimationFrame(tick);
  }
  measure();
  setOpen(false);
  trigger.addEventListener('click', () => setOpen(!open));
  closeButton.addEventListener('click', () => setOpen(false, true));
  trigger.addEventListener('keydown', event => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    setOpen(true);
    links[event.key === 'ArrowDown' ? 0 : links.length - 1].focus();
  });
  nav.addEventListener('keydown', event => {
    const index = links.indexOf(document.activeElement);
    let next;
    if (event.key === 'ArrowDown') next = (index + 1) % links.length;
    if (event.key === 'ArrowUp') next = (index - 1 + links.length) % links.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = links.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    links[next].focus();
  });
  document.addEventListener('keydown', event => {
    if (open && event.key === 'Escape') {
      event.preventDefault();
      setOpen(false, true);
    }
  });
  document.addEventListener('pointerdown', event => {
    if (open && !nav.contains(event.target) && !trigger.contains(event.target)) {
      setOpen(false, nav.contains(document.activeElement));
    }
  });
  document.addEventListener('focusin', event => {
    if (open && !nav.contains(event.target) && !trigger.contains(event.target)) setOpen(false);
  });
  links.forEach(link => link.addEventListener('click', () => setOpen(false, true)));
  motion.addEventListener('change', () => setOpen(open));
  window.addEventListener('resize', () => { if (!nav.hidden) { measure(); draw(); } });
  window.addEventListener('pagehide', () => setOpen(false));
})();
