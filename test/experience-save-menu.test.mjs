import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../assets/js/experience-save-menu.js', import.meta.url), 'utf8');
function setup(reduced = false) {
  const animations = [];
  const element = () => ({ attrs: {}, events: {}, dataset: {},
    style: { setProperty(key, value) { this[key] = value; } }, offsetTop: 220, offsetHeight: 220,
    setAttribute(key, value) { this.attrs[key] = String(value); },
    addEventListener(type, fn) { this.events[type] = fn; },
    focus() { this.focused = true; },
    scrollIntoView() { this.revealed = true; },
    getBoundingClientRect() { return { top: 220, bottom: 440, height: 220, width: 1280 }; },
    animate(frames, timing) {
      const animation = { frames, timing, cancel() { this.cancelled = true; } };
      animations.push(animation);
      return animation;
    }
  });
  const options = Array.from({ length: 5 }, () => {
    const option = element(); option.querySelector = () => (option.sphere ||= {}); return option;
  });
  const list = element(); list.querySelectorAll = () => options;
  const up = element(), down = element(), menu = element();
  menu.querySelector = s => s === '[role="listbox"]' ? list : s === '[data-experience-up]' ? up : down;
  runInNewContext(source, { document: { querySelector: () => menu }, window: { innerHeight: 400, addEventListener() {} },
    matchMedia: () => ({ matches: reduced, addEventListener() {} }) });
  const key = key => list.events.keydown({ key, preventDefault() {} });
  const visible = () => options.map((o, i) => o.hidden ? null : i).filter(i => i !== null);
  const selected = () => options.filter(o => o.attrs['aria-selected'] === 'true');
  return { options, list, menu, up, down, key, visible, selected, animations };
}
test('Experience always exposes three complete options and exactly one selection', () => {
  const s = setup();
  assert.deepEqual(s.visible(), [0, 1, 2]);
  assert.equal(s.selected().length, 1);
  assert.equal(s.up.disabled, false);
  assert.equal(s.list.attrs['aria-activedescendant'], 'experience-option-2');
  assert.equal(s.options[0].attrs['aria-setsize'], '5');
});
test('Experience shifts use nonlinear easing, cancel on rapid input, and respect reduced motion', () => {
  const s = setup();
  s.key('ArrowDown');
  assert.ok(s.animations.length > 0);
  assert.equal(s.animations[0].timing.duration, 240);
  assert.equal(s.animations[0].timing.easing, 'cubic-bezier(0.25, 0.8, 0.25, 1)');
  assert.equal(s.animations[0].frames[0].transform, 'translateY(24px)');
  assert.equal(s.menu.style['--experience-row-height'], '220px');
  const previous = s.animations[0];
  s.key('ArrowUp');
  assert.equal(previous.cancelled, true);
  assert.equal(s.selected().length, 1);
  const reduced = setup(true);
  reduced.key('ArrowDown');
  assert.equal(reduced.animations.length, 0);
  assert.deepEqual(reduced.visible(), [1, 2, 3]);
});
test('Experience window advances one row and returns symmetrically', () => {
  const s = setup();
  s.key('ArrowDown');
  assert.deepEqual(s.visible(), [1, 2, 3]);
  assert.equal(s.list.attrs['aria-activedescendant'], 'experience-option-3');
  assert.equal(s.options[2].revealed, true);
  s.key('ArrowUp');
  assert.deepEqual(s.visible(), [0, 1, 2]);
  assert.equal(s.selected().length, 1);
});
test('Experience supports click, touch controls, Home/End and bounded selection', () => {
  const s = setup();
  s.options[2].events.click();
  assert.equal(s.list.focused, true);
  s.down.events.click();
  assert.deepEqual(s.visible(), [2, 3, 4]);
  s.key('End'); s.key('ArrowDown');
  assert.deepEqual(s.visible(), [2, 3, 4]);
  assert.equal(s.down.disabled, true);
  assert.equal(s.list.attrs['aria-activedescendant'], 'experience-option-5');
  s.key('Home'); s.key('ArrowUp');
  assert.equal(s.list.attrs['aria-activedescendant'], 'experience-option-1');
  assert.equal(s.selected().length, 1);
});
