# Appendix: design and font references

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
