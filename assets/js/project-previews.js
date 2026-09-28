// Project preview videos play only while visible and never under reduced
// motion; the poster frame stands in otherwise.
(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const previews = [...document.querySelectorAll('[data-project-preview]')].map(video => ({ video, visible: false }));
  if (!previews.length) return;

  function render({ video, visible }) {
    if (visible && !motion.matches && !document.hidden) video.play().catch(() => {});
    else video.pause();
  }
  const renderAll = () => previews.forEach(render);

  if ('IntersectionObserver' in window) {
    const byVideo = new Map(previews.map(preview => [preview.video, preview]));
    const observer = new IntersectionObserver(entries => entries.forEach(({ target, isIntersecting }) => {
      const preview = byVideo.get(target);
      preview.visible = isIntersecting;
      render(preview);
    }), { rootMargin: '200px 0px' });
    previews.forEach(({ video }) => observer.observe(video));
  } else previews.forEach(preview => { preview.visible = true; });

  motion.addEventListener('change', renderAll);
  document.addEventListener('visibilitychange', renderAll);
  renderAll();
})();
