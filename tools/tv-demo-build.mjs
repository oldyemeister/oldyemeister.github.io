// Optional local-only preview. A normal build never creates this route.
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const destination = resolve(root, '_site/tv-demo');
let html = await readFile(resolve(root, '_site/projects/laser/index.html'), 'utf8');
if (!html.includes('/assets/themes/persona/game-start.js')) {
  throw new Error('Run npm run build first to create the Persona Laser Puzzle page.');
}
html = html
  .replace('<title>Laser Puzzle</title>', '<title>Laser Puzzle — TV frame preview</title>')
  .replace('</head>', '<meta name="robots" content="noindex, nofollow">\n</head>');
await mkdir(destination, { recursive: true });
await cp(resolve(root, 'tools/tv-demo'), destination, { recursive: true });
await writeFile(resolve(destination, 'index.html'), html);
console.log('Local TV preview: http://localhost:8000/tv-demo/');
