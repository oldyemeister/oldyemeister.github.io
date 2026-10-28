// P4G section-entry adaptation: growing diamonds, solid cover, content reveal.
// Navigation and cancellation belong to interface.js; this only paints the wipe.
(() => {
  const overlay = document.querySelector('.diamond-wipe');
  if (!overlay) return;
  // Give the growth and destination reveal room to read at lower frame rates.
  const COVER_MS = 620;
  const REVEAL_MS = 340;
  window.personaDiamondWipe = {
    cover() {
      overlay.replaceChildren();
      const width = window.innerWidth;
      const height = window.innerHeight;
      const pitch = Math.max(180, width / 4);
      // A diamond's final radius must reach the corner between four centres.
      const side = pitch * Math.SQRT2 + 2;
      const fragment = document.createDocumentFragment();
      for (let y = 0; y <= height + pitch; y += pitch) {
        for (let x = 0; x <= width + pitch; x += pitch) {
          const diamond = document.createElement('i');
          Object.assign(diamond.style, {
            left: `${x - side / 2}px`, top: `${y - side / 2}px`,
            width: `${side}px`, height: `${side}px`
          });
          fragment.append(diamond);
        }
      }
      overlay.append(fragment);
      return [...overlay.children].map(diamond => diamond.animate([
        { transform: 'rotate(45deg) scale(0)', offset: 0 },
        { transform: 'rotate(45deg) scale(1)', offset: .84 },
        { transform: 'rotate(45deg) scale(1)', offset: 1 }
      ], { duration: COVER_MS, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'both' }));
    },
    reveal() {
      return [overlay.animate([{ opacity: 1 }, { opacity: 0 }],
        { duration: REVEAL_MS, easing: 'ease-out', fill: 'both' })];
    },
    reset() { overlay.replaceChildren(); }
  };
})();
