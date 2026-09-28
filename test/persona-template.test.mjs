import test from 'node:test';
import assert from 'node:assert/strict';
import { personaPreview } from '../templates/persona/render.mjs';

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
});

test('comparison preview retains its Persona route prefix', () => {
  const result = personaPreview(page, '/persona', true, ui);
  assert.match(result, /data-persona-base="\/persona\/"/);
  assert.match(result, /href="\/persona\/#projects"/);
  assert.match(result, /href="\/persona\/projects\/laser\/"/);
  assert.match(result, /data-hud-menu-toggle aria-controls="site-navigation"/);
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
