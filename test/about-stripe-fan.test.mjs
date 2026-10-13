import test from 'node:test';
import assert from 'node:assert/strict';
import { stripeFanGeometry } from '../assets/js/about-stripe-fan.js';
for (const scale of [16 / 288, 230.4 / 288]) {
  test(`fan keeps physical angles, seam overlap and an 8px kick at scale ${scale}`, () => {
    const height = 1600 / scale;
    const bands = stripeFanGeometry(Array(18).fill(16), height, .4, 8 / scale);
    for (let i = 0; i < bands.length; i++) {
      const b = bands[i];
      assert.ok(Math.abs(b.width * (b.scaleX - 1) * scale * Math.cos(b.angle * Math.PI / 180) - 8) < 1e-8);
      if (!i) continue;
      const prev = bands[i - 1];
      assert.ok(Math.abs(b.angle - prev.angle - .4) < 1e-8);
      // Cross-sections at multiple heights must overlap, including full growth.
      for (let y = 0; y <= height; y += height / 20) {
        const left = b.right - b.width / Math.cos(b.angle * Math.PI / 180) + (height - y) * Math.tan(b.angle * Math.PI / 180);
        const previousRight = prev.right + (height - y) * Math.tan(prev.angle * Math.PI / 180);
        assert.ok(left <= previousRight, `gap at band ${i}, y=${y}`);
      }
    }
  });
}
