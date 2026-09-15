import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const source = readFileSync(new URL('../assets/js/ribbon-menu.js', import.meta.url), 'utf8');
function setup(reduced = false, viewport = 1440, labels = ['About', 'Experience', 'Projects', 'Contact']) {
  let document;
  const element = (textContent = '') => ({
    getBoundingClientRect() { return { left: viewport - Math.min(480, viewport - 24) - 12, width: Math.min(480, viewport - 24) }; },
    textContent, style: { setProperty(name, value) { this[name] = value; } }, attrs: {}, events: {}, children: [],
    classList: { add() {}, toggle() {} },
    setAttribute(k, v) { this.attrs[k] = v; },
    addEventListener(k, v) { this.events[k] = v; },
    append(child) { this.children.push(child); },
    prepend(child) { this.children.unshift(child); },
    replaceChildren(...children) { this.children = children; },
    contains(target) { return target === this || this.children.includes(target); },
    focus() { document.activeElement = this; this.events.focus?.(); }
  });
  const trigger = element();
  const label = element();
  trigger.querySelector = () => label;
  const links = labels.map(element);
  links.forEach(link => { link.dataset = { menuDescription: `${link.textContent} details` }; });
  const nav = element(); nav.children = [...links]; nav.querySelectorAll = () => links;
  document = element(); document.body = element();
  document.querySelector = s => s === '[data-ribbon-trigger]' ? trigger : nav;
  document.createElement = document.createElementNS = () => element();
  const frames = new Map(); let id = 0; let now = 0;
  const motion = { matches: reduced, addEventListener(k, handler) { this.change = handler; } };
  runInNewContext(source, { document, matchMedia: () => motion, window: Object.assign(element(), { innerWidth: viewport }),
    requestAnimationFrame(fn) { frames.set(++id, fn); return id; },
    cancelAnimationFrame(id) { frames.delete(id); }
  });
  const step = (count = 1) => { for (let i = 0; i < count; i++) {
    now += 16; const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn(now));
  } };
  const finish = () => {
    for (let count = 0; frames.size && count < 1000; count++) step();
    assert.equal(frames.size, 0, 'animation must finish');
  };
  const event = (key, target = trigger) => ({ key, target, preventDefault() { this.defaultPrevented = true; } });
  return { document, trigger, nav, links, motion, step, event, frames, finish };
}
test('ribbon menu opens and closes with synchronized accessibility state', () => {
  const { trigger, nav, links, step } = setup(); step(2);
  assert.equal(nav.hidden, true); assert.equal(nav.inert, true);
  trigger.events.click(); step(45);
  assert.equal(trigger.attrs['aria-expanded'], 'true');
  assert.equal(nav.hidden, false); assert.equal(nav.inert, false);
  assert.ok(links.every(link => link.style.opacity === 1));
  trigger.events.click(); assert.equal(nav.inert, true); step(30);
  assert.equal(nav.hidden, true); assert.equal(trigger.attrs['aria-expanded'], 'false');
});
test('selection description follows hover and keyboard focus and shares reduced-motion state', () => {
  const { trigger, nav, links, event } = setup(true);
  const description = nav.children.find(child => child.className === 'menu-selection-description');
  trigger.events.click();
  assert.equal(description.textContent, 'About details');
  assert.equal(description.style.opacity, 1);
  links[2].events.pointerenter();
  assert.equal(description.textContent, 'Projects details');
  links[1].focus();
  assert.equal(description.textContent, 'Experience details');
  links[2].events.pointerleave();
  assert.equal(description.textContent, 'Experience details');
  nav.events.keydown(event('End'));
  assert.equal(description.textContent, 'Contact details');
  trigger.events.click();
  assert.equal(description.style.opacity, 0);
});
test('rapid reversal preserves ribbon geometry on the toggle frame and settles', () => {
  const { trigger, nav, step, frames } = setup();
  trigger.events.click(); step(18);
  const paths = nav.children[0].children;
  const before = paths.map(path => path.attrs.d);
  trigger.events.click();
  assert.deepEqual(paths.map(path => path.attrs.d), before);
  step(4); trigger.events.click(); step(45);
  assert.equal(nav.hidden, false); assert.equal(frames.size, 0);
  assert.ok(paths.every(path => !/NaN|Infinity/.test(path.attrs.d)));
});
test('arrows, Home/End, Escape and focus departure work without trapping focus', () => {
  const { trigger, nav, links, document, event } = setup();
  trigger.events.keydown(event('ArrowDown'));
  assert.equal(document.activeElement, links[0]);
  nav.events.keydown(event('End')); assert.equal(document.activeElement, links[3]);
  nav.events.keydown(event('ArrowDown')); assert.equal(document.activeElement, links[0]);
  nav.events.keydown(event('ArrowUp')); assert.equal(document.activeElement, links[3]);
  nav.events.keydown(event('Home')); assert.equal(document.activeElement, links[0]);
  const escape = event('Escape'); document.events.keydown(escape);
  assert.equal(escape.defaultPrevented, true); assert.equal(document.activeElement, trigger);
  assert.equal(trigger.attrs['aria-expanded'], 'false');
  trigger.events.click(); document.events.focusin(event('', {}));
  assert.equal(trigger.attrs['aria-expanded'], 'false');
});
test('outside click dismisses and selecting a link restores focus', () => {
  const { trigger, links, document, event } = setup();
  trigger.events.click(); links[1].focus(); document.events.pointerdown(event('', {}));
  assert.equal(trigger.attrs['aria-expanded'], 'false'); assert.equal(document.activeElement, trigger);
  trigger.events.click(); links[0].events.click();
  assert.equal(trigger.attrs['aria-expanded'], 'false');
});
test('reduced motion settles immediately, including changes during animation', () => {
  const { trigger, nav, links, motion, frames, step } = setup(true);
  trigger.events.click(); assert.equal(frames.size, 0);
  assert.ok(links.every(link => link.style.opacity === 1));
  trigger.events.click(); assert.equal(nav.hidden, true);
  motion.matches = false; motion.change(); trigger.events.click(); step(12);
  motion.matches = true; motion.change();
  assert.equal(frames.size, 0); assert.equal(nav.hidden, false);
  assert.ok(links.every(link => link.style.opacity === 1));
});

for (const viewport of [320, 390, 1440]) {
  test(`ribbons enter from both screen edges and settle within the menu at ${viewport}px`, () => {
    const { trigger, nav, step } = setup(false, viewport);
    trigger.events.click(); step(1);
    const svg = nav.children[0];
    const paths = svg.children;
    const left = path => Number(path.attrs.d.split(' ')[1]);
    assert.ok(paths.length >= 2);
    assert.ok(left(paths[0]) < 0);
    assert.ok(left(paths[paths.length / 2]) > viewport);
    assert.equal(svg.attrs.viewBox, `0 0 ${viewport} 640`);
    step(45);
    const rect = nav.getBoundingClientRect();
    assert.ok(paths.every(path => left(path) >= rect.left && left(path) < rect.left + rect.width));
  });
}

test('bands enter as separated opposing arches and settle into connected straight bars', () => {
  const { trigger, nav, step } = setup();
  trigger.events.click(); step(15);
  const paths = nav.children[0].children;
  const coords = path => path.attrs.d.match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/g).map(Number);
  for (let i = 0; i < paths.length; i++) {
    const p = coords(paths[i]);
    assert.ok(i < paths.length / 2 ? p[2] > p[0] : p[2] < p[0]);
    assert.equal(p[2], p[4]);
    // Every handle and endpoint across the extended middle has the same x.
    for (const xIndex of [8, 10, 12, 14, 16, 18]) assert.equal(p[xIndex], p[6]);
    assert.equal(p[7], 160);
    assert.equal(p[19], 480);
    if (i !== paths.length / 2 - 1 && i !== paths.length - 1) {
      const next = coords(paths[i + 1]);
      const gap = next[0] - p[26];
      assert.ok(Number.isFinite(gap) && gap > 0);
      assert.ok(Math.abs(next[4] - p[46] - gap) < 1e-8);
      assert.ok(Math.abs(next[2] - p[48] - gap) < 1e-8);
    }
  }
  step(35);
  for (let i = 0; i < paths.length; i++) {
    const p = coords(paths[i]);
    assert.equal(p[0], p[2]);
    assert.equal(p[0], p[4]);
    if (i + 1 < paths.length) assert.ok(Math.abs(p[26] - coords(paths[i + 1])[0]) < 1e-8);
  }
});

test('the two middle bands are the thickest and the layer escapes the header', () => {
  const { trigger, nav, document, step } = setup();
  assert.ok(document.body.children.includes(nav));
  trigger.events.click(); step(45);
  const widths = nav.children[0].children.map(path => {
    const p = path.attrs.d.match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/g).map(Number);
    assert.ok(p[1] <= 0 && p[25] >= 640);
    return p[26] - p[0];
  });
  const mid = widths.length / 2;
  assert.ok(widths.every((width, i) => i === mid - 1 || i === mid || width < Math.min(widths[mid - 1], widths[mid])));
});

test('keyboard hints are secondary noninteractive instructions synchronized with the menu', () => {
  const { trigger, nav, step } = setup();
  const hints = nav.children.find(child => child.className === 'menu-input-hints');
  assert.equal(hints.children.length, 3);
  assert.deepEqual(hints.children.map(group => group.children.at(-1).textContent), ['Navigate', 'Open', 'Close']);
  assert.deepEqual(hints.children[0].children.slice(0, 2).map(key => key.textContent), ['↑', '↓']);
  assert.ok(hints.children.every(group => !group.attrs.tabindex && !Object.keys(group.events).length));
  trigger.events.click(); step(1);
  assert.equal(hints.style.opacity, 0);
  step(45); assert.equal(hints.style.opacity, 1);
  trigger.events.click(); step(12); assert.equal(hints.style.opacity, 0);
});
test('keyboard hints settle immediately for reduced motion', () => {
  const { trigger, nav } = setup(true);
  const hints = nav.children.find(child => child.className === 'menu-input-hints');
  trigger.events.click(); assert.equal(hints.style.opacity, 1);
  trigger.events.click(); assert.equal(hints.style.opacity, 0);
});

test('header and bottom hints share the ribbon timeline and reverse smoothly', () => {
  const { trigger, document, nav, step, finish } = setup();
  trigger.events.click(); step(12);
  const partial = document.body.style['--menu-chrome-progress'];
  assert.ok(partial > 0 && partial < 1);
  trigger.events.click(); step(4);
  assert.ok(document.body.style['--menu-chrome-progress'] < partial);
  trigger.events.click(); finish();
  assert.equal(document.body.style['--menu-chrome-progress'], 1);
  nav.children.find(child => child.className === 'ribbon-menu-close').events.click();
  finish();
  assert.equal(document.body.style['--menu-chrome-progress'], 0);
  assert.equal(nav.hidden, true);
});

test('six-link navigation fully reveals every label and reverses cleanly', () => {
  const { trigger, links, step, finish } = setup(false, 1440,
    ['Home', 'About', 'Skills', 'Experience', 'Projects', 'Contact']);
  trigger.events.click(); step(20);
  trigger.events.click(); step(5);
  trigger.events.click(); finish();
  for (const link of links) {
    assert.equal(link.style.opacity, 1, link.textContent);
    assert.equal(link.style.translate, '0 0px');
  }
  trigger.events.click(); finish();
  assert.ok(links.every(link => link.style.opacity === 0));
});
