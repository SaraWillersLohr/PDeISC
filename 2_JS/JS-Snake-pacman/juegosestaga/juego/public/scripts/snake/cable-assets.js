// Comentarios claros: este archivo explica la lógica paso a paso.

/**
 * Configuración centralizada de cables para Cable Rush (Snake).
 * Una única fuente de verdad para sprites, colores y metadatos.
 */

// Versión de assets — cambiar este valor fuerza recarga de imágenes en el navegador
const ASSET_V = '?v=3';

const CABLES = {
  USB: {
    id: 'USB',
    name: 'Cable USB',
    desc: 'Conector\nUSB Type-A',
    color: '#00f0ff',
    glow: '#00f0ff',
    selColor: '#00f0ff',
    cabeza:  '/assets/characters/azul.png'          + ASSET_V,
    cola:    '/assets/characters/colaazul.jpeg'     + ASSET_V,
    preview: '/assets/characters/azul-completo.png' + ASSET_V
  },
  HDMI: {
    id: 'HDMI',
    name: 'Cable HDMI',
    desc: 'Conector\nHDMI',
    color: '#bf00ff',
    glow: '#bf00ff',
    selColor: '#bf00ff',
    cabeza:  '/assets/characters/violeta.png'          + ASSET_V,
    cola:    '/assets/characters/colavioleta.jpeg'     + ASSET_V,
    preview: '/assets/characters/violeta-completo.png' + ASSET_V
  },
  Ethernet: {
    id: 'Ethernet',
    name: 'Cable Ethernet',
    desc: 'Conector\nRJ-45',
    color: '#39ff14',
    glow: '#39ff14',
    selColor: '#39ff14',
    cabeza:  '/assets/characters/verde.png'          + ASSET_V,
    cola:    '/assets/characters/colaverde.jpeg'     + ASSET_V,
    preview: '/assets/characters/verde-completo.png' + ASSET_V
  }
};

const CABLE_LIST = Object.values(CABLES);

/** Formato lobby — una sola fuente de verdad */
// Función getLobbyCharacters() que ayuda a entender la lógica.
function getLobbyCharacters() {
  return CABLE_LIST.map((c) => ({
    id: c.id,
    name: c.name,
    desc: c.desc,
    color: c.color,
    selColor: c.selColor,
    img: c.preview.replace('/assets/characters/', '')
  }));
}

/** Obtiene la config de un cable por id; fallback USB */
// Función getCable(character) que ayuda a entender la lógica.
function getCable(character) {
  return CABLES[character] || CABLES.USB;
}

/** Rota un vector de dirección de grid a ángulo en radianes (sprite base apunta hacia arriba) */
// Función dirToAngle(dir) que ayuda a entender la lógica.
function dirToAngle(dir) {
  // switch: elige una rama según el valor y ejecuta la acción correcta.
switch (dir) {
    case 'UP':    return 0;
    case 'RIGHT': return Math.PI / 2;
    case 'DOWN':  return Math.PI;
    case 'LEFT':  return -Math.PI / 2;
    default:      return 0;
  }
}

/** Dirección entre dos celdas adyacentes */
// Función vecToDir(dx, que ayuda a entender la lógica.
function vecToDir(dx, dy) {
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (dx === 1)  return 'RIGHT';
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (dx === -1) return 'LEFT';
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (dy === 1)  return 'DOWN';
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (dy === -1) return 'UP';
  return null;
}

/** Cable rival para modo local 2P */
// Función getRivalCable(character) que ayuda a entender la lógica.
function getRivalCable(character) {
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (character === 'USB') return 'HDMI';
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (character === 'HDMI') return 'Ethernet';
  return 'USB';
}

window.CABLES = CABLES;
window.CABLE_LIST = CABLE_LIST;
window.getCable = getCable;
window.dirToAngle = dirToAngle;
window.vecToDir = vecToDir;
window.getRivalCable = getRivalCable;
window.getLobbyCharacters = getLobbyCharacters;