import { flowerPetals } from './flower.mjs';
import { playBadge } from './play-badge.mjs';
import { replaceRequired } from './anchors.mjs';
// Small semantic additions for the optional redesign; original pages stay intact.
export function redesignContent(html, projectData = {}) {
  // Shared 404 source remains pristine for /original/ and rollback.
  if (html.includes('class="page-section error-section"')) {
    html = replaceRequired(html, /(<section class="page-section error-section">\s*<div class="content-shell">)([\s\S]*?)(<\/div>\s*<\/section>)/,
      (_, opening, content, closing) => opening + replaceRequired(content,
        '<p class="eyebrow">404</p>',
        '<div class="dialogue-box"><p class="eyebrow dialogue-name">404</p><div class="dialogue-panel">',
        'the 404 name plate') + '<span class="dialogue-continue" aria-hidden="true"></span></div></div>' + closing,
      'the 404 content shell');
  }
  // Persona-only decorative short names; the real case-study h1 stays intact.
  const pageClass = html.match(/<body class="page-([^" ]+)"/)?.[1];
  const shortTitle = { 'rf-receiver': 'RF Receiver', aps380: 'ACC' }[pageClass];
  if (shortTitle && html.includes('<header class="case-study-hero">')) {
    html = replaceRequired(html, '<header class="case-study-hero">',
      `<header class="case-study-hero"><span class="case-study-cropped-title" data-title="${shortTitle}" aria-hidden="true" style="--case-title-chars: ${shortTitle.length}; --case-title-advance: ${pageClass === 'rf-receiver' ? .831 : 1.008}"></span>`,
      'the case-study hero');
  }
  // Section art only exists on the homepage.
  if (!/<body class="page-home">/.test(html)) return html;
  html = projectCategoryControls(html, projectData);
  // Replace only playable markers; case studies and the original design stay intact.
  html = html.replace(/<span class="project-playable-badge" data-play-url="([^"]+)" data-play-label="([^"]+)">[^<]*<\/span>/g,
    (_, url, label) => playBadge(url, label));
  // Reference motifs: flat rings, tapered sparkles, and water-drop flowers.
  // Deliberately scattered, stable positions keep decoration away from content.
  const motifs = {
    star: '<path d="M50 3 60 34 94 22 72 49 96 69 63 67 55 98 42 69 9 82 29 54 4 34 38 36Z"/>',
    sparkle: '<path d="M50 2C55 39 61 45 98 50C61 55 55 61 50 98C45 61 39 55 2 50C39 45 45 39 50 2Z"/>',
    ring: '<circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" stroke-width="15"/>',
    rings: '<circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" stroke-width="10"/><circle cx="50" cy="50" r="24" fill="none" stroke="currentColor" stroke-width="8"/>',
    flower: `<g transform="translate(50 50) scale(.32) translate(-160 -160)">${flowerPetals}</g>`,
    // Circuit-board chip, echoing the Skills section's hardware category icon.
    chip: '<rect x="30" y="30" width="40" height="40" rx="4" fill="none" stroke="currentColor" stroke-width="6"/><path d="M30 30V12M50 30V8M70 30V12M30 70V88M50 70V92M70 70V88M30 40H12M30 60H8M70 40H88M70 60H92" stroke="currentColor" stroke-width="5" fill="none"/>',
    // D-pad cross, tying the Projects section's decoration to its game-console theme.
    dpad: '<path d="M38 8H62V36H90V64H62V92H38V64H10V36H38Z" fill="none" stroke="currentColor" stroke-width="7"/>'
  };
  const decorations = {
    about: [['star', 'palette-cyan', 'star'], ['ring', 'config-orange', 'ring']],
    skills: [['chip', 'config-lime', 'sparkle']],
    contact: [['flower', 'config-orange', 'flower'], ['sparkle', 'palette-cyan', 'sparkle']]
  };
  for (const [section, shapes] of Object.entries(decorations)) {
    const artwork = shapes.map(([shape, color, position]) => `<svg class="section-motif section-motif--${position}" style="color:var(--${color})" viewBox="0 0 100 100" focusable="false">${motifs[shape]}</svg>`).join('');
    html = replaceRequired(html, new RegExp(`<section[^>]*id="${section}"[^>]*>`),
      opening => `${opening}<div class="section-motifs" aria-hidden="true">${artwork}</div>`, `the #${section} section`);
  }
  // Continue the actual hero SVG into the area uncovered by the sliding header.
  const heroArt = html.match(/<svg class="hero-reference-art"[\s\S]*?<\/svg>/)?.[0];
  if (!heroArt) throw new Error('Persona template: expected the hero artwork (svg.hero-reference-art) on the homepage.');
  const headerArt = heroArt.replace('hero-reference-art', 'hero-header-art')
    .replace(/id="(hero-[^"]+)"/g, 'id="header-$1"')
    .replace(/url\(#(hero-[^)]+)\)/g, 'url(#header-$1)');
  html = replaceRequired(html, '<div class="hero-top-extension" aria-hidden="true" hidden></div>',
    `<div class="hero-top-extension" aria-hidden="true">${headerArt}</div>`, 'the hero top extension');
  // Projects reuses About's rainbow corner bands (the old-TV motif) from one source.
  const ribbons = html.match(/<svg class="about-corner-ribbons"[\s\S]*?<\/svg>/)?.[0];
  if (!ribbons) throw new Error('Persona template: expected the About corner ribbons (svg.about-corner-ribbons) on the homepage.');
  const projectRibbons = ribbons.replace('about-corner-ribbons', 'project-corner-ribbons')
    .replace('about-corner-ribbon-bands', 'project-corner-ribbon-bands');
  html = replaceRequired(html, /<section[^>]*id="projects"[^>]*>/,
    opening => `${opening}\n  ${projectRibbons}`, 'the #projects section');
  // P4G Status-screen stripes down About's right edge, sampled left to right
  // as [x, width, fill] in a 288-unit band (docs/design-reference.md, item 9).
  // Inserted before the corner fan so the fan paints over them.
  const stripePalette = [
    [12.5, '#FFFFEB'], [18, '#BEE617'], [12.5, '#FFFCE0'], [23.7, '#20C9D3'],
    [14, '#FFFAC1'], [18, '#FFD229'], [12.5, '#FFFDE0'], [24.8, '#009B3A'],
    [12.5, '#FFFFEB'], [18, '#E1FF00'], [14, '#FFFCE0'], [29.3, '#FF6500'],
    [12.5, '#FFFAC1'], [18, '#FFAD08'], [12.5, '#FFFDE0'], [18, '#F4D51C'],
    [12.5, '#FFFFEB'], [14.7, '#A31C08']
  ];
  const stripeTotal = stripePalette.reduce((sum, [width]) => sum + width, 0);
  let stripeX = 0;
  const statusStripes = stripePalette.map(([weight, fill], index, stripes) => {
    const width = weight * 288 / stripeTotal;
    const x = stripeX;
    stripeX += width;
    return `<g class="about-status-stripe-angle"><rect style="--stripe: ${index}; --stripe-count: ${stripes.length}" data-stripe-width="${width}" x="${x}" y="0" width="${width}" height="100" fill="${fill}"/></g>`;
  }).join('');
  html = replaceRequired(html, '<svg class="about-corner-ribbons"',
    `<svg class="about-status-stripes" viewBox="0 0 288 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <defs><linearGradient id="about-status-stripe-shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".1"/></linearGradient></defs>
    <g class="about-status-stripe-bands">${statusStripes}</g>
    <rect class="about-status-stripe-shade" width="288" height="100" fill="url(#about-status-stripe-shade)"/>
  </svg>
  <svg class="about-corner-ribbons"`, 'the About corner ribbons');
  // Shared settings-reference edge bands in Education and Contact.
  const settingsBands = [
    ['config-orange', 5], ['config-silver', 6], ['palette-yellow', 4],
    ['config-ice', 24], ['config-taupe', 22], ['config-violet', 8],
    ['config-ice', 5], ['config-orange', 7], ['config-lime', 5],
    ['palette-yellow', 9], ['config-violet', 5]
  ].map(([color, height]) => `<span style="--band-color:var(--${color});--band-height:${height}px"></span>`).join('');
  html = replaceRequired(html, /(<section[^>]*id="education"[\s\S]*?)(<\/section>)/,
    (_, section, closing) => `${section}<div class="education-horizontal-ribbons" aria-hidden="true">${settingsBands}</div>\n${closing}`,
    'the #education section');
    // Six water drops with flat inward heads aligned at one shared center.
  const petals = flowerPetals;
  // The hero and Contact share exactly the same six teardrop petals.
  html = replaceRequired(html, /(<g[^>]* data-contact-petals)>\s*<\/g>/g, (_, opening) => {
    const outline = (opening.includes('hero-flower-new') || opening.includes('hero-flower-light'))
      ? `<g class="hero-flower-rainbow-outline">${petals}</g>` : '';
    return `${opening}><g class="hero-flower-spin">${outline}<g>${petals}</g></g></g>`;
  }, 'the flower placeholders (g[data-contact-petals])');
  html = replaceRequired(html, '<section class="page-section contact-section" id="contact">',
    `<section class="page-section contact-section" id="contact">
      <div class="contact-edge-ribbons" aria-hidden="true">${settingsBands}</div>
      <svg class="contact-flower" viewBox="0 0 340 340" aria-hidden="true" focusable="false">
        <g class="contact-flower-shadow" transform="translate(6 18)"><g class="contact-flower-spin">${petals}</g></g>
        <g class="contact-flower-face contact-flower-spin">${petals}</g>
      </svg>`, 'the #contact section');
  return html;
}

const escapeAttribute = value => String(value).replace(/[&<>"']/g,
  character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

// The shared source markup stays untouched. Cards follow content.yml order.
export function projectCategoryControls(html, { projects_section: section, projects } = {}) {
  if (!section?.categories?.length) return html;
  const categories = section.categories;
  const ids = new Set(categories.map(category => category.id));
  if (ids.size !== categories.length || ids.has('all') ||
      categories.some(category => !/^[a-z][a-z0-9-]*$/.test(category.id))) {
    throw new Error('Persona project categories must have unique slug IDs, excluding "all".');
  }
  let index = 0;
  html = html.replace(/<article class="project-card([^"]*)">/g, (_, classes) => {
    const project = projects?.[index++];
    if (!project?.categories?.length || project.categories.some(id => !ids.has(id))) {
      throw new Error('Every Persona project must reference a configured category.');
    }
    return `<article class="project-card${classes}" data-project-categories="${project.categories.join(' ')}">`;
  });
  if (index !== projects?.length) throw new Error('Persona project cards must match the content project list.');
  const button = (id, label) => `<button type="button" class="project-category-tab" data-project-category="${id}" aria-pressed="${id === 'all'}" aria-controls="persona-project-grid">${escapeAttribute(label)}</button>`;
  const count = projects.length === 1 ? section.count_one : section.count_many.replace('{count}', projects.length);
  const controls = `<div class="project-category-controls" data-project-filters hidden>
    <div class="project-category-bar" role="group" aria-label="${escapeAttribute(section.filter_label)}">
      ${button('all', section.all_label)}${categories.map(category => button(category.id, category.label)).join('')}
    </div>
    <p class="project-category-count" role="status" aria-live="polite" aria-atomic="true" data-project-count data-count-one="${escapeAttribute(section.count_one)}" data-count-many="${escapeAttribute(section.count_many)}">${escapeAttribute(count)}</p>
  </div>`;
  html = replaceRequired(html, '<div class="project-grid">',
    `${controls}<div class="project-grid" id="persona-project-grid">`, 'the project grid');
  return replaceRequired(html, '</body>',
    '<script type="module" src="/assets/js/project-categories.js"></script>\n</body>', 'the document body');
}
