import test from 'node:test';
import assert from 'node:assert/strict';
import { personaPreview } from '../templates/persona/render.mjs';

const page = `<!doctype html><html><head></head><body class="page-home">
<a href="/#projects">Projects</a><a href="/projects/laser/">Laser</a>
<a href="/assets/documents/resume.pdf">Resume</a><a href="https://example.com/">External</a>
</body></html>`;

test('production Persona uses root routes and leaves shared assets and external links intact', () => {
  const result = personaPreview(page, '');
  assert.match(result, /data-persona-base="\/"/);
  assert.match(result, /href="\/#projects"/);
  assert.match(result, /href="\/projects\/laser\/"/);
  assert.match(result, /<kbd>Tab<\/kbd><kbd>Esc<\/kbd><span>Menu<\/span>/);
  assert.doesNotMatch(result, /data-hud-home/);
  assert.match(result, /href="\/assets\/documents\/resume.pdf"/);
  assert.match(result, /href="https:\/\/example.com\/"/);
  assert.doesNotMatch(result, /href="\/persona\//);
});

test('comparison preview retains its Persona route prefix', () => {
  const result = personaPreview(page);
  assert.match(result, /data-persona-base="\/persona\/"/);
  assert.match(result, /href="\/persona\/#projects"/);
  assert.match(result, /href="\/persona\/projects\/laser\/"/);
  assert.match(result, /data-hud-menu-toggle aria-controls="site-navigation"/);
});

test('redesign adds a semantic image caption before the project heading', () => {
  const project = page.replace('</body>', `<article class="project-card">
    <div class="project-media"><picture><img src="/demo.png" alt="FPGA gameplay preview"></picture></div>
    <div class="project-content"><h3>FPGA game</h3></div>
    </article></body>`);
  const result = personaPreview(project, '');
  assert.match(result, /<figure class="project-visual">/);
  assert.match(result, /<figcaption>FPGA gameplay preview<\/figcaption>/);
  assert.ok(result.indexOf('<figcaption>') < result.indexOf('<h3>'));
});

test('disabling the redesign restores the original presentation without changing routes', () => {
  const result = personaPreview(page, '', false);
  assert.doesNotMatch(result, /assets\/themes\/persona\/(tokens|redesign)\.css/);
  assert.doesNotMatch(result, /project-visual|hero-visual-caption/);
  assert.match(result, /assets\/themes\/persona\/style\.css/);
  assert.match(result, /href="\/projects\/laser\/"/);
});
