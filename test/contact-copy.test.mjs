import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const source = await readFile(new URL('../assets/js/contact-copy.js', import.meta.url), 'utf8');

test('copy feedback is available to screen readers without a visible status line', async () => {
  const template = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(template, /<span class="sr-only" role="status" aria-live="polite" aria-atomic="true">Discord username<\/span>/);
});

function setup(clipboard) {
  const events = {};
  const status = { textContent: 'Discord username' };
  const button = {
    hidden: true, disabled: false, dataset: { copyContact: 'jacky_ye' },
    closest: () => ({ querySelector: () => status }),
    addEventListener: (type, listener) => { events[type] = listener; }
  };
  runInNewContext(source, {
    document: { querySelectorAll: () => [button] }, navigator: { clipboard }
  });
  return { button, status, events };
}

test('copies the exact Discord username and announces success', async () => {
  const copied = [];
  const { button, status, events } = setup({ writeText: async value => copied.push(value) });
  assert.equal(button.hidden, false);
  await events.click();
  assert.deepEqual(copied, ['jacky_ye']);
  assert.equal(status.textContent, 'Discord username copied!');
  assert.equal(button.disabled, false);
});

test('clipboard rejection provides manual-copy instructions and allows retry', async () => {
  const { button, status, events } = setup({ writeText: async () => { throw new Error('Denied'); } });
  await events.click();
  assert.match(status.textContent, /Select the username/);
  assert.equal(button.disabled, false);
});

test('without clipboard support the username stays visible without a dead button', () => {
  const { button, status, events } = setup(undefined);
  assert.equal(button.hidden, true);
  assert.equal(status.textContent, 'Discord username');
  assert.equal(events.click, undefined);
});

test('repeated activation does not start simultaneous clipboard writes', async () => {
  let finish;
  let writes = 0;
  const { button, events } = setup({ writeText: () => {
    writes += 1;
    return new Promise(resolve => { finish = resolve; });
  } });
  const pending = events.click();
  assert.equal(button.disabled, true);
  await events.click();
  assert.equal(writes, 1);
  finish();
  await pending;
  assert.equal(button.disabled, false);
});
