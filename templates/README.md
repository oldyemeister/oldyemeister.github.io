# Site templates

`persona/render.mjs` contains the new design's page transformation. All of its
CSS and browser assets live in `assets/themes/persona/` (including
`tokens.css`, `redesign.css`, and the other Persona-only stylesheets injected
by `render.mjs`) — nothing Persona-specific lives under `assets/css/`. The
static builder renders shared content once, then applies this transformation
for the `/persona/` routes.

The original template remains in Jekyll's conventional `_layouts/` and
`_includes/` directories, with `assets/css/site.css`, `assets/css/ribbon-menu.css`,
and `assets/js/site.js` — the only stylesheets shared by every page regardless
of theme. Keeping these paths preserves the existing GitHub Pages build.
Persona extends this base, so edit Persona-specific appearance in its theme
folder.

Portfolio data, project pages, and game engines are shared rather than copied.
See `docs/DESIGN.md` for editing and local preview instructions.

Production (`npm run build`) publishes Persona at `/` and the original at
`/original/`, with `/persona/` retained as an alias.
