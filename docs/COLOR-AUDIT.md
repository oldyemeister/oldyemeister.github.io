# Color audit — before palette migration

Snapshot of working source, including the existing local TV, pause, and navigation edits. No palette implementation has been applied.

## Scope

- All authored CSS and HTML, runtime JavaScript (including generated SVG markup), standalone SVG assets, asset-generation tools, and bundled Three.js files were scanned. No SCSS/Sass or Tailwind configuration exists.
- `_site/` is generated output and repeats source colors; it is not an independent editing target. Archived references, tests, and font source packages are not live UI.
- No literal HTML `style=` attributes were found in authored source. JavaScript canvas/WebGL colors and injected SVG attributes are inventoried below.
- Hex shorthand and named equivalents are normalized; alpha variants remain distinct. `transparent` and `currentColor` are inheritance/compositing instructions rather than extra palette colors.
- This is a source-use inventory, not a claim that every declared color is visible simultaneously: the base styles are overridden by the active theme. Raster photos, sprite sheets, GIFs, videos, and texture pixels are not CSS colors.

Authored site: **111 distinct fixed color expressions** (including packed pixel colors), plus transparency/currentColor; **218 occurrences**.

## Main findings

- Base light/dark tokens and the Persona light/dark overrides define competing palettes. Fixed TV grays, heading outlines, game colors, and teal IMU surfaces bypass those tokens.
- Navigation/theme-toggle styling uses both variables and literal colors. TV antenna colors are embedded in `game-start.js`, not just CSS.
- Soft shadows, inset highlights, gradients, colored text strokes, and per-letter animation currently conflict with the requested flat treatment.
- Existing section wrappers can receive a unified panel treatment while inner card borders are removed, preserving DOM order and grid layout. Moving images/captions or adding wrappers would be structural work and is not part of this pass.

## Consolidation candidates

| Existing family | Proposed consolidation |
| --- | --- |
| `#000000`, `#080808`, `#050707`, `#090B0B`, `#0B1010`, `#0D1212`, `#111618`, `#171717`, `#242424`, `#262626` | Olive panel/foreground token according to role; remove black bevel layers |
| `#414141`, `#424242`, `#505050`, `#555555`, `#606060`, `#686868` | Muted olive for inactive state; gold for functional borders |
| `#FFFFFF`, `#FFFDF3`, `#FFFEF9`, `#F6F7F4`, `#EDF2EF` | Approved day panel/field tokens or yellow foreground at night |
| `#FFE348`, `#FFFF00`, `#E0A821`, `#F1C654` | Exact electric yellow or mustard gold by role |
| Blue/teal accent families (`#67CEF6`, `#51CBC3`, `#007B78`, `#075575`, etc.) | Exact yellow for active controls and gold for panel borders |

## Exact color inventory and applications

### Authored site

112 distinct normalized expressions.

#### `#000000`

- `assets/themes/persona/style.css:94` — `.persona-design h2, .persona-design .laser-intro h1, .persona-design .game-start-button [data-start-label] → color: #000` (literal `#000`)
- `assets/themes/persona/style.css:792` — `.persona-design .game-start-prompt p → text-shadow: 0 2px 4px #000` (literal `#000`)
- `assets/themes/persona/style.css:803` — `.persona-design .persona-tv → box-shadow: inset 0 3px 0 #424242, inset 0 -6px 0 #000, 8px 10px 0 #132938` (literal `#000`)
- `assets/themes/persona/style.css:827` — `.tv-knob → box-shadow: 2px 3px 0 #000, inset -4px -3px 0 #b5b5af` (literal `#000`)
- `assets/themes/persona/style.css:883` — `.persona-design .persona-tv .game-action-button → box-shadow: 0 3px 0 #000, inset 0 2px 0 #686868, inset 0 -3px 0 #080808` (literal `#000`)
- `assets/themes/persona/style.css:937` — `.persona-design .tv-leg button → box-shadow: inset 0 1px 0 #686868, 0 2px 0 #000` (literal `#000`)

#### `#00110F`

- `assets/css/site.css:776` — `.imu-css-screen canvas → background: #00110f` (literal `#00110f`)

#### `#005C5A`

- `assets/css/site.css:10` — `:root → --accent-strong: #005c5a` (literal `#005c5a`)

#### `#006CE5`

- `assets/css/site.css:13` — `:root → --focus: #006ce5` (literal `#006ce5`)

#### `#007B78`

- `assets/css/site.css:9` — `:root → --accent: #007b78` (literal `#007b78`)

#### `#00FFF7`

- `assets/js/laser-game.js:40` — `laser: '#00fff7', node: '#4baeff', firewall: '#ff676f', text: '#edf2ef', backgroundAlpha: 0.82` (literal `#00fff7`)
- `assets/js/laser-game.js:154` — `context.fillStyle = '#00fff7';` (literal `#00fff7`)

#### `#050707`

- `assets/css/site.css:775` — `.imu-css-screen → background: #050707` (literal `#050707`)

#### `#064F43`

- `assets/css/site.css:767` — `.imu-css-device → background: #064f43` (literal `#064f43`)
- `assets/js/imu-sandbox-game.js:88` — `new THREE.MeshLambertMaterial({ color: 0x064f43 })` (literal `0x064f43`)

#### `#075575`

- `assets/themes/persona/style.css:53` — `:root, :root[data-theme="dark"] → --accent-strong: #075575` (literal `#075575`)
- `assets/themes/persona/style.css:56` — `:root, :root[data-theme="dark"] → --focus: #075575` (literal `#075575`)

#### `#075649`

- `assets/css/site.css:766` — `.imu-css-device → border: 10px solid #075649` (literal `#075649`)

#### `#080808`

- `assets/themes/persona/game-start.js:13` — `television.innerHTML = '<svg class="tv-antennas" viewBox="0 0 180 100" aria-hidden="true"><path d="M88 92 30 14M92 92 152 6" fill="none" stroke="#080808" stroke-width="12" stroke-linecap="round"/><path d="M88 88 31 15M94 86 152 8" fill="none" stroke="#a9b4bd" stroke-width="4" stroke-linecap="round"/><g fill="#fffdf3" stroke="#080808" stroke-width="5"><circle cx="30" cy="14" r="8"/><circle cx="152"` (literal `#080808`)
- `assets/themes/persona/game-start.js:13` — `television.innerHTML = '<svg class="tv-antennas" viewBox="0 0 180 100" aria-hidden="true"><path d="M88 92 30 14M92 92 152 6" fill="none" stroke="#080808" stroke-width="12" stroke-linecap="round"/><path d="M88 88 31 15M94 86 152 8" fill="none" stroke="#a9b4bd" stroke-width="4" stroke-linecap="round"/><g fill="#fffdf3" stroke="#080808" stroke-width="5"><circle cx="30" cy="14" r="8"/><circle cx="152"` (literal `#080808`)
- `assets/themes/persona/game-start.js:13` — `television.innerHTML = '<svg class="tv-antennas" viewBox="0 0 180 100" aria-hidden="true"><path d="M88 92 30 14M92 92 152 6" fill="none" stroke="#080808" stroke-width="12" stroke-linecap="round"/><path d="M88 88 31 15M94 86 152 8" fill="none" stroke="#a9b4bd" stroke-width="4" stroke-linecap="round"/><g fill="#fffdf3" stroke="#080808" stroke-width="5"><circle cx="30" cy="14" r="8"/><circle cx="152"` (literal `#080808`)
- `assets/themes/persona/style.css:180` — `.site-navigation a → color: #080808` (literal `#080808`)
- `assets/themes/persona/style.css:203` — `.site-navigation a:hover, .site-navigation a:focus-visible → color: #080808` (literal `#080808`)
- `assets/themes/persona/style.css:800` — `.persona-design .persona-tv → border: 3px solid #080808` (literal `#080808`)
- `assets/themes/persona/style.css:802` — `.persona-design .persona-tv → background: #080808` (literal `#080808`)
- `assets/themes/persona/style.css:828` — `.tv-knob::after → background: #080808` (literal `#080808`)
- `assets/themes/persona/style.css:883` — `.persona-design .persona-tv .game-action-button → box-shadow: 0 3px 0 #000, inset 0 2px 0 #686868, inset 0 -3px 0 #080808` (literal `#080808`)
- `assets/themes/persona/style.css:906` — `.persona-design .tv-leg → border: 2px solid #080808` (literal `#080808`)
- `assets/themes/persona/style.css:908` — `.persona-design .tv-leg → background: linear-gradient(#262626, #080808)` (literal `#080808`)
- `assets/themes/persona/style.css:918` — `.persona-design .tv-leg::before → background: #080808` (literal `#080808`)
- `assets/themes/persona/style.css:957` — `.persona-design .persona-tv .game-action-button:active:enabled, .persona-design .tv-leg button:active:enabled → box-shadow: inset 0 2px 3px #080808` (literal `#080808`)

#### `#090B0B`

- `assets/js/imu-sandbox-game.js:94` — `new THREE.MeshPhongMaterial({ color: 0x090b0b, shininess: 24 })` (literal `0x090b0b`)

#### `#096387`

- `assets/themes/persona/style.css:52` — `:root, :root[data-theme="dark"] → --accent: #096387` (literal `#096387`)

#### `#0B1010`

- `assets/css/site.css:775` — `.imu-css-screen → box-shadow: inset 0 0 0 4px #0b1010` (literal `#0b1010`)

#### `#0C75A1`

- `assets/themes/persona/style.css:328` — `.monogram-dot → color: #0c75a1` (literal `#0c75a1`)

#### `#0D1212`

- `assets/js/imu-sandbox-game.js:24` — `scene.background = new THREE.Color(0x0d1212);` (literal `0x0d1212`)

#### `#0E1416`

- `assets/css/site.css:569` — `.game-overlay button → color: #0e1416` (literal `#0e1416`)

#### `#101313`

- `assets/css/site.css:685` — `.imu-scene → background-color: #101313` (literal `#101313`)
- `assets/css/site.css:701` — `.imu-scene-status → background: #101313` (literal `#101313`)

#### `#10191C`

- `assets/css/site.css:326` — `.project-media → background: #10191c` (literal `#10191c`)
- `assets/css/site.css:547` — `.game-board-wrap → background: #10191c` (literal `#10191c`)
- `assets/js/laser-game.js:39` — `board: '#10191c', grid: '#2a393d', mirror: '#f2f5f3', selected: '#f1c654',` (literal `#10191c`)

#### `#111618`

- `assets/css/site.css:32` — `:root[data-theme="dark"] → --page: #111618` (literal `#111618`)
- `assets/css/site.css:44` — `:root[data-theme="dark"] → --header-bg: #111618` (literal `#111618`)

#### `#121918`

- `assets/js/imu-sandbox-game.js:53` — `new THREE.MeshLambertMaterial({ color: 0x121918 })` (literal `0x121918`)

#### `#132938`

- `assets/themes/persona/style.css:34` — `:root, :root[data-theme="dark"] → --persona-ink: #132938` (literal `#132938`)
- `assets/themes/persona/style.css:62` — `:root[data-theme="dark"] → --page: #132938` (literal `#132938`)
- `assets/themes/persona/style.css:71` — `:root[data-theme="dark"] → --header-bg: #132938` (literal `#132938`)
- `assets/themes/persona/style.css:803` — `.persona-design .persona-tv → box-shadow: inset 0 3px 0 #424242, inset 0 -6px 0 #000, 8px 10px 0 #132938` (literal `#132938`)
- `assets/themes/persona/style.css:823` — `.persona-tv-panel → color: #132938` (literal `#132938`)
- `assets/themes/persona/style.css:825` — `.tv-power → box-shadow: 0 0 0 3px #132938` (literal `#132938`)
- `assets/themes/persona/style.css:853` — `.persona-design .persona-tv → box-shadow: 4px 6px 0 #132938` (literal `#132938`)
- `assets/themes/persona/style.css:909` — `.persona-design .tv-leg → box-shadow: inset 0 1px 0 #555, 3px 4px 0 #132938` (literal `#132938`)

#### `#171717`

- `assets/themes/persona/style.css:881` — `.persona-design .persona-tv .game-action-button → background: linear-gradient(145deg, #414141, #171717)` (literal `#171717`)
- `assets/themes/persona/style.css:935` — `.persona-design .tv-leg button → background: linear-gradient(145deg, #414141, #171717)` (literal `#171717`)

#### `#172126`

- `assets/css/site.css:5` — `:root → --text: #172126` (literal `#172126`)

#### `#177668`

- `assets/css/site.css:768` — `.imu-css-device → box-shadow: 0 26px 34px rgba(0, 0, 0, 0.38), inset 0 4px 0 #177668` (literal `#177668`)

#### `#1B2225`

- `assets/css/site.css:33` — `:root[data-theme="dark"] → --surface: #1b2225` (literal `#1b2225`)

#### `#20292B`

- `assets/css/site.css:34` — `:root[data-theme="dark"] → --surface-muted: #20292b` (literal `#20292b`)

#### `#203B4A`

- `assets/themes/persona/style.css:63` — `:root[data-theme="dark"] → --surface: #203b4a` (literal `#203b4a`)

#### `#242424`

- `assets/themes/persona/style.css:812` — `.persona-design .persona-tv > .game-board-wrap, .persona-design .persona-tv > .imu-scene → border: 8px solid #242424` (literal `#242424`)
- `assets/themes/persona/style.css:952` — `.persona-design .persona-tv .game-action-button:hover:enabled, .persona-design .tv-leg button:hover:enabled → background: linear-gradient(145deg, #555, #242424)` (literal `#242424`)

#### `#25231F`

- `assets/js/imu-sandbox-game.js:40` — `new THREE.MeshLambertMaterial({ color: 0x25231f })` (literal `0x25231f`)

#### `#262019`

- `assets/js/imu-sandbox-game.js:30` — `scene.add(new THREE.HemisphereLight(0xe7fff9, 0x262019, 2.2));` (literal `0x262019`)

#### `#262626`

- `assets/themes/persona/style.css:908` — `.persona-design .tv-leg → background: linear-gradient(#262626, #080808)` (literal `#262626`)

#### `#293532`

- `assets/js/imu-sandbox-game.js:58` — `const backGrid = new THREE.GridHelper(22, 22, 0x41635d, 0x293532);` (literal `0x293532`)

#### `#294959`

- `assets/themes/persona/style.css:64` — `:root[data-theme="dark"] → --surface-muted: #294959` (literal `#294959`)

#### `#2A393D`

- `assets/js/laser-game.js:39` — `board: '#10191c', grid: '#2a393d', mirror: '#f2f5f3', selected: '#f1c654',` (literal `#2a393d`)

#### `#302F2A`

- `assets/js/imu-sandbox-game.js:44` — `const grid = new THREE.GridHelper(22, 22, 0x41635d, 0x302f2a);` (literal `0x302f2a`)

#### `#354245`

- `assets/css/site.css:37` — `:root[data-theme="dark"] → --line: #354245` (literal `#354245`)

#### `#405462`

- `assets/themes/persona/style.css:49` — `:root, :root[data-theme="dark"] → --text-muted: #405462` (literal `#405462`)

#### `#414141`

- `assets/themes/persona/style.css:881` — `.persona-design .persona-tv .game-action-button → background: linear-gradient(145deg, #414141, #171717)` (literal `#414141`)
- `assets/themes/persona/style.css:935` — `.persona-design .tv-leg button → background: linear-gradient(145deg, #414141, #171717)` (literal `#414141`)

#### `#41635D`

- `assets/js/imu-sandbox-game.js:44` — `const grid = new THREE.GridHelper(22, 22, 0x41635d, 0x302f2a);` (literal `0x41635d`)
- `assets/js/imu-sandbox-game.js:58` — `const backGrid = new THREE.GridHelper(22, 22, 0x41635d, 0x293532);` (literal `0x41635d`)

#### `#424242`

- `assets/themes/persona/style.css:803` — `.persona-design .persona-tv → box-shadow: inset 0 3px 0 #424242, inset 0 -6px 0 #000, 8px 10px 0 #132938` (literal `#424242`)

#### `#4BAEFF`

- `assets/js/laser-game.js:40` — `laser: '#00fff7', node: '#4baeff', firewall: '#ff676f', text: '#edf2ef', backgroundAlpha: 0.82` (literal `#4baeff`)

#### `#4DE4D2`

- `assets/js/imu-sandbox-game.js:34` — `const edgeLight = new THREE.DirectionalLight(0x4de4d2, 1.7);` (literal `0x4de4d2`)

#### `#505050`

- `assets/themes/persona/style.css:815` — `.persona-design .persona-tv > .game-board-wrap, .persona-design .persona-tv > .imu-scene → box-shadow: 0 2px 0 #505050` (literal `#505050`)

#### `#51CBC3`

- `assets/css/site.css:39` — `:root[data-theme="dark"] → --accent: #51cbc3` (literal `#51cbc3`)

#### `#53615F`

- `assets/css/site.css:777` — `.imu-css-screw → box-shadow: inset -3px -3px 0 #53615f` (literal `#53615f`)

#### `#536164`

- `assets/css/site.css:547` — `.game-board-wrap → border: 1px solid #536164` (literal `#536164`)
- `assets/css/site.css:884` — `.game-status-bar > div:nth-child(-n+2) → border-bottom: 1px solid #536164` (literal `#536164`)
- `assets/css/site.css:895` — `.dk-status-bar > div:nth-child(2) → border-right: 1px solid #536164` (literal `#536164`)

#### `#555555`

- `assets/themes/persona/style.css:827` — `.tv-knob → border: 4px solid #555` (literal `#555`)
- `assets/themes/persona/style.css:879` — `.persona-design .persona-tv .game-action-button → border: 3px solid #555` (literal `#555`)
- `assets/themes/persona/style.css:909` — `.persona-design .tv-leg → box-shadow: inset 0 1px 0 #555, 3px 4px 0 #132938` (literal `#555`)
- `assets/themes/persona/style.css:952` — `.persona-design .persona-tv .game-action-button:hover:enabled, .persona-design .tv-leg button:hover:enabled → background: linear-gradient(145deg, #555, #242424)` (literal `#555`)

#### `#556268`

- `assets/css/site.css:6` — `:root → --text-muted: #556268` (literal `#556268`)

#### `#587784`

- `assets/themes/persona/style.css:67` — `:root[data-theme="dark"] → --line: #587784` (literal `#587784`)

#### `#58D7CF`

- `assets/css/site.css:569` — `.game-overlay button → border: 1px solid #58d7cf` (literal `#58d7cf`)
- `assets/css/site.css:569` — `.game-overlay button → background: #58d7cf` (literal `#58d7cf`)

#### `#606060`

- `assets/themes/persona/style.css:933` — `.persona-design .tv-leg button → border: 1px solid #606060` (literal `#606060`)

#### `#67CEF6`

- `assets/themes/persona/style.css:33` — `:root, :root[data-theme="dark"] → --persona-sky: #67cef6` (literal `#67cef6`)

#### `#686868`

- `assets/themes/persona/style.css:883` — `.persona-design .persona-tv .game-action-button → box-shadow: 0 3px 0 #000, inset 0 2px 0 #686868, inset 0 -3px 0 #080808` (literal `#686868`)
- `assets/themes/persona/style.css:937` — `.persona-design .tv-leg button → box-shadow: inset 0 1px 0 #686868, 0 2px 0 #000` (literal `#686868`)

#### `#69AAFF`

- `assets/css/site.css:43` — `:root[data-theme="dark"] → --focus: #69aaff` (literal `#69aaff`)
- `assets/css/site.css:803` — `.imu-axis-control input:focus-visible → outline: 3px solid #69aaff` (literal `#69aaff`)

#### `#6FA9FF`

- `assets/css/site.css:730` — `.imu-axis-line.is-z → stroke: #6fa9ff` (literal `#6fa9ff`)
- `assets/css/site.css:732` — `.imu-axis-arrow.is-z → fill: #6fa9ff` (literal `#6fa9ff`)
- `assets/css/site.css:738` — `.imu-world-axes text.is-z → fill: #6fa9ff` (literal `#6fa9ff`)

#### `#70C98B`

- `assets/css/site.css:729` — `.imu-axis-line.is-y → stroke: #70c98b` (literal `#70c98b`)
- `assets/css/site.css:731` — `.imu-axis-arrow.is-y → fill: #70c98b` (literal `#70c98b`)
- `assets/css/site.css:737` — `.imu-world-axes text.is-y → fill: #70c98b` (literal `#70c98b`)

#### `#718180`

- `assets/css/site.css:38` — `:root[data-theme="dark"] → --line-strong: #718180` (literal `#718180`)

#### `#7B7D7B`

- `assets/js/laser-game.js:82` — `const gray = '#7b7d7b';` (literal `#7b7d7b`)

#### `#7BE2DB`

- `assets/css/site.css:40` — `:root[data-theme="dark"] → --accent-strong: #7be2db` (literal `#7be2db`)

#### `#84938F`

- `assets/css/site.css:8` — `:root → --line-strong: #84938f` (literal `#84938f`)

#### `#88D7F7`

- `assets/themes/persona/style.css:68` — `:root[data-theme="dark"] → --line-strong: #88d7f7` (literal `#88d7f7`)

#### `#8B9698`

- `assets/css/site.css:186` — `.theme-switch → background: #8b9698` (literal `#8b9698`)

#### `#8D969B`

- `assets/themes/persona/style.css:829` — `.tv-speaker → background: repeating-linear-gradient(0deg, transparent 0 3px, #8d969b 3px 5px)` (literal `#8d969b`)

#### `#91A09D`

- `assets/css/site.css:777` — `.imu-css-screw → background: #91a09d` (literal `#91a09d`)

#### `#9AA7A5`

- `assets/css/site.css:782` — `.imu-css-pins → background: repeating-linear-gradient(90deg, #9aa7a5 0 7px, transparent 7px 13px)` (literal `#9aa7a5`)

#### `#9DB0AD`

- `assets/css/site.css:702` — `.imu-scene-status → color: #9db0ad` (literal `#9db0ad`)

#### `#A9B4BD`

- `assets/themes/persona/game-start.js:13` — `television.innerHTML = '<svg class="tv-antennas" viewBox="0 0 180 100" aria-hidden="true"><path d="M88 92 30 14M92 92 152 6" fill="none" stroke="#080808" stroke-width="12" stroke-linecap="round"/><path d="M88 88 31 15M94 86 152 8" fill="none" stroke="#a9b4bd" stroke-width="4" stroke-linecap="round"/><g fill="#fffdf3" stroke="#080808" stroke-width="5"><circle cx="30" cy="14" r="8"/><circle cx="152"` (literal `#a9b4bd`)
- `assets/themes/persona/style.css:950` — `.persona-design .persona-tv .game-action-button:hover:enabled, .persona-design .tv-leg button:hover:enabled → border-color: #a9b4bd` (literal `#a9b4bd`)

#### `#ABB7B5`

- `assets/css/site.css:36` — `:root[data-theme="dark"] → --text-muted: #abb7b5` (literal `#abb7b5`)

#### `#ACBDC5`

- `assets/themes/persona/style.css:50` — `:root, :root[data-theme="dark"] → --line: #acbdc5` (literal `#acbdc5`)

#### `#B5B5AF`

- `assets/themes/persona/style.css:827` — `.tv-knob → box-shadow: 2px 3px 0 #000, inset -4px -3px 0 #b5b5af` (literal `#b5b5af`)

#### `#BED0CC`

- `assets/css/site.css:718` — `.imu-world-axes → color: #bed0cc` (literal `#bed0cc`)

#### `#C1CBC8`

- `assets/js/imu-sandbox-game.js:105` — `const metal = new THREE.MeshPhongMaterial({ color: 0xc1cbc8, shininess: 80 });` (literal `0xc1cbc8`)

#### `#C74747`

- `assets/css/site.css:12` — `:root → --danger: #c74747` (literal `#c74747`)

#### `#C8D1CF`

- `assets/css/site.css:7` — `:root → --line: #c8d1cf` (literal `#c8d1cf`)

#### `#D0E2E9`

- `assets/themes/persona/style.css:66` — `:root[data-theme="dark"] → --text-muted: #d0e2e9` (literal `#d0e2e9`)

#### `#DFF3FB`

- `assets/themes/persona/style.css:47` — `:root, :root[data-theme="dark"] → --surface-muted: #dff3fb` (literal `#dff3fb`)

#### `#E0A821`

- `assets/css/site.css:11` — `:root → --signal: #e0a821` (literal `#e0a821`)

#### `#E7FFF9`

- `assets/js/imu-sandbox-game.js:30` — `scene.add(new THREE.HemisphereLight(0xe7fff9, 0x262019, 2.2));` (literal `0xe7fff9`)

#### `#E86363`

- `assets/css/site.css:733` — `.imu-axis-x-ring → stroke: #e86363` (literal `#e86363`)
- `assets/css/site.css:734` — `.imu-axis-x-dot → fill: #e86363` (literal `#e86363`)
- `assets/css/site.css:736` — `.imu-world-axes text.is-x → fill: #e86363` (literal `#e86363`)

#### `#E9EEEC`

- `assets/css/site.css:4` — `:root → --surface-muted: #e9eeec` (literal `#e9eeec`)

#### `#EDF2EF`

- `assets/css/site.css:35` — `:root[data-theme="dark"] → --text: #edf2ef` (literal `#edf2ef`)
- `assets/css/site.css:547` — `.game-board-wrap → color: #edf2ef` (literal `#edf2ef`)
- `assets/js/laser-game.js:40` — `laser: '#00fff7', node: '#4baeff', firewall: '#ff676f', text: '#edf2ef', backgroundAlpha: 0.82` (literal `#edf2ef`)

#### `#F1C654`

- `assets/css/site.css:41` — `:root[data-theme="dark"] → --signal: #f1c654` (literal `#f1c654`)
- `assets/js/laser-game.js:39` — `board: '#10191c', grid: '#2a393d', mirror: '#f2f5f3', selected: '#f1c654',` (literal `#f1c654`)

#### `#F2F5F3`

- `assets/js/laser-game.js:39` — `board: '#10191c', grid: '#2a393d', mirror: '#f2f5f3', selected: '#f1c654',` (literal `#f2f5f3`)

#### `#F6F7F4`

- `assets/css/site.css:2` — `:root → --page: #f6f7f4` (literal `#f6f7f4`)
- `assets/css/site.css:14` — `:root → --header-bg: #f6f7f4` (literal `#f6f7f4`)

#### `#FF676F`

- `assets/js/laser-game.js:40` — `laser: '#00fff7', node: '#4baeff', firewall: '#ff676f', text: '#edf2ef', backgroundAlpha: 0.82` (literal `#ff676f`)

#### `#FF7777`

- `assets/css/site.css:42` — `:root[data-theme="dark"] → --danger: #ff7777` (literal `#ff7777`)

#### `#FF9A9A`

- `assets/css/site.css:706` — `.imu-scene-status.is-error → color: #ff9a9a` (literal `#ff9a9a`)

#### `#FFE348`

- `assets/themes/persona/style.css:32` — `:root, :root[data-theme="dark"] → --persona-yellow: #ffe348` (literal `#ffe348`)
- `assets/themes/persona/style.css:825` — `.tv-power → background: #ffe348` (literal `#ffe348`)
- `assets/themes/persona/style.css:961` — `.persona-design .persona-tv .game-action-button:focus-visible, .persona-design .tv-leg button:focus-visible → outline: 2px solid #ffe348` (literal `#ffe348`)

#### `#FFFDF3`

- `assets/themes/persona/game-start.js:13` — `television.innerHTML = '<svg class="tv-antennas" viewBox="0 0 180 100" aria-hidden="true"><path d="M88 92 30 14M92 92 152 6" fill="none" stroke="#080808" stroke-width="12" stroke-linecap="round"/><path d="M88 88 31 15M94 86 152 8" fill="none" stroke="#a9b4bd" stroke-width="4" stroke-linecap="round"/><g fill="#fffdf3" stroke="#080808" stroke-width="5"><circle cx="30" cy="14" r="8"/><circle cx="152"` (literal `#fffdf3`)
- `assets/themes/persona/style.css:35` — `:root, :root[data-theme="dark"] → --persona-paper: #fffdf3` (literal `#fffdf3`)
- `assets/themes/persona/style.css:65` — `:root[data-theme="dark"] → --text: #fffdf3` (literal `#fffdf3`)
- `assets/themes/persona/style.css:827` — `.tv-knob → background: #fffdf3` (literal `#fffdf3`)
- `assets/themes/persona/style.css:835` — `.persona-design .persona-tv .game-status-bar → color: #fffdf3` (literal `#fffdf3`)
- `assets/themes/persona/style.css:845` — `.persona-design .persona-tv .game-status-bar span → color: #fffdf3` (literal `#fffdf3`)
- `assets/themes/persona/style.css:849` — `.persona-design .persona-tv .imu-live-readouts span, .persona-design .persona-tv .imu-live-readouts strong → color: #fffdf3` (literal `#fffdf3`)
- `assets/themes/persona/style.css:882` — `.persona-design .persona-tv .game-action-button → color: #fffdf3` (literal `#fffdf3`)
- `assets/themes/persona/style.css:936` — `.persona-design .tv-leg button → color: #fffdf3` (literal `#fffdf3`)
- `assets/themes/persona/style.css:951` — `.persona-design .persona-tv .game-action-button:hover:enabled, .persona-design .tv-leg button:hover:enabled → color: #fffdf3` (literal `#fffdf3`)

#### `#FFFEF9`

- `assets/themes/persona/style.css:46` — `:root, :root[data-theme="dark"] → --surface: #fffef9` (literal `#fffef9`)

#### `#FFFF00`

- `assets/css/site.css:608` — `.dk-overlay strong → color: #ffff00` (literal `#ffff00`)

#### `#FFFFFF`

- `assets/css/site.css:3` — `:root → --surface: #ffffff` (literal `#ffffff`)
- `assets/css/site.css:197` — `.theme-switch-thumb → background: #fff` (literal `#fff`)
- `assets/css/site.css:297` — `.achievement-badge → box-shadow: inset 0 1px 0 color-mix(in srgb, white 30%, transparent)` (literal `white`)
- `assets/js/imu-sandbox-game.js:31` — `const keyLight = new THREE.DirectionalLight(0xffffff, 3.3);` (literal `0xffffff`)
- `assets/js/imu-sandbox-game.js:100` — `new THREE.MeshBasicMaterial({ map: screenTexture, color: 0xffffff })` (literal `0xffffff`)
- `assets/js/laser-game.js:127` — `context.fillStyle = '#ffffff';` (literal `#ffffff`)
- `assets/js/laser-game.js:138` — `context.fillStyle = '#ffffff';` (literal `#ffffff`)
- `assets/themes/persona/style.css:95` — `.persona-design h2, .persona-design .laser-intro h1, .persona-design .game-start-button [data-start-label] → -webkit-text-stroke: 5px #fff` (literal `#fff`)
- `assets/themes/persona/style.css:181` — `.site-navigation a → -webkit-text-stroke: var(--menu-outline) #fff` (literal `#fff`)
- `assets/themes/persona/style.css:779` — `.persona-design .game-start-button:focus-visible → outline: 4px solid white` (literal `white`)
- `assets/themes/persona/style.css:790` — `.persona-design .game-start-prompt p → color: white` (literal `white`)

#### `currentcolor`

- `assets/css/site.css:214` — `.menu-icon, .menu-icon::before, .menu-icon::after → background: currentColor` (literal `currentColor`)
- `assets/css/site.css:240` — `.text-link::after → background: currentColor` (literal `currentColor`)
- `assets/css/site.css:387` — `.project-links .source-link::after → background: currentColor` (literal `currentColor`)
- `assets/css/site.css:503` — `.pause-symbol → border-left: 4px solid currentColor` (literal `currentColor`)
- `assets/css/site.css:503` — `.pause-symbol → border-right: 4px solid currentColor` (literal `currentColor`)
- `assets/css/site.css:504` — `.is-paused .pause-symbol → border-left: 13px solid currentColor` (literal `currentColor`)

#### `rgba(0,0,0,.55)`

- `assets/js/laser-game.js:69` — `context.fillStyle = 'rgba(0,0,0,.55)';` (literal `rgba(0,0,0,.55)`)

#### `rgba(0,0,0,0.02)`

- `assets/css/site.css:311` — `.project-card → box-shadow: 0 1px 0 rgba(0, 0, 0, 0.02)` (literal `rgba(0, 0, 0, 0.02)`)

#### `rgba(0,0,0,0.24)`

- `assets/css/site.css:211` — `48% → box-shadow: 0 0 0 5px color-mix(in srgb, var(--accent) 24%, transparent), 0 2px 8px rgba(0, 0, 0, 0.24)` (literal `rgba(0, 0, 0, 0.24)`)

#### `rgba(0,0,0,0.28)`

- `assets/css/site.css:198` — `.theme-switch-thumb → box-shadow: 0 1px 4px rgba(0, 0, 0, 0.28)` (literal `rgba(0, 0, 0, 0.28)`)

#### `rgba(0,0,0,0.3)`

- `assets/css/site.css:45` — `:root[data-theme="dark"] → --shadow: 0 14px 36px rgba(0, 0, 0, 0.3)` (literal `rgba(0, 0, 0, 0.3)`)

#### `rgba(0,0,0,0.38)`

- `assets/css/site.css:768` — `.imu-css-device → box-shadow: 0 26px 34px rgba(0, 0, 0, 0.38), inset 0 4px 0 #177668` (literal `rgba(0, 0, 0, 0.38)`)

#### `rgba(0,0,0,0.42)`

- `assets/css/site.css:46` — `:root[data-theme="dark"] → --shadow-raised: 0 24px 58px rgba(0, 0, 0, 0.42)` (literal `rgba(0, 0, 0, 0.42)`)

#### `rgba(0,0,0,0.84)`

- `assets/css/site.css:607` — `.dk-overlay → background: rgba(0, 0, 0, 0.84)` (literal `rgba(0, 0, 0, 0.84)`)

#### `rgba(220,239,235,0.2)`

- `assets/css/site.css:716` — `.imu-world-axes → border: 1px solid rgba(220, 239, 235, 0.2)` (literal `rgba(220, 239, 235, 0.2)`)

#### `rgba(232,99,99,0.12)`

- `assets/css/site.css:733` — `.imu-axis-x-ring → fill: rgba(232, 99, 99, 0.12)` (literal `rgba(232, 99, 99, 0.12)`)

#### `rgba(27,42,46,0.1)`

- `assets/css/site.css:15` — `:root → --shadow: 0 12px 30px rgba(27, 42, 46, 0.1)` (literal `rgba(27, 42, 46, 0.1)`)

#### `rgba(27,42,46,0.14)`

- `assets/css/site.css:16` — `:root → --shadow-raised: 0 22px 52px rgba(27, 42, 46, 0.14)` (literal `rgba(27, 42, 46, 0.14)`)

#### `rgba(6,12,12,0.76)`

- `assets/css/site.css:717` — `.imu-world-axes → background: rgba(6, 12, 12, 0.76)` (literal `rgba(6, 12, 12, 0.76)`)

#### `rgba(8,13,15,0.88)`

- `assets/css/site.css:549` — `.game-overlay → background-color: rgba(8, 13, 15, 0.88)` (literal `rgba(8, 13, 15, 0.88)`)

#### `rgba(8,8,8,.72)`

- `assets/css/site.css:557` — `.game-pause-overlay → background: rgba(8, 8, 8, .72)` (literal `rgba(8, 8, 8, .72)`)
- `assets/themes/persona/style.css:753` — `.persona-design .game-pause-overlay → background: rgba(8, 8, 8, .72)` (literal `rgba(8, 8, 8, .72)`)

#### `rgba(82,145,134,0.32)`

- `assets/css/site.css:745` — `.imu-css-stage::before, .imu-css-stage::after → background-image: linear-gradient(rgba(82, 145, 134, 0.32) 1px, transparent 1px), linear-gradient(90deg, rgba(82, 145, 134, 0.32) 1px, transparent 1px)` (literal `rgba(82, 145, 134, 0.32)`)
- `assets/css/site.css:746` — `.imu-css-stage::before, .imu-css-stage::after → background-image: linear-gradient(rgba(82, 145, 134, 0.32) 1px, transparent 1px), linear-gradient(90deg, rgba(82, 145, 134, 0.32) 1px, transparent 1px)` (literal `rgba(82, 145, 134, 0.32)`)

#### `rgba(85,130,122,0.12)`

- `assets/css/site.css:687` — `.imu-scene → background-image: linear-gradient(rgba(85, 130, 122, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(85, 130, 122, 0.12) 1px, transparent 1px)` (literal `rgba(85, 130, 122, 0.12)`)
- `assets/css/site.css:688` — `.imu-scene → background-image: linear-gradient(rgba(85, 130, 122, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(85, 130, 122, 0.12) 1px, transparent 1px)` (literal `rgba(85, 130, 122, 0.12)`)

#### `transparent`

- `assets/css/site.css:78` — `button, a → -webkit-tap-highlight-color: transparent` (literal `transparent`)
- `assets/css/site.css:211` — `48% → box-shadow: 0 0 0 5px color-mix(in srgb, var(--accent) 24%, transparent), 0 2px 8px rgba(0, 0, 0, 0.24)` (literal `transparent`)
- `assets/css/site.css:213` — `.icon-button → background: transparent` (literal `transparent`)
- `assets/css/site.css:297` — `.achievement-badge → box-shadow: inset 0 1px 0 color-mix(in srgb, white 30%, transparent)` (literal `transparent`)
- `assets/css/site.css:299` — `.achievement-badge::before → box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 14%, transparent)` (literal `transparent`)
- `assets/css/site.css:336` — `.project-media-placeholder → background-image: linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)` (literal `transparent`)
- `assets/css/site.css:336` — `.project-media-placeholder → background-image: linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)` (literal `transparent`)
- `assets/css/site.css:448` — `.case-study-prose pre code → background: transparent` (literal `transparent`)
- `assets/css/site.css:504` — `.is-paused .pause-symbol → border-top: 8px solid transparent` (literal `transparent`)
- `assets/css/site.css:504` — `.is-paused .pause-symbol → border-bottom: 8px solid transparent` (literal `transparent`)
- `assets/css/site.css:544` — `.keyboard-guide kbd → box-shadow: 0 1px 0 color-mix(in srgb, var(--text) 18%, transparent)` (literal `transparent`)
- `assets/css/site.css:583` — `.project-metrics > div → background: color-mix(in srgb, var(--surface) 58%, transparent)` (literal `transparent`)
- `assets/css/site.css:654` — `.imu-mode-control button, .imu-planet-control button, .imu-reset-button → background: transparent` (literal `transparent`)
- `assets/css/site.css:670` — `.imu-mode-control button::after, .imu-planet-control button::after → background: transparent` (literal `transparent`)
- `assets/css/site.css:687` — `.imu-scene → background-image: linear-gradient(rgba(85, 130, 122, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(85, 130, 122, 0.12) 1px, transparent 1px)` (literal `transparent`)
- `assets/css/site.css:688` — `.imu-scene → background-image: linear-gradient(rgba(85, 130, 122, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(85, 130, 122, 0.12) 1px, transparent 1px)` (literal `transparent`)
- `assets/css/site.css:745` — `.imu-css-stage::before, .imu-css-stage::after → background-image: linear-gradient(rgba(82, 145, 134, 0.32) 1px, transparent 1px), linear-gradient(90deg, rgba(82, 145, 134, 0.32) 1px, transparent 1px)` (literal `transparent`)
- `assets/css/site.css:746` — `.imu-css-stage::before, .imu-css-stage::after → background-image: linear-gradient(rgba(82, 145, 134, 0.32) 1px, transparent 1px), linear-gradient(90deg, rgba(82, 145, 134, 0.32) 1px, transparent 1px)` (literal `transparent`)
- `assets/css/site.css:782` — `.imu-css-pins → background: repeating-linear-gradient(90deg, #9aa7a5 0 7px, transparent 7px 13px)` (literal `transparent`)
- `assets/css/site.css:807` — `.site-identity:hover .identity-mark → box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 10%, transparent)` (literal `transparent`)
- `assets/css/site.css:808` — `.experience-item:hover → background: color-mix(in srgb, var(--surface) 58%, transparent)` (literal `transparent`)
- `assets/themes/persona/style.css:436` — `.collaborator-byline → background: transparent` (literal `transparent`)
- `assets/themes/persona/style.css:829` — `.tv-speaker → background: repeating-linear-gradient(0deg, transparent 0 3px, #8d969b 3px 5px)` (literal `transparent`)
- `assets/themes/persona/style.css:834` — `.persona-design .persona-tv .game-status-bar → background: transparent` (literal `transparent`)

### SVG artwork

18 distinct normalized expressions.

#### `#071314`

- `assets/images/site/profile-monogram.svg:7` — `<stop offset="1" stop-color="#071314"/>` (literal `#071314`)

#### `#0B1C1D`

- `assets/images/site/profile-monogram.svg:20` — `<circle cx="360" cy="450" r="238" fill="#0b1c1d" stroke="#53e5d1" stroke-width="4"/>` (literal `#0b1c1d`)

#### `#122A2B`

- `assets/images/site/profile-monogram.svg:6` — `<stop offset="0" stop-color="#122a2b"/>` (literal `#122a2b`)

#### `#26363B`

- `assets/images/placeholders/project-placeholder.svg:8` — `<text x="400" y="442" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#26363b">[PROJECT IMAGE PLACEHOLDER]</text>` (literal `#26363b`)

#### `#2C3D43`

- `assets/images/placeholders/portrait-placeholder.svg:7` — `<path d="M44 44h632v792H44z" fill="none" stroke="#2c3d43" stroke-width="3"/>` (literal `#2c3d43`)

#### `#2F444A`

- `assets/images/placeholders/project-placeholder.svg:7` — `<rect x="24" y="24" width="752" height="452" fill="none" stroke="#2f444a" stroke-width="3"/>` (literal `#2f444a`)

#### `#36D7C3`

- `assets/images/site/profile-monogram.svg:10` — `<stop offset="0" stop-color="#36d7c3" stop-opacity=".34"/>` (literal `#36d7c3`)
- `assets/images/site/profile-monogram.svg:11` — `<stop offset="1" stop-color="#36d7c3" stop-opacity="0"/>` (literal `#36d7c3`)

#### `#52656C`

- `assets/images/placeholders/portrait-placeholder.svg:6` — `<path d="M116 880c20-224 107-352 244-352s224 128 244 352" fill="#52656c"/>` (literal `#52656c`)

#### `#53E5D1`

- `assets/images/site/profile-monogram.svg:20` — `<circle cx="360" cy="450" r="238" fill="#0b1c1d" stroke="#53e5d1" stroke-width="4"/>` (literal `#53e5d1`)
- `assets/images/site/profile-monogram.svg:23` — `<path d="M236 592h248" stroke="#53e5d1" stroke-width="8"/>` (literal `#53e5d1`)

#### `#80969C`

- `assets/images/placeholders/project-placeholder.svg:5` — `<path d="M80 330l128-126 100 92 136-154 276 252H80z" fill="#80969c"/>` (literal `#80969c`)

#### `#86979D`

- `assets/images/placeholders/portrait-placeholder.svg:5` — `<circle cx="360" cy="318" r="142" fill="#86979d"/>` (literal `#86979d`)

#### `#A7FFF2`

- `assets/images/site/profile-monogram.svg:16` — `<g fill="none" stroke="#a7fff2" stroke-width="3" opacity=".18">` (literal `#a7fff2`)
- `assets/images/site/profile-monogram.svg:21` — `<circle cx="360" cy="450" r="214" fill="none" stroke="#a7fff2" stroke-width="1" opacity=".35"/>` (literal `#a7fff2`)
- `assets/images/site/profile-monogram.svg:24` — `<text x="360" y="646" fill="#a7fff2" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="600" letter-spacing="8" text-anchor="middle">ENGINEERING</text>` (literal `#a7fff2`)

#### `#DFE6E8`

- `assets/images/placeholders/portrait-placeholder.svg:4` — `<rect width="720" height="880" fill="#dfe6e8"/>` (literal `#dfe6e8`)

#### `#E7B24B`

- `assets/images/placeholders/project-placeholder.svg:6` — `<circle cx="634" cy="116" r="42" fill="#e7b24b"/>` (literal `#e7b24b`)

#### `#E7ECEC`

- `assets/images/placeholders/project-placeholder.svg:4` — `<rect width="800" height="500" fill="#e7ecec"/>` (literal `#e7ecec`)

#### `#EFFFFB`

- `assets/images/site/profile-monogram.svg:22` — `<text x="360" y="512" fill="#effffb" font-family="Arial, Helvetica, sans-serif" font-size="190" font-weight="700" letter-spacing="-20" text-anchor="middle">JY</text>` (literal `#effffb`)

#### `#FB7299`

- `assets/images/projects/bilibili/bilibili-preview.svg:5` — `<rect width="800" height="480" fill="#fb7299"/>` (literal `#fb7299`)

#### `#FFFFFF`

- `assets/images/placeholders/portrait-placeholder.svg:8` — `<text x="360" y="790" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#fff">[PORTRAIT PLACEHOLDER]</text>` (literal `#fff`)
- `assets/images/projects/bilibili/bilibili-preview.svg:6` — `<path fill="#fff" transform="translate(280 120) scale(10)" d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.37` (literal `#fff`)

### Asset generation tools

No CSS-style literal colors. Numeric RGBA palettes are listed in the appendix below.

### Bundled library

No fixed hex/rgb expressions matched in the minified library. Its decimal-encoded CSS color-name registry is listed below; these are parser capabilities, not colors selected by the site.

## Existing CSS variable consumers

These locations also use colors indirectly; the literal declarations above alone are not the complete set of application sites. Non-color custom properties are included for transparency.

### `--accent`

- `assets/css/site.css:169 — .site-navigation a::after`
- `assets/css/site.css:201 — .theme-switch[aria-checked="true"]`
- `assets/css/site.css:211 — 48%`
- `assets/css/site.css:287 — .achievement-badge`
- `assets/css/site.css:290 — .achievement-badge`
- `assets/css/site.css:299 — .achievement-badge::before`
- `assets/css/site.css:368 — .collaborator-icon`
- `assets/css/site.css:398 — .project-demo-link`
- `assets/css/site.css:400 — .project-demo-link`
- `assets/css/site.css:405 — .project-demo-link:hover, .project-demo-link:focus-visible`
- `assets/css/site.css:421 — .case-study-meta`
- `assets/css/site.css:439 — .case-study-prose li::marker`
- `assets/css/site.css:440 — .case-study-prose blockquote`
- `assets/css/site.css:501 — .game-action-button:hover, .control-group button:hover`
- `assets/css/site.css:606 — .dk-jump-button:hover`
- `assets/css/site.css:678 — .imu-mode-control button.is-active::after, .imu-planet-control button.is-active::after`
- `assets/css/site.css:802 — .imu-axis-control input`
- `assets/css/site.css:807 — .site-identity:hover .identity-mark`
- `assets/css/site.css:808 — .experience-item:hover`

### `--accent-strong`

- `assets/css/site.css:155 — .identity-mark`
- `assets/css/site.css:221 — .eyebrow, .section-index`
- `assets/css/site.css:251 — .text-link-primary`
- `assets/css/site.css:280 — .experience-heading p`
- `assets/css/site.css:291 — .achievement-badge`
- `assets/css/site.css:337 — .project-media-placeholder span`
- `assets/css/site.css:373 — .collaborator-byline a`
- `assets/css/site.css:401 — .project-demo-link`
- `assets/css/site.css:405 — .project-demo-link:hover, .project-demo-link:focus-visible`
- `assets/css/site.css:427 — .case-study-collaborators a`
- `assets/css/site.css:430 — .case-study-source`
- `assets/css/site.css:458 — .arrow-link`
- `assets/css/site.css:463 — .contact-email-link`
- `assets/css/site.css:465 — .contact-secondary-links a`
- `assets/css/site.css:483 — .game-heading-row .section-index`
- `assets/css/site.css:501 — .game-action-button:hover, .control-group button:hover`
- `assets/css/site.css:523 — .keyboard-guide > strong`
- `assets/css/site.css:584 — .project-metrics dt`
- `assets/css/site.css:606 — .dk-jump-button:hover`
- `assets/css/site.css:627 — .imu-demo-heading .section-index`
- `assets/css/site.css:635 — .imu-gravity-readout b`
- `assets/css/site.css:676 — .imu-mode-control button:hover, .imu-mode-control button.is-active, .imu-planet-control button:hover, .imu-planet-control button.is-active`
- `assets/css/site.css:680 — .imu-reset-button:hover`
- `assets/css/site.css:790 — .imu-axis-controls legend`
- `assets/css/site.css:806 — .site-identity:hover`

### `--focus`

- `assets/css/site.css:81 — button:focus-visible, a:focus-visible, canvas:focus-visible`

### `--header-bg`

- `assets/css/site.css:136 — .site-header`
- `assets/css/site.css:831 — .site-navigation`
- `assets/themes/persona/style.css:155 — .site-navigation`

### `--hud-height`

- `assets/themes/persona/style.css:151 — .site-navigation`
- `assets/themes/persona/style.css:561 — .persona-design`
- `assets/themes/persona/style.css:565 — html`

### `--letter-delay`

- `assets/themes/persona/style.css:505 — .kinetic-text:hover .kinetic-letter`
- `assets/themes/persona/style.css:511 — .kinetic-text:focus-visible .kinetic-letter`

### `--line`

- `assets/css/site.css:135 — .site-header`
- `assets/css/site.css:219 — .hero-section`
- `assets/css/site.css:255 — .page-section`
- `assets/css/site.css:274 — .experience-item`
- `assets/css/site.css:287 — .achievement-badge`
- `assets/css/site.css:309 — .project-card`
- `assets/css/site.css:336 — .project-media-placeholder`
- `assets/css/site.css:413 — .case-study-hero`
- `assets/css/site.css:419 — .case-study-hero-media figcaption`
- `assets/css/site.css:421 — .case-study-meta`
- `assets/css/site.css:429 — .case-study-tools li`
- `assets/css/site.css:434 — .case-study-prose h2`
- `assets/css/site.css:446 — .case-study-prose code`
- `assets/css/site.css:447 — .case-study-prose pre`
- `assets/css/site.css:450 — .case-study-prose th, .case-study-prose td`
- `assets/css/site.css:454 — .writing-item`
- `assets/css/site.css:458 — .arrow-link`
- `assets/css/site.css:473 — .laser-intro`
- `assets/css/site.css:507 — .game-status-bar > div`
- `assets/css/site.css:582 — .project-metrics`
- `assets/css/site.css:583 — .project-metrics > div`
- `assets/css/site.css:643 — .imu-toolbar`
- `assets/css/site.css:786 — .imu-axis-controls`
- `assets/css/site.css:830 — .site-navigation`
- `assets/css/site.css:839 — .site-navigation a`
- `assets/themes/persona/style.css:154 — .site-navigation`
- `assets/themes/persona/style.css:174 — .site-navigation a`
- `assets/themes/persona/style.css:336 — .page-section`

### `--line-strong`

- `assets/css/site.css:153 — .identity-mark`
- `assets/css/site.css:184 — .theme-switch`
- `assets/css/site.css:252 — .portrait-frame`
- `assets/css/site.css:263 — .tag-list li, .technology-list li`
- `assets/css/site.css:267 — .experience-list`
- `assets/css/site.css:337 — .project-media-placeholder span`
- `assets/css/site.css:353 — .collaborator-byline`
- `assets/css/site.css:417 — .case-study-hero-media`
- `assets/css/site.css:442 — .case-study-prose img`
- `assets/css/site.css:453 — .writing-list`
- `assets/css/site.css:491 — .game-action-button, .control-group button`
- `assets/css/site.css:506 — .game-status-bar`
- `assets/css/site.css:516 — .keyboard-guide`
- `assets/css/site.css:534 — .keyboard-guide kbd`
- `assets/css/site.css:546 — .imu-keyboard-guide`
- `assets/css/site.css:561 — .game-pause-overlay button`
- `assets/css/site.css:582 — .project-metrics`
- `assets/css/site.css:600 — .dk-jump-button`
- `assets/css/site.css:813 — .project-card:hover, html.reveal-enabled .project-card.is-revealed:hover`

### `--menu-font`

- `assets/themes/persona/style.css:175 — .site-navigation a`

### `--menu-font-size`

- `assets/themes/persona/style.css:176 — .site-navigation a`

### `--menu-outline`

- `assets/themes/persona/style.css:181 — .site-navigation a`

### `--motion-fast`

- `assets/css/site.css:147 — .site-identity`
- `assets/css/site.css:159 — .identity-mark`
- `assets/css/site.css:162 — .site-navigation a`
- `assets/css/site.css:245 — .text-link::after`
- `assets/css/site.css:313 — .project-card`
- `assets/css/site.css:380 — .project-links a`
- `assets/css/site.css:465 — .contact-secondary-links a`
- `assets/css/site.css:499 — .game-action-button, .control-group button, .dk-jump-button`
- `assets/css/site.css:658 — .imu-mode-control button, .imu-planet-control button, .imu-reset-button`

### `--motion-medium`

- `assets/css/site.css:120 — html.reveal-enabled .reveal-item`
- `assets/css/site.css:121 — html.reveal-enabled .reveal-item`
- `assets/css/site.css:159 — .identity-mark`
- `assets/css/site.css:173 — .site-navigation a::after`
- `assets/css/site.css:245 — .text-link::after`
- `assets/css/site.css:248 — .text-link > span`
- `assets/css/site.css:275 — .experience-item`
- `assets/css/site.css:313 — .project-card`
- `assets/css/site.css:323 — .project-card::after`
- `assets/css/site.css:391 — .project-links .source-link::after`
- `assets/css/site.css:404 — .project-demo-link span`

### `--page`

- `assets/css/site.css:109 — .skip-link`
- `assets/css/site.css:467 — .site-footer`
- `assets/css/site.css:479 — .laser-play-section`
- `assets/css/site.css:588 — .dk-play-section`
- `assets/css/site.css:611 — .imu-demo-section`
- `assets/css/site.css:68 — body`

### `--persona-ink`

- `assets/themes/persona/style.css:122 — .site-header`
- `assets/themes/persona/style.css:220 — .identity-mark`
- `assets/themes/persona/style.css:221 — .identity-mark`
- `assets/themes/persona/style.css:226 — .theme-switch`
- `assets/themes/persona/style.css:235 — .theme-switch-thumb`
- `assets/themes/persona/style.css:245 — .hero-section`
- `assets/themes/persona/style.css:246 — .hero-section`
- `assets/themes/persona/style.css:271 — .hero-role`
- `assets/themes/persona/style.css:277 — .hero-introduction`
- `assets/themes/persona/style.css:281 — .hero-section .eyebrow`
- `assets/themes/persona/style.css:286 — .hero-section .text-link`
- `assets/themes/persona/style.css:292 — .hero-links .text-link`
- `assets/themes/persona/style.css:293 — .hero-links .text-link`
- `assets/themes/persona/style.css:298 — .hero-links .text-link-primary`
- `assets/themes/persona/style.css:314 — .persona-monogram`
- `assets/themes/persona/style.css:316 — .persona-monogram`
- `assets/themes/persona/style.css:369 — .achievement-badge`
- `assets/themes/persona/style.css:37 — :root, :root[data-theme="dark"]`
- `assets/themes/persona/style.css:370 — .achievement-badge`
- `assets/themes/persona/style.css:371 — .achievement-badge`
- `assets/themes/persona/style.css:375 — .achievement-badge::before`
- `assets/themes/persona/style.css:392 — .project-card`
- `assets/themes/persona/style.css:409 — .project-media`
- `assets/themes/persona/style.css:413 — .project-demo-link`
- `assets/themes/persona/style.css:415 — .project-demo-link`
- `assets/themes/persona/style.css:416 — .project-demo-link`
- `assets/themes/persona/style.css:423 — .project-demo-link:hover, .project-demo-link:focus-visible`
- `assets/themes/persona/style.css:424 — .project-demo-link:hover, .project-demo-link:focus-visible`
- `assets/themes/persona/style.css:442 — .collaborator-icon`
- `assets/themes/persona/style.css:447 — .contact-section`
- `assets/themes/persona/style.css:452 — .contact-section a, .contact-section .section-index`
- `assets/themes/persona/style.css:48 — :root, :root[data-theme="dark"]`
- `assets/themes/persona/style.css:51 — :root, :root[data-theme="dark"]`
- `assets/themes/persona/style.css:54 — :root, :root[data-theme="dark"]`
- `assets/themes/persona/style.css:57 — :root, :root[data-theme="dark"]`
- `assets/themes/persona/style.css:580 — .persona-hud`
- `assets/themes/persona/style.css:581 — .persona-hud`
- `assets/themes/persona/style.css:601 — .persona-hud kbd`
- `assets/themes/persona/style.css:687 — .persona-monogram`
- `assets/themes/persona/style.css:742 — .persona-game-start`
- `assets/themes/persona/style.css:766 — .persona-design .game-start-button`
- `assets/themes/persona/style.css:768 — .persona-design .game-start-button`

### `--persona-paper`

- `assets/themes/persona/style.css:290 — .hero-links .text-link`
- `assets/themes/persona/style.css:299 — .hero-links .text-link-primary`
- `assets/themes/persona/style.css:313 — .persona-monogram`
- `assets/themes/persona/style.css:45 — :root, :root[data-theme="dark"]`
- `assets/themes/persona/style.css:55 — :root, :root[data-theme="dark"]`
- `assets/themes/persona/style.css:582 — .persona-hud`
- `assets/themes/persona/style.css:612 — .hud-home`

### `--persona-sky`

- `assets/themes/persona/style.css:222 — .identity-mark`
- `assets/themes/persona/style.css:227 — .theme-switch`
- `assets/themes/persona/style.css:254 — .hero-section::before`
- `assets/themes/persona/style.css:358 — .section-header h2::after, .two-column-section h2::after, .contact-layout h2::after`
- `assets/themes/persona/style.css:36 — :root, :root[data-theme="dark"]`
- `assets/themes/persona/style.css:382 — .tag-list li, .technology-list li`
- `assets/themes/persona/style.css:393 — .project-card`
- `assets/themes/persona/style.css:422 — .project-demo-link:hover, .project-demo-link:focus-visible`
- `assets/themes/persona/style.css:441 — .collaborator-icon`
- `assets/themes/persona/style.css:446 — .contact-section`
- `assets/themes/persona/style.css:602 — .persona-hud kbd`
- `assets/themes/persona/style.css:617 — .hud-home:hover, .hud-home:focus-visible`
- `assets/themes/persona/style.css:69 — :root[data-theme="dark"]`
- `assets/themes/persona/style.css:70 — :root[data-theme="dark"]`
- `assets/themes/persona/style.css:769 — .persona-design .game-start-button`

### `--persona-yellow`

- `assets/themes/persona/style.css:195 — .site-navigation a::after`
- `assets/themes/persona/style.css:219 — .identity-mark`
- `assets/themes/persona/style.css:231 — .theme-switch[aria-checked="true"]`
- `assets/themes/persona/style.css:244 — .hero-section`
- `assets/themes/persona/style.css:368 — .achievement-badge`
- `assets/themes/persona/style.css:38 — :root, :root[data-theme="dark"]`
- `assets/themes/persona/style.css:397 — .project-card::after`
- `assets/themes/persona/style.css:414 — .project-demo-link`
- `assets/themes/persona/style.css:456 — .contact-layout h2::after`
- `assets/themes/persona/style.css:467 — .laser-intro h1, .case-study-hero h1`
- `assets/themes/persona/style.css:600 — .persona-hud kbd`
- `assets/themes/persona/style.css:621 — .hud-home:focus-visible`
- `assets/themes/persona/style.css:72 — :root[data-theme="dark"]`
- `assets/themes/persona/style.css:767 — .persona-design .game-start-button`

### `--premium-ease`

- `assets/css/site.css:118 — html.reveal-enabled .reveal-item`
- `assets/css/site.css:119 — html.reveal-enabled .reveal-item`
- `assets/css/site.css:121 — html.reveal-enabled .reveal-item`
- `assets/css/site.css:173 — .site-navigation a::after`
- `assets/css/site.css:245 — .text-link::after`
- `assets/css/site.css:248 — .text-link > span`
- `assets/css/site.css:313 — .project-card`
- `assets/css/site.css:323 — .project-card::after`
- `assets/css/site.css:334 — .project-media img`
- `assets/css/site.css:380 — .project-links a`
- `assets/css/site.css:391 — .project-links .source-link::after`
- `assets/css/site.css:404 — .project-demo-link span`
- `assets/css/site.css:499 — .game-action-button, .control-group button, .dk-jump-button`
- `assets/css/site.css:658 — .imu-mode-control button, .imu-planet-control button, .imu-reset-button`
- `assets/css/site.css:837 — .site-navigation`
- `assets/themes/persona/style.css:161 — .site-navigation`

### `--result-art`

- `assets/css/site.css:549 — .game-overlay`

### `--reveal-delay`

- `assets/css/site.css:118 — html.reveal-enabled .reveal-item`
- `assets/css/site.css:119 — html.reveal-enabled .reveal-item`

### `--shadow`

- `assets/css/site.css:832 — .site-navigation`
- `assets/themes/persona/style.css:156 — .site-navigation`

### `--shadow-raised`

- `assets/css/site.css:319 — .project-card::after`

### `--signal`

- `assets/css/site.css:222 — .hero-role`

### `--surface`

- `assets/css/site.css:154 — .identity-mark`
- `assets/css/site.css:290 — .achievement-badge`
- `assets/css/site.css:310 — .project-card`
- `assets/css/site.css:337 — .project-media-placeholder span`
- `assets/css/site.css:369 — .collaborator-icon`
- `assets/css/site.css:400 — .project-demo-link`
- `assets/css/site.css:405 — .project-demo-link:hover, .project-demo-link:focus-visible`
- `assets/css/site.css:460 — .contact-section`
- `assets/css/site.css:492 — .game-action-button, .control-group button`
- `assets/css/site.css:506 — .game-status-bar`
- `assets/css/site.css:537 — .keyboard-guide kbd`
- `assets/css/site.css:562 — .game-pause-overlay button`
- `assets/css/site.css:583 — .project-metrics > div`
- `assets/css/site.css:601 — .dk-jump-button`
- `assets/css/site.css:808 — .experience-item:hover`

### `--surface-muted`

- `assets/css/site.css:252 — .portrait-frame`
- `assets/css/site.css:256 — .section-muted`
- `assets/css/site.css:356 — .collaborator-byline`
- `assets/css/site.css:417 — .case-study-hero-media`
- `assets/css/site.css:442 — .case-study-prose img`
- `assets/css/site.css:446 — .case-study-prose code`
- `assets/css/site.css:447 — .case-study-prose pre`
- `assets/css/site.css:518 — .keyboard-guide`
- `assets/themes/persona/style.css:363 — .section-muted`
- `assets/themes/persona/style.css:461 — .laser-intro, .case-study-hero`

### `--text`

- `assets/css/site.css:108 — .skip-link`
- `assets/css/site.css:175 — .site-navigation a:hover`
- `assets/css/site.css:213 — .icon-button`
- `assets/css/site.css:278 — .experience-meta time`
- `assets/css/site.css:433 — .case-study-prose h2, .case-study-prose h3, .case-study-prose h4`
- `assets/css/site.css:440 — .case-study-prose blockquote`
- `assets/css/site.css:451 — .case-study-prose th`
- `assets/css/site.css:466 — .contact-email-link:hover, .contact-secondary-links a:hover`
- `assets/css/site.css:467 — .site-footer`
- `assets/css/site.css:479 — .laser-play-section`
- `assets/css/site.css:493 — .game-action-button, .control-group button`
- `assets/css/site.css:538 — .keyboard-guide kbd`
- `assets/css/site.css:544 — .keyboard-guide kbd`
- `assets/css/site.css:563 — .game-pause-overlay button`
- `assets/css/site.css:586 — .laser-notes .section-body > h3`
- `assets/css/site.css:602 — .dk-jump-button`
- `assets/css/site.css:611 — .imu-demo-section`
- `assets/css/site.css:69 — body`
- `assets/css/site.css:801 — .imu-axis-control output`
- `assets/themes/persona/style.css:340 — .section-index`

### `--text-muted`

- `assets/css/site.css:162 — .site-navigation a`
- `assets/css/site.css:178 — .theme-label`
- `assets/css/site.css:223 — .hero-introduction`
- `assets/css/site.css:259 — .prose`
- `assets/css/site.css:263 — .tag-list li, .technology-list li`
- `assets/css/site.css:265 — .section-header > p`
- `assets/css/site.css:277 — .experience-meta`
- `assets/css/site.css:300 — .experience-content ul`
- `assets/css/site.css:336 — .project-media-placeholder`
- `assets/css/site.css:341 — .project-content > p`
- `assets/css/site.css:357 — .collaborator-byline`
- `assets/css/site.css:378 — .project-content > .collaborator-byline`
- `assets/css/site.css:407 — .source-link`
- `assets/css/site.css:409 — .source-link-pending small`
- `assets/css/site.css:410 — .project-draft-label`
- `assets/css/site.css:416 — .case-study-summary`
- `assets/css/site.css:419 — .case-study-hero-media figcaption`
- `assets/css/site.css:424 — .case-study-meta dt`
- `assets/css/site.css:429 — .case-study-tools li`
- `assets/css/site.css:431 — .case-study-prose`
- `assets/css/site.css:445 — .case-study-prose em.image-caption`
- `assets/css/site.css:455 — .writing-meta`
- `assets/css/site.css:457 — .writing-item p`
- `assets/css/site.css:471 — .error-section p:not(.eyebrow)`
- `assets/css/site.css:478 — .laser-objective`
- `assets/css/site.css:509 — .game-status-bar span`
- `assets/css/site.css:519 — .keyboard-guide`
- `assets/css/site.css:573 — .game-message`
- `assets/css/site.css:576 — .game-implementation-note`
- `assets/css/site.css:581 — .laser-notes .section-body > p`
- `assets/css/site.css:585 — .project-metrics dd`
- `assets/css/site.css:632 — .imu-mode-readout > span, .imu-gravity-readout > span`
- `assets/css/site.css:636 — .imu-gravity-readout small`
- `assets/css/site.css:646 — .imu-toolbar-group > span`
- `assets/css/site.css:655 — .imu-mode-control button, .imu-planet-control button, .imu-reset-button`
- `assets/css/site.css:662 — .imu-planet-control button small`
- `assets/css/site.css:797 — .imu-axis-control`

### `--theme-duration`

- `assets/css/site.css:188 — .theme-switch`
- `assets/css/site.css:199 — .theme-switch-thumb`
- `assets/css/site.css:205 — html.theme-transition .theme-switch-thumb`
- `assets/css/site.css:208 — .theme-switch.is-changing .theme-switch-thumb`
- `assets/css/site.css:57 — html.theme-transition body, html.theme-transition body *, html.theme-transition body *::before, html.theme-transition body *::after`

### `--theme-ease`

- `assets/css/site.css:188 — .theme-switch`
- `assets/css/site.css:199 — .theme-switch-thumb`
- `assets/css/site.css:208 — .theme-switch.is-changing .theme-switch-thumb`
- `assets/css/site.css:58 — html.theme-transition body, html.theme-transition body *, html.theme-transition body *::before, html.theme-transition body *::after`

### `--type-body-letter-spacing`

- `assets/css/site.css:74 — body`

### `--type-body-line-height`

- `assets/css/site.css:73 — body`

### `--type-body-weight`

- `assets/css/site.css:72 — body`

### `--type-project-letter-spacing`

- `assets/css/site.css:343 — .project-content > p`
- `assets/css/site.css:431 — .case-study-prose`
- `assets/css/site.css:478 — .laser-objective`
- `assets/css/site.css:581 — .laser-notes .section-body > p`

### `--type-project-line-height`

- `assets/css/site.css:259 — .prose`
- `assets/css/site.css:344 — .project-content > p`
- `assets/css/site.css:477 — .laser-description`
- `assets/css/site.css:478 — .laser-objective`
- `assets/css/site.css:581 — .laser-notes .section-body > p`

### `--type-project-weight`

- `assets/css/site.css:342 — .project-content > p`
- `assets/css/site.css:431 — .case-study-prose`
- `assets/css/site.css:477 — .laser-description`
- `assets/css/site.css:478 — .laser-objective`
- `assets/css/site.css:581 — .laser-notes .section-body > p`

### `--wipe-first`

- `assets/themes/persona/style.css:535 — .page-wipe i`

### `--wipe-second`

- `assets/themes/persona/style.css:539 — .page-wipe i:nth-child(2)`

### `--wipe-third`

- `assets/themes/persona/style.css:543 — .page-wipe i:nth-child(3)`

## Migration verification plan

- Put all approved literal palette declarations in one variable stylesheet; reference semantic variables everywhere in authored UI.
- Read CSS custom properties into canvas/WebGL renderers where UI colors are currently JavaScript literals; SVG presentation attributes can reference variables.
- Preserve numeric bit masks and library color-name parsers: they are not independently designed UI colors. List remaining bundled-library matches separately rather than changing third-party library semantics.
- Asset converters encode RGBA pixel arrays and RGB565/FPGA palette data as well as color strings; grep alone cannot establish a four-color raster artwork palette. Flag these separately if retained.
- After implementation, scan hex, rgb/rgba, hsl/hsla, named colors, and JS numeric colors outside the variable file, then rebuild and check generated output.
- Day theme values and any contrast exception require user confirmation before implementation.

## Packed pixel colors and numeric artwork palettes

- `assets/js/imu-sandbox-game.js:164`, `assets/js/imu-sandbox-fallback.js:94`: `0xff0f1100` is RGBA `#00110F` on the little-endian rendering path (OLED background).
- `assets/js/imu-sandbox-game.js:166`, `assets/js/imu-sandbox-fallback.js:96`: `0xfff7ffb8` is RGBA `#B8FFF7` (OLED particles); this adds one authored color absent from the CSS-style literal inventory.

- `#00000400` RGBA — `tools/convert-laser-assets.mjs` lines 128.
- `#FFFFFFFF` RGBA — `tools/convert-laser-assets.mjs` lines 136, 137, 141, 142, 149, 201, 202.
- `#7B7D7BFF` RGBA — `tools/convert-laser-assets.mjs` lines 150.
- `#F1C654FF` RGBA — `tools/convert-laser-assets.mjs` lines 192, 193, 194, 195.
- `#49E0D7FF` RGBA — `tools/convert-laser-assets.mjs` lines 199.
- `#000000FF` RGBA — `tools/convert-donkey-kong-assets.mjs` lines 9.
- `#0000FFFF` RGBA — `tools/convert-donkey-kong-assets.mjs` lines 9.
- `#00FF00FF` RGBA — `tools/convert-donkey-kong-assets.mjs` lines 9.
- `#00FFFFFF` RGBA — `tools/convert-donkey-kong-assets.mjs` lines 9.
- `#FF0000FF` RGBA — `tools/convert-donkey-kong-assets.mjs` lines 10.
- `#FF00FFFF` RGBA — `tools/convert-donkey-kong-assets.mjs` lines 10.
- `#FFFF00FF` RGBA — `tools/convert-donkey-kong-assets.mjs` lines 10.
- `#FFFFFFFF` RGBA — `tools/convert-donkey-kong-assets.mjs` lines 10.

Donkey Kong’s converter uses an eight-color FPGA palette. The Laser converter also imports source RGB565 pixels; those generated image colors cannot be enumerated by CSS grep.

## Bundled Three.js named-color registry (not applied UI)

All entries are at `assets/vendor/three.core.min.js:6`. Preserve this parser data when consolidating authored styles.

| Name | Encoded color |
| --- | --- |
| aliceblue | `#F0F8FF` |
| antiquewhite | `#FAEBD7` |
| aqua | `#00FFFF` |
| aquamarine | `#7FFFD4` |
| azure | `#F0FFFF` |
| beige | `#F5F5DC` |
| bisque | `#FFE4C4` |
| black | `#000000` |
| blanchedalmond | `#FFEBCD` |
| blue | `#0000FF` |
| blueviolet | `#8A2BE2` |
| brown | `#A52A2A` |
| burlywood | `#DEB887` |
| cadetblue | `#5F9EA0` |
| chartreuse | `#7FFF00` |
| chocolate | `#D2691E` |
| coral | `#FF7F50` |
| cornflowerblue | `#6495ED` |
| cornsilk | `#FFF8DC` |
| crimson | `#DC143C` |
| cyan | `#00FFFF` |
| darkblue | `#00008B` |
| darkcyan | `#008B8B` |
| darkgoldenrod | `#B8860B` |
| darkgray | `#A9A9A9` |
| darkgreen | `#006400` |
| darkgrey | `#A9A9A9` |
| darkkhaki | `#BDB76B` |
| darkmagenta | `#8B008B` |
| darkolivegreen | `#556B2F` |
| darkorange | `#FF8C00` |
| darkorchid | `#9932CC` |
| darkred | `#8B0000` |
| darksalmon | `#E9967A` |
| darkseagreen | `#8FBC8F` |
| darkslateblue | `#483D8B` |
| darkslategray | `#2F4F4F` |
| darkslategrey | `#2F4F4F` |
| darkturquoise | `#00CED1` |
| darkviolet | `#9400D3` |
| deeppink | `#FF1493` |
| deepskyblue | `#00BFFF` |
| dimgray | `#696969` |
| dimgrey | `#696969` |
| dodgerblue | `#1E90FF` |
| firebrick | `#B22222` |
| floralwhite | `#FFFAF0` |
| forestgreen | `#228B22` |
| fuchsia | `#FF00FF` |
| gainsboro | `#DCDCDC` |
| ghostwhite | `#F8F8FF` |
| gold | `#FFD700` |
| goldenrod | `#DAA520` |
| gray | `#808080` |
| green | `#008000` |
| greenyellow | `#ADFF2F` |
| grey | `#808080` |
| honeydew | `#F0FFF0` |
| hotpink | `#FF69B4` |
| indianred | `#CD5C5C` |
| indigo | `#4B0082` |
| ivory | `#FFFFF0` |
| khaki | `#F0E68C` |
| lavender | `#E6E6FA` |
| lavenderblush | `#FFF0F5` |
| lawngreen | `#7CFC00` |
| lemonchiffon | `#FFFACD` |
| lightblue | `#ADD8E6` |
| lightcoral | `#F08080` |
| lightcyan | `#E0FFFF` |
| lightgoldenrodyellow | `#FAFAD2` |
| lightgray | `#D3D3D3` |
| lightgreen | `#90EE90` |
| lightgrey | `#D3D3D3` |
| lightpink | `#FFB6C1` |
| lightsalmon | `#FFA07A` |
| lightseagreen | `#20B2AA` |
| lightskyblue | `#87CEFA` |
| lightslategray | `#778899` |
| lightslategrey | `#778899` |
| lightsteelblue | `#B0C4DE` |
| lightyellow | `#FFFFE0` |
| lime | `#00FF00` |
| limegreen | `#32CD32` |
| linen | `#FAF0E6` |
| magenta | `#FF00FF` |
| maroon | `#800000` |
| mediumaquamarine | `#66CDAA` |
| mediumblue | `#0000CD` |
| mediumorchid | `#BA55D3` |
| mediumpurple | `#9370DB` |
| mediumseagreen | `#3CB371` |
| mediumslateblue | `#7B68EE` |
| mediumspringgreen | `#00FA9A` |
| mediumturquoise | `#48D1CC` |
| mediumvioletred | `#C71585` |
| midnightblue | `#191970` |
| mintcream | `#F5FFFA` |
| mistyrose | `#FFE4E1` |
| moccasin | `#FFE4B5` |
| navajowhite | `#FFDEAD` |
| navy | `#000080` |
| oldlace | `#FDF5E6` |
| olive | `#808000` |
| olivedrab | `#6B8E23` |
| orange | `#FFA500` |
| orangered | `#FF4500` |
| orchid | `#DA70D6` |
| palegoldenrod | `#EEE8AA` |
| palegreen | `#98FB98` |
| paleturquoise | `#AFEEEE` |
| palevioletred | `#DB7093` |
| papayawhip | `#FFEFD5` |
| peachpuff | `#FFDAB9` |
| peru | `#CD853F` |
| pink | `#FFC0CB` |
| plum | `#DDA0DD` |
| powderblue | `#B0E0E6` |
| purple | `#800080` |
| rebeccapurple | `#663399` |
| red | `#FF0000` |
| rosybrown | `#BC8F8F` |
| royalblue | `#4169E1` |
| saddlebrown | `#8B4513` |
| salmon | `#FA8072` |
| sandybrown | `#F4A460` |
| seagreen | `#2E8B57` |
| seashell | `#FFF5EE` |
| sienna | `#A0522D` |
| silver | `#C0C0C0` |
| skyblue | `#87CEEB` |
| slateblue | `#6A5ACD` |
| slategray | `#708090` |
| slategrey | `#708090` |
| snow | `#FFFAFA` |
| springgreen | `#00FF7F` |
| steelblue | `#4682B4` |
| tan | `#D2B48C` |
| teal | `#008080` |
| thistle | `#D8BFD8` |
| tomato | `#FF6347` |
| turquoise | `#40E0D0` |
| violet | `#EE82EE` |
| wheat | `#F5DEB3` |
| white | `#FFFFFF` |
| whitesmoke | `#F5F5F5` |
| yellow | `#FFFF00` |
| yellowgreen | `#9ACD32` |

## Day-theme proposal — pending approval

| Role | Night | Proposed day |
| --- | --- | --- |
| Outer field | `#FFF000` | `#F5F0D8` warm parchment |
| Main panel | `#4B4A30` | `#FFFAE8` light cream |
| Panel border | `#DDB800` | `#DDB800` |
| Button fill / divider / hard shadow | `#FFF000` | `#FFF000` |
| Disabled/inactive | `#62614C` | `#A7A58C` muted light olive |
| Body text / button labels | Yellow on olive; olive on yellow | `#4B4A30` |

Yellow text on cream has insufficient contrast. Proposed day-only heading treatment: dark olive fill with yellow divider, retaining the current section-heading font and removing its white outline. Night headings remain solid yellow. This exception requires approval. Wide font assets remain available for future use. No typography, colors, or layout have been changed by this audit.
