import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CURSOR_TRAIL, initCursorTrail, positionAt } from '../assets/js/cursor-trail.js';

function setup({ fine = true, reduced = false } = {}) {
  const events = {};
  const windowEvents = {};
  const frames = new Map();
  const media = [
    { matches: fine, addEventListener: (_, callback) => { events.pointerPreference = callback; } },
    { matches: reduced, addEventListener: (_, callback) => { events.motionPreference = callback; } },
  ];
  let time = 0;
  let id = 0;
  const createElement = () => ({ style: {}, children: [], append(child) { this.children.push(child); }, setAttribute(name, value) { this[name] = value; } });
  const body = createElement();
  const document = {
    body, hidden: false, pointerLockElement: null, createElement,
    querySelector: () => body.children[0],
    addEventListener: (name, callback) => { events[name] = callback; },
  };
  const window = {
    matchMedia: query => media[query.includes('reduced') ? 1 : 0],
    performance: { now: () => time },
    requestAnimationFrame(callback) { frames.set(++id, callback); return id; },
    cancelAnimationFrame(frame) { frames.delete(frame); },
    addEventListener: (name, callback) => { windowEvents[name] = callback; },
  };
  initCursorTrail(document, window, { ...CURSOR_TRAIL, enabled: true });
  return {
    body, document, window, events, windowEvents, media, frames,
    move(x, y, at, pointerType = 'mouse', editable = false) {
      time = at;
      events.pointermove({ clientX: x, clientY: y, pointerType, target: { closest: () => editable ? {} : null } });
    },
    tick(at) {
      time = at;
      const callbacks = [...frames.values()];
      frames.clear();
      callbacks.forEach(callback => callback(at));
    }
  };
}

test('trail is disabled by default without installing listeners or creating elements', () => {
  assert.equal(CURSOR_TRAIL.enabled, false);
  // Empty environments prove the disabled path never accesses the DOM or browser.
  assert.doesNotThrow(() => initCursorTrail({}, {}));
});

test('time sampling follows the path, interpolates evenly and clamps at its endpoints', () => {
  const points = [{ time: 0, x: 0, y: 20 }, { time: 100, x: 100, y: 120 }];
  assert.deepEqual(positionAt(points, 50), { x: 50, y: 70 });
  assert.deepEqual(positionAt(points, -10), points[0]);
  assert.deepEqual(positionAt(points, 110), points[1]);
});

test('seven rainbow echoes follow movement, then disappear and stop scheduling frames', () => {
  const state = setup();
  assert.equal(state.body.children.length, 0);
  state.move(10, 20, 0);
  state.move(250, 20, 168);
  state.tick(168);
  const layer = state.body.children[0];
  assert.equal(layer['aria-hidden'], 'true');
  assert.equal(layer.children.length, 7);
  assert.deepEqual(layer.children.map(echo => echo.style.color), CURSOR_TRAIL.colors);
  assert.equal(layer.hidden, false);
  assert.equal(new Set(layer.children.map(echo => echo.style.transform)).size, 7);
  assert.ok(layer.children.every(echo => Number(echo.style.opacity) > 0));
  assert.equal(state.frames.size, 1);
  state.tick(408);
  assert.equal(layer.hidden, true);
  assert.equal(state.frames.size, 0);
  state.move(800, 400, 600);
  state.tick(600);
  assert.ok(layer.children.every(echo => Number(echo.style.opacity) === 0)); // No streak from the old position.
  assert.equal(state.body.children.length, 1);
});

test('touch, pen, reduced motion and coarse pointers create no visual or animation loop', () => {
  for (const options of [{ fine: false }, { reduced: true }]) {
    const state = setup(options);
    state.move(100, 100, 0);
    assert.equal(state.body.children.length, 0);
    assert.equal(state.frames.size, 0);
  }
  for (const pointerType of ['touch', 'pen']) {
    const state = setup();
    state.move(100, 100, 0, pointerType);
    assert.equal(state.body.children.length, 0);
  }
});

test('leaving, scrolling, keyboard use, tab hiding and motion preference changes clear immediately', () => {
  const state = setup();
  for (const cancel of [
    () => state.events.pointerout({ relatedTarget: null }),
    () => state.windowEvents.blur(), () => state.windowEvents.scroll(),
    () => state.windowEvents.pagehide(), () => state.events.keydown(),
    () => state.events.visibilitychange(), () => state.events.motionPreference(),
    () => state.events.pointerPreference(), () => state.events.pointerlockchange(),
    () => state.events.pointercancel(),
  ]) {
    state.move(10, 10, 0);
    state.move(90, 90, 100);
    state.tick(100);
    cancel();
    assert.equal(state.body.children[0].hidden, true);
    assert.equal(state.frames.size, 0);
  }
});

test('moving between page elements continues, while editable controls and pointer lock suppress echoes', () => {
  const state = setup();
  state.move(10, 10, 0);
  state.events.pointerout({ relatedTarget: {} });
  assert.equal(state.frames.size, 1);
  state.move(50, 50, 10, 'mouse', true);
  assert.equal(state.frames.size, 0);
  state.document.pointerLockElement = {};
  state.move(100, 100, 20);
  assert.equal(state.frames.size, 0);
  state.document.pointerLockElement = null;
  state.document.hidden = true;
  state.move(120, 120, 30);
  assert.equal(state.frames.size, 0);
});

test('echo overlay preserves native cursors and cannot intercept input or overflow the viewport', () => {
  const css = readFileSync(new URL('../assets/themes/persona/cursor-trail.css', import.meta.url), 'utf8');
  assert.match(css, /pointer-events: none/);
  assert.match(css, /contain: strict/);
  assert.match(css, /overflow: hidden/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(css, /cursor\s*:/);
});
