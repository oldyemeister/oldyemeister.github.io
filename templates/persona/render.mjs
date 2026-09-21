// Decorate the already-rendered pages so both designs share content and assets.
// Used by the local preview and production static builds.
import { redesignContent } from './redesign.mjs';

export function personaPreview(html, prefix = '/persona', redesign = true) {
  if (redesign) html = redesignContent(html);
  const home = /<body class="page-home">/.test(html);
  const guide = html.match(/<aside class="keyboard-guide[^"]*"[^>]*>[\s\S]*?<\/aside>/);
  const gameKeys = guide ? [...guide[0].matchAll(/<li>([\s\S]*?)<\/li>/g)]
    .map(([, instruction]) => `<span class="hud-instruction hud-game-key">${instruction.replace(/<kbd>([^<]+)<\/kbd>/g, (_, keys) => keys.trim().split(/\s+/).map(key => `<kbd${/[↑↓←→]/.test(key) ? ' class="hud-arrow"' : ''}>${key}</kbd>`).join(''))}</span>`).join('') : '';
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
      <link rel="stylesheet" href="/assets/themes/persona/style.css?v=5">
      ${redesign ? '<link rel="stylesheet" href="/assets/themes/persona/tokens.css">\n      <link rel="stylesheet" href="/assets/themes/persona/redesign.css">' : ''}
      <link rel="stylesheet" href="/assets/themes/persona/key-instructions.css">
      <link rel="stylesheet" href="/assets/themes/persona/project-tv-effect.css?v=2">
      <link rel="stylesheet" href="/assets/themes/persona/skills-section.css?v=3">
      <link rel="stylesheet" href="/assets/themes/persona/hero-poster.css?v=34">
      <link rel="stylesheet" href="/assets/themes/persona/hero-ambient.css?v=5">
      <link rel="stylesheet" href="/assets/themes/persona/content-typography.css">
      ${redesign ? '<link rel="stylesheet" href="/assets/themes/persona/section-backgrounds.css">' : ''}
      ${redesign ? '<link rel="stylesheet" href="/assets/themes/persona/education-settings.css">' : ''}
      <link rel="stylesheet" href="/assets/themes/persona/experience-save-menu.css">
      ${redesign ? '<script src="/assets/js/about-pills.js" defer></script>' : ''}
      ${home ? '<link rel="stylesheet" href="/assets/themes/persona/scroll-presence.css?v=6">\n      <script type="module" src="/assets/js/scroll-presence.js?v=6"></script>' : ''}
      ${home ? `<script>
        if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
          document.documentElement.classList.add('about-scroll-pending');
          window.aboutScrollFallback = setTimeout(() => document.documentElement.classList.remove('about-scroll-pending'), 2000);
        }
      </script>` : ''}
      <script src="/assets/themes/persona/arrival.js"></script>
    </head>`)
    .replace(/<body class="([^"]*)">/, `<body class="$1 persona-design" data-persona-base="${prefix}/">
      <div class="page-wipe" aria-hidden="true"><i></i><i></i><i></i></div>`)
    .replace('</body>', `
      <nav class="persona-hud" aria-label="Keyboard shortcuts">
        ${home ? `
        <button class="hud-menu-toggle" type="button" data-hud-menu-toggle aria-controls="site-navigation" aria-keyshortcuts="Tab"><kbd>Tab</kbd><span>Menu</span></button>
        <button class="hud-menu-toggle" type="button" data-hud-menu-toggle aria-controls="site-navigation" aria-keyshortcuts="Escape"><kbd>Esc</kbd><span>Menu</span></button>` : `
        ${gameKeys}
        <span class="hud-instruction"><kbd>Tab</kbd><span>Navigate</span></span>
        <span class="hud-instruction"><kbd>Enter</kbd><span>Open</span></span>
        <a class="hud-home" href="${prefix}/" data-hud-home aria-keyshortcuts="Escape"><kbd>Esc</kbd><span>Home</span><span aria-hidden="true">↗</span></a>`}
      </nav>
      <script src="/assets/themes/persona/interface.js?v=5" defer></script>
    </body>`);
}
