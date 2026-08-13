import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { deflateSync } from 'node:zlib';

const root = resolve(import.meta.dirname, '..');
const source = resolve(root, 'demos/DonkeyKong');
const output = resolve(root, 'assets/images');
const palette = [
  [0, 0, 0, 255], [0, 0, 255, 255], [0, 255, 0, 255], [0, 255, 255, 255],
  [255, 0, 0, 255], [255, 0, 255, 255], [255, 255, 0, 255], [255, 255, 255, 255]
];

function parseMif(text) {
  const depth = Number(text.match(/Depth\s*=\s*(\d+)/i)?.[1]);
  const values = new Uint8Array(depth);
  for (const statement of text.slice(text.search(/\bBEGIN\b/i) + 5).split(';')) {
    const fill = statement.match(/\[(\d+)\.\.(\d+)\]\s*:\s*([01]+)/);
    if (fill) {
      values.fill(parseInt(fill[3], 2), Number(fill[1]), Number(fill[2]) + 1);
      continue;
    }
    const row = statement.match(/(\d+)\s*:\s*((?:[01]{3}\s*)+)/);
    if (!row) continue;
    row[2].trim().split(/\s+/).forEach((value, offset) => {
      const address = Number(row[1]) + offset;
      if (address < values.length) values[address] = parseInt(value, 2);
    });
  }
  return values;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  const result = Buffer.alloc(4);
  result.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
  return result;
}

function chunk(type, data) {
  const name = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  return Buffer.concat([length, name, data, crc32(Buffer.concat([name, data]))]);
}

function png(width, height, pixels, transparentGreen = false) {
  const rows = [];
  for (let y = 0; y < height; y += 1) {
    const row = Buffer.alloc(1 + width * 4);
    for (let x = 0; x < width; x += 1) {
      const color = palette[pixels[y * width + x] ?? 0].slice();
      if (transparentGreen && pixels[y * width + x] === 2) color[3] = 0;
      row.set(color, 1 + x * 4);
    }
    rows.push(row);
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header.set([8, 6, 0, 0, 0], 8);
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header), chunk('IDAT', deflateSync(Buffer.concat(rows))), chunk('IEND', Buffer.alloc(0))
  ]);
}

async function mif(name) {
  return parseMif(await readFile(resolve(source, name), 'utf8'));
}

function winGraphic() {
  const glyphs = {
    Y: ['10001', '01010', '00100', '00100', '00100', '00100', '00100'],
    O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
    U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
    W: ['10001', '10001', '10101', '10101', '10101', '11011', '10001'],
    I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
    N: ['10001', '11001', '11001', '10101', '10011', '10011', '10001'],
    '!': ['00100', '00100', '00100', '00100', '00100', '00000', '00100']
  };
  const text = 'YOU WIN!!!';
  const scale = 2;
  const width = 112;
  const height = 18;
  const pixels = new Uint8Array(width * height).fill(2);
  let cursor = 0;
  for (const character of text) {
    if (character === ' ') { cursor += 4; continue; }
    glyphs[character].forEach((row, y) => [...row].forEach((pixel, x) => {
      if (pixel !== '1') return;
      for (let sy = 0; sy < scale; sy += 1) for (let sx = 0; sx < scale; sx += 1) {
        pixels[(2 + y * scale + sy) * width + cursor + x * scale + sx] = 6;
      }
    }));
    cursor += 12;
  }
  return { width, height, pixels };
}

await mkdir(output, { recursive: true });
const background = await mif('map320magenta.mif');
const mario = await mif('mariorunninggreen.mif');
const barrel = await mif('barrel.mif');
const win = winGraphic();

await Promise.all([
  writeFile(resolve(output, 'donkey-kong-background.png'), png(320, 240, background)),
  writeFile(resolve(output, 'donkey-kong-mario.png'), png(16, 16, mario, true)),
  writeFile(resolve(output, 'donkey-kong-barrel.png'), png(12, 12, barrel, true)),
  writeFile(resolve(output, 'donkey-kong-win.png'), png(win.width, win.height, win.pixels, true))
]);

const preview = background.slice();
const stamp = (sprite, width, height, left, top) => {
  for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
    const value = sprite[y * width + x];
    if (value !== 2) preview[(top + y) * 320 + left + x] = value;
  }
};
stamp(mario, 16, 16, 35, 205);
stamp(barrel, 12, 12, 16, 16);
stamp(barrel, 12, 12, 170, 103);
await writeFile(resolve(output, 'donkey-kong-preview.png'), png(320, 240, preview));

process.stdout.write('Generated Donkey Kong browser assets from Quartus MIF memories.\n');
