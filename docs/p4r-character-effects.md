# Persona 4 Revival character effects study

Reference: [Yosuke character page](https://asia.sega.com/p4r/en/maincharacter-02/), inspected 2026-10-22.

The homepage CRT adaptation is implemented separately. **About now implements the layered decorative title** described below, with its original readable heading. The subtitle-cover and other scroll ideas remain future work; no new scroll library or character artwork is included.

## CRT and sky layers

The reference puts a fixed, full-viewport sky video beneath its yellow artwork. A cyan overlay (`#00deff`, opacity `.4`) tints the video. The horizontal CRT lines come from a **separate repeating WebP texture**, `.character-page__bg-pattern`, above the sky. They are not baked into the video. The pattern and yellow artwork move with the document; the sky stays fixed. Text and character artwork remain separate.

The pattern repeats at a tile width of `1.875vw` on desktop and `4.8vw` below 751px: 27px at a 1440px viewport, 18px at 375px. A tile contains several horizontal bands; **tile width is not scanline spacing**. `pointer-events: none` keeps it decorative.

Sources: [markup](https://asia.sega.com/p4r/en/maincharacter-02/), [stylesheet](https://asia.sega.com/p4r/en/resources/css/character.Zy-mJNP3.css), [texture](https://asia.sega.com/p4r/en/resources/img/common/pattern_mainbg.ChHFQFa_.webp), [desktop video](https://asia.sega.com/p4r/en/resources/video/bluesky.DeQe_blD.mp4), [phone video](https://asia.sega.com/p4r/en/resources/video/bluesky_sp.B1fRlnXa.mp4).

Portfolio adaptation: `assets/themes/persona/hero-poster.css` recreates bright scanline crests and darker return lines with existing palette tokens. Cloud opacity `.6` lets the blue field tint them. The existing seven-row, device-snapped spacing and cloud drift remain. Hero, header continuation and About share this CSS approximation over local clouds; project previews and game CRT settings are unchanged.

## Scroll behavior

- **Stationary sky, scrolling artwork:** `.character-page__sky` uses fixed positioning. Foreground layout and yellow cutouts travel with the document, giving depth without individual parallax transforms on every shape.
- **Smooth wheel scrolling:** the shared bundle initializes Lenis with `lerp: .2`, wheel/touch multipliers `1`, and `anchors: true`, driven by `requestAnimationFrame`. Defaults are `smoothWheel: true`, `syncTouch: false`, so touch scrolling remains native. Lerp is interpolation, not a fixed duration.
- **One-time entrances:** the headline helper observes containers with bottom root margin `-10%` and threshold `0`. It adds `.run` to rows 100 ms apart, then disconnects. Scrolling back does not reset the reveal. Without IntersectionObserver it reveals immediately.
- **Mobile SCROLL cue:** a separate 2-second `ease-in-out` scaling-line loop prompts scrolling; it is not a progress indicator. Character/Persona pose changes are button-driven, while the card rail has independent pointer dragging.

Sources: [scroll bundle](https://asia.sega.com/p4r/en/resources/js/global-nav.8UKbpZ7H.js), [headline helper](https://asia.sega.com/p4r/en/resources/js/headline-run.CkdS5fdj.js), [character initializer](https://asia.sega.com/p4r/en/resources/js/character.C90-AHsN.js).

Live checks at 1440px and 375px confirmed the sky stays at viewport y=0 after a 600px scroll. The decorative name moves by exactly −600px (desktop 174 to −426px; phone 666 to 66px), with no separate transform. The CRT pattern also moves from y=0 to −600px. The effect's depth comes from these different layer positions.

## The two Yosuke title treatments

### Readable foreground name

The name is a live `h2`, with separate YOSUKE and HANAMURA spans. The English page uses Montserrat, bold uppercase, stacked lines. These are three distinct behaviors:

| Element | Actual English Yosuke behavior |
|---|---|
| Desktop name | Dark text. The parent declares a `.3s ease` width transition, but overflow stays visible and the shared cover label is hidden. Live checks show the word remains the same width before and after `.run`; do not implement a desktop text wipe based on that declaration alone. |
| Phone name | White text on separate charcoal blocks, type `8vw` with equal line height. Each `.character-page__name-jp-text-copy::after` is a cyan cover. On `.run`, `clip-path` changes from `inset(0)` to `inset(0 0 0 100%)`, with `.3s ease` after a `.3s` delay. Both words uncover left-to-right together. The hidden shared label does not disable these pseudo-elements. |
| Profile rows, both sizes | English CSS sets width to `max-content` before and after `.run`. The visible effect is the cyan `.character-page__profile-text-label` clipping away, using the same 300ms duration and 300ms delay. Four rows are triggered 100ms apart by their container observer, giving approximate wipe windows 300–600, 400–700, 500–800, and 600–900ms. |

In a controlled live replay, the phone name's cyan cover was fully present before `.run`, about 74% removed after 450ms, and fully removed after the transition. Desktop word geometry did not change. This replay validates the CSS treatment; it is not a recording of the initial-load schedule.

### Decorative background lettering

The pale background name uses oversized title-case serif lettering, contrasting with the bold uppercase sans-serif heading. It is image artwork in `.character-page__bg-name`, not the live heading font:

- [Desktop artwork](https://asia.sega.com/p4r/en/resources/img/character/02/character_deco_pc.CcEGkCOI.png)
- [Phone artwork](https://asia.sega.com/p4r/en/resources/img/character/02/character_deco_sp.NiCDl1eK.png)

Desktop Yosuke artwork is roughly `30.89vw` wide, left `23.85vw`, top `12.08vw` in the English variant. Below the source's 750px breakpoint it grows to `91.73vw`, sits around `177.6vw` down the composition, and uses `mix-blend-mode: color-dodge`. These are source coordinates, not portfolio layout values. Its scale and pale overlap make it decorative, separate from the accessible heading.

Source: [character stylesheet](https://asia.sega.com/p4r/en/resources/css/character.Zy-mJNP3.css).

## Future portfolio implementation

Implemented 2026-10-22, revised 2026-10-23: About has its own serif title crossing
the existing CRT openings and yellow mask. It is white over blue and pale yellow
over yellow, using two aligned text layers and the existing responsive silhouette.
The black heading uses the site's original italic typography. The initial
“Background & interests” strip and its wipe script were removed at the user's
request. See `about-title.css` and the About title section of `DESIGN.md`.
The decorative serif remains an editable text approximation of the source artwork.
The yellow fill was subsequently strengthened to 40% white, and a static cyan
scanline shadow was added only inside the blue openings, clipped by the inverted
responsive mask. This shadow is a portfolio extension rather than a measured
effect from the reference page.
The remaining suggestions below are still research guidance.

1. Retain `fixed-sky.js`; it already supplies the stationary-sky relationship. Assess compatibility before introducing another scroll controller.
2. For a future heading reveal, use a one-time observer and a cyan pseudo-element cover. Use the verified 300ms delay + 300ms wipe as the reference; stagger a short group of profile lines by 100ms, not the two words of one name. Default to visible text and enable covers only after JS initializes, so script failure cannot hide content.
3. Keep the site's Persona fonts unless a new type direction is approved. Put decorative SKILLS or PROJECTS lettering in a separate, clipped, `aria-hidden` layer; do not copy character-name assets.
4. Recompose for the portfolio's 900px compact breakpoint rather than transplanting fixed reference offsets and widths.
5. Make reduced-motion text fully revealed, retain static CRT texture, and preserve keyboard scrolling, focus, link behavior and readable text. This is a portfolio requirement: the inspected reference's reduced-motion rule covers pose/button changes but does not disable these text wipes or the SCROLL cue.

Validate future changes on desktop and phone, forward/backward scrolling, keyboard navigation, reduced motion, script-disabled content and `/original/`.

## REA evidence and reproducibility

Used the previously selected **REA 6.4.0**, restored in a temporary npm cache because the earlier cache's package files had been removed. Ran `list-browser-targets`, then `analyze-web-bundle` against the selected Yosuke page at `http://127.0.0.1:9237` with a 1000ms observation window and the default same-origin restriction. No agent configuration or global package was changed.

- Evidence ID: `ev_f9a564073c68d2634a383710d5b3b6ae39375d7e808ca0e50b9df366f3d6569f`.
- REA observed and parsed six scripts with zero parse failures, recovering four imports from the character initializer to the headline helper, motion helper, global navigation/Lenis bundle, and image lightbox.
- Complete REA JSON, downloaded source files and SHA-256 manifest, screenshots, and browser measurements are saved locally in `screenshots/p4r-character-study/`. This folder is ignored and excluded from publication; this document is the durable, source-controlled implementation guide.
- `portfolio-checks.json` and `home-*.png` verify the final build at 1440px and 375px (1×/2×). `reference-checks.json` isolates the reference observations. The earlier `browser-checks.json` also contains baseline portfolio observations from the old server; use `portfolio-checks.json` for the final .46 texture opacity and .6 cloud opacity.
- REA establishes the captured module identities and static import relationships. CSS timings/layers come from direct stylesheet inspection; viewport geometry, pseudo-element clipping and scrolling were separately verified through browser measurements. Do not attribute those visual measurements to static REA analysis.
- Scope: public character page and its loaded same-origin scripts. No source maps were requested, and the report does not prove execution of every function or recover server-side behavior.

To repeat: select the current page target using `rea list-browser-targets <loopback-endpoint>`, then run `rea analyze-web-bundle <loopback-endpoint> <returned-target-id> --observation-ms 1000 --format json`. Target IDs are session-specific; the installed launcher was `rea-agents/scripts/rea.mjs` under `/private/tmp/p4r-rea-cache/`, using its Node 24.19.0 runtime.
