(function () {
  const script = document.currentScript;
  const content = document.querySelector('#imu-content');
  const status = document.querySelector('[data-imu-status]');
  const labels = content ? JSON.parse(content.textContent) : {};

  function updateReadout(input) {
    const output = document.querySelector(`[data-imu-value="${input.dataset.imuAxis}"]`);
    if (!output) return;
    const rotational = ['roll', 'pitch', 'yaw'].includes(input.dataset.imuAxis);
    output.textContent = `${Number(input.value).toFixed(1)}${rotational ? '°' : ''}`;
  }

  document.querySelectorAll('[data-imu-axis]').forEach((input) => {
    input.addEventListener('input', () => updateReadout(input));
  });

  import(script.dataset.module).catch((error) => {
    console.error('IMU Sandbox failed to start.', error);
    if (typeof window.startImuSandboxFallback === 'function') {
      Promise.resolve(window.startImuSandboxFallback()).catch(console.error);
      return;
    }
    if (status) {
      status.textContent = labels.loadError || 'The 3D OLED could not start.';
      status.classList.add('is-error');
    }
  });
}());
