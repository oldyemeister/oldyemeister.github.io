(() => {
  const root = document.documentElement;
  const basePath = document.body.dataset.personaBase || '/persona/';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const overlay = document.querySelector('.page-wipe');
  const panes = [...overlay.children];
  let busy = false;
  let animations = [];
  let recoveryTimer;
  let transitionVersion = 0;

  // Split visible text only. Preserve spaces, word wrapping, existing icons,
  // semantic headings, and one continuous accessible label for each text node.
  const targets = document.querySelectorAll([
    '.site-identity > span:last-child', '.text-link',
    '.project-links a', '.contact-links a', '.case-study-source',
    'h1', 'h2', '.project-content h3'
  ].join(','));
  targets.forEach(target => {
    if (target.closest('.hero-title-art')) return;
    target.classList.add('kinetic-text');
    const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return node.textContent.trim() && !node.parentElement.closest('[aria-hidden], .sr-only')
          ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    let index = 0;
    nodes.forEach(node => {
      const fragment = document.createDocumentFragment();
      const accessible = document.createElement('span');
      accessible.className = 'sr-only';
      accessible.textContent = node.textContent;
      const visual = document.createElement('span');
      visual.className = 'kinetic-label';
      visual.setAttribute('aria-hidden', 'true');
      node.textContent.split(/(\s+)/).forEach(word => {
        if (/^\s+$/.test(word)) { visual.append(word); return; }
        const group = document.createElement('span');
        group.className = 'kinetic-word';
        [...word].forEach(character => {
          const letter = document.createElement('span');
          letter.className = 'kinetic-letter';
          letter.style.setProperty('--letter-delay', `${index++ % 12 * 18}ms`);
          letter.textContent = character;
          group.append(letter);
        });
        visual.append(group);
      });
      fragment.append(accessible, visual);
      node.replaceWith(fragment);
    });
  });

  function reset() {
    transitionVersion += 1;
    animations.forEach(animation => animation.cancel());
    animations = [];
    root.classList.remove('persona-arriving', 'persona-navigating');
    clearTimeout(window.personaArrivalTimeout);
    clearTimeout(recoveryTimer);
    busy = false;
  }

  function wipeTiming() {
    const style = getComputedStyle(root);
    const duration = Number.parseFloat(style.getPropertyValue('--wipe-duration'));
    const stagger = Number.parseFloat(style.getPropertyValue('--wipe-stagger'));
    return {
      duration: Number.isFinite(duration) ? Math.max(0, duration) : 550,
      stagger: Number.isFinite(stagger) ? Math.max(0, stagger) : 80
    };
  }

  function recoveryDelay() {
    const { duration, stagger } = wipeTiming();
    return 2 * (duration + stagger * (panes.length - 1)) + 5000;
  }

  async function sweep(entering) {
    const { duration, stagger } = wipeTiming();
    const offset = entering ? -130 : 130;
    animations = panes.map((pane, index) => pane.animate([
      { transform: `translateX(${entering ? offset : 0}%) skewX(-12deg)` },
      { transform: `translateX(${entering ? 0 : offset}%) skewX(-12deg)` }
    ], { duration, delay: index * stagger, easing: 'cubic-bezier(.75,0,.2,1)', fill: 'both' }));
    await Promise.all(animations.map(animation => animation.finished.catch(() => {})));
  }

  function arrive() {
    reset();
    if (motion.matches || !Element.prototype.animate) return;
    busy = true;
    root.classList.add('persona-arriving');
    const version = transitionVersion;
    recoveryTimer = setTimeout(reset, recoveryDelay());
    sweep(false).finally(() => { if (version === transitionVersion) reset(); });
  }
  if (root.classList.contains('persona-arriving')) arrive();
  window.addEventListener('pageshow', event => {
    // A cached page is already visible. Covering it now creates a yellow flash.
    if (event.persisted) reset();
  });
  // Native Back/Forward restores scroll without an extra arrival curtain.
  window.addEventListener('popstate', reset);
  window.addEventListener('pagehide', reset);
  motion.addEventListener('change', () => { if (motion.matches) reset(); });

  // The fixed HUD documents real browser focus/activation behavior. Arrow
  // selection is home-only so the project games retain all their arrow keys.
  const hud = document.querySelector('.persona-hud');
  const homeLink = document.querySelector('[data-hud-home]');
  const homePage = document.body.classList.contains('page-home');
  const menuTrigger = document.querySelector('[data-menu-toggle]');
  hud.querySelectorAll('[data-hud-menu-toggle]').forEach(button => {
    button.addEventListener('click', () => {
      menuTrigger?.focus({ preventScroll: true });
      menuTrigger?.click();
    });
  });
  const sizeHud = () => {
    root.style.setProperty('--hud-height', `${hud.getBoundingClientRect().height}px`);
    // Keep the visible end of an overflowing game strip aligned with articles.
    if (hud.querySelector('.hud-game-key')) hud.scrollLeft = Math.max(0, hud.scrollWidth - hud.clientWidth);
  };
  if ('ResizeObserver' in window) new ResizeObserver(sizeHud).observe(hud);
  else window.addEventListener('resize', sizeHud);
  sizeHud();

  window.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey ||
        event.target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="dialog"], dialog')) return;
    if (event.key === 'Escape') {
      if (document.fullscreenElement) return;
      event.preventDefault();
      if (event.repeat || busy) return;
      if (document.body.classList.contains('navigation-open')) {
        menuTrigger?.click();
        menuTrigger?.focus();
        return;
      }
      if (homePage) {
        menuTrigger?.focus({ preventScroll: true });
        menuTrigger?.click();
        return;
      }
      // Use the link's existing click path, including reduced-motion handling,
      // the outgoing wipe and the destination page's arrival wipe.
      homeLink.click();
    } else if (homePage && event.key === 'Tab' && !event.shiftKey &&
        !document.body.classList.contains('navigation-open') &&
        (document.activeElement === document.body || document.activeElement === document.documentElement)) {
      event.preventDefault();
      menuTrigger?.focus({ preventScroll: true });
      menuTrigger?.click();
    } else if (homePage && !event.shiftKey && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      const links = [...document.querySelectorAll('.site-navigation a, main a[href], .persona-hud a')]
        .filter(link => link.getClientRects().length && getComputedStyle(link).visibility !== 'hidden');
      if (!links.length) return;
      event.preventDefault();
      if (busy) return;
      const current = links.indexOf(document.activeElement);
      const next = current < 0 ? (event.key === 'ArrowDown' ? 0 : links.length - 1)
        : (current + (event.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
      links[next].focus();
    }
  });

  document.addEventListener('click', async event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
        link.hasAttribute('download') || (link.target && link.target !== '_self') ||
        link.classList.contains('skip-link')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || !url.pathname.startsWith(basePath) ||
        url.pathname.startsWith('/original/') ||
        motion.matches || !Element.prototype.animate) return;
    if (busy) { event.preventDefault(); return; }
    const samePage = url.pathname === location.pathname && url.search === location.search;
    let destination;
    if (samePage) {
      try { destination = url.hash && document.getElementById(decodeURIComponent(url.hash.slice(1))); }
      catch { return; }
      if (!destination) return;
    }
    event.preventDefault();
    busy = true;
    const version = transitionVersion;
    root.classList.add('persona-navigating');
    // Also recovers from failed/cancelled document loads.
    recoveryTimer = setTimeout(reset, recoveryDelay());
    await sweep(true);
    if (version !== transitionVersion) return;
    if (samePage) {
      history.pushState(null, '', url);
      destination.querySelectorAll('.reveal-item').forEach(el => el.classList.add('is-revealed'));
      destination.scrollIntoView({ behavior: 'instant', block: 'start' });
      const hadTabindex = destination.hasAttribute('tabindex');
      if (!hadTabindex) destination.setAttribute('tabindex', '-1');
      destination.focus({ preventScroll: true });
      if (!hadTabindex) destination.addEventListener('blur', () => destination.removeAttribute('tabindex'), { once: true });
      animations.forEach(animation => animation.cancel());
      await sweep(false);
      if (version === transitionVersion) reset();
    } else {
      try { sessionStorage.setItem('persona-arrival', JSON.stringify({ url: url.href, time: Date.now() })); }
      catch { /* The outgoing wipe still works without storage. */ }
      location.assign(url.href);
    }
  });
})();
