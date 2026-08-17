(function () {
  const script = document.currentScript;
  const target = document.querySelector(script.dataset.target);
  if (!target) return;

  let started = false;
  function start() {
    if (started) return;
    started = true;
    target.dataset.moduleState = 'loading';
    import(script.dataset.module)
      .then(() => { target.dataset.moduleState = 'ready'; })
      .catch((error) => {
        target.dataset.moduleState = 'error';
        console.error('Interactive project failed to start.', error);
      });
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      start();
    }, { threshold: 0.01 });
    observer.observe(target);
  } else start();
}());
