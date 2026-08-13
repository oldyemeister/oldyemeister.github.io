import { WIDTH, HEIGHT, TICK_RATE, createMask, createGame, setControl, jump, tick, resetGame } from './donkey-kong-engine.js';

const canvas = document.querySelector('[data-donkey-kong-canvas]');
if (!canvas) throw new Error('Donkey Kong canvas is missing.');
const context = canvas.getContext('2d');
context.imageSmoothingEnabled = false;
const labels = JSON.parse(document.querySelector('#donkey-kong-content').textContent);
const elements = {
  status: document.querySelector('[data-dk-status]'),
  collisions: document.querySelector('[data-dk-collisions]'),
  barrels: document.querySelector('[data-dk-barrels]'),
  message: document.querySelector('[data-dk-message]'),
  pause: document.querySelector('[data-dk-pause]'),
  overlay: document.querySelector('[data-dk-overlay]')
};
const assets = {};
let game;
let previousTime = performance.now();
let accumulator = 0;

function loadImage(name, source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => { assets[name] = image; resolve(image); };
    image.onerror = reject;
    image.src = source;
  });
}

function maskFromBackground(image) {
  const buffer = document.createElement('canvas');
  buffer.width = WIDTH;
  buffer.height = HEIGHT;
  const bufferContext = buffer.getContext('2d', { willReadFrequently: true });
  bufferContext.drawImage(image, 0, 0);
  const rgba = bufferContext.getImageData(0, 0, WIDTH, HEIGHT).data;
  const values = new Uint8Array(WIDTH * HEIGHT);
  for (let index = 0; index < values.length; index += 1) {
    const offset = index * 4;
    values[index] = rgba[offset] > 200 && rgba[offset + 2] > 200 && rgba[offset + 1] < 80 ? 1 : 0;
  }
  return createMask(values);
}

function render() {
  if (!game) return;
  context.clearRect(0, 0, WIDTH, HEIGHT);
  context.drawImage(assets.background, 0, 0);
  game.barrels.forEach((barrel) => {
    if (!barrel.active) return;
    context.save();
    context.translate(Math.round(barrel.x) + 6, Math.round(barrel.y) + 6);
    context.rotate(barrel.rotation);
    context.drawImage(assets.barrel, -6, -6);
    context.restore();
  });
  context.save();
  if (game.player.direction < 0) {
    context.translate(Math.round(game.player.x) * 2 + 16, 0);
    context.scale(-1, 1);
    context.drawImage(assets.mario, Math.round(game.player.x), Math.round(game.player.y));
  } else context.drawImage(assets.mario, Math.round(game.player.x), Math.round(game.player.y));
  context.restore();
  if (game.status === 'won') context.drawImage(assets.win, 202, 18);
}

function updateInterface() {
  if (!game) return;
  const status = game.status === 'won' ? labels.won : game.paused ? labels.paused : labels.running;
  elements.status.textContent = status;
  elements.collisions.textContent = String(game.collisions);
  elements.barrels.textContent = String(game.barrels.filter((barrel) => barrel.active).length);
  elements.message.textContent = game.status === 'won' ? labels.wonMessage : game.paused ? labels.pausedMessage : labels.ready;
  elements.pause.classList.toggle('is-paused', game.paused);
  elements.pause.setAttribute('aria-label', game.paused ? labels.resume : labels.pause);
  elements.pause.title = game.paused ? labels.resume : labels.pause;
  elements.overlay.hidden = game.status !== 'won';
}

function reset() {
  resetGame(game);
  accumulator = 0;
  previousTime = performance.now();
  updateInterface();
  render();
  canvas.focus();
}

function animate(time) {
  const elapsed = Math.min((time - previousTime) / 1000, 0.1);
  previousTime = time;
  accumulator += elapsed;
  while (accumulator >= 1 / TICK_RATE) {
    tick(game);
    accumulator -= 1 / TICK_RATE;
  }
  render();
  updateInterface();
  requestAnimationFrame(animate);
}

function directionForKey(key) {
  if (key === 'a' || key === 'ArrowLeft') return 'left';
  if (key === 'd' || key === 'ArrowRight') return 'right';
  return null;
}

window.addEventListener('keydown', (event) => {
  if (event.target.matches('input, textarea, select')) return;
  const direction = directionForKey(event.key);
  if (direction) { event.preventDefault(); setControl(game, direction, true); }
  if ((event.key === 'w' || event.key === 'ArrowUp') && !event.repeat) { event.preventDefault(); jump(game); }
  if (event.key === ' ' && !event.repeat && game.status === 'running') { event.preventDefault(); game.paused = !game.paused; }
  if (event.key.toLowerCase() === 'r') reset();
});
window.addEventListener('keyup', (event) => {
  const direction = directionForKey(event.key);
  if (direction) setControl(game, direction, false);
});

document.querySelectorAll('[data-dk-direction]').forEach((button) => {
  const direction = button.dataset.dkDirection;
  const release = () => setControl(game, direction, false);
  button.addEventListener('pointerdown', (event) => { event.preventDefault(); button.setPointerCapture(event.pointerId); setControl(game, direction, true); });
  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('lostpointercapture', release);
});
document.querySelector('[data-dk-jump]').addEventListener('click', () => jump(game));
document.querySelectorAll('[data-dk-reset]').forEach((button) => button.addEventListener('click', reset));
elements.pause.addEventListener('click', () => { if (game.status === 'running') game.paused = !game.paused; });

Promise.all([
  loadImage('background', labels.background), loadImage('mario', labels.mario),
  loadImage('barrel', labels.barrel), loadImage('win', labels.win)
]).then(() => {
  game = createGame(maskFromBackground(assets.background));
  updateInterface();
  requestAnimationFrame(animate);
}).catch(() => { elements.message.textContent = labels.loadError; });
