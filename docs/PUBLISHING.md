# Publishing to GitHub Pages

The `Deploy portfolio` workflow in `.github/workflows/pages.yml` runs on pushes
to `main` and can also be started manually through GitHub Actions. It runs the
tests, builds the static site, uploads `_site/`, and deploys that artifact.
GitHub Pages must use **GitHub Actions** as its publishing source.

## Routes

- `/`: Persona, the current public design.
- `/original/`: the preserved original design using the same current content.
- `/persona/`: Persona comparison routes retained for existing links.
- `/assets/`: shared fonts, images, documents, JavaScript, and styles.

## Before pushing

Run `npm test`, `npm run build`, and review `git diff` plus `git status --short`.
Serve the production output with:

```sh
python3 -m http.server 8000 --directory _site
```

The comparison preview remains available through `npm run preview:build` and
puts the original at `/` and Persona at `/persona/` in
`/private/tmp/personal-website-preview`.

Generated output, reference sources, and tools are not included in the deployed
artifact. Keep the template, theme files, build tools, and documentation together
in source control. Design and font sources are recorded in `docs/ATTRIBUTION.md`.

The original Jekyll layouts and base CSS/JavaScript remain in their existing
paths. To return the public homepage to that design, change the production
selection in `tools/preview-build.mjs`, validate the routes, and push the change.
The original is a design fallback, not a frozen copy of older portfolio text.
