import test from 'node:test';
import assert from 'node:assert/strict';
import { initImuPause } from '../assets/js/imu-pause.js';

function element() {
  return {
    events: {}, dataset: {}, classes: new Set(),
    classList: { toggle() {} },
    setAttribute(name, value) { this[name] = value; },
    addEventListener(name, fn) { this.events[name] = fn; },
    focus() { this.focused = true; }
  };
}

for (const renderer of ['.imu-webgl-canvas', '.imu-css-device']) {
  test(`${renderer} pause freezes rendering and resumes without resetting settings`, () => {
    const pause = element(), reset = element(), surface = element(), resume = element();
    const text = {};
    resume.querySelector = () => text;
    const overlay = { dataset: {}, querySelector: () => resume };
    const controls = [{ disabled: false, value: 27 }, { disabled: true, value: 'wind' }];
    const section = {
      querySelector: selector => selector === '[data-imu-pause]' ? pause : reset,
      querySelectorAll: () => controls
    };
    const document = {
      getElementById: () => ({ textContent: JSON.stringify({ pause_sandbox: 'Pause sandbox', resume_sandbox: 'Resume sandbox', resume: 'Resume' }) }),
      createElement: () => overlay
    };
    const host = {
      ownerDocument: document, dataset: {}, closest: () => section,
      querySelector: selector => { assert.ok(selector.includes(renderer)); return surface; },
      append(child) { assert.equal(child, overlay); }
    };
    const states = [];
    initImuPause(host, { setPaused: value => states.push(value) });
    assert.equal(overlay.hidden, true);
    pause.events.click();
    assert.equal(surface.inert, true);
    assert.equal(overlay.hidden, false);
    assert.equal(resume.focused, true);
    assert.equal(pause['aria-label'], 'Resume sandbox');
    assert.ok(controls.every(control => control.disabled));
    resume.events.click();
    assert.equal(surface.inert, false);
    assert.equal(surface.focused, true);
    assert.deepEqual(controls, [{ disabled: false, value: 27 }, { disabled: true, value: 'wind' }]);
    assert.deepEqual(states, [true, false]);
    pause.events.click();
    reset.events.click();
    assert.equal(overlay.hidden, true);
    assert.deepEqual(states, [true, false, true, false]);
    assert.equal(pause['aria-label'], 'Pause sandbox');
  });
}

test('original design without a TV pause button remains untouched', () => {
  assert.doesNotThrow(() => initImuPause({ closest: () => ({ querySelector: () => null }) }));
});
