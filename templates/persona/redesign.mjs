import { flowerPetals } from './flower.mjs';
// Small semantic additions for the optional redesign; original pages stay intact.
export function redesignContent(html) {
  // Reference motifs: flat rings, tapered sparkles, and round-petal flowers.
  // Deliberately scattered, stable positions keep decoration away from content.
  const motifs = {
    star: '<path d="M50 3 60 34 94 22 72 49 96 69 63 67 55 98 42 69 9 82 29 54 4 34 38 36Z"/>',
    sparkle: '<path d="M50 2C55 39 61 45 98 50C61 55 55 61 50 98C45 61 39 55 2 50C39 45 45 39 50 2Z"/>',
    ring: '<circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" stroke-width="15"/>',
    rings: '<circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" stroke-width="10"/><circle cx="50" cy="50" r="24" fill="none" stroke="currentColor" stroke-width="8"/>',
    flower: Array.from({ length: 6 }, (_, i) => `<path transform="rotate(${i * 60} 50 50)" d="M50 50C41 38 33 24 39 15C44 7 56 7 61 15C67 24 59 38 50 50Z"/>`).join(''),
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
    html = html.replace(new RegExp(`(<section[^>]*id="${section}"[^>]*>)`), `$1<div class="section-motifs" aria-hidden="true">${artwork}</div>`);
  }
  // Continue the actual hero SVG into the area uncovered by the sliding header.
  const heroArt = html.match(/<svg class="hero-reference-art"[\s\S]*?<\/svg>/)?.[0];
  if (heroArt) {
    const headerArt = heroArt.replace('hero-reference-art', 'hero-header-art')
      .replace(/id="(hero-[^"]+)"/g, 'id="header-$1"')
      .replace(/url\(#(hero-[^)]+)\)/g, 'url(#header-$1)');
    html = html.replace('<div class="hero-top-extension" aria-hidden="true" hidden></div>',
      `<div class="hero-top-extension" aria-hidden="true">${headerArt}</div>`);
  }
  // Shared settings-reference bands: horizontal in Education, vertical in Contact.
  const settingsBands = [
    ['config-orange', 5], ['config-silver', 6], ['palette-yellow', 4],
    ['config-ice', 24], ['config-taupe', 22], ['config-violet', 8],
    ['config-ice', 5], ['config-orange', 7], ['config-lime', 5],
    ['palette-yellow', 9], ['config-violet', 5]
  ].map(([color, height]) => `<span style="--band-color:var(--${color});--band-height:${height}px"></span>`).join('');
  html = html.replace(/(<section[^>]*id="education"[\s\S]*?)(<\/section>)/,
    `$1<div class="education-horizontal-ribbons" aria-hidden="true">${settingsBands}</div>\n$2`);
  // Six distinct teardrops, shifted inward so their tips overlap into a small center.
  const petals = flowerPetals;
  // The hero and Contact share exactly the same six teardrop petals.
  html = html.replace(/(<g[^>]* data-contact-petals)>\s*<\/g>/g, (_, opening) => {
    const outline = (opening.includes('hero-flower-new') || opening.includes('hero-flower-light'))
      ? `<g class="hero-flower-rainbow-outline">${petals}</g>` : '';
    return `${opening}><g class="hero-flower-spin">${outline}<g>${petals}</g></g></g>`;
  });
  html = html.replace('<section class="page-section contact-section" id="contact">',
    `<section class="page-section contact-section" id="contact">
      <div class="contact-edge-ribbons" aria-hidden="true">${settingsBands}</div>
      <svg class="contact-flower" viewBox="0 0 340 340" aria-hidden="true" focusable="false">
        <g class="contact-flower-shadow" transform="translate(6 18)"><g class="contact-flower-spin">${petals}</g></g>
        <g class="contact-flower-face contact-flower-spin">${petals}</g>
      </svg>`);
  return html.replace(/<article class="project-card[^\"]*">[\s\S]*?<\/article>/g, article => {
    const caption = article.match(/<img\b[^>]*\balt="([^\"]+)"/)?.[1];
    if (!caption) return article;
    return article.replace(/<div class="project-media">([\s\S]*?)<\/div>\s*(<div class="project-content">)/,
      (_, media, content) => `<figure class="project-visual"><div class="project-media">${media}</div><figcaption>${caption}</figcaption></figure>\n${content}`);
  });
}
