# Appendix: design and font references

## CRT screen treatment

The homepage's initial CSS/SVG screen filter was independently implemented after reviewing
[Alec Lownes's CSS CRT breakdown](https://aleclownes.com/2017/02/01/crt-display.html)
and [Mobius's Old TV and VCR demo](https://codepen.io/Mobius1/pen/ZNgwbr).
These informed the dark scanline, RGB phosphor-mask, and vignette layering.
The current treatment adapts the Fallout preset and scanline, sweep, flicker,
noise and glass-shading formulas from
[vault66-crt-effect](https://github.com/mdombrov-33/vault66-crt-effect),
Copyright (c) 2025 Maksym Dombrov, under the MIT license. The license is shipped
in `assets/licenses/vault66-crt-effect.txt`. No external runtime dependency is added.
The user's complete playground URL and editable settings are in
`assets/js/crt-settings.js`. See [CRT controls](CRT-CONTROLS.md).
Animation stops offscreen and honors reduced-motion preferences; gameplay,
frames, captions and controls are outside the effects.

## Interaction design reference

- **Project:** Persona-Style Portfolio — EnvHaru / Angga Indrawan
- **Repository:** https://github.com/EnvHaru/persona-4-theme-portfolio
- **Reviewed revision:** `ec6ee9e3b29645ba6aece1231c96abfb9c4759b4`
- **Reference files:** `css/style.css`, `js/view.js`, `js/controller.js`, and `index.html`
- **Local reference checkout:** `../persona-4-theme-portfolio`, relative to the website repository root

The Persona design takes inspiration from its layered diagonal page
wipes, animated letters, responsive selection states, and bottom keyboard
instruction bar. Navigation and animation handling are implemented for this
portfolio's separate pages, shared games, and scrolling layout. The reference's
character artwork, background videos, soundtrack, cursor images, and portfolio
content are not included in this theme.

No LICENSE file was present in the reviewed checkout. This appendix records
attribution and provenance; it does not grant rights to the reference's code or
assets. Refer to the upstream repository for any subsequent licensing information.

## Menu typography image reference

- **Video:** Persona4 Golden Menus/UI — akiraredacted
- **URL:** https://www.youtube.com/watch?v=RSsdKz_rl48
- The menu lettering was compared using the video's thumbnail and storyboard
  preview frames. The website's navigation now uses the supplied Persona Slim
  Wide font with black lettering and white outlines; the
  original menu font has not been identified. No video imagery is embedded in
  the website, and no system font files are redistributed.

## Supplied font

- **Mod:** Slim Font for Persona 4 Golden PC (64 Bit), version 3.0.0
- **Authors credited in the supplied ModConfig.json:** Tekka, Pixelguin
- **Source:** https://gamebanana.com/mods/50903
- **Supplied file:** `references/fonts/p4gpc_slimfont3_0_0/FEmulator/PAK/init.bin/system/font/font0.fnt`

`assets/themes/persona/fonts/slim-latin.woff` is a local conversion of the 95 printable ASCII glyphs
from that file. The raster glyphs were traced into outlines for browser use;
this is not an original vector-font release by the mod authors. Attribution
does not change any rights associated with the supplied game font or mod.

## Font format reference and conversion tools

- https://github.com/Meloman19/PersonaEditor — FNT header and compressed glyph format
- https://github.com/amnek0/PersonaFont — additional decompression format reference
- https://github.com/fonttools/fonttools — browser-font generation
- https://python-pillow.github.io/ — glyph image preparation
- https://potrace.sourceforge.net/ — raster contour tracing

The conversion is reproducible with `tools/convert-persona-font.py`.

## Persona 4 Revival About masks

At the owner's request, About directly uses these extracted SVG silhouettes from
the official Persona 4 Revival site (SEGA / ATLUS):

- Desktop: https://asia.sega.com/p4r/en/resources/img/top/bg_revival.DxHW_odn.svg
- Mobile: https://asia.sega.com/p4r/en/resources/img/top/bg_revival_sp.BjI926qS.svg

The local assets in `assets/themes/persona/images/revival/` adapt the supplied
extraction: the upper curves are extended to enter from the left edge, and the
desktop TV stack is replaced with an original "ace of chips" playing card in
fine circuit linework.
CSS uses their alpha with the portfolio's yellow token. The underlying curves
remain third-party artwork; attribution does not confer a license. The circuit
card, cloud artwork, texture and portfolio copy are local.

## Experience disc marks

The Persona save menu prints employer marks on its discs
(`assets/images/experience/`). They identify the employers only; each mark
remains its owner's trademark.

- NeoteAI: the "N" mark cropped from the wordmark at https://neoteai.com
- Tencent Cloud: `tencentcloud.svg` from `@lobehub/icons-static-svg` 1.80.0 (MIT)
- Bilibili: the Simple Icons glyph already used by the Contact link

BesTV and Damrey Education have no mark yet; their discs stay plain.

## Revival flower silhouettes

At the owner's request, solid flowers use a Potrace contour of the extracted
`deco_flower_revival_1.CVukmDCf.embedded.png` alpha (threshold 128, Potrace 1.16).
White flowers use the original `deco_flower_revival_4.BTmkUX6x.svg` wrapper and
its embedded PNG, saved locally as `flower-white.svg`. Sources are SEGA/ATLUS's
Persona 4 Revival site, supplied in `p4r-reverse-engineering/revival-assets/`.
The solid contour is normalized to the existing 320-unit stage and recolored;
the white artwork retains the baked red/green fringe. These are adapted
third-party assets, not newly authored flower illustrations.
