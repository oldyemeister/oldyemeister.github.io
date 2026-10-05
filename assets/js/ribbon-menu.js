(() => {
  const trigger = document.querySelector('[data-ribbon-trigger]');
  const nav = document.querySelector('[data-navigation]');
  if (!trigger || !nav) return;
  const hudTriggers = [...document.querySelectorAll('[data-hud-menu-toggle]')];
  // Labels come from content.yml (ui.menu) via data attributes on the nav.
  const labels = nav.dataset;
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
  // Sampled from reference/album/menuribbon.jpg (widths in its pixels; they
  // are normalized below): translucent salmon fringe lines, then yellow, red,
  // grey, olive and lime lines into a broad orange-yellow core and a deep
  // orange band, then orange, lime, green, gold, white, sky blue and dark
  // green lines out to a translucent cream fringe. Opacity-0 entries are the
  // gaps between fringe lines. The bundles split by count between the two
  // widest bands (the orange-yellow core and the deep orange band), so three
  // zero-width spacers balance the left bundle, and the 11px yellow line
  // between those bands is the deep orange band's own left edge (a hard-stop
  // gradient defined below).
  const stripes = [
    [0, '#000000', .00],
    [0, '#000000', .00],
    [0, '#000000', .00],
    [4, '#FFB25F', .60],
    [8, '#000000', .00],
    [12, '#EE7A45', .55],
    [8, '#000000', .00],
    [10, '#FCF720', 1],
    [32, '#C80501', 1],
    [22, '#ECEDEE', 1],
    [15, '#949A08', 1],
    [26, '#B3D402', 1],
    [17, '#678015', 1],
    [31, '#F7DA2A', 1],
    [11, '#FEF524', 1],
    [12, '#FCFFA2', 1],
    [201, '#FFAE00', 1],
    [107, 'url(#menu-ribbon-core-edge)', 1],
    [16, '#FF7308', 1],
    [28, '#E1F801', 1],
    [16, '#02AE48', 1],
    [36, '#F2D210', 1],
    [16, '#FF7308', 1],
    [16, '#FFFFFF', 1],
    [16, '#FFF524', 1],
    [12, '#FEFEFC', 1],
    [36, '#10BDF0', 1],
    [38, '#A3B500', 1],
    [16, '#027708', 1],
    [15, '#FEFEFD', 1],
    [8, '#000000', .00],
    [14, '#FFF2BC', .60],
    [8, '#000000', .00],
    [5, '#FFF9C8', .60],
  ];
  // 11 of the band's 107 units are the yellow line; the rest is deep orange.
  svg.innerHTML = `<defs><linearGradient id="menu-ribbon-core-edge" x1="0" x2="1" y1="0" y2="0">
    <stop offset="0" stop-color="#FEF425"/><stop offset=".1028" stop-color="#FEF425"/>
    <stop offset=".1028" stop-color="#F55A02"/><stop offset="1" stop-color="#F55A02"/>
  </linearGradient></defs>`;
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
  // Glowing half-sine lobes inside the two core bands, as in the reference:
  // the gold band's lobes bulge left from its right edge, the deep orange
  // band's bulge right from its left edge, in phase, one layer per band.
  // Their transparency is fixed to the screen,
  // as in the reference: 40% opaque at the top and bottom, fully opaque a
  // little below the middle, so the drifting lobes glow as they pass through.
  // JavaScript draws one wavelength of lobes beyond the screen; CSS drifts the
  // layer upward by one lobe length on a loop.
  const WAVE_LENGTH = 360; // Lobe length in the 640-unit-tall viewBox.
  const WAVE_STEPS = 32;
  // As in the reference, a wave never narrows to nothing: between lobes it
  // keeps half its widest extent, so each band's wave is one continuous strip.
  // Each lobe follows sin², which levels off where lobes meet, so the narrow
  // parts are smooth flat dips rather than notches.
  const WAVE_FLOOR = .5;
  const waveSvg = document.createElementNS(ns, 'svg');
  waveSvg.classList.add('menu-ribbons', 'menu-ribbon-waves');
  waveSvg.setAttribute('viewBox', '0 0 520 640');
  waveSvg.setAttribute('preserveAspectRatio', 'none');
  waveSvg.setAttribute('aria-hidden', 'true');
  waveSvg.setAttribute('focusable', 'false');
  // Screen height (top 0 to bottom 1) to wave opacity. A smooth curve passes
  // through these points (monotone cubic, so it never overshoots between
  // them), sampled into fine gradient stops.
  const waveOpacityKeys = [[0, .2], [.25, .4], [.55, .75], [.8, .4], [1, .2]];
  const keySlopes = waveOpacityKeys.slice(1).map(([x, y], index) =>
    (y - waveOpacityKeys[index][1]) / (x - waveOpacityKeys[index][0]));
  const keyTangents = waveOpacityKeys.map(([x], index) => {
    // Level at the ends and at the peak; weighted harmonic mean elsewhere.
    if (index === 0 || index === waveOpacityKeys.length - 1) return 0;
    const [before, after] = [keySlopes[index - 1], keySlopes[index]];
    if (before * after <= 0) return 0;
    const [left, right] = [x - waveOpacityKeys[index - 1][0], waveOpacityKeys[index + 1][0] - x];
    const [w1, w2] = [2 * right + left, right + 2 * left];
    return (w1 + w2) / (w1 / before + w2 / after);
  });
  function waveOpacityAt(position) {
    const index = Math.min(waveOpacityKeys.length - 2,
      waveOpacityKeys.findIndex(([x], key) => key > 0 && position <= x) - 1);
    const [[x0, y0], [x1, y1]] = [waveOpacityKeys[index], waveOpacityKeys[index + 1]];
    const span = x1 - x0;
    const t = (position - x0) / span;
    return (2 * t ** 3 - 3 * t ** 2 + 1) * y0 + (t ** 3 - 2 * t ** 2 + t) * span * keyTangents[index]
      + (-2 * t ** 3 + 3 * t ** 2) * y1 + (t ** 3 - t ** 2) * span * keyTangents[index + 1];
  }
  const waveOpacity = Array.from({ length: 41 }, (_, step) => [step / 40, waveOpacityAt(step / 40)]);
  waveSvg.innerHTML = `<defs>
    <linearGradient id="menu-wave-fade-gradient" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="0" y2="640">
      ${waveOpacity.map(([offset, opacity]) => `<stop offset="${offset}" stop-color="#fff" stop-opacity="${opacity.toFixed(3)}"/>`).join('')}
    </linearGradient>
    <mask id="menu-wave-fade" maskUnits="userSpaceOnUse" x="-100000" y="-100" width="200000" height="840">
      <rect x="-100000" y="-100" width="200000" height="840" fill="url(#menu-wave-fade-gradient)"/>
    </mask></defs>`;
  // The mask sits on a still group, so it stays fixed while the lobes drift.
  const waveFade = document.createElementNS(ns, 'g');
  waveFade.setAttribute('mask', 'url(#menu-wave-fade)');
  waveSvg.append(waveFade);
  const waveDrift = document.createElementNS(ns, 'g');
  waveDrift.classList.add('menu-wave-drift');
  waveDrift.style.setProperty('--wave-length', WAVE_LENGTH);
  waveFade.append(waveDrift);
  const lobeCount = Math.ceil((640 + 2 * WAVE_LENGTH) / WAVE_LENGTH) + 1;
  // [color, band (0 gold, 1 orange), share of the inset width (see drawWaves),
  // share of the lobe length].
  const waveLayers = [
    ['#FFF524', 0, 1, 1],
    ['#FFFF3D', 1, 1, 1]
  ].map(([color, band, amplitude, length]) => ({ band, amplitude, length,
    lobes: Array.from({ length: lobeCount }, () => {
      const lobe = document.createElementNS(ns, 'path');
      lobe.style.fill = color;
      waveDrift.append(lobe);
      return lobe;
    }) }));
  // The orange band's first 11 of 107 units are the yellow line, not orange.
  const ORANGE_EDGE = 11 / 107;
  function lobePath(anchor, direction, amplitude, top, length) {
    const points = Array.from({ length: WAVE_STEPS + 1 }, (_, step) => {
      const swell = WAVE_FLOOR + (1 - WAVE_FLOOR) * Math.sin(Math.PI * step / WAVE_STEPS) ** 2;
      const x = anchor + direction * amplitude * swell;
      return `L ${x} ${top + length * step / WAVE_STEPS}`;
    });
    // Close along the band edge: the wave starts and ends off the edge.
    return `M ${anchor} ${top} ${points.join(' ')} L ${anchor} ${top + length} Z`;
  }
  function drawWaves([goldLeft, goldRight], [orangeLeft, orangeRight], visibility) {
    waveDrift.style.opacity = visibility;
    // Each wave sits inside its band, inset from both edges by the yellow
    // line's rendered width: its flat base runs that far in from one edge and
    // its peaks stop that far short of the other.
    const inset = (orangeRight - orangeLeft) * ORANGE_EDGE;
    const orangeStart = orangeLeft + inset; // Deep orange begins after the yellow line.
    waveLayers.forEach(({ band, amplitude, length, lobes }) => {
      const anchor = band ? orangeStart + inset : goldRight - inset;
      const width = band ? orangeRight - orangeStart - 2 * inset : goldRight - goldLeft - 2 * inset;
      // Both bands share lobe positions, so their waves are in phase.
      const span = WAVE_LENGTH * length;
      lobes.forEach((lobe, index) => {
        const top = -WAVE_LENGTH + index * WAVE_LENGTH + (WAVE_LENGTH - span) / 2;
        lobe.setAttribute('d', lobePath(anchor, band ? 1 : -1, width * amplitude, top, span));
      });
    });
  }
  nav.prepend(waveSvg);
  nav.prepend(svg);
  // A body-level fixed layer escapes the sticky header's stacking context.
  document.body.append(nav);
  nav.classList.add('ribbon-navigation');
  const closeButton = document.createElement('button');
  closeButton.className = 'ribbon-menu-close';
  closeButton.type = 'button';
  closeButton.textContent = '×';
  closeButton.setAttribute('aria-label', labels.closeLabel);
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
  hints.setAttribute('aria-label', labels.hintsLabel);
  for (const [keys, action, spoken, arrows] of [
    [['↑', '↓'], labels.hintNavigate, labels.hintNavigateKeys, true],
    [['Enter'], labels.hintOpen, 'Enter', false],
    [['Esc'], labels.hintClose, 'Esc', false]
  ]) {
    const group = document.createElement('span');
    group.className = 'menu-input-hint';
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', `${action}: ${spoken}`);
    for (const key of keys) {
      const symbol = document.createElement('kbd');
      symbol.className = arrows ? 'menu-hint-arrow' : 'menu-hint-key';
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
    waveSvg.setAttribute('viewBox', `0 0 ${viewportWidth} 640`);
    waveSvg.style.left = `${-menuLeft}px`;
  }

  function draw() {
    // Chrome uses the same reversible timeline as the ribbons.
    document.body.style.setProperty('--menu-chrome-progress', 1 - (1 - progress) ** 3);
    const edges = [];
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
      edges[index] = [left, right];
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
    // The lobes ignore the entry curve, so they appear only as the bands settle.
    drawWaves(edges[groupSize - 1], edges[groupSize], motion.matches ? progress : smooth((progress - .9) / .1));
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
    trigger.title = open ? labels.closeLabel : labels.openLabel;
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
  // An in-page link moves focus to its section, so the next Tab continues from
  // there instead of from the menu button at the top of the page.
  function samePageTarget(link) {
    if (!link.hash || link.pathname !== location.pathname) return null;
    try { return document.getElementById(decodeURIComponent(link.hash.slice(1))); }
    catch { return null; }
  }
  links.forEach(link => link.addEventListener('click', () => {
    const target = samePageTarget(link);
    setOpen(false, !target);
    if (!target) return;
    if (!target.hasAttribute('tabindex')) {
      target.setAttribute('tabindex', '-1');
      target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
    }
    target.focus({ preventScroll: true });
  }));
  motion.addEventListener('change', () => setOpen(open));
  window.addEventListener('resize', () => { if (!nav.hidden) { measure(); draw(); } });
  window.addEventListener('pagehide', () => setOpen(false));
})();
