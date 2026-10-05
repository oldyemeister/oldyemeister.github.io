// Presentation only: native disclosure, no game events or input interception.
export function initGameControlsHelp(document) {
  const help = document.querySelector('[data-game-controls-help]');
  if (!help || help.dataset.controlsReady) return;
  help.dataset.controlsReady = 'true';
  const summary = help.querySelector('summary');
  const surface = '[data-laser-canvas], [data-donkey-kong-canvas], .imu-webgl-canvas, .imu-css-device';
  let openedByFocus = false;
  const closeAutomaticHelp = target => {
    if (openedByFocus && !help.contains(target)) {
      help.open = false;
      openedByFocus = false;
    }
  };
  document.addEventListener('focusin', ({ target }) => {
    if (target.matches(surface)) {
      if (!help.open) {
        help.open = true;
        openedByFocus = true;
      }
    } else closeAutomaticHelp(target);
  });
  document.addEventListener('focusout', ({ relatedTarget }) => {
    // Covers a click on the page background or leaving the browser window.
    if (!relatedTarget) closeAutomaticHelp(null);
  });
  summary.addEventListener('click', () => { openedByFocus = false; });
}

if (typeof document !== 'undefined') initGameControlsHelp(document);
