import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { deflateSync } from 'node:zlib';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const source = await readFile(resolve(root, 'demos', 'Laser_Puzzle', 'Laser_Puzzle_CPUlator.c'), 'utf8');
const outputDirectory = resolve(root, 'assets/images');

const assets = [
  { name: 'background', width: 320, height: 240, output: 'laser-background.png' },
  { name: 'bluenode', width: 11, height: 11, output: 'laser-bluenode.png', transparent: 0x07e0 },
  { name: 'firewall', width: 11, height: 11, output: 'laser-firewall.png', transparent: 0x07e0 },
  { name: 'missionpassed', width: 200, height: 59, output: 'laser-success.png', transparent: 0x07e0 },
  { name: 'wasted', width: 120, height: 35, output: 'laser-failure.png', transparent: 0x4389 }
];
const mirrors = [
  [84, 175, 0], [170, 175, 270], [259, 175, 90], [259, 108, 135],
  [259, 49, 45], [180, 49, 135], [180, 81, 90], [157, 81, 0],
  [125, 81, 0], [125, 195, 90], [58, 195, 0], [58, 140, 225], [58, 86, 135]
];
const nodes = [[180, 105], [157, 65], [73, 140], [110, 81], [58, 48], [170, 138]];
const firewalls = [[170, 194], [235, 108], [157, 100], [71, 86]];

function initializerFor(name) {
  const declaration = new RegExp(`(?:const\\s+)?uint16_t\\s+${name}\\s*\\[[^\\]]+\\]\\s*\\[[^\\]]+\\]\\s*=\\s*\\{`, 'm');
  const match = declaration.exec(source);
  if (!match) throw new Error(`Could not find ${name} in the C source.`);
  const start = match.index + match[0].lastIndexOf('{');
  let depth = 0;
  for (let index = start; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') depth -= 1;
    if (depth === 0) return source.slice(start, index + 1);
  }
  throw new Error(`Array ${name} has no closing brace.`);
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const output = Buffer.alloc(12 + data.length);
  output.writeUInt32BE(data.length, 0);
  typeBuffer.copy(output, 4);
  data.copy(output, 8);
  output.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 8 + data.length);
  return output;
}

function rgbaFromRgb565(pixels, transparent) {
  const rgba = Buffer.alloc(pixels.length * 4);
  pixels.forEach((value, index) => {
    const offset = index * 4;
    rgba[offset] = Math.round(((value >> 11) & 0x1f) * 255 / 31);
    rgba[offset + 1] = Math.round(((value >> 5) & 0x3f) * 255 / 63);
    rgba[offset + 2] = Math.round((value & 0x1f) * 255 / 31);
    rgba[offset + 3] = value === transparent ? 0 : 255;
  });
  return rgba;
}

function encodeRgbaPng(pixels, width, height) {
  const rows = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (1 + width * 4);
    rows[rowStart] = 0;
    pixels.copy(rows, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(rows, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

function setPixel(pixels, x, y, color) {
  if (x < 0 || x >= 320 || y < 0 || y >= 240) return;
  const offset = (Math.round(y) * 320 + Math.round(x)) * 4;
  pixels[offset] = color[0];
  pixels[offset + 1] = color[1];
  pixels[offset + 2] = color[2];
  pixels[offset + 3] = color[3] ?? 255;
}

function drawLine(pixels, x0, y0, x1, y1, color) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0);
  const sx = x0 < x1 ? 1 : -1;
  const dy = -Math.abs(y1 - y0);
  const sy = y0 < y1 ? 1 : -1;
  let error = dx + dy;
  while (true) {
    setPixel(pixels, x0, y0, color);
    if (x0 === x1 && y0 === y1) break;
    const doubled = 2 * error;
    if (doubled >= dy) { error += dy; x0 += sx; }
    if (doubled <= dx) { error += dx; y0 += sy; }
  }
}

function blit(destination, sourcePixels, sourceWidth, sourceHeight, centerX, centerY) {
  const startX = Math.round(centerX - sourceWidth / 2);
  const startY = Math.round(centerY - sourceHeight / 2);
  for (let y = 0; y < sourceHeight; y += 1) {
    for (let x = 0; x < sourceWidth; x += 1) {
      const sourceOffset = (y * sourceWidth + x) * 4;
      if (sourcePixels[sourceOffset + 3] === 0) continue;
      setPixel(destination, startX + x, startY + y, [
        sourcePixels[sourceOffset], sourcePixels[sourceOffset + 1], sourcePixels[sourceOffset + 2], 255
      ]);
    }
  }
}

const segmentPositions = [[0, 0, 4, 0], [4, 0, 4, 4], [4, 4, 4, 8], [0, 8, 4, 8], [0, 4, 0, 8], [0, 0, 0, 4], [0, 4, 4, 4]];
const digitPatterns = [0b0111111, 0b0000110, 0b1011011, 0b1001111, 0b1100110, 0b1101101, 0b1111101, 0b0000111, 0b1111111, 0b1101111];

function drawDigit(pixels, x, y, number) {
  segmentPositions.forEach(([x1, y1, x2, y2], segment) => {
    if (!(digitPatterns[number] & (1 << segment))) return;
    if (x1 === x2) {
      for (let py = y + y1; py <= y + y2; py += 1) {
        setPixel(pixels, x + x1, py, [255, 255, 255, 255]);
        setPixel(pixels, x + x1 + 1, py, [255, 255, 255, 255]);
      }
    } else {
      for (let px = x + x1; px <= x + x2; px += 1) {
        setPixel(pixels, px, y + y1, [255, 255, 255, 255]);
        setPixel(pixels, px, y + y1 + 1, [255, 255, 255, 255]);
      }
    }
  });
}

function drawMirror(pixels, x, y, angle) {
  const white = [255, 255, 255, 255];
  const gray = [123, 125, 123, 255];
  if (angle % 90 === 0) {
    if (angle === 0 || angle === 180) {
      for (let offset = -5; offset <= 5; offset += 1) {
        setPixel(pixels, x - 1, y + offset, white);
        setPixel(pixels, x, y + offset, gray);
        setPixel(pixels, x + 1, y + offset, white);
      }
    } else {
      for (let offset = -5; offset <= 5; offset += 1) {
        setPixel(pixels, x + offset, y - 1, white);
        setPixel(pixels, x + offset, y, gray);
        setPixel(pixels, x + offset, y + 1, white);
      }
    }
  } else if (angle === 45 || angle === 225) {
    for (let offset = -3; offset <= 3; offset += 1) setPixel(pixels, x + offset, y - offset, gray);
    for (let offset = -3; offset <= 4; offset += 1) {
      const px = x + offset;
      const py = y - offset;
      setPixel(pixels, px - 1, py, white);
      setPixel(pixels, px, py + 1, white);
    }
  } else {
    for (let offset = -3; offset <= 3; offset += 1) setPixel(pixels, x - offset, y - offset, gray);
    for (let offset = -3; offset <= 4; offset += 1) {
      const px = x - offset;
      const py = y - offset;
      setPixel(pixels, px + 1, py, white);
      setPixel(pixels, px, py + 1, white);
    }
  }
}

function drawPreview(decoded) {
  const preview = Buffer.from(decoded.background.rgba);
  nodes.forEach(([x, y]) => blit(preview, decoded.bluenode.rgba, 11, 11, x, y));
  firewalls.forEach(([x, y]) => blit(preview, decoded.firewall.rgba, 11, 11, x, y));

  mirrors.forEach(([x, y, angle], index) => {
    drawMirror(preview, x, y, angle);
    if (index === 0) {
      drawLine(preview, x - 8, y - 8, x + 8, y - 8, [241, 198, 84, 255]);
      drawLine(preview, x + 8, y - 8, x + 8, y + 8, [241, 198, 84, 255]);
      drawLine(preview, x + 8, y + 8, x - 8, y + 8, [241, 198, 84, 255]);
      drawLine(preview, x - 8, y + 8, x - 8, y - 8, [241, 198, 84, 255]);
    }
  });

  drawLine(preview, 84, 81, 84, 239, [73, 224, 215, 255]);
  drawDigit(preview, 210, 18, 2);
  setPixel(preview, 218, 22, [255, 255, 255, 255]);
  setPixel(preview, 218, 26, [255, 255, 255, 255]);
  drawDigit(preview, 222, 18, 0);
  drawDigit(preview, 230, 18, 0);
  drawDigit(preview, 265, 18, 2);
  return preview;
}

await mkdir(outputDirectory, { recursive: true });
const decoded = {};
for (const asset of assets) {
  const values = [...initializerFor(asset.name).matchAll(/0x[0-9a-f]+/gi)].map((match) => Number.parseInt(match[0], 16));
  const expected = asset.width * asset.height;
  if (values.length !== expected) throw new Error(`${asset.name}: expected ${expected} pixels, found ${values.length}.`);
  const rgba = rgbaFromRgb565(values, asset.transparent);
  decoded[asset.name] = { rgba, width: asset.width, height: asset.height };
  const png = encodeRgbaPng(rgba, asset.width, asset.height);
  await writeFile(resolve(outputDirectory, asset.output), png);
  process.stdout.write(`${asset.output}: ${asset.width}x${asset.height}, ${png.length} bytes\n`);
}
const preview = encodeRgbaPng(drawPreview(decoded), 320, 240);
await writeFile(resolve(outputDirectory, 'laser-preview.png'), preview);
process.stdout.write(`laser-preview.png: 320x240, ${preview.length} bytes\n`);
