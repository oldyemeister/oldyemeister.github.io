# Agent guide

Personal portfolio site. The public design (`/`) is the Persona theme, rendered by
`templates/persona/render.mjs` with styles in `assets/themes/persona/`. The
original design is preserved at `/original/` (`_layouts/`, `assets/css/site.css`).

## Read before changing anything

- `docs/DESIGN.md`: how the Persona theme is built and edited.
- `docs/REDESIGN.md`: token tiers and the rollback-safe redesign layer.
- `docs/PUBLISHING.md`: routes, build and deploy.
- `docs/design-reference.md`: P4G screenshot design study, ready-to-paste
  tokens, and the prioritized change checklist. Start here for visual work.
- `HANDOFF.md`: open tasks handed between agents.

## Commands

- `npm test`: run all tests (`node --test test/*.test.mjs`).
- `npm run build`: production build into `_site/`.
- `python3 -m http.server 8000 --directory _site`: serve the build.

## Rules

- Persona CSS is scoped under `body.persona-design`. Changes must not alter `/original/`.
- Do not change the existing day/night (`data-theme`) color tokens.
- `screenshots/` is local reference material; do not commit or publish it.
