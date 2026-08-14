export const OLED_WIDTH = 128;
export const OLED_HEIGHT = 64;
export const MAX_PARTICLES = 3000;
export const FIXED_SHIFT = 8;
export const FIXED_ONE = 1 << FIXED_SHIFT;
export const GRAVITY_MAG = 80;
export const MODES = ['normal', 'wind', 'shake', 'explosion'];
export const PLANETS = Object.freeze({ moon: 0.16, earth: 1, jupiter: 2.5 });
export const WORLD_GRAVITY = Object.freeze({ x: 0, y: 0, z: -1 });
export const DEFAULT_POSE = Object.freeze({ roll: 0, pitch: 0, yaw: 0 });
export const POSE_LIMITS = Object.freeze({
  roll: [-180, 180], pitch: [-80, 80], yaw: [-180, 180]
});

const DAMPING = 253;
const MAX_VELOCITY = 6 * FIXED_ONE;
const SHAKE_STRENGTH = 3 * FIXED_ONE;
const EXPLOSION_STRENGTH = 700;
const EXPLOSION_FRAMES = 180;

export function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function gridGet(grid, x, y) {
  if (x < 0 || x >= OLED_WIDTH || y < 0 || y >= OLED_HEIGHT) return 1;
  const index = y * (OLED_WIDTH >> 3) + (x >> 3);
  return (grid[index] >> (x & 7)) & 1;
}

function gridSet(grid, x, y, occupied) {
  if (x < 0 || x >= OLED_WIDTH || y < 0 || y >= OLED_HEIGHT) return;
  const index = y * (OLED_WIDTH >> 3) + (x >> 3);
  const mask = 1 << (x & 7);
  if (occupied) grid[index] |= mask;
  else grid[index] &= ~mask;
}

function findSpawnCell(grid, random, seed) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const x = Math.floor(random() * OLED_WIDTH);
    const y = Math.floor(random() * OLED_HEIGHT);
    if (!gridGet(grid, x, y)) return [x, y];
  }
  const cells = OLED_WIDTH * OLED_HEIGHT;
  for (let offset = 0; offset < cells; offset += 1) {
    const index = (seed * 97 + offset) % cells;
    const x = index % OLED_WIDTH;
    const y = Math.floor(index / OLED_WIDTH);
    if (!gridGet(grid, x, y)) return [x, y];
  }
  return null;
}

function chooseWind(random) {
  const straight = Math.trunc(GRAVITY_MAG / 1.3);
  const diagonal = Math.trunc(GRAVITY_MAG / 1.5);
  return [
    [straight, 0], [-straight, 0], [0, straight], [0, -straight],
    [diagonal, diagonal], [diagonal, -diagonal], [-diagonal, diagonal], [-diagonal, -diagonal]
  ][Math.floor(random() * 8) % 8];
}

export function createSandbox(count = MAX_PARTICLES, random = Math.random) {
  const grid = new Uint8Array((OLED_WIDTH * OLED_HEIGHT) >> 3);
  const particles = [];
  for (let index = 0; index < Math.min(count, MAX_PARTICLES); index += 1) {
    const cell = findSpawnCell(grid, random, index);
    if (!cell) break;
    const [x, y] = cell;
    gridSet(grid, x, y, 1);
    const subpixelX = Math.min(FIXED_ONE - 1, Math.floor(random() * FIXED_ONE));
    const subpixelY = Math.min(FIXED_ONE - 1, Math.floor(random() * FIXED_ONE));
    particles.push({
      x: (x << FIXED_SHIFT) + subpixelX,
      y: (y << FIXED_SHIFT) + subpixelY,
      vx: 0,
      vy: 0
    });
  }
  return {
    pose: { ...DEFAULT_POSE }, mode: 'normal', planet: 'earth', particles, grid,
    wind: [0, 0], explosionFrames: 0, lastExplosion: null, frame: 0
  };
}

export function particlePixelX(particle) {
  return particle.x >> FIXED_SHIFT;
}

export function particlePixelY(particle) {
  return particle.y >> FIXED_SHIFT;
}

export function setPoseValue(state, axis, value) {
  if (!(axis in POSE_LIMITS)) return;
  const [minimum, maximum] = POSE_LIMITS[axis];
  state.pose[axis] = clamp(Number(value) || 0, minimum, maximum);
}

export function resetPose(state) {
  Object.assign(state.pose, DEFAULT_POSE);
}

export function setMode(state, mode, random = Math.random) {
  if (!MODES.includes(mode) || mode === state.mode) return;
  state.mode = mode;
  state.explosionFrames = 0;
  if (mode === 'wind') state.wind = chooseWind(random);
}

export function cycleMode(state, offset = 1, random = Math.random) {
  const index = MODES.indexOf(state.mode);
  setMode(state, MODES[(index + offset + MODES.length) % MODES.length], random);
}

export function setPlanet(state, planet) {
  if (planet in PLANETS) state.planet = planet;
}

export function getGravityMagnitude(state) {
  return PLANETS[state.planet];
}

export function getGravityVector(state) {
  const roll = state.pose.roll * Math.PI / 180;
  const pitch = state.pose.pitch * Math.PI / 180;
  const magnitude = GRAVITY_MAG * getGravityMagnitude(state);

  // The OLED starts in the vertical Y-Z plane facing +X. Its pixel X follows
  // world +Y and its pixel-up direction follows world +Z. Transform fixed
  // world -Z through the inverse Z-Y-X device rotation, then flip OLED-local Y
  // because pixel rows increase downward. Yaw drops out around the gravity axis.
  const localX = WORLD_GRAVITY.z * Math.sin(roll) * Math.cos(pitch);
  const localY = WORLD_GRAVITY.z * Math.cos(roll) * Math.cos(pitch);
  let gx = clamp(Math.round(localX * magnitude), -GRAVITY_MAG, GRAVITY_MAG) || 0;
  let gy = clamp(Math.round(-localY * magnitude), -GRAVITY_MAG, GRAVITY_MAG) || 0;
  if (state.mode === 'wind') {
    gx = clamp(gx + state.wind[0], -GRAVITY_MAG, GRAVITY_MAG);
    gy = clamp(gy + state.wind[1], -GRAVITY_MAG, GRAVITY_MAG);
  }
  return { gx, gy };
}

export function getGravityDirection(state) {
  return 'down';
}

function shake(state, random) {
  state.particles.forEach((particle) => {
    particle.vx = clamp(particle.vx + Math.floor(random() * SHAKE_STRENGTH * 2) - SHAKE_STRENGTH, -MAX_VELOCITY, MAX_VELOCITY);
    particle.vy = clamp(particle.vy + Math.floor(random() * SHAKE_STRENGTH * 2) - SHAKE_STRENGTH, -MAX_VELOCITY, MAX_VELOCITY);
  });
}

export function findBuriedExplosionCenter(state, random = Math.random) {
  if (!state.particles.length) return { particle: null, depth: 0 };

  const cellCount = OLED_WIDTH * OLED_HEIGHT;
  const unvisited = 255;
  const depths = new Uint8Array(cellCount);
  const queue = new Int32Array(cellCount);
  depths.fill(unvisited);
  let head = 0;
  let tail = 0;

  // Seed every empty pixel, then flood into occupied pixels. The resulting
  // value for each particle is its Manhattan distance from the nearest void.
  for (let y = 0; y < OLED_HEIGHT; y += 1) {
    for (let x = 0; x < OLED_WIDTH; x += 1) {
      if (gridGet(state.grid, x, y)) continue;
      const index = y * OLED_WIDTH + x;
      depths[index] = 0;
      queue[tail] = index;
      tail += 1;
    }
  }

  while (head < tail) {
    const index = queue[head];
    head += 1;
    const x = index % OLED_WIDTH;
    const y = Math.floor(index / OLED_WIDTH);
    const nextDepth = depths[index] + 1;
    for (const neighbor of [index - 1, index + 1, index - OLED_WIDTH, index + OLED_WIDTH]) {
      if (neighbor < 0 || neighbor >= cellCount || depths[neighbor] !== unvisited) continue;
      const neighborX = neighbor % OLED_WIDTH;
      if (Math.abs(neighborX - x) + Math.abs(Math.floor(neighbor / OLED_WIDTH) - y) !== 1) continue;
      depths[neighbor] = nextDepth;
      queue[tail] = neighbor;
      tail += 1;
    }
  }

  let deepestDepth = -1;
  const deepestParticles = [];
  state.particles.forEach((particle) => {
    const index = particlePixelY(particle) * OLED_WIDTH + particlePixelX(particle);
    const depth = depths[index] === unvisited ? 0 : depths[index];
    if (depth > deepestDepth) {
      deepestDepth = depth;
      deepestParticles.length = 0;
      deepestParticles.push(particle);
    } else if (depth === deepestDepth) deepestParticles.push(particle);
  });

  const choice = Math.min(deepestParticles.length - 1, Math.floor(random() * deepestParticles.length));
  return { particle: deepestParticles[Math.max(0, choice)], depth: Math.max(0, deepestDepth) };
}

function explode(state, random) {
  const buriedCenter = findBuriedExplosionCenter(state, random);
  const center = buriedCenter.particle || { x: 64 << FIXED_SHIFT, y: 32 << FIXED_SHIFT };
  const centerX = particlePixelX(center);
  const centerY = particlePixelY(center);
  state.lastExplosion = { x: centerX, y: centerY, depth: buriedCenter.depth };
  state.particles.forEach((particle) => {
    const dx = particlePixelX(particle) - centerX;
    const dy = particlePixelY(particle) - centerY;
    const distanceSquared = dx * dx + dy * dy;
    if (!distanceSquared) return;
    particle.vx = clamp(particle.vx + Math.trunc((dx * EXPLOSION_STRENGTH * FIXED_ONE) / (distanceSquared + 1)), -MAX_VELOCITY, MAX_VELOCITY);
    particle.vy = clamp(particle.vy + Math.trunc((dy * EXPLOSION_STRENGTH * FIXED_ONE) / (distanceSquared + 1)), -MAX_VELOCITY, MAX_VELOCITY);
  });
}

export function updateSandbox(state, random = Math.random) {
  const gravity = getGravityVector(state);
  if (state.mode === 'shake') shake(state, random);
  if (state.mode === 'explosion') {
    state.explosionFrames += 1;
    if (state.explosionFrames >= EXPLOSION_FRAMES) {
      state.explosionFrames = 0;
      explode(state, random);
    }
  } else state.explosionFrames = 0;

  for (const particle of state.particles) {
    const currentX = particlePixelX(particle);
    const currentY = particlePixelY(particle);
    particle.vx = clamp((particle.vx + gravity.gx) * DAMPING >> FIXED_SHIFT, -MAX_VELOCITY, MAX_VELOCITY);
    particle.vy = clamp((particle.vy + gravity.gy) * DAMPING >> FIXED_SHIFT, -MAX_VELOCITY, MAX_VELOCITY);
    const proposedX = particle.x + particle.vx;
    const proposedY = particle.y + particle.vy;
    const nextX = proposedX >> FIXED_SHIFT;
    const nextY = proposedY >> FIXED_SHIFT;
    if (nextX === currentX && nextY === currentY) {
      particle.x = proposedX;
      particle.y = proposedY;
      continue;
    }

    gridSet(state.grid, currentX, currentY, 0);
    if (!gridGet(state.grid, nextX, nextY)) {
      gridSet(state.grid, nextX, nextY, 1);
      particle.x = proposedX;
      particle.y = proposedY;
      continue;
    }

    const slideLeftX = currentX - Math.trunc(gravity.gy / GRAVITY_MAG);
    const slideLeftY = currentY + Math.trunc(gravity.gx / GRAVITY_MAG);
    const slideRightX = currentX + Math.trunc(gravity.gy / GRAVITY_MAG);
    const slideRightY = currentY - Math.trunc(gravity.gx / GRAVITY_MAG);
    const downX = Math.sign(gravity.gx);
    const downY = Math.sign(gravity.gy);
    const options = [
      [slideLeftX + downX, slideLeftY + downY],
      [slideRightX + downX, slideRightY + downY]
    ];
    if ((currentX + currentY) & 1) options.reverse();
    const destination = options.find(([x, y]) => !gridGet(state.grid, x, y));
    if (destination) {
      const [x, y] = destination;
      gridSet(state.grid, x, y, 1);
      particle.x = (x << FIXED_SHIFT) + (proposedX & (FIXED_ONE - 1));
      particle.y = (y << FIXED_SHIFT) + (proposedY & (FIXED_ONE - 1));
      particle.vx >>= 1;
      particle.vy >>= 1;
    } else {
      gridSet(state.grid, currentX, currentY, 1);
      particle.vx = 0;
      particle.vy = 0;
    }
  }
  state.frame += 1;
}
