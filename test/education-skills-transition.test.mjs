import test from 'node:test';
import assert from 'node:assert/strict';
import { educationSkillsMotion as motion } from '../assets/js/education-skills-transition.js';

const desktop = { educationHeight: 1216, viewportHeight: 900, contentClearance: 387 };
test('Education exits slower while Skills stays on its natural scroll path', () => {
  const start = motion({ ...desktop, skillsTop: 900 });
  const middle = motion({ ...desktop, skillsTop: 450 });
  const end = motion({ ...desktop, skillsTop: 0 });
  assert.equal(start.offset, 0);
  assert.equal(middle.progress, .5);
  assert.ok(Math.abs(end.offset - 194.56) < 1e-8);
  assert.equal(middle.offset, end.offset / 2);
  const delta = motion({ ...desktop, skillsTop: 400 }).offset - motion({ ...desktop, skillsTop: 600 }).offset;
  assert.ok(delta > 40 && delta < 45, 'about 157px outgoing movement per 200px scroll');
});
test('mobile travel uses its real section height and smaller multiplier', () => {
  const end = motion({ educationHeight: 949, viewportHeight: 844, contentClearance: 192, mobile: true, skillsTop: 0 });
  assert.equal(end.offset, 63.3);
});
test('travel protects copy and short or very tall section geometry', () => {
  assert.equal(motion({ ...desktop, skillsTop: 0, contentClearance: 48 }).offset, 16);
  assert.equal(motion({ ...desktop, skillsTop: 0, contentClearance: 12 }).offset, 0);
  assert.equal(motion({ ...desktop, skillsTop: 0, educationHeight: 600 }).offset, 0);
  assert.equal(motion({ ...desktop, skillsTop: 0, educationHeight: 5000 }).offset, 225);
  assert.equal(motion({ ...desktop, skillsTop: 0, viewportHeight: 400 }).offset, 100);
});
test('scroll reversal, anchor jumps and out-of-range positions are deterministic', () => {
  const positions = [1100, 900, 450, 0, -200];
  const forward = positions.map(skillsTop => motion({ ...desktop, skillsTop }));
  const backward = positions.toReversed().map(skillsTop => motion({ ...desktop, skillsTop })).reverse();
  assert.deepEqual(forward, backward);
  assert.equal(forward[0].offset, 0);
  assert.equal(forward.at(-1).offset, forward.at(-2).offset);
  assert.deepEqual(motion({ ...desktop, skillsTop: NaN }), { progress: 0, travel: 0, offset: 0 });
});
