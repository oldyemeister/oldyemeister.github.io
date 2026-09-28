// The Persona decorators rewrite rendered HTML. A rewrite whose anchor is
// missing would silently drop part of the design, so required anchors fail the
// build instead, naming what changed.
export function requireAnchor(html, pattern, label) {
  const found = typeof pattern === 'string'
    ? html.includes(pattern)
    : new RegExp(pattern.source, pattern.flags.replace('g', '')).test(html);
  if (!found) throw new Error(`Persona template: expected ${label} in the rendered page, but it was not found.`);
}

// replace() that throws when the anchor is missing. A function replacement
// avoids `$` patterns in inserted markup being interpreted.
export function replaceRequired(html, pattern, replacement, label) {
  requireAnchor(html, pattern, label);
  return html.replace(pattern, typeof replacement === 'function' ? replacement : () => replacement);
}
