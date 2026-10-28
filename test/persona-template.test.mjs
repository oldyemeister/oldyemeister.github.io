import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { personaPreview } from '../templates/persona/render.mjs';
import { flowerPetals } from '../templates/persona/flower.mjs';

// A minimal homepage carrying every anchor the Persona decorators require.
const page = `<!doctype html><html><head></head><body class="page-home">
<div class="hero-top-extension" aria-hidden="true" hidden></div>
<section class="hero-section" id="home"><svg class="hero-reference-art"><g class="hero-sky-clouds"></g><g data-contact-petals></g></svg></section>
<section class="page-section" id="about"><svg class="about-corner-ribbons"><g class="about-corner-ribbon-bands"></g></svg></section>
<section class="page-section" id="education"></section>
<section class="page-section" id="skills"></section>
<section class="page-section" id="projects"></section>
<section class="page-section contact-section" id="contact"></section>
<a href="/#projects">Projects</a><a href="/projects/laser/">Laser</a>
<a href="/assets/documents/resume.pdf">Resume</a><a href="https://example.com/">External</a>
</body></html>`;
const ui = { hud: { label: 'Keyboard shortcuts', menu: 'Menu', navigate: 'Navigate', open: 'Open' } };

test('Persona replaces the shared experience controller without changing the source route', () => {
  const shared = page.replace('</body>', '<script src="/assets/js/experience-save-menu.js?v=old" defer></script></body>');
  const result = personaPreview(shared, '', true, ui);
  assert.match(result, /src="\/assets\/themes\/persona\/experience-save-menu\.js"/);
  assert.doesNotMatch(result, /src="\/assets\/js\/experience-save-menu\.js/);
  assert.match(shared, /src="\/assets\/js\/experience-save-menu\.js\?v=old"/);
});

test('Education to Skills enhancement loads only on redesigned Persona home, preserving section order', () => {
  const result = personaPreview(page, '', true, ui);
  assert.match(result, /education-skills-transition\.js/);
  assert.match(result, /education-skills-transition\.css/);
  const order = html => [...html.matchAll(/<section[^>]*id="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(order(result), order(page));
  assert.doesNotMatch(personaPreview(page, '', false, ui), /education-skills-transition/);
  assert.doesNotMatch(personaPreview('<html><head></head><body class="page-project"></body></html>', '', true, ui), /education-skills-transition/);
});

test('shared Education honours render safely on both designs and disappear without data', async (t) => {
  // Exercise the real builder in isolation: never rewrite the working data or _site.
  const fixture = mkdtempSync(join(tmpdir(), 'education-honors-test-'));
  t.after(() => rmSync(fixture, { recursive: true, force: true }));
  for (const path of ['assets', 'templates', '_data', '_layouts', '_includes', '_config.yml', 'index.html', '404.html']) {
    cpSync(new URL(`../${path}`, import.meta.url), join(fixture, path), {
      recursive: true,
      // Skip any large local media (the production build excludes the project
      // video); this test only needs the pages, styles and scripts.
      filter: source => !source.endsWith('/.DS_Store') && (statSync(source).isDirectory() || statSync(source).size < 5e6)
    });
  }
  mkdirSync(join(fixture, 'tools'));
  mkdirSync(join(fixture, 'projects'));
  cpSync(new URL('../tools/preview-build.mjs', import.meta.url), join(fixture, 'tools/preview-build.mjs'));
  const contentPath = join(fixture, '_data/content.yml');
  const content = JSON.parse(execFileSync('ruby', ['-ryaml', '-rjson', '-e',
    'puts JSON.generate(YAML.load_file(ARGV[0]))', contentPath], { encoding: 'utf8' }));
  const approved = [{ name: "Dean's Honour List", terms: 'Winter 2024 · Winter 2025' }];
  assert.deepEqual(content.education_section.honors[0], approved[0]);

  for (const [state, honors] of [
    ['populated', [...approved, { name: 'R&D <Award> "Test"', terms: '<Winter> & Summer' }]],
    ['empty', []],
    ['missing', undefined]
  ]) {
    await t.test(state, () => {
      const data = structuredClone(content);
      if (honors === undefined) delete data.education_section.honors;
      else data.education_section.honors = honors;
      writeFileSync(contentPath, JSON.stringify(data));
      execFileSync(process.execPath, [join(fixture, 'tools/preview-build.mjs'), '--production'], { stdio: 'pipe' });
      for (const route of ['index.html', 'original/index.html']) {
        const result = readFileSync(join(fixture, '_site', route), 'utf8');
        if (route === 'index.html') {
          assert.match(result, /<svg class="education-frame-trace" aria-hidden="true" focusable="false"><rect pathLength="1"/);
          assert.match(result, /class="education-ribbon-shine"/);
        } else {
          assert.doesNotMatch(result, /education-frame-trace|education-ribbon-shine|education-motion\.js/);
        }
        if (state !== 'populated') {
          assert.doesNotMatch(result, /education-honor|Dean(?:'|&#39;)s Honour List|Winter 2024|Winter 2025/);
          continue;
        }
        const list = result.match(/<ul class="education-honors" role="list">[\s\S]*?<\/ul>/)?.[0];
        assert.ok(list, `${route} exposes the honours as a semantic list`);
        assert.equal((list.match(/<li>/g) || []).length, 2);
        assert.match(list, /<span class="education-honor-name">Dean&#39;s Honour List<\/span>/);
        assert.match(list, /<span class="education-honor-terms">Winter 2024 · Winter 2025<\/span>/);
        assert.match(list, /R&amp;D &lt;Award&gt; &quot;Test&quot;/);
        assert.match(list, /&lt;Winter&gt; &amp; Summer/);
        assert.doesNotMatch(list, /<Award>|<Winter>/);
        assert.match(result, /<p class="education-dates">[^<]+<\/p>\s*<ul class="education-honors"/);
      }
    });
  }
});

test('About stripe heads are injected into the hero stage', () => {
  // The injection matches this exact opening tag; keep it in the real source.
  const opening = '<div class="hero-visual-stage">';
  assert.ok(readFileSync(new URL('../index.html', import.meta.url), 'utf8').includes(opening));
  const result = personaPreview(page.replace('<svg class="hero-reference-art">', `${opening}</div><svg class="hero-reference-art">`), '', true, ui);
  assert.match(result, /<div class="hero-visual-stage"><div class="about-stripe-heads about-sky-texture" aria-hidden="true"><\/div>/);
});

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
  assert.equal((flowerPetals.match(/<path /g) || []).length, 1);
  const result = personaPreview(page, '', true, ui);
  assert.ok(result.includes(`<g transform="translate(50 50) scale(.32) translate(-160 -160)">${flowerPetals}</g>`));
  assert.ok(result.includes(`<g class="contact-flower-face contact-flower-spin">${flowerPetals}</g>`));
  assert.ok(result.includes(`<g class="hero-flower-spin"><g>${flowerPetals}</g></g>`));
});

test('only white flower placeholders receive the baked registration artwork', () => {
  const fixture = page.replace('<g data-contact-petals></g>',
    '<g class="hero-flower-light" data-contact-petals></g><g class="hero-flower-dark" data-contact-petals></g>');
  const result = personaPreview(fixture, '', true, ui);
  assert.match(result, /class="hero-flower-light"[^>]*><g class="hero-flower-spin"><g><image href="[^"]*flower-white.svg"/);
  assert.ok(result.includes(`<g class="hero-flower-dark" data-contact-petals><g class="hero-flower-spin"><g>${flowerPetals}</g></g></g>`));
  assert.doesNotMatch(result, /class="hero-flower-fringe-/);
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

test('About gains the 18 P4G status stripes, painted beneath the corner fan', () => {
  const result = personaPreview(page, '', true, ui);
  const stripes = result.match(/<svg class="about-status-stripes"[\s\S]*?<\/svg>/)?.[0];
  assert.ok(stripes, 'expected svg.about-status-stripes');
  assert.equal(stripes.match(/<rect style="--stripe: \d+; --stripe-count: 18"/g).length, 18);
  assert.ok(result.indexOf('about-status-stripes') < result.indexOf('<svg class="about-corner-ribbons"'));
  assert.doesNotMatch(result.match(/<svg class="project-corner-ribbons"[\s\S]*?<\/svg>/)[0], /about-status-stripes/);
});

test('Persona installs its ribbon motion adapter before the shared controller on every page', () => {
  for (const body of ['page-home', 'page-project']) {
    const shared = page.replace('class="page-home"', `class="${body}"`).replace('</body>',
      '<script src="/assets/js/ribbon-menu.js?v=old" defer></script></body>');
    const result = personaPreview(shared, '', true, ui);
    assert.ok(result.indexOf('/assets/themes/persona/ribbon-motion.js') < result.indexOf('/assets/js/ribbon-menu.js'));
    assert.doesNotMatch(shared, /ribbon-motion/);
  }
});
