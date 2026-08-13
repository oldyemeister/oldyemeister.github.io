# Website Maintenance Guide for AI Agents

This document is the internal source of truth for future AI-assisted changes. The `docs/` directory is excluded from the Jekyll website. Do not link this document from public site pages.

## Non-negotiable constraints

1. Keep all editable portfolio copy, links, labels, and media paths in `_data/content.yml`.
2. Do not move, rewrite, format, or delete anything under `demos/` unless the user explicitly requests changes to an original project.
3. `demos/Laser_Puzzle/` contains the CPUlator C laser puzzle, `demos/DonkeyKong/` contains the Verilog/Quartus game, and `demos/imu_sandbox_stm32/` contains the STM32 HAL/C project.
4. Keep `demos/` in `.gitignore`, and keep `demos/`, `docs/`, `tools/`, and `test/` in `_config.yml` exclusions so GitHub Pages does not publish them.
5. Preserve accessibility behavior: semantic landmarks, keyboard focus, switch state, Canvas labels, reduced motion, and touch controls.
6. Keep the root `README.md` public-facing. Put maintenance procedures and AI-specific context in this document.

## Architecture

- `_data/content.yml`: only file a non-developer should need to edit for portfolio content.
- `_layouts/default.html`: shared document shell, metadata, early theme initialization, and scripts.
- `_includes/`: shared navigation and footer.
- `index.html`: content-driven portfolio sections.
- `projects/laser/index.html`: live puzzle page and its editable text bindings.
- `projects/donkey-kong/index.html`: live FPGA platform game page and editable text bindings.
- `projects/imu-sandbox/index.html`: interactive 3D OLED page and editable text bindings.
- `assets/css/site.css`: responsive layout and light/dark design tokens.
- `assets/js/site.js`: theme persistence and mobile navigation.
- `assets/js/laser-engine.js`: pure puzzle state, ray tracing, target progress, cooldown, timer, and lives.
- `assets/js/laser-game.js`: Canvas renderer, browser controls, HUD, and animation loop.
- `assets/js/donkey-kong-engine.js`: pure fixed-step movement, jump, barrel, collision, and win rules.
- `assets/js/donkey-kong-game.js`: MIF-derived Canvas renderer and keyboard/touch controller.
- `assets/js/imu-sandbox-engine.js`: firmware-derived fixed-point particle modes, bit-grid collision, gravity detection, and Euler orientation state.
- `assets/js/imu-sandbox-bootstrap.js`: cache-busted module startup, independent slider readouts, and visible load-error handling.
- `assets/js/imu-sandbox-fallback.js`: Canvas and CSS 3D compatibility renderer used when Three.js or WebGL cannot start.
- `assets/js/imu-sandbox-game.js`: Three.js OLED model, CanvasTexture display, direct manipulation, and controls.
- `assets/vendor/three.module.min.js` and `three.core.min.js`: pinned local Three.js 0.185.1 runtime; keep versions matched.
- `tools/convert-laser-assets.mjs`: extracts owned RGB565 arrays from the original C source and generates browser PNGs.
- `tools/convert-donkey-kong-assets.mjs`: converts original 3-bit Quartus MIF memories into browser PNGs.
- `tools/preview-build.mjs`: dependency-free local renderer used when Jekyll is unavailable.
- `test/laser-engine.test.mjs`: Node test coverage for puzzle rules.
- `test/imu-sandbox-engine.test.mjs`: Node test coverage for modes, pose limits, and OLED bounds.

## Content changes

Edit `_data/content.yml` without renaming existing keys. Preserve YAML indentation and quote bracketed placeholders.

To add a project or writing item:

1. Copy an existing list entry at the same indentation level.
2. Replace every field, including image alternative text and destination URLs.
3. Store local media under `assets/images/` and use a root-relative path such as `/assets/images/example.png`.
4. Run `npm run preview:build` and inspect desktop and mobile layouts.

Do not move editable prose into templates. Fixed application mechanics and accessibility labels may remain in code when they are not personal content.

## Theme behavior

The early inline script in `_layouts/default.html` selects a theme before CSS paints. `assets/js/site.js` synchronizes the switch, stores explicit choices in `localStorage`, and follows `prefers-color-scheme` until the user chooses a theme.

User-triggered changes temporarily add `theme-transition` to the root for 420 ms. CSS transitions only color, background-color, border-color, outline-color, box-shadow, fill, and stroke; do not replace this with `transition: all`. The toggle thumb uses a synchronized scale/glow animation. Initial theme setup and system-preference changes do not add the class, preventing a wrong-theme flash. Reduced-motion users bypass the animation in JavaScript, with the CSS media query retained as a second safeguard.

`site-theme-change` includes `theme`, `animated`, and `duration` in its event detail. Interactive project shells follow the site theme through semantic CSS variables, but gameplay screens remain theme-invariant for visual consistency. Do not attach Canvas, WebGL, or OLED renderers to this event. The Laser and Donkey Kong canvases and the IMU scene must retain their fixed palettes in both site themes.

When adding colors:

- Define semantic custom properties for both themes.
- Verify focus contrast and readable muted text.
- Avoid hard-coded page colors outside self-contained game surfaces.
- Dispatch or listen for `site-theme-change` when a Canvas-rendered element must redraw.

## Laser puzzle rules

The board uses a fixed 320x240 coordinate system and scales responsively through CSS.

- 13 mirrors rotate in 45-degree increments.
- Six blue nodes must be destroyed.
- Four red firewalls are hazards; destroying two consumes both lives and ends the game.
- The timer begins at 120 seconds.
- Targets require 1.5 seconds of continuous contact: `HIT_THRESHOLD / CHARGE_RATE`.
- Leaving a partially charged target starts `CHARGE_COOLDOWN`, currently 0.5 seconds.
- After cooldown, progress drains at `DECAY_RATE`, currently 24 units per second.
- Pausing freezes the timer, charge, and decay.

Keep collision geometry independent from artwork pixels. If rules change, update `laser-engine.js` first, then its tests, then rendering.

The timer and life count intentionally appear both in the accessible status bar and inside the Canvas board. Do not remove either representation.

Match the original C HUD coordinates exactly. The timer uses seven-segment digits at `(210,18)`, `(222,18)`, and `(230,18)`, with colon pixels at `(218,22)` and `(218,26)`. Lives uses one digit at `(265,18)`. The colored display areas are part of the background artwork; never draw replacement rectangles or text labels over them.

Mirror coordinates and angles come directly from the `mirrors` array in the C source. The original angle convention is: `0/180` vertical, `90/270` horizontal, `45/225` rising `/`, and `135/315` falling `\`. Rendering must reproduce `draw_mirror()` rather than using a generic trigonometric line that may reverse the diagonal families.

The laser starts at the original integer framebuffer coordinate `(84,81)`. Render every traced coordinate with a one-pixel `fillRect`; do not replace it with a stroked Canvas path, fractional line width, or shadow because Canvas centers strokes between framebuffer pixels. Diagonal mirror collision uses the original `abs(dx) <= 3` and `abs(dy) <= 3` bounds. When the ray first touches a mirror, it advances one additional incoming pixel if that step is closer to the mirror's geometric center, and reflects from that centered coordinate.

## Laser artwork and project preview

Run the converter after changes to the original owned artwork:

```sh
npm run assets:laser
```

The converter reads `demos/Laser_Puzzle/Laser_Puzzle_CPUlator.c` and writes:

- `laser-background.png`
- `laser-bluenode.png`
- `laser-firewall.png`
- `laser-success.png`
- `laser-failure.png`
- `laser-preview.png`

`laser-preview.png` is the populated Selected Projects image. It must show the mirrors, nodes, firewalls, laser, timer, and lives; do not replace it with the bare background image.

## Donkey Kong FPGA recreation

The browser version follows `demos/DonkeyKong/drawmario.v`, not the older copy under `gamelogic1121/`. The active ROM declarations identify these source assets:

- `map320magenta.mif`: 320x240 background and magenta collision pixels
- `mariorunninggreen.mif`: 16x16 player sprite with green transparency
- `barrel.mif`: 12x12 barrel sprite with green transparency
- `youwin.mif`: original 32x32 win sprite, retained as reference

Run `npm run assets:donkey-kong` after changing those memories. The converter writes `donkey-kong-background.png`, `donkey-kong-mario.png`, `donkey-kong-barrel.png`, `donkey-kong-win.png`, and the populated `donkey-kong-preview.png`. Never hand-edit generated files when the MIF source should change.

The generated web win graphic intentionally replaces the small MIF sprite and reads `You Win!!!`. It is built by the converter rather than modifying the original hardware asset.

The engine uses a fixed 48 Hz step to approximate the Verilog counter cadence. It preserves the 16x16 player, 12x12 barrels, starting coordinates, direction locking during jumps, alternating barrel directions by platform height, second-barrel spawn, and the win trigger at x 121-126 above y 51. Browser playability adjustments set Mario's horizontal speed to two pixels per tick, keep barrels at one horizontal pixel per tick, and raise the jump to 44 pixels at two vertical pixels per tick. Movement across slopes and upward movement against ceilings are swept one pixel at a time, preventing skipped magenta collision pixels. Each barrel stores horizontal rolling distance and is rendered around the geometric center of its 12x12 sprite. Rotation is restricted to 0, 90, 180, and 270 degrees, advancing every four pixels and reversing with travel direction; right-angle transforms preserve the pixel border. Barrel collisions use the central 6x6 pixels of the sprite, so visual edge contact is safe. A hit respawns only Mario and grants 24 ticks of collision grace while both barrels continue their routes and rotations. Exact platform-height gaps in the Verilog barrel branches are normalized into explicit stages so a barrel landing at y 95, 140, or 190 cannot stop permanently. The page intentionally does not add a timer, score, or lives because they are absent from the active hardware design.

At runtime, the engine creates its collision mask from magenta pixels in the generated background. Keep game rules in `donkey-kong-engine.js`; keep image loading, Canvas drawing, and input handling in `donkey-kong-game.js`.

## STM32 IMU Sandbox recreation

Use `demos/imu_sandbox_stm32/Core/Src/main.c` and `sand.c` as the behavioral references. The active firmware uses a BNO055 in NDOF mode, two 128x64 SSD1306 displays, and four modes: Normal, Wind, Shake, and Explosion. Vortex is commented out and must not be exposed unless the firmware is changed first. The first OLED displays particles; the second displays material, mode, planet, and gravity status.

The web version intentionally demonstrates only the particle OLED. It uses the firmware maximum of 3,000 one-pixel sand particles, Q8 positions and velocities, damping 253/256, maximum velocity 6 pixels per update, and the original 1,024-byte bit-packed occupancy grid. It follows the original direct-destination collision test, gravity-relative diagonal slide candidates, and parity-based alternation of the first slide direction. The OLED is centered at the world origin in the vertical Y-Z plane, with pixel X along world +Y and pixel-up along world +Z. Base gravity is fixed to world-space negative Z and the inverse of the rendered Z-Y-X pose projects it into OLED-local coordinates; OLED-local Y is inverted because pixel rows increase downward. Roll changes the projected direction, Pitch changes its in-plane magnitude, and Yaw cannot affect it because it rotates around the gravity axis. The magnitude selector reproduces the firmware potentiometer's Moon (0.16g), Earth (1.00g), and Jupiter (2.50g) choices, using the firmware's `GRAVITY_MAG * gravity_scale` calculation and component clamp. Wind selects one of the original eight fixed biases, Shake uses a `3 * 256` random impulse, and Explosion applies strength 700 every three seconds around an active particle.

The firmware caps the full loop near 30 FPS because each SSD1306 framebuffer is transferred over I2C. The browser has no I2C transfer and advances the same particle algorithm at a fixed 60 updates per second through an accumulator inside `requestAnimationFrame`. Do not make physics depend directly on monitor refresh rate.

The Three.js scene must remain self-contained and static-hosting compatible. Do not replace the local imports with a CDN URL. If its module graph or WebGL context fails, `imu-sandbox-bootstrap.js` starts the CSS 3D compatibility renderer so the project remains usable in embedded and restricted browsers. Both renderers import the same engine and standard IMU axis presentation: Roll rotates around X, Pitch around Y, and Yaw around Z, composed in Z-Y-X order. The OLED is centered at `(0, 0, 0)` in the Y-Z plane, its front faces +X, the camera looks toward the origin from +X with +Z as camera-up, and the ground is parallel to X-Y. Pointer drag changes Yaw/Pitch, Q/E changes Roll, Arrow keys change Pitch/Yaw, and Space cycles modes. Gravity must remain fixed at world-space negative Z and be transformed into OLED-local coordinates using the inverse of that same rendered pose. Yaw must not change the projected gravity. Keep the corner axis gizmo synchronized with these conventions and both display canvases exactly 128x64 with nearest-neighbor rendering.

`imu-sandbox-preview.png` is a capture of the actual 3D scene. Regenerate it from the live scene if the model changes. Do not substitute a generic electronics image.

## Verification workflow

Run before completing any change:

```sh
npm run assets:laser
npm run assets:donkey-kong
npm test
npm run preview:build
node --check assets/js/site.js
node --check assets/js/laser-engine.js
node --check assets/js/laser-game.js
node --check assets/js/donkey-kong-engine.js
node --check assets/js/donkey-kong-game.js
node --check assets/js/imu-sandbox-engine.js
node --check assets/js/imu-sandbox-game.js
```

Then serve `/private/tmp/personal-website-preview` locally and inspect:

- Homepage at desktop and mobile widths
- Selected Projects preview contents
- Laser board framing and nonblank Canvas pixels
- Donkey Kong board framing, controls, sprite loading, and nonblank Canvas pixels
- IMU Sandbox desktop/mobile framing, nonblank WebGL/fallback pixels, negative-Z world gravity projected through representative Pitch/Yaw/Roll poses, all three planet magnitudes, 3,000 unique particle cells, and all four modes
- Keyboard and touch controls
- Timer and life HUD in both the status bar and Canvas
- Target progress fill, cooldown, decay, destruction, and reset
- Light/dark persistence and system defaults
- No horizontal overflow or overlapping text

The local machine may not have Jekyll installed. The preview builder validates this repository's current Liquid subset, but GitHub Pages remains the production build authority.

## Deployment notes

The intended repository is `username.github.io`, deployed from the default branch through GitHub Pages. `_config.yml` uses a blank `baseurl` for a user site. If this becomes a project site, update `url` and `baseurl` and retest every root-relative media path.

Jekyll exclusion prevents `docs/` and `demos/` from appearing in the generated Pages site. The additional `.gitignore` rule keeps the local `demos/` source tree out of this public repository entirely.
