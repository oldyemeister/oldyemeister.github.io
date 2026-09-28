(function () {
  const root = document.documentElement;
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Decorative stripes: 25% thinner, with a minimum of two rendered pixels.
  const heroStripes = document.querySelector('#home .hero-corner-ribbons');
  if (heroStripes) {
    const stripeGeometry = [...heroStripes.querySelectorAll('rect')].map(rect => ({
      rect, y: Number(rect.getAttribute('y')), height: Number(rect.getAttribute('height'))
    }));
    const sizeHeroStripes = () => {
      const scale = heroStripes.getBoundingClientRect().width / 600;
      if (!scale) return;
      stripeGeometry.forEach(({ rect, y, height }) => {
        rect.setAttribute('y', y * .75);
        rect.setAttribute('height', Math.max(2 / scale, height * .75));
      });
    };
    sizeHeroStripes();
    if ('ResizeObserver' in window) new ResizeObserver(sizeHeroStripes).observe(heroStripes);
    else window.addEventListener('resize', sizeHeroStripes);
  }

  const contactFlower = document.querySelector('#contact .contact-flower');
  if (contactFlower) {
    let flowerVisible = false;
    const updateFlower = () => {
      contactFlower.dataset.rotating = String(flowerVisible && !document.hidden);
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        flowerVisible = entry.isIntersecting;
        updateFlower();
      }).observe(contactFlower);
    } else {
      flowerVisible = true;
      updateFlower();
    }
    document.addEventListener('visibilitychange', updateFlower);
  }

  function storedTheme() {
    try {
      const value = localStorage.getItem('theme');
      return value === 'light' || value === 'dark' ? value : null;
    } catch (error) {
      return null;
    }
  }

  // The head script picks the initial theme; follow later OS changes unless a
  // theme was saved.
  systemTheme.addEventListener?.('change', (event) => {
    if (!storedTheme()) root.dataset.theme = event.matches ? 'dark' : 'light';
  });

  // Short windows need the content more than persistent chrome. Keep the
  // header available at the top and on upward scroll, but let it retreat on
  // downward scroll. One passive listener and one animation-frame write keep
  // this from adding work to the scroll path.
  const siteHeader = document.querySelector('[data-site-header]');
  const shortViewport = window.matchMedia('(max-height: 700px)');
  if (siteHeader) {
    let previousScrollY = window.scrollY;
    let headerFrame = 0;
    let headerInteractionStarted = false;
    const showHeader = () => document.body.classList.remove('short-header-hidden');
    const startHeaderInteraction = () => {
      headerInteractionStarted = true;
      previousScrollY = window.scrollY;
    };
    const updateShortHeader = () => {
      headerFrame = 0;
      const currentScrollY = window.scrollY;
      if (!headerInteractionStarted) {
        previousScrollY = currentScrollY;
        showHeader();
        return;
      }
      const menuOpen = document.body.classList.contains('navigation-open');
      const headerFocused = siteHeader.contains(document.activeElement);
      if (!shortViewport.matches || currentScrollY < 80 || menuOpen || headerFocused) {
        showHeader();
      } else if (currentScrollY > previousScrollY + 1) {
        document.body.classList.add('short-header-hidden');
      } else if (currentScrollY < previousScrollY - 1) {
        showHeader();
      }
      previousScrollY = currentScrollY;
    };
    const queueShortHeaderUpdate = () => {
      if (!headerFrame) headerFrame = window.requestAnimationFrame(updateShortHeader);
    };
    window.addEventListener('scroll', queueShortHeaderUpdate, { passive: true });
    window.addEventListener('wheel', startHeaderInteraction, { passive: true });
    window.addEventListener('touchstart', startHeaderInteraction, { passive: true });
    window.addEventListener('pointerdown', startHeaderInteraction, { passive: true });
    window.addEventListener('keydown', event => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) {
        startHeaderInteraction();
      }
    });
    shortViewport.addEventListener?.('change', () => {
      previousScrollY = window.scrollY;
      showHeader();
    });
    siteHeader.addEventListener('focusin', showHeader);
    window.addEventListener('pagehide', () => {
      if (headerFrame) window.cancelAnimationFrame(headerFrame);
    });
  }

  const revealTargets = [...document.querySelectorAll([
    '.hero-copy', '.portrait-frame', '.section-header > *',
    '.two-column-section > *', '.contact-layout > *',
    '.laser-intro-layout > *', '.game-heading-row',
    '.experience-item', '.project-card', '.case-study-hero-copy',
    '.case-study-hero-media', '.case-study-meta', '.case-study-prose'
  ].join(','))];

  if (!reducedMotion.matches && 'IntersectionObserver' in window && revealTargets.length) {
    document.querySelectorAll('.experience-list, .project-grid').forEach((group) => {
      [...group.children].forEach((item, index) => {
        item.style.setProperty('--reveal-delay', `${Math.min(index * 30, 60)}ms`);
      });
    });
    revealTargets.forEach((element) => element.classList.add('reveal-item'));
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        // A scroll jump may land directly on this item: don't queue a stagger.
        if (entry.boundingClientRect.top < window.innerHeight && entry.boundingClientRect.bottom > 0) {
          entry.target.style.setProperty('--reveal-delay', '0ms');
        }
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    // Pixel margins use viewport height (IO percentage margins use width).
    // Pre-reveal in either scroll direction, about 20vh before entering view.
    }, { rootMargin: `${Math.round(window.innerHeight * 0.2)}px 0px`, threshold: 0 });
    let linkedSection = null;
    if (window.location.hash) {
      try { linkedSection = document.querySelector(window.location.hash); } catch (error) {}
    }
    revealTargets.forEach((element) => {
      const bounds = element.getBoundingClientRect();
      const initiallyVisible = bounds.top < window.innerHeight && bounds.bottom > 0;
      if (initiallyVisible || linkedSection?.contains(element)) element.classList.add('is-revealed');
      else revealObserver.observe(element);
    });
    // Apply the enhanced state only after visible/deep-linked content is ready.
    root.classList.add('reveal-enabled');
  } else revealTargets.forEach((element) => element.classList.add('is-revealed'));

  const year = document.querySelector('[data-current-year]');
  if (year) year.textContent = new Date().getFullYear();
}());
