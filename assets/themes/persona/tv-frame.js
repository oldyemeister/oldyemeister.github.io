// Shared presentation only: move existing nodes, never clone the canvas or controls.
(function () {
  const television = document.querySelector('.persona-tv-screen .persona-tv');
  const stage = television?.querySelector('[data-game-wrap], [data-imu-scene]');
  if (!stage || television.querySelector('.tv-frame-cabinet')) return;
  const imu = stage.matches('[data-imu-scene]');
  const section = television.closest('section');

  television.querySelector('.tv-antennas').outerHTML = `
    <svg class="tv-antennas" viewBox="0 0 660 290" aria-hidden="true" focusable="false">
      <path fill="currentColor" fill-rule="evenodd" d="M235 270 20 117Q3 103 24 100L143 97Q170 98 184 128L251 258ZM211 234 92 134 145 135ZM304 253 403 28Q416-3 450 5L626 44Q667 53 638 82L330 273ZM341 236 447 82Q453 72 465 75L525 89Q542 92 531 107Z"/>
      <path fill="currentColor" d="M188 290a103 77 0 0 1 206 0Z"/>
    </svg>`;

  const cabinet = document.createElement('div');
  cabinet.className = 'tv-frame-cabinet';
  stage.before(cabinet);
  cabinet.append(stage);
  const hardware = document.createElement('div');
  hardware.className = 'tv-frame-hardware';
  hardware.innerHTML = `
    <svg class="tv-frame-grille" viewBox="0 0 130 200" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <g fill="currentColor">
        <rect x="8" y="15" width="114" height="14" rx="5"/>
        <rect x="9" y="42" width="114" height="14" rx="5"/>
        <rect x="10" y="69" width="114" height="14" rx="5"/>
        <rect x="11" y="96" width="114" height="14" rx="5"/>
        <rect x="12" y="123" width="114" height="14" rx="5"/>
        <rect x="13" y="150" width="114" height="14" rx="5"/>
        <rect x="14" y="177" width="114" height="14" rx="5"/>
      </g>
    </svg>`;
  cabinet.append(hardware);

  // Use the original functional buttons as the TV's hardware.
  let actions = television.querySelector('.game-actions');
  if (imu) {
    actions = document.createElement('div');
    actions.className = 'game-actions';
    actions.append(section.querySelector('[data-imu-reset]'));
  }
  hardware.append(actions);
  const pause = actions.querySelector('[data-game-pause], [data-dk-pause]');
  pause?.classList.add('tv-pause-control');
  const secondary = document.createElement('div');
  secondary.className = 'tv-secondary-controls';
  if (pause) secondary.append(pause);
  actions.prepend(secondary);
  const reset = actions.querySelector('[data-game-reset], [data-dk-reset], [data-imu-reset]');
  reset.classList.add('game-action-button', 'tv-reset-control');
  reset.insertAdjacentHTML('afterbegin', `<svg class="tv-frame-dial" viewBox="-65 -65 130 130" aria-hidden="true" focusable="false">
    <g fill="currentColor"><circle r="54"/>
      ${Array.from({ length: 16 }, (_, index) => `<rect x="-6" y="-60" width="12" height="12" transform="rotate(${index * 22.5})"/>`).join('')}
      <circle r="40" fill="#080808"/><circle r="30"/>
    </g></svg>`);
  const resetSymbol = reset.querySelector('span');
  resetSymbol.classList.add('reset-symbol');
  resetSymbol.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 8a8 8 0 1 1-1 7M5 3v5h5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const icons = {
    previous: 'M12 19V5m-6 6 6-6 6 6', next: 'M12 5v14m-6-6 6 6 6-6',
    'rotate-left': 'M5 8a8 8 0 1 1-1 7M5 3v5h5',
    'rotate-right': 'M19 8a8 8 0 1 0 1 7M19 3v5h-5',
    left: 'M19 12H5m6-6-6 6 6 6', right: 'M5 12h14m-6-6 6 6-6 6'
  };
  for (const button of television.querySelectorAll('[data-game-command], [data-dk-direction]')) {
    button.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${icons[button.dataset.gameCommand || button.dataset.dkDirection]}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  const feet = document.createElement('div');
  feet.className = 'tv-frame-feet';
  feet.setAttribute('aria-hidden', 'true');
  feet.innerHTML = '<svg viewBox="0 0 1000 115" preserveAspectRatio="none" focusable="false"><path fill="currentColor" d="M155 0h110L178 105q-7 12-32 8L130 111q-10-2-7-15ZM735 0h110l32 96q3 13-7 15l-16 2q-25 4-32-8Z"/></svg>';
  television.append(feet);
}());
