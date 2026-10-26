import { flowerPetals, whiteFlower } from './flower.mjs';
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
  html = experienceDiscMarks(html, projectData);
  html = projectCardMeta(html, projectData);
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
  // Four smaller, independently staggered clouds per source silhouette.
  // Keep the static SVG turbulence texture cached; animate only translation.
  const largeClouds = [];
  let cloudIndex = 0;
  html = html.replace(/<image class="hero-cloud"[^>]*\/>/g, cloud => {
    const index = cloudIndex++;
    const sourceY = Number(cloud.match(/ y="([-\d.]+)"/)[1]);
    // sqrt(1.4) enlarges area by 40%, preserving each source's proportions.
    // A permuted phase spreads the slow background clouds across the full sky.
    const largeDuration = 180 + index * 9;
    const largePhase = .24 + (index * 4 % 9) * .075;
    largeClouds.push(cloud
      .replace('class="hero-cloud"', 'class="hero-cloud hero-cloud--large"')
      .replace(/ x="[-\d.]+"/, ' x="-360"')
      .replace(/ y="[-\d.]+"/, ` y="${-130 + index * 90}"`)
      .replace(/(width|height)="([\d.]+)"/g, (_, name, size) => `${name}="${(Number(size) * Math.sqrt(1.4)).toFixed(2)}"`)
      .replace(/style="[^"]*"/, `style="--cloud-duration: ${largeDuration}s; --cloud-delay: -${(largeDuration * largePhase).toFixed(2)}s"`));
    return Array.from({ length: 4 }, (_, layer) => {
      const scale = [.68, .75, .8, .72][layer];
      const duration = [88, 64, 44, 32][layer] + (index * 7 % 13);
      const phase = (.14 + index * .137 + layer * .241) % 1;
      return cloud
        .replace(/ x="[-\d.]+"/, ' x="-240"')
        .replace(/ y="[-\d.]+"/, ` y="${sourceY + [-26, 14, 44, -8][layer]}"`)
        .replace(/(width|height)="([\d.]+)"/g, (_, name, size) => `${name}="${(Number(size) * scale).toFixed(2)}"`)
        .replace(/style="[^"]*"/, `style="--cloud-duration: ${duration}s; --cloud-delay: -${(duration * phase).toFixed(2)}s"`);
    }).join('');
  });
  html = html.replace('<g class="hero-sky-clouds">',
    `<g class="hero-sky-clouds">${largeClouds.join('')}`);
  // Keep independent horizontal drift inside the viewport-anchored sky field.
  // Continue the actual hero SVG into the area uncovered by the sliding header.
  const heroArt = html.match(/<svg class="hero-reference-art"[\s\S]*?<\/svg>/)?.[0];
  if (!heroArt) throw new Error('Persona template: expected the hero artwork (svg.hero-reference-art) on the homepage.');
  const headerArt = heroArt.replace('hero-reference-art', 'hero-header-art')
    .replace(/id="(hero-[^"]+)"/g, 'id="header-$1"')
    .replace(/url\(#(hero-[^)]+)\)/g, 'url(#header-$1)');
  html = replaceRequired(html, '<div class="hero-top-extension" aria-hidden="true" hidden></div>',
    `<div class="hero-top-extension" aria-hidden="true">${headerArt}</div>`, 'the hero top extension');
  // Adapted Revival silhouettes: offscreen sweeps and a portfolio circuit card.
  // CSS uses their alpha as a mask so the existing yellow token remains intact.
  const maskArt = variant => `<div class="about-sky-mask about-sky-mask--${variant}" aria-hidden="true"></div>`;
  const clouds = heroArt.match(/<g class="hero-sky-clouds">[\s\S]*?<\/g>/)?.[0];
  if (!clouds) throw new Error('Persona template: expected reusable sky clouds.');
  html = replaceRequired(html, /<section[^>]*id="about"[^>]*>/,
    opening => `${opening}<div class="about-sky-base about-sky-texture" aria-hidden="true"><svg viewBox="0 0 1440 1486" preserveAspectRatio="xMidYMid slice" focusable="false"><g transform="translate(-80 0) scale(1.5)">${clouds}</g></svg></div>${maskArt('desktop')}${maskArt('mobile')}`, 'the About sky mask');
  // The oversized serif echo is artwork; the original h2 remains the heading.
  // The silhouette separates the warm lettering from the sky-only CRT shadow.
  if (projectData.about?.heading) {
    const lettering = escapeAttribute(projectData.about.heading);
    html = replaceRequired(html, /<section[^>]*id="about"[^>]*>/,
      opening => `${opening}<div class="about-title-echo" aria-hidden="true"><div class="about-title-sky-shadow"><div class="about-title-lettering about-title-lettering--shadow">${lettering}</div></div><div class="about-title-lettering">${lettering}</div><div class="about-title-lettering about-title-lettering--yellow">${lettering}</div></div>`, 'the About title echo');
  }
  const aboutFlowers = `<div class="about-flower-pair" aria-hidden="true">
    <svg class="about-flower about-flower--gold" viewBox="-16 -16 352 352" focusable="false"><g class="about-flower-spin">${flowerPetals}</g></svg>
    <svg class="about-flower about-flower--dark" viewBox="-16 -16 352 352" focusable="false"><g class="about-flower-spin">${flowerPetals}</g></svg>
  </div>`;
  html = replaceRequired(html, /<section[^>]*id="about"[^>]*>/,
    opening => `${opening}${aboutFlowers}`, 'the About flower pair');
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
  // About's top stripes continue up into the hero as tapered heads; they sit
  // above the hero art and below its flowers, copy and buttons.
  html = html.replace('<div class="hero-visual-stage">',
    '<div class="hero-visual-stage"><div class="about-stripe-heads about-sky-texture" aria-hidden="true"></div>');
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
  // Special-page composition: a sky ribbon and a framed university record.
  // Keep the shared source and all education copy intact.
  const educationTitle = escapeAttribute(projectData.education_section?.heading || 'Education');
  html = replaceRequired(html, /<section[^>]*id="education"[^>]*>/,
    opening => `${opening}<div class="education-sky-window about-sky-texture" aria-hidden="true"><svg viewBox="0 0 1920 1400" preserveAspectRatio="xMidYMid slice" focusable="false">${clouds}</svg><span class="education-ribbon-shine"></span><div class="education-title-echo">${educationTitle}</div></div><div class="about-stripe-tails about-sky-texture" aria-hidden="true"></div>`, 'the Education sky ribbon');
  html = html.replace(/<div class="section-body education-card">/,
    '$&<svg class="education-frame-trace" aria-hidden="true" focusable="false"><rect pathLength="1" fill="none" stroke-dasharray="1"/></svg>');
    // The supplied joined-center silhouette is shared by all solid flowers.
  const petals = flowerPetals;
  // The hero and Contact share exactly the same six teardrop petals.
  html = replaceRequired(html, /(<g[^>]* data-contact-petals)>\s*<\/g>/g, (_, opening) => {
    const isWhite = opening.includes('hero-flower-new') || opening.includes('hero-flower-light');
    return `${opening}><g class="hero-flower-spin"><g>${isWhite ? whiteFlower : petals}</g></g></g>`;
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

// P4G's save discs carry a print (sakura on the selected one); ours carry the
// employer's mark, plus a full-color logo after the company name. Options
// follow content.yml order; entries without either field stay plain.
export function experienceDiscMarks(html, { experience } = {}) {
  if (!experience?.length) return html;
  let index = 0;
  html = html.replace(/(<div class="experience-save-option" role="option"[\s\S]*?<span class="experience-save-sphere" aria-hidden="true">)([\s\S]*?<\/span>)(<\/h3>)/g,
    (_, sphere, middle, closing) => {
      const { disc_mark: mark, name_logo: logo } = experience[index++] ?? {};
      return sphere +
        (mark ? `<span class="experience-save-mark" style="--save-mark: url('${escapeAttribute(mark)}')"></span>` : '') +
        middle +
        (logo ? `<img class="experience-save-name-logo" src="${escapeAttribute(logo)}" alt="" loading="lazy">` : '') +
        closing;
    });
  if (index !== experience.length) throw new Error('Persona experience options must match the content experience list.');
  return html;
}

// A role and date line under each card title, from content.yml in card order.
export function projectCardMeta(html, { projects } = {}) {
  if (!projects?.length) return html;
  let index = 0;
  html = html.replace(/(<p class="project-file-index"[\s\S]*?<\/p>\s*<h3>[\s\S]*?<\/h3>)/g, (match) => {
    const { role, dates } = projects[index++] ?? {};
    if (!role && !dates) return match;
    const parts = [role && `<span class="project-meta-role">${escapeAttribute(role)}</span>`,
      dates && `<span class="project-meta-date">${escapeAttribute(dates)}</span>`].filter(Boolean);
    return `${match}\n          <p class="project-meta">${parts.join('')}</p>`;
  });
  if (index !== projects.length) throw new Error('Persona project cards must match the content project list.');
  return html;
}

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
