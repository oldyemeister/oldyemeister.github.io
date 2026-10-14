# Task H sky comparison — 2026-10-14

Historical comparison: H2 supersedes H’s sparse bands with the denser seven-row
profile described in HANDOFF.md. These timings describe H, not H2.

A is the existing hero CRT stack (noise, scanlines, sweep, flicker).
B is our own CSS horizontal-band tile plus the existing slow sweep. Clouds,
fonts, colors and layout are otherwise preserved; B also clips existing
horizontal decorative overflow at the homepage main element.

**Decision: keep B.** The wider, softer static bands read more calmly than the
fine animated CRT texture and keep the cyan/cloud composition legible at both
sizes. Hero, header and About use the same SVG coordinates and texture phase.
No reference-folder assets or CSS were copied. The existing SVG cloud assets
and their drift are unchanged. Game and project-preview CRT settings are intact.

## Short Chrome traces

Headless local Chrome, unthrottled, one page at a time, two consecutive
five-second samples per viewport after load. Table entries are sample means.
Task time is Chrome Performance `TaskDuration` (renderer main-thread work),
not whole-machine CPU usage. Paint time sums `Paint` event durations from
`devtools.timeline`. Other homepage work, including clouds, remains active.

| Viewport | Main-thread task ms, A → B | Paint ms, A → B | Paint events, A → B |
|---|---:|---:|---:|
| 1440×900 | 586.0 → 833.7 | 61.9 → 84.4 | 2404 → 2400 |
| 375×900 | 805.8 → 720.2 | 73.5 → 67.4 | 2400 → 2404 |

These short samples do **not** establish a performance improvement: desktop
main-thread/paint time increased, while phone time decreased. Paint counts
remain similar. Fewer CRT layers alone do not eliminate the existing SVG/cloud
repainting. Keep B for the visual result, not a claimed CPU saving. Run longer
controlled device profiles before making a performance claim.

## Evidence

`docs/screenshots/h-{before,after}-{hero,about}-{1440,375}.png` contains the
before/after viewport captures. Cloud motion was paused for each capture after
the trace; animation positions were not synchronized between A and B.

Browser checks: all three sky surfaces share the same measured position/width
and computed texture. Reduced motion disables sweep activity and pauses clouds;
the static pattern remains present with JavaScript disabled. The horizontal
clip preserves the upward header continuation while containing offscreen art.
Unit tests verify that hero creates only the sweep layer, while project CRT
layers and the game overrides keep their existing behavior.
