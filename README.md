# Jiawei Ye — Portfolio

Personal portfolio for **Jiawei (Jacky) Ye**, a Computer Engineering student and hardware/software engineer. The site presents embedded systems, FPGA, RF, and AI work through project case studies and playable browser recreations.

**[Visit the live site](https://oldyemeister.github.io)**

[![Portfolio preview](assets/images/projects/laser/laser-preview.png)](https://oldyemeister.github.io)

## Featured projects

| Project | What it demonstrates | Demo |
| --- | --- | --- |
| Laser Puzzle | A Canvas recreation of a DE1-SoC laser-reflection game, with the original board geometry, mirrors, targets, hazards, timer, and lives | [Solve the puzzle](https://oldyemeister.github.io/projects/laser/) |
| Donkey Kong FPGA Game | A browser version of a Verilog platform game using its original sprites, movement timing, collision rules, and win condition | [Play the game](https://oldyemeister.github.io/projects/donkey-kong/) |
| IMU Sandbox | A Three.js recreation of an STM32, BNO055, and OLED particle sandbox with roll, pitch, yaw, gravity, and material controls | [Alter gravity](https://oldyemeister.github.io/projects/imu-sandbox/) |
| RF Frequency Downconversion System | A case study covering the design, assembly, and validation of an analog receiver PCB | [Read the case study](https://oldyemeister.github.io/projects/rf-receiver/) |
| Vision-Assisted Adaptive Cruise Control | A Raspberry Pi vehicle combining PID control, lane keeping, emergency braking, and stop-sign detection | [Read the case study](https://oldyemeister.github.io/projects/aps380/) |

## Highlights

- Responsive, accessible portfolio with light and dark themes
- Content managed from a single YAML file
- Keyboard, pointer, and touch support for interactive projects
- Reduced-motion support for animated project previews
- Locally hosted Three.js assets with no runtime CDN dependency
- Static output designed for GitHub Pages
- Automated tests for all three interactive project engines

## Built with

- Jekyll, Liquid, HTML, and CSS
- Vanilla JavaScript and Canvas
- Three.js
- Node.js' built-in test runner
- GitHub Pages

## Run locally

The repository has no npm package dependencies. To use the included preview builder, install:

- Node.js 20.11 or newer
- Ruby with the standard `yaml` library

Then clone and build the site:

```sh
git clone https://github.com/oldyemeister/oldyemeister.github.io.git
cd oldyemeister.github.io
npm run preview:build
```

The rendered site is written to `/private/tmp/personal-website-preview`. Serve that directory with any static file server, for example:

```sh
python3 -m http.server 8000 --directory /private/tmp/personal-website-preview
```

Open <http://localhost:8000> in a browser.

## Development commands

```sh
npm test                 # Run the interactive engine tests
npm run assets           # Regenerate game assets from archived hardware sources
npm run preview:build    # Build a local static preview
```

The asset conversion scripts expect the original project sources under `tools/.reference/demos/`. Those reference files are used for local regeneration and are not part of the deployed site.

## Updating the portfolio

Most site copy and project metadata lives in [`_data/content.yml`](_data/content.yml). Edit that file to update the biography, experience, project cards, contact details, and interactive-project descriptions.

The main implementation areas are:

```text
_data/content.yml      Portfolio content and project metadata
_layouts/              Shared Jekyll page layouts
_includes/             Navigation and footer components
assets/css/            Site styles and responsive behavior
assets/js/             Site scripts and interactive project engines
projects/              Playable projects and case studies
test/                  Node.js engine tests
tools/                 Preview and asset-generation scripts
```

## Deployment

The site is configured for GitHub Pages in [`_config.yml`](_config.yml). Pushing changes to the repository's publishing branch triggers the native Jekyll build; generated preview files should not be committed.
