# Special-page layout reference

Inspected [Persona 4 Revival — Special](https://asia.sega.com/p4r/en/special/)
on 2026-10-23 at 1920px and 390px.

## Observed composition

The reference places a fixed cloud video beneath a separate repeating CRT texture
and yellow foreground silhouettes. Its top sky opening rises diagonally, with
large translucent serif lettering. The foreground Videos heading combines a
pale offset patch with a cyan underline; the main video has a thick amber frame.
A pale horizontal tray holds the smaller videos below. Mobile simplifies the
side artwork and stacks the composition.

Source: [page stylesheet](https://asia.sega.com/p4r/en/resources/css/index.nP8fvaqo.css).
Relevant selectors are `.special-page-bg`, `.special-page-bg-pattern`,
`.special-page-deco--about`, `.special-movie__heading-accent` and
`.special-movie__heading-ja-bar`. These observations describe the captured page,
not a contract for future source versions.

## Portfolio adaptation

Education uses original desktop/phone masks, existing cloud SVGs and palette
tokens, editable serif lettering, a cyan-accented italic topic, and an amber
frame around the real university record. No reference PNG, video, logo or SVG
was copied into the site. There is no pretend video player or empty content rail.
The section keeps extra vertical space and grows with future copy.

Files: `assets/themes/persona/education-settings.css`,
`assets/themes/persona/images/revival/education-mask-*.svg`,
`templates/persona/redesign.mjs`, and `assets/js/scroll-presence.js`.

Reference screenshots and saved HTML/CSS are local-only under
`screenshots/p4r-special-study/`. Portfolio before/after captures and layout
checks are under `screenshots/fullscreen-education/`. Both directories are
ignored and excluded from publication.
