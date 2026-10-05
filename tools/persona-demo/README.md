# Persona upgrade study

An optional, local-only preview of the Persona upgrades suggested in the design
review. It layers `upgrades.css` and `upgrades.js` over a copy of the built site;
the source, `_site` and the deployed pages are unchanged.

Run `npm run build`, then `node tools/persona-demo-build.mjs`. The copy goes to
`/private/tmp/personal-website-persona-demo`; serve it on its own port
(`persona-demo` in `.claude/launch.json`, or
`python3 -m http.server 8001 --bind 127.0.0.1 --directory /private/tmp/personal-website-persona-demo`)
and open `http://localhost:8001/`. Re-run the builder after a site rebuild.

The fixed **P4 upgrades** button (bottom left) switches the study on and off for
before/after comparison and is remembered per browser. Every rule is gated on
`html.p4-demo`.

What it shows:

- Header calendar (date, weekday, time of day) from the visitor's clock.
- Skills on a black field: category panels with a yellow edge and hard shadow,
  and the section title in yellow so it stays readable.
- Projects as case files: striped yellow field, black panels with hard offset
  shadows, the hidden "FILE 0X" label revived, and the first project featured
  full width.
- Leaving a game or article page: the screen switches off like a CRT (collapses to a line,
  then a dot). Entering them, and same-page anchors, keep the site's own wipe;
  reduced motion skips it.
