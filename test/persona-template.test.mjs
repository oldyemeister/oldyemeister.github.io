import test from 'node:test';
import assert from 'node:assert/strict';
import { personaPreview } from '../templates/persona/render.mjs';
import { flowerPetals } from '../templates/persona/flower.mjs';

// A minimal homepage carrying every anchor the Persona decorators require.
const page = `<!doctype html><html><head></head><body class="page-home">
<div class="hero-top-extension" aria-hidden="true" hidden></div>
<section class="hero-section" id="home"><svg class="hero-reference-art"><g data-contact-petals></g></svg></section>
<section class="page-section" id="about"><svg class="about-corner-ribbons"><g class="about-corner-ribbon-bands"></g></svg></section>
<section class="page-section" id="education"></section>
<section class="page-section" id="skills"></section>
<section class="page-section" id="projects"></section>
<section class="page-section contact-section" id="contact"></section>
<a href="/#projects">Projects</a><a href="/projects/laser/">Laser</a>
<a href="/assets/documents/resume.pdf">Resume</a><a href="https://example.com/">External</a>
</body></html>`;
const ui = { hud: { label: 'Keyboard shortcuts', menu: 'Menu', navigate: 'Navigate', open: 'Open' } };

test('production Persona uses root routes and leaves shared assets and external links intact', () => {
  const result = personaPreview(page, '', true, ui);
  assert.match(result, /data-persona-base="\/"/);
  assert.match(result, /href="\/#projects"/);
  assert.match(result, /href="\/projects\/laser\/"/);
  assert.match(result, /aria-keyshortcuts="Escape"><kbd>Esc<\/kbd><span>Menu<\/span>/);
  assert.doesNotMatch(result, /<kbd>Tab<\/kbd>/);
  assert.doesNotMatch(result, /data-hud-home/);
  assert.match(result, /href="\/assets\/documents\/resume.pdf"/);
  assert.match(result, /href="https:\/\/example.com\/"/);
  assert.doesNotMatch(result, /href="\/persona\//);
  assert.doesNotMatch(result, /tv-frame\.(?:css|js)|persona-tv-screen/);
  assert.doesNotMatch(result, /game-crt\.js/);
  assert.match(result, /assets\/js\/cursor-trail.js/);
  assert.match(result, /assets\/themes\/persona\/cursor-trail.css/);
});

for (const [pageClass, heading, bootstrap] of [
  ['laser', 'game-heading', 'project-bootstrap'],
  ['donkey-kong', 'dk-game-heading', 'project-bootstrap'],
  ['imu-sandbox', 'imu-demo-heading', 'imu-sandbox-bootstrap']
]) {
  test(`${pageClass} loads the shared TV after its unchanged game bootstrap`, () => {
    const fixture = `<html><head></head><body class="page-${pageClass}">
      <h1>Game</h1><section aria-labelledby="${heading}">
      <div><p class="section-index">Game</p><h2 id="${heading}">Game</h2></div>
      <aside class="keyboard-guide"><li><kbd>R</kbd>Reset</li></aside></section>
      <script src="/assets/js/${bootstrap}.js" data-module="/assets/js/game.js" defer></script>
      </body></html>`;
    const result = personaPreview(fixture, '', false, ui);
    assert.match(result, /persona-design persona-tv-screen/);
    assert.match(result, /href="\/assets\/themes\/persona\/tv-frame.css"/);
    assert.match(result, /href="\/assets\/themes\/persona\/project-tv-effect.css"/);
    assert.match(result, /type="module" src="\/assets\/js\/game-crt.js"/);
    assert.equal((result.match(/src="\/assets\/themes\/persona\/tv-frame.js"/g) || []).length, 1);
    assert(result.indexOf('src="/assets/themes/persona/game-start.js"') < result.indexOf('src="/assets/themes/persona/tv-frame.js"'));
    assert.match(result, /data-module="\/assets\/js\/game.js"/);
    assert.match(result, /assets\/js\/cursor-trail.js/);
    assert.match(result, /assets\/js\/game-controls-help.js/);
    assert.match(result, /<details class="game-keyboard-help" data-game-controls-help open>/);
    const fixedHud = result.match(/<nav class="persona-hud"[\s\S]*?<\/nav>/)[0];
    assert.doesNotMatch(fixedHud, /hud-game-key|<kbd>Tab<\/kbd>|<kbd>Enter<\/kbd>/);
  });
}

test('game entry pairs the existing intro and game without moving the reading section inside', () => {
  const fixture = `<html><head></head><body class="page-laser">
    <section class="laser-intro"><h1>Laser</h1><p>Original description</p></section>
    <section class="laser-play-section" aria-labelledby="game-heading">
      <div><p class="section-index">Game</p><h2 id="game-heading">Laser</h2></div>
      <aside class="keyboard-guide"><ul><li><kbd>← →</kbd><span>Rotate</span></li></ul></aside>
      <canvas data-laser-canvas></canvas></section>
    <section class="page-section laser-notes">Original notes</section>
    <script src="/assets/js/project-bootstrap.js" defer></script></body></html>`;
  const result = personaPreview(fixture, '', true, ui);
  assert.match(result, /<div class="game-entry"><section class="laser-intro">/);
  assert.match(result, /<canvas data-laser-canvas><\/canvas><\/section><\/div>\s*<section class="page-section laser-notes">Original notes/);
  assert.match(result, /Original description/);
  assert.match(result, /class="hud-arrow">←<\/kbd><kbd class="hud-arrow">→<\/kbd><span>Rotate/);
});

test('article pages do not load game CRT assets', () => {
  const article = '<html><head></head><body class="page-case-study"><article>Case study</article></body></html>';
  const result = personaPreview(article, '', false, ui);
  assert.doesNotMatch(result, /game-crt|project-tv-effect|tv-frame/);
  assert.match(result, /assets\/js\/cursor-trail.js/);
});

test('comparison preview retains its Persona route prefix', () => {
  const result = personaPreview(page, '/persona', true, ui);
  assert.match(result, /data-persona-base="\/persona\/"/);
  assert.match(result, /href="\/persona\/#projects"/);
  assert.match(result, /href="\/persona\/projects\/laser\/"/);
  assert.match(result, /data-hud-menu-toggle aria-controls="site-navigation"/);
});

test('all flower variants reuse the six-petal reference silhouette', () => {
  assert.equal((flowerPetals.match(/<path /g) || []).length, 6);
  assert.deepEqual([...flowerPetals.matchAll(/rotate\((\d+) 160 160\)/g)].map(match => Number(match[1])), [0, 60, 120, 180, 240, 300]);
  const result = personaPreview(page, '', true, ui);
  assert.ok(result.includes(`<g transform="translate(50 50) scale(.32) translate(-160 -160)">${flowerPetals}</g>`));
  assert.ok(result.includes(`<g class="contact-flower-face contact-flower-spin">${flowerPetals}</g>`));
  assert.ok(result.includes(`<g class="hero-flower-spin"><g>${flowerPetals}</g></g>`));
});

test('flower drops have flat inward heads centered on their shared rotation point', () => {
  assert.equal((flowerPetals.match(/translate\(160 160\) scale\(\.8 1\.08\) translate\(-160 -160\)/g) || []).length, 6);
  const paths = [...flowerPetals.matchAll(/d="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(paths).size, 1);
  for (const path of paths) {
    // The cap midpoint is (160, 160), exactly the pivot of every rotated drop.
    const cap = path.match(/^M([\d.]+) 160 H([\d.]+) /);
    assert.ok(cap);
    assert.equal((Number(cap[1]) + Number(cap[2])) / 2, 160);
    assert.ok(Math.abs(Number(cap[2]) - Number(cap[1]) - 6 * 1.2) < .001,
      'the flat inner head is exactly 20% wider');
    assert.match(path, /156\.4 160Z$/);
    assert.doesNotMatch(path, /Q/); // No rounded, overshooting inner tip.
    const outerArc = path.match(/A([\d.]+) ([\d.]+) 0 1 0 /);
    assert.ok(outerArc, 'a broad outer arc forms the rounded bulb');
    assert.ok(Math.abs(Number(outerArc[1]) - 38 * 1.2) < .001,
      'the outer circle radius is 20% larger');
    assert.ok(Math.abs(Number(outerArc[1]) * .8 - Number(outerArc[2]) * 1.08) < .001,
      'the outer bulb stays circular after the thinner/longer petal scaling');
  }
});

test('redesign keeps project descriptions accessible without adding visible image captions', () => {
  const project = page.replace('</body>', `<article class="project-card">
    <div class="project-media"><picture><img src="/demo.png" alt="FPGA gameplay preview"></picture></div>
    <div class="project-content"><h3>FPGA game</h3></div>
    </article></body>`);
  const result = personaPreview(project, '', true, ui);
  assert.match(result, /alt="FPGA gameplay preview"/);
  assert.doesNotMatch(result, /<figcaption>FPGA gameplay preview<\/figcaption>/);
});

test('playable markers become accessible Play stickers with unchanged game destinations', () => {
  const routes = ['laser', 'donkey-kong', 'imu-sandbox'];
  const badges = routes.map(route => `<span class="project-playable-badge" data-play-url="/projects/${route}/" data-play-label="Play ${route}">Playable in browser</span>`).join('');
  const fixture = page.replace('</body>', `${badges}</body>`);
  const result = personaPreview(fixture, '', true, ui);
  assert.equal((result.match(/class="project-play-sticker"/g) || []).length, 3);
  assert.doesNotMatch(result, /Playable in browser/);
  for (const route of routes) {
    assert.ok(result.includes(`<a class="project-playable-badge" href="/projects/${route}/" aria-label="Play ${route}">`));
  }
  assert.match(result, /viewBox="0 0 150 120" aria-hidden="true" focusable="false"/);
  assert.equal((result.match(/rotate\(12 75 60\) translate\(0 8\)/g) || []).length, 3,
    'all three stickers share the original lettering proportions');
  const comparison = personaPreview(fixture, '/persona', true, ui);
  assert.match(comparison, /class="project-playable-badge" href="\/persona\/projects\/laser\/"/);
  const original = personaPreview(fixture, '', false, ui);
  assert.match(original, /Playable in browser/);
  assert.doesNotMatch(original, /project-play-sticker/);
});

test('disabling the redesign restores the original presentation without changing routes', () => {
  const result = personaPreview(page, '', false, ui);
  assert.doesNotMatch(result, /assets\/themes\/persona\/(tokens|redesign)\.css/);
  assert.doesNotMatch(result, /project-visual|hero-visual-caption/);
  assert.match(result, /assets\/themes\/persona\/style\.css/);
  assert.match(result, /href="\/projects\/laser\/"/);
});

test('the homepage decorators fail loudly when a required anchor is missing', () => {
  const withoutContact = page.replace('<section class="page-section contact-section" id="contact"></section>', '');
  assert.throws(() => personaPreview(withoutContact, '', true, ui), /expected the #contact section/);
});

test('HUD labels come from the ui content block', () => {
  const result = personaPreview(page, '', true, { hud: { ...ui.hud, menu: 'Menú' } });
  assert.match(result, /<kbd>Esc<\/kbd><span>Menú<\/span>/);
});

test('the Projects rainbow is copied from About, not duplicated in the source', () => {
  const result = personaPreview(page, '', true, ui);
  assert.match(result, /<section class="page-section" id="projects">\s*<svg class="project-corner-ribbons">/);
});
