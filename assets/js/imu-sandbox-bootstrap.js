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

  let started = false;
  function start() {
    if (started) return;
    started = true;
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
  }

  const scene = document.querySelector('[data-imu-scene]');
  if ('IntersectionObserver' in window && scene) {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      start();
    }, { threshold: 0.01 });
    observer.observe(scene);
  } else start();
}());
