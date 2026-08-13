import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HIT_THRESHOLD, CHARGE_COOLDOWN, createGame, reflectedDirection, selectMirror, rotateMirror,
  selectMirrorAt, traceLaser, applyLaserHit, updateTargetProgress, advanceTimer
} from '../assets/js/laser-engine.js';

test('diagonal mirrors reflect in every direction', () => {
  assert.equal(reflectedDirection('D', 45), 'L');
  assert.equal(reflectedDirection('L', 45), 'D');
  assert.equal(reflectedDirection('D', 135), 'R');
  assert.equal(reflectedDirection('R', 315), 'D');
});

test('selection wraps and rotation stays normalized', () => {
  const game = createGame();
  selectMirror(game, -1);
  assert.equal(game.selectedMirror, 12);
  rotateMirror(game, -45);
  assert.equal(game.mirrors[12].angle, 90);
  assert.equal(selectMirrorAt(game, 84, 175), 0);
  assert.equal(game.selectedMirror, 0);
});

test('initial board produces a bounded laser trace', () => {
  const trace = traceLaser(createGame());
  assert.ok(trace.points.length > 1);
  assert.ok(trace.points.length < 1601);
  assert.ok(trace.points.every(({ x, y }) => x >= 0 && x < 320 && y >= 0 && y < 240));
});

test('laser advances one pixel to a mirror center before reflecting', () => {
  const game = createGame();
  game.mirrors = [{ x: 84, y: 90, angle: 90 }];
  game.nodes = [];
  game.firewalls = [];
  const trace = traceLaser(game);
  const centerIndex = trace.points.findIndex((point) => point.x === 84 && point.y === 90);
  assert.ok(centerIndex > 0);
  assert.deepEqual(trace.points[centerIndex - 1], { x: 84, y: 89 });
  assert.deepEqual(trace.points[centerIndex + 1], { x: 84, y: 89 });
});

test('nodes require sustained hits and trigger a win', () => {
  const game = createGame();
  game.nodes.slice(0, -1).forEach((node) => { node.active = false; });
  game.targetsDestroyed = game.nodes.length - 1;
  for (let hit = 0; hit < HIT_THRESHOLD; hit += 1) applyLaserHit(game, { type: 'node', index: 5 });
  assert.equal(game.nodes[5].active, false);
  assert.equal(game.status, 'won');
});

test('two destroyed firewalls consume both lives and fail', () => {
  const game = createGame();
  for (let hit = 0; hit < HIT_THRESHOLD; hit += 1) applyLaserHit(game, { type: 'firewall', index: 0 });
  for (let hit = 0; hit < HIT_THRESHOLD; hit += 1) applyLaserHit(game, { type: 'firewall', index: 1 });
  assert.equal(game.lives, 0);
  assert.equal(game.status, 'lost');
});

test('timer ignores pause and fails at zero', () => {
  const game = createGame();
  game.paused = true;
  advanceTimer(game, 120);
  assert.equal(game.secondsLeft, 120);
  game.paused = false;
  advanceTimer(game, 120);
  assert.equal(game.secondsLeft, 0);
  assert.equal(game.status, 'lost');
});

test('target charge holds during cooldown then decays after the laser leaves', () => {
  const game = createGame();
  updateTargetProgress(game, { type: 'node', index: 0 }, 0.5);
  assert.equal(game.nodes[0].hits, 15);
  updateTargetProgress(game, null, CHARGE_COOLDOWN);
  assert.equal(game.nodes[0].hits, 15);
  updateTargetProgress(game, null, 0.25);
  assert.equal(game.nodes[0].hits, 9);
  updateTargetProgress(game, null, 1);
  assert.equal(game.nodes[0].hits, 0);
});

test('cooldown and decay freeze while paused', () => {
  const game = createGame();
  updateTargetProgress(game, { type: 'firewall', index: 0 }, 0.5);
  game.paused = true;
  updateTargetProgress(game, null, 10);
  assert.equal(game.firewalls[0].hits, 15);
  assert.equal(game.firewalls[0].cooldown, CHARGE_COOLDOWN);
});

test('continuous elapsed-time charge destroys a target in 1.5 seconds', () => {
  const game = createGame();
  updateTargetProgress(game, { type: 'node', index: 0 }, 1.5);
  assert.equal(game.nodes[0].active, false);
  assert.equal(game.targetsDestroyed, 1);
});
