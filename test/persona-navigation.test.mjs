import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const source = await readFile(new URL('../assets/themes/persona/interface.js', import.meta.url), 'utf8');
function setup({ diamond = false, reduced = false } = {}) {
  const events = {};
  const classes = new Set();
  const effects = [];
  const assigned = [];
  const stored = [];
  const motion = { matches: reduced, addEventListener: (_, handler) => { events.motion = handler; } };
  const root = { classList: {
    add: name => classes.add(name), remove: (...names) => names.forEach(name => classes.delete(name)),
    contains: name => classes.has(name)
  }, style: { setProperty() {} } };
  const pane = { animate(_, options) {
    let cancel, finish;
    const finished = new Promise((resolve, reject) => { finish = resolve; cancel = () => reject(new Error('cancelled')); });
    const effect = { finished, cancel, finish, options };
    effects.push(effect);
    return effect;
  } };
  const overlay = { children: [pane, pane, pane] };
  const document = {
    documentElement: root,
    body: { dataset: { personaBase: '/' }, classList: { contains: () => false } },
    querySelectorAll: () => [],
    querySelector: selector => selector === '.page-wipe' ? overlay : {
      getBoundingClientRect: () => ({ height: 60 }), querySelector: () => null, querySelectorAll: () => []
    },
    addEventListener: (name, handler) => { events[name] = handler; }
  };
  runInNewContext(source, {
    document, window: {
      addEventListener: (name, handler) => { events[name] = handler; },
      personaDiamondWipe: diamond ? { cover: () => [pane.animate([], { duration: 620 })], reset() {} } : undefined
    },
    location: { href: 'https://site.test/', origin: 'https://site.test', pathname: '/', search: '', assign: url => assigned.push(url) },
    matchMedia: () => motion,
    Element: { prototype: { animate() {} } },
    getComputedStyle: () => ({ getPropertyValue: name => name === '--wipe-duration' ? '550' : '80' }),
    setTimeout: () => 1, clearTimeout() {}, URL,
    sessionStorage: { setItem: (key, value) => stored.push([key, JSON.parse(value)]) }
  });
  return { events, effects, assigned, classes, stored, motion };
}

function projectClick(overrides = {}, inProjects = true) {
  const link = {
    href: 'https://site.test/projects/laser/', hasAttribute: () => false,
    classList: { contains: () => false }, closest: () => inProjects ? {} : null
  };
  return { target: { closest: () => link }, button: 0, preventDefault() {}, ...overrides };
}

test('project entry waits for diamond coverage and bridges the effect to its destination', async () => {
  const { events, effects, assigned, classes, stored } = setup({ diamond: true });
  const navigation = events.click(projectClick());
  assert.ok(classes.has('persona-diamond'));
  assert.deepEqual(assigned, []);
  effects.forEach(effect => effect.finish());
  await navigation;
  assert.ok(classes.has('persona-diamond-covered'));
  assert.deepEqual(assigned, ['https://site.test/projects/laser/']);
  assert.equal(stored[0][1].effect, 'diamond');
  events.pagehide();
  assert.equal(classes.size, 0);
});

test('diamond entry respects modified clicks, reduced motion and links outside Projects', async () => {
  for (const overrides of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { button: 1 }]) {
    const { events, effects } = setup({ diamond: true });
    await events.click(projectClick(overrides));
    assert.equal(effects.length, 0);
  }
  const reduced = setup({ diamond: true, reduced: true });
  await reduced.events.click(projectClick());
  assert.equal(reduced.effects.length, 0);
  const other = setup({ diamond: true });
  const navigation = other.events.click(projectClick({}, false));
  assert.equal(other.effects.length, 3);
  other.events.popstate();
  await navigation;
});

test('history cancels diamond entry, while enabling reduced motion completes the chosen navigation', async () => {
  const history = setup({ diamond: true });
  const cancelled = history.events.click(projectClick());
  history.events.popstate();
  await cancelled;
  assert.deepEqual(history.assigned, []);
  const reduced = setup({ diamond: true });
  const navigation = reduced.events.click(projectClick());
  reduced.motion.matches = true;
  reduced.events.motion();
  await navigation;
  assert.deepEqual(reduced.assigned, ['https://site.test/projects/laser/']);
  assert.equal(reduced.classes.size, 0);
});

test('browser history restoration does not flash arrival panels', () => {
  const { events, effects, classes } = setup();
  events.pageshow({ persisted: true });
  events.popstate();
  assert.equal(effects.length, 0);
  assert.equal(classes.size, 0);
});

test('history navigation cancels an outgoing link without navigating back again', async () => {
  const { events, effects, assigned, classes } = setup();
  const link = { href: 'https://site.test/projects/laser/', hasAttribute: () => false, classList: { contains: () => false } };
  const navigation = events.click({ target: { closest: () => link }, button: 0, preventDefault() {} });
  assert.equal(effects.length, 3);
  assert.deepEqual(effects.map(effect => effect.options.duration), [550, 550, 550]);
  assert.deepEqual(effects.map(effect => effect.options.delay), [0, 80, 160]);
  events.popstate();
  await navigation;
  assert.deepEqual(assigned, []);
  assert.equal(classes.size, 0);
});
