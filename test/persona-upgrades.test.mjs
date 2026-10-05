import test from 'node:test';
import assert from 'node:assert/strict';
import { personaPreview } from '../templates/persona/render.mjs';

const ui = { hud: { label: 'Keyboard shortcuts', menu: 'Menu', navigate: 'Navigate', open: 'Open' } };
const home = `<!doctype html><html><head></head><body class="page-home">
<div class="hero-top-extension" aria-hidden="true" hidden></div>
<section class="hero-section" id="home"><svg class="hero-reference-art"><g data-contact-petals></g></svg></section>
<section class="page-section" id="about"><svg class="about-corner-ribbons"><g class="about-corner-ribbon-bands"></g></svg></section>
<section class="page-section" id="education"></section>
<section class="page-section" id="skills"></section>
<section class="page-section" id="projects"></section>
<section class="page-section contact-section" id="contact"></section>
</body></html>`;
const article = '<html><head></head><body class="page-case-study"><article>Case study</article></body></html>';

test('every Persona page loads the header calendar', () => {
  for (const html of [personaPreview(home, '', true, ui), personaPreview(article, '', false, ui)]) {
    assert.match(html, /assets\/themes\/persona\/header-calendar\.css/);
    assert.match(html, /assets\/themes\/persona\/header-calendar\.js" defer/);
  }
});

test('only project pages load the switch-off exit', () => {
  assert.doesNotMatch(personaPreview(home, '', true, ui), /project-exit\.js/);
  assert.match(personaPreview(article, '', false, ui), /assets\/themes\/persona\/project-exit\.js" defer/);
});
