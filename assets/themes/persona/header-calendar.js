// Decorative P4-style calendar in the top-right corner, from the visitor's
// clock: concentric rings around a brightened disc, the date bar and time of
// day on their left, and a badge on the rings showing the sun by day and the
// moon by night. Weather would need a network service, so it is not shown.
(() => {
  const header = document.querySelector('.persona-design .site-header');
  if (!header || header.querySelector('.header-calendar')) return;
  const now = new Date();
  const hour = now.getHours();
  const weekday = now.getDay();
  const night = hour < 6 || hour >= 18;
  const time = hour < 5 ? 'Midnight' : hour < 8 ? 'Early Morning' : hour < 12 ? 'Morning'
    : hour < 17 ? 'Daytime' : hour < 21 ? 'Evening' : 'Late Night';
  const dayTone = weekday === 0 ? 'sunday' : weekday === 6 ? 'saturday' : 'weekday';
  const pad = value => String(value).padStart(2, '0');

  // Sun: ten tapered rays around a disc, inside a black field and yellow rim.
  const ray = 'M46 28.7H54L56.7 19.1H43.3Z';
  const sun = `<circle cx="50" cy="50" r="17.3"/>
    ${Array.from({ length: 10 }, (_, index) => `<path d="${ray}" transform="rotate(${index * 36} 50 50)"/>`).join('')}`;
  // Moon: a crescent and two small stars in the same frame.
  const moon = `<path d="M60 26A25 25 0 1 0 74 58 20 20 0 1 1 60 26Z"/>
    <path d="M67 30l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6Z"/>
    <circle cx="58" cy="46" r="2.4"/>`;

  header.insertAdjacentHTML('beforeend', `
    <div class="header-calendar" aria-hidden="true">
      <span class="header-calendar-bar">
        <span class="header-calendar-date">${pad(now.getMonth() + 1)}/${pad(now.getDate())}</span>
        <span class="header-calendar-day header-calendar-${dayTone}">${now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}</span>
      </span>
      <span class="header-calendar-time">${time}</span>
      <span class="header-calendar-ring"></span>
      <svg class="header-calendar-badge header-calendar-${night ? 'moon' : 'sun'}" viewBox="0 0 100 100" focusable="false">
        <circle class="header-calendar-rim" cx="50" cy="50" r="50"/>
        <circle class="header-calendar-field" cx="50" cy="50" r="40.7"/>
        <g class="header-calendar-glyph">${night ? moon : sun}</g>
      </svg>
    </div>`);
})();
