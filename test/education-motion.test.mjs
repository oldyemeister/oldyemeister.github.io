import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { SCROLL_ANIMATION } from '../assets/js/scroll-animation-config.js';
import { educationFrameProgress, shouldShineRibbon } from '../assets/js/education-motion.js';

test('ribbon shine requires a crossing after the last scroll went down, with a real previous frame', () => {
  assert.equal(shouldShineRibbon(.99, 1, true, false), true);
  assert.equal(shouldShineRibbon(0, 1, true, false), true, 'downward anchor jump');
  // Damping lands on 1 after the page stopped: the last movement still counts.
  assert.equal(shouldShineRibbon(.9995, 1, true, false), true, 'damping after a downward scroll stops');
  assert.equal(shouldShineRibbon(null, 1, true, false), false, 'initial/restored page');
  assert.equal(shouldShineRibbon(undefined, 1, true, false), false);
  assert.equal(shouldShineRibbon(.99, 1, false, false), false, 'upward crossing');
  assert.equal(shouldShineRibbon(.99, 1, null, false), false, 'no scroll seen yet');
  assert.equal(shouldShineRibbon(.99, .999, true, false), false);
  assert.equal(shouldShineRibbon(1, 1, true, false), false);
  assert.equal(shouldShineRibbon(.99, 1, true, true), false, 'already shone');
});

test('frame trace uses the configurable final portion of ribbon progress and reverses exactly', () => {
  const start = SCROLL_ANIMATION.education.frameStartAt;
  for (const value of [-1, 0, start]) assert.equal(educationFrameProgress(value), 0);
  assert.ok(Math.abs(educationFrameProgress((start + 1) / 2) - .5) < 1e-12);
  assert.equal(educationFrameProgress(1), 1);
  assert.equal(educationFrameProgress(2), 1);
  assert.equal(educationFrameProgress(.625, .25), .5);
  const forward = [0, .55, .7, .9, 1].map(value => educationFrameProgress(value));
  assert.deepEqual([1, .9, .7, .55, 0].map(value => educationFrameProgress(value)), forward.toReversed());
});

function harness() {
  const element = () => ({
    attrs: new Map(), listeners: {}, style: { setProperty() {} },
    setAttribute(name, value) { this.attrs.set(name, value); },
    removeAttribute(name) { this.attrs.delete(name); },
    toggleAttribute(name, enabled) { if (enabled) this.attrs.set(name, ''); else this.attrs.delete(name); },
    addEventListener(name, callback) { this.listeners[name] = callback; }
  });
  const section = element(), card = element(), overlay = element(), rect = element(), ribbon = element(), chip = element();
  let bounds = { top: 500, bottom: 535, left: 60, right: 220, width: 160, height: 35 };
  chip.getBoundingClientRect = () => bounds;
  section.querySelector = selector => selector === '.education-card' ? card : ribbon;
  card.querySelector = selector => selector === '.education-frame-trace' ? overlay : chip;
  overlay.querySelector = () => rect;
  let now = 0, timerId = 0;
  const timers = new Map();
  const source = readFileSync(new URL('../assets/js/education-motion.js', import.meta.url), 'utf8')
    .replace(/^import .*;$/gm, '').replace(/export /g, '');
  const context = {
    settings: SCROLL_ANIMATION, document: { hidden: false, addEventListener() {} },
    window: { innerWidth: 1440, innerHeight: 900 }, performance: { now: () => now },
    getComputedStyle: () => ({ width: '1024px', height: '383px', borderTopWidth: '12px', borderTopLeftRadius: '24px' }),
    addEventListener() {},
    setTimeout: (callback, delay) => { timers.set(++timerId, { callback, at: now + delay }); return timerId; },
    clearTimeout: id => timers.delete(id)
  };
  runInNewContext(source, context);
  const motion = context.createEducationMotion(section);
  const advance = time => {
    now = time;
    for (const [id, timer] of timers) if (timer.at <= now) { timers.delete(id); timer.callback(); }
  };
  return { motion, section, rect, overlay, ribbon, chip, timers, advance,
    visible(value) { bounds = { ...bounds, bottom: value ? 535 : 950 }; },
    hide(value) { context.document.hidden = value; },
    shining: element => element.attrs.has('data-shining') };
}

test('trace matches the measured rounded border and both shines clean up without replay', () => {
  const h = harness();
  assert.equal(h.overlay.attrs.get('viewBox'), '0 0 1024 383');
  assert.equal(h.rect.attrs.get('rx'), 18);
  assert.equal(h.rect.attrs.get('x'), 6);
  assert.equal(h.rect.attrs.get('width'), 1012);
  h.motion.update(0, null, null, true);
  assert.equal(h.section.attrs.has('data-frame-tracing'), true);
  h.motion.update(1, 0, true);
  assert.equal(h.section.attrs.has('data-frame-tracing'), false);
  assert.equal(h.shining(h.ribbon), true);
  assert.equal(h.shining(h.chip), false);
  h.advance(249);
  assert.equal(h.shining(h.chip), false);
  h.advance(250);
  assert.equal(h.shining(h.chip), true);
  for (const element of [h.ribbon, h.chip]) element.listeners.animationend({ target: element });
  assert.equal(h.shining(h.ribbon), false);
  assert.equal(h.shining(h.chip), false);
  h.motion.update(.5, 1, false);
  h.motion.update(1, .5, true);
  h.advance(2000);
  assert.equal(h.shining(h.ribbon), false);
  assert.equal(h.shining(h.chip), false);
});

test('the honour waits until fully visible and rechecks visibility after its delay', () => {
  const h = harness();
  h.motion.update(0, null, null, true);
  h.motion.update(1, 0, true);
  h.visible(false);
  h.advance(250);
  assert.equal(h.shining(h.chip), false);
  assert.equal(h.timers.size, 0);
  h.visible(true);
  h.motion.update(1, 1, true);
  assert.equal(h.shining(h.chip), true);
});

test('an initially complete or restored page never plays either shine, even after revisiting', () => {
  const h = harness();
  h.motion.update(1, null, null, true);
  h.motion.update(.5, 1, false);
  h.motion.update(1, .5, true);
  h.advance(2000);
  assert.equal(h.shining(h.ribbon), false);
  assert.equal(h.shining(h.chip), false);
});

test('reduced motion finishes the card and cancels active or delayed shines', () => {
  const h = harness();
  h.motion.update(0, null, null, true);
  h.motion.update(1, 0, true);
  h.motion.finish();
  h.advance(2000);
  assert.equal(h.section.attrs.has('data-frame-tracing'), false);
  assert.equal(h.shining(h.ribbon), false);
  assert.equal(h.shining(h.chip), false);
  assert.equal(h.timers.size, 0);
});

test('a started shine finishes through a small upward nudge; a hidden tab keeps it for later', () => {
  const h = harness();
  h.motion.update(0, null, null, true);
  h.motion.update(1, 0, true);
  assert.equal(h.shining(h.ribbon), true);
  h.motion.update(.98, 1, false);
  assert.equal(h.shining(h.ribbon), true, 'not cut off mid-sweep');

  const hidden = harness();
  hidden.motion.update(0, null, null, true);
  hidden.hide(true);
  hidden.motion.update(1, 0, true);
  assert.equal(hidden.shining(hidden.ribbon), false);
  hidden.hide(false);
  hidden.motion.update(.5, 1, false);
  hidden.motion.update(1, .5, true);
  assert.equal(hidden.shining(hidden.ribbon), true, 'not consumed while hidden');
});
