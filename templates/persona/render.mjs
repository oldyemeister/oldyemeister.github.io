// Decorate the already-rendered pages so both designs share content and assets.
// Used by the local preview and production static builds. `ui` is the ui: block
// from _data/content.yml, which supplies every label this file inserts.
import { redesignContent } from './redesign.mjs';
import { replaceRequired } from './anchors.mjs';

export function personaPreview(html, prefix = '/persona', redesign = true, ui) {
  if (redesign) html = redesignContent(html);
  const home = /<body class="page-home">/.test(html);
  const guide = html.match(/<aside class="keyboard-guide[^"]*"[^>]*>[\s\S]*?<\/aside>/);
  const gameKeys = guide ? [...guide[0].matchAll(/<li>([\s\S]*?)<\/li>/g)]
    .map(([, instruction]) => `<span class="hud-instruction hud-game-key">${instruction.replace(/<kbd>([^<]+)<\/kbd>/g, (_, keys) => keys.trim().split(/\s+/).map(key => `<kbd${/[↑↓←→]/.test(key) ? ' class="hud-arrow"' : ''}>${key}</kbd>`).join(''))}</span>`).join('') : '';
  if (guide) {
    html = replaceRequired(html, '<h1>', '<h1 id="game-page-title">', 'the game page <h1>');
    html = replaceRequired(html, /aria-labelledby="(?:game-heading|dk-game-heading|imu-demo-heading)"/g,
      'aria-labelledby="game-page-title"', 'the game section aria-labelledby');
    html = replaceRequired(html,
      /<div>\s*<p class="section-index">[^<]*<\/p>\s*<h2 id="(?:game-heading|dk-game-heading|imu-demo-heading)">[^<]*<\/h2>\s*<\/div>/g,
      '', 'the game heading block');
    html = replaceRequired(html, /src="\/assets\/js\/(?:project-bootstrap|imu-sandbox-bootstrap)\.js[^"]*"/g,
      'src="/assets/themes/persona/game-start.js"', 'the game bootstrap script');
  }
  html = html
    .replace(/<aside class="keyboard-guide[^"]*"[^>]*>[\s\S]*?<\/aside>/g, '')
    .replace(/<p class="section-index">\s*\d+\s*<\/p>/g, '')
    .replace(/href="(\/[^"#?]*)([^" ]*)"/g, (match, path, suffix) =>
      path === '/' || path.startsWith('/projects/') || path === '/404.html'
        ? `href="${prefix}${path}${suffix}"` : match);
  html = replaceRequired(html, '</head>', () => `${headAssets(home, redesign)}\n    </head>`, '</head>');
  html = replaceRequired(html, /<body class="([^"]*)">/, (_, classes) => `<body class="${classes} persona-design" data-persona-base="${prefix}/">
      <div class="page-wipe" aria-hidden="true"><i></i><i></i><i></i></div>`, 'the <body> tag');
  return replaceRequired(html, '</body>', () => `${hud(home, gameKeys, ui.hud)}\n    </body>`, '</body>');
}

// Stylesheets and scripts for the Persona layer, in cascade order. Sheets that
// only style homepage sections load on the homepage only.
function headAssets(home, redesign) {
  const homeSheet = (name, when = true) => home && when ? `<link rel="stylesheet" href="/assets/themes/persona/${name}.css">` : '';
  return `
      <link rel="stylesheet" href="/assets/themes/persona/style.css">
      ${redesign ? '<link rel="stylesheet" href="/assets/themes/persona/tokens.css">\n      <link rel="stylesheet" href="/assets/themes/persona/redesign.css">' : ''}
      <link rel="stylesheet" href="/assets/themes/persona/key-instructions.css">
      ${homeSheet('project-tv-effect')}
      ${home ? '<script type="module" src="/assets/js/crt-effect.js"></script>' : ''}
      ${home ? '<link rel="stylesheet" href="/assets/themes/persona/skills-section.css?v=5">' : ''}
      ${homeSheet('hero-poster')}
      ${homeSheet('hero-ambient')}
      <link rel="stylesheet" href="/assets/themes/persona/content-typography.css">
      ${!home && redesign ? '<link rel="stylesheet" href="/assets/themes/persona/project-pages.css">' : ''}
      ${homeSheet('section-backgrounds', redesign)}
      ${homeSheet('project-cards', redesign)}
      ${home && redesign ? '<link rel="stylesheet" href="/assets/themes/persona/education-settings.css?v=2">' : ''}
      ${homeSheet('experience-save-menu')}
      ${redesign ? '<script src="/assets/js/about-pills.js" defer></script>' : ''}
      ${home ? '<link rel="stylesheet" href="/assets/themes/persona/scroll-presence.css">\n      <script type="module" src="/assets/js/scroll-presence.js"></script>' : ''}
      ${home ? `<script>
        if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
          document.documentElement.classList.add('about-scroll-pending');
          window.aboutScrollFallback = setTimeout(() => document.documentElement.classList.remove('about-scroll-pending'), 2000);
        }
      </script>` : ''}
      <script src="/assets/themes/persona/arrival.js"></script>`;
}

// The fixed keyboard-hint bar. Game pages also list their own keys.
function hud(home, gameKeys, labels) {
  return `
      <nav class="persona-hud" aria-label="${labels.label}">
        ${home ? '' : `
        ${gameKeys}
        <span class="hud-instruction"><kbd>Tab</kbd><span>${labels.navigate}</span></span>
        <span class="hud-instruction"><kbd>Enter</kbd><span>${labels.open}</span></span>`}
        <button class="hud-menu-toggle" type="button" data-hud-menu-toggle aria-controls="site-navigation" aria-keyshortcuts="Escape"><kbd>Esc</kbd><span>${labels.menu}</span></button>
      </nav>
      <script src="/assets/themes/persona/interface.js" defer></script>`;
}
