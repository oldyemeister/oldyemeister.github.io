import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../assets/js/site.js', import.meta.url), 'utf8');
function element(top) {
  const classes = new Set();
  const properties = {};
  return {
    classList: { add: (...names) => names.forEach(name => classes.add(name)), contains: name => classes.has(name) },
    style: { setProperty: (key, value) => { properties[key] = value; } },
    getBoundingClientRect: () => ({ top, bottom: top + 400 }),
    properties
  };
}
function setup({ reduced = false, observerAvailable = true } = {}) {
  const targets = [element(790), ...Array.from({ length: 6 }, (_, i) => element(2000 + i * 500))];
  const root = { ...element(0), dataset: { theme: 'dark' } };
  let observer;
  class Observer {
    constructor(callback, options) {
      Object.assign(this, { callback, options, observed: new Set() });
      observer = this;
    }
    observe(target) { this.observed.add(target); }
    unobserve(target) { this.observed.delete(target); }
  }
  const window = {
    innerHeight: 800, location: { hash: '' }, dispatchEvent() {},
    matchMedia: query => ({ matches: query.includes('reduced-motion') && reduced, addEventListener() {} })
  };
  if (observerAvailable) window.IntersectionObserver = Observer;
  runInNewContext(source, {
    window, IntersectionObserver: Observer, CustomEvent: class {},
    document: {
      documentElement: root, querySelector: () => null,
      querySelectorAll: selector => selector === '.experience-list, .project-grid'
        ? [{ children: targets.slice(1) }] : targets
    }
  });
  return { targets, observer, root };
}

test('content at the viewport bottom starts revealed, with an early observer margin', () => {
  const { targets, observer } = setup();
  assert.ok(targets[0].classList.contains('is-revealed'));
  assert.ok(!observer.observed.has(targets[0]));
  assert.equal(observer.options.rootMargin, '160px 0px');
  assert.equal(observer.options.threshold, 0);
  assert.deepEqual(targets.slice(1).map(e => e.properties['--reveal-delay']),
    ['0ms', '30ms', '60ms', '60ms', '60ms', '60ms']);
});

test('a fast jump directly into view skips the stagger and reveals only once', () => {
  const { targets, observer } = setup();
  const target = targets.at(-1);
  observer.callback([{ target, isIntersecting: false }], observer);
  assert.ok(!target.classList.contains('is-revealed'));
  observer.callback([{ target, isIntersecting: true, boundingClientRect: { top: 300, bottom: 700 } }], observer);
  assert.equal(target.properties['--reveal-delay'], '0ms');
  assert.ok(target.classList.contains('is-revealed'));
  assert.ok(!observer.observed.has(target));
});

test('reduced motion and browsers without an observer leave content revealed', () => {
  for (const options of [{ reduced: true }, { observerAvailable: false }]) {
    const { targets, observer, root } = setup(options);
    assert.equal(observer, undefined);
    assert.ok(targets.every(e => e.classList.contains('is-revealed')));
    assert.ok(!root.classList.contains('reveal-enabled'));
  }
});
