import * as THREE from '../vendor/three.module.min.js';
import {
  OLED_WIDTH, OLED_HEIGHT, createSandbox, particlePixelX, particlePixelY,
  setPoseValue, resetPose, setMode, cycleMode, setPlanet, updateSandbox
} from './imu-sandbox-engine.js?v=11';

const host = document.querySelector('[data-imu-scene]');
if (!host) throw new Error('IMU Sandbox scene is missing.');
const labels = JSON.parse(document.querySelector('#imu-content').textContent);
const status = document.querySelector('[data-imu-status]');
const canvas = document.createElement('canvas');
canvas.className = 'imu-webgl-canvas';
canvas.tabIndex = 0;
canvas.setAttribute('aria-label', labels.canvasLabel);
canvas.setAttribute('aria-describedby', 'imu-controls-description');
host.prepend(canvas);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(1);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d1212);
const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 50);
camera.position.set(0, 0.4, 11.5);

scene.add(new THREE.HemisphereLight(0xe7fff9, 0x262019, 2.2));
const keyLight = new THREE.DirectionalLight(0xffffff, 3.3);
keyLight.position.set(-5, 7, 8);
scene.add(keyLight);
const edgeLight = new THREE.DirectionalLight(0x4de4d2, 1.7);
edgeLight.position.set(7, -1, 4);
scene.add(edgeLight);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(28, 18),
  new THREE.MeshLambertMaterial({ color: 0x25231f })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -3.25;
scene.add(floor);
const grid = new THREE.GridHelper(22, 22, 0x41635d, 0x302f2a);
grid.position.y = -3.23;
grid.material.opacity = 0.85;
grid.material.transparent = true;
scene.add(grid);

const backWall = new THREE.Mesh(
  new THREE.PlaneGeometry(28, 18),
  new THREE.MeshLambertMaterial({ color: 0x121918 })
);
backWall.position.z = -3.8;
scene.add(backWall);
const backGrid = new THREE.GridHelper(22, 22, 0x41635d, 0x293532);
backGrid.rotation.x = Math.PI / 2;
backGrid.position.z = -3.76;
backGrid.material.opacity = 0.7;
backGrid.material.transparent = true;
scene.add(backGrid);

const screenCanvas = document.createElement('canvas');
screenCanvas.width = OLED_WIDTH;
screenCanvas.height = OLED_HEIGHT;
const screenContext = screenCanvas.getContext('2d');
screenContext.imageSmoothingEnabled = false;
const screenImage = screenContext.createImageData(OLED_WIDTH, OLED_HEIGHT);
const screenPixels = new Uint32Array(screenImage.data.buffer);
const screenTexture = new THREE.CanvasTexture(screenCanvas);
screenTexture.colorSpace = THREE.SRGBColorSpace;
screenTexture.magFilter = THREE.NearestFilter;
screenTexture.minFilter = THREE.NearestFilter;

const device = new THREE.Group();
scene.add(device);
const board = new THREE.Mesh(
  new THREE.BoxGeometry(6.9, 3.85, 0.28),
  new THREE.MeshLambertMaterial({ color: 0x064f43 })
);
device.add(board);

const bezel = new THREE.Mesh(
  new THREE.BoxGeometry(6.15, 3.1, 0.34),
  new THREE.MeshPhongMaterial({ color: 0x090b0b, shininess: 24 })
);
bezel.position.z = 0.18;
device.add(bezel);
const display = new THREE.Mesh(
  new THREE.PlaneGeometry(5.72, 2.86),
  new THREE.MeshBasicMaterial({ map: screenTexture, color: 0xffffff })
);
display.position.z = 0.36;
device.add(display);

const metal = new THREE.MeshPhongMaterial({ color: 0xc1cbc8, shininess: 80 });
for (const [x, y] of [[-3.1, -1.62], [3.1, -1.62], [-3.1, 1.62], [3.1, 1.62]]) {
  const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.08, 18), metal);
  screw.rotation.x = Math.PI / 2;
  screw.position.set(x, y, 0.2);
  device.add(screw);
}
for (let index = 0; index < 4; index += 1) {
  const pin = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.1), metal);
  pin.position.set(-0.24 + index * 0.16, -2.13, 0);
  device.add(pin);
}

const state = createSandbox();
const inputs = [...document.querySelectorAll('[data-imu-axis]')];
const values = new Map([...document.querySelectorAll('[data-imu-value]')].map((element) => [element.dataset.imuValue, element]));
const modeButtons = [...document.querySelectorAll('[data-imu-mode]')];
const modeValue = document.querySelector('[data-imu-mode-value]');
const gravityMagnitude = document.querySelector('[data-imu-gravity-magnitude]');
const planetButtons = [...document.querySelectorAll('[data-imu-planet]')];
let previousTime = performance.now();
let physicsAccumulator = 0;
let dragging = null;
host.imuSandboxState = state;

function syncPose() {
  device.rotation.order = 'XYZ';
  device.rotation.set(
    THREE.MathUtils.degToRad(-state.pose.pitch),
    THREE.MathUtils.degToRad(state.pose.yaw),
    THREE.MathUtils.degToRad(state.pose.roll)
  );
  inputs.forEach((input) => { input.value = state.pose[input.dataset.imuAxis]; });
  values.forEach((element, axis) => {
    const suffix = ['roll', 'pitch', 'yaw'].includes(axis) ? '°' : '';
    element.textContent = `${Number(state.pose[axis]).toFixed(1)}${suffix}`;
  });
}

function syncGravity() {
  const planet = labels.planets[state.planet];
  gravityMagnitude.textContent = `${planet.label} · ${planet.gravity}`;
  planetButtons.forEach((button) => {
    const active = button.dataset.imuPlanet === state.planet;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function syncMode() {
  modeButtons.forEach((button) => {
    const active = button.dataset.imuMode === state.mode;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  modeValue.textContent = labels.modes[state.mode];
}

function drawScreen() {
  screenPixels.fill(0xff0f1100);
  state.particles.forEach((particle) => {
    screenPixels[particlePixelY(particle) * OLED_WIDTH + particlePixelX(particle)] = 0xfff7ffb8;
  });
  screenContext.putImageData(screenImage, 0, 0);
  screenTexture.needsUpdate = true;
}

function resize() {
  const width = Math.max(1, host.clientWidth);
  const height = Math.max(1, host.clientHeight);
  renderer.setSize(Math.ceil(width * 0.6), Math.ceil(height * 0.6), false);
  camera.aspect = width / height;
  camera.position.z = 11.5 * Math.max(1, 1.12 / camera.aspect);
  camera.updateProjectionMatrix();
}

function setAxis(axis, value) {
  setPoseValue(state, axis, value);
  syncPose();
  syncGravity();
}

inputs.forEach((input) => input.addEventListener('input', () => setAxis(input.dataset.imuAxis, input.value)));
modeButtons.forEach((button) => button.addEventListener('click', () => {
  setMode(state, button.dataset.imuMode);
  syncMode();
  syncGravity();
  canvas.focus();
}));
planetButtons.forEach((button) => button.addEventListener('click', () => {
  setPlanet(state, button.dataset.imuPlanet);
  syncGravity();
  canvas.focus();
}));
document.querySelector('[data-imu-reset]').addEventListener('click', () => { resetPose(state); syncPose(); syncGravity(); canvas.focus(); });

canvas.addEventListener('pointerdown', (event) => {
  dragging = { x: event.clientX, y: event.clientY };
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener('pointermove', (event) => {
  if (!dragging) return;
  const dx = event.clientX - dragging.x;
  const dy = event.clientY - dragging.y;
  dragging.x = event.clientX;
  dragging.y = event.clientY;
  setPoseValue(state, 'yaw', state.pose.yaw + dx * 0.35);
  setPoseValue(state, 'pitch', state.pose.pitch + dy * 0.3);
  syncPose();
  syncGravity();
});
canvas.addEventListener('pointerup', () => { dragging = null; });
canvas.addEventListener('pointercancel', () => { dragging = null; });
canvas.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') setPoseValue(state, 'yaw', state.pose.yaw - 4);
  else if (event.key === 'ArrowRight') setPoseValue(state, 'yaw', state.pose.yaw + 4);
  else if (event.key === 'ArrowUp') setPoseValue(state, 'pitch', state.pose.pitch + 4);
  else if (event.key === 'ArrowDown') setPoseValue(state, 'pitch', state.pose.pitch - 4);
  else if (event.key.toLowerCase() === 'q') setPoseValue(state, 'roll', state.pose.roll - 4);
  else if (event.key.toLowerCase() === 'e') setPoseValue(state, 'roll', state.pose.roll + 4);
  else if (event.key === ' ') { cycleMode(state); syncMode(); syncGravity(); }
  else return;
  event.preventDefault();
  syncPose();
});

function animate(time) {
  const seconds = Math.min(0.25, (time - previousTime) / 1000);
  previousTime = time;
  physicsAccumulator += seconds;
  while (physicsAccumulator >= 1 / 60) {
    updateSandbox(state);
    physicsAccumulator -= 1 / 60;
  }
  drawScreen();
  renderer.render(scene, camera);
  if (status && !status.hidden) {
    status.hidden = true;
    host.classList.add('is-ready');
    window.dispatchEvent(new CustomEvent('imu-sandbox-ready'));
  }
  requestAnimationFrame(animate);
}

new ResizeObserver(resize).observe(host);
syncPose();
syncMode();
syncGravity();
resize();
requestAnimationFrame(animate);
