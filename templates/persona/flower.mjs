// Shared base proportions: six teardrops, 60° apart, with an 18-unit inset.
// Reuse this geometry for new flowers rather than scaling petals independently.
export const flowerPetals = [0, 60, 120, 180, 240, 300].map(angle =>
  `<path transform="rotate(${angle} 160 160) translate(0 18)" d="M160 160 C149 123 112 57 122 31 C130 8 163 7 175 26 C192 53 168 123 160 160Z"/>`).join('');
