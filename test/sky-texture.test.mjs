import test from 'node:test';
import assert from 'node:assert/strict';
import { skyTextureGeometry } from '../assets/js/sky-texture.js';
test('sky rows, phase and period remain on the device grid across responsive SVG scales', () => {
  for (const width of [375, 899, 900, 1440, 1920]) for (const dpr of [1, 2]) for (const scale of [.60066, 1.5377, 1.7685]) {
    const origin = -401.4285, g = skyTextureGeometry(width, scale, dpr, origin);
    for (const n of [g.period, ...g.rows]) assert.ok(Math.abs(n * scale * dpr - Math.round(n * scale * dpr)) < 1e-8);
    const phase = (origin + g.offset * scale) * dpr;
    assert.ok(Math.abs(phase - Math.round(phase)) < 1e-8);
    if (width < 900) assert.ok(g.period * scale >= 3.5);
  }
});
test('1920px reference has exactly seven one-device-pixel rows at 1x', () => {
  assert.deepEqual(skyTextureGeometry(1920, 1, 1, 0), {period:7, rows:[1,2,3,4,5,6], offset:0});
});
