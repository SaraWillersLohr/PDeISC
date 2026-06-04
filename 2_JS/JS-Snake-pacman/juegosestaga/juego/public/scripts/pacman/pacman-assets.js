/** Rutas de assets Escape Escolar — carpeta img-pacman */
const PACMAN_ASSETS = {
  saraLeft: '/assets/img-pacman/sarapix-paralaizq.png',
  saraRight: '/assets/img-pacman/sarapix-paraladerecha.png',
  maleLeft: '/assets/img-pacman/malepix - para la izquierd.png',
  maleRight: '/assets/img-pacman/malepix-paraladerecha.png',
  saraCelebrateLeft: '/assets/img-pacman/festejo - sara izq.png',
  saraCelebrateRight: '/assets/img-pacman/festejo - sara der.png',
  maleCelebrateLeft: '/assets/img-pacman/festejo - male - izq.png',
  maleCelebrateRight: '/assets/img-pacman/festejo - male der.png',
  esteban: '/assets/img-pacman/esteban.png',
  lorena: '/assets/img-pacman/lorena.png',
  scaglione: '/assets/img-pacman/scaglione.png',
  estebanWeak: '/assets/img-pacman/esteban - debil.png',
  lorenaWeak: '/assets/img-pacman/lorena - debil.png',
  scaglioneWeak: '/assets/img-pacman/scaglione - debil.png',
  guardapolvo: '/assets/img-pacman/guarda.png',
  cuaderno: '/assets/img-pacman/cuaderno.png',
  computadora: '/assets/img-pacman/compu.png',
  mapa1: '/assets/img-pacman/mapa1.png',
  mapa2: '/assets/img-pacman/mapa2.png',
  mapa3: '/assets/img-pacman/mapa3.png',
  mapa4: '/assets/img-pacman/mapa4.png',
  mapa5: '/assets/img-pacman/mapa5.png',
  mapa6: '/assets/img-pacman/mapa6.png'
};

const GHOST_PROFILES = {
  Esteban: { behavior: 'HUNTER', label: 'Cazador', color: '#f97316', desc: 'Persigue sin descanso' },
  Lorena: { behavior: 'INTERCEPT', label: 'Emboscador', color: '#ff007f', desc: 'Anticipa tu ruta' },
  Scaglione: { behavior: 'PATROL', label: 'Patrulla', color: '#a855f7', desc: 'Protege zonas clave' }
};

if (typeof window !== 'undefined') {
  window.PACMAN_ASSETS = PACMAN_ASSETS;
  window.GHOST_PROFILES = GHOST_PROFILES;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PACMAN_ASSETS, GHOST_PROFILES };
}
