// Revival's outgoing-stage / incoming-section relationship, adapted to the
// existing Education artwork and Skills field. No pinning or scroll hijacking.
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export function educationSkillsMotion({ skillsTop, educationHeight, viewportHeight, contentClearance, mobile = false }) {
  if (![skillsTop, educationHeight, viewportHeight, contentClearance].every(Number.isFinite) ||
      viewportHeight <= 0 || educationHeight <= 0) return { progress: 0, travel: 0, offset: 0 };
  // Entry starts at the viewport bottom and ends at its top. Use the site's
  // 900px composition breakpoint, not the reference site's 750px breakpoint.
  const progress = clamp(1 - skillsTop / viewportHeight, 0, 1);
  const desired = Math.max(viewportHeight * .25, educationHeight * .20) * (mobile ? .30 : .80);
  // Long copy and short viewports must never let Skills cover the credential.
  // Keep the outgoing top offscreen for the whole interval as well.
  const travel = Math.max(0, Math.min(desired, viewportHeight * .25,
    contentClearance - 32, educationHeight - viewportHeight));
  return { progress, travel, offset: progress * travel };
}

if (typeof document !== 'undefined') (() => {
  const education = document.querySelector('body.persona-design.page-home #education');
  const skills = education?.nextElementSibling;
  const content = education?.querySelector(':scope > .content-shell');
  const sky = education?.querySelector(':scope > .education-sky-window');
  if (skills?.id !== 'skills' || !content || !sky) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 899px)');
  let frame = 0;
  let dirty = true;
  let height = 0;
  let clearance = 0;
  let offset = 0;
  let written = '';

  education.setAttribute('data-education-skills-outgoing', '');
  skills.setAttribute('data-education-skills-incoming', '');
  function paint() {
    frame = 0;
    if (document.hidden) return;
    // All reads precede writes. Remove our previous visual translation from
    // the content measurement; the section boxes themselves never transform.
    if (dirty) {
      const box = education.getBoundingClientRect();
      height = box.height;
      clearance = box.bottom - (content.getBoundingClientRect().bottom - offset);
      dirty = false;
    }
    const state = educationSkillsMotion({
      skillsTop: skills.getBoundingClientRect().top,
      educationHeight: height, viewportHeight: innerHeight,
      contentClearance: clearance, mobile: mobile.matches,
    });
    offset = reduced.matches ? 0 : state.offset;
    const value = `${offset.toFixed(3)}px`;
    if (value !== written) {
      written = value;
      education.style.setProperty('--education-exit-offset', value);
    }
    education.toggleAttribute('data-education-skills-moving', !reduced.matches && state.travel > 0 && state.progress > 0 && state.progress < 1);
  }
  function schedule() { if (!frame && !document.hidden) frame = requestAnimationFrame(paint); }
  function measure() { dirty = true; schedule(); }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', measure, { passive: true });
  addEventListener('pageshow', measure);
  document.addEventListener('visibilitychange', measure);
  mobile.addEventListener('change', measure);
  reduced.addEventListener('change', () => {
    // CSS removes translation immediately under reduce; clear the cached
    // compensation before another geometry measurement can use it.
    if (reduced.matches) {
      offset = 0;
      written = '';
      education.style.removeProperty('--education-exit-offset');
    }
    measure();
  });
  if (typeof ResizeObserver === 'function') {
    const observer = new ResizeObserver(measure);
    [education, content, skills].forEach(element => observer.observe(element));
  }
  document.fonts?.ready.then(measure);
  education.querySelectorAll('img').forEach(img => img.addEventListener('load', measure, { once: true }));
  schedule();
})();
