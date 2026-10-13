import test from 'node:test';
import assert from 'node:assert/strict';
import { filterProjects } from '../assets/js/project-categories.js';
import { projectCategoryControls } from '../templates/persona/redesign.mjs';

function card(categories) {
  return { dataset: {projectCategories: categories}, hidden: false, pauses: 0,
    querySelectorAll() { return [{pause: () => this.pauses++}]; } };
}
test('filters exact category tokens, restores every card and pauses hidden previews', () => {
  const cards = [card('hardware software'), card('hardware'), card('media')];
  assert.equal(filterProjects(cards, 'software'), 1);
  assert.deepEqual(cards.map(c => c.hidden), [false, true, true]);
  assert.deepEqual(cards.map(c => c.pauses), [0, 1, 1]);
  assert.equal(filterProjects(cards, 'ware'), 0);
  assert.equal(filterProjects(cards, 'media'), 1);
  assert.equal(filterProjects(cards, 'all'), 3);
  assert(cards.every(c => !c.hidden));
});
const source = '<html><head></head><body><div class="project-grid"><article class="project-card"><h3>Demo</h3></article></div></body></html>';
const data = {
  projects_section: {filter_label: 'Category', all_label: 'All', count_one: '1 project', count_many: '{count} projects', categories: [{id: 'hardware', label: 'Hardware & FPGA'}]},
  projects: [{categories: ['hardware']}]
};
test('Persona controls start hidden, expose pressed state and escape labels', () => {
  const result = projectCategoryControls(source, data);
  assert.match(result, /data-project-filters hidden/);
  assert.match(result, /Hardware &amp; FPGA/);
  assert.match(result, /data-project-category="all" aria-pressed="true"/);
  assert.match(result, /data-project-categories="hardware"/);
  assert.match(result, /id="persona-project-grid"/);
  assert.match(result, /role="status"/);
  assert.doesNotMatch(result, /<article[^>]*hidden/);
});
test('missing category configuration leaves the shared markup intact', () => {
  assert.equal(projectCategoryControls(source), source);
});
test('rejects mismatched cards or unknown category data rather than filtering the wrong projects', () => {
  assert.throws(() => projectCategoryControls(source, {...data, projects: [{categories: ['unknown']}]}), /configured category/);
  assert.throws(() => projectCategoryControls(source, {...data, projects: [...data.projects, ...data.projects]}), /match the content/);
  assert.throws(() => projectCategoryControls(source, {...data, projects_section: {...data.projects_section, categories: [{id: 'all', label: 'All'}]}}), /unique slug/);
});
