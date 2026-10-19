# Repository cleanup — 2026-10-19

The local site runs with `python3 -m http.server 8000 --directory _site` after
`npm run build`.

## Archived locally

`.local-archive/2026-10-19-cleanup/` preserves the original relative paths of:

- Old visual QA captures from `docs/screenshots/` (including two untracked captures).
- Unused original PNG/JPEG project images; the referenced WebP images and ACC hero remain active.
- Unused portrait/project placeholders and the superseded Bilibili preview SVG.
- Optional Persona upgrade and TV demo builders, styles, scripts, and their README files.

The archive contains 176 files (55.74 MB). Its `manifest.json` records each original
path, size, and SHA-256 hash. Copy a file from the archive back to its original
relative path to restore it; avoid overwriting newer work. Tracked files are also
recoverable from Git history before this cleanup. Historical screenshot references
in HANDOFF.md and design notes now resolve inside this archive.

The archive, `screenshots/`, and future `docs/screenshots/` captures are ignored.
They remain local and are not included in deployment. Keep a separate backup if
these local reference files need long-term preservation.

## Retained deliberately

- `/original/` layouts and styling, and `/persona/` comparison routes.
- Runtime modules, including dynamically named stylesheets and game assets.
- Tests, asset converters, font-generation sources, and third-party licenses.
- The already-ignored large ACC source video; it was already excluded from production.

## Results and limits

- Archived tracked content: 55.52 MB; remaining tracked files approximately 7.01 MB
  before this report and handoff update (previously approximately 62.53 MB).
- Production output: approximately 14.30 MB to 5.18 MB (64% smaller).
- All retained output files match the pre-cleanup SHA-256 hashes; only 17 unused
  image assets disappear from production. Original and Persona HTML/CSS/JS remain identical.
- Production build succeeds and all 150 current tests pass. Local homepage checked
  in the browser after rebuilding. Shell HTTP checks were unavailable due to sandbox
  network restrictions; browser access worked.

This reduces checkout contents, future accidental binary additions, and deployment
artifact size. Git pushes transfer new objects, not all unchanged files. Existing
history (the roughly 315 MB `.git` directory) is unchanged; removing old historical
blobs would require a separate history rewrite. No commit or push was performed.
