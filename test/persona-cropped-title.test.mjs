import test from 'node:test';
import assert from 'node:assert/strict';
import { redesignContent } from '../templates/persona/redesign.mjs';
import { personaPreview } from '../templates/persona/render.mjs';

for (const [page, shortName] of [['rf-receiver', 'RF Receiver'], ['aps380', 'ACC']]) {
  test(`${page} adds an inaccessible decoration without changing the real title`, () => {
    const source = `<html><head></head><body class="page-${page}"><header class="case-study-hero"><div class="case-study-hero-copy"><h1>Full project title</h1><p>Summary</p></div><figure class="case-study-hero-media"><img alt="Project"></figure></header></body></html>`;
    const result = redesignContent(source);
    assert.match(result, new RegExp(`data-title="${shortName}" aria-hidden="true"`));
    assert.match(result, new RegExp(`--case-title-chars: ${shortName.length}; --case-title-advance: [0-9.]+`));
    assert.match(result, /<h1>Full project title<\/h1><p>Summary<\/p>/);
    assert.equal((result.match(/case-study-cropped-title/g) || []).length, 1);
    const rollback = personaPreview(source, '', false, {hud: {}});
    assert.doesNotMatch(rollback, /case-study-cropped-title/);
  });
}
test('other pages do not receive a case-study decoration', () => {
  const source = '<body class="page-laser"><h1>Laser Puzzle</h1></body>';
  assert.equal(redesignContent(source), source);
});
