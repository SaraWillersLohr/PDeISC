const fs = require('fs');
const path = require('path');

const LEADERBOARD_PATH = path.join(__dirname, '../../data/leaderboard.json');

// Lee las puntuaciones desde el archivo JSON
function readLeaderboard() {
  try {
    if (!fs.existsSync(LEADERBOARD_PATH)) {
      const initial = { pacman: [], snake: [] };
      fs.writeFileSync(LEADERBOARD_PATH, JSON.stringify(initial, null, 2));
      return initial;
    }
    const data = fs.readFileSync(LEADERBOARD_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error leyendo leaderboard:', error);
    return { pacman: [], snake: [] };
  }
}

// Guarda las puntuaciones en el archivo JSON
function writeLeaderboard(data) {
  try {
    fs.writeFileSync(LEADERBOARD_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error escribiendo leaderboard:', error);
    return false;
  }
}

// Obtiene el TOP 10 de un juego específico
function getTop10(game) {
  const data = readLeaderboard();
  const list = data[game] || [];
  
  // Ordena por puntaje de forma descendente
  return list
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

// Agrega una nueva puntuación con validación en el Backend
function addScore(game, entry) {
  if (game !== 'pacman' && game !== 'snake') {
    return { success: false, error: 'Juego inválido' };
  }

  const { name, score, character, duration, victories } = entry;

  // Validación 3: Backend
  // Validamos que el nombre tenga entre 3 y 10 caracteres
  if (!name || typeof name !== 'string' || name.trim().length < 3 || name.trim().length > 10) {
    return { success: false, error: 'El nombre debe tener entre 3 y 10 caracteres.' };
  }

  // Validamos score válido
  if (typeof score !== 'number' || score < 0) {
    return { success: false, error: 'Puntaje inválido.' };
  }

  // Validamos personaje correcto
  if (game === 'pacman' && character !== 'Sara' && character !== 'Male') {
    return { success: false, error: 'Personaje de PacMan inválido.' };
  }
  if (game === 'snake' && character !== 'USB' && character !== 'HDMI' && character !== 'Ethernet') {
    return { success: false, error: 'Tipo de cable de Snake inválido.' };
  }

  // Validamos duración y victorias
  if (typeof duration !== 'number' || duration < 0) {
    return { success: false, error: 'Duración inválida.' };
  }
  if (typeof victories !== 'number' || victories < 0) {
    return { success: false, error: 'Victorias inválidas.' };
  }

  const cleanName = name.trim();
  const data = readLeaderboard();
  
  const newEntry = {
    name: cleanName,
    score: Math.floor(score),
    character,
    date: new Date().toLocaleDateString('es-AR'),
    duration: Math.floor(duration),
    victories: Math.floor(victories)
  };

  data[game].push(newEntry);
  
  // Ordenar y guardar todo (no solo 10, para persistir historial completo, pero al obtener retornamos 10)
  // O podemos recortarlo si queremos. Vamos a guardar el historial completo ordenado.
  data[game] = data[game]
    .sort((a, b) => b.score - a.score);
    
  writeLeaderboard(data);
  return { success: true, entry: newEntry };
}

module.exports = {
  getTop10,
  addScore
};
