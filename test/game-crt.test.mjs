import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { initGameCrt } from '../assets/js/game-crt.js';
import { CRT_SETTINGS } from '../assets/js/crt-settings.js';

function element() {
  const item = {
    dataset: {}, children: [], properties: {}, events: {},
    classList: { add() {} },
    append(child) { this.children.push(child); },
    setAttribute(name, value) { this[name] = value; },
    addEventListener(name, callback) { this.events[name] = callback; },
    querySelector() { return null; }
  };
  item.style = { setProperty: (name, value) => { item.properties[name] = value; } };
  return item;
}
function setup({ settings = { ...CRT_SETTINGS, game: { ...CRT_SETTINGS.game, defaultEnabled: false } }, reduced = false, observe = true } = {}) {
  const stage = element();
  const canvas = element();
  stage.append(canvas);
  const controls = element();
  controls.querySelector = () => controls.children.find(child => 'gameCrt' in child.dataset);
  const television = { querySelector: selector => selector === '.tv-secondary-controls' ? controls : stage };
  const events = {};
  const motion = { matches: reduced, addEventListener: (_, callback) => { events.motion = callback; } };
  let notify;
  const document = {
    hidden: false, querySelector: () => television,
    createElement: element, getElementById: () => null,
    addEventListener: (name, callback) => { events[name] = callback; }
  };
  const window = { matchMedia: () => motion };
  if (observe) window.IntersectionObserver = class {
    constructor(callback) { notify = callback; }
    observe(target) { assert.equal(target, stage); }
  };
  initGameCrt(document, window, settings);
  return { document, window, controls, stage, canvas, motion, events,
    button: controls.children[0], overlay: stage.children[1],
    show: visible => notify([{ isIntersecting: visible }]) };
}

test('production CRT starts enabled with stronger scanlines and can still be switched off', () => {
  const { button, overlay } = setup({ settings: CRT_SETTINGS });
  assert.equal(button['aria-pressed'], 'true');
  assert.equal(overlay.hidden, false);
  assert.equal(overlay.properties['--crt-line-opacity'], '0.3');
  button.events.click();
  assert.equal(button['aria-pressed'], 'false');
  assert.equal(overlay.hidden, true);
});

test('clean-screen override toggles both ways and never replaces or modifies gameplay', () => {
  const { button, overlay, stage, canvas, show } = setup();
  assert.equal(button.type, 'button');
  assert.equal(button['aria-label'], 'CRT effect');
  assert.equal(button['aria-pressed'], 'false');
  assert.equal(overlay.hidden, true);
  assert.equal(overlay['aria-hidden'], 'true');
  show(true);
  button.events.click();
  assert.equal(button['aria-pressed'], 'true');
  assert.equal(button.title, 'Turn CRT effect off');
  assert.equal(overlay.hidden, false);
  assert.equal(overlay.dataset.crtActive, 'true');
  const layers = [...overlay.children];
  button.events.click();
  assert.equal(button['aria-pressed'], 'false');
  assert.equal(overlay.hidden, true);
  assert.equal(overlay.dataset.crtActive, 'false');
  button.events.click();
  assert.deepEqual(overlay.children, layers);
  assert.equal(stage.children[0], canvas);
  assert.deepEqual(canvas.dataset, {});
  assert.deepEqual(canvas.events, {});
  assert.equal(button.disabled, undefined); // Available even before Start.
});

test('effects pause offscreen, in hidden tabs and with reduced motion', () => {
  const { button, overlay, document, events, motion, show } = setup();
  button.events.click();
  assert.equal(overlay.dataset.crtActive, 'false');
  show(true);
  assert.equal(overlay.dataset.crtActive, 'true');
  document.hidden = true;
  events.visibilitychange();
  assert.equal(overlay.dataset.crtActive, 'false');
  document.hidden = false;
  events.visibilitychange();
  assert.equal(overlay.dataset.crtActive, 'true');
  motion.matches = true;
  events.motion();
  assert.equal(overlay.dataset.crtActive, 'false');
  assert.equal(overlay.hidden, false); // Static scanlines are still available.
  motion.matches = false;
  events.motion();
  show(false);
  assert.equal(overlay.dataset.crtActive, 'false');
});

test('game overrides inherit shared parameters and initialization is idempotent', () => {
  const state = setup({ settings: { ...CRT_SETTINGS, game: { defaultEnabled: true, scanlineOpacity: .1 } } });
  assert.equal(state.overlay.hidden, false);
  assert.equal(state.overlay.properties['--crt-line-opacity'], '0.1');
  assert.equal(state.overlay.properties['--crt-sweep-duration'], `${CRT_SETTINGS.sweepDuration}s`);
  initGameCrt(state.document, state.window);
  assert.equal(state.controls.children.length, 1);
  assert.equal(state.stage.children.length, 2);
});

test('master switch removes optional controls; missing observer keeps texture static', () => {
  const disabled = setup({ settings: { ...CRT_SETTINGS, enabled: false } });
  assert.equal(disabled.button, undefined);
  assert.equal(disabled.overlay, undefined);
  const fallback = setup({ observe: false });
  fallback.button.events.click();
  assert.equal(fallback.overlay.hidden, false);
  assert.equal(fallback.overlay.dataset.crtActive, 'false');
});

test('a late interactive module mounts immediately and the DOM-ready retry is harmless', () => {
  const state = setup({ settings: { ...CRT_SETTINGS, enabled: false } });
  state.document.readyState = 'interactive';
  const source = readFileSync(new URL('../assets/js/game-crt.js', import.meta.url), 'utf8');
  const bootstrap = source.slice(source.lastIndexOf("if (typeof document !== 'undefined')"));
  vm.runInNewContext(bootstrap, { document: state.document, window: state.window, initGameCrt });
  assert.equal(state.controls.children.length, 1);
  state.events.DOMContentLoaded();
  assert.equal(state.controls.children.length, 1);
});

test('an early module waits for the TV builders before mounting', () => {
  const state = setup({ settings: { ...CRT_SETTINGS, enabled: false } });
  state.document.readyState = 'loading';
  const findTv = state.document.querySelector;
  state.document.querySelector = () => null;
  const source = readFileSync(new URL('../assets/js/game-crt.js', import.meta.url), 'utf8');
  const bootstrap = source.slice(source.lastIndexOf("if (typeof document !== 'undefined')"));
  vm.runInNewContext(bootstrap, { document: state.document, window: state.window, initGameCrt });
  assert.equal(state.controls.children.length, 0);
  state.document.querySelector = findTv;
  state.events.DOMContentLoaded();
  assert.equal(state.controls.children.length, 1);
});

test('overlay is pointer-transparent, off means fully hidden, and results stay above it', () => {
  const css = readFileSync(new URL('../assets/themes/persona/tv-frame.css', import.meta.url), 'utf8');
  assert.match(css, /\.game-crt-overlay\s*\{[^}]*pointer-events: none/);
  assert.match(css, /\.game-crt-overlay\[hidden\]\s*\{ display: none;/);
  assert.match(css, /body\.persona-tv-screen \.game-overlay\s*\{ z-index: 10;/);
});

test('every Persona footer owns the HUD clearance instead of exposing yellow body padding', () => {
  const css = readFileSync(new URL('../assets/themes/persona/style.css', import.meta.url), 'utf8');
  assert.match(css, /\.persona-design\s*\{\s*padding-bottom: 0;/);
  assert.match(css, /\.persona-design \.site-footer\s*\{\s*padding-bottom: calc\(30px \+ var\(--hud-height\)\);/);
});
