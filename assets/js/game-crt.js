import { CRT_SETTINGS } from './crt-settings.js';
import { configureScreen, appendCrtLayers } from './crt-effect.js';

// Independent of each game's start, pause, reset, input and rendering loops.
export function initGameCrt(document, window, settings = CRT_SETTINGS) {
  const television = document.querySelector('.persona-tv-screen .persona-tv');
  const stage = television?.querySelector('[data-game-wrap], [data-imu-scene]');
  const controls = television?.querySelector('.tv-secondary-controls');
  if (!stage || !controls || !settings.enabled || controls.querySelector('[data-game-crt]')) return;

  let labels = {};
  try { labels = JSON.parse(document.getElementById('game-start-labels')?.textContent || '{}'); }
  catch { /* Usable English labels if optional content is missing. */ }
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'game-action-button tv-crt-control';
  button.dataset.gameCrt = '';
  button.setAttribute('aria-label', labels.crt_effect || 'CRT effect');
  button.innerHTML = '<span class="crt-knob-label" aria-hidden="true">CRT</span><span class="crt-knob-indicator" aria-hidden="true"></span>';
  controls.append(button);

  const screen = document.createElement('div');
  screen.className = 'game-crt-overlay';
  screen.setAttribute('aria-hidden', 'true');
  const gameSettings = { ...settings, ...settings.game };
  configureScreen(screen, gameSettings);
  screen.style.setProperty('--crt-sweep-phase', '0');
  appendCrtLayers(document, screen, gameSettings);
  stage.append(screen);
  let enabled = Boolean(gameSettings.defaultEnabled);
  let visible = false;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function sync() {
    screen.hidden = !enabled;
    screen.dataset.crtActive = String(enabled && visible && !document.hidden && !motion.matches);
    button.setAttribute('aria-pressed', String(enabled));
    button.title = enabled ? (labels.crt_disable || 'Turn CRT effect off') : (labels.crt_enable || 'Turn CRT effect on');
  }
  button.addEventListener('click', () => { enabled = !enabled; sync(); });
  if ('IntersectionObserver' in window) {
    const observer = new window.IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      sync();
    });
    observer.observe(stage);
  }
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', sync);
  sync();
}

// A cached module may arrive while readyState is still "interactive" even
// after DOMContentLoaded. Try now and again after deferred builders settle;
// initGameCrt is idempotent, so neither load order creates duplicate knobs.
if (typeof document !== 'undefined') {
  initGameCrt(document, window);
  if (document.readyState !== 'complete') {
    document.addEventListener('DOMContentLoaded', () => initGameCrt(document, window), { once: true });
  }
}
