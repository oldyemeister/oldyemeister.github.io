import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CRT_SETTINGS, CRT_SOURCE_URL } from '../assets/js/crt-settings.js';
import { configureScreen, initCrt } from '../assets/js/crt-effect.js';

const stylesheet = readFileSync(new URL('../assets/themes/persona/project-tv-effect.css', import.meta.url), 'utf8');
function element(preview = false) {
  const item = {
    dataset: {}, properties: {}, classes: new Set(), children: [],
    querySelector: () => preview ? {} : null,
    append(child) { this.children.push(child); },
    setAttribute(name, value) { this[name] = value; },
  };
  item.classList = { add: name => item.classes.add(name) };
  item.style = { setProperty: (name, value) => { item.properties[name] = value; } };
  return item;
}
function setup({ reduced = false, observerAvailable = true, settings = {} } = {}) {
  const projects = Array.from({ length: 6 }, (_, index) => element(index < 3));
  const heroes = Array.from({ length: 3 }, () => element());
  const sections = [element(), element()];
  const events = {};
  const motion = { matches: reduced, addEventListener: (_, handler) => { events.motion = handler; } };
  const document = {
    hidden: false,
    querySelectorAll: selector => ({
      '#projects .project-media :is(picture, .project-screen)': projects,
      '.hero-crt-screen': heroes,
      '#home, #about': sections,
    })[selector],
    createElement: () => element(),
    addEventListener: (name, handler) => { events[name] = handler; }
  };
  let notify;
  const observed = [];
  class Observer {
    constructor(callback) { notify = callback; }
    observe(item) { observed.push(item); }
  }
  const window = { matchMedia: () => motion };
  if (observerAvailable) window.IntersectionObserver = Observer;
  initCrt(document, window, { ...CRT_SETTINGS, ...settings });
  return { projects, heroes, sections, document, motion, events, observed,
    show: (target, isIntersecting) => notify([{ target, isIntersecting }]) };
}
const hasLayer = (screen, name) => screen.children.some(child => child.className === `crt-layer crt-${name}`);

test('original URL remains a reference while active controls can be edited', () => {
  const params = new URL(CRT_SOURCE_URL).searchParams;
  assert.equal(params.get('preset'), 'fallout');
  assert.equal(params.get('flickerIntensity'), '0.07');
  assert.equal(params.get('vignetteIntensity'), '0.15');
  assert.equal(params.get('scanlineOpacity'), '0.19');
  assert.equal(params.get('sweepThickness'), '3');
  assert.ok(Number.isFinite(CRT_SETTINGS.flickerIntensity));
  assert.ok(Number.isFinite(CRT_SETTINGS.vignetteIntensity));
});

test('settings reach the media and all three hero surfaces', () => {
  const { projects, heroes } = setup();
  for (const screen of [...projects, ...heroes]) {
    const settings = heroes.includes(screen) ? { ...CRT_SETTINGS, ...CRT_SETTINGS.hero } : CRT_SETTINGS;
    assert.equal(screen.properties['--crt-line-width'], `${settings.scanlineThickness}px`);
    assert.equal(screen.properties['--crt-line-gap'], `${settings.scanlineGap}px`);
    assert.equal(screen.properties['--crt-line-opacity'], String(settings.scanlineOpacity));
    assert.equal(screen.properties['--crt-tint-saturation'], String(settings.tintSaturation));
    assert.equal(screen.properties['--crt-sweep-thickness'], `${settings.sweepThickness}px`);
    assert.equal(screen.properties['--crt-sweep-duration'], `${settings.sweepDuration}s`);
    assert.equal(screen.properties['--crt-sweep-color'], settings.sweepColor);
    assert.equal(screen.properties['--crt-flicker-intensity'], String(settings.flickerIntensity));
    assert.equal(screen.properties['--crt-flicker-speed'], `${settings.flickerSpeed}s`);
    assert.equal(screen.properties['--crt-vignette-intensity'], String(settings.vignetteIntensity));
    assert.equal(screen.dataset.crtGlow, 'false');
    assert.equal(screen.dataset.crtSweepStyle, 'colored');
    assert.ok(screen.children.every(child => child['aria-hidden'] === 'true'));
  }
});

test('only moving media get sweeps and flicker; preview phases stay separate', () => {
  const { projects, heroes } = setup();
  assert.deepEqual(projects.slice(0, 3).map(screen => Number(screen.properties['--crt-sweep-phase'])), [0, 1 / 3, 2 / 3]);
  assert.ok(projects.slice(0, 3).every(screen => hasLayer(screen, 'sweep') && hasLayer(screen, 'flicker')));
  assert.ok(projects.slice(3).every(screen => !hasLayer(screen, 'sweep') && !hasLayer(screen, 'flicker')));
  assert.ok(heroes.every(screen => screen.properties['--crt-sweep-phase'] === '0.18'));
});

test('CRT motion pauses offscreen and in hidden tabs without resetting phase', () => {
  const { projects, document, events, show } = setup();
  const screen = projects[1];
  const phase = screen.properties['--crt-sweep-phase'];
  assert.equal(screen.dataset.crtActive, 'false');
  show(screen, true);
  assert.equal(screen.dataset.crtActive, 'true');
  assert.equal(projects[0].dataset.crtActive, 'false');
  document.hidden = true;
  events.visibilitychange();
  assert.ok(projects.every(item => item.dataset.crtActive === 'false'));
  document.hidden = false;
  events.visibilitychange();
  assert.equal(screen.dataset.crtActive, 'true');
  show(screen, false);
  assert.equal(screen.dataset.crtActive, 'false');
  assert.equal(screen.properties['--crt-sweep-phase'], phase);
});

test('hero fragments share a visibility gate through the Hero/About seam', () => {
  const { heroes, sections, show } = setup();
  show(sections[0], true);
  assert.ok(heroes.every(screen => screen.dataset.crtActive === 'true'));
  show(sections[1], true);
  show(sections[0], false);
  assert.ok(heroes.every(screen => screen.dataset.crtActive === 'true'));
  show(sections[1], false);
  assert.ok(heroes.every(screen => screen.dataset.crtActive === 'false'));
});

test('reduced motion stops all CRT motion and responds to preference changes', () => {
  const { projects, heroes, sections, motion, events, show } = setup({ reduced: true });
  show(projects[0], true);
  show(sections[0], true);
  assert.equal(projects[0].dataset.crtActive, 'false');
  assert.ok(heroes.every(screen => screen.dataset.crtActive === 'false'));
  motion.matches = false;
  events.motion();
  assert.equal(projects[0].dataset.crtActive, 'true');
  motion.matches = true;
  events.motion();
  assert.equal(projects[0].dataset.crtActive, 'false');
  assert.match(stylesheet, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?display: none; animation: none;/);
});

test('without observation, the texture stays still and visible', () => {
  const { projects, heroes } = setup({ observerAvailable: false });
  assert.ok([...projects, ...heroes].every(screen => screen.dataset.crtActive === 'false'));
});

test('each exposed effect toggle removes its layer', () => {
  for (const [key, layer] of [
    ['enableScanlines', 'scanlines'], ['enableSweep', 'sweep'],
    ['enableFlicker', 'flicker'], ['enableVignette', 'vignette'],
    ['enableNoise', 'noise'], ['enableEdgeGlow', 'edge-glow'],
    ['enableCurvature', 'curvature'], ['enableGlare', 'glare'],
  ]) {
    const off = setup({ settings: { [key]: false } });
    const on = setup({ settings: { [key]: true } });
    assert.equal(hasLayer(off.projects[0], layer), false, key);
    assert.equal(hasLayer(on.projects[0], layer), true, key);
    assert.equal(hasLayer(off.heroes[0], layer), false, key);
    const heroOn = setup({ settings: { hero: { ...CRT_SETTINGS.hero, [key]: true } } });
    assert.equal(hasLayer(heroOn.heroes[0], layer), true, key);
  }
});

test('master switch disables all effects; stagger switch is independent', () => {
  const disabled = setup({ settings: { enabled: false } });
  assert.ok([...disabled.projects, ...disabled.heroes].every(screen => screen.children.length === 0 && screen.classes.size === 0));
  assert.equal(disabled.observed.length, 0);
  const unison = setup({ settings: { staggerPreviews: false } });
  assert.ok(unison.projects.every(screen => screen.properties['--crt-sweep-phase'] === '0'));
});

test('custom color, orientation, dark sweep and safe numerical limits are editable', () => {
  const screen = element();
  configureScreen(screen, { ...CRT_SETTINGS, theme: 'custom', scanlineColor: '#ffc864',
    scanlineOrientation: 'vertical', sweepColor: null, sweepStyle: 'soft',
    enableGlow: true, sweepDuration: 0, scanlineOpacity: 2, scanlineGap: -4 });
  assert.equal(screen.properties['--crt-line-color'], '#ffc864');
  assert.equal(screen.properties['--crt-line-direction'], 'to right');
  assert.equal(screen.dataset.crtSweepStyle, 'soft');
  assert.equal(screen.dataset.crtGlow, 'true');
  assert.equal(screen.properties['--crt-sweep-duration'], '0.5s');
  assert.equal(screen.properties['--crt-line-opacity'], '1');
  assert.equal(screen.properties['--crt-line-gap'], '0px');
});

test('tint saturation affects only CRT decoration and supports neutral/original endpoints', () => {
  for (const [input, expected] of [[0, '0'], [1, '1'], [-1, '0'], [2, '1'], [undefined, '1']]) {
    const screen = element();
    configureScreen(screen, { ...CRT_SETTINGS, tintSaturation: input });
    assert.equal(screen.properties['--crt-tint-saturation'], expected);
  }
  assert.match(stylesheet, /\.crt-scanlines, \.crt-edge-glow, \.crt-noise\s*\{\s*filter: saturate\(var\(--crt-tint-saturation, 1\)\);/);
  assert.match(stylesheet, /filter: saturate\(var\(--crt-tint-saturation, 1\)\) blur\(8px\);/);
  const rules = stylesheet.replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(rules, /(?:\.crt-surface|\bvideo|\bimg)[^{}]*\{[^}]*saturate\(/);
});

test('hero filters stay inside the sky clip; runtime is homepage-only', () => {
  const home = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const renderer = readFileSync(new URL('../templates/persona/render.mjs', import.meta.url), 'utf8');
  assert.match(home, /<g clip-path="url\(#hero-sky-clip\)">[\s\S]*?<foreignObject class="hero-crt-window"[\s\S]*?class="hero-crt-screen"/);
  assert.match(renderer, /home \? '<script type="module" src="\/assets\/js\/crt-effect\.js"/);
  assert.doesNotMatch(home, /hero-crt-pattern|hero-crt-sweep-shade/);
});

test('hero preserves its original sky color and shimmer without changing project treatment', () => {
  const { projects, heroes } = setup();
  for (const hero of heroes) {
    assert.equal(hero.properties['--crt-line-width'], '1px');
    assert.equal(hero.properties['--crt-line-gap'], '1px');
    assert.equal(hero.properties['--crt-line-color'], 'var(--hero-sky)');
    assert.equal(hero.properties['--crt-tint-saturation'], '1');
    assert.equal(hero.properties['--crt-sweep-color'], CRT_SETTINGS.hero.sweepColor);
    for (const name of ['curvature', 'vignette', 'edge-glow']) assert.equal(hasLayer(hero, name), false);
    for (const name of ['noise', 'scanlines', 'sweep', 'flicker']) assert.equal(hasLayer(hero, name), true);
    assert.equal(hero.properties['--crt-noise-opacity'], String(CRT_SETTINGS.noiseOpacity));
    assert.equal(hero.properties['--crt-flicker-intensity'], String(CRT_SETTINGS.flickerIntensity));
  }
  assert.equal(projects[0].properties['--crt-tint-saturation'], String(CRT_SETTINGS.tintSaturation));
  assert.equal(projects[0].properties['--crt-line-width'], '2px');
  assert.equal(projects[0].properties['--crt-line-gap'], '2px');
  assert.equal(hasLayer(projects[0], 'curvature'), CRT_SETTINGS.enableCurvature);
  assert.equal(projects[0].properties['--crt-sweep-color'], CRT_SETTINGS.sweepColor);
  assert.match(stylesheet, /\.hero-crt-window\s*\{[^}]*mix-blend-mode: screen;/);
});
