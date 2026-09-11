import { readdir, stat } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const sources = ['assets', 'templates', 'projects', '_data', '_layouts', '_includes', 'tools', 'index.html', '404.html', '_config.yml'];
let building = false;
let pending = false;

function build() {
  if (building) { pending = true; return; }
  building = true;
  const child = spawn(process.execPath, ['tools/preview-build.mjs', '--production'], {
    cwd: root, stdio: 'inherit'
  });
  child.on('error', error => { console.error(error.message); process.exitCode = 1; });
  child.on('close', code => {
    building = false;
    console.log(code === 0 ? 'Rebuilt. Refresh your browser to see changes.' : 'Build failed. Fix the error and save again.');
    if (pending) { pending = false; build(); }
  });
}

async function snapshot() {
  const files = [];
  async function visit(path) {
    try {
      const info = await stat(resolve(root, path));
      if (info.isDirectory()) {
        const entries = await readdir(resolve(root, path), { withFileTypes: true });
        await Promise.all(entries.filter(entry => !entry.name.startsWith('.') && !entry.isSymbolicLink())
          .map(entry => visit(`${path}/${entry.name}`)));
      } else files.push(`${path}:${info.mtimeMs}:${info.size}`);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  await Promise.all(sources.map(visit));
  return files.sort().join('\n');
}

// Poll source metadata to avoid native watcher limits and ignore build output.
let previous = await snapshot();
console.log('Watching site source files. Keep your local server running; press Ctrl+C to stop watching.');
build();
async function poll() {
  try {
    const next = await snapshot();
    if (next !== previous) { previous = next; build(); }
  } catch (error) { console.error(`Cannot check source files: ${error.message}`); }
  setTimeout(poll, 750);
}
setTimeout(poll, 750);
