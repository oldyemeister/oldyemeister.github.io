# Color rebalance

The general site uses off-white text on olive panels and near-black text on the
yellow field and primary buttons. Yellow text is reserved for the hero name.
Primary CTA fills, dividers, hard shadows, and an active theme switch retain
yellow. Secondary buttons, skill/technology pills, link-hover backgrounds,
identity/collaborator icons, and the monogram dot reuse the existing blue.
Olive panel fill, mustard borders, geometry, layout, black TV frames, and the
original keyboard HUD were not changed.

Both `:root` and `:root[data-theme]` share the same assignments, covering stored
light and dark preferences. This does not introduce a second theme or expose the
previously hidden theme switch. Its checked-state styling is yellow if restored.

## Verification performed

- In `redesign.css`, `color` declarations resolving to electric yellow fell from
  **16 to 1 (93.75% fewer)**. This counts declarations after resolving the root
  custom properties; it is **not a count of rendered elements**.
- The one remaining explicit yellow text rule targets `.hero-copy h1`.
- Existing base CSS and protected keyboard HUD colors remain for rollback.
- The preserved black-TV-frame rules are byte-for-byte unchanged.
- All 41 existing tests and the static production build passed.
- No connected browser was available, so actual computed-style counts remain
  unverified. No browser count is claimed here.

## Computed-style audit

On any local page, paste this into the browser console. It reports both theme
settings and restores the original setting afterwards. It counts rendered
nonempty text nodes through their parent element's computed `color`, excluding
screen-reader-only copies and invisible content. Thus a kinetic headline has
one entry per rendered letter. Counts should be compared using the same page,
viewport, menu state, and game state. Run on the homepage and each project page.

```js
(async () => {
  const root = document.documentElement;
  const previous = root.getAttribute('data-theme');
  const results = [];
  const isYellow = value => {
    const channels = value.match(/[\d.]+/g)?.map(Number);
    return channels?.[0] === 255 && channels[1] === 240 && channels[2] === 0;
  };
  try {
    for (const theme of ['light', 'dark']) {
      root.dataset.theme = theme;
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const yellow = [];
      let node;
      let renderedTextNodes = 0;
      while ((node = walker.nextNode())) {
        const element = node.parentElement;
        if (!node.textContent.trim() || !element ||
            element.closest('script, style, noscript, .sr-only, [hidden]')) continue;
        if (!element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        if (![...range.getClientRects()].some(rect => rect.width && rect.height)) continue;
        renderedTextNodes++;
        if (isYellow(getComputedStyle(element).color)) {
          yellow.push({
            text: node.textContent.trim(),
            element: element.tagName.toLowerCase(),
            classes: element.className,
            inHeroName: Boolean(element.closest('.hero-copy h1')),
            inBodyOrSubheading: Boolean(element.closest('p, li, h2, h3, h4, h5, h6'))
          });
        }
      }
      results.push({ theme, renderedTextNodes, yellowTextNodes: yellow.length,
        yellowOutsideHeroName: yellow.filter(item => !item.inHeroName).length,
        yellowBodyOrSubheading: yellow.filter(item => item.inBodyOrSubheading).length });
      console.log(theme, 'yellow text details:', yellow);
    }
    console.table(results);
    return results;
  } finally {
    if (previous === null) root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', previous);
  }
})();
```
