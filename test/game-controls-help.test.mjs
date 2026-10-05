import test from 'node:test';
import assert from 'node:assert/strict';
import { initGameControlsHelp } from '../assets/js/game-controls-help.js';

function setup(open = false) {
  const events = {};
  const summary = { matches: () => false, addEventListener(name, callback) { this[name] = callback; } };
  const help = { open, dataset: {}, querySelector: () => summary, contains: node => node === summary };
  const document = { querySelector: () => help, addEventListener(name, callback) { events[name] = callback; } };
  initGameControlsHelp(document);
  const focus = selector => events.focusin({ target: { matches: targets => targets.split(', ').includes(selector) } });
  return { document, help, events, summary, focus };
}

for (const selector of ['[data-laser-canvas]', '[data-donkey-kong-canvas]', '.imu-webgl-canvas', '.imu-css-device']) {
  test(`${selector} opens help on focus and collapses it when focus leaves the game`, () => {
    const { help, events, focus } = setup();
    assert.equal(help.open, false);
    focus(selector);
    assert.equal(help.open, true);
    focus('button');
    assert.equal(help.open, false);
    focus(selector);
    events.focusout({ relatedTarget: null });
    assert.equal(help.open, false);
  });
}

test('manual help remains accessible before Start and is not overridden by focus changes', () => {
  const { help, events, summary, focus } = setup();
  summary.click();
  help.open = true; // Native details activation.
  focus('button');
  assert.equal(help.open, true);
  focus('[data-laser-canvas]');
  events.focusout({ relatedTarget: null });
  assert.equal(help.open, true);
  summary.click();
  help.open = false;
  focus('[data-laser-canvas]');
  events.focusin({ target: summary });
  assert.equal(help.open, true); // Does not collapse while the summary gains focus.
});

test('initialization is idempotent and installs no keyboard or game-input handlers', () => {
  const { document, events } = setup();
  const original = events.focusin;
  initGameControlsHelp(document);
  assert.equal(events.focusin, original);
  assert.deepEqual(Object.keys(events), ['focusin', 'focusout']);
  assert.doesNotThrow(() => initGameControlsHelp({ querySelector: () => null }));
});

test('default-open instructions stay visible when focus moves between the game and controls', () => {
  const { help, focus, events } = setup(true);
  focus('[data-laser-canvas]');
  focus('button');
  events.focusout({ relatedTarget: null });
  assert.equal(help.open, true);
});
