import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  WIDTH, HEIGHT, PLAYER_SIZE, JUMP_HEIGHT, JUMP_SPEED, MARIO_SPEED, BARREL_SPEED,
  BARREL_ROTATION_STEP, BARREL_PIXELS_PER_ROTATION_STEP,
  createMask, createGame, setControl, jump, tick, resetGame
} from '../assets/js/donkey-kong-engine.js';

function platformMask(y = 221) {
  const values = new Uint8Array(WIDTH * HEIGHT);
  for (let x = 0; x < WIDTH; x += 1) values[y * WIDTH + x] = 1;
  return createMask(values);
}

async function originalMapMask() {
  const source = await readFile(new URL('../tools/.reference/demos/DonkeyKong/map320magenta.mif', import.meta.url), 'utf8');
  const values = new Uint8Array(WIDTH * HEIGHT);
  for (const statement of source.slice(source.search(/\bBEGIN\b/i) + 5).split(';')) {
    const fill = statement.match(/\[(\d+)\.\.(\d+)\]\s*:\s*([01]+)/);
    if (fill) {
      values.fill(parseInt(fill[3], 2) === 5 ? 1 : 0, Number(fill[1]), Number(fill[2]) + 1);
      continue;
    }
    const row = statement.match(/(\d+)\s*:\s*((?:[01]{3}\s*)+)/);
    if (!row) continue;
    row[2].trim().split(/\s+/).forEach((value, offset) => {
      values[Number(row[1]) + offset] = parseInt(value, 2) === 5 ? 1 : 0;
    });
  }
  return createMask(values);
}

test('game starts at the Verilog reset coordinates', () => {
  const game = createGame(platformMask());
  assert.deepEqual({ x: game.player.x, y: game.player.y }, { x: 35, y: 205 });
  assert.deepEqual({ x: game.barrels[0].x, y: game.barrels[0].y }, { x: 16, y: 16 });
  assert.equal(game.barrels[1].active, false);
});

test('held horizontal control moves two pixels per game tick', () => {
  const game = createGame(platformMask());
  setControl(game, 'right', true);
  tick(game);
  assert.equal(game.player.x, 37);
  assert.equal(game.player.direction, 1);
  assert.equal(MARIO_SPEED, 2);
});

test('jump locks the current horizontal direction and rises', () => {
  const game = createGame(platformMask());
  setControl(game, 'right', true);
  tick(game);
  assert.equal(jump(game), true);
  setControl(game, 'right', false);
  for (let count = 0; count < 10; count += 1) tick(game);
  assert.ok(game.player.y < 202);
  assert.ok(game.player.x > 37);
  assert.equal(JUMP_HEIGHT, 44);
  assert.equal(JUMP_SPEED, 2);
});

test('a barrel collision resets only Mario and preserves barrel progress', () => {
  const game = createGame(platformMask());
  Object.assign(game.barrels[0], { x: game.player.x, y: game.player.y, active: true });
  Object.assign(game.barrels[1], { x: 200, y: 190, active: true });
  tick(game);
  assert.equal(game.collisions, 1);
  assert.equal(game.player.x, 35);
  assert.equal(game.player.y, 205);
  assert.deepEqual({ x: game.barrels[0].x, y: game.barrels[0].y }, { x: 35, y: 206 });
  assert.equal(game.barrels[1].active, true);
  assert.notDeepEqual({ x: game.barrels[1].x, y: game.barrels[1].y }, { x: -100, y: -100 });
});

test('respawn grace prevents the same barrel from causing repeated hits', () => {
  const game = createGame(platformMask());
  Object.assign(game.barrels[0], { x: game.player.x, y: game.player.y, active: true });
  tick(game);
  tick(game);
  assert.equal(game.collisions, 1);
});

test('a jump cannot pass through a magenta ceiling', () => {
  const values = platformMask().values;
  for (let x = 0; x < WIDTH; x += 1) values[170 * WIDTH + x] = 1;
  const game = createGame(createMask(values));
  assert.equal(jump(game), true);
  let highestY = game.player.y;
  for (let count = 0; count < 60; count += 1) {
    tick(game);
    highestY = Math.min(highestY, game.player.y);
  }
  assert.equal(highestY, 171);
  assert.ok(game.player.y >= 205);
});

test('barrels leave the bottom-right boundary instead of sticking at y 190', () => {
  const game = createGame(platformMask(202));
  game.barrels[1].active = false;
  Object.assign(game.barrels[0], { x: 294, y: 190, active: true });
  tick(game);
  assert.equal(game.barrels[0].x, 293);
  assert.equal(game.barrels[0].y, 190);
  assert.equal(BARREL_SPEED, 1);
  assert.equal(game.barrels[0].rotation, 0);
});

test('barrel rotation uses quarter turns and follows horizontal direction', () => {
  const game = createGame(platformMask(92));
  game.barrels[1].active = false;
  Object.assign(game.barrels[0], { x: 40, y: 80, rotation: 0, rollDistance: 0, active: true });
  for (let count = 0; count < BARREL_PIXELS_PER_ROTATION_STEP; count += 1) tick(game);
  assert.equal(game.barrels[0].rotation, BARREL_ROTATION_STEP);
  game.mask = platformMask(112);
  Object.assign(game.barrels[0], { x: 40, y: 100, rotation: 0, rollDistance: 0, active: true });
  for (let count = 0; count < BARREL_PIXELS_PER_ROTATION_STEP; count += 1) tick(game);
  assert.equal(game.barrels[0].rotation, Math.PI * 3 / 2);
});

test('grazing the outer edge of a barrel does not hit Mario', () => {
  const game = createGame(platformMask());
  Object.assign(game.barrels[0], { x: game.player.x + PLAYER_SIZE - 1, y: game.player.y, active: true });
  tick(game);
  assert.equal(game.collisions, 0);
});

test('barrels are forced down when they reach a platform edge', () => {
  const game = createGame(platformMask(92));
  game.barrels[1].active = false;
  Object.assign(game.barrels[0], { x: 294, y: 80, active: true });
  tick(game);
  assert.equal(game.barrels[0].x, 294);
  assert.equal(game.barrels[0].y, 81);
});

test('both barrels keep moving through the original board route', async () => {
  const game = createGame(await originalMapMask());
  Object.assign(game.player, { x: 150, y: -10000 });
  let secondSpawned = false;
  let longestStop = 0;
  let stoppedTicks = 0;
  let previous = `${game.barrels[0].x},${game.barrels[0].y}`;
  for (let count = 0; count < 3000; count += 1) {
    tick(game);
    secondSpawned ||= game.barrels[1].active;
    const current = `${game.barrels[0].x},${game.barrels[0].y}`;
    stoppedTicks = current === previous ? stoppedTicks + 1 : 0;
    longestStop = Math.max(longestStop, stoppedTicks);
    previous = current;
  }
  assert.equal(secondSpawned, true);
  assert.ok(longestStop < 3, `barrel stopped for ${longestStop} ticks`);
});

test('the original top goal coordinate wins the game', () => {
  const game = createGame(platformMask(66));
  Object.assign(game.player, { x: 123, y: 50 });
  game.barrels.forEach((barrel) => { barrel.active = false; });
  tick(game);
  assert.equal(game.status, 'won');
});

test('reset restores an ended game', () => {
  const game = createGame(platformMask());
  game.status = 'won';
  game.collisions = 4;
  resetGame(game);
  assert.equal(game.status, 'running');
  assert.equal(game.collisions, 0);
  assert.equal(game.player.y, 205);
  assert.equal(PLAYER_SIZE, 16);
});
