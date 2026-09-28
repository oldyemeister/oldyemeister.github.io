// Records each playable project's canvas in real time and encodes the homepage
// preview as a looping H.264 MP4 with a matching PNG poster. (VP9 WebM came
// out larger than H.264 for all three games, so only MP4 is produced.)
//
// Needs Chrome with remote debugging and a server for the built site, e.g.:
//   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
//     --remote-debugging-port=9234 --enable-unsafe-swiftshader about:blank
//   python3 -m http.server 8766 --directory _site
//   node tools/capture-game-previews.mjs [laser|donkey-kong|imu-sandbox ...]
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const DEBUG_URL = process.env.GAME_PREVIEW_DEBUG_URL || 'http://127.0.0.1:9234';
// The original design loads each game as soon as its canvas is visible,
// without the Persona "Start" gate.
const SITE_URL = process.env.GAME_PREVIEW_SITE_URL || 'http://127.0.0.1:8766/original';
const OUTPUT_DIRECTORY = resolve('assets/images/projects');
const CAPTURE_FPS = 30;

const sleep = (milliseconds) => new Promise((resolveSleep) => setTimeout(resolveSleep, milliseconds));

class CdpSession {
  constructor(url) {
    this.nextId = 0;
    this.pending = new Map();
    this.socket = new WebSocket(url);
  }

  async connect() {
    await new Promise((resolveConnect, reject) => {
      this.socket.addEventListener('open', resolveConnect, { once: true });
      this.socket.addEventListener('error', reject, { once: true });
    });
    this.socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (!message.id || !this.pending.has(message.id)) return;
      const { resolveRequest, rejectRequest } = this.pending.get(message.id);
      this.pending.delete(message.id);
      if (message.error) rejectRequest(new Error(message.error.message));
      else resolveRequest(message.result);
    });
  }

  send(method, params = {}) {
    const id = ++this.nextId;
    return new Promise((resolveRequest, rejectRequest) => {
      this.pending.set(id, { resolveRequest, rejectRequest });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression, awaitPromise = false) {
    const result = await this.send('Runtime.evaluate', { expression, awaitPromise, returnByValue: true });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    }
    return result.result.value;
  }

  close() { this.socket.close(); }
}

async function navigate(session, path, selector, ready) {
  await session.send('Page.navigate', { url: `${SITE_URL}${path}` });
  for (let attempt = 0; attempt < 150; attempt += 1) {
    await sleep(100);
    // Game loops only run while their canvas is on screen.
    const loaded = await session.evaluate(`(() => {
      const canvas = document.querySelector(${JSON.stringify(selector)});
      if (!canvas) return false;
      canvas.scrollIntoView({ block: 'center' });
      return Boolean(${ready});
    })()`).catch(() => false);
    if (loaded) return;
  }
  throw new Error(`Timed out loading ${path}`);
}

// Runs `drive` in the page while MediaRecorder captures the canvas stream.
async function recordCanvas(session, selector, seconds, drive) {
  const base64 = await session.evaluate(`(async () => {
    const canvas = document.querySelector(${JSON.stringify(selector)});
    const recorder = new MediaRecorder(canvas.captureStream(${CAPTURE_FPS}), {
      mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 12_000_000
    });
    const chunks = [];
    recorder.ondataavailable = (event) => chunks.push(event.data);
    const stopped = new Promise((resolveStop) => { recorder.onstop = resolveStop; });
    recorder.start();
    const wait = (milliseconds) => new Promise((resolveWait) => setTimeout(resolveWait, milliseconds));
    await Promise.all([(${drive})(canvas, wait), wait(${seconds * 1000})]);
    recorder.stop();
    await stopped;
    const bytes = new Uint8Array(await new Blob(chunks).arrayBuffer());
    let binary = '';
    for (let offset = 0; offset < bytes.length; offset += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
    }
    return btoa(binary);
  })()`, true);
  return Buffer.from(base64, 'base64');
}

function encode(rawPath, definition) {
  const directory = join(OUTPUT_DIRECTORY, definition.name);
  const output = join(directory, `${definition.name}-preview`);
  const trim = ['-ss', String(definition.leadIn), '-t', String(definition.duration)];
  const filter = `fps=${definition.fps ?? CAPTURE_FPS},${definition.frame}`;
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', rawPath, ...trim, '-vf', filter, '-an',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', String(definition.crf ?? 23), '-preset', 'slow',
    '-movflags', '+faststart', `${output}.mp4`]);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(definition.leadIn + definition.posterAt),
    '-i', rawPath, '-frames:v', '1', '-vf', definition.frame, `${output}.png`]);
  return output;
}

async function capture(session, definition, temporaryDirectory) {
  await navigate(session, definition.path, definition.selector, definition.ready);
  await sleep(600);
  const seconds = definition.leadIn + definition.duration + 0.5;
  const raw = await recordCanvas(session, definition.selector, seconds, definition.drive);
  const rawPath = join(temporaryDirectory, `${definition.name}.webm`);
  await writeFile(rawPath, raw);
  await mkdir(join(OUTPUT_DIRECTORY, definition.name), { recursive: true });
  const output = encode(rawPath, definition);
  process.stdout.write(`${output}.{mp4,png}\n`);
}

// Each `drive` is page-side source: an async function of (canvas, wait).
const targets = [
  {
    name: 'laser', path: '/projects/laser/', selector: '[data-laser-canvas]',
    ready: "canvas.width === 320",
    leadIn: 0.3, duration: 6, posterAt: 2.5,
    frame: 'scale=640:480:flags=neighbor',
    drive: `async (canvas, wait) => {
      const press = (key) => canvas.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      for (const key of ['ArrowLeft', 'ArrowDown', 'ArrowLeft', 'ArrowLeft', 'ArrowDown', 'ArrowRight',
        'ArrowDown', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 'ArrowRight', 'ArrowUp']) {
        press(key);
        await wait(500);
      }
    }`
  },
  {
    name: 'donkey-kong', path: '/projects/donkey-kong/', selector: '[data-donkey-kong-canvas]',
    ready: "document.querySelector('[data-dk-status]')?.textContent !== ''",
    leadIn: 0.3, duration: 6, posterAt: 2.5,
    frame: 'scale=640:480:flags=neighbor',
    drive: `async (canvas, wait) => {
      // The game listens for keydown on its canvas; keyup bubbles to window.
      const key = (type, name) => canvas.dispatchEvent(new KeyboardEvent(type, { key: name, bubbles: true }));
      key('keydown', 'ArrowRight');
      for (let jump = 0; jump < 5; jump += 1) {
        await wait(1100);
        key('keydown', 'ArrowUp');
        key('keyup', 'ArrowUp');
      }
      await wait(900);
      key('keyup', 'ArrowRight');
    }`
  },
  {
    name: 'imu-sandbox', path: '/projects/imu-sandbox/', selector: '.imu-webgl-canvas',
    ready: "document.querySelector('[data-imu-scene]')?.classList.contains('is-ready')",
    leadIn: 0.3, duration: 6, posterAt: 1.8,
    // Sand noise barely compresses: crop to the card's 16:10 frame, 24 fps.
    fps: 24, crf: 32,
    frame: 'crop=iw:iw*10/16,scale=560:350:flags=lanczos',
    // Roll 0° → 180°, then sweep to −180°, easing like the original preview.
    drive: `async (canvas, wait) => {
      const ease = (t) => t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
      const set = (axis, value) => {
        const input = document.querySelector('[data-imu-axis="' + axis + '"]');
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      };
      set('pitch', 0); set('yaw', 0);
      const start = performance.now();
      const total = 6300;
      while (performance.now() - start < total) {
        const t = (performance.now() - start) / total;
        set('roll', t <= 0.3 ? 180 * ease(t / 0.3) : 180 - 360 * ease((t - 0.3) / 0.7));
        await new Promise(requestAnimationFrame);
      }
    }`
  }
];

const pages = await fetch(`${DEBUG_URL}/json/list`).then((response) => response.json());
const page = pages.find((candidate) => candidate.type === 'page');
if (!page) throw new Error('No debuggable Chrome page is available.');
const session = new CdpSession(page.webSocketDebuggerUrl);
await session.connect();
await session.send('Page.enable');
await session.send('Runtime.enable');
await session.send('Emulation.setDeviceMetricsOverride', { width: 720, height: 900, deviceScaleFactor: 1, mobile: false });
const temporaryDirectory = await mkdtemp(join(tmpdir(), 'game-preview-'));
try {
  const requestedNames = new Set(process.argv.slice(2));
  const selectedTargets = requestedNames.size
    ? targets.filter((target) => requestedNames.has(target.name))
    : targets;
  if (!selectedTargets.length) throw new Error(`Unknown preview name: ${[...requestedNames].join(', ')}`);
  for (const target of selectedTargets) await capture(session, target, temporaryDirectory);
} finally {
  session.close();
  await rm(temporaryDirectory, { recursive: true, force: true });
}
