# Remaining hardcoded colors after the reversible redesign

Update: the general site uses the four approved colors, while the TV and keyboard HUD explicitly retain their original colors at the user’s request. Those scoped exceptions are declared in `palette.css`. The inventory below records the earlier migration scan. All retained matches outside `palette.css` are listed below; original styles are preserved for rollback, and project artwork retains its original colors. This is a static source check, not browser-computed-style verification.

## assets/css/site.css

- Line 2: `#f6f7f4`
- Line 3: `#ffffff`
- Line 4: `#e9eeec`
- Line 5: `#172126`
- Line 6: `#556268`
- Line 7: `#c8d1cf`
- Line 8: `#84938f`
- Line 9: `#007b78`
- Line 10: `#005c5a`
- Line 11: `#e0a821`
- Line 12: `#c74747`
- Line 13: `#006ce5`
- Line 14: `#f6f7f4`
- Line 15: `rgba(27, 42, 46, 0.1)`
- Line 16: `rgba(27, 42, 46, 0.14)`
- Line 32: `#111618`
- Line 33: `#1b2225`
- Line 34: `#20292b`
- Line 35: `#edf2ef`
- Line 36: `#abb7b5`
- Line 37: `#354245`
- Line 38: `#718180`
- Line 39: `#51cbc3`
- Line 40: `#7be2db`
- Line 41: `#f1c654`
- Line 42: `#ff7777`
- Line 43: `#69aaff`
- Line 44: `#111618`
- Line 45: `rgba(0, 0, 0, 0.3)`
- Line 46: `rgba(0, 0, 0, 0.42)`
- Line 186: `#8b9698`
- Line 197: `#fff`
- Line 198: `rgba(0, 0, 0, 0.28)`
- Line 211: `rgba(0, 0, 0, 0.24)`
- Line 311: `rgba(0, 0, 0, 0.02)`
- Line 326: `#10191c`
- Line 547: `#536164`, `#10191c`, `#edf2ef`
- Line 549: `rgba(8, 13, 15, 0.88)`
- Line 557: `rgba(8, 8, 8, .72)`
- Line 569: `#58d7cf`, `#58d7cf`, `#0e1416`
- Line 607: `rgba(0, 0, 0, 0.84)`
- Line 608: `#ffff00`
- Line 685: `#101313`
- Line 687: `rgba(85, 130, 122, 0.12)`
- Line 688: `rgba(85, 130, 122, 0.12)`
- Line 701: `#101313`
- Line 702: `#9db0ad`
- Line 706: `#ff9a9a`
- Line 716: `rgba(220, 239, 235, 0.2)`
- Line 717: `rgba(6, 12, 12, 0.76)`
- Line 718: `#bed0cc`
- Line 729: `#70c98b`
- Line 730: `#6fa9ff`
- Line 731: `#70c98b`
- Line 732: `#6fa9ff`
- Line 733: `rgba(232, 99, 99, 0.12)`, `#e86363`
- Line 734: `#e86363`
- Line 736: `#e86363`
- Line 737: `#70c98b`
- Line 738: `#6fa9ff`
- Line 745: `rgba(82, 145, 134, 0.32)`
- Line 746: `rgba(82, 145, 134, 0.32)`
- Line 766: `#075649`
- Line 767: `#064f43`
- Line 768: `rgba(0, 0, 0, 0.38)`, `#177668`
- Line 775: `#050707`, `#0b1010`
- Line 776: `#00110f`
- Line 777: `#91a09d`, `#53615f`
- Line 782: `#9aa7a5`
- Line 803: `#69aaff`
- Line 884: `#536164`
- Line 895: `#536164`

## assets/images/placeholders/portrait-placeholder.svg

- Line 4: `#dfe6e8`
- Line 5: `#86979d`
- Line 6: `#52656c`
- Line 7: `#2c3d43`
- Line 8: `#fff`

## assets/images/placeholders/project-placeholder.svg

- Line 4: `#e7ecec`
- Line 5: `#80969c`
- Line 6: `#e7b24b`
- Line 7: `#2f444a`
- Line 8: `#26363b`

## assets/images/projects/bilibili/bilibili-preview.svg

- Line 5: `#fb7299`
- Line 6: `#fff`

## assets/images/site/profile-monogram.svg

- Line 6: `#122a2b`
- Line 7: `#071314`
- Line 10: `#36d7c3`
- Line 11: `#36d7c3`
- Line 16: `#a7fff2`
- Line 20: `#0b1c1d`, `#53e5d1`
- Line 21: `#a7fff2`
- Line 22: `#effffb`
- Line 23: `#53e5d1`
- Line 24: `#a7fff2`

## assets/js/imu-sandbox-fallback.js

- Line 94: `0xff0f1100`
- Line 96: `0xfff7ffb8`

## assets/js/imu-sandbox-game.js

- Line 24: `0x0d1212`
- Line 30: `0xe7fff9`, `0x262019`
- Line 31: `0xffffff`
- Line 34: `0x4de4d2`
- Line 40: `0x25231f`
- Line 44: `0x41635d`, `0x302f2a`
- Line 53: `0x121918`
- Line 58: `0x41635d`, `0x293532`
- Line 88: `0x064f43`
- Line 94: `0x090b0b`
- Line 100: `0xffffff`
- Line 105: `0xc1cbc8`
- Line 164: `0xff0f1100`
- Line 166: `0xfff7ffb8`

## assets/js/laser-game.js

- Line 39: `#10191c`, `#2a393d`, `#f2f5f3`, `#f1c654`
- Line 40: `#00fff7`, `#4baeff`, `#ff676f`, `#edf2ef`
- Line 69: `rgba(0,0,0,.55)`
- Line 82: `#7b7d7b`
- Line 127: `#ffffff`
- Line 138: `#ffffff`
- Line 154: `#00fff7`

## assets/themes/persona/game-start.js

- Line 13: `#080808`, `#a9b4bd`, `#fffdf3`, `#080808`, `#080808`

## assets/themes/persona/style.css

- Line 32: `#ffe348`
- Line 33: `#67cef6`
- Line 34: `#132938`
- Line 35: `#fffdf3`
- Line 46: `#fffef9`
- Line 47: `#dff3fb`
- Line 49: `#405462`
- Line 50: `#acbdc5`
- Line 52: `#096387`
- Line 53: `#075575`
- Line 56: `#075575`
- Line 62: `#132938`
- Line 63: `#203b4a`
- Line 64: `#294959`
- Line 65: `#fffdf3`
- Line 66: `#d0e2e9`
- Line 67: `#587784`
- Line 68: `#88d7f7`
- Line 71: `#132938`
- Line 94: `#000`
- Line 95: `#fff`
- Line 180: `#080808`
- Line 181: `#fff`
- Line 203: `#080808`
- Line 328: `#0c75a1`
- Line 753: `rgba(8, 8, 8, .72)`
- Line 792: `#000`
- Line 800: `#080808`
- Line 802: `#080808`
- Line 803: `#424242`, `#000`, `#132938`
- Line 812: `#242424`
- Line 815: `#505050`
- Line 823: `#132938`
- Line 825: `#ffe348`, `#132938`
- Line 827: `#555`, `#fffdf3`, `#000`, `#b5b5af`
- Line 828: `#080808`
- Line 829: `#8d969b`
- Line 835: `#fffdf3`
- Line 845: `#fffdf3`
- Line 849: `#fffdf3`
- Line 853: `#132938`
- Line 879: `#555`
- Line 881: `#414141`, `#171717`
- Line 882: `#fffdf3`
- Line 883: `#000`, `#686868`, `#080808`
- Line 906: `#080808`
- Line 908: `#262626`, `#080808`
- Line 909: `#555`, `#132938`
- Line 918: `#080808`
- Line 933: `#606060`
- Line 935: `#414141`, `#171717`
- Line 936: `#fffdf3`
- Line 937: `#686868`, `#000`
- Line 950: `#a9b4bd`
- Line 951: `#fffdf3`
- Line 952: `#555`, `#242424`
- Line 957: `#080808`
- Line 961: `#ffe348`

## assets/vendor/three.core.min.js

- Line 6: `rgb(${Math.round(255*e)`

## Encoded and nonliteral colors

- `assets/js/imu-sandbox-game.js` and `assets/js/imu-sandbox-fallback.js` retain packed OLED pixel colors, included above.
- Asset conversion scripts include RGBA arrays and imported RGB565/FPGA palette data.
- Bundled Three.js includes decimal-encoded named colors, not matched by hex/rgb grep.
- Raster images, animated previews, and videos are not CSS colors.
- `COLOR-AUDIT.md` lists named colors, the library color registry, variable consumers, and numeric artwork palettes.
- `_site/` repeats the retained source because it includes the original design for rollback.
