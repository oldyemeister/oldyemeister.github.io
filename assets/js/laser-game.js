import {
  WIDTH, HEIGHT, HIT_THRESHOLD, createGame, selectMirror, rotateMirror,
  selectMirrorAt, traceLaser, updateTargetProgress, advanceTimer
} from './laser-engine.js';

const canvas = document.querySelector('[data-laser-canvas]');
if (!canvas) throw new Error('Laser puzzle canvas is missing.');
const context = canvas.getContext('2d');
const labels = JSON.parse(document.querySelector('#laser-content').textContent);
const elements = {
  timer: document.querySelector('[data-game-timer]'),
  lives: document.querySelector('[data-game-lives]'),
  targets: document.querySelector('[data-game-targets]'),
  selected: document.querySelector('[data-game-selected]'),
  message: document.querySelector('[data-game-message]'),
  pause: document.querySelector('[data-game-pause]'),
  overlay: document.querySelector('[data-game-overlay]'),
  overlayTitle: document.querySelector('[data-game-overlay-title]')
};
let game = createGame();
let previousTime = performance.now();
let timerAccumulator = 0;

const assets = {};
for (const [name, source] of Object.entries({
  background: labels.background, node: labels.node, firewall: labels.firewall,
  success: labels.success, failure: labels.failure
})) {
  const image = new Image();
  image.src = source;
  image.addEventListener('load', () => { assets[name] = image; render(traceLaser(game)); });
}

const GAME_PALETTE = {
  board: '#10191c', grid: '#2a393d', mirror: '#f2f5f3', selected: '#f1c654',
  laser: '#00fff7', node: '#4baeff', firewall: '#ff676f', text: '#edf2ef', backgroundAlpha: 0.82
};

function palette() { return GAME_PALETTE; }

function drawBoardBackground(colors) {
  context.fillStyle = colors.board;
  context.fillRect(0, 0, WIDTH, HEIGHT);
  if (assets.background) {
    context.globalAlpha = colors.backgroundAlpha;
    context.drawImage(assets.background, 0, 0, WIDTH, HEIGHT);
    context.globalAlpha = 1;
  } else {
    context.strokeStyle = colors.grid;
    context.lineWidth = 0.5;
    for (let x = 0; x < WIDTH; x += 20) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x, HEIGHT); context.stroke(); }
    for (let y = 0; y < HEIGHT; y += 20) { context.beginPath(); context.moveTo(0, y); context.lineTo(WIDTH, y); context.stroke(); }
  }
}

function drawObject(object, type, colors) {
  if (!object.active) return;
  const image = assets[type];
  if (image) context.drawImage(image, object.x - 5.5, object.y - 5.5, 11, 11);
  else {
    context.fillStyle = type === 'node' ? colors.node : colors.firewall;
    context.fillRect(object.x - 5, object.y - 5, 11, 11);
  }
  if (object.hits > 0) {
    context.fillStyle = 'rgba(0,0,0,.55)';
    context.fillRect(object.x - 6, object.y + 8, 12, 2);
    context.fillStyle = colors.laser;
    context.fillRect(object.x - 6, object.y + 8, 12 * object.hits / HIT_THRESHOLD, 2);
  }
}

function drawMirror(mirror, index, colors) {
  const plot = (x, y, color) => {
    context.fillStyle = color;
    context.fillRect(x, y, 1, 1);
  };
  const white = colors.mirror;
  const gray = '#7b7d7b';

  if (mirror.angle % 90 === 0) {
    if (mirror.angle === 0 || mirror.angle === 180) {
      for (let offset = -5; offset <= 5; offset += 1) {
        plot(mirror.x - 1, mirror.y + offset, white);
        plot(mirror.x, mirror.y + offset, gray);
        plot(mirror.x + 1, mirror.y + offset, white);
      }
    } else {
      for (let offset = -5; offset <= 5; offset += 1) {
        plot(mirror.x + offset, mirror.y - 1, white);
        plot(mirror.x + offset, mirror.y, gray);
        plot(mirror.x + offset, mirror.y + 1, white);
      }
    }
  } else if (mirror.angle === 45 || mirror.angle === 225) {
    for (let offset = -3; offset <= 3; offset += 1) plot(mirror.x + offset, mirror.y - offset, gray);
    for (let offset = -3; offset <= 4; offset += 1) {
      const x = mirror.x + offset;
      const y = mirror.y - offset;
      plot(x - 1, y, white);
      plot(x, y + 1, white);
    }
  } else {
    for (let offset = -3; offset <= 3; offset += 1) plot(mirror.x - offset, mirror.y - offset, gray);
    for (let offset = -3; offset <= 4; offset += 1) {
      const x = mirror.x - offset;
      const y = mirror.y - offset;
      plot(x + 1, y, white);
      plot(x, y + 1, white);
    }
  }

  if (index === game.selectedMirror) {
    context.strokeStyle = colors.selected;
    context.lineWidth = 1;
    context.strokeRect(mirror.x - 8, mirror.y - 8, 16, 16);
  }
}

const SEGMENTS = [[0, 0, 4, 0], [4, 0, 4, 4], [4, 4, 4, 8], [0, 8, 4, 8], [0, 4, 0, 8], [0, 0, 0, 4], [0, 4, 4, 4]];
const DIGITS = [0b0111111, 0b0000110, 0b1011011, 0b1001111, 0b1100110, 0b1101101, 0b1111101, 0b0000111, 0b1111111, 0b1101111];

function drawDigit(x, y, number) {
  context.fillStyle = '#ffffff';
  SEGMENTS.forEach(([x1, y1, x2, y2], segment) => {
    if (!(DIGITS[number] & (1 << segment))) return;
    if (x1 === x2) context.fillRect(x + x1, y + y1, 2, y2 - y1 + 1);
    else context.fillRect(x + x1, y + y1, x2 - x1 + 1, 2);
  });
}

function drawHud(colors) {
  const seconds = Math.ceil(game.secondsLeft);
  drawDigit(210, 18, Math.floor(seconds / 60) % 10);
  context.fillStyle = '#ffffff';
  context.fillRect(218, 22, 1, 1);
  context.fillRect(218, 26, 1, 1);
  drawDigit(222, 18, Math.floor(seconds % 60 / 10));
  drawDigit(230, 18, seconds % 10);
  drawDigit(265, 18, game.lives);
}

function render(trace) {
  const colors = palette();
  drawBoardBackground(colors);
  game.nodes.forEach((node) => drawObject(node, 'node', colors));
  game.firewalls.forEach((firewall) => drawObject(firewall, 'firewall', colors));
  game.mirrors.forEach((mirror, index) => drawMirror(mirror, index, colors));
  drawHud(colors);

  context.fillStyle = '#00fff7';
  trace.points.forEach((point) => context.fillRect(point.x, point.y, 1, 1));
}

function formatTime(seconds) {
  const rounded = Math.ceil(seconds);
  return `${Math.floor(rounded / 60)}:${String(rounded % 60).padStart(2, '0')}`;
}

function updateInterface() {
  elements.timer.textContent = formatTime(game.secondsLeft);
  elements.lives.textContent = game.lives;
  elements.targets.textContent = `${game.targetsDestroyed} / ${game.nodes.length}`;
  elements.selected.textContent = `${game.selectedMirror + 1} / ${game.mirrors.length}`;
  elements.pause.setAttribute('aria-label', game.paused ? labels.resume : labels.pause);
  elements.pause.setAttribute('title', game.paused ? labels.resume : labels.pause);
  elements.pause.classList.toggle('is-paused', game.paused);
  elements.message.textContent = game.status === 'won' ? labels.won : game.status === 'lost' ? labels.lost : game.paused ? labels.paused : labels.ready;
  const ended = game.status !== 'running';
  elements.overlay.hidden = !ended;
  elements.overlayTitle.textContent = game.status === 'won' ? labels.won : labels.lost;
  elements.overlay.style.setProperty('--result-art', ended && assets[game.status === 'won' ? 'success' : 'failure']
    ? `url("${game.status === 'won' ? labels.success : labels.failure}")` : 'none');
}

function reset() {
  game = createGame();
  timerAccumulator = 0;
  previousTime = performance.now();
  updateInterface();
  render(traceLaser(game));
  canvas.focus();
}

function command(name) {
  if (name === 'previous') selectMirror(game, -1);
  if (name === 'next') selectMirror(game, 1);
  if (name === 'rotate-left') rotateMirror(game, -45);
  if (name === 'rotate-right') rotateMirror(game, 45);
  updateInterface();
  render(traceLaser(game));
}

function animate(time) {
  const elapsed = Math.min((time - previousTime) / 1000, 0.1);
  previousTime = time;
  const trace = traceLaser(game);
  if (!game.paused && game.status === 'running') {
    timerAccumulator += elapsed;
    while (timerAccumulator >= 0.1) { advanceTimer(game, 0.1); timerAccumulator -= 0.1; }
    updateTargetProgress(game, trace.hit, elapsed);
  }
  render(trace);
  updateInterface();
  requestAnimationFrame(animate);
}

canvas.addEventListener('keydown', (event) => {
  const commands = { ArrowUp: 'previous', ArrowDown: 'next', ArrowLeft: 'rotate-left', ArrowRight: 'rotate-right' };
  if (commands[event.key]) { event.preventDefault(); command(commands[event.key]); }
  if (event.key === ' ' && game.status === 'running') { event.preventDefault(); game.paused = !game.paused; updateInterface(); }
  if (event.key.toLowerCase() === 'r') { event.preventDefault(); reset(); }
});
canvas.addEventListener('pointerdown', (event) => {
  const bounds = canvas.getBoundingClientRect();
  const x = (event.clientX - bounds.left) * WIDTH / bounds.width;
  const y = (event.clientY - bounds.top) * HEIGHT / bounds.height;
  if (selectMirrorAt(game, x, y) >= 0) { updateInterface(); render(traceLaser(game)); }
  canvas.focus();
});
document.querySelectorAll('[data-game-command]').forEach((button) => button.addEventListener('click', () => command(button.dataset.gameCommand)));
document.querySelector('[data-game-reset]').addEventListener('click', reset);
document.querySelector('[data-overlay-reset]').addEventListener('click', reset);
elements.pause.addEventListener('click', () => { if (game.status === 'running') { game.paused = !game.paused; updateInterface(); } });

updateInterface();
requestAnimationFrame(animate);
