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
  assert.match(result, /href="\/#home" data-hud-home/);
  assert.match(result, /href="\/assets\/documents\/resume.pdf"/);
  assert.match(result, /href="https:\/\/example.com\/"/);
  assert.doesNotMatch(result, /href="\/persona\//);
});

test('comparison preview retains its Persona route prefix', () => {
  const result = personaPreview(page);
  assert.match(result, /data-persona-base="\/persona\/"/);
  assert.match(result, /href="\/persona\/#projects"/);
  assert.match(result, /href="\/persona\/projects\/laser\/"/);
  assert.match(result, /href="\/persona\/#home" data-hud-home/);
});
