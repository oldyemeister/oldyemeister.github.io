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
    html = html.replace(guide[0], `<details class="game-keyboard-help" data-game-controls-help open>
      <summary><kbd aria-hidden="true">?</kbd><span>${ui.hud.controls || 'Controls'}</span></summary>
      <div class="game-keyboard-hints">${gameKeys}</div>
    </details>`);
    // Keep the intro and live game adjacent in DOM order; only their wide-screen
    // presentation becomes two columns. The reading section stays full width.
    if (html.includes('class="laser-intro')) {
      html = replaceRequired(html,
        /(<section class="laser-intro[^\"]*">[\s\S]*?<\/section>)\s*(<section class="(?:laser-play-section[^\"]*|imu-demo-section)"[\s\S]*?<\/section>)/,
        (_, intro, game) => `<div class="game-entry">${intro}\n${game}</div>`,
        'the game intro and playable section');
    }
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
  html = replaceRequired(html, '</head>', () => `${headAssets(home, redesign, Boolean(guide))}\n    </head>`, '</head>');
  html = replaceRequired(html, /<body class="([^"]*)">/, (_, classes) => `<body class="${classes} persona-design${guide ? ' persona-tv-screen' : ''}" data-persona-base="${prefix}/">
      <div class="page-wipe" aria-hidden="true"><i></i><i></i><i></i></div>`, 'the <body> tag');
  return replaceRequired(html, '</body>', () => `${guide ? '<script src="/assets/themes/persona/tv-frame.js" defer></script><script type="module" src="/assets/js/game-controls-help.js"></script><script type="module" src="/assets/js/game-crt.js"></script>' : ''}${hud(home, gameKeys, ui.hud)}\n    </body>`, '</body>');
}

// Stylesheets and scripts for the Persona layer, in cascade order. Sheets that
// only style homepage sections load on the homepage only.
function headAssets(home, redesign, game) {
  const homeSheet = (name, when = true) => home && when ? `<link rel="stylesheet" href="/assets/themes/persona/${name}.css">` : '';
  return `
      <link rel="stylesheet" href="/assets/themes/persona/style.css">
      ${redesign ? '<link rel="stylesheet" href="/assets/themes/persona/tokens.css">\n      <link rel="stylesheet" href="/assets/themes/persona/redesign.css">' : ''}
      <link rel="stylesheet" href="/assets/themes/persona/key-instructions.css">
      <link rel="stylesheet" href="/assets/themes/persona/header-calendar.css">
      <script src="/assets/themes/persona/header-calendar.js" defer></script>
      ${home ? '' : '<script src="/assets/themes/persona/project-exit.js" defer></script>'}
      <link rel="stylesheet" href="/assets/themes/persona/cursor-trail.css">
      <script type="module" src="/assets/js/cursor-trail.js"></script>
      ${home || game ? '<link rel="stylesheet" href="/assets/themes/persona/project-tv-effect.css">' : ''}
      ${home ? '<script type="module" src="/assets/js/crt-effect.js"></script>' : ''}
      ${home ? '<link rel="stylesheet" href="/assets/themes/persona/skills-section.css?v=5">' : ''}
      ${homeSheet('hero-poster')}
      ${homeSheet('hero-ambient')}
      <link rel="stylesheet" href="/assets/themes/persona/content-typography.css">
      ${!home && redesign ? '<link rel="stylesheet" href="/assets/themes/persona/project-pages.css">' : ''}
      ${game ? '<link rel="stylesheet" href="/assets/themes/persona/tv-frame.css">' : ''}
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

// Game instructions are docked in the page, not in this fixed navigation hint.
function hud(home, gameKeys, labels) {
  return `
      <nav class="persona-hud" aria-label="${labels.label}">
        ${home || gameKeys ? '' : `
        <span class="hud-instruction"><kbd>Tab</kbd><span>${labels.navigate}</span></span>
        <span class="hud-instruction"><kbd>Enter</kbd><span>${labels.open}</span></span>`}
        <button class="hud-menu-toggle" type="button" data-hud-menu-toggle aria-controls="site-navigation" aria-keyshortcuts="Escape"><kbd>Esc</kbd><span>${labels.menu}</span></button>
      </nav>
      <script src="/assets/themes/persona/interface.js" defer></script>`;
}
