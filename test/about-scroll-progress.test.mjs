import test, { beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { aboutScrollProgress, aboutOuterRing, aboutRibbonProgress, educationDecorProgress } from '../assets/js/about-scroll-progress.js';
import { SCROLL_ANIMATION } from '../assets/js/scroll-animation-config.js';
// Test the math against a stable fixture, independently of editable design tuning.
const originalSettings = structuredClone(SCROLL_ANIMATION);
beforeEach(() => {
  Object.assign(SCROLL_ANIMATION.about, {
    circlesStartFraction: .5, circlesTravelVh: 50, textCompleteAt: .3,
    barsDelayVh: 8, barsDelayPx: 0, barsTravelVh: 30,
  });
  Object.assign(SCROLL_ANIMATION.education, {
    enterAtVh: 95, afterAboutBarsStartVh: 10, barsDelayVh: 0,
    barsDelayPx: 0, barsTravelVh: 30, pillsDelayVh: 8, pillsTravelVh: 30,
  });
});
after(() => Object.assign(SCROLL_ANIMATION, originalSettings));

test('About starts when half entered and finishes half a viewport later', () => {
  assert.deepEqual(aboutScrollProgress(700, 600, 1000), {progress:0, text:0});
  assert.equal(aboutScrollProgress(450, 600, 1000).progress, .5);
  assert.deepEqual(aboutScrollProgress(200, 600, 1000), {progress:1, text:1});
});
test('fast jumps clamp, reverse scrolling follows position, and text finishes early', () => {
  assert.equal(aboutScrollProgress(-2000, 600, 1000).progress, 1);
  assert.equal(aboutScrollProgress(450, 600, 1000).progress, .5);
  assert.deepEqual(aboutScrollProgress(2000, 600, 1000), {progress:0, text:0});
  assert.equal(aboutScrollProgress(550, 600, 1000).text, 1);
});
test('tall phone sections use a reachable trigger', () => {
  assert.equal(aboutScrollProgress(400, 1200, 800).progress, 0);
  assert.equal(aboutScrollProgress(0, 1200, 800).progress, 1);
});

test('About ribbons start later and still reverse', () => {
  assert.equal(aboutRibbonProgress(1240, 1000, 600), 0);
  assert.equal(aboutRibbonProgress(1015, 1000, 600), 0);
  assert.equal(aboutRibbonProgress(865, 1000, 600), .875);
  assert.equal(aboutRibbonProgress(715, 1000, 600), 1);
  assert.equal(aboutRibbonProgress(1015, 1000, 600), 0);
});

test('outer ring grows thinner at intermediate progress and preserves final edges', () => {
  const start = aboutOuterRing(0), middle = aboutOuterRing(.5), end = aboutOuterRing(1);
  assert.equal(start.width, 16);
  assert.ok(middle.width > start.width && middle.width < 168 * .5);
  assert.equal(middle.radius - middle.width / 2, 864);
  assert.deepEqual(end, {width:168, radius:948});
});

 test('Education overlaps About settling, then pills follow', () => {
  assert.deepEqual(educationDecorProgress(950, 950, 600, 1000), {bars:0, pills:0});
  const entering = educationDecorProgress(865, 865, 600, 1000);
  assert.ok(entering.bars > 0);
  assert.equal(entering.pills, 0);
  const middle = educationDecorProgress(600, 600, 600, 1000);
  assert.ok(middle.bars > middle.pills && middle.pills > 0);
  assert.deepEqual(educationDecorProgress(400, 400, 600, 1000), {bars:1, pills:1});
 });
