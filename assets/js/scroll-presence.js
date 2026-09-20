import { SCROLL_ANIMATION as settings } from './scroll-animation-config.js';
import { aboutScrollProgress, aboutOuterRing, aboutRibbonProgress, educationDecorProgress } from './about-scroll-progress.js';
// Scroll-linked presence: reversible, with no timers or hidden-content gate.
(() => {
  if (!document.body.matches('.persona-design.page-home')) return;
  const hero = document.querySelector('#home');
  let heroVisible = true;
  const syncFlowers = () => hero?.classList.toggle('hero-flowers-running', heroVisible && !document.hidden);
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      syncFlowers();
    }).observe(hero);
  }
  document.addEventListener('visibilitychange', syncFlowers);
  syncFlowers();
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const targets = [...document.querySelectorAll([
    '.page-section:not(#projects):not(#about) > .content-shell',
    '#projects .section-header', '#projects .project-card'
  ].join(','))];
  const about = document.querySelector('#about');
  const rings = about?.querySelector('.about-growing-rings');
  const outerRing = about?.querySelector('.about-outer-ring');
  const shockwave = about?.querySelector('.about-shockwave');
  const education = document.querySelector('#education');
  let shockAnimation;
  let shockArmed = false;
  let frame = 0;
  function update() {
    frame = 0;
    if (reducedMotion.matches) return;
    const viewport = window.innerHeight;
    const aboutBox = about?.getBoundingClientRect();
    const educationBox = education?.getBoundingClientRect();
    const decor = aboutBox && educationBox ? educationDecorProgress(educationBox.top, aboutBox.bottom, aboutBox.height, viewport) : null;
    const reveal = aboutBox ? aboutScrollProgress(aboutBox.top, aboutBox.height, viewport) : null;
    // Read first, then write, so cards don't trigger repeated layout work.
    const values = targets.map(element => {
      const box = element.getBoundingClientRect();
      // Compensate for our center-origin scale; keep progress independent of it.
      const height = element.offsetHeight;
      const top = box.top + (box.height - height) / 2;
      const travel = Math.min(height * settings.content.travelElementFraction, viewport * settings.content.travelVh / 100);
      const progress = Math.max(0, Math.min(1,
        Math.min(viewport - top, top + height) / Math.max(1, travel)));
      const eased = progress * progress * (3 - 2 * progress);
      return { element, opacity: settings.content.minimumOpacity + (1 - settings.content.minimumOpacity) * eased, scale: settings.content.minimumScale + (1 - settings.content.minimumScale) * eased };
    });
    if (reveal && rings) {
      const outer = aboutOuterRing(reveal.progress);
      outerRing?.setAttribute('r', outer.radius);
      outerRing?.setAttribute('stroke-width', outer.width);
      if (reveal.progress < Math.max(0, settings.shockwave.triggerAt - settings.shockwave.rearmGap)) shockArmed = true;
      if (shockArmed && reveal.progress >= settings.shockwave.triggerAt) {
        shockArmed = false;
        // Pulse at full expansion, but never after jumping past About entirely.
        if (aboutBox.bottom > 0 && shockwave?.animate) {
          shockAnimation?.cancel();
          shockAnimation = shockwave.animate([
            { transform: 'scale(0)', opacity: 0, offset: 0 },
            { transform: 'scale(.24)', opacity: settings.shockwave.peakOpacity, offset: .2 },
            { transform: 'scale(.65)', opacity: settings.shockwave.peakOpacity * (4 / 7), offset: .55 },
            { transform: 'scale(1)', opacity: 0, offset: 1 }
          ], { duration: settings.shockwave.durationMs, easing: 'cubic-bezier(.22,.7,.36,1)' });
        }
      }
      about.dataset.aboutScroll = '';
      about.style.setProperty('--about-copy-opacity', reveal.text.toFixed(4));
      about.style.setProperty('--about-ribbon-progress', aboutRibbonProgress(aboutBox.bottom, viewport, aboutBox.height).toFixed(4));
      rings.setAttribute('transform', `translate(950 -180) scale(${reveal.progress}) translate(-950 180)`);
    }
    if (decor) {
      education.dataset.decorScroll = '';
      education.style.setProperty('--education-bars-progress', decor.bars.toFixed(4));
      education.style.setProperty('--education-pills-progress', decor.pills.toFixed(4));
    }
    document.documentElement.classList.remove('about-scroll-pending');
    clearTimeout(window.aboutScrollFallback);
    values.forEach(({ element, opacity, scale }) => {
      element.dataset.scrollPresence = '';
      element.style.setProperty('--scroll-opacity', opacity.toFixed(3));
      element.style.setProperty('--scroll-scale', scale.toFixed(4));
    });
  }
  function schedule() {
    if (!frame && !reducedMotion.matches) frame = requestAnimationFrame(update);
  }
  function preferenceChanged() {
    cancelAnimationFrame(frame);
    frame = 0;
    if (reducedMotion.matches) {
      shockAnimation?.cancel();
      shockArmed = false;
      outerRing?.setAttribute('r', '1232');
      outerRing?.setAttribute('stroke-width', '736');
      document.documentElement.classList.remove('about-scroll-pending');
      if (education) {
        delete education.dataset.decorScroll;
        education.style.removeProperty('--education-bars-progress');
        education.style.removeProperty('--education-pills-progress');
      }
      if (about) {
        delete about.dataset.aboutScroll;
        about.style.removeProperty('--about-copy-opacity');
        about.style.removeProperty('--about-ribbon-progress');
        rings?.removeAttribute('transform');
      }
      targets.forEach(element => {
      delete element.dataset.scrollPresence;
      element.style.removeProperty('--scroll-opacity');
      element.style.removeProperty('--scroll-scale');
    });
    } else schedule();
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('pageshow', schedule);
  window.addEventListener('hashchange', schedule);
  document.fonts?.ready.then(schedule);
  const sizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : null;
  targets.forEach(element => sizeObserver?.observe(element));
  if (about) sizeObserver?.observe(about);
  if (education) sizeObserver?.observe(education);
  reducedMotion.addEventListener('change', preferenceChanged);
  if (reducedMotion.matches) preferenceChanged();
  else update();
})();
