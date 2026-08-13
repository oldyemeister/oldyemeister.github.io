export const OLED_WIDTH = 128;
export const OLED_HEIGHT = 64;
export const MAX_PARTICLES = 3000;
export const FIXED_SHIFT = 8;
export const FIXED_ONE = 1 << FIXED_SHIFT;
export const GRAVITY_MAG = 80;
export const MODES = ['normal', 'wind', 'shake', 'explosion'];
export const PLANETS = Object.freeze({ moon: 0.16, earth: 1, jupiter: 2.5 });
export const WORLD_GRAVITY = Object.freeze({ x: 0, y: 0, z: -1 });
export const DEFAULT_POSE = Object.freeze({ roll: -8, pitch: 12, yaw: -10 });
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
    particles.push({ x: x << FIXED_SHIFT, y: y << FIXED_SHIFT, vx: 0, vy: 2 * FIXED_ONE });
  }
  return {
    pose: { ...DEFAULT_POSE }, mode: 'normal', planet: 'earth', particles, grid,
    wind: [0, 0], explosionFrames: 0, frame: 0
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
  const pitch = state.pose.pitch * Math.PI / 180;
  const yaw = state.pose.yaw * Math.PI / 180;
  const roll = state.pose.roll * Math.PI / 180;
  const magnitude = GRAVITY_MAG * getGravityMagnitude(state);

  // The renderer applies Euler XYZ as rotateX(-pitch), rotateY(yaw),
  // rotateZ(roll). Transform fixed world -Z by the inverse rotation, then
  // flip local Y because OLED pixel rows increase from top to bottom.
  const tiltedX = -WORLD_GRAVITY.z * Math.sin(yaw) * Math.cos(pitch);
  const tiltedY = -WORLD_GRAVITY.z * Math.sin(pitch);
  const localX = tiltedX * Math.cos(roll) + tiltedY * Math.sin(roll);
  const localY = -tiltedX * Math.sin(roll) + tiltedY * Math.cos(roll);
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

function explode(state, random) {
  const center = state.particles[Math.floor(random() * state.particles.length)] || { x: 64 << FIXED_SHIFT, y: 32 << FIXED_SHIFT };
  const centerX = particlePixelX(center);
  const centerY = particlePixelY(center);
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
    const nextX = (particle.x + particle.vx) >> FIXED_SHIFT;
    const nextY = (particle.y + particle.vy) >> FIXED_SHIFT;
    if (nextX === currentX && nextY === currentY) continue;

    gridSet(state.grid, currentX, currentY, 0);
    if (!gridGet(state.grid, nextX, nextY)) {
      gridSet(state.grid, nextX, nextY, 1);
      particle.x = nextX << FIXED_SHIFT;
      particle.y = nextY << FIXED_SHIFT;
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
      particle.x = x << FIXED_SHIFT;
      particle.y = y << FIXED_SHIFT;
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
