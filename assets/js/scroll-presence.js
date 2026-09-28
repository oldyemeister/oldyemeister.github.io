import { SCROLL_ANIMATION as settings } from './scroll-animation-config.js';
import { aboutScrollProgress, aboutOuterRing, aboutRibbonProgress, educationDecorProgress } from './about-scroll-progress.js';
// Scroll-linked presence: reversible, with no timers or hidden-content gate.
(() => {
  if (!document.body.matches('.persona-design.page-home')) return;
  const hero = document.querySelector('#home');
  document.body.style.setProperty('--hero-circle-scale', settings.heroBackdrop.scale);
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
    '.page-section:not(#projects):not(#about):not(#education) > .content-shell',
    '#projects .section-header', '#projects .project-card'
  ].join(','))];
  const about = document.querySelector('#about');
  const skySections = new Map([hero, about].filter(Boolean).map(section => [section, true]));
  const syncClouds = () => document.body.classList.toggle('sky-clouds-running', !document.hidden && [...skySections.values()].some(Boolean));
  if ('IntersectionObserver' in window) {
    const skyObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => skySections.set(entry.target, entry.isIntersecting));
      syncClouds();
    });
    skySections.forEach((_, section) => skyObserver.observe(section));
  }
  document.addEventListener('visibilitychange', syncClouds);
  syncClouds();
  // A continuation of the same SVG, aligned exactly at the section seam.
  // Only artwork crosses the boundary; content, flowers and layout stay put.
  const heroArt = hero?.querySelector('.hero-reference-art');
  if (settings.heroBackdrop.continueIntoAbout && heroArt && about) {
    const continuation = heroArt.cloneNode(true);
    continuation.setAttribute('class', 'hero-about-art');
    continuation.querySelectorAll('.hero-flower').forEach(flower => flower.remove());
    continuation.querySelectorAll('[id]').forEach(element => {
      element.id = `continuation-${element.id}`;
    });
    continuation.querySelectorAll('*').forEach(element => {
      for (const attribute of [...element.attributes]) {
        if (attribute.value.includes('url(#')) {
          element.setAttribute(attribute.name, attribute.value.replace(/url\(#/g, 'url(#continuation-'));
        }
      }
    });
    about.prepend(continuation);
    const alignBackdrop = () => {
      const artBox = heroArt.getBoundingClientRect();
      const aboutBox = about.getBoundingClientRect();
      continuation.style.left = `${artBox.left - aboutBox.left}px`;
      continuation.style.top = `${artBox.top - aboutBox.top}px`;
      continuation.style.width = `${artBox.width}px`;
      const artScale = artBox.width / 796;
      const lift = settings.heroBackdrop.liftPx;
      heroArt.style.setProperty('--hero-circle-lift-svg', `${-lift / artScale}px`);
      continuation.style.setProperty('--hero-circle-lift-svg', `${-lift / artScale}px`);
      const headerArt = document.querySelector('.hero-header-art');
      if (headerArt) headerArt.style.setProperty('--hero-circle-lift-svg', `${-lift / (headerArt.getBoundingClientRect().width / 796)}px`);
      // Convert the shared hero center into About SVG coordinates without changing ring radii.
      const offset = parseFloat(getComputedStyle(heroArt).getPropertyValue('--hero-circle-offset-y')) || 0;
      const centerY = artBox.top - aboutBox.top + (270 + offset) * artScale - lift;
      const blueBottom = centerY + 445 * artScale * settings.heroBackdrop.scale;
      about.style.setProperty('--hero-blue-bottom', blueBottom);
      const stage = hero.querySelector('.hero-visual-stage').getBoundingClientRect();
      const cx = artBox.left - stage.left + 500 * artScale;
      const cy = artBox.top - stage.top + (270 + offset) * artScale - lift;
      const radius = 380 * artScale * settings.heroBackdrop.scale;
      const obstacles = [...hero.querySelectorAll('.hero-reference-copy, .hero-actions, .hero-portrait-monogram')].map(e => e.getBoundingClientRect());
      const placed = [];
      const flowers = [
        ['.hero-name-flower', .13, .16], ['.hero-left-flower', .12, .7],
        ['.hero-right-dark-flower', .92, .16], ['.hero-right-light-flower', .95, .35],
      ];
      flowers.forEach(([selector, tx, ty]) => {
        const flower = hero.querySelector(selector);
        const size = flower.getBoundingClientRect().width;
        const half = size / 2 + 8;
        let best;
        for (let angle = 0; angle < 360; angle += 2) {
          const x = cx + Math.cos(angle * Math.PI / 180) * radius;
          const y = cy + Math.sin(angle * Math.PI / 180) * radius;
          if (x < half || x > stage.width - half || y < half || y > stage.height - half) continue;
          const collision = obstacles.some(r => x + half > r.left - stage.left && x - half < r.right - stage.left && y + half > r.top - stage.top && y - half < r.bottom - stage.top);
          const crowded = placed.some(p => Math.hypot(x - p.x, y - p.y) < half + p.half + 12);
          const score = Math.hypot(x - stage.width * tx, y - stage.height * ty) + (collision ? 10000 : 0) + (crowded ? 10000 : 0);
          if (!best || score < best.score) best = {x, y, half, score};
        }
        if (best) {
          flower.style.left = `${best.x}px`;
          flower.style.top = `${best.y}px`;
          placed.push(best);
        }
      });
    };
    alignBackdrop();
    window.addEventListener('resize', alignBackdrop, { passive: true });
    document.fonts?.ready.then(alignBackdrop);
    if ('ResizeObserver' in window) {
      const geometryObserver = new ResizeObserver(alignBackdrop);
      geometryObserver.observe(hero);
      geometryObserver.observe(about);
    }
  }
  const pictureRow = about?.querySelector('.about-picture-placeholders');
  const pictureFrames = [...(about?.querySelectorAll('.about-picture-frame') || [])];
  const rings = about?.querySelector('.about-growing-rings');
  const outerRing = about?.querySelector('.about-outer-ring');
  const shockwave = about?.querySelector('.about-shockwave');
  const education = document.querySelector('#education');
  const aboutHeightFloor = () => window.innerWidth <= 760
    ? { px: 520, vh: 0 }
    : window.innerHeight <= 600 ? { px: 440, vh: 0 }
    : { px: settings.about.minHeightPx, vh: settings.about.minHeightVh };
  const alignGoldCircles = () => {
    if (!about) return;
    const box = about.getBoundingClientRect();
    const goldArt = about.querySelector('.about-legacy-art');
    const scale = Math.max(.45, Math.min(box.width / 1440, 1.1)) * settings.about.goldArtworkScale;
    const x = box.width * settings.about.circleCenterXPercent / 100 + settings.about.circleCenterOffsetXPx;
    const blueBottom = Number(about.style.getPropertyValue('--hero-blue-bottom')) || 0;
    const fraction = settings.about.circleCenterYPercent / 100;
    // The actual outer radius includes the stroke. Account for the cropped
    // center offset so the two rings stay separate without excessive height.
    const clearHeight = fraction > 0 ? Math.max(0,
      (blueBottom + 1032 * scale + settings.about.minimumRingGapPx - settings.about.circleCenterOffsetYPx) / fraction) : 0;
    about.style.setProperty('--about-content-top', `${Math.max(48, blueBottom + 24)}px`);
    const floor = aboutHeightFloor();
    const heightRule = `max(${floor.px}px, ${floor.vh}svh, ${clearHeight}px)`;
    about.style.setProperty('--about-section-min-height', heightRule);
    const y = box.height * fraction + settings.about.circleCenterOffsetYPx;
    goldArt.style.width = `${1440 * scale}px`;
    goldArt.style.left = `${x - 950 * scale}px`;
    goldArt.style.top = `${y + 180 * scale}px`;
    // Fit both portrait rectangles within the inner opening of the final arch.
    const radius = 700 * scale;
    const width = Math.min(560, box.width - 48, radius * 1.2);
    const gap = Math.min(32, Math.max(16, box.width * .03));
    const height = (width - gap) / 2 * 4 / 3;
    const left = Math.max(24, Math.min(x - width / 2, box.width - width - 24));
    const reach = Math.max(Math.abs(left - x), Math.abs(left + width - x)) + 12;
    const top = y - Math.sqrt(Math.max(0, radius * radius - reach * reach)) + 24;
    about.style.setProperty('--arch-photos-width', `${width}px`);
    about.style.setProperty('--arch-photos-left', `${left}px`);
    about.style.setProperty('--arch-photos-top', `${Math.min(top, box.height - height - 32)}px`);
  };
  const initialAboutFloor = aboutHeightFloor();
  about?.style.setProperty('--about-section-min-height', `max(${initialAboutFloor.px}px, ${initialAboutFloor.vh}svh)`);
  alignGoldCircles();
  window.addEventListener('resize', alignGoldCircles, { passive: true });
  document.fonts?.ready.then(alignGoldCircles);
  if (about && 'ResizeObserver' in window) new ResizeObserver(alignGoldCircles).observe(about);

  // Most frames change nothing; skip identical writes, since each one
  // invalidates style for its element.
  const written = new WeakMap();
  const write = (element, name, value) => {
    let cache = written.get(element);
    if (!cache) written.set(element, cache = new Map());
    if (cache.get(name) === value) return;
    cache.set(name, value);
    if (name.startsWith('--')) element.style.setProperty(name, value);
    else element.setAttribute(name, value);
  };
  // Only cards near the viewport can change. A card leaving that band gets one
  // last update, which lands on its resting off-screen value.
  const near = new Set(targets);
  const leaving = new Set();
  if ('IntersectionObserver' in window) {
    const nearObserver = new IntersectionObserver(entries => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) near.add(target);
        else if (near.delete(target)) leaving.add(target);
      });
      schedule();
    }, { rootMargin: '25% 0px' });
    targets.forEach(element => nearObserver.observe(element));
  }

  let shockAnimation;
  let shockArmed = false;
  let frame = 0;
  function update() {
    frame = 0;
    if (reducedMotion.matches) return;
    const viewport = window.innerHeight;
    const aboutBox = about?.getBoundingClientRect();
    const educationBox = education?.getBoundingClientRect();
    const educationProgress = educationBox ? Math.max(0, Math.min(1,
      (viewport * .9 - educationBox.top) / Math.max(1, viewport * .45))) : 1;
    const pictureTop = pictureRow?.getBoundingClientRect().top;
    const decor = aboutBox && educationBox ? educationDecorProgress(educationBox.top, aboutBox.bottom, aboutBox.height, viewport) : null;
    const reveal = aboutBox ? aboutScrollProgress(aboutBox.top, aboutBox.height, viewport) : null;
    // Read first, then write, so cards don't trigger repeated layout work.
    const active = [...new Set([...near, ...leaving])];
    leaving.clear();
    const values = active.map(element => {
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
      if (outerRing) {
        write(outerRing, 'r', String(outer.radius));
        write(outerRing, 'stroke-width', String(outer.width));
      }
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
      pictureFrames.forEach((picture, index) => {
        const distance = viewport * (settings.pictures.enterAtVh - settings.pictures.delayVh - index * settings.pictures.staggerVh) / 100 - pictureTop;
        const p = Math.max(0, Math.min(1, distance / Math.max(1, viewport * settings.pictures.travelVh / 100)));
        write(picture, '--picture-progress', (1 - (1 - p) ** 3).toFixed(4));
      });
      write(about, 'data-about-scroll', '');
      write(about, '--about-copy-progress', reveal.text.toFixed(4));
      write(about, '--about-ribbon-progress', aboutRibbonProgress(aboutBox.bottom, viewport, aboutBox.height).toFixed(4));
      write(rings, 'transform', `translate(950 -180) scale(${reveal.progress}) translate(-950 180)`);
    }
    if (decor) {
      write(education, 'data-decor-scroll', '');
      write(education, '--education-bars-progress', decor.bars.toFixed(4));
      write(education, '--education-entry-progress', (1 - (1 - educationProgress) ** 3).toFixed(4));
    }
    document.documentElement.classList.remove('about-scroll-pending');
    clearTimeout(window.aboutScrollFallback);
    values.forEach(({ element, opacity, scale }) => {
      write(element, 'data-scroll-presence', '');
      write(element, '--scroll-opacity', opacity.toFixed(3));
      write(element, '--scroll-scale', scale.toFixed(4));
    });
  }
  function schedule() {
    if (!frame && !reducedMotion.matches) frame = requestAnimationFrame(update);
  }
  function preferenceChanged() {
    cancelAnimationFrame(frame);
    frame = 0;
    // Direct removals below bypass write(), so forget what was written.
    [outerRing, rings, about, education, ...pictureFrames, ...targets].forEach(element => element && written.delete(element));
    targets.forEach(element => leaving.add(element));
    if (reducedMotion.matches) {
      shockAnimation?.cancel();
      shockArmed = false;
      outerRing?.setAttribute('r', '948');
      outerRing?.setAttribute('stroke-width', '168');
      document.documentElement.classList.remove('about-scroll-pending');
      if (education) {
        delete education.dataset.decorScroll;
        education.style.removeProperty('--education-bars-progress');
        education.style.removeProperty('--education-entry-progress');
      }
      if (about) {
        delete about.dataset.aboutScroll;
        about.style.removeProperty('--about-copy-progress');
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
