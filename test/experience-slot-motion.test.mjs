import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../assets/themes/persona/experience-save-menu.js', import.meta.url), 'utf8');
function setup(reduced = false) {
  const animations = [], media = { matches: reduced, addEventListener(_, fn) { this.change = fn; } }, events = {};
  const element = () => ({ attrs: {}, dataset: {}, events: {}, offsetTop: 0, offsetHeight: 220, offsetWidth: 80,
    style: { setProperty(key, value) { this[key] = value; } },
    setAttribute(key, value) { this.attrs[key] = String(value); },
    removeAttribute(key) { delete this.attrs[key]; },
    addEventListener(key, fn) { this.events[key] = fn; },
    focus() { this.focused = true; }, scrollIntoView() {},
    append() {}, insertBefore(child) { this.band = child; },
    getBoundingClientRect() { return { top: this.offsetTop, left: 0, width: this.offsetWidth, height: this.offsetHeight, bottom: this.offsetTop + this.offsetHeight }; },
    animate(frames, timing) {
      let resolve, reject;
      const animation = { target: this, frames, timing, finished: new Promise((yes, no) => { resolve = yes; reject = no; }),
        cancel() { this.cancelled = true; reject(); }, finish() { resolve(); } };
      animations.push(animation); return animation;
    }
  });
  const row = () => {
    const row = element(), sphere = element(), number = element();
    sphere.offsetHeight = 80;
    row.querySelector = s => s.includes('sphere') ? sphere : s.includes('number') ? number : null;
    row.sphere = sphere; row.number = number;
    return row;
  };
  const options = Array.from({ length: 5 }, row), fillers = [row(), row()], rows = [fillers[0], ...options, fillers[1]];
  const list = element(), menu = element(), up = element(), down = element();
  list.offsetHeight = 660;
  list.querySelectorAll = selector => selector.includes('filler') ? fillers : options;
  menu.querySelector = selector => selector.includes('listbox') ? list : selector.includes('-up') ? up : down;
  runInNewContext(source, { document: { querySelector: () => menu, createElement: element, addEventListener() {} },
    window: { innerHeight: 900, addEventListener(key, fn) { events[key] = fn; } }, matchMedia: () => media });
  const key = key => list.events.keydown({ key, preventDefault() {} });
  const finish = async () => { animations.forEach(a => { if (!a.cancelled) a.finish(); }); await new Promise(setImmediate); };
  return { menu, list, rows, options, fillers, up, down, media, events, animations, key, finish };
}

test('Persona slot motion has a separate decorative band and one accessible selection', () => {
  const s = setup();
  assert.equal(s.menu.band.className, 'experience-save-band');
  assert.equal(s.menu.band.attrs['aria-hidden'], 'true');
  assert.equal(s.options.filter(r => r.attrs['aria-selected'] === 'true').length, 1);
  assert.equal(s.list.attrs['aria-activedescendant'], s.options[0].id);
  assert.equal(s.up.disabled, true);
  assert.deepEqual(s.rows.filter(r => !r.hidden), [s.fillers[0], s.options[0], s.options[1]]);
});

test('a slot shift moves entire rows, retains an inaccessible outgoing row, then cleans it up', async () => {
  const s = setup();
  s.key('ArrowDown');
  const outgoing = s.fillers[0];
  assert.equal(outgoing.hidden, false);
  assert.equal(outgoing.inert, true);
  assert.equal(outgoing.attrs['aria-hidden'], 'true');
  assert.equal(s.menu.dataset.moving, 'true');
  assert.ok(s.animations.some(a => a.target === s.options[1]));
  assert.ok(s.animations.every(a => a.timing.duration === 200));
  assert.equal(s.animations.some(a => a.target === s.menu.band), false);
  await s.finish();
  assert.equal(outgoing.hidden, true);
  assert.equal(s.menu.dataset.moving, undefined);
  assert.equal(s.rows.filter(r => !r.hidden).length, 3);
});

test('rapid reversals cancel older motion without letting stale completion hide current rows', async () => {
  const s = setup();
  s.key('ArrowDown');
  const firstBatch = [...s.animations];
  s.key('ArrowDown');
  s.key('ArrowUp');
  assert.ok(firstBatch.every(a => a.cancelled));
  await s.finish();
  assert.equal(s.list.attrs['aria-activedescendant'], s.options[1].id);
  assert.deepEqual(s.rows.filter(r => !r.hidden), s.options.slice(0, 3));
  assert.equal(s.options.filter(r => r.attrs['aria-selected'] === 'true').length, 1);
  assert.equal(s.options.some(r => !r.hidden && (r.inert || r.attrs['aria-hidden'])), false);
});

test('reduced motion, preference changes and resize settle without losing the chosen slot', () => {
  const reduced = setup(true);
  reduced.key('End');
  assert.equal(reduced.animations.length, 0);
  assert.equal(reduced.down.disabled, true);
  const s = setup();
  s.key('ArrowDown');
  s.media.matches = true; s.media.change();
  assert.ok(s.animations.every(a => a.cancelled));
  assert.equal(s.rows.filter(r => !r.hidden).length, 3);
  s.events.resize();
  assert.equal(s.list.attrs['aria-activedescendant'], s.options[1].id);
  assert.equal(s.menu.dataset.moving, undefined);
});

test('click, controls, Home/End and endpoint repeats preserve bounded selection', async () => {
  const s = setup();
  s.options[2].events.click();
  assert.equal(s.list.focused, true);
  s.down.events.click();
  assert.equal(s.list.attrs['aria-activedescendant'], s.options[3].id);
  s.key('End'); s.key('ArrowDown');
  assert.equal(s.down.disabled, true);
  await s.finish();
  assert.deepEqual(s.rows.filter(r => !r.hidden), [s.options[3], s.options[4], s.fillers[1]]);
  s.key('Home'); s.key('ArrowUp');
  assert.equal(s.up.disabled, true);
  assert.equal(s.list.attrs['aria-activedescendant'], s.options[0].id);
});
