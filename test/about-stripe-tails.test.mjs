import test from 'node:test';
import assert from 'node:assert/strict';
import { traceStripes, stripeTailPath } from '../assets/js/about-stripe-tails.js';

// Opaque (yellow) mask with open stripes: each moves `slope` px right per row down.
function maskWith(stripes, width = 200, height = 20) {
  const alpha = new Uint8Array(width * height).fill(255);
  for (const { left, size, slope } of stripes) {
    for (let y = 0; y < height; y++) {
      const start = Math.round(left + slope * (y - (height - 1)));
      for (let x = Math.max(0, start); x < Math.min(width, start + size); x++) alpha[y * width + x] = 0;
    }
  }
  return { alpha, width, height };
}

test('traces each stripe at the bottom row with its slope', () => {
  const { alpha, width, height } = maskWith([{ left: 50, size: 6, slope: 2 }, { left: 120, size: 4, slope: -1 }]);
  const stripes = traceStripes(alpha, width, height);
  assert.equal(stripes.length, 2);
  assert.deepEqual([stripes[0].left, stripes[0].right], [50, 56]);
  assert.ok(Math.abs(stripes[0].leftSlope - 2) < .1 && Math.abs(stripes[0].rightSlope - 2) < .1);
  assert.ok(Math.abs(stripes[1].leftSlope + 1) < .1);
  assert.equal(stripes[0].rows, height);
});

test('a fully yellow bottom row produces no tails', () => {
  const { alpha, width, height } = maskWith([]);
  assert.deepEqual(traceStripes(alpha, width, height), []);
  assert.equal(stripeTailPath([]), '');
});

test('tails start at the boundary and end in a point further along the stripe', () => {
  const { alpha, width, height } = maskWith([{ left: 50, size: 6, slope: 2 }]);
  const path = stripeTailPath(traceStripes(alpha, width, height));
  const numbers = path.match(/-?\d+(\.\d+)?/g).map(Number);
  const points = [];
  for (let i = 0; i < numbers.length; i += 2) points.push(numbers.slice(i, i + 2));
  // Starts on About's edge (y = 1 after the 1px overlap) at the stripe's left edge.
  assert.deepEqual(points[1], [50, 1]);
  const tip = points.reduce((deepest, point) => point[1] > deepest[1] ? point : deepest);
  // Tip continues rightward like the stripe, and lies below the boundary.
  assert.ok(tip[0] > 53 && tip[1] > 10);
});

test('tail coordinates are converted from device pixels', () => {
  const stripe = { left: 40, right: 52, leftSlope: 0, rightSlope: 0, rows: 10 };
  const path = stripeTailPath([stripe], 2);
  assert.ok(path.startsWith('M20.00 0.50L20.00 1.00'));
});

test('heads heading left run straight off the left edge at constant width', () => {
  const stripe = { left: 100, right: 120, leftSlope: -1, rightSlope: -1, rows: 10 };
  const path = stripeTailPath([stripe], 1, { originY: 500, direction: -1, exitLeft: true, maxDepth: 400 });
  const points = path.match(/-?\d+(\.\d+)?/g).map(Number).reduce((all, n, i, list) => i % 2 ? all : [...all, [n, list[i + 1]]], []);
  assert.equal(points.length, 4);
  const [, farLeft, farRight] = points;
  assert.ok(farRight[0] < 0 && farLeft[0] < 0);
  assert.equal(farRight[0] - farLeft[0], 20);
  assert.ok(farLeft[1] < 500);
  // A stripe heading right still tapers instead.
  assert.match(stripeTailPath([{ ...stripe, leftSlope: 1, rightSlope: 1 }], 1, { exitLeft: true }), /Q/);
});
