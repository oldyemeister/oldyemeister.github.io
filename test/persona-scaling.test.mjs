import test from 'node:test';
import assert from 'node:assert/strict';
import { personaPreview } from '../templates/persona/render.mjs';

test('only the active Persona renderer opts the document into root scaling', () => {
  const source = '<!doctype html><html lang="en"><head></head><body class="page-test"><h1>Title</h1></body></html>';
  const scaled = personaPreview(source, '', true, { hud: {} });
  assert.match(scaled, /<html lang="en" class="persona-root">/);
  assert.match(scaled, /desktop-scaling\.css/);
  const rollback = personaPreview(source, '', false, { hud: {} });
  assert.doesNotMatch(rollback, /persona-root|desktop-scaling\.css/);
  assert.match(rollback, /<html lang="en">/);
});
