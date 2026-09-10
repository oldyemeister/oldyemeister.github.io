// Decorate the already-rendered pages so both designs share content and assets.
// Used by the local preview and production static builds.
export function personaPreview(html, prefix = '/persona') {
  const home = /<body class="page-home">/.test(html);
  const guide = html.match(/<aside class="keyboard-guide[^"]*"[^>]*>[\s\S]*?<\/aside>/);
  const gameKeys = guide ? [...guide[0].matchAll(/<li>([\s\S]*?)<\/li>/g)]
    .map(([, instruction]) => `<span class="hud-instruction hud-game-key">${instruction}</span>`).join('') : '';
  if (guide) {
    html = html
      .replace(/<p class="section-index">Project summary<\/p>\s*<h2>[^<]*<\/h2>/, '<h2>Summary</h2>')
      .replace('<h1>', '<h1 id="game-page-title">')
      .replace(/aria-labelledby="(?:game-heading|dk-game-heading|imu-demo-heading)"/g, 'aria-labelledby="game-page-title"')
      .replace(/<div>\s*<p class="section-index">[^<]*<\/p>\s*<h2 id="(?:game-heading|dk-game-heading|imu-demo-heading)">[^<]*<\/h2>\s*<\/div>/g, '');
  }
  return html
    .replace(/<aside class="keyboard-guide[^"]*"[^>]*>[\s\S]*?<\/aside>/g, '')
    .replace(/<p class="section-index">\s*\d+\s*<\/p>/g, '')
    .replace(/src="\/assets\/js\/(?:project-bootstrap|imu-sandbox-bootstrap)\.js[^"]*"/g,
      'src="/assets/themes/persona/game-start.js"')
    .replace(/href="(\/[^"#?]*)([^" ]*)"/g, (match, path, suffix) => {
      if (path === '/' || path.startsWith('/projects/') || path === '/404.html') {
        return `href="${prefix}${path}${suffix}"`;
      }
      return match;
    })
    .replace('</head>', `
      <link rel="stylesheet" href="/assets/themes/persona/style.css">
      <script src="/assets/themes/persona/arrival.js"></script>
    </head>`)
    .replace(/<body class="([^"]*)">/, `<body class="$1 persona-design" data-persona-base="${prefix}/">
      <div class="page-wipe" aria-hidden="true"><i></i><i></i><i></i></div>`)
    .replace(/<figure class="portrait-frame">[\s\S]*?<\/figure>/, `
      <figure class="portrait-frame persona-monogram" role="img" aria-label="JY monogram for Jiawei Ye">
        <span aria-hidden="true">JY<span class="monogram-dot">.</span></span>
      </figure>`)
    .replace('</body>', `
      <nav class="persona-hud" aria-label="Keyboard shortcuts">
        ${gameKeys}
        <span class="hud-instruction"><kbd>${home ? '↑ ↓ / Tab' : 'Tab'}</kbd><span>Select</span></span>
        <span class="hud-instruction"><kbd>Enter</kbd><span>Confirm</span></span>
        <a class="hud-home" href="${prefix}/${home ? '#home' : ''}" data-hud-home aria-keyshortcuts="Escape"><kbd>Esc</kbd><span>Home</span><span aria-hidden="true">↗</span></a>
      </nav>
      <script src="/assets/themes/persona/interface.js" defer></script>
    </body>`);
}
