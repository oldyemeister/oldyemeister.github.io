import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SCROLL_ANIMATION } from '../assets/js/scroll-animation-config.js';
import { EDUCATION_RIBBON_SHAPES, educationRibbonPath, educationRibbonProgress } from '../assets/js/education-ribbon.js';

const subpaths = path => path.split('M').filter(Boolean).map(part =>
  part.replace(/[HVZ].*$/, '').split('L').map(pair => pair.trim().split(/\s+/).map(Number)));

test('ribbon progress runs from the configured start to end positions', () => {
  const { ribbonStartVh, ribbonEndVh } = SCROLL_ANIMATION.education;
  assert.equal(educationRibbonProgress(ribbonStartVh * 10 + 50, 1000), 0);
  assert.equal(educationRibbonProgress(ribbonEndVh * 10 - 50, 1000), 1);
  let previous = -1;
  for (let top = ribbonStartVh * 10; top >= ribbonEndVh * 10; top -= 25) {
    const p = educationRibbonProgress(top, 1000);
    assert.ok(p >= previous);
    previous = p;
  }
});

test('ribbon starts as a short left-edge sliver and clears its clip when complete', () => {
  assert.equal(educationRibbonPath(1440, 1216, 1), null);
  const [band] = subpaths(educationRibbonPath(1440, 1216, 0));
  assert.equal(band[0][0], 0);
  assert.ok(Math.max(...band.map(([x]) => x)) < 1440 * .2);
  const [late] = subpaths(educationRibbonPath(1440, 1216, .97));
  assert.ok(Math.max(...late.map(([x]) => x)) >= 1439.9);
});

test('ribbon tip advances and thickens monotonically with progress', () => {
  let reach = 0;
  let area = 0;
  for (let p = 0; p < 1; p += .05) {
    const [band] = subpaths(educationRibbonPath(1920, 1400, p));
    const half = band.length / 2;
    const x = Math.max(...band.map(([x]) => x));
    const thickness = band.slice(0, half).reduce((sum, [, y], i) => sum + band[band.length - 1 - i][1] - y, 0);
    assert.ok(x >= reach - .01);
    assert.ok(thickness >= area - .01);
    reach = x;
    area = thickness;
  }
});

test('ribbon shapes match the Education mask artwork', () => {
  for (const [name, file] of [['desktop', 'education-mask-desktop.svg'], ['mobile', 'education-mask-mobile.svg']]) {
    const svg = readFileSync(new URL(`../assets/themes/persona/images/revival/${file}`, import.meta.url), 'utf8');
    const shape = EDUCATION_RIBBON_SHAPES[name];
    const [[x0, y0], c1, c2, end] = shape.lower;
    assert.ok(svg.includes(`M${x0} ${y0}C${c1.join(' ')} ${c2.join(' ')} ${end.join(' ')}`), `${name} lower edge`);
    // The band rises above Education by `top` units, along `rise`.
    assert.ok(svg.includes(`viewBox="0 ${shape.top} ${shape.width} ${shape.height - shape.top}"`), `${name} overhang`);
    const [r0, r1, r2, r3] = shape.rise;
    assert.ok(svg.includes(`V${r3[1]}C${r2.join(' ')} ${r1.join(' ')} ${r0.join(' ')}`), `${name} rise`);
    assert.deepEqual(r0, shape.upper[0]);
  }
});

test('ribbon geometry is cheap enough to rebuild every frame', () => {
  const start = performance.now();
  for (let i = 0; i < 200; i++) educationRibbonPath(1440, 1216, i / 200);
  assert.ok((performance.now() - start) / 200 < 2);
});
