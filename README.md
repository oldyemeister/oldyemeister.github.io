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
npm run build            # Build the published site into _site/
```

The asset conversion scripts expect the original project sources under `tools/.reference/demos/`. Those reference files are used for local regeneration and are not part of the deployed site.

## Updating the portfolio

The repository preserves the original Jekyll design and keeps Persona as the
new design template. Both share portfolio data, project pages, images, documents,
and game engines. No content or asset copies are needed when changing designs.

| Location | Purpose |
| --- | --- |
| `_data/content.yml` | Shared portfolio content |
| `index.html`, `projects/`, `404.html` | Shared page content and structure |
| `_layouts/`, `_includes/` | Preserved original Jekyll layouts and components |
| `assets/css/site.css`, `assets/js/site.js` | Original styling and site behavior; also the Persona base |
| `templates/persona/render.mjs` | Persona page decoration and route generation |
| `assets/themes/persona/` | Persona CSS, effects, start controls, and web fonts |
| `assets/js/` | Shared game engines and supporting scripts |
| `assets/images/`, `assets/documents/`, `assets/vendor/` | Shared runtime assets, where present |
| `references/fonts/` | Supplied font source files, excluded from site output |
| `docs/` | Editing guide, attribution, and publishing notes |
| `tools/`, `test/` | Build tools, asset converters, and engine tests |

Run `npm run preview:build`, then serve the output as described above. The
original stays at `/`, and Persona is available at `/persona/`.

- [Design editing guide](docs/DESIGN.md)
- [Design and font attribution](docs/ATTRIBUTION.md)
- [GitHub preparation and publishing](docs/PUBLISHING.md)

## Deployment

Pushing to `main` runs `.github/workflows/pages.yml`: engine tests, the Node
static build, and deployment to GitHub Pages. GitHub Pages uses GitHub Actions
as its publishing source.

`npm run build` writes `_site/` with Persona at `/` and the preserved original
at `/original/`. `/persona/` remains available for existing preview links.
All designs share `/assets/`. The output directory is ignored by Git.

`npm run preview:build` keeps the comparison preview unchanged: original at `/`,
Persona at `/persona/`. See [publishing notes](docs/PUBLISHING.md).
