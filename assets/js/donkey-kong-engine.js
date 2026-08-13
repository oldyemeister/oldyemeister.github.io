export const WIDTH = 320;
export const HEIGHT = 240;
export const PLAYER_SIZE = 16;
export const BARREL_SIZE = 12;
export const TICK_RATE = 48;
export const JUMP_HEIGHT = 44;
export const JUMP_SPEED = 2;
export const MARIO_SPEED = 2;
export const BARREL_SPEED = 1;
export const RESPAWN_GRACE_TICKS = 24;
export const BARREL_HITBOX_INSET = 3;
export const BARREL_ROTATION_STEP = Math.PI / 2;
export const BARREL_PIXELS_PER_ROTATION_STEP = 4;

export function createMask(values = new Uint8Array(WIDTH * HEIGHT)) {
  return { values, solid(x, y) {
    const px = Math.round(x);
    const py = Math.round(y);
    return px >= 0 && px < WIDTH && py >= 0 && py < HEIGHT && values[py * WIDTH + px] === 1;
  } };
}

export function createGame(mask) {
  return {
    mask,
    player: { x: 35, y: 205, direction: 0, jumping: false, descending: false, jumpStart: 205, jumpDirection: 0 },
    barrels: [
      { x: 16, y: 16, rotation: 0, rollDistance: 0, active: true },
      { x: -100, y: -100, rotation: 0, rollDistance: 0, active: false }
    ],
    controls: { left: false, right: false },
    status: 'running',
    paused: false,
    collisions: 0,
    respawnGrace: 0
  };
}

function rowTouches(mask, left, right, y) {
  for (let x = Math.floor(left); x <= Math.ceil(right); x += 1) if (mask.solid(x, y)) return true;
  return false;
}

function standing(game, object, size) {
  return rowTouches(game.mask, object.x + 1, object.x + size - 2, object.y + size);
}

function touchingAbove(game, player) {
  return player.y <= 0 || rowTouches(game.mask, player.x + 2, player.x + PLAYER_SIZE - 3, player.y - 1);
}

function overlap(a, aSize, b, bSize) {
  return a.x < b.x + bSize && a.x + aSize > b.x && a.y < b.y + bSize && a.y + aSize > b.y;
}

function barrelHitsPlayer(player, barrel) {
  const hitbox = { x: barrel.x + BARREL_HITBOX_INSET, y: barrel.y + BARREL_HITBOX_INSET };
  return overlap(player, PLAYER_SIZE, hitbox, BARREL_SIZE - BARREL_HITBOX_INSET * 2);
}

function resetPlayer(game) {
  Object.assign(game.player, { x: 35, y: 205, direction: 0, jumping: false, descending: false, jumpStart: 205, jumpDirection: 0 });
}

function resetActors(game) {
  resetPlayer(game);
  Object.assign(game.barrels[0], { x: 16, y: 16, rotation: 0, rollDistance: 0, active: true });
  Object.assign(game.barrels[1], { x: -100, y: -100, rotation: 0, rollDistance: 0, active: false });
}

export function resetGame(game) {
  resetActors(game);
  game.status = 'running';
  game.paused = false;
  game.collisions = 0;
  game.respawnGrace = 0;
}

export function setControl(game, direction, active) {
  if (direction === 'left' || direction === 'right') game.controls[direction] = active;
}

export function jump(game) {
  const player = game.player;
  if (game.status !== 'running' || game.paused || player.jumping || !standing(game, player, PLAYER_SIZE)) return false;
  player.jumping = true;
  player.descending = false;
  player.jumpStart = player.y;
  player.jumpDirection = player.direction;
  return true;
}

function moveBarrel(game, barrel) {
  if (!barrel.active) return;
  const roll = (direction) => {
    barrel.x += direction;
    barrel.rollDistance += direction;
    const quarterTurns = Math.trunc(barrel.rollDistance / BARREL_PIXELS_PER_ROTATION_STEP);
    barrel.rotation = ((quarterTurns % 4) + 4) % 4 * BARREL_ROTATION_STEP;
  };
  if (!standing(game, barrel, BARREL_SIZE)) {
    barrel.y += 1;
  } else if (barrel.y < 95) {
    for (let step = 0; step < BARREL_SPEED; step += 1) {
      if (barrel.x < 294) roll(1);
      else { barrel.y += 1; break; }
    }
  } else if (barrel.y < 140) {
    for (let step = 0; step < BARREL_SPEED; step += 1) {
      if (barrel.x > 20) roll(-1);
      else { barrel.y += 1; break; }
    }
  } else if (barrel.y < 190) {
    for (let step = 0; step < BARREL_SPEED; step += 1) {
      if (barrel.x < 294) roll(1);
      else { barrel.y += 1; break; }
    }
  } else {
    for (let step = 0; step < BARREL_SPEED; step += 1) {
      if (barrel.x > 20) roll(-1);
      else if (barrel.y > 210) { Object.assign(barrel, { x: 16, y: 16, rotation: 0, rollDistance: 0 }); break; }
      else { barrel.y += 1; break; }
    }
  }
}

function movePlayer(game) {
  const player = game.player;
  if (player.jumping) {
    if (!player.descending) {
      for (let step = 0; step < JUMP_SPEED; step += 1) {
        if (player.y <= player.jumpStart - JUMP_HEIGHT || touchingAbove(game, player)) {
          player.descending = true;
          break;
        }
        player.y -= 1;
      }
    } else {
      for (let step = 0; step < JUMP_SPEED; step += 1) {
        if (standing(game, player, PLAYER_SIZE)) {
          player.jumping = false;
          player.descending = false;
          break;
        }
        player.y += 1;
      }
    }
    player.x += player.jumpDirection * MARIO_SPEED;
    player.x = Math.max(0, Math.min(WIDTH - PLAYER_SIZE, player.x));
    return;
  }

  const direction = Number(game.controls.right) - Number(game.controls.left);
  player.direction = direction;
  for (let step = 0; step < MARIO_SPEED && direction !== 0; step += 1) {
    player.x = Math.max(0, Math.min(WIDTH - PLAYER_SIZE, player.x + direction));
    const leftSlope = game.mask.solid(player.x + 1, player.y + PLAYER_SIZE - 1);
    const rightSlope = game.mask.solid(player.x + PLAYER_SIZE - 2, player.y + PLAYER_SIZE - 1);
    if (standing(game, player, PLAYER_SIZE) && (leftSlope || rightSlope)) player.y -= 1;
  }
  if (!standing(game, player, PLAYER_SIZE)) player.y += 1;
}

export function tick(game) {
  if (game.paused || game.status !== 'running') return;
  if (game.respawnGrace > 0) game.respawnGrace -= 1;
  const first = game.barrels[0];
  if (!game.barrels[1].active && first.x < 40 && first.y >= 154 && first.y <= 157) {
    Object.assign(game.barrels[1], { x: 16, y: 16, rotation: 0, rollDistance: 0, active: true });
  }
  game.barrels.forEach((barrel) => moveBarrel(game, barrel));
  movePlayer(game);

  if (game.player.x >= 121 && game.player.x <= 126 && game.player.y <= 51) {
    game.status = 'won';
    return;
  }
  if (game.respawnGrace === 0 && game.barrels.some((barrel) => barrel.active && barrelHitsPlayer(game.player, barrel))) {
    game.collisions += 1;
    resetPlayer(game);
    game.respawnGrace = RESPAWN_GRACE_TICKS;
  }
}
