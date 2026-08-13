import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_POSE, MAX_PARTICLES, MODES, OLED_WIDTH, OLED_HEIGHT, WORLD_GRAVITY,
  createSandbox, particlePixelX, particlePixelY, setPoseValue, resetPose,
  setMode, cycleMode, setPlanet, getGravityMagnitude, getGravityVector,
  getGravityDirection, updateSandbox
} from '../assets/js/imu-sandbox-engine.js';

function seededRandom(seed = 12345) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
}

test('IMU sandbox uses the firmware display and sand capacity', () => {
  const state = createSandbox(MAX_PARTICLES, seededRandom());
  assert.equal(OLED_WIDTH, 128);
  assert.equal(OLED_HEIGHT, 64);
  assert.equal(MAX_PARTICLES, 3000);
  assert.equal(state.particles.length, MAX_PARTICLES);
  assert.equal(state.grid.length, 1024);
  assert.deepEqual(state.pose, DEFAULT_POSE);
});

test('only the original Euler rotation axes are interactive', () => {
  const state = createSandbox(0);
  setPoseValue(state, 'x', 50);
  setPoseValue(state, 'roll', 500);
  setPoseValue(state, 'pitch', -500);
  setPoseValue(state, 'yaw', 500);
  assert.deepEqual(state.pose, { roll: 180, pitch: -80, yaw: 180 });
  resetPose(state);
  assert.deepEqual(state.pose, DEFAULT_POSE);
});

test('world gravity is fixed to negative Z and projects through the full 3D pose', () => {
  const state = createSandbox(0);
  assert.deepEqual(WORLD_GRAVITY, { x: 0, y: 0, z: -1 });
  setPoseValue(state, 'roll', 0);
  setPoseValue(state, 'pitch', 0);
  setPoseValue(state, 'yaw', 0);
  assert.deepEqual(getGravityVector(state), { gx: 0, gy: 80 });
  setPoseValue(state, 'roll', 90);
  assert.deepEqual(getGravityVector(state), { gx: -80, gy: 0 });
  setPoseValue(state, 'roll', 0);
  setPoseValue(state, 'pitch', 80);
  assert.deepEqual(getGravityVector(state), { gx: 0, gy: 14 });
  setPoseValue(state, 'yaw', 90);
  assert.deepEqual(getGravityVector(state), { gx: 0, gy: 14 });
  assert.equal(getGravityDirection(state), 'down');
});

test('yaw around world Z does not move settled sand gravity', () => {
  const state = createSandbox(0);
  setPoseValue(state, 'roll', 45);
  setPoseValue(state, 'pitch', 30);
  const gravity = getGravityVector(state);
  for (const yaw of [-180, -90, 0, 90, 180]) {
    setPoseValue(state, 'yaw', yaw);
    assert.deepEqual(getGravityVector(state), gravity);
  }
});

test('planet selector applies the original gravity magnitudes', () => {
  const state = createSandbox(0);
  setPoseValue(state, 'roll', 80);
  setPoseValue(state, 'pitch', 0);
  setPoseValue(state, 'yaw', 0);
  setPlanet(state, 'moon');
  assert.equal(getGravityMagnitude(state), 0.16);
  assert.deepEqual(getGravityVector(state), { gx: -13, gy: 2 });
  setPlanet(state, 'earth');
  assert.equal(getGravityMagnitude(state), 1);
  assert.deepEqual(getGravityVector(state), { gx: -79, gy: 14 });
  setPlanet(state, 'jupiter');
  assert.equal(getGravityMagnitude(state), 2.5);
  assert.deepEqual(getGravityVector(state), { gx: -80, gy: 35 });
});

test('mode selection cycles through the four active firmware modes', () => {
  const state = createSandbox(0);
  MODES.forEach((mode) => {
    setMode(state, mode, () => 0);
    assert.equal(state.mode, mode);
  });
  setMode(state, 'normal');
  cycleMode(state, -1);
  assert.equal(state.mode, 'explosion');
});

test('bit-grid collision keeps 3000 particles in unique OLED cells', () => {
  const state = createSandbox(MAX_PARTICLES, seededRandom());
  setPoseValue(state, 'roll', 45);
  setPoseValue(state, 'pitch', -45);
  for (let frame = 0; frame < 180; frame += 1) updateSandbox(state, seededRandom(frame));
  const occupied = new Set();
  state.particles.forEach((particle) => {
    const x = particlePixelX(particle);
    const y = particlePixelY(particle);
    assert.ok(x >= 0 && x < OLED_WIDTH);
    assert.ok(y >= 0 && y < OLED_HEIGHT);
    occupied.add(`${x},${y}`);
  });
  assert.equal(occupied.size, MAX_PARTICLES);
  assert.equal(state.frame, 180);
});

test('explosion mode triggers at 180 updates, equivalent to three seconds at 60 fps', () => {
  const random = seededRandom(2718);
  const state = createSandbox(32, random);
  setPoseValue(state, 'roll', 0);
  setPoseValue(state, 'pitch', 0);
  setPoseValue(state, 'yaw', 0);
  setMode(state, 'explosion');
  for (let frame = 0; frame < 179; frame += 1) updateSandbox(state, random);
  assert.equal(state.explosionFrames, 179);
  updateSandbox(state, random);
  assert.equal(state.explosionFrames, 0);
  assert.ok(state.particles.some((particle) => particle.vx !== 0 || particle.vy !== 0));
});
