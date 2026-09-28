// Renders the link-preview card (1200×630), the SVG/PNG favicons, and the
// apple-touch-icon from _data/content.yml, using headless Chrome and ffmpeg.
//   node tools/render-brand-assets.mjs
import { execFileSync } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dirname, '..');
const chrome = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const loadYaml = (path) => JSON.parse(execFileSync('ruby', [
  '-ryaml', '-rjson', '-e', 'puts JSON.generate(YAML.load_file(ARGV[0]))', resolve(root, path)
], { encoding: 'utf8' }));
const content = loadYaml('_data/content.yml');
const config = loadYaml('_config.yml');
const out = (path) => resolve(root, path.replace(/^\//, ''));
const escape = (text) => String(text).replace(/[&<>"]/g, (character) => `&#${character.charCodeAt(0)};`);

const name = escape(content.site.name);
const initials = escape(content.site.initials);
const role = escape(content.hero.role);
const host = escape(new URL(config.url).host);
const font = pathToFileURL(resolve(root, 'assets/themes/persona/fonts/slim-latin.woff')).href;
// Palette values from assets/themes/persona/tokens.css and hero-poster.css.
const color = { yellow: '#FFF000', olive: '#4B4A30', white: '#FFFDF3', black: '#080808', blue: '#0C75A1',
  sky: '#04C4EB', orange: '#FFAA00', lime: '#DFFF00', violet: '#5A25F5', silver: '#BFC3C4', ice: '#F4FFFF' };

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="${color.yellow}"/>
  <text x="32" y="44" text-anchor="middle" font-family="'Arial Black', Arial, sans-serif" font-weight="900"
    font-size="30" letter-spacing="-1.5" fill="${color.olive}">${initials}</text>
</svg>
`;

const bands = [[color.orange, 5], [color.silver, 6], [color.yellow, 4], [color.ice, 14], [color.violet, 8],
  [color.orange, 7], [color.lime, 5], [color.violet, 5]]
  .map(([fill, height]) => `<i style="background:${fill};height:${height}px"></i>`).join('');

const card = `<!doctype html><html><head><style>
  @font-face { font-family: Slim; src: url('${font}') format('woff'); }
  html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; }
  body { position: relative; background: ${color.yellow}; font-family: Slim, Arial, sans-serif; }
  svg.stage { position: absolute; inset: 0; }
  .copy { position: absolute; left: 76px; top: 150px; width: 640px; transform: rotate(-4deg); }
  h1 { margin: 0; color: ${color.olive}; font: 400 96px/.9 Slim, Arial, sans-serif; letter-spacing: -.02em;
    text-shadow: 5px 5px 0 ${color.white}; }
  .role { display: inline-block; margin: 26px 0 0 8px; padding: 10px 18px 12px; background: ${color.olive};
    color: ${color.white}; font-size: 38px; transform: rotate(2deg); }
  .host { position: absolute; left: 84px; bottom: 58px; color: ${color.olive}; font-size: 30px; }
  .monogram { position: absolute; left: 930px; top: 315px; transform: translate(-50%, -50%) rotate(-3deg);
    font: 900 170px/1 'Arial Black', Arial, sans-serif; letter-spacing: -.035em; color: ${color.olive};
    -webkit-text-stroke: 6px ${color.white}; paint-order: stroke fill; text-shadow: 6px 6px 0 ${color.black}; }
  .monogram span { color: ${color.blue}; -webkit-text-stroke: 0; text-shadow: none; font-size: .38em; }
  .bands { position: absolute; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; }
  .bands i { display: block; }
</style></head><body>
  <svg class="stage" viewBox="0 0 1200 630">
    <circle cx="930" cy="315" r="330" fill="${color.sky}"/>
    <circle cx="930" cy="315" r="300" fill="none" stroke="${color.white}" stroke-width="6"/>
    <circle cx="930" cy="315" r="232" fill="${color.yellow}" stroke="${color.orange}" stroke-width="14"/>
    <circle cx="930" cy="315" r="212" fill="none" stroke="${color.orange}" stroke-width="5"/>
  </svg>
  <div class="copy"><h1>${name}</h1><div class="role">${role}</div></div>
  <div class="host">${host}</div>
  <div class="monogram">${initials}<span>.</span></div>
  <div class="bands">${bands}</div>
</body></html>`;

const iconPage = (background) => `<!doctype html><html><head><style>
  html, body { margin: 0; width: 512px; height: 512px; overflow: hidden; background: ${background}; }
  img { display: block; width: 512px; height: 512px; }
</style></head><body><img src="favicon.svg"></body></html>`;

function screenshot(htmlPath, pngPath, width, height, transparent = false) {
  execFileSync(chrome, ['--headless=new', '--hide-scrollbars', '--force-device-scale-factor=1',
    ...(transparent ? ['--default-background-color=00000000'] : []),
    `--window-size=${width},${height}`, `--screenshot=${pngPath}`, pathToFileURL(htmlPath).href],
  { stdio: 'ignore' });
}
const scale = (input, output, size) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', input,
  '-vf', `scale=${size}:${size}:flags=lanczos`, output]);

const temporary = await mkdtemp(join(tmpdir(), 'brand-assets-'));
try {
  await writeFile(out(content.site.favicon), favicon);
  await writeFile(join(temporary, 'favicon.svg'), favicon);
  await writeFile(join(temporary, 'card.html'), card);
  await writeFile(join(temporary, 'icon.html'), iconPage('transparent'));
  // iOS masks its own corners, so the touch icon is a full opaque square.
  await writeFile(join(temporary, 'touch.html'), iconPage(color.yellow));
  screenshot(join(temporary, 'card.html'), out(content.site.share_image), 1200, 630);
  screenshot(join(temporary, 'icon.html'), join(temporary, 'icon.png'), 512, 512, true);
  screenshot(join(temporary, 'touch.html'), join(temporary, 'touch.png'), 512, 512);
  scale(join(temporary, 'icon.png'), out(content.site.favicon_png), 32);
  scale(join(temporary, 'touch.png'), out(content.site.apple_touch_icon), 180);
  for (const key of ['share_image', 'favicon', 'favicon_png', 'apple_touch_icon']) {
    process.stdout.write(`${content.site[key]}\n`);
  }
} finally {
  await rm(temporary, { recursive: true, force: true });
}
