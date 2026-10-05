// Reference-style sticker lettering, drawn as vectors so it is identical on
// every device without a font download. The link supplies the accessible name.
const playLettering = 'M18 70V32H35C46 32 52 38 52 47S46 62 35 62H29V70Z M29 41V53H34C39 53 41 51 41 47S39 41 34 41Z M56 32H66V70H56Z M96 45V70H86V67C83 71 78 72 73 69C62 63 68 43 80 44C83 44 85 45 86 47V45Z M86 56C86 50 77 50 77 57C77 64 86 64 86 58Z M99 45H110L115 61L120 45H131L120 76C118 83 114 87 104 84V75C109 77 112 75 112 72Z';

// Attribute values are already escaped by the source template.
export function playBadge(url, label) {
  return `<a class="project-playable-badge" href="${url}" aria-label="${label}">
    <svg class="project-play-sticker" viewBox="0 0 150 120" aria-hidden="true" focusable="false">
      <path class="project-play-bubble" d="M120 59C120 82 102 101 79 101C68 101 58 97 51 91L30 101L37 79C30 68 30 55 35 43C42 25 59 16 79 17C102 17 120 36 120 59Z"/>
      <g transform="rotate(12 75 60) translate(0 8)" fill-rule="evenodd" stroke-linejoin="round">
        <path class="project-play-letter-outline" d="${playLettering}"/>
        <path class="project-play-lettering" d="${playLettering}"/>
      </g>
    </svg>
  </a>`;
}
