# Personal Portfolio and Interactive Hardware Projects

A content-driven personal website built for GitHub Pages. The site combines a responsive portfolio with browser recreations of a CPUlator laser puzzle, a Verilog FPGA platform game, and an STM32 IMU-driven OLED sandbox.

![Laser puzzle preview](assets/images/laser-preview.png)

## Highlights

- Single-file content editing through `_data/content.yml`
- Responsive portfolio sections for biography, projects, writing, and contact details
- Accessible light and dark themes with system-preference detection and saved user choice
- Playable Canvas laser puzzle with keyboard, pointer, and touch controls
- Playable Canvas recreation of the original 320x240 Verilog platform game
- Interactive Three.js OLED model with firmware-matched orientation controls
- Firmware-derived Normal, Wind, Shake, and Explosion particle modes
- Original 320x240 board, mirror arrangement, targets, hazards, timer, and lives
- Geometry-based laser collision with target charge, cooldown, and decay
- Static output compatible with GitHub Pages and native Jekyll builds

## Laser Puzzle

The playable project is a faithful browser recreation of the original C version developed for CPUlator-compatible FPGA hardware. It retains the original board coordinates, 13 rotatable mirrors, six blue targets, four red hazards, two lives, and a two-minute timer while replacing hardware framebuffer collision with deterministic geometry.

The original hardware source is kept locally under the ignored `demos/` directory and is not included in this public repository. The browser recreation is published from `projects/laser/`.

## FPGA Platform Game

The second playable project recreates the active `drawmario.v` design from the Quartus project. It uses the original MIF background and sprites, 48 Hz movement cadence, sloped-platform collision, locked-direction jumping, staggered barrels, player respawns, and source win coordinates. Keyboard and touch controls make the hardware game playable on the web without requiring an FPGA or Verilog simulator.

## STM32 IMU Sandbox

The IMU Sandbox is based on STM32F4 C firmware that combines a BNO055 orientation sensor with 128x64 SSD1306 OLED displays. Its browser presentation focuses on the particle display: a locally hosted Three.js scene exposes the standard IMU axes—Roll around X, Pitch around Y, and Yaw around Z—with Z-Y-X rotation composition while switching among the four active firmware modes. The OLED is centered at the world origin in the vertical Y-Z plane, faces a camera on +X, and sits above an X-Y ground plane. World +Z is up and gravity is fixed to -Z, so the zero-pose sand falls to the OLED's bottom edge. Yaw cannot change this projection because it rotates around the gravity axis. A selector reproduces the firmware's Moon (0.16g), Earth (1.00g), and Jupiter (2.50g) magnitudes. The display texture is generated live on a 128x64 Canvas to preserve the embedded screen's pixel character.

This is a JavaScript recreation for the website, not STM32 emulation. The original HAL, sensor, display, and particle-simulation sources remain local and untracked; the web version is published from `projects/imu-sandbox/`.

## Technology

- Jekyll and Liquid templates
- HTML and CSS custom properties
- Vanilla JavaScript, Canvas, and Three.js
- Node.js tests and RGB565 asset conversion
- GitHub Pages static hosting

## Development

```sh
npm test
npm run assets
npm run preview:build
```

`npm run preview:build` creates a local rendered preview at `/private/tmp/personal-website-preview`. Production deployment uses GitHub Pages' native Jekyll build.
