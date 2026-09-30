import { CRT_SETTINGS } from './crt-settings.js';

// Apply one documented settings object to both HTML and SVG-hosted screens.
export function configureScreen(screen, settings) {
  screen.classList.add('crt-surface');
  const set = (name, value) => screen.style.setProperty(`--crt-${name}`, String(value));
  const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));
  set('tint-saturation', clamp(settings.tintSaturation ?? 1, 0, 1));
  const themes = { green: '#5bb387', amber: '#ffc864', blue: '#64c8ff' };
  set('line-color', settings.theme === 'custom' ? settings.scanlineColor : (themes[settings.theme] || themes.green));
  set('line-opacity', clamp(settings.scanlineOpacity, 0, 1));
  set('line-width', `${clamp(settings.scanlineThickness, 0.1, 30)}px`);
  set('line-gap', `${clamp(settings.scanlineGap, 0, 30)}px`);
  set('line-direction', settings.scanlineOrientation === 'vertical' ? 'to right' : 'to bottom');
  set('sweep-duration', `${clamp(settings.sweepDuration, 0.5, 120)}s`);
  set('sweep-thickness', `${clamp(settings.sweepThickness, 0.1, 200)}px`);
  set('sweep-color', settings.sweepColor || 'transparent');
  screen.dataset.crtSweepStyle = settings.sweepColor ? 'colored' : settings.sweepStyle;
  set('glow-color', settings.glowColor);
  screen.dataset.crtGlow = String(settings.enableGlow);
  set('edge-glow-color', settings.edgeGlowColor);
  set('edge-glow-size', `${clamp(settings.edgeGlowSize, 0, 200)}px`);
  set('flicker-intensity', clamp(settings.flickerIntensity, 0, 1));
  set('flicker-speed', `${clamp(settings.flickerSpeed, 0.1, 60)}s`);
  set('vignette-intensity', clamp(settings.vignetteIntensity, 0, 1));
  set('curvature-intensity', clamp(settings.curvatureIntensity, 0, 1));
  set('noise-opacity', clamp(settings.noiseOpacity, 0, 1));
  set('glare-intensity', clamp(settings.glareIntensity, 0, 1));
}

export function appendCrtLayers(document, screen, settings, animated = true) {
  const layers = [
    ['curvature', settings.enableCurvature], ['noise', settings.enableNoise],
    ['glare', settings.enableGlare], ['edge-glow', settings.enableEdgeGlow],
    ['vignette', settings.enableVignette], ['scanlines', settings.enableScanlines],
    ['sweep', settings.enableSweep && animated], ['flicker', settings.enableFlicker && animated],
  ];
  layers.forEach(([name, enabled]) => {
    if (!enabled) return;
    const layer = document.createElement('span');
    layer.className = `crt-layer crt-${name}`;
    layer.setAttribute('aria-hidden', 'true');
    screen.append(layer);
  });
}

export function initCrt(document, window, settings = CRT_SETTINGS) {
  if (!settings.enabled) return;
  const projects = [...document.querySelectorAll('#projects .project-media :is(picture, .project-screen)')];
  const heroes = [...document.querySelectorAll('.hero-crt-screen')];
  const previews = projects.filter(screen => screen.querySelector('[data-project-preview]'));
  const screens = [...projects, ...heroes];
  if (!screens.length) return;
  screens.forEach(screen => {
    const previewIndex = previews.indexOf(screen);
    const isHero = heroes.includes(screen);
    const screenSettings = isHero ? { ...settings, ...settings.hero } : settings;
    configureScreen(screen, screenSettings);
    const animated = isHero || previewIndex !== -1;
    const phase = isHero ? 0.18 : settings.staggerPreviews && previewIndex !== -1 ? previewIndex / previews.length : 0;
    screen.style.setProperty('--crt-sweep-phase', String(phase));
    appendCrtLayers(document, screen, screenSettings, animated);
  });

  const visible = new Set();
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  // Observe sections, not enormous clipped SVG bounds. All three hero pieces
  // share one gate so their seam remains continuous through Hero and About.
  const heroSections = [...document.querySelectorAll('#home, #about')];
  function sync() {
    const canAnimate = !document.hidden && !motion.matches;
    projects.forEach(screen => {
      screen.dataset.crtActive = String(canAnimate && visible.has(screen) && previews.includes(screen));
    });
    const heroActive = canAnimate && heroSections.some(section => visible.has(section));
    heroes.forEach(screen => { screen.dataset.crtActive = String(heroActive); });
  }
  if ('IntersectionObserver' in window) {
    const observer = new window.IntersectionObserver(entries => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) visible.add(target);
        else visible.delete(target);
      });
      sync();
    });
    [...projects, ...heroSections].forEach(screen => observer.observe(screen));
  }
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', sync);
  sync();
}

// Wait for scroll-presence.js to create the matching About artwork clone.
if (typeof document !== 'undefined') {
  if (document.readyState === 'complete') initCrt(document, window);
  else document.addEventListener('DOMContentLoaded', () => initCrt(document, window), { once: true });
}
