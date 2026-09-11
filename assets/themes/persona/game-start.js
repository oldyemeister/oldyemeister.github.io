// The alternate design waits for an explicit play action before loading a game.
(function () {
  const script = document.currentScript;
  const target = document.querySelector(script.dataset.target || '[data-imu-scene]');
  if (!target) return;
  const imu = target.matches('[data-imu-scene]');
  const donkey = target.matches('[data-donkey-kong-canvas]');
  const kind = imu ? 'imu-sandbox' : donkey ? 'donkey-kong' : 'laser';
  const stage = imu ? target : target.closest('[data-game-wrap]');
  const section = stage.closest('section');
  const television = document.createElement('div');
  television.className = `persona-tv${imu ? ' persona-tv-sandbox' : ''}`;
  television.innerHTML = '<svg class="tv-antennas" viewBox="0 0 180 100" aria-hidden="true"><path d="M88 92 30 14M92 92 152 6" fill="none" stroke="#080808" stroke-width="12" stroke-linecap="round"/><path d="M88 88 31 15M94 86 152 8" fill="none" stroke="#a9b4bd" stroke-width="4" stroke-linecap="round"/><g fill="#fffdf3" stroke="#080808" stroke-width="5"><circle cx="30" cy="14" r="8"/><circle cx="152" cy="10" r="8"/></g><path d="M67 100a23 23 0 0 1 46 0" fill="#080808"/></svg>';
  stage.before(television);
  television.append(stage);
  const panel = document.createElement('div');
  panel.className = 'persona-tv-panel';
  panel.innerHTML = '<span class="tv-power" aria-hidden="true"></span><span class="tv-knob" aria-hidden="true"></span><span class="tv-speaker" aria-hidden="true"></span>';
  const readouts = section.querySelector(imu ? '.imu-live-readouts' : '.game-status-bar');
  if (readouts) panel.append(readouts);
  const actions = section.querySelector('.game-actions');
  if (actions) {
    panel.querySelector('.tv-knob').remove();
    panel.append(actions);
  }
  television.append(panel);
  // Keep the existing controls and their bindings, mounted in the TV feet.
  const gameControls = !imu && section.querySelector('.game-controls');
  if (gameControls) {
    television.classList.add('persona-tv-with-legs');
    gameControls.classList.add('tv-leg-controls');
    const message = gameControls.querySelector('.game-message');
    if (message) television.after(message);
    for (const control of [...gameControls.children]) {
      const leg = document.createElement('div');
      leg.className = 'tv-leg';
      control.before(leg);
      leg.append(control);
    }
    television.append(gameControls);
  }
  section.querySelector('.game-heading-row, .imu-demo-heading')?.remove();
  const controls = [...section.querySelectorAll('button, input')];
  const disabled = controls.map(control => control.disabled);
  controls.forEach(control => { control.disabled = true; });
  if (!imu) target.tabIndex = -1;
  stage.classList.add('persona-game-waiting');
  target.dataset.moduleState = 'idle';

  const overlay = document.createElement('div');
  overlay.className = 'persona-game-start';
  overlay.innerHTML = `
    <img class="game-start-poster" src="/assets/images/projects/${kind}/${kind}-preview.png" alt="">
    <div class="game-start-prompt">
      <button class="game-start-button" type="button"><span aria-hidden="true">▶</span><span data-start-label>Start ${imu ? 'sandbox' : 'game'}</span></button>
      <p class="sr-only" role="status"></p>
    </div>`;
  stage.append(overlay);
  const button = overlay.querySelector('button');
  const label = overlay.querySelector('[data-start-label]');
  const status = overlay.querySelector('[role="status"]');

  // Preserve the slider feedback normally installed by the IMU bootstrap.
  if (imu) section.querySelectorAll('[data-imu-axis]').forEach(input => {
    input.addEventListener('input', () => {
      const output = section.querySelector(`[data-imu-value="${input.dataset.imuAxis}"]`);
      if (output) output.textContent = `${Number(input.value).toFixed(1)}°`;
    });
  });

  // A focused range input otherwise consumes every arrow as its own axis step.
  // In the running sandbox, keep rotation shortcuts mapped to the game axes.
  if (imu) section.addEventListener('keydown', event => {
    if (target.dataset.moduleState !== 'ready' || event.defaultPrevented ||
        event.isComposing || event.altKey || event.ctrlKey || event.metaKey ||
        !event.target.matches('[data-imu-axis]') ||
        !['arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'q', 'e', ' '].includes(event.key.toLowerCase())) return;
    const surface = target.querySelector('.imu-css-device, .imu-webgl-canvas');
    if (!surface) return;
    event.preventDefault();
    event.stopPropagation();
    surface.focus({ preventScroll: true });
    surface.dispatchEvent(new KeyboardEvent('keydown', {
      key: event.key, code: event.code, repeat: event.repeat,
      bubbles: true, cancelable: true
    }));
  }, true);

  button.addEventListener('click', async () => {
    if (target.dataset.moduleState === 'error') {
      location.reload();
      return;
    }
    if (target.dataset.moduleState !== 'idle') return;
    target.dataset.moduleState = 'loading';
    button.disabled = true;
    label.textContent = 'Loading…';
    status.textContent = 'Getting the game ready…';
    try {
      // DK initializes asynchronously; warm its required images before importing.
      if (donkey) {
        const assets = JSON.parse(document.querySelector('#donkey-kong-content').textContent);
        await Promise.all(['background', 'mario', 'barrel', 'win'].map(key => {
          const image = new Image();
          image.src = assets[key];
          return image.decode();
        }));
      }
      try {
        await import(script.dataset.module);
      } catch (error) {
        if (!imu || typeof window.startImuSandboxFallback !== 'function') throw error;
        await window.startImuSandboxFallback();
      }
      controls.forEach((control, index) => { control.disabled = disabled[index]; });
      stage.classList.remove('persona-game-waiting');
      overlay.remove();
      target.dataset.moduleState = 'ready';
      const keyboardTarget = imu
        ? target.querySelector('.imu-css-device, .imu-webgl-canvas') : target;
      if (keyboardTarget) {
        keyboardTarget.tabIndex = 0;
        keyboardTarget.focus({ preventScroll: true });
      }
    } catch (error) {
      console.error('Game failed to start.', error);
      target.dataset.moduleState = 'error';
      button.disabled = false;
      label.textContent = 'Reload to retry';
      status.classList.remove('sr-only');
      status.textContent = 'The game could not load. Reload the page to try again.';
    }
  });
}());
