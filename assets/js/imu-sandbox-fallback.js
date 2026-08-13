(function () {
  window.startImuSandboxFallback = async function startImuSandboxFallback() {
    const host = document.querySelector('[data-imu-scene]');
    if (!host || host.dataset.fallbackStarted === 'true') return;
    host.dataset.fallbackStarted = 'true';
    const content = document.querySelector('#imu-content');
    const labels = content ? JSON.parse(content.textContent) : {};

    try {
      const engine = await import('./imu-sandbox-engine.js?v=10');
      host.querySelector('.imu-webgl-canvas')?.remove();
      const stage = document.createElement('div');
      stage.className = 'imu-css-stage';
      const device = document.createElement('div');
      device.className = 'imu-css-device';
      device.tabIndex = 0;
      device.setAttribute('role', 'application');
      device.setAttribute('aria-label', labels.canvasLabel);
      device.setAttribute('aria-describedby', 'imu-controls-description');
      const screen = document.createElement('div');
      screen.className = 'imu-css-screen';
      const canvas = document.createElement('canvas');
      canvas.width = engine.OLED_WIDTH;
      canvas.height = engine.OLED_HEIGHT;
      canvas.setAttribute('aria-hidden', 'true');
      screen.append(canvas);
      device.append(screen);
      for (const corner of ['top-left', 'top-right', 'bottom-left', 'bottom-right']) {
        const screw = document.createElement('span');
        screw.className = `imu-css-screw is-${corner}`;
        screw.setAttribute('aria-hidden', 'true');
        device.append(screw);
      }
      const pins = document.createElement('span');
      pins.className = 'imu-css-pins';
      pins.setAttribute('aria-hidden', 'true');
      device.append(pins);
      stage.append(device);
      host.prepend(stage);

      const context = canvas.getContext('2d');
      context.imageSmoothingEnabled = false;
      const screenImage = context.createImageData(engine.OLED_WIDTH, engine.OLED_HEIGHT);
      const screenPixels = new Uint32Array(screenImage.data.buffer);
      const state = engine.createSandbox();
      host.imuSandboxState = state;
      const inputs = [...document.querySelectorAll('[data-imu-axis]')];
      const outputs = new Map([...document.querySelectorAll('[data-imu-value]')]
        .map((element) => [element.dataset.imuValue, element]));
      const buttons = [...document.querySelectorAll('[data-imu-mode]')];
      const modeValue = document.querySelector('[data-imu-mode-value]');
      const gravityMagnitude = document.querySelector('[data-imu-gravity-magnitude]');
      const planetButtons = [...document.querySelectorAll('[data-imu-planet]')];
      let dragging = null;
      let previous = performance.now();
      let accumulator = 0;

      function syncGravity() {
        const planet = labels.planets[state.planet];
        gravityMagnitude.textContent = `${planet.label} · ${planet.gravity}`;
        planetButtons.forEach((button) => {
          const active = button.dataset.imuPlanet === state.planet;
          button.classList.toggle('is-active', active);
          button.setAttribute('aria-pressed', String(active));
        });
      }

      function syncPose() {
        inputs.forEach((input) => { input.value = state.pose[input.dataset.imuAxis]; });
        outputs.forEach((output, axis) => { output.textContent = `${state.pose[axis].toFixed(1)}°`; });
        device.style.transform = `rotateX(${-state.pose.pitch}deg) rotateY(${state.pose.yaw}deg) rotateZ(${state.pose.roll}deg)`;
        syncGravity();
      }

      function setAxis(axis, value) {
        engine.setPoseValue(state, axis, value);
        syncPose();
      }

      function syncMode() {
        buttons.forEach((button) => {
          const active = button.dataset.imuMode === state.mode;
          button.classList.toggle('is-active', active);
          button.setAttribute('aria-pressed', String(active));
        });
        modeValue.textContent = labels.modes[state.mode];
        syncGravity();
      }

      function draw() {
        screenPixels.fill(0xff0f1100);
        state.particles.forEach((particle) => {
          screenPixels[engine.particlePixelY(particle) * engine.OLED_WIDTH + engine.particlePixelX(particle)] = 0xfff7ffb8;
        });
        context.putImageData(screenImage, 0, 0);
      }

      inputs.forEach((input) => input.addEventListener('input', () => setAxis(input.dataset.imuAxis, input.value)));
      buttons.forEach((button) => button.addEventListener('click', () => {
        engine.setMode(state, button.dataset.imuMode);
        syncMode();
        device.focus();
      }));
      planetButtons.forEach((button) => button.addEventListener('click', () => {
        engine.setPlanet(state, button.dataset.imuPlanet);
        syncGravity();
        device.focus();
      }));
      document.querySelector('[data-imu-reset]').addEventListener('click', () => {
        engine.resetPose(state);
        syncPose();
        device.focus();
      });
      device.addEventListener('pointerdown', (event) => {
        dragging = { x: event.clientX, y: event.clientY };
        device.setPointerCapture(event.pointerId);
      });
      device.addEventListener('pointermove', (event) => {
        if (!dragging) return;
        const dx = event.clientX - dragging.x;
        const dy = event.clientY - dragging.y;
        dragging.x = event.clientX;
        dragging.y = event.clientY;
        engine.setPoseValue(state, 'yaw', state.pose.yaw + dx * 0.35);
        engine.setPoseValue(state, 'pitch', state.pose.pitch + dy * 0.3);
        syncPose();
      });
      device.addEventListener('pointerup', () => { dragging = null; });
      device.addEventListener('pointercancel', () => { dragging = null; });
      device.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') engine.setPoseValue(state, 'yaw', state.pose.yaw - 4);
        else if (event.key === 'ArrowRight') engine.setPoseValue(state, 'yaw', state.pose.yaw + 4);
        else if (event.key === 'ArrowUp') engine.setPoseValue(state, 'pitch', state.pose.pitch + 4);
        else if (event.key === 'ArrowDown') engine.setPoseValue(state, 'pitch', state.pose.pitch - 4);
        else if (event.key.toLowerCase() === 'q') engine.setPoseValue(state, 'roll', state.pose.roll - 4);
        else if (event.key.toLowerCase() === 'e') engine.setPoseValue(state, 'roll', state.pose.roll + 4);
        else if (event.key === ' ') { engine.cycleMode(state); syncMode(); }
        else return;
        event.preventDefault();
        syncPose();
      });

      function animate(time) {
        accumulator += Math.min(0.25, (time - previous) / 1000);
        previous = time;
        while (accumulator >= 1 / 60) {
          engine.updateSandbox(state);
          accumulator -= 1 / 60;
        }
        draw();
        requestAnimationFrame(animate);
      }

      syncPose();
      syncMode();
      draw();
      document.querySelector('[data-imu-status]').hidden = true;
      host.classList.add('is-ready', 'is-fallback');
      requestAnimationFrame(animate);
    } catch (error) {
      console.error('IMU Sandbox compatibility renderer failed.', error);
      const status = document.querySelector('[data-imu-status]');
      status.textContent = labels?.loadError || 'The OLED simulation could not start.';
      status.classList.add('is-error');
    }
  };
}());
