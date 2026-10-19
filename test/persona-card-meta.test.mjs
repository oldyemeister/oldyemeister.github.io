import test from 'node:test';
import assert from 'node:assert/strict';
import { experienceDiscMarks, projectCardMeta } from '../templates/persona/redesign.mjs';

const option = '<div class="experience-save-option" role="option" aria-selected="false"><span class="experience-save-sphere" aria-hidden="true"><span class="experience-save-number"></span></span><h3>Role <span>— Co</span></h3></div>';
test('prints disc marks in content order and leaves unmarked discs plain', () => {
  const result = experienceDiscMarks(option + option, {experience: [{disc_mark: '/a.svg'}, {}]});
  assert.equal(result.match(/experience-save-mark/g).length, 1);
  assert.match(result, /--save-mark: url\('\/a\.svg'\)/);
  const named = experienceDiscMarks(option, {experience: [{name_logo: '/b.svg'}]});
  assert.match(named, /<span>— Co<\/span><img class="experience-save-name-logo" src="\/b\.svg" alt="" loading="lazy"><\/h3>/);
  assert.doesNotMatch(named, /experience-save-mark/);
  assert.throws(() => experienceDiscMarks(option, {experience: [{}, {}]}), /match the content/);
  assert.equal(experienceDiscMarks(option), option);
});

const card = '<p class="project-file-index" aria-hidden="true"><span>FILE</span> 01</p>\n<h3>Demo</h3>';
test('adds escaped role and date lines under each project title', () => {
  const result = projectCardMeta(card + card, {projects: [{role: 'RF & PCB', dates: 'Jan — Apr 2025'}, {}]});
  assert.match(result, /<h3>Demo<\/h3>\s*<p class="project-meta"><span class="project-meta-role">RF &amp; PCB<\/span><span class="project-meta-date">Jan — Apr 2025<\/span><\/p>/);
  assert.equal(result.match(/project-meta"/g).length, 1);
  assert.throws(() => projectCardMeta(card, {projects: [{}, {}]}), /match the content/);
});
