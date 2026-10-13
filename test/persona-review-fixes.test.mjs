import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { personaPreview } from '../templates/persona/render.mjs';
import { stripeKickGeometry, shockwaveArrivalDelay } from '../assets/js/about-stripe-kick.js';

test('404 decoration is injected only by the active Persona renderer', () => {
  const content = readFileSync(new URL('../404.html', import.meta.url), 'utf8').replace(/^---[\s\S]*?---/, '');
  const source = `<html><head></head><body class="page-default">${content}</body></html>`;
  assert.doesNotMatch(source, /dialogue/);
  const result = personaPreview(source, '', true, { hud: {} });
  for (const name of ['dialogue-box', 'dialogue-name', 'dialogue-panel', 'dialogue-continue']) assert.match(result, new RegExp(name));
  assert.match(result, /dialogue-box\.css/);
  assert.doesNotMatch(personaPreview(source, '', false, { hud: {} }), /dialogue/);
  const article = '<html><head></head><body class="page-case-study"><h1>Article</h1></body></html>';
  assert.doesNotMatch(personaPreview(article, '', true, { hud: {} }), /dialogue-box\.css/);
});

for (const svgWidth of [16, 230.4]) {
  test(`stripe kick expands by 8 CSS pixels without gaps at ${svgWidth}px band width`, () => {
    const widths = [14, 18, 12, 24, 14, 18, 10, 20, 14, 19, 25, 8, 8, 10, 6, 11, 27, 30];
    const geometry = stripeKickGeometry(widths, svgWidth, 8);
    let x = 0;
    let coveredRight = -Infinity;
    geometry.forEach(({ width, scaleX }, index) => {
      assert.ok(Math.abs(width * (scaleX - 1) * svgWidth / 288 - 8) < 1e-9);
      const progress = [0, .2, 1, .6][index % 4]; // differently delayed kicks
      const right = x + width;
      const left = right - width * (1 + (scaleX - 1) * progress);
      if (index > 0) assert.ok(left <= coveredRight + 1e-9);
      coveredRight = right;
      x += widths[index];
    });
    assert.ok(coveredRight >= 288 + 8 * 288 / svgWidth);
  });
}
test('hidden stripe bands do not produce invalid animation geometry', () => {
  assert.deepEqual(stripeKickGeometry([14, 18], 0, 8), []);
});

test('kick arrival follows distance and starts before the wave fades out', () => {
  const delays = [100, 600, 1200].map(distance => shockwaveArrivalDelay(distance, 1200 / .65, 650));
  assert.ok(delays[0] < delays[1] && delays[1] < delays[2]);
  assert.ok(delays[2] > 0 && delays[2] < 650 * .55);
  assert.ok(shockwaveArrivalDelay(0, 1000, 650) < .0001);
});
