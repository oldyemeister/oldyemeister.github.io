import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const DEBUG_URL = process.env.GAME_PREVIEW_DEBUG_URL || 'http://127.0.0.1:9234';
const SITE_URL = process.env.GAME_PREVIEW_SITE_URL || 'http://127.0.0.1:8766';
const OUTPUT_DIRECTORY = resolve('assets/images/projects');
const FRAME_WIDTH = 480;
const FRAME_HEIGHT = 320;
const FRAME_DELAY = 20;

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
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'Browser evaluation failed.');
    return result.result.value;
  }

  close() { this.socket.close(); }
}

function fixedPalette() {
  const bytes = [];
  for (let index = 0; index < 256; index += 1) {
    bytes.push(
      Math.round(((index >> 5) & 7) * 255 / 7),
      Math.round(((index >> 2) & 7) * 255 / 7),
      Math.round((index & 3) * 255 / 3)
    );
  }
  return Buffer.from(bytes);
}

function word(value) { return Buffer.from([value & 255, value >> 8 & 255]); }

function lzw(indices) {
  const clearCode = 256;
  const endCode = 257;
  let dictionary = new Map();
  let nextCode = 258;
  let codeSize = 9;
  let bitBuffer = 0;
  let bitCount = 0;
  const output = [];

  const emit = (code) => {
    bitBuffer |= code << bitCount;
    bitCount += codeSize;
    while (bitCount >= 8) {
      output.push(bitBuffer & 255);
      bitBuffer >>>= 8;
      bitCount -= 8;
    }
  };
  const reset = () => {
    dictionary = new Map();
    nextCode = 258;
    codeSize = 9;
  };

  emit(clearCode);
  let prefix = indices[0];
  for (let index = 1; index < indices.length; index += 1) {
    const value = indices[index];
    const key = prefix * 256 + value;
    const existing = dictionary.get(key);
    if (existing !== undefined) {
      prefix = existing;
      continue;
    }
    emit(prefix);
    if (nextCode < 4096) {
      dictionary.set(key, nextCode++);
      // The decoder adds a dictionary entry one emitted code behind the encoder.
      if (nextCode > 1 << codeSize && codeSize < 12) codeSize += 1;
    } else {
      emit(clearCode);
      reset();
    }
    prefix = value;
  }
  emit(prefix);
  emit(endCode);
  if (bitCount) output.push(bitBuffer & 255);

  const blocks = [];
  for (let offset = 0; offset < output.length; offset += 255) {
    const block = Buffer.from(output.slice(offset, offset + 255));
    blocks.push(Buffer.from([block.length]), block);
  }
  blocks.push(Buffer.from([0]));
  return Buffer.concat(blocks);
}

function encodeGif(frames, frameDelay = FRAME_DELAY) {
  const parts = [
    Buffer.from('GIF89a'), word(FRAME_WIDTH), word(FRAME_HEIGHT),
    Buffer.from([0xf7, 0, 0]), fixedPalette(),
    Buffer.from([0x21, 0xff, 0x0b]), Buffer.from('NETSCAPE2.0'),
    Buffer.from([0x03, 0x01, 0x00, 0x00, 0x00])
  ];
  for (const frame of frames) {
    parts.push(
      Buffer.from([0x21, 0xf9, 0x04, 0x04]), word(frameDelay), Buffer.from([0, 0]),
      Buffer.from([0x2c]), word(0), word(0), word(FRAME_WIDTH), word(FRAME_HEIGHT), Buffer.from([0]),
      Buffer.from([8]), lzw(frame)
    );
  }
  parts.push(Buffer.from([0x3b]));
  return Buffer.concat(parts);
}

async function screenshotToIndices(session, selector, directory, frameNumber) {
  const bounds = await session.evaluate(`(() => {
    const bounds = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();
    const cropHeight = Math.min(bounds.height, bounds.width * 2 / 3);
    return { x: bounds.x, y: bounds.y + (bounds.height - cropHeight) / 2, width: bounds.width, height: cropHeight };
  })()`);
  const screenshot = await session.send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true,
    clip: { ...bounds, scale: FRAME_WIDTH / bounds.width }
  });
  const pngPath = join(directory, `frame-${frameNumber}.png`);
  const gifPath = join(directory, `frame-${frameNumber}.gif`);
  const rgbPath = join(directory, `frame-${frameNumber}.rgb`);
  await writeFile(pngPath, Buffer.from(screenshot.data, 'base64'));
  execFileSync('sips', ['-s', 'format', 'gif', pngPath, '--out', gifPath], { stdio: 'ignore' });
  execFileSync('gif2rgb', ['-1', '-o', rgbPath, gifPath], { stdio: 'ignore' });
  const rgb = await readFile(rgbPath);
  if (rgb.length !== FRAME_WIDTH * FRAME_HEIGHT * 3) {
    throw new Error(`Unexpected frame size: ${rgb.length} bytes.`);
  }
  const indices = Buffer.alloc(FRAME_WIDTH * FRAME_HEIGHT);
  for (let pixel = 0, offset = 0; pixel < indices.length; pixel += 1, offset += 3) {
    indices[pixel] = (rgb[offset] >> 5) << 5 | (rgb[offset + 1] >> 5) << 2 | rgb[offset + 2] >> 6;
  }
  return indices;
}

async function navigate(session, path, readyExpression) {
  await session.send('Page.navigate', { url: `${SITE_URL}${path}` });
  for (let attempt = 0; attempt < 80; attempt += 1) {
    await sleep(100);
    if (await session.evaluate(`Boolean(${readyExpression})`).catch(() => false)) return;
  }
  throw new Error(`Timed out loading ${path}`);
}

async function capture(session, definition, rootDirectory) {
  const directory = join(rootDirectory, definition.name);
  await import('node:fs/promises').then(({ mkdir }) => mkdir(directory));
  await navigate(session, definition.path, definition.ready);
  await sleep(500);
  const frames = [];
  for (let frame = 0; frame < definition.frameCount; frame += 1) {
    await definition.action(session, frame);
    await sleep(definition.captureDelay ?? 180);
    frames.push(await screenshotToIndices(session, definition.selector, directory, frame));
  }
  const outputDirectory = join(OUTPUT_DIRECTORY, definition.name);
  await mkdir(outputDirectory, { recursive: true });
  const outputPath = join(outputDirectory, `${definition.name}-preview.gif`);
  await writeFile(outputPath, encodeGif(frames, definition.frameDelay));
  process.stdout.write(`${outputPath}: ${frames.length} frames\n`);
}

const targets = [
  {
    name: 'laser', path: '/projects/laser/', selector: '[data-laser-canvas]', frameCount: 25,
    ready: "document.querySelector('[data-laser-canvas]')?.width === 320",
    action: (session, frame) => session.evaluate(`(() => {
      const canvas = document.querySelector('[data-laser-canvas]');
      ${frame === 0 ? "canvas.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));" : ''}
      ${frame > 0 && frame % 3 === 0 ? "canvas.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));" : ''}
    })()`)
  },
  {
    name: 'donkey-kong', path: '/projects/donkey-kong/', selector: '[data-donkey-kong-canvas]', frameCount: 25,
    ready: "document.querySelector('[data-donkey-kong-canvas]') && document.querySelector('[data-dk-status]')?.textContent !== ''",
    action: (session, frame) => session.evaluate(`(() => {
      if (${frame} === 0) window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      if (${frame} === 24) window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight', bubbles: true }));
    })()`)
  },
  {
    name: 'imu-sandbox', path: '/projects/imu-sandbox/', selector: '[data-imu-scene]', frameCount: 30,
    frameDelay: 20,
    captureDelay: 80,
    ready: "document.querySelector('[data-imu-scene]')?.classList.contains('is-ready')",
    action: (session, frame) => {
      const easeInOutCubic = (progress) => progress < 0.5
        ? 4 * progress ** 3
        : 1 - (-2 * progress + 2) ** 3 / 2;
      const roll = frame <= 9
        ? 180 * easeInOutCubic(frame / 9)
        : 180 - 360 * easeInOutCubic((frame - 9) / 20);
      return session.evaluate(`(() => {
        for (const [axis, value] of [['pitch', 0], ['yaw', 0], ['roll', ${roll}]]) {
          const input = document.querySelector('[data-imu-axis="' + axis + '"]');
          input.value = value;
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      })()`);
    }
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
