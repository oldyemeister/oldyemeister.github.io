# Local TV frame study

This optional route previews the same shared frame now used by all three
Persona game pages. The supplied P4-style TV reference guides the flat black cabinet,
hollow antennas, white grille and concentric/gear-shaped knobs. Action symbols
are printed in black on the white knob faces. Disabled controls stay white but
remain natively disabled until the existing Start flow enables them.

Generate the normal site with `npm run build`, then run
`node tools/tv-demo-build.mjs`. With `_site` served on port 8000, open
`http://localhost:8000/tv-demo/`. A normal rebuild removes this optional demo route;
run the demo builder again to restore it. The implementation lives in
`assets/themes/persona/tv-frame.css` and `tv-frame.js`; this route no longer keeps
separate copies of the frame.

The demo copies the built Laser Puzzle HTML. The shared frame moves—not clones—the existing
canvas and pause/reset buttons, retaining the readouts in their existing panel. Game modules and their event bindings
are unchanged. The canvas remains 320×240 at a 4:3 display ratio. The existing
Persona Slim Local face is used without outlines or italics for compact labels.
The lower mirror controls retain 44px targets and sit below the decorative feet.

All new frame artwork is code-native SVG/CSS, based on the user-supplied reference.
The screen poster is the existing `assets/images/projects/laser/laser-preview.png`.
No new raster assets, dependencies, network services or gameplay code are added.
IMU Sandbox retains its existing Reset, mode, gravity and axis controls; its small
white knob controls CRT because the original sandbox has no pause action.

The optional CRT screen texture uses `assets/js/game-crt.js` and the shared
`CRT_SETTINGS` from `assets/js/crt-settings.js`. It starts on, works before or
after Start, and never alters gameplay. Pause and CRT are adjacent on wide TVs
and stack on narrow TVs, preserving both 44px targets and the screen width.
