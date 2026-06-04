const rooms = {};

// Genera un código de sala aleatorio de 4 letras mayúsculas
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  do {
    code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (rooms[code]); // Asegura que sea único
  return code;
}

// Crea una nueva sala
function createRoom(game) {
  if (game !== 'pacman' && game !== 'snake') {
    return null;
  }
  const code = generateRoomCode();
  rooms[code] = {
    code,
    game,
    players: [],
    gameState: null,
    gameInterval: null,
    gameInstance: null,
    status: 'waiting' // 'waiting', 'ready', 'playing'
  };
  return rooms[code];
}

// Une un jugador a la sala
function joinRoom(code, socketId, name, character) {
  const room = rooms[code];
  if (!room) {
    return { success: false, error: 'La sala no existe.' };
  }
  if (room.players.length >= 2) {
    return { success: false, error: 'La sala está completa (máximo 2 jugadores).' };
  }
  
  // Validaciones del personaje
  if (room.game === 'pacman' && character !== 'Sara' && character !== 'Male') {
    return { success: false, error: 'Personaje incorrecto para Escape Escolar (debe ser Sara o Male).' };
  }
  if (room.game === 'snake' && character !== 'USB' && character !== 'HDMI' && character !== 'Ethernet') {
    return { success: false, error: 'Cable incorrecto para Cable Rush (debe ser USB, HDMI o Ethernet).' };
  }

  const cableTaken = room.players.some((p) => p.character === character);
  if (room.game === 'snake' && cableTaken) {
    return { success: false, error: 'Ese cable ya está en uso en la sala. Elegí otro.' };
  }

  // Evitar nombres repetidos en la sala
  const nameExists = room.players.some(p => p.name.toLowerCase() === name.toLowerCase());
  if (nameExists) {
    return { success: false, error: 'Ya hay un jugador con ese nombre en la sala.' };
  }

  // Asignar el playerIndex (0 o 1)
  const playerIndex = room.players.length;

  const player = {
    socketId,
    name,
    character,
    ready: false,
    playerIndex,
    connected: true
  };

  room.players.push(player);
  return { success: true, room, player };
}

// Reconectar jugador en partida activa (tras navegar a la página del juego)
function rejoinRoom(code, socketId, name) {
  const room = rooms[code];
  if (!room) {
    return { success: false, error: 'La sala no existe.' };
  }
  if (room.status !== 'playing') {
    return { success: false, error: 'La partida aún no ha comenzado.' };
  }

  const player = room.players.find(
    (p) => p.name.toLowerCase() === name.trim().toLowerCase()
  );
  if (!player) {
    return { success: false, error: 'No estás registrado en esta partida.' };
  }

  player.socketId = socketId;
  player.connected = true;

  if (room.gameInstance) {
    const gp = room.gameInstance.players.find(
      (p) => p.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (gp) gp.socketId = socketId;
  }

  return { success: true, room, player };
}

function allPlayersConnected(room) {
  return room.players.length > 0 && room.players.every((p) => p.connected);
}

// Marca un jugador como listo
function setPlayerReady(code, socketId) {
  const room = rooms[code];
  if (!room) return false;

  const player = room.players.find(p => p.socketId === socketId);
  if (player) {
    player.ready = true;
  }

  // Si hay exactamente 2 jugadores y ambos están ready
  const allReady = room.players.length === 2 && room.players.every(p => p.ready);
  if (allReady) {
    room.status = 'playing';
    return true; // Comenzar partida
  }
  return false;
}

// Maneja la desconexión de un jugador y retorna la sala afectada si existe
function removePlayer(socketId) {
  for (const code in rooms) {
    const room = rooms[code];
    const index = room.players.findIndex(p => p.socketId === socketId);
    if (index !== -1) {
      const removedPlayer = room.players[index];

      // Partida en curso: pausar sin destruir sala (permite rejoin al cargar snake.html)
      if (room.status === 'playing') {
        removedPlayer.connected = false;
        if (room.gameInterval) {
          clearTimeout(room.gameInterval);
          room.gameInterval = null;
        }
        return {
          code,
          room,
          destroyed: false,
          disconnectedPlayerName: removedPlayer.name,
          paused: true
        };
      }

      room.players.splice(index, 1);

      if (room.gameInterval) {
        clearTimeout(room.gameInterval);
        room.gameInterval = null;
      }

      if (room.players.length > 0) {
        room.players[0].playerIndex = 0;
        room.players[0].ready = false;
        room.status = 'waiting';
        return { code, room, destroyed: false, disconnectedPlayerName: removedPlayer.name };
      }

      delete rooms[code];
      return { code, room: null, destroyed: true, disconnectedPlayerName: removedPlayer.name };
    }
  }
  return null;
}

function getRoom(code) {
  return rooms[code] || null;
}

function deleteRoom(code) {
  const room = rooms[code];
  if (room) {
    if (room.gameInterval) {
      clearTimeout(room.gameInterval);
    }
    delete rooms[code];
  }
}

module.exports = {
  createRoom,
  joinRoom,
  rejoinRoom,
  allPlayersConnected,
  setPlayerReady,
  removePlayer,
  getRoom,
  deleteRoom
};
