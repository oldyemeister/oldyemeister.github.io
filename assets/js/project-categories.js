// Progressive enhancement: no JavaScript means every project remains visible.
export function filterProjects(cards, category) {
  let count = 0;
  for (const card of cards) {
    const matches = category === 'all' || card.dataset.projectCategories.split(/\s+/).includes(category);
    card.hidden = !matches;
    if (matches) count++;
    else card.querySelectorAll('video').forEach(video => video.pause());
  }
  return count;
}

export function initializeProjectCategories(root) {
  const controls = root?.querySelector('[data-project-filters]');
  const cards = [...(root?.querySelectorAll('[data-project-categories]') || [])];
  if (!controls || !cards.length) return;
  const buttons = [...controls.querySelectorAll('[data-project-category]')];
  const status = controls.querySelector('[data-project-count]');
  const select = button => {
    const count = filterProjects(cards, button.dataset.projectCategory);
    buttons.forEach(candidate => candidate.setAttribute('aria-pressed', String(candidate === button)));
    status.textContent = count === 1 ? status.dataset.countOne : status.dataset.countMany.replace('{count}', count);
  };
  buttons.forEach(button => button.addEventListener('click', () => select(button)));
  select(buttons[0]);
  controls.hidden = false;
}

if (typeof document !== 'undefined') {
  initializeProjectCategories(document.querySelector('body.persona-design #projects'));
}
