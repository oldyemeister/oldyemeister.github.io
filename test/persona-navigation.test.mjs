import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const source = await readFile(new URL('../assets/themes/persona/interface.js', import.meta.url), 'utf8');
function setup() {
  const events = {};
  const classes = new Set();
  const effects = [];
  const assigned = [];
  const root = { classList: {
    add: name => classes.add(name), remove: (...names) => names.forEach(name => classes.delete(name)),
    contains: name => classes.has(name)
  }, style: { setProperty() {} } };
  const pane = { animate(_, options) {
    let cancel;
    const finished = new Promise((resolve, reject) => { cancel = () => reject(new Error('cancelled')); });
    const effect = { finished, cancel, options };
    effects.push(effect);
    return effect;
  } };
  const overlay = { children: [pane, pane, pane] };
  const document = {
    documentElement: root,
    body: { dataset: { personaBase: '/' }, classList: { contains: () => false } },
    querySelectorAll: () => [],
    querySelector: selector => selector === '.page-wipe' ? overlay : { getBoundingClientRect: () => ({ height: 60 }) },
    addEventListener: (name, handler) => { events[name] = handler; }
  };
  runInNewContext(source, {
    document, window: { addEventListener: (name, handler) => { events[name] = handler; } },
    location: { href: 'https://site.test/', origin: 'https://site.test', pathname: '/', search: '', assign: url => assigned.push(url) },
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    Element: { prototype: { animate() {} } },
    getComputedStyle: () => ({ getPropertyValue: name => name === '--wipe-duration' ? '550' : '80' }),
    setTimeout: () => 1, clearTimeout() {}, URL,
    sessionStorage: { setItem() {} }
  });
  return { events, effects, assigned, classes };
}

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
