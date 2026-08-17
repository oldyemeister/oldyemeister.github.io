(function () {
  const root = document.documentElement;
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const themeDuration = 420;
  let transitionTimer;

  function storedTheme() {
    try {
      const value = localStorage.getItem('theme');
      return value === 'light' || value === 'dark' ? value : null;
    } catch (error) {
      return null;
    }
  }

  function setTheme(theme, persist, animated = false) {
    root.dataset.theme = theme;
    if (themeToggle) {
      const dark = theme === 'dark';
      themeToggle.setAttribute('aria-checked', String(dark));
      themeToggle.setAttribute('aria-label', dark ? 'Use light theme' : 'Use dark theme');
    }
    if (persist) {
      try { localStorage.setItem('theme', theme); } catch (error) {}
    }
    window.dispatchEvent(new CustomEvent('site-theme-change', {
      detail: { theme, animated, duration: animated ? themeDuration : 0 }
    }));
  }

  function toggleTheme(theme) {
    if (reducedMotion.matches) {
      setTheme(theme, true, false);
      return;
    }
    window.clearTimeout(transitionTimer);
    root.classList.add('theme-transition');
    themeToggle?.classList.add('is-changing');
    window.requestAnimationFrame(() => setTheme(theme, true, true));
    transitionTimer = window.setTimeout(() => {
      root.classList.remove('theme-transition');
      themeToggle?.classList.remove('is-changing');
    }, themeDuration + 60);
  }

  setTheme(root.dataset.theme || (systemTheme.matches ? 'dark' : 'light'), false);
  themeToggle?.addEventListener('click', () => {
    toggleTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
  });
  systemTheme.addEventListener?.('change', (event) => {
    if (!storedTheme()) setTheme(event.matches ? 'dark' : 'light', false);
  });

  const menuToggle = document.querySelector('[data-menu-toggle]');
  const navigation = document.querySelector('[data-navigation]');
  function closeNavigation() {
    menuToggle?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('navigation-open');
  }
  menuToggle?.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('navigation-open', open);
  });
  navigation?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeNavigation));
  window.addEventListener('resize', () => { if (window.innerWidth > 1080) closeNavigation(); });

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
        item.style.setProperty('--reveal-delay', `${Math.min(index * 90, 270)}ms`);
      });
    });
    revealTargets.forEach((element) => element.classList.add('reveal-item'));
    root.classList.add('reveal-enabled');
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    let linkedSection = null;
    if (window.location.hash) {
      try { linkedSection = document.querySelector(window.location.hash); } catch (error) {}
    }
    revealTargets.forEach((element) => {
      const bounds = element.getBoundingClientRect();
      const initiallyVisible = bounds.top < window.innerHeight * 0.92 && bounds.bottom > 0;
      if (initiallyVisible || linkedSection?.contains(element)) element.classList.add('is-revealed');
      else revealObserver.observe(element);
    });
  } else revealTargets.forEach((element) => element.classList.add('is-revealed'));

  const year = document.querySelector('[data-current-year]');
  if (year) year.textContent = new Date().getFullYear();
}());
