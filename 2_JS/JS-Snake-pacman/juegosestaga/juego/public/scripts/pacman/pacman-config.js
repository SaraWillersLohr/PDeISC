/** Constantes compartidas Escape Escolar (Pac-Man) */
const LEVEL_ITEM_QUEUE = {
  1: ['Guardapolvo'],
  2: ['Guardapolvo', 'Cuaderno'],
  3: ['Guardapolvo', 'Cuaderno', 'Computadora'],
  4: ['Guardapolvo', 'Cuaderno', 'Computadora'],
  5: ['Guardapolvo', 'Cuaderno', 'Computadora'],
  6: ['Guardapolvo', 'Cuaderno', 'Computadora']
};

const MAX_PACMAN_LEVEL = 6;

const PACMAN_GHOST_NAMES = ['Lorena', 'Scaglione', 'Esteban'];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LEVEL_ITEM_QUEUE, MAX_PACMAN_LEVEL, PACMAN_GHOST_NAMES };
}

if (typeof window !== 'undefined') {
  window.LEVEL_ITEM_QUEUE = LEVEL_ITEM_QUEUE;
  window.MAX_PACMAN_LEVEL = MAX_PACMAN_LEVEL;
  window.PACMAN_GHOST_NAMES = PACMAN_GHOST_NAMES;
}
