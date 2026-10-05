// Presentation-level pause for both IMU renderers; particle physics is unchanged.
export function initImuPause(host, loop) {
  const section = host.closest('section');
  const pause = section.querySelector('[data-imu-pause]');
  if (!pause) return; // Original design has no TV pause control.
  const document = host.ownerDocument;
  const labels = JSON.parse(document.getElementById('game-start-labels').textContent);
  const surface = host.querySelector('.imu-webgl-canvas, .imu-css-device');
  const controls = [...section.querySelectorAll('[data-imu-axis], [data-imu-mode], [data-imu-planet]')];
  const overlay = document.createElement('div');
  overlay.className = 'game-pause-overlay persona-game-start';
  overlay.dataset.imuPauseOverlay = '';
  overlay.hidden = true;
  overlay.innerHTML = '<div class="game-start-prompt"><button class="game-start-button" type="button"><span aria-hidden="true">▶</span><span data-start-label></span></button></div>';
  const resume = overlay.querySelector('button');
  resume.setAttribute('aria-label', labels.resume_sandbox);
  resume.querySelector('[data-start-label]').textContent = labels.resume;
  host.append(overlay);
  let paused = false;
  let previousDisabled = [];

  function setPaused(value) {
    if (value === paused) return;
    paused = value;
    loop.setPaused(paused);
    host.dataset.simulationPaused = String(paused);
    pause.classList.toggle('is-paused', paused);
    pause.setAttribute('aria-label', paused ? labels.resume_sandbox : labels.pause_sandbox);
    pause.title = paused ? labels.resume_sandbox : labels.pause_sandbox;
    overlay.hidden = !paused;
    if (paused) {
      previousDisabled = controls.map(control => control.disabled);
      controls.forEach(control => { control.disabled = true; });
    } else controls.forEach((control, index) => { control.disabled = previousDisabled[index]; });
    surface.inert = paused;
    (paused ? resume : surface).focus({ preventScroll: true });
  }

  pause.addEventListener('click', () => setPaused(!paused));
  resume.addEventListener('click', () => setPaused(false));
  section.querySelector('[data-imu-reset]').addEventListener('click', () => setPaused(false));
}
