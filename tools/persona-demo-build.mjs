// Optional local-only study of the Persona upgrades from the design review.
// Copies the built site and layers tools/persona-demo/ over every Persona
// page, so neither the source nor _site changes. Serve it on its own port.
import { cp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, '_site');
const destination = resolve('/private/tmp/personal-website-persona-demo');
if (!existsSync(resolve(source, 'index.html'))) {
  throw new Error('Run npm run build first to create _site.');
}

await rm(destination, { recursive: true, force: true });
await cp(source, destination, { recursive: true });
await cp(resolve(root, 'tools/persona-demo'), resolve(destination, 'persona-demo'), { recursive: true });

// Set the study class before first paint, so there is no flash of the
// shipped design.
const head = `<meta name="robots" content="noindex, nofollow">
    <link rel="stylesheet" href="/persona-demo/upgrades.css">
    <script>
      (function () {
        var root = document.documentElement;
        try { if (localStorage.getItem('p4-demo') !== 'off') root.classList.add('p4-demo'); }
        catch (error) { root.classList.add('p4-demo'); }
        // Land on a #section instantly; the site's smooth scrolling would
        // otherwise show the hero first, then scroll down to it.
        if (location.hash && root.classList.contains('p4-demo')) {
          root.style.scrollBehavior = 'auto';
          addEventListener('load', function () {
            setTimeout(function () { root.style.scrollBehavior = ''; }, 0);
          });
        }
      }());
    </script>
    </head>`;

async function pages(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return ['original', 'tv-demo', 'persona-demo', 'assets'].includes(entry.name) ? [] : pages(path);
    return entry.name.endsWith('.html') ? [path] : [];
  }));
  return nested.flat();
}

let count = 0;
for (const page of await pages(destination)) {
  const html = await readFile(page, 'utf8');
  if (!html.includes('persona-design')) continue;
  await writeFile(page, html
    .replace('</head>', head)
    .replace('</body>', '<script src="/persona-demo/upgrades.js" defer></script>\n    </body>'));
  count += 1;
}
console.log(`Persona upgrade study: ${count} pages in ${destination}`);
console.log('Serve it with: python3 -m http.server 8001 --bind 127.0.0.1 --directory ' + destination);
