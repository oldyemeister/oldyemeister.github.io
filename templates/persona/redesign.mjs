// Small semantic additions for the optional redesign; original pages stay intact.
export function redesignContent(html) {
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
  const petalInset = 18; // SVG units toward the center; increase for more overlap.
  const petals = [0, 60, 120, 180, 240, 300].map(angle =>
    `<path transform="rotate(${angle} 160 160) translate(0 ${petalInset})" d="M160 160 C149 123 112 57 122 31 C130 8 163 7 175 26 C192 53 168 123 160 160Z"/>`).join('');
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
