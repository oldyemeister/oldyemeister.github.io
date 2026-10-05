import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

test('manual pause freezes frames and remains paused across viewport/visibility changes', () => {
  const callbacks = new Map();
  const events = {};
  const frames = [];
  const resumed = [];
  let observer, id = 0, now = 100;
  const context = {
    performance: { now: () => now },
    requestAnimationFrame(fn) { callbacks.set(++id, fn); return id; },
    cancelAnimationFrame(id) { callbacks.delete(id); },
    document: { hidden: false, addEventListener(name, fn) { events[name] = fn; } },
    IntersectionObserver: class { constructor(fn) { observer = fn; } observe() {} }
  };
  context.window = { IntersectionObserver: context.IntersectionObserver };
  const source = readFileSync(new URL('../assets/js/viewport-loop.js', import.meta.url), 'utf8');
  runInNewContext(source.replace('export function', 'function'), context);
  const element = { dataset: {} };
  const loop = context.createViewportLoop(element, time => frames.push(time), time => resumed.push(time));
  const tick = () => {
    now += 16;
    for (const [key, fn] of [...callbacks]) { callbacks.delete(key); fn(now); }
  };
  observer([{ isIntersecting: true }]);
  tick();
  assert.equal(frames.length, 1);
  loop.setPaused(true);
  tick();
  assert.equal(callbacks.size, 0);
  assert.equal(element.dataset.rendering, 'paused');
  observer([{ isIntersecting: false }]);
  observer([{ isIntersecting: true }]);
  context.document.hidden = true;
  events.visibilitychange();
  context.document.hidden = false;
  events.visibilitychange();
  tick();
  assert.equal(frames.length, 1);
  now += 10000;
  loop.setPaused(false);
  assert.equal(resumed.at(-1), now, 'resume gets a fresh clock rather than accumulating paused time');
  assert.equal(element.dataset.rendering, 'active');
  loop.setPaused(false);
  assert.equal(callbacks.size, 1, 'repeat resume never starts a second loop');
  tick();
  assert.equal(frames.length, 2);
  observer([{ isIntersecting: false }]);
  assert.equal(callbacks.size, 0);
});
