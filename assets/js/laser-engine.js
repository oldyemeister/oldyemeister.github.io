export const WIDTH = 320;
export const HEIGHT = 240;
export const START_TIME = 120;
export const HIT_THRESHOLD = 45;
export const CHARGE_RATE = 30;
export const CHARGE_COOLDOWN = 0.5;
export const DECAY_RATE = 24;

export const INITIAL_MIRRORS = [
  [84, 175, 0], [170, 175, 270], [259, 175, 90], [259, 108, 135],
  [259, 49, 45], [180, 49, 135], [180, 81, 90], [157, 81, 0],
  [125, 81, 0], [125, 195, 90], [58, 195, 0], [58, 140, 225],
  [58, 86, 135]
];
export const INITIAL_NODES = [
  [180, 105], [157, 65], [73, 140], [110, 81], [58, 48], [170, 138]
];
export const INITIAL_FIREWALLS = [[170, 194], [235, 108], [157, 100], [71, 86]];

const DIRECTIONS = {
  U: [0, -1],
  D: [0, 1],
  L: [-1, 0],
  R: [1, 0]
};

export function reflectedDirection(direction, angle) {
  const normalized = ((angle % 360) + 360) % 360;
  if (normalized === 45 || normalized === 225) {
    return { D: 'L', R: 'U', U: 'R', L: 'D' }[direction];
  }
  if (normalized === 135 || normalized === 315) {
    return { D: 'R', L: 'U', U: 'L', R: 'D' }[direction];
  }
  if ((normalized === 0 || normalized === 180) && (direction === 'L' || direction === 'R')) {
    return direction === 'L' ? 'R' : 'L';
  }
  if ((normalized === 90 || normalized === 270) && (direction === 'U' || direction === 'D')) {
    return direction === 'U' ? 'D' : 'U';
  }
  return direction;
}

function insideObject(x, y, object) {
  return object.active && Math.abs(x - object.x) <= 5 && Math.abs(y - object.y) <= 5;
}

function pointOnMirror(x, y, mirror) {
  const dx = x - mirror.x;
  const dy = y - mirror.y;
  switch (mirror.angle) {
    case 0:
    case 180:
      return Math.abs(dx) <= 1 && Math.abs(dy) <= 5;
    case 90:
    case 270:
      return Math.abs(dy) <= 1 && Math.abs(dx) <= 5;
    case 45:
    case 225:
      return Math.abs(dx + dy) <= 1 && Math.abs(dx) <= 3 && Math.abs(dy) <= 3;
    case 135:
    case 315:
      return Math.abs(dx - dy) <= 1 && Math.abs(dx) <= 3 && Math.abs(dy) <= 3;
    default:
      return false;
  }
}

export function createGame() {
  return {
    mirrors: INITIAL_MIRRORS.map(([x, y, angle]) => ({ x, y, angle })),
    nodes: INITIAL_NODES.map(([x, y]) => ({ x, y, active: true, hits: 0, cooldown: 0 })),
    firewalls: INITIAL_FIREWALLS.map(([x, y]) => ({ x, y, active: true, hits: 0, cooldown: 0 })),
    selectedMirror: 0,
    secondsLeft: START_TIME,
    lives: 2,
    targetsDestroyed: 0,
    firewallsDestroyed: 0,
    status: 'running',
    paused: false
  };
}

export function selectMirror(game, offset) {
  game.selectedMirror = (game.selectedMirror + offset + game.mirrors.length) % game.mirrors.length;
}

export function rotateMirror(game, offset) {
  const mirror = game.mirrors[game.selectedMirror];
  mirror.angle = (mirror.angle + offset + 360) % 360;
}

export function selectMirrorAt(game, x, y, radius = 12) {
  let nearest = -1;
  let distance = radius * radius;
  game.mirrors.forEach((mirror, index) => {
    const candidate = (mirror.x - x) ** 2 + (mirror.y - y) ** 2;
    if (candidate <= distance) {
      nearest = index;
      distance = candidate;
    }
  });
  if (nearest >= 0) game.selectedMirror = nearest;
  return nearest;
}

export function traceLaser(game) {
  let x = 84;
  let y = 81;
  let direction = 'D';
  let previousMirror = -1;
  const points = [{ x, y }];

  for (let step = 0; step < 1600; step += 1) {
    const [dx, dy] = DIRECTIONS[direction];
    x += dx;
    y += dy;
    if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) {
      return { points, hit: null };
    }
    points.push({ x, y });

    const firewallIndex = game.firewalls.findIndex((firewall) => insideObject(x, y, firewall));
    if (firewallIndex >= 0) return { points, hit: { type: 'firewall', index: firewallIndex } };
    const nodeIndex = game.nodes.findIndex((node) => insideObject(x, y, node));
    if (nodeIndex >= 0) return { points, hit: { type: 'node', index: nodeIndex } };

    const mirrorIndex = game.mirrors.findIndex((mirror) => pointOnMirror(x, y, mirror));
    if (mirrorIndex >= 0 && mirrorIndex !== previousMirror) {
      const mirror = game.mirrors[mirrorIndex];
      const [incomingX, incomingY] = DIRECTIONS[direction];
      const currentDistance = (x - mirror.x) ** 2 + (y - mirror.y) ** 2;
      const centeredX = x + incomingX;
      const centeredY = y + incomingY;
      const centeredDistance = (centeredX - mirror.x) ** 2 + (centeredY - mirror.y) ** 2;
      if (centeredDistance < currentDistance) {
        x = centeredX;
        y = centeredY;
        points.push({ x, y });
      }
      direction = reflectedDirection(direction, mirror.angle);
      previousMirror = mirrorIndex;
    } else if (mirrorIndex < 0) {
      previousMirror = -1;
    }
  }
  return { points, hit: null };
}

export function applyLaserHit(game, hit) {
  if (!hit || game.status !== 'running' || game.paused) return;
  const collection = hit.type === 'node' ? game.nodes : game.firewalls;
  const object = collection[hit.index];
  if (!object?.active) return;
  object.hits += 1;
  object.cooldown = CHARGE_COOLDOWN;
  if (object.hits < HIT_THRESHOLD) return;

  object.active = false;
  if (hit.type === 'node') {
    game.targetsDestroyed += 1;
    if (game.targetsDestroyed === game.nodes.length) game.status = 'won';
  } else {
    game.firewallsDestroyed += 1;
    game.lives = Math.max(0, game.lives - 1);
    if (game.lives === 0) game.status = 'lost';
  }
}

export function updateTargetProgress(game, hit, seconds) {
  if (game.status !== 'running' || game.paused || seconds <= 0) return;
  const hitKey = hit ? `${hit.type}:${hit.index}` : '';

  for (const [type, collection] of [['node', game.nodes], ['firewall', game.firewalls]]) {
    collection.forEach((object, index) => {
      if (!object.active) return;
      if (`${type}:${index}` === hitKey) {
        object.cooldown = CHARGE_COOLDOWN;
        object.hits = Math.min(HIT_THRESHOLD, object.hits + CHARGE_RATE * seconds);
        if (object.hits >= HIT_THRESHOLD) {
          object.hits = HIT_THRESHOLD - 1;
          applyLaserHit(game, { type, index });
        }
        return;
      }

      if (object.cooldown > 0) {
        object.cooldown = Math.max(0, object.cooldown - seconds);
      } else if (object.hits > 0) {
        object.hits = Math.max(0, object.hits - DECAY_RATE * seconds);
      }
    });
  }
}

export function advanceTimer(game, seconds) {
  if (game.status !== 'running' || game.paused) return;
  game.secondsLeft = Math.max(0, game.secondsLeft - seconds);
  if (game.secondsLeft === 0) game.status = 'lost';
}
